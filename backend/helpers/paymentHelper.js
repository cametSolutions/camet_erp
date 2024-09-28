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









