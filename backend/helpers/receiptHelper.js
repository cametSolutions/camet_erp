import mongoose from "mongoose";
import receipt from "../../frontend/slices/receipt.js";
import OragnizationModel from "../models/OragnizationModel.js";
import TallyData from "../models/TallyData.js";
import cashModel from "../models/cashModel.js";
import bankModel from "../models/bankModel.js";
import settlementModel from "../models/settlementModel.js";

/**
 * Updates the receiptNumber for a given secondary user
 * @param {String} secondaryUserId - id of the secondary user
 * @param {String} orgId - id of the organization
 * @param {Object} session - mongoose session
 */

export const updateReceiptNumber = async (orgId, secondaryUser, session) => {
  try {
    let receiptConfig = false;

    const configuration = secondaryUser.configurations.find(
      (config) => config.organization.toString() === orgId
    );

    if (configuration) {
      receiptConfig = true;
    }

    if (receiptConfig === true) {
      const updatedConfiguration = secondaryUser.configurations.map(
        (config) => {
          if (config.organization.toString() === orgId) {
            return {
              ...config,
              receiptNumber: (config.receiptNumber || 0) + 1,
            };
          }
          return config;
        }
      );
      secondaryUser.configurations = updatedConfiguration;
      await secondaryUser.save({ session });
    } else {
      await OragnizationModel.findByIdAndUpdate(
        orgId,
        { $inc: { receiptNumber: 1 } },
        { new: true, session }
      );
    }
  } catch (error) {
    console.error("Error in  update receiptNumber :", error);
    throw error;
  }
};

/**
 * Updates the TallyData for a given set of bills
 * @param {Array} billData - array of bill objects with billNo and remainingAmount
 * @param {String} cmp_id - id of the organization
 * @param {Object} session - mongoose session
 */

export const updateTallyData = async (
  billData,
  cmp_id,
  session,
  receiptNumber,
  _id
) => {
  // Create a lookup map for billNo to remainingAmount and settledAmount from billData
  const billAmountMap = new Map(
    billData.map((bill) => [
      bill.billId,
      {
        remainingAmount: bill.remainingAmount,
        settledAmount: bill.settledAmount,
      },
    ])
  );

  // console.log("billAmountMap", billAmountMap);

  // Fetch the outstanding bills from TallyData for this company
  const outstandingData = await TallyData.find({
    cmp_id,
    billId: { $in: Array.from(billAmountMap.keys()) },
  }).session(session);

  // console.log("outstandingData", outstandingData);

  if (outstandingData.length === 0) {
    return;
  }

  // Prepare bulk update operations for TallyData
  const bulkUpdateOperations = outstandingData.map((doc) => {
    const { remainingAmount, settledAmount } = billAmountMap.get(doc.billId); // Get the remaining and settled amount

    return {
      updateOne: {
        filter: { _id: doc._id },
        update: {
          $set: {
            bill_pending_amt: remainingAmount, // Update remaining amount (pending amount)
          },
          $push: {
            appliedReceipts: {
              _id, // Add the _id of the receipt
              receiptNumber, // Add the receipt number
              settledAmount, // Add the settled amount directly from billData
              date: new Date(), // Optional: Timestamp when this receipt was applied
            },
          },
        },
      },
    };
  });

  // Execute the bulk update in TallyData
  await TallyData.bulkWrite(bulkUpdateOperations, { session });
};

/**
 * Creates a new outstanding record for a given party with the advance amount.
 * @param {String} cmp_id - id of the organization
 * @param {String} receiptNumber - receipt number for this outstanding record
 * @param {String} Primary_user_id - id of the primary user
 * @param {Object} party - party object with partyName, mobileNumber and emailID
 * @param {String} secondaryMobile - secondary user mobile number
 * @param {Number} advanceAmount - advance amount for this outstanding record
 */

// Helper function to create or update advance amounts
export const createOutstandingWithAdvanceAmount = async (
  date,
  cmp_id,
  voucherNumber,
  billId,
  Primary_user_id,
  party,
  secondaryMobile,
  advanceAmount,
  session,
  sourceName,
  classification
) => {
  try {
    const billData = {
      Primary_user_id,
      bill_no: voucherNumber,
      billId: billId.toString(),
      cmp_id,
      party_id: party?._id,
      bill_date: new Date(date),
      bill_due_date: new Date(date),
      email: party?.emailID,
      mobile_no: party?.mobileNumber,
      party_name: party?.partyName,
      user_id: secondaryMobile || "null",
      source: sourceName,
      classification: classification,
    };

    // Check if advance already exists
    const existingAdvance = await TallyData.findOne({
      cmp_id: cmp_id,
      bill_no: voucherNumber,
      billId: billId.toString(),
      Primary_user_id: Primary_user_id,
      party_id: party?._id,
      source: sourceName,
    }).session(session);

    if (existingAdvance) {
      // Merge by adding amounts
      const updatedBillAmount =
        Number(existingAdvance.bill_amount || 0) + Number(advanceAmount);
      const updatedPendingAmount =
        Number(existingAdvance.bill_pending_amt || 0) + Number(advanceAmount);

      const tallyUpdate = await TallyData.findByIdAndUpdate(
        existingAdvance._id,
        {
          ...billData,
          bill_amount: updatedBillAmount,
          bill_pending_amt: updatedPendingAmount,
          updatedAt: new Date(),
        },
        { new: true, session }
      );

      console.log(`Merged advance for ${sourceName}:`, tallyUpdate);
      return tallyUpdate;
    } else {
      // Create new advance
      const tallyUpdate = await TallyData.findOneAndUpdate(
        {
          cmp_id: cmp_id,
          bill_no: voucherNumber,
          billId: billId.toString(),
          Primary_user_id: Primary_user_id,
          party_id: party?._id,
          source: sourceName,
        },
        {
          ...billData,
          bill_amount: advanceAmount,
          bill_pending_amt: advanceAmount,
        },
        { upsert: true, new: true, session }
      );

      return tallyUpdate;
    }
  } catch (error) {
    console.error(`Error creating/updating advance for ${sourceName}:`, error);
    throw error;
  }
};

/**
 * Reverts the TallyData updates made by addOutstanding and addSettlementData functions.
 * @param {Array} billData - array of bill objects with billNo and settledAmount
 * @param {String} cmp_id - id of the organization
 * @param {Object} session - mongoose session
 */

export const revertTallyUpdates = async (billData, session, receiptId) => {
  // const receiptIdObj = new mongoose.Types.ObjectId(receiptId);
  // console.log("receiptId", receiptIdObj);

  try {
    if (!billData || billData.length === 0) {
      console.log("No bill data to revert");
      return;
    }

    // Create a lookup map for billNo to settled amount from billData
    const billSettledAmountMap = new Map(
      billData.map((bill) => [
        bill.billId.toString(),
        bill.settledAmount, // The amount that was settled
      ])
    );

    // Fetch the bills from TallyData that need to be reverted
    const tallyDataToRevert = await TallyData.find({
      billId: { $in: Array.from(billSettledAmountMap.keys()) },
    }).session(session);

    if (tallyDataToRevert.length === 0) {
      console.log("No matching tally data found to revert");
      return;
    }

    // Process updates one at a time instead of bulk
    for (const doc of tallyDataToRevert) {
      const settledAmount = billSettledAmountMap.get(doc.billId) || 0;

      await TallyData.updateOne(
        { _id: doc._id },
        {
          $inc: { bill_pending_amt: settledAmount },
          $pull: {
            appliedReceipts: { _id: receiptId },
          },
        }
      ).session(session);
    }

    // console.log(`Successfully reverted ${tallyDataToRevert.length} tally updates`);
  } catch (error) {
    console.error("Error in revertTallyUpdates:", error);
    throw error;
  }
};

/**
 * Deletes the advance receipt entry from TallyData if it exists
 * @param {String} receiptNumber - receipt number for the advance receipt
 * @param {String} cmp_id - id of the organization
 * @param {String} Primary_user_id - id of the primary user
 * @param {Object} session - mongoose session
 */

export const deleteAdvanceReceipt = async (
  receiptNumber,
  billId,
  Primary_user_id,
  session
) => {
  try {
    // First, find the advance receipt entry
    const advanceReceipt = await TallyData.findOne({
      bill_no: receiptNumber,
      billId: billId.toString(),
      Primary_user_id,
      source: "advanceReceipt",
    }).session(session);

    // If not found, throw an error
    if (!advanceReceipt) {
      throw new Error(
        `No advance receipt found for receipt number: ${receiptNumber}`
      );
    }

    // Check if appliedPayments exists and has any entries
    if (
      Array.isArray(advanceReceipt.appliedPayments) &&
      advanceReceipt.appliedPayments.length > 0
    ) {
      throw new Error(
        `Receipt ${receiptNumber} cannot be cancelled because it has applied payments.`
      );
    }

    // Proceed to delete the advance receipt
    const deletedAdvanceReceipt = await TallyData.findOneAndDelete({
      _id: advanceReceipt._id,
    }).session(session);

    console.log(`Advance receipt deleted for receipt number: ${receiptNumber}`);
  } catch (error) {
    console.error("Error in deleteAdvanceReceipt:", error);
    throw error;
  }
};

///// save payment details in payment collection

export const saveSettlementData = async (
  voucherNumber,
  voucherId,
  voucherModel,
  voucherType,
  amount,
  paymentMethod,
  paymentDetails,
  party,
  cmp_id,
  Primary_user_id,
  date,
  session
) => {
  try {
    const settlementData = {
      voucherNumber: voucherNumber,
      voucherId: voucherId,
      voucherModel: voucherModel,
      voucherType: voucherType,
      amount: amount,
      payment_mode: paymentMethod.toLowerCase(),
      partyName: party?.partyName || "",
      partyId: party?._id || null,
      partyType: party?.partyType || null,
      sourceId: paymentDetails?._id || null,
      sourceType: paymentMethod == "Cash" ? "cash" : "bank",
      cmp_id: cmp_id,
      Primary_user_id: Primary_user_id,
      settlement_date: date,
      voucher_date: date,
    };

    await settlementModel.create([settlementData], { session });
  } catch (error) {
    console.error("Error in save settlement data:", error);
    throw error;
  }
};

//// revert save settlement data

export const revertSettlementData = async (
  paymentMethod,
  paymentDetails,
  voucherNumber,
  voucherId,
  session
) => {
  try {
    if (!paymentDetails._id || !paymentMethod) {
      throw new Error("Invalid paymentDetails");
    }
    let model = null;
    switch (paymentMethod) {
      case "Online":
        model = bankModel;
        break;
      case "Cash":
        model = cashModel;
        break;
      case "Cheque":
        model = bankModel;
        break;
      default:
        throw new Error("Invalid paymentMethod");
    }
    ``;
    if (model) {
      const query = {
        _id: new mongoose.Types.ObjectId(paymentDetails._id),
      };

      // First, pull the specified settlements
      const pullUpdate = {
        $pull: {
          settlements: {
            voucherNumber: voucherNumber,
            voucherId: voucherId.toString(),
          },
        },
      };

      const options = {
        new: true,
        session,
      };

      const updatedSource = await model.findOneAndUpdate(
        query,
        pullUpdate,
        options
      );
    }
  } catch (error) {
    console.error("Error in save settlement data:", error);
    throw error;
  }
};

/// process advance receipts
export const processAdvanceReceipts = async (
  appliedReceipts,
  remainingAdvanceAmount,
  orgId,
  existingVoucher,
  party,
  secondaryMobile,
  session
) => {
  let currentRemainingAmount = remainingAdvanceAmount;
  const updatedAppliedReceipts = [...appliedReceipts];

  // LIFO: loop through in reverse
  for (
    let i = appliedReceipts.length - 1;
    i >= 0 && currentRemainingAmount > 0;
    i--
  ) {
    const receipt = appliedReceipts[i];

    console.log("receipt", receipt);

    const { receiptNumber, settledAmount, date, _id } = receipt;

    const advanceAmount = Math.min(settledAmount, currentRemainingAmount);

    // Call the function to create or update advance
    await createOutstandingWithAdvanceAmount(
      date,
      orgId, // cmp_id
      receiptNumber,
      _id.toString(),
      existingVoucher?.Primary_user_id,
      party,
      secondaryMobile,
      advanceAmount,
      session,
      "advanceReceipt",
      "Cr"
    );

    currentRemainingAmount -= advanceAmount;

    // Update the applied receipt array
    if (advanceAmount >= settledAmount) {
      // Complete amount used, remove the receipt
      updatedAppliedReceipts.splice(i, 1);
    } else {
      // console.log("partial amount used");
      // console.log("settledAmount - advanceAmount", settledAmount - advanceAmount);

      // Partial amount used, update the settled amount
      updatedAppliedReceipts[i] = {
        ...(receipt.toObject?.() || receipt), //// Convert to plain object
        settledAmount: settledAmount - advanceAmount,
      };
    }
  }

  console.log("updatedAppliedReceipts from helper", updatedAppliedReceipts);

  return {
    remainingAmount: currentRemainingAmount,
    updatedAppliedReceipts: updatedAppliedReceipts,
  };
};

// Helper function to process advance payments
export const processAdvancePayments = async (
  appliedPayments,
  remainingAdvanceAmount,
  orgId,
  existingVoucher,
  party,
  secondaryMobile,
  session
) => {
  let currentRemainingAmount = remainingAdvanceAmount;
  const updatedAppliedPayments = [...appliedPayments];

  // LIFO: loop through in reverse
  for (
    let i = appliedPayments.length - 1;
    i >= 0 && currentRemainingAmount > 0;
    i--
  ) {
    const payment = appliedPayments[i];
    const { paymentNumber, settledAmount, date, _id } = payment;

    const advanceAmount = Math.min(settledAmount, currentRemainingAmount);

    await createOutstandingWithAdvanceAmount(
      date,
      orgId, // cmp_id
      paymentNumber,
      _id.toString(),
      existingVoucher?.Primary_user_id,
      party,
      secondaryMobile,
      advanceAmount,
      session,
      "advancePayment",
      "Dr" // Debit since it's a payment
    );

    currentRemainingAmount -= advanceAmount;

    // Update the applied payment array
    if (advanceAmount >= settledAmount) {
      // Complete amount used, remove the payment
      updatedAppliedPayments.splice(i, 1);
    } else {
      // Partial amount used, update the settled amount
      updatedAppliedPayments[i] = {
        ...payment.toObject(),
        settledAmount: settledAmount - advanceAmount,
      };
    }
  }

  return {
    remainingAmount: currentRemainingAmount,
    updatedAppliedPayments: updatedAppliedPayments,
  };
};
