import {
  checkForNumberExistence,
  getNewSerialNumber,
} from "../helpers/secondaryHelper.js";
import TallyData from "../models/TallyData.js";
import mongoose from "mongoose";
import secondaryUserModel from "../models/secondaryUserModel.js";
import {
  createOutstandingWithAdvanceAmount,
} from "../helpers/receiptHelper.js";

import {
  deleteAdvancePayment,
  updatePaymentNumber,
  updateTallyData,
  revertTallyUpdates,


} from "../helpers/paymentHelper.js";
import paymentModel from "../models/paymentModel.js";

/**
 * @desc  create payment
 * @route POST/api/sUsers/createPayment
 * @access Public
 */

export const createPayment = async (req, res) => {
  const {
    date,
    paymentNumber,
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
    outstandings,
  } = req.body;

  const Primary_user_id = req.owner.toString();
  const Secondary_user_id = req.sUserId;

  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    // Check if payment number already exists
    const NumberExistence = await checkForNumberExistence(
      paymentModel,
      "paymentNumber",
      paymentNumber,
      cmp_id,
      session
    );

    const serialNumber = await getNewSerialNumber(
      paymentModel,
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

    ////for updating voucher number of payment
    const updatedpaymentNumber = await updatePaymentNumber(
      cmp_id,
      secondaryUser,
      session
    );

 

    // Create the new payment
    const newPayment = new paymentModel({
      createdAt: new Date(date),
      paymentNumber,
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
      outstandings,
      Primary_user_id,
      Secondary_user_id,
    });

    // Save the payment in the transaction session
    const savedPayment = await newPayment.save({ session , new: true });

       // Use the helper function to update TallyData
       await updateTallyData(billData, cmp_id, session,paymentNumber,savedPayment._id.toString());

    if (advanceAmount > 0 && savedPayment) {
      const outstandingWithAdvanceAmount =
        await createOutstandingWithAdvanceAmount(
          cmp_id,
          savedPayment.paymentNumber,
          Primary_user_id,
          party,
          secondaryUser.mobileNumber,
          advanceAmount,
          session,
          "advancePayment",
          "Dr"
        );
    }

    // Commit the transaction
    await session.commitTransaction();
    session.endSession();

    res.status(200).json({
      message: "Payment created successfully",
      payment: savedPayment,
    });
  } catch (error) {
    // Abort the transaction in case of an error
    await session.abortTransaction();
    session.endSession();

    console.error("Error creating payment:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

/**
 * @desc  cancel payment
 * @route PUT/api/sUsers/cancelPayment
 * @access Public
 */

export const cancelPayment = async (req, res) => {
  const { paymentId, cmp_id } = req.params; // Assuming the payment ID is passed as a URL parameter
  const Primary_user_id = req.owner.toString();
  // const cmp_id = req.body.cmp_id; // Or from req.body if available

  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    // Find the payment to be canceled
    const payment = await paymentModel.findById(paymentId).session(session);

    if (!payment) {
      await session.abortTransaction();
      session.endSession();
      return res
        .status(404)
        .json({ success: false, message: "Payment not found" });
    }

    if (payment.isCancelled) {
      await session.abortTransaction();
      session.endSession();
      return res
        .status(400)
        .json({ success: false, message: "Payment is already cancelled" });
    }

    // Revert tally updates
    await revertTallyUpdates(payment.billData, cmp_id, session);

    // Delete advance payment, if any
    if (payment.advanceAmount > 0) {
      await deleteAdvancePayment(
        payment.paymentNumber,
        cmp_id,
        Primary_user_id,
        session
      );
    }

    // Mark the payment as cancelled
    payment.isCancelled = true;
    await payment.save({ session });

    // Commit the transaction
    await session.commitTransaction();
    session.endSession();

    res.status(200).json({
      success: true,
      message: "payment cancelled successfully",
    });
  } catch (error) {
    await session.abortTransaction();
    session.endSession();

    console.error("Error cancelling payment:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

export const editPayment = async (req, res) => {
  const paymentId = req.params.paymentId;
  const Primary_user_id = req.owner.toString();
  const Secondary_user_id = req.sUserId;

  const {
    date,
    paymentNumber,
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
    outstandings,
  } = req.body;

  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    const payment = await paymentModel.findById(paymentId).session(session);

    if (!payment) {
      await session.abortTransaction();
      session.endSession();
      return res
        .status(404)
        .json({ success: false, message: "Receipt not found" });
    }

    if (payment.isCancelled) {
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
    await revertTallyUpdates(payment.billData, cmp_id, session);

    // Delete advance payment, if any
    if (payment.advanceAmount > 0) {
      await deleteAdvancePayment(
        payment.paymentNumber,
        cmp_id,
        Primary_user_id,
        session
      );
    }

    // Use the helper function to update TallyData
    await updateTallyData(billData, cmp_id, session, paymentNumber,payment._id.toString());

    ///update the existing payment
    payment.date = date;
    payment.paymentNumber = paymentNumber;
    payment.cmp_id = cmp_id;
    payment.party = party;
    payment.billData = billData;
    payment.totalBillAmount = totalBillAmount;
    payment.enteredAmount = enteredAmount;
    payment.advanceAmount = advanceAmount;
    payment.remainingAmount = remainingAmount;
    payment.paymentMethod = paymentMethod;
    payment.paymentDetails = paymentDetails;
    payment.note = note;
    payment.outstandings = outstandings;

    const savedPayment = await payment.save({ session, new: true });

    if (advanceAmount > 0) {
      const outstandingWithAdvanceAmount =
        await createOutstandingWithAdvanceAmount(
          cmp_id,
          savedPayment.paymentNumber,
          Primary_user_id,
          party,
          secondaryUser.mobileNumber,
          advanceAmount,
          session,
          "advancePayment",
          "Dr"
        );
    }

    // console.log(payment);

    await session.commitTransaction();
    session.endSession();

    res.status(200).json({
      success: true,
      message: "Receipt updated successfully",
      payment: payment,
    });
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    console.error("Error editing payment:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};
