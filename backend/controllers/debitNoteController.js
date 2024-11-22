import { truncateToNDecimals } from "../helpers/helper.js";
import {
  createDebitNoteRecord,
  handleDebitNoteStockUpdates,
  revertDebitNoteStockUpdates,
  updateDebitNoteNumber,
  updateTallyData,
} from "../helpers/debitNoteHelper.js";
import { processSaleItems as processDebitNoteItems, updateOutstandingBalance } from "../helpers/salesHelper.js";

import { checkForNumberExistence } from "../helpers/secondaryHelper.js";
import debitNoteModel from "../models/debitNoteModel.js";
import secondaryUserModel from "../models/secondaryUserModel.js";
import mongoose from "mongoose";
import TallyData from "../models/TallyData.js";

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
      lastAmount,
      debitNoteNumber,
    } = req.body;
    // debitNoteNumber,

    const Secondary_user_id = req.sUserId;

    const NumberExistence = await checkForNumberExistence(
      debitNoteModel,
      "debitNoteNumber",
      debitNoteNumber,
      req.body.orgId,
      session
    );

    if (NumberExistence) {
      await session.abortTransaction();
      session.endSession();
      return res.status(400).json({
        message: "Debit Note with the same number already exists",
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

    await handleDebitNoteStockUpdates(items, session);
    const updatedItems = await processDebitNoteItems(items);
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
      updatedItems,
      updateAdditionalCharge,
      session // Pass session
    );

    if (
      party.accountGroup === "Sundry Debtors" ||
      party.accountGroup === "Sundry Creditors"
    ) {
      await updateTallyData(
        orgId,
        debitNoteNumber,
        result._id,
        req.owner,
        party,
        lastAmount,
        secondaryMobile,
        session // Pass session if needed
      );
    }

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
      lastAmount,
      debitNoteNumber,
      selectedDate,
    } = req.body;

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

    await revertDebitNoteStockUpdates(existingDebitNote.items, session);

    const updatedItems = await processDebitNoteItems(
      items,
      additionalChargesFromRedux
    );

    await handleDebitNoteStockUpdates(updatedItems, session);

    const updateData = {
      selectedGodownId: selectedGodownId ?? "",
      selectedGodownName: selectedGodownName ? selectedGodownName[0] : "",
      serialNumber: existingDebitNote.serialNumber,
      cmp_id: orgId,
      partyAccount: party?.partyName,
      party,
      despatchDetails,
      items: updatedItems,
      additionalCharges: additionalChargesFromRedux,
      finalAmount: lastAmount,
      Primary_user_id: req.owner,
      Secondary_user_id: req.secondaryUserId,
      debitNoteNumber: debitNoteNumber,
      createdAt: new Date(selectedDate),
    };

    await debitNoteModel.findByIdAndUpdate(debitNoteId, updateData, {
      new: true,
      session,
    });

    //// edit outstanding

    const secondaryUser = await secondaryUserModel
      .findById(req.sUserId)
      .session(session);
    const secondaryMobile = secondaryUser?.mobile;

    const outstandingResult = await updateOutstandingBalance({
      existingVoucher: existingDebitNote,
      newVoucherData: {
        paymentSplittingData :{},
        lastAmount,
      },
      orgId,
      voucherNumber: debitNoteNumber,
      party,
      session,
      createdBy: req.owner,
      transactionType: "debitNote",
      secondaryMobile,
    });

    await session.commitTransaction();
    session.endSession();

    res.status(200).json({
      success: true,
      message: "Debit Note edited successfully",
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
