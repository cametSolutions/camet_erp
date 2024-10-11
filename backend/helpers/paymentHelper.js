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










