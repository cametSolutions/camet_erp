import { formatToLocalDate, truncateToNDecimals } from "../helpers/helper.js";
import {
  createDebitNoteRecord,
  handleDebitNoteStockUpdates,
  revertDebitNoteStockUpdates,
  updateDebitNoteNumber,
  // updateTallyData,
} from "../helpers/debitNoteHelper.js";
import {
  processSaleItems as processDebitNoteItems,
  revertSettlementData,
  saveSettlementData,
  updateOutstandingBalance,
  updateTallyData,
} from "../helpers/salesHelper.js";

import { checkForNumberExistence } from "../helpers/secondaryHelper.js";
import debitNoteModel from "../models/debitNoteModel.js";
import secondaryUserModel from "../models/secondaryUserModel.js";
import mongoose from "mongoose";
import TallyData from "../models/TallyData.js";
import { generateVoucherNumber, getSeriesDetailsById } from "../helpers/voucherHelper.js";

// @desc create credit note
// route GET/api/sUsers/createDebitNote
export const createDebitNote = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const {
      party,
      orgId,
      items,
      additionalChargesFromRedux,
      note,
      finalAmount: lastAmount,
      selectedDate,
      voucherType,
      series_id,
    } = req.body;
    // debitNoteNumber,

    const Secondary_user_id = req.sUserId;

    /// generate voucher number(debitNote number)
    const { voucherNumber: debitNoteNumber, usedSeriesNumber } =
      await generateVoucherNumber(orgId, voucherType, series_id, session);
    if (debitNoteNumber) {
      req.body.debitNoteNumber = debitNoteNumber;
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

    await handleDebitNoteStockUpdates(items, session);
    // const updatedItems = await processDebitNoteItems(items);
    const updateDebitNoteVoucherNumber = await updateDebitNoteNumber(
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

    const result = await createDebitNoteRecord(
      req,
      debitNoteNumber,
      items,
      updateAdditionalCharge,
      session // Pass session
    );

    ///save settlement data
    await saveSettlementData(
      party,
      orgId,
      "normal debit note",
      "debitNote",
      debitNoteNumber,
      result._id,
      lastAmount,
      result?.createdAt,
      result?.party?.partyName,
      session
    );

    await updateTallyData(
      orgId,
      debitNoteNumber,
      result._id,
      req.owner,
      party,
      lastAmount,
      secondaryMobile,
      session,
      lastAmount, ///valueToUpdateInTally is also last amount
      selectedDate,
      voucherType,
      "Dr",
      "DebitNote"
    );

    await session.commitTransaction();
    session.endSession();

    res.status(201).json({
      success: true,
      data: result,
      message: "Debit Note created successfully",
    });
  } catch (error) {
    await session.abortTransaction();
    console.error(error);
    res.status(500).json({
      success: false,
      message: "An error occurred while creating the Debit",
      error: error.message,
    });
  } finally {
    await session.endSession();
  }
};

// @desc cancel credit note
// route GET/api/sUsers/cancelDebitNote

export const cancelDebitNote = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    const debitNoteId = req.params.id; // Assuming saleId is passed in the URL parameters
    const existingDebitNote = await debitNoteModel
      .findById(debitNoteId)
      .session(session);
    if (!existingDebitNote) {
      await session.abortTransaction();
      session.endSession();
      return res
        .status(404)
        .json({ success: false, message: "Purchase not found" });
    }

    // Revert existing stock updates
    await revertDebitNoteStockUpdates(existingDebitNote.items, session);

    //// revert settlement data
    await revertSettlementData(
      existingDebitNote?.party,
      existingDebitNote?.cmp_id,
      existingDebitNote?.debitNoteNumber,
      existingDebitNote?._id.toString(),
      session
    );

    const cancelOutstanding = await TallyData.findOneAndUpdate(
      {
        bill_no: existingDebitNote?.debitNoteNumber,
        billId: debitNoteId?.toString(),
      },
      {
        $set: {
          isCancelled: true,
        },
      }
    ).session(session);

    // flagging is cancelled true

    existingDebitNote.isCancelled = true;

    const cancelledDebitNote = await existingDebitNote.save({ session });

    await session.commitTransaction();

    res.status(200).json({
      success: true,
      message: "purchase canceled successfully",
      data: cancelledDebitNote,
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

// @desc edit debit note
// route GET/api/sUsers/editDebitNote

export const editDebitNote = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const debitNoteId = req.params.id;
    const {
      selectedGodownId,
      selectedGodownName,
      orgId,
      party,
      items,
      despatchDetails,
      additionalChargesFromRedux,
      finalAmount: lastAmount,
      selectedDate,
      note
    } = req.body;

    let { debitNoteNumber, series_id, usedSeriesNumber } = req.body;

    const existingDebitNote = await debitNoteModel
      .findById(debitNoteId)
      .session(session);
    if (!existingDebitNote) {
      await session.abortTransaction();
      session.endSession();
      return res
        .status(404)
        .json({ success: false, message: "Debit Note not found" });
    }

    if (existingDebitNote?.series_id?.toString() !== series_id?.toString()) {
      const { voucherNumber, usedSeriesNumber: newUsedSeriesNumber } =
        await generateVoucherNumber(
          orgId,
          existingDebitNote.voucherType,
          series_id,
          session
        );

      debitNoteNumber = voucherNumber; // Always update when series changes
      usedSeriesNumber = newUsedSeriesNumber; // Always update when series changes
    }
    
    else{
      debitNoteNumber = existingDebitNote.debitNoteNumber
      usedSeriesNumber = existingDebitNote.usedSeriesNumber
    }

    await revertDebitNoteStockUpdates(existingDebitNote.items, session);

    await handleDebitNoteStockUpdates(items, session);

    const updateData = {
      selectedGodownId: selectedGodownId ?? "",
      selectedGodownName: selectedGodownName ? selectedGodownName[0] : "",
      serialNumber: existingDebitNote.serialNumber,
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
      debitNoteNumber: debitNoteNumber,
      series_id,
      usedSeriesNumber,
      date: await formatToLocalDate(selectedDate, orgId, session),
      createdAt: existingDebitNote.createdAt,
    };

    await debitNoteModel.findByIdAndUpdate(debitNoteId, updateData, {
      new: true,
      session,
    });

    /// revert settlement data
    await revertSettlementData(
      existingDebitNote?.party,
      orgId,
      existingDebitNote?.debitNoteNumber,
      existingDebitNote?._id.toString(),
      session
    );

    /// recreate the settlement data

    ///save settlement data
    await saveSettlementData(
      party,
      orgId,
      "normal debit note",
      "debitNote",
      updateData?.debitNoteNumber,
      debitNoteId,
      lastAmount,
      updateData?.createdAt,
      updateData?.party?.partyName,
      session
    );

    //// edit outstanding

    const secondaryUser = await secondaryUserModel
      .findById(req.sUserId)
      .session(session);
    const secondaryMobile = secondaryUser?.mobile;

    const outstandingResult = await updateOutstandingBalance({
      existingVoucher: existingDebitNote,
      newVoucherData: {
        paymentSplittingData: {},
        lastAmount,
      },
      orgId,
      voucherNumber: debitNoteNumber,
      party,
      session,
      createdBy: req.owner,
      transactionType: "debitNote",
      secondaryMobile,
      selectedDate,
      classification: "Dr",
    });

    await session.commitTransaction();
    session.endSession();

    res.status(200).json({
      success: true,
      message: "Debit Note edited successfully",
      data: existingDebitNote,
    });
  } catch (error) {
    await session.abortTransaction();
    console.error(error);
    res.status(500).json({
      success: false,
      message: "An error occurred while editing the Debit Note.",
      error: error.message,
    });
  } finally {
    await session.endSession();
  }
};

// @desc to  get details of debit note
// route get/api/sUsers/getCreditNoteDetails
export const getDebitNoteDetails = async (req, res) => {
  try {
    const id = req.params.id;

    const details = await debitNoteModel
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
      return res.status(404).json({ error: "Debit Note Details not found" });
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

    // Update party name and restore _id
    if (details.party?._id?.partyName) {
      details.partyAccount = details.party._id.partyName;
      details.party.partyName = details.party._id.partyName;
      const partyId = details.party._id._id;
      details.party._id = partyId;
    }

    // Update item and godown details
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

    // Check if the debit note is editable
    const outstandingOfDebitNote = await TallyData.findOne({
      billId: details._id.toString(),
      bill_no: details.debitNoteNumber,
      cmp_id: details.cmp_id,
      Primary_user_id: details.Primary_user_id,
    });

    const isEditable =
      !outstandingOfDebitNote ||
      outstandingOfDebitNote?.appliedReceipts?.length === 0;

    details.isEditable = isEditable;

    res
      .status(200)
      .json({ message: "Debit Note Details fetched", data: details });
  } catch (error) {
    console.error("Error in getting Debit Note:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};
``;
