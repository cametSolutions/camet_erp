import { formatToLocalDate, truncateToNDecimals } from "../helpers/helper.js";
import {
  createCreditNoteRecord,
  handleCreditNoteStockUpdates,
  updateCreditNoteNumber,
  revertCreditNoteStockUpdates,
  // updateTallyData,
} from "../helpers/creditNoteHelper.js";
import {
  processSaleItems as processCreditNoteItems,
  revertSettlementData,
  saveSettlementData,
  updateOutstandingBalance,
  updateTallyData,
} from "../helpers/salesHelper.js";

import { checkForNumberExistence } from "../helpers/secondaryHelper.js";
import creditNoteModel from "../models/creditNoteModel.js";
import secondaryUserModel from "../models/secondaryUserModel.js";
import mongoose from "mongoose";
import TallyData from "../models/TallyData.js";
import {
  generateVoucherNumber,
  getSeriesDetailsById,
} from "../helpers/voucherHelper.js";

// @desc create credit note
// route GET/api/sUsers/createCreditNote
export const createCreditNote = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    const {
      orgId,
      party,
      items,
      despatchDetails,
      additionalChargesFromRedux,
      note,
      finalAmount: lastAmount,
      selectedDate,
      voucherType,
      series_id,
    } = req.body;

    const Secondary_user_id = req.sUserId;

    /// generate voucher number(creditNote number)
    const { voucherNumber: creditNoteNumber, usedSeriesNumber } =
      await generateVoucherNumber(orgId, voucherType, series_id, session);
    if (creditNoteNumber) {
      req.body.creditNoteNumber = creditNoteNumber;
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

    await handleCreditNoteStockUpdates(items, session);
    // const updatedItems = await processCreditNoteItems(items);
    const updatedCreditNoteNumber = await updateCreditNoteNumber(
      orgId,
      secondaryUser,
      session
    );

    const updateAdditionalCharge = additionalChargesFromRedux.map((charge) => {
      const { value, taxPercentage } = charge;
      const taxAmt = parseFloat(
        ((parseFloat(value) * parseFloat(taxPercentage)) / 100).toFixed(2)
      );
      return { ...charge, taxAmt };
    });

    const result = await createCreditNoteRecord(
      req,
      creditNoteNumber,
      items,
      updateAdditionalCharge,
      session
    );

    ///save settlement data
    await saveSettlementData(
      party,
      orgId,
      "normal credit note",
      "creditNote",
      creditNoteNumber,
      result._id,
      lastAmount,
      result?.createdAt,
      party?.partyName,
      session
    );

    await updateTallyData(
      orgId,
      creditNoteNumber,
      result._id,
      req.owner,
      party,
      lastAmount,
      secondaryMobile,
      session,
      lastAmount, ///valueToUpdateInTally is also last amount
      selectedDate,
      voucherType,
      "Cr",
      "CreditNote"
    );

    await session.commitTransaction();
    session.endSession();

    res.status(201).json({
      success: true,
      data: result,
      message: "Credit Note created successfully",
    });
  } catch (error) {
    console.error(error);
    await session.abortTransaction();
    res.status(500).json({
      success: false,
      message: "An error occurred while creating the Credit",
      error: error.message,
    });
  } finally {
    await session.endSession();
  }
};

// @desc cancel credit note
// route GET/api/sUsers/cancelCreditNote

const MAX_RETRIES = 3;
const RETRY_DELAY = 1000; // 1 second

export const cancelCreditNote = async (req, res) => {
  let retryCount = 0;

  while (retryCount < MAX_RETRIES) {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      const creditNoteId = req.params.id;
      const existingCreditNote = await creditNoteModel
        .findById(creditNoteId)
        .session(session);

      if (!existingCreditNote) {
        await session.abortTransaction();
        session.endSession();
        return res
          .status(404)
          .json({ success: false, message: "Credit note not found" });
      }

      // Revert existing stock updates
      await revertCreditNoteStockUpdates(existingCreditNote.items, session);

      //// revert settlement data
      await revertSettlementData(
        existingCreditNote?.party,
        existingCreditNote?.cmp_id,
        existingCreditNote?.creditNoteNumber,
        existingCreditNote?._id.toString(),
        session
      );

      const cancelOutstanding = await TallyData.findOneAndUpdate(
        {
          bill_no: existingCreditNote?.creditNoteNumber,
          billId: creditNoteId?.toString(),
        },
        {
          $set: {
            isCancelled: true,
          },
        }
      ).session(session);

      existingCreditNote.isCancelled = true;
      const cancelledCreditNote = await existingCreditNote.save({ session });

      await session.commitTransaction();
      session.endSession();

      return res.status(200).json({
        success: true,
        message: "Credit note canceled successfully",
        data: cancelledCreditNote,
      });
    } catch (error) {
      await session.abortTransaction();
      session.endSession();

      if (
        error.errorLabels &&
        error.errorLabels.includes("TransientTransactionError")
      ) {
        retryCount++;
        if (retryCount < MAX_RETRIES) {
          console.log(
            `Retrying transaction attempt ${retryCount + 1} of ${MAX_RETRIES}`
          );
          await new Promise((resolve) => setTimeout(resolve, RETRY_DELAY));
          continue;
        }
      }

      console.error("Error canceling credit note:", error);
      return res.status(500).json({
        success: false,
        message: "An error occurred while canceling the credit note.",
        error: error.message,
      });
    }
  }

  return res.status(500).json({
    success: false,
    message: "Failed to cancel credit note after multiple retries",
  });
};

// @desc edit credit note
// route GET/api/sUsers/editCreditNote

export const editCreditNote = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    const creditNoteId = req.params.id; // Assuming saleId is passed in the URL parameters
    const {
      orgId,
      party,
      items,
      despatchDetails,
      note,

      additionalChargesFromRedux,
      finalAmount: lastAmount,
      selectedDate,
    } = req.body;

    let { creditNoteNumber, series_id, usedSeriesNumber } = req.body;

    // Fetch existing Purchase
    const existingCreditNote = await creditNoteModel
      .findById(creditNoteId)
      .session(session);
    if (!existingCreditNote) {
      await session.abortTransaction();
      session.endSession();
      return res
        .status(404)
        .json({ success: false, message: "Purchase not found" });
    }

    if (existingCreditNote?.series_id?.toString() !== series_id?.toString()) {
      const { voucherNumber, usedSeriesNumber: newUsedSeriesNumber } =
        await generateVoucherNumber(
          orgId,
          existingCreditNote.voucherType,
          series_id,
          session
        );

      creditNoteNumber = voucherNumber; // Always update when series changes
      usedSeriesNumber = newUsedSeriesNumber; // Always update when series changes
    }else{
      creditNoteNumber = existingCreditNote?.creditNoteNumber
      usedSeriesNumber = existingCreditNote?.usedSeriesNumber
    }

    // Revert existing stock updates
    await revertCreditNoteStockUpdates(existingCreditNote.items, session);
    await handleCreditNoteStockUpdates(items, session);

    // Update existing sale record
    const updateData = {
      selectedGodownId: "",
      selectedGodownName: "",
      serialNumber: existingCreditNote.serialNumber, // Keep existing serial number
      cmp_id: orgId,
      partyAccount: party?.partyName,
      party,
      despatchDetails,
      items,
      additionalCharges: additionalChargesFromRedux,
      note,
      finalAmount: lastAmount,
      Primary_user_id: req.owner,
      Secondary_user_id: req.secondaryUserId,
      creditNoteNumber: creditNoteNumber,
      series_id,
      usedSeriesNumber,
      date: await formatToLocalDate(selectedDate, orgId, session),
      createdAt: existingCreditNote.createdAt,
    };

    await creditNoteModel.findByIdAndUpdate(creditNoteId, updateData, {
      new: true,
      session,
    });

    /// revert stock updates
    await revertSettlementData(
      existingCreditNote?.party,
      orgId,
      existingCreditNote?.creditNoteNumber,
      existingCreditNote?._id.toString(),
      session
    );

    /// recreate the settlement data

    ///save settlement data
    await saveSettlementData(
      party,
      orgId,
      "normal credit note",
      "creditNote",
      updateData?.creditNoteNumber,
      creditNoteId,
      lastAmount,
      updateData?.createdAt,
      updateData?.party?.partyName,
      session
    );

    //// edit outstanding

    // ///updating the existing outstanding record by calculating the difference in bill value

    const secondaryUser = await secondaryUserModel
      .findById(req.sUserId)
      .session(session);
    const secondaryMobile = secondaryUser?.mobile;

    const outstandingResult = await updateOutstandingBalance({
      existingVoucher: existingCreditNote,
      newVoucherData: {
        paymentSplittingData: {},
        lastAmount,
      },
      orgId,
      voucherNumber: creditNoteNumber,
      party,
      session,
      createdBy: req.owner,
      transactionType: "creditNote",
      secondaryMobile,
      selectedDate,
      classification: "Cr",
    });

    await session.commitTransaction();
    session.endSession();
    res.status(200).json({
      success: true,
      message: "Credit note edited successfully",
      data: existingCreditNote,
    });
  } catch (error) {
    await session.abortTransaction();

    console.error(error);
    res.status(500).json({
      success: false,
      message: "An error occurred while editing the sale.",
      error: error.message,
    });
  } finally {
    await session.endSession();
  }
};

// @desc to  get details of credit note
// route get/api/sUsers/getCreditNoteDetails
export const getCreditNoteDetails = async (req, res) => {
  try {
    const id = req.params.id;

    const details = await creditNoteModel
      .findById(id)
      .populate({
        path: "party._id",
        select: "partyName",
      })
      .populate({
        path: "items._id",
        select: "product_name balance_stock",
      })
      .populate({
        path: "items.GodownList.godownMongoDbId",
        select: "godown",
      })
      .lean();

    if (!details) {
      return res.status(404).json({ error: "Credit Note Details not found" });
    }

    const seriesDetails = await getSeriesDetailsById(
      details?.series_id,
      details?.cmp_id,
      details?.voucherType
    );

    seriesDetails.currentNumber = details?.usedSeriesNumber;

    if (seriesDetails) {
      details.seriesDetails = seriesDetails;
    }

    // Populate party name and restore _id
    if (details.party?._id?.partyName) {
      details.partyAccount = details.party._id.partyName;
      details.party.partyName = details.party._id.partyName;
      const partyId = details.party._id._id;
      details.party._id = partyId;
    }

    // Populate item and godown details
    if (details.items && details.items.length > 0) {
      details.items.forEach((item) => {
        if (item._id?.product_name) {
          item.product_name = item._id.product_name;
          item.balance_stock = item._id.balance_stock;
          item._id = item._id._id;
        }

        if (item.GodownList && item.GodownList.length > 0) {
          item.GodownList.forEach((godown) => {
            if (godown.godownMongoDbId?.godown) {
              godown.godown = godown.godownMongoDbId.godown;
              godown.godownMongoDbId = godown.godownMongoDbId._id;
            }
          });
        }
      });
    }

    // Check if the credit note is editable
    const outstandingOfCreditNote = await TallyData.findOne({
      billId: details._id.toString(),
      bill_no: details.creditNoteNumber,
      cmp_id: details.cmp_id,
      Primary_user_id: details.Primary_user_id,
    });

    const isEditable =
      !outstandingOfCreditNote ||
      outstandingOfCreditNote?.appliedPayments?.length === 0;

    details.isEditable = isEditable;

    res
      .status(200)
      .json({ message: "Credit Note Details fetched", data: details });
  } catch (error) {
    console.error("Error in getting Credit Note:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};
