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

export const deleteAdvancePayment = async (
  paymentNumber,
  billId,
  Primary_user_id,
  session
) => {
  // console.log(paymentNumber, cmp_id, Primary_user_id, session);

  try {
    // Find and delete the advance receipt entry in TallyData
    const deletedAdvancePayment = await TallyData.findOneAndDelete({
      bill_no: paymentNumber,
      billId: billId.toString(),
      Primary_user_id,
      source: "advancePayment",
    }).session(session);

    if (!deletedAdvancePayment) {
      console.log(
        `No advance payment found for payment number: ${paymentNumber}`
      );
      return;
    }
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

export const updateTallyData = async (
  billData,
  session,
  paymentNumber,
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

  // Fetch the outstanding bills from TallyData for this company
  const outstandingData = await TallyData.find({
    billId: { $in: Array.from(billAmountMap.keys()) },
  }).session(session);

  if (outstandingData.length === 0) {
    return;
  }

  // Prepare bulk update operations for TallyData
  const bulkUpdateOperations = outstandingData.map((doc) => {
    const { settledAmount } = billAmountMap.get(doc.billId); // Get the remaining and settled amount

    const bill_pending_amt = doc?.bill_pending_amt || 0;

    //Calculate total applied receipts from existing + this one
    const existingAppliedPaymentsTotal = (doc?.appliedPayments || []).reduce(
      (sum, r) => sum + (r?.settledAmount || 0),
      0
    );
    const appliedPayments = existingAppliedPaymentsTotal + settledAmount;
    const balance = (doc?.bill_amount || 0) - appliedPayments;

    //  Classification rule
    let classification = "Cr";
    if (balance < 0) {
      classification = "Dr";
    }


    console.log("bill_pending_amt", bill_pending_amt);
    console.log("settledAmount", settledAmount);
    console.log("balance", balance);
    

    return {
      updateOne: {
        filter: { _id: doc._id },
        update: {
          $set: {
            bill_pending_amt: balance, // Update remaining amount (pending amount)
            classification: classification, // ✅ set classification dynamically
          },
          $push: {
            appliedPayments: {
              _id, // Add the _id of the receipt
              paymentNumber, // Add the receipt number
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
 * Reverts the TallyData updates made by addOutstanding and addSettlementData functions.
 * @param {Array} billData - array of bill objects with billNo and settledAmount
 * @param {String} cmp_id - id of the organization
 * @param {Object} session - mongoose session
 */

export const revertTallyUpdates = async (
  billData,
  cmp_id,
  session,
  paymentId
) => {
  try {
    if (!billData?.length) {
      console.log("❌ No bill data to revert");
      return;
    }

    // console.log("🔄 Starting revert process for paymentId:", paymentId);
    // console.log("📋 Bill data to revert:", billData.length, "items");

    const billIds = billData.map(bill => bill.billId.toString());
    // console.log("🔍 Looking for billIds:", billIds);
    
    // Fetch documents and perform bulk operations
    const docs = await TallyData.find({
      billId: { $in: billIds }
    }).session(session);

    if (!docs.length) {
      console.log("❌ No matching tally data found to revert");
      return;
    }

    // console.log("✅ Found", docs.length, "documents to revert");

    // Prepare bulk operations
    const bulkOps = docs.map((doc, index) => {
      // console.log(`\n📄 Processing document ${index + 1}/${docs.length}:`);
      // console.log("   - BillId:", doc.billId);
      // console.log("   - Current bill_amount:", doc.bill_amount);
      // console.log("   - Current bill_pending_amt:", doc.bill_pending_amt);
      // console.log("   - Current classification:", doc.classification);
      // console.log("   - Applied payments before filter:", doc.appliedPayments?.length || 0);

      // Filter out the payment being reverted
      const remainingPayments = doc.appliedPayments?.filter(
        payment => payment._id.toString() !== paymentId.toString()
      ) || [];

      // console.log("   - Applied payments after filter:", remainingPayments.length);
      // console.log("   - Remaining payments:", remainingPayments.map(p => ({
      //   id: p._id, 
      //   settled: p.settledAmount
      // })));

      // Calculate total of remaining applied payments
      const totalAppliedPayments = remainingPayments.reduce(
        (sum, payment) => sum + (payment.settledAmount || 0),
        0
      );

      // console.log("   - Total remaining applied payments:", totalAppliedPayments);

      // Calculate new pending amount and classification
      const newPendingAmount = doc.bill_amount - totalAppliedPayments;
      // For payments: if negative -> Dr, if positive -> Cr
      const newClassification = newPendingAmount < 0 ? "Dr" : "Cr";

      // console.log("   - New pending amount:", newPendingAmount);
      // console.log("   - New classification:", newClassification);

      return {
        updateOne: {
          filter: { _id: doc._id },
          update: {
            $set: {
              appliedPayments: remainingPayments,
              bill_pending_amt: Math.abs(newPendingAmount),
              classification: newClassification
            }
          }
        }
      };
    });

    // console.log("\n🔧 Executing bulk operations...");
    // console.log("📊 Bulk operations count:", bulkOps.length);

    // Execute bulk operation
    const result = await TallyData.bulkWrite(bulkOps, { session });

    // console.log("✅ Bulk operation result:", {
    //   modifiedCount: result.modifiedCount,
    //   matchedCount: result.matchedCount,
    //   upsertedCount: result.upsertedCount
    // });

    // console.log(`🎉 Successfully reverted ${docs.length} tally updates`);

  } catch (error) {
    console.error("💥 Error in revertTallyUpdates:", {
      message: error.message,
      stack: error.stack,
      paymentId,
      billDataCount: billData?.length || 0,
      timestamp: new Date().toISOString()
    });
    throw error;
  }
};
