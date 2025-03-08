import mongoose from "mongoose";
import {
  createSaleRecord,
  handleSaleStockUpdates,
  processSaleItems,
  updateSalesNumber,
  updateTallyData,
  checkForNumberExistence,
  revertSaleStockUpdates,
  savePaymentSplittingDataInSources,
  revertPaymentSplittingDataInSources,
  updateOutstandingBalance,
  saveSettlementData,
  revertSettlementData,
  changeConversionStatusOfOrder,
  reverseConversionStatusOfOrder,
} from "../helpers/salesHelper.js";
import secondaryUserModel from "../models/secondaryUserModel.js";
import salesModel from "../models/salesModel.js";
import vanSaleModel from "../models/vanSaleModel.js";
import TallyData from "../models/TallyData.js";
import { formatToLocalDate } from "../helpers/helper.js";

/**
 * @desc To createSale
 * @route POST /api/sUsers/createSale
 * @access Public
 */

export const createSale = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    const {
      orgId,
      items,
      additionalChargesFromRedux,
      salesNumber,
      party,
      lastAmount,
      paymentSplittingData,
      selectedDate,
      convertedFrom = [],
    } = req.body;

    const Secondary_user_id = req.sUserId;

    const NumberExistence = await checkForNumberExistence(
      req.query.vanSale === "true" ? vanSaleModel : salesModel,
      "salesNumber",
      salesNumber,
      req.body.orgId,
      session
    );

    if (NumberExistence) {
      await session.abortTransaction();
      session.endSession();
      return res.status(400).json({
        message: "Sales with the same number already exists",
      });
    }

    const secondaryUser = await secondaryUserModel
      .findById(Secondary_user_id)
      .session(session);
    const secondaryMobile = secondaryUser?.mobile;

    if (!secondaryUser) {
      await session.abortTransaction();
      session.endSession();
      return res
        .status(404)
        .json({ success: false, message: "Secondary user not found" });
    }

    const configuration = secondaryUser.configurations.find(
      (config) => config.organization.toString() === orgId
    );

    const updatedSalesNumber = await updateSalesNumber(
      orgId,
      req.query.vanSale,
      secondaryUser,
      configuration,
      session
    );

    const updatedItems = processSaleItems(items);
    await handleSaleStockUpdates(updatedItems, session); // Include session

    const updateAdditionalCharge = additionalChargesFromRedux.map((charge) => {
      const { value, taxPercentage } = charge;
      const taxAmt = parseFloat(
        ((parseFloat(value) * parseFloat(taxPercentage)) / 100).toFixed(2)
      );
      return { ...charge, taxAmt };
    });

    const result = await createSaleRecord(
      req,
      salesNumber,
      updatedItems,
      updateAdditionalCharge,
      session // Pass session
    );

    /// add conversion status in sale order if the sale is converted from order
    if(convertedFrom.length > 0) await changeConversionStatusOfOrder(convertedFrom, session);

    let valueToUpdateInTally = 0;

    if (paymentSplittingData && Object.keys(paymentSplittingData).length > 0) {
      valueToUpdateInTally = paymentSplittingData?.balanceAmount;
    } else {
      valueToUpdateInTally = lastAmount;
    }

    ///save settlement data
    await saveSettlementData(
      party,
      orgId,
      req.query.vanSale === "true" ? "normal van sale" : "normal sale",

      req.query.vanSale === "true" ? "vanSale" : "sale",
      salesNumber,
      result._id,
      valueToUpdateInTally,
      result?.date,
      result?.party?.partyName,
      session
    );

    if (
      party.accountGroup === "Sundry Debtors" ||
      party.accountGroup === "Sundry Creditors"
    ) {
      const Primary_user_id = req.owner;

      await updateTallyData(
        orgId,
        salesNumber,
        result._id,
        Primary_user_id,
        party,
        lastAmount,
        secondaryMobile,
        session,
        valueToUpdateInTally,
        "sale"
      );
    }

    ////save payment splitting data in bank or cash model also

    if (paymentSplittingData && Object.keys(paymentSplittingData).length > 0) {
      await savePaymentSplittingDataInSources(
        paymentSplittingData,
        salesNumber,
        result._id,
        orgId,
        req.owner,
        secondaryMobile,
        "sale",
        result?.date,
        result?.party?.partyName,
        session
      );
    }

    await session.commitTransaction();
    res.status(201).json({
      success: true,
      data: result,
      message: "Sale created successfully",
    });
  } catch (error) {
    console.error("Error in createSale:", error);
    await session.abortTransaction();
    res.status(500).json({
      success: false,
      message: "An error occurred while creating the sale.",
      error: error.message,
    });
  } finally {
    session.endSession(); // Ensure session is ended
  }
};

/**
 * @desc To editSale
 * @route POST /api/sUsers/editSale
 * @access Public
 */

const MAX_RETRIES = 5;
const RETRY_DELAY_MS = 1000;

export const editSale = async (req, res) => {
  const saleId = req.params.id;
  const {
    selectedGodownId,
    selectedGodownName,
    orgId,
    party,
    items,
    despatchDetails,
    priceLevelFromRedux,
    additionalChargesFromRedux,
    lastAmount,
    salesNumber,
    selectedDate,
    paymentSplittingData = {},
  } = req.body;

  const isVanSale = req.query.vanSale === "true";
  const model = isVanSale ? vanSaleModel : salesModel;

  let retries = 0;

  while (retries < MAX_RETRIES) {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      const existingSale = await model.findById(saleId).session(session);
      if (!existingSale) {
        await session.abortTransaction();
        return res
          .status(404)
          .json({ success: false, message: "Sale not found" });
      }

      const secondaryUser = await secondaryUserModel
        .findById(req.sUserId)
        .session(session);
      const secondaryMobile = secondaryUser?.mobile;

      await revertSaleStockUpdates(existingSale.items, session);

      const updatedItems = processSaleItems(
        items,
        priceLevelFromRedux,
        additionalChargesFromRedux
      );
      await handleSaleStockUpdates(updatedItems, session);

      const updateData = {
        selectedGodownId: selectedGodownId || existingSale.selectedGodownId,
        selectedGodownName: selectedGodownName
          ? selectedGodownName[0]
          : existingSale.selectedGodownName,
        serialNumber: existingSale.serialNumber,
        cmp_id: orgId,
        partyAccount: party?.partyName,
        party,
        despatchDetails,
        items: updatedItems,
        priceLevel: priceLevelFromRedux,
        additionalCharges: additionalChargesFromRedux,
        finalAmount: lastAmount,
        Primary_user_id: req.owner,
        Secondary_user_id: req.secondaryUserId,
        salesNumber: salesNumber,
        date: await formatToLocalDate(selectedDate, orgId, session),
        createdAt: existingSale.createdAt,
        paymentSplittingData,
      };

      await model.findByIdAndUpdate(saleId, updateData, { new: true, session });

      //// update the settlement data ,so delete and recreate the settlement data

      /// revert it
      await revertSettlementData(
        existingSale?.party,
        orgId,
        existingSale?.salesNumber,
        existingSale?._id.toString(),
        session
      );

      /// recreate the settlement data

      let valueToUpdateInTally = 0;

      if (
        paymentSplittingData &&
        Object.keys(paymentSplittingData).length > 0
      ) {
        valueToUpdateInTally = paymentSplittingData?.balanceAmount;
      } else {
        valueToUpdateInTally = lastAmount;
      }

      ///save settlement data
      await saveSettlementData(
        party,
        orgId,
        "normal sale",
        "sale",
        updateData?.salesNumber,
        saleId,
        valueToUpdateInTally,
        updateData?.date,
        updateData?.party?.partyName,
        session
      );

      // ///updating the existing outstanding record by calculating the difference in bill value

      const outstandingResult = await updateOutstandingBalance({
        existingVoucher: existingSale,
        newVoucherData: {
          paymentSplittingData,
          lastAmount,
        },
        orgId,
        voucherNumber: salesNumber,
        party,
        session,
        createdBy: req.owner,
        transactionType: "sale",
        secondaryMobile,
      });

      //// updating the payment splitting data
      ///first reverting the existing payment splitting data if it exists

      if (existingSale?.paymentSplittingData?.splittingData) {
        await revertPaymentSplittingDataInSources(
          existingSale?.paymentSplittingData,
          salesNumber,
          saleId,
          orgId,
          session
        );
      }

      //// recreating new the payment splitting data

      if (paymentSplittingData?.splittingData?.length > 0) {
        const creditItem = paymentSplittingData.splittingData.find(
          (item) => item.mode === "credit"
        );
        if (creditItem) {
          // console.log("creditItem", creditItem);

          const oldCreditAmount =
            existingSale.paymentSplittingData?.splittingData?.find(
              (item) => item.mode === "credit"
            )?.amount || 0;
          const newCreditAmount = creditItem.amount;
          const diffCreditAmount =
            Number(newCreditAmount) - Number(oldCreditAmount);

          const matchedOutStandingOfCredit = await TallyData.findOne({
            cmp_id: orgId,
            bill_no: salesNumber,
            billId: existingSale?._id.toString(),
            createdBy: "paymentSplitting",
          }).session(session);

          if (matchedOutStandingOfCredit) {
            const newOutstanding =
              Number(matchedOutStandingOfCredit.bill_pending_amt || 0) +
              diffCreditAmount;

            paymentSplittingData.splittingData =
              paymentSplittingData.splittingData.map((item) =>
                item.mode === "credit"
                  ? { ...item, amount: newOutstanding }
                  : item
              );

            await savePaymentSplittingDataInSources(
              paymentSplittingData,
              salesNumber,
              saleId,
              orgId,
              req.owner,
              secondaryMobile,
              "sale",
              updateData?.date,
              updateData?.party?.partyName,

              session
            );
          } else {
            await savePaymentSplittingDataInSources(
              paymentSplittingData,
              salesNumber,
              saleId,
              orgId,
              req.owner,
              secondaryMobile,
              "sale",
              updateData?.date,
              updateData?.party?.partyName,

              session
            );
          }
        } else {
          await savePaymentSplittingDataInSources(
            paymentSplittingData,
            salesNumber,
            saleId,
            orgId,
            req.owner,
            secondaryMobile,
            "sale",
            updateData?.date,
            updateData?.party?.partyName,

            session
          );
        }
      }

      await session.commitTransaction();
      return res
        .status(200)
        .json({ success: true, message: "Sale edited successfully" });
    } catch (error) {
      await session.abortTransaction();
      console.error("Error editing sale:", error);

      if (error.code === 112 && retries < MAX_RETRIES - 1) {
        retries++;
        await new Promise((resolve) => setTimeout(resolve, RETRY_DELAY_MS));
        console.log(`Retrying transaction (attempt ${retries})...`);
      } else {
        return res.status(500).json({
          success: false,
          message: "An error occurred while editing the sale.",
          error: error.message,
        });
      }
    } finally {
      session.endSession();
    }
  }

  return res.status(500).json({
    success: false,
    message: "Failed to edit sale after multiple attempts.",
  });
};

/**
 * @desc To cancel sale
 * @route POST /api/sUsers/cancelSale
 * @access Public
 */

export const cancelSale = async (req, res) => {
  const saleId = req.params.id; // ID of the sale to cancel
  const vanSaleQuery = req.query.vanSale;

  const session = await mongoose.startSession(); // Start the session

  try {
    session.startTransaction(); // Begin a transaction

    // Find the sale to cancel
    const sale = await (vanSaleQuery === "true" ? vanSaleModel : salesModel)
      .findById(saleId)
      .session(session); // Use the session in the query

    if (!sale) {
      await session.abortTransaction(); // Rollback transaction if sale not found
      session.endSession(); // End the session
      return res
        .status(404)
        .json({ success: false, message: "Sale not found" });
    }

    // Revert stock updates
    await revertSaleStockUpdates(sale.items, session); // Ensure stock updates use session



    // Update sale status
    sale.isCancelled = true;
    await (vanSaleQuery === "true"
      ? vanSaleModel
      : salesModel
    ).findByIdAndUpdate(saleId, sale, { session }); // Use the session in the update

    /// cancel outstanding

    const cancelOutstanding = await TallyData.findOneAndUpdate(
      {
        bill_no: sale?.salesNumber,
        billId: saleId.toString(),
      },
      {
        $set: {
          isCancelled: true,
        },
      }
    ).session(session);

    //// revert settlement data
    /// revert it
    await revertSettlementData(
      sale?.party,
      sale?.cmp_id,
      sale?.salesNumber,
      sale?._id.toString(),
      session
    );


    /// if sale is created from order conversion then revert it

    if(sale?.convertedFrom?.length > 0){
      await reverseConversionStatusOfOrder(sale?.convertedFrom, session);
    }

    //// revert payment splitting data in sources

    if (sale?.paymentSplittingData?.splittingData) {
      await revertPaymentSplittingDataInSources(
        sale?.paymentSplittingData || {},
        sale?.salesNumber,
        sale?._id.toString(),
        sale?.cmp_id,
        session
      );
    }

    // Commit the transaction
    await session.commitTransaction();
    session.endSession(); // End the session

    res.status(200).json({
      success: true,
      message: "Sale canceled and stock reverted successfully",
    });
  } catch (error) {
    // Rollback the transaction if something goes wrong
    await session.abortTransaction();
    session.endSession(); // End the session
    console.error("Error in canceling sale:", error);
    res.status(500).json({
      success: false,
      message: "An error occurred while canceling the sale.",
      error: error.message,
    });
  }
};
