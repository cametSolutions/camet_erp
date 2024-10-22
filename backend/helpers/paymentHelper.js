import receipt from "../../frontend/slices/receipt.js";
import OragnizationModel from "../models/OragnizationModel.js";
import TallyData from "../models/TallyData.js";

/**
 * Updates the paymentNumber for a given secondary user
 * @param {String} secondaryUserId - id of the secondary user
 * @param {String} orgId - id of the organization
 * @param {Object} session - mongoose session
 */

export const updatePaymentNumber = async (orgId, secondaryUser, session) => {
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
              paymentNumber: (config.paymentNumber || 0) + 1,
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
        { $inc: { paymentNumber: 1 } },
        { new: true, session }
      );
    }
  } catch (error) {
    console.error("Error in  update paymentNumber :", error);
    throw error;
  }
};


/**
 * Deletes the advance receipt entry from TallyData if it exists
 * @param {String} paymentNumber - receipt number for the advance receipt
 * @param {String} cmp_id - id of the organization
 * @param {String} Primary_user_id - id of the primary user
 * @param {Object} session - mongoose session
 */


export const deleteAdvancePayment = async (paymentNumber, cmp_id, Primary_user_id, session) => {

  // console.log(paymentNumber, cmp_id, Primary_user_id, session);
  
  try {
    // Find and delete the advance receipt entry in TallyData
    const deletedAdvancePayment = await TallyData.findOneAndDelete({
      cmp_id,
      bill_no: paymentNumber,
      Primary_user_id,
      source: "advancePayment"
    }).session(session);

    if (!deletedAdvancePayment) {
      console.log(`No advance payment found for payment number: ${paymentNumber}`);
      return;
    }

    console.log(`Advance receipt deleted for receipt number: ${paymentNumber}`);
  } catch (error) {
    console.error("Error in deleteAdvanceReceipt:", error);
    throw error;
  }
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


export const updateTallyData = async (billData, cmp_id, session, paymentNumber,_id) => {
  // Create a lookup map for billNo to remainingAmount and settledAmount from billData
  const billAmountMap = new Map(
    billData.map((bill) => [bill.billNo, { remainingAmount: bill.remainingAmount, settledAmount: bill.settledAmount }])
  );

  // Fetch the outstanding bills from TallyData for this company
  const outstandingData = await TallyData.find({
    cmp_id,
    bill_no: { $in: Array.from(billAmountMap.keys()) },
  }).session(session);

  if (outstandingData.length === 0) {
    return;
  }

  // Prepare bulk update operations for TallyData
  const bulkUpdateOperations = outstandingData.map((doc) => {
    const { remainingAmount, settledAmount } = billAmountMap.get(doc.bill_no); // Get the remaining and settled amount

    return {
      updateOne: {
        filter: { _id: doc._id },
        update: {
          $set: {
            bill_pending_amt: remainingAmount, // Update remaining amount (pending amount)
          },
          $push: {
            appliedPayments: {
              _id,  // Add the _id of the receipt
              paymentNumber,  // Add the receipt number
              settledAmount,  // Add the settled amount directly from billData
              date: new Date(),  // Optional: Timestamp when this receipt was applied
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
 * Reverts the TallyData updates made by addOutstanding and addSettlementData functions.
 * @param {Array} billData - array of bill objects with billNo and settledAmount
 * @param {String} cmp_id - id of the organization
 * @param {Object} session - mongoose session
 */


export const revertTallyUpdates = async (billData, cmp_id, session,paymentId) => {
  try {
    if (!billData || billData.length === 0) {
      console.log("No bill data to revert");
      return;
    }

    // Create a lookup map for billNo to settled amount from billData
    const billSettledAmountMap = new Map(
      billData.map((bill) => [
        bill.billNo, 
        bill.settledAmount  // The amount that was settled
      ])
    );

    // Fetch the bills from TallyData that need to be reverted
    const tallyDataToRevert = await TallyData.find({
      cmp_id,
      bill_no: { $in: Array.from(billSettledAmountMap.keys()) },
    }).session(session);

    if (tallyDataToRevert.length === 0) {
      console.log("No matching tally data found to revert");
      return;
    }

    // Process updates one at a time instead of bulk
     // Process updates one at a time instead of bulk
     for (const doc of tallyDataToRevert) {
      const settledAmount = billSettledAmountMap.get(doc.bill_no);
      await TallyData.updateOne(
        { _id: doc._id },
        {
          $inc: { bill_pending_amt: settledAmount },
          $pull: {
            appliedPayments: { _id: paymentId },
          }
        }
      ).session(session);
    }

    // console.log(`Successfully reverted ${tallyDataToRevert.length} tally updates`);
  } catch (error) {
    console.error("Error in revertTallyUpdates:", error);
    throw error;
  }
};










