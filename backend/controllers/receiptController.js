import {
  checkForNumberExistence,
  getNewSerialNumber,
} from "../helpers/secondaryHelper.js";
import TallyData from "../models/TallyData.js";
import ReceiptModel from "../models/receiptModel.js";
import mongoose from "mongoose";
import secondaryUserModel from "../models/secondaryUserModel.js";
import {
  createOutstandingWithAdvanceAmount,
  updateReceiptNumber,
  updateTallyData,
  revertTallyUpdates,
  deleteAdvanceReceipt,
  saveSettlementData,
  updateAdvanceOnEdit,
} from "../helpers/receiptHelper.js";
import { formatToLocalDate } from "../helpers/helper.js";
import { generateVoucherNumber } from "../helpers/voucherHelper.js";
import settlementModel from "../models/settlementModel.js";

/**
 * @desc  create receipt
 * @route POST/api/sUsers/createReceipt
 * @access Public
 */

export const createReceipt = async (req, res) => {
  const {
    date,
    receiptNumber,
    cmp_id,
    party,
    billData,
    totalBillAmount,
    enteredAmount,
    advanceAmount,
    remainingAmount,
    paymentMethod,
    paymentDetails,
    note,
    series_id,
    voucherType,
  } = req.body;

  const Primary_user_id = req.owner.toString();
  const Secondary_user_id = req.sUserId;

  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    /// generate voucher number(sales number)
    const { voucherNumber: receiptNumber, usedSeriesNumber } =
      await generateVoucherNumber(cmp_id, voucherType, series_id, session);
    if (receiptNumber) {
      req.body.receiptNumber = receiptNumber;
    }
    if (usedSeriesNumber) {
      req.body.usedSeriesNumber = usedSeriesNumber;
    }

    const serialNumber = await getNewSerialNumber(
      ReceiptModel,
      "serialNumber",
      session
    );

    const secondaryUser = await secondaryUserModel
      .findById(Secondary_user_id)
      .session(session);

    if (!secondaryUser) {
      await session.abortTransaction();
      session.endSession();
      return res
        .status(404)
        .json({ success: false, message: "Secondary user not found" });
    }

    ////for updating voucher number of receipt
    const updatedReceiptNumber = await updateReceiptNumber(
      cmp_id,
      secondaryUser,
      session
    );

    // Create the new receipt
    const newReceipt = new ReceiptModel({
      createdAt: new Date(),
      date: await formatToLocalDate(date, cmp_id, session),

      receiptNumber,
      series_id,
      usedSeriesNumber: usedSeriesNumber || null,
      serialNumber,
      cmp_id,
      party,
      billData,
      totalBillAmount,
      enteredAmount,
      advanceAmount,
      remainingAmount,
      paymentMethod,
      paymentDetails,
      note,
      Primary_user_id,
      Secondary_user_id,
    });

    // Save the receipt in the transaction session
    const savedReceipt = await newReceipt.save({ session });

    /// save settlement data in cash or bank collection
    await saveSettlementData(
      receiptNumber,
      savedReceipt._id.toString(),
      "Receipt",
      "receipt",
      enteredAmount || 0,
      paymentMethod,
      paymentDetails,
      party,
      cmp_id,
      Primary_user_id,
      date,
      session
    );

    // Use the helper function to update TallyData
    await updateTallyData(
      billData,
      cmp_id,
      session,
      receiptNumber,
      savedReceipt._id.toString()
    );

    if (advanceAmount > 0 && savedReceipt) {
      await createOutstandingWithAdvanceAmount(
        date,
        cmp_id,
        savedReceipt.receiptNumber,
        savedReceipt._id.toString(),
        Primary_user_id,
        party,
        secondaryUser.mobileNumber,
        advanceAmount,
        session,
        "advanceReceipt",
        "Cr"
      );
    }

    // Commit the transaction
    await session.commitTransaction();
    session.endSession();

    res.status(200).json({
      message: "Receipt created successfully",
      data: savedReceipt,
    });
  } catch (error) {
    // Abort the transaction in case of an error
    await session.abortTransaction();
    session.endSession();

    console.error("Error creating receipt:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

/**
 * @desc  cancel receipt
 * @route PUT/api/sUsers/cancelReceipt
 * @access Public
 */

export const cancelReceipt = async (req, res) => {
  const { receiptId } = req.params; // Assuming the receipt ID is passed as a URL parameter
  const Primary_user_id = req.owner.toString();
  // const cmp_id = req.body.cmp_id; // Or from req.body if available

  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    // Find the receipt to be canceled
    const receipt = await ReceiptModel.findById(receiptId).session(session);

    if (!receipt) {
      await session.abortTransaction();
      session.endSession();
      return res
        .status(404)
        .json({ success: false, message: "Receipt not found" });
    }

    if (receipt.isCancelled) {
      await session.abortTransaction();
      session.endSession();
      return res
        .status(400)
        .json({ success: false, message: "Receipt is already cancelled" });
    }

    // Revert tally updates
    await revertTallyUpdates(
      receipt.billData,
      receipt.cmp_id,
      session,
      receiptId.toString()
    );

    /// delete  all the settlements
    await settlementModel.deleteMany({ voucherId: receiptId }, { session });

    // Delete advance receipt, if any
    if (receipt.advanceAmount > 0) {
      await deleteAdvanceReceipt(
        receipt.receiptNumber,
        receipt._id?.toString(),
        Primary_user_id,
        session
      );
    }

    // Mark the receipt as cancelled
    receipt.isCancelled = true;
    await receipt.save({ session });

    // Commit the transaction
    await session.commitTransaction();
    session.endSession();

    res.status(200).json({
      success: true,
      message: "Receipt cancelled successfully",
    });
  } catch (error) {
    await session.abortTransaction();
    session.endSession();

    console.error("Error cancelling receipt:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

/**
 * @desc  Edit receipt
 * @route PUT/api/sUsers/editReceipt/:receiptId
 * @access Public
 */

export const editReceipt = async (req, res) => {
  const receiptId = req.params.receiptId;
  const Primary_user_id = req.owner.toString();
  const Secondary_user_id = req.sUserId;

  const {
    date,
    receiptNumber,
    cmp_id,
    party,
    billData,
    totalBillAmount,
    enteredAmount,
    advanceAmount,
    remainingAmount,
    paymentMethod,
    paymentDetails,
    note,
  } = req.body;

  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    const receipt = await ReceiptModel.findById(receiptId).session(session);

    if (!receipt) {
      await session.abortTransaction();
      session.endSession();
      return res
        .status(404)
        .json({ success: false, message: "Receipt not found" });
    }

    if (receipt.isCancelled) {
      await session.abortTransaction();
      session.endSession();
      return res
        .status(400)
        .json({ success: false, message: "Receipt is already cancelled" });
    }

    const secondaryUser = await secondaryUserModel
      .findById(Secondary_user_id)
      .session(session);

    if (!secondaryUser) {
      await session.abortTransaction();
      session.endSession();
      return res
        .status(404)
        .json({ success: false, message: "Secondary user not found" });
    }

    // Revert tally updates
    await revertTallyUpdates(
      receipt.billData,
      cmp_id,
      session,
      receiptId.toString()
    );

    /// delete  all the settlements
    await settlementModel.deleteMany({ voucherId: receiptId }, { session });

    // Use the helper function to update TallyData
    await updateTallyData(billData, cmp_id, session, receiptNumber, receiptId);

    // update advance receipt / advance payment on edit of receipt or payment
    await updateAdvanceOnEdit(
      "receipt",
      advanceAmount,
      receipt.party,
      cmp_id,
      receiptId.toString(),
      session
    );

    ///update the existing receipt
    receipt.date = date;
    receipt.receiptNumber = receiptNumber;
    receipt.cmp_id = cmp_id;
    receipt.party = party;
    receipt.billData = billData;
    receipt.totalBillAmount = totalBillAmount;
    receipt.enteredAmount = enteredAmount;
    receipt.advanceAmount = advanceAmount;
    receipt.remainingAmount = remainingAmount;
    receipt.paymentMethod = paymentMethod;
    receipt.paymentDetails = paymentDetails;
    receipt.note = note;

    const savedReceipt = await receipt.save({ session, new: true });

    /// save settlement data in cash or bank collection
    await saveSettlementData(
      receiptNumber,
      savedReceipt._id.toString(),
      "Receipt",
      "receipt",
      enteredAmount || 0,
      paymentMethod,
      paymentDetails,
      party,
      cmp_id,
      Primary_user_id,
      date,
      session
    );

    // if (advanceAmount > 0 && savedReceipt) {
    //   await createOutstandingWithAdvanceAmount(
    //     date,
    //     cmp_id,
    //     savedReceipt.receiptNumber,
    //     savedReceipt._id.toString(),
    //     Primary_user_id,
    //     party,
    //     secondaryUser.mobileNumber,
    //     advanceAmount,
    //     session,
    //     "advanceReceipt",
    //     "Cr"
    //   );
    // }

    // console.log(receipt);

    await session.commitTransaction();
    session.endSession();

    res.status(200).json({
      success: true,
      message: "Receipt updated successfully",
      data: receipt,
    });
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    console.error("Error editing receipt:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

/**
 * @desc  get receipt details
 * @route GET/api/sUsers/getReceiptDetails
 * @access Public
 */

export const getReceiptDetails = async (req, res) => {
  const receiptId = req.params.id;

  try {
    /* -----------------------------------------------------------
       1.  Load the receipt and populate ONLY appliedReceipts
           from each referenced TallyData (outstanding) document.
       ----------------------------------------------------------- */

    /* -----------------------------------------------------------
   WHY WE POPULATE appliedReceipts FROM OUTSTANDING DOCUMENTS:
   
   When a receipt is created, it stores settlement amounts in billData.
   However, sales invoices can be edited AFTER receipt creation, which
   updates the outstanding document but NOT the original receipt.
   
   This creates a data inconsistency:
   - Receipt.billData.settledAmount = original amount when receipt was created
   - Outstanding.appliedReceipts.settledAmount = current/actual applied amount
   
   Since outstanding documents are the "source of truth" for current
   account balances and are updated when invoices are modified, we
   prioritize the appliedReceipts data over the receipt's stored amounts.
   
   This ensures users always see the accurate, up-to-date settlement
   amounts rather than stale data from the receipt creation time.
   ----------------------------------------------------------- */

    const receiptDoc = await ReceiptModel.findById(receiptId);
    // .populate({
    //   path: "billData._id", // ↳ nested reference
    //   select: "appliedReceipts bill_pending_amt", // ↳ pull only what we actually need
    // })
    // .lean(); // ↳ returns plain JS objects, no Mongoose overhead

    if (!receiptDoc)
      return res
        .status(404)
        .json({ success: false, message: "Receipt not found" });

    /* -----------------------------------------------------------
       2.  Flatten billData so that `_id` is the original ObjectId
           and add appliedReceiptAmount (number) for each bill.
       ----------------------------------------------------------- */
    // receiptDoc.billData = receiptDoc.billData.map((bill) => {
    //   // `populated` holds the TallyData stub; original bill props are at top level.
    //   const { _id: populated, ...billFields } = bill;

    //   // Find the matching appliedReceipts entry for THIS receipt.
    //   const receiptMatch = populated?.appliedReceipts?.find(
    //     (entry) => entry._id.toString() === receiptDoc._id.toString()
    //   );

    //   return {
    //     _id: populated?._id ?? billFields._id, // original ObjectId (not the whole object)
    //     ...billFields, // bill_no, bill_date, etc.
    //     appliedReceiptAmount: receiptMatch ? receiptMatch?.settledAmount : 0,
    //     currentOutstandingAmount:
    //       populated?.bill_pending_amt ?? billFields.bill_pending_amt, // latest outstanding balance
    //     bill_pending_amt:
    //       (receiptMatch?.settledAmount || 0) +
    //       (Math.max(populated?.bill_pending_amt, 0) || 0),
    //   };
    // });

    return res.status(200).json({
      success: true,
      message: "Receipt details fetched",
      receipt: receiptDoc,
    });
  } catch (err) {
    console.error(err);
    return res
      .status(500)
      .json({ success: false, message: "Internal server error, try again!" });
  }
};
