import { truncateToNDecimals } from "../helpers/helper.js";
import {
  createDebitNoteRecord,
  handleDebitNoteStockUpdates,
  revertDebitNoteStockUpdates,
  updateDebitNoteNumber,
} from "../helpers/debitNoteHelper.js";
import { processSaleItems as processDebitNoteItems } from "../helpers/salesHelper.js";

import { checkForNumberExistence } from "../helpers/secondaryHelper.js";
import debitNoteModel from "../models/debitNoteModel.js";
import secondaryUserModel from "../models/secondaryUserModel.js";
import mongoose from "mongoose";

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
  try {
    const debitNoteId = req.params.id; // Assuming saleId is passed in the URL parameters
    const existingDebitNote = await debitNoteModel.findById(debitNoteId);
    if (!existingDebitNote) {
      return res
        .status(404)
        .json({ success: false, message: "Purchase not found" });
    }

    // Revert existing stock updates
    await revertDebitNoteStockUpdates(existingDebitNote.items);

    // flagging is cancelled true

    existingDebitNote.isCancelled = true;

    const cancelledDebitNote = await existingDebitNote.save();

    res.status(200).json({
      success: true,
      message: "purchase canceled successfully",
      data: cancelledDebitNote,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "An error occurred while editing the sale.",
      error: error.message,
    });
  }
};

// @desc edit debit note
// route GET/api/sUsers/editDebitNote

export const editDebitNote = async (req, res) => {
  try {
    const debitNoteId = req.params.id; // Assuming saleId is passed in the URL parameters
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
    // Fetch existing Purchase
    const existingDebitNote = await debitNoteModel.findById(debitNoteId);
    if (!existingDebitNote) {
      return res
        .status(404)
        .json({ success: false, message: "Purchase not found" });
    }

    // Revert existing stock updates
    await revertDebitNoteStockUpdates(existingDebitNote.items);
    // Process new sale items and update stock
    const updatedItems = await processDebitNoteItems(
      items,
      additionalChargesFromRedux
    );

    await handleDebitNoteStockUpdates(updatedItems);

    // Update existing sale record
    const updateData = {
      selectedGodownId: "",
      selectedGodownName: "",
      serialNumber: existingDebitNote.serialNumber, // Keep existing serial number
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
    });

    //     ///////////////////////////////////// for reflecting the rate change in outstanding  ////////////////////////////////////

    // const newBillValue = Number(lastAmount);
    // const oldBillValue = Number(existingSale.finalAmount);
    // const diffBillValue = newBillValue - oldBillValue;

    // const matchedOutStanding = await TallyData.findOne({
    //   party_id: party?.party_master_id,
    //   cmp_id: orgId,
    //   bill_no: salesNumber,
    // });

    // if (matchedOutStanding) {
    //   // console.log("editSale: matched outstanding found");
    //   const newOutstanding =
    //     Number(matchedOutStanding?.bill_pending_amt) + diffBillValue;

    //   // console.log("editSale: new outstanding calculated", newOutstanding);
    //   await TallyData.updateOne(
    //     {
    //       party_id: party?.party_master_id,
    //       cmp_id: orgId,
    //       bill_no: salesNumber,
    //     },
    //     { $set: { bill_pending_amt: newOutstanding } }
    //   );

    //   // console.log("editSale: outstanding updated");
    // } else {
    //   console.log("editSale: matched outstanding not found");
    // }

    res.status(200).json({
      success: true,
      message: "purchase edited successfully",
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "An error occurred while editing the sale.",
      error: error.message,
    });
  }
};
