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
  deleteAdvanceReceipt
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
    }).sort({ bill_date: 1 }).select("bill_no bill_date bill_pending_amt source bill_date");
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
    outstandings
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

  

    // Create the new receipt
    const newReceipt = new ReceiptModel({
      createdAt: new Date(date),
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
      outstandings,
    });


    

    // Save the receipt in the transaction session
    const savedReceipt = await newReceipt.save({ session });

      // Use the helper function to update TallyData
      await updateTallyData(billData, cmp_id, session,receiptNumber,savedReceipt._id.toString());

    if (advanceAmount > 0 && savedReceipt) {
      const outstandingWithAdvanceAmount =
        await createOutstandingWithAdvanceAmount(
          cmp_id,
          savedReceipt.receiptNumber,
          Primary_user_id,
          party,
          secondaryUser.mobileNumber,
          advanceAmount,
          session,
          "advanceReceipt"
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


/**
 * @desc  cancel receipt
 * @route PUT/api/sUsers/cancelReceipt
 * @access Public
 */


export const cancelReceipt = async (req, res) => {

  
  const { receiptId,cmp_id } = req.params; // Assuming the receipt ID is passed as a URL parameter
  const Primary_user_id = req.owner.toString();
  // const cmp_id = req.body.cmp_id; // Or from req.body if available

  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    // Find the receipt to be canceled
    const receipt = await ReceiptModel.findById(receiptId).session(session);

    console.log("receipt", receipt._id);
    

    if (!receipt) {
      await session.abortTransaction();
      session.endSession();
      return res.status(404).json({ success: false, message: "Receipt not found" });
    }

    if (receipt.isCancelled) {
      await session.abortTransaction();
      session.endSession();
      return res.status(400).json({ success: false, message: "Receipt is already cancelled" });
    }

    // Revert tally updates
    await revertTallyUpdates(receipt.billData, cmp_id, session,receiptId.toString());

    // Delete advance receipt, if any
    if (receipt.advanceAmount > 0) {
      await deleteAdvanceReceipt(receipt.receiptNumber, cmp_id, Primary_user_id, session);
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


export const editReceipt = async (req, res) => {
  const receiptId=req.params.receiptId
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
    outstandings
  } = req.body;

  const session=await mongoose.startSession();
  session.startTransaction();
  try {

    const receipt=await ReceiptModel.findById(receiptId).session(session);

    if (!receipt) {
      await session.abortTransaction();
      session.endSession();
      return res.status(404).json({ success: false, message: "Receipt not found" });
    }

    if (receipt.isCancelled) {
      await session.abortTransaction();
      session.endSession();
      return res.status(400).json({ success: false, message: "Receipt is already cancelled" });
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
    await revertTallyUpdates(receipt.billData, cmp_id, session,receiptId.toString());

     // Delete advance receipt, if any
     if (receipt.advanceAmount > 0) {
      await deleteAdvanceReceipt(receipt.receiptNumber, cmp_id, Primary_user_id, session);
    }

      // Use the helper function to update TallyData
      await updateTallyData(billData, cmp_id, session,receiptNumber,receiptId);

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
      receipt.outstandings = outstandings;

      const savedReceipt=await receipt.save({ session, new: true });


      if (advanceAmount > 0) {
        const outstandingWithAdvanceAmount =
          await createOutstandingWithAdvanceAmount(
            cmp_id,
            savedReceipt.receiptNumber,
            Primary_user_id,
            party,
            secondaryUser.mobileNumber,
            advanceAmount,
            session,
            "advanceReceipt"
          );
      }
  


      // console.log(receipt);
      
      await session.commitTransaction();
      session.endSession();

      res.status(200).json({
        success: true,
        message: "Receipt updated successfully",
        receipt: receipt
      });
    
    
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    console.error("Error editing receipt:", error);
    res.status(500).json({ error: "Internal Server Error" });
    
  }
}

