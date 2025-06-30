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
import {
  generateVoucherNumber,
  getSeriesDetailsById,
} from "../helpers/voucherHelper.js";

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
      series_id,
      party,
      finalAmount: lastAmount,
      paymentSplittingData,
      selectedDate,
      voucherType,
      convertedFrom = [],
    } = req.body;

    const Secondary_user_id = req.sUserId;

    /// generate voucher number(sales number)
    const { voucherNumber: salesNumber, usedSeriesNumber } =
      await generateVoucherNumber(orgId, voucherType, series_id, session);
    if (salesNumber) {
      req.body.salesNumber = salesNumber;
    }
    if (usedSeriesNumber) {
      req.body.usedSeriesNumber = usedSeriesNumber;
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

    // const updatedItems = processSaleItems(items);
    await handleSaleStockUpdates(items, session); // Include session

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
      items,
      updateAdditionalCharge,
      session // Pass session
    );

    /// add conversion status in sale order if the sale is converted from order
    if (convertedFrom.length > 0)
      await changeConversionStatusOfOrder(convertedFrom, session);

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
      selectedDate,
      voucherType,
      "Dr"
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
    orgId,
    party,
    items,
    despatchDetails,
    priceLevelFromRedux,
    additionalChargesFromRedux,
    finalAmount: lastAmount,

    selectedDate,
    paymentSplittingData = {},
  } = req.body;

  let { salesNumber, series_id, usedSeriesNumber } = req.body;

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

      if (existingSale?.series_id?.toString() !== series_id?.toString()) {
        const { voucherNumber, usedSeriesNumber: newUsedSeriesNumber } =
          await generateVoucherNumber(
            orgId,
            existingSale.voucherType,
            series_id,
            session
          );



        salesNumber = voucherNumber; // Always update when series changes
        usedSeriesNumber = newUsedSeriesNumber; // Always update when series changes
      }else{
        salesNumber = existingSale.salesNumber
        usedSeriesNumber = existingSale.usedSeriesNumber
      }
      await revertSaleStockUpdates(existingSale.items, session);
      await handleSaleStockUpdates(items, session);


      const updateData = {
        _id: existingSale._id,
        serialNumber: existingSale.serialNumber,
        cmp_id: orgId,
        partyAccount: party?.partyName,
        party,
        despatchDetails,
        items,
        priceLevel: priceLevelFromRedux,
        additionalCharges: additionalChargesFromRedux,
        finalAmount: lastAmount,
        Primary_user_id: req.owner,
        Secondary_user_id: req.secondaryUserId,
        salesNumber,
        series_id,
        usedSeriesNumber,
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
        selectedDate,
        classification: "Dr",
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

      // recreating new the payment splitting data

      // / need to do /// commenting for now

      // if (paymentSplittingData?.splittingData?.length > 0) {
      //   const creditItem = paymentSplittingData.splittingData.find(
      //     (item) => item.mode === "credit"
      //   );
      //   if (creditItem) {
      //     // console.log("creditItem", creditItem);

      //     const oldCreditAmount =
      //       existingSale.paymentSplittingData?.splittingData?.find(
      //         (item) => item.mode === "credit"
      //       )?.amount || 0;
      //     const newCreditAmount = creditItem.amount;
      //     const diffCreditAmount =
      //       Number(newCreditAmount) - Number(oldCreditAmount);

      //     const matchedOutStandingOfCredit = await TallyData.findOne({
      //       cmp_id: orgId,
      //       bill_no: salesNumber,
      //       billId: existingSale?._id.toString(),
      //       createdBy: "paymentSplitting",
      //     }).session(session);

      //     if (matchedOutStandingOfCredit) {
      //       const newOutstanding =
      //         Number(matchedOutStandingOfCredit.bill_pending_amt || 0) +
      //         diffCreditAmount;

      //       paymentSplittingData.splittingData =
      //         paymentSplittingData.splittingData.map((item) =>
      //           item.mode === "credit"
      //             ? { ...item, amount: newOutstanding }
      //             : item
      //         );

      //       await savePaymentSplittingDataInSources(
      //         paymentSplittingData,
      //         salesNumber,
      //         saleId,
      //         orgId,
      //         req.owner,
      //         secondaryMobile,
      //         "sale",
      //         updateData?.date,
      //         updateData?.party?.partyName,

      //         session
      //       );
      //     } else {
      //       await savePaymentSplittingDataInSources(
      //         paymentSplittingData,
      //         salesNumber,
      //         saleId,
      //         orgId,
      //         req.owner,
      //         secondaryMobile,
      //         "sale",
      //         updateData?.date,
      //         updateData?.party?.partyName,

      //         session
      //       );
      //     }
      //   } else {
      //     await savePaymentSplittingDataInSources(
      //       paymentSplittingData,
      //       salesNumber,
      //       saleId,
      //       orgId,
      //       req.owner,
      //       secondaryMobile,
      //       "sale",
      //       updateData?.date,
      //       updateData?.party?.partyName,

      //       session
      //     );
      //   }
      // }

      await session.commitTransaction();
      return res.status(200).json({
        success: true,
        message: "Sale edited successfully",
        data: updateData,
      });
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

    if (sale?.convertedFrom?.length > 0) {
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

// @desc toget the details of transaction or sale
// route get/api/sUsers/getSalesDetails

export const getSalesDetails = async (req, res) => {
  const saleId = req.params.id;
  const vanSaleQuery = req.query.vanSale;

  const isVanSale = vanSaleQuery === "true";
  const model = isVanSale ? vanSaleModel : salesModel;

  try {
    // First, get the sale details with populated references
    let saleDetails = await model
      .findById(saleId)
      .populate({
        path: "party._id",
        select: "partyName", // get only the name or other fields as needed
      })
      .populate({
        path: "items.GodownList.warrantyCard",
        select: "warrantyYears warrantyMonths displayInput termsAndConditions customerCareInfo customerCareNo", // populate item details
      })
      .populate({
        path: "items._id",
        select: "product_name", // populate item details
      })
      .populate({
        path: "items.GodownList.godownMongoDbId",
        select: "godown", // populate godown name
      })
      .lean();

    const seriesDetails = await getSeriesDetailsById(
      saleDetails?.series_id,
      saleDetails?.cmp_id,
      saleDetails?.voucherType
    );

    seriesDetails.currentNumber = saleDetails?.usedSeriesNumber;

    if (seriesDetails) {
      saleDetails.seriesDetails = seriesDetails;
    }

    if (!saleDetails) {
      return res.status(404).json({ error: "Sale not found" });
    }

    // Update the party name if it exists and restore original ID structure
    if (saleDetails.party?._id?.partyName) {
      // Update the party name with the latest value
      saleDetails.partyAccount = saleDetails.party._id.partyName;
      saleDetails.party.partyName = saleDetails.party._id.partyName;

      // Restore ID to original format
      const partyId = saleDetails.party._id._id;
      saleDetails.party._id = partyId;
    }

    // Update product names in items array
    if (saleDetails.items && saleDetails.items.length > 0) {
      saleDetails.items.forEach((item) => {
        if (item._id?.product_name) {
          // Update the product name with the latest value
          item.product_name = item._id.product_name;

          // Restore ID to original format
          const itemId = item._id._id;
          item._id = itemId;
        }

        // Update godown names in GodownList array
        if (item.GodownList && item.GodownList.length > 0) {
          item.GodownList.forEach((godown) => {
            if (godown.godownMongoDbId?.godown) {
              // Update the godown name with the latest value
              godown.godown = godown.godownMongoDbId.godown;

              // Restore ID to original format
              const godownId = godown.godownMongoDbId._id;
              godown.godownMongoDbId = godownId;
            }
          });
        }
      });
    }

    // Find the outstanding for this sale
    const outstandingOfSale = await TallyData.findOne({
      billId: saleDetails._id.toString(),
      bill_no: saleDetails.salesNumber,
      cmp_id: saleDetails.cmp_id,
      Primary_user_id: saleDetails.Primary_user_id,
    });

    const isEditable =
      !outstandingOfSale || outstandingOfSale?.appliedReceipts?.length === 0;
    saleDetails.isEditable = isEditable;

    res
      .status(200)
      .json({ message: "Sales details fetched", data: saleDetails });
  } catch (error) {
    console.error("Error fetching sale details:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};
