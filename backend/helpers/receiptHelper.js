import mongoose from "mongoose";
import receipt from "../../frontend/slices/receipt.js";
import OragnizationModel from "../models/OragnizationModel.js";
import TallyData from "../models/TallyData.js";
import cashModel from "../models/cashModel.js";
import bankModel from "../models/bankModel.js";

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


  console.log("billAmountMap", billAmountMap);
  

  // Fetch the outstanding bills from TallyData for this company
  const outstandingData = await TallyData.find({
    cmp_id,
    billId: { $in: Array.from(billAmountMap.keys()) },
  }).session(session);


  console.log("outstandingData", outstandingData);
  

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

export const createOutstandingWithAdvanceAmount = async (
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
      party_id: party?.party_master_id,
      bill_amount: advanceAmount,
      bill_date: new Date(),
      bill_pending_amt: advanceAmount,
      email: party?.emailID,
      mobile_no: party?.mobileNumber,
      party_name: party?.partyName,
      user_id: secondaryMobile || "null",
      source: sourceName,
      classification: classification,
    };

    const tallyUpdate = await TallyData.findOneAndUpdate(
      {
        cmp_id: cmp_id,
        bill_no: voucherNumber,
        billId: billId.toString(),
        Primary_user_id: Primary_user_id,
        party_id: party?.party_master_id,
      },
      billData,
      { upsert: true, new: true, session }
    );

    // console.log("tallyUpdate", tallyUpdate);
  } catch (error) {
    console.error("Error updateTallyData sale stock updates:", error);
    throw error;
  }
};

/**
 * Reverts the TallyData updates made by addOutstanding and addSettlementData functions.
 * @param {Array} billData - array of bill objects with billNo and settledAmount
 * @param {String} cmp_id - id of the organization
 * @param {Object} session - mongoose session
 */

export const revertTallyUpdates = async (
  billData,
  cmp_id,
  session,
  receiptId
) => {
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
        bill.billId,
        bill.settledAmount, // The amount that was settled
      ])
    );

    // Fetch the bills from TallyData that need to be reverted
    const tallyDataToRevert = await TallyData.find({
      cmp_id,
      billId: { $in: Array.from(billSettledAmountMap.keys()) },
    }).session(session);

    if (tallyDataToRevert.length === 0) {
      console.log("No matching tally data found to revert");
      return;
    }

    // Process updates one at a time instead of bulk
    // Process updates one at a time instead of bulk
    for (const doc of tallyDataToRevert) {
      const settledAmount = billSettledAmountMap.get(doc.billId);
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
  cmp_id,
  Primary_user_id,
  session
) => {
  // console.log(receiptNumber, cmp_id, Primary_user_id, session);

  try {
    // Find and delete the advance receipt entry in TallyData
    const deletedAdvanceReceipt = await TallyData.findOneAndDelete({
      cmp_id,
      bill_no: receiptNumber,
      billId: billId.toString(),
      Primary_user_id,
      source: "advanceReceipt",
    }).session(session);

    if (!deletedAdvanceReceipt) {
      console.log(
        `No advance receipt found for receipt number: ${receiptNumber}`
      );
      return;
    }

    console.log(`Advance receipt deleted for receipt number: ${receiptNumber}`);
  } catch (error) {
    console.error("Error in deleteAdvanceReceipt:", error);
    throw error;
  }
};

///// save payment details in payment collection

export const saveSettlementData = async (
  paymentMethod,
  paymentDetails,
  voucherNumber,
  voucherId,
  amount,
  orgId,
  type,
  createdAt,
  partyName,
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

    if (model) {
      const settlementData = {
        voucherNumber: voucherNumber,
        voucherId: voucherId.toString(),
        amount: amount,
        created_at: createdAt,
        payment_mode: paymentMethod.toLowerCase(),
        type: type,
        party: partyName,
      };


      const query = {
        cmp_id: orgId,
        ...(paymentMethod === "Cash"
          ? { _id: new mongoose.Types.ObjectId(paymentDetails._id) }
          : { _id: new mongoose.Types.ObjectId(paymentDetails._id) }),
      };

      const update = {
        $push: {
          settlements: settlementData,
        },
      };

      const options = {
        upsert: true,
        new: true,
        session,
      };

      const updatedSource = await model.findOneAndUpdate(
        query,
        update,
        options
      );
    }
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
  orgId,
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
``
    if (model) {
  

      const query = {
        cmp_id: orgId,
        ...(paymentMethod === "Cash"
          ? { _id: new mongoose.Types.ObjectId(paymentDetails._id) }
          : { _id: new mongoose.Types.ObjectId(paymentDetails._id) }),
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
