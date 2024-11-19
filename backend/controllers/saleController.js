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
} from "../helpers/salesHelper.js";
import secondaryUserModel from "../models/secondaryUserModel.js";
import salesModel from "../models/salesModel.js";
import vanSaleModel from "../models/vanSaleModel.js";
import TallyData from "../models/TallyData.js";

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
    await handleSaleStockUpdates(updatedItems, false, session); // Include session

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

    let valueToUpdateInTally = 0;

    if (paymentSplittingData && Object.keys(paymentSplittingData).length > 0) {
      valueToUpdateInTally = paymentSplittingData?.balanceAmount;
    } else {
      valueToUpdateInTally = lastAmount;
    }

    // console.log(valueToUpdateInTally, "valueToUpdateInTally");
    await updateTallyData(
      orgId,
      salesNumber,
      result._id,
      req.owner,
      party,
      lastAmount,
      secondaryMobile,
      session,
      valueToUpdateInTally,
      "sale"
    );

    ////save payment splitting data in bank or cash model also

    if (paymentSplittingData && Object.keys(paymentSplittingData).length > 0) {
      await savePaymentSplittingDataInSources(
        paymentSplittingData,
        salesNumber,
        result._id,
        orgId,
        req.owner,
        secondaryMobile,
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
      await handleSaleStockUpdates(updatedItems, false, session);

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
        createdAt: new Date(selectedDate),
        paymentSplittingData,
      };

      await model.findByIdAndUpdate(saleId, updateData, { new: true, session });

      ///updating the existing outstanding record by calculating the difference in bill value

      ///considering the bill balance if payment is splitted

      let oldBillBalance;
      if (
        existingSale?.paymentSplittingData &&
        Object.keys(existingSale?.paymentSplittingData).length > 0
      ) {
        oldBillBalanexistingSalece =
          existingSale?.paymentSplittingData?.balanceAmount;
      } else {
        oldBillBalance = existingSale?.finalAmount || 0;
      }
      let newBillBalance;

      if (
        paymentSplittingData &&
        Object.keys(paymentSplittingData).length > 0
      ) {
        newBillBalance = paymentSplittingData?.balanceAmount;
      } else {
        newBillBalance = lastAmount;
      }

      ///finding the difference in bill value
      const diffBillValue = Number(newBillBalance) - Number(oldBillBalance);
      // console.log("oldBillBalance", oldBillBalance);
      // console.log("newBillBalance", newBillBalance);
      // console.log("diffBillValue", diffBillValue);

      const matchedOutStanding = await TallyData.findOne({
        party_id: party?.party_master_id,
        cmp_id: orgId,
        bill_no: salesNumber,
        billId: existingSale?._id.toString(),
      }).session(session);

      // console.log("matchedOutStanding", matchedOutStanding);

      ///updating the existing outstanding record

      if (matchedOutStanding) {
        const newOutstanding =
          Number(matchedOutStanding?.bill_pending_amt || 0) + diffBillValue;

        // console.log("newOutstanding", newOutstanding);

        await TallyData.updateOne(
          {
            party_id: party?.party_master_id,
            cmp_id: orgId,
            bill_no: salesNumber,
            billId: existingSale?._id.toString(),
          },
          {
            $set: {
              bill_pending_amt: newOutstanding || 0,
              bill_amount: lastAmount,
            },
          },
          { session }
        );
      }

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
