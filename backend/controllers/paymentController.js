import {
  checkForNumberExistence,
  getNewSerialNumber,
} from "../helpers/secondaryHelper.js";
import TallyData from "../models/TallyData.js";
import mongoose from "mongoose";
import secondaryUserModel from "../models/secondaryUserModel.js";
import {
  createOutstandingWithAdvanceAmount,
  updateTallyData,
} from "../helpers/receiptHelper.js";

import {
  updatePaymentNumber,
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
  } = req.body;

  const Primary_user_id = req.owner.toString();
  const Secondary_user_id = req.sUserId;

  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    // Check if receipt number already exists
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

    ////for updating voucher number of receipt
    const updatedpaymentNumber = await updatePaymentNumber(
      cmp_id,
      secondaryUser,
      session
    );

    // Use the helper function to update TallyData
    await updateTallyData(billData, cmp_id, session);

    // Create the new receipt
    const newReceipt = new paymentModel({
      date,
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
      Primary_user_id,
      Secondary_user_id,
    });

    // Save the receipt in the transaction session
    const savedReceipt = await newReceipt.save({ session });

    if (advanceAmount > 0 && savedReceipt) {
      const outstandingWithAdvanceAmount =
        await createOutstandingWithAdvanceAmount(
          cmp_id,
          savedReceipt.paymentNumber,
          Primary_user_id,
          party,
          secondaryUser.mobileNumber,
          advanceAmount,
          session,
          "advancePayment"
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

// /**
//  * @desc  cancel receipt
//  * @route PUT/api/sUsers/cancelReceipt
//  * @access Public
//  */

// export const cancelReceipt = async (req, res) => {
//   const { receiptId } = req.params; // Assuming the receipt ID is passed as a URL parameter
//   const Primary_user_id = req.owner.toString();
//   const cmp_id = req.body.cmp_id; // Or from req.body if available

//   const session = await mongoose.startSession();
//   session.startTransaction();

//   try {
//     // Find the receipt to be canceled
//     const receipt = await paymentModel.findById(receiptId).session(session);

//     if (!receipt) {
//       await session.abortTransaction();
//       session.endSession();
//       return res
//         .status(404)
//         .json({ success: false, message: "Receipt not found" });
//     }

//     if (receipt.isCancelled) {
//       await session.abortTransaction();
//       session.endSession();
//       return res
//         .status(400)
//         .json({ success: false, message: "Receipt is already cancelled" });
//     }

//     // Revert tally updates
//     await revertTallyUpdates(receipt.billData, cmp_id, session);

//     // Delete advance receipt, if any
//     if (receipt.advanceAmount > 0) {
//       await deleteAdvanceReceipt(
//         receipt.paymentNumber,
//         cmp_id,
//         Primary_user_id,
//         session
//       );
//     }

//     // Mark the receipt as cancelled
//     receipt.isCancelled = true;
//     await receipt.save({ session });

//     // Commit the transaction
//     await session.commitTransaction();
//     session.endSession();

//     res.status(200).json({
//       success: true,
//       message: "Receipt cancelled successfully",
//     });
//   } catch (error) {
//     await session.abortTransaction();
//     session.endSession();

//     console.error("Error cancelling receipt:", error);
//     res.status(500).json({ error: "Internal Server Error" });
//   }
// };
