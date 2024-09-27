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
} from "../helpers/receiptHelper.js";

/**
 * @desc  get outstanding data from tally
 * @route GET/api/sUsers/fetchOutstandingDetails
 * @access Public
 */

export const fetchOutstandingDetails = async (req, res) => {
  const partyId = req.params.party_id;
  const cmp_id = req.params.cmp_id;
  const voucher = req.query.voucher;

  let sourceMatch = {};
  if (voucher === "receipt") {
    sourceMatch = { source: { $in: ["sale", "debitNote"] } };
  } else if (voucher === "payment") {
    sourceMatch = { source: { $in: ["purchase", "creditNote"] } };
  }
  try {
    const outstandings = await TallyData.find({
      party_id: partyId,
      cmp_id: cmp_id,
      bill_pending_amt: { $gt: 0 },
      ...sourceMatch,
    }).sort({ bill_date: 1 });
    if (outstandings) {
      return res.status(200).json({
        totalOutstandingAmount: outstandings.reduce(
          (total, out) => total + out.bill_pending_amt,
          0
        ),

        outstandings: outstandings,
        message: "outstandings fetched",
      });
    } else {
      return res
        .status(404)
        .json({ message: "No outstandings were found for user" });
    }
  } catch (error) {
    return res
      .status(500)
      .json({ success: false, message: "Internal server error, try again!" });
  }
};

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
  } = req.body;

  const Primary_user_id = req.owner.toString();
  const Secondary_user_id = req.sUserId;

  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    // Check if receipt number already exists
    const NumberExistence = await checkForNumberExistence(
      ReceiptModel,
      "receiptNumber",
      receiptNumber,
      cmp_id,
      session
    );

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

    // Use the helper function to update TallyData
    await updateTallyData(billData, cmp_id, session);

    // Create the new receipt
    const newReceipt = new ReceiptModel({
      date,
      receiptNumber,
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

    if (advanceAmount > 0 && savedReceipt) {
      const outstandingWithAdvanceAmount =
        await createOutstandingWithAdvanceAmount(
          cmp_id,
          savedReceipt.receiptNumber,
          Primary_user_id,
          party,
          secondaryUser.mobileNumber,
          advanceAmount,
          session
        );
    }

    // Commit the transaction
    await session.commitTransaction();
    session.endSession();

    res.status(200).json({
      message: "Receipt created successfully",
      receipt: savedReceipt,
    });
  } catch (error) {
    // Abort the transaction in case of an error
    await session.abortTransaction();
    session.endSession();

    console.error("Error creating receipt:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

