import { truncateToNDecimals } from "../helpers/helper.js";
import {
  createPurchaseRecord,
  handlePurchaseStockUpdates,
  updatePurchaseNumber
} from "../helpers/purchaseHelper.js";
import {
  processSaleItems as processPurchaseItems,
} from "../helpers/salesHelper.js";
import { checkForNumberExistence } from "../helpers/secondaryHelper.js";
import purchaseModel from "../models/purchaseModel.js";
import secondaryUserModel from "../models/secondaryUserModel.js";

export const createPurchase = async (req, res) => {
  try {
    const {
      selectedGodownId,
      selectedGodownName,
      orgId,
      party,
      items,
      despatchDetails,
      priceLevelFromRedux,
      additionalChargesFromRedux,
      lastAmount,
      purchaseNumber,
      selectedDate,
    } = req.body;

    const Secondary_user_id = req.sUserId;

    const NumberExistence = await checkForNumberExistence(
      purchaseModel,
      "purchaseNumber",
      purchaseNumber,
      req.body.orgId
    );

    if (NumberExistence) {
      return res.status(400).json({
        message: "Purchase with the same number already exists",
      });
    }

    const secondaryUser = await secondaryUserModel.findById(Secondary_user_id);
    const secondaryMobile = secondaryUser?.mobile;

    if (!secondaryUser) {
      return res
        .status(404)
        .json({ success: false, message: "Secondary user not found" });
    }

  
    await handlePurchaseStockUpdates(items);
    const updatedItems = await processPurchaseItems(items);
    const updatedPurchaseNumber = await updatePurchaseNumber(
      orgId,
      secondaryUser
    );


    const updateAdditionalCharge = additionalChargesFromRedux.map((charge) => {
      const { value, taxPercentage } = charge;
      const taxAmt = parseFloat(
        ((parseFloat(value) * parseFloat(taxPercentage)) / 100).toFixed(2)
      );
      return { ...charge, taxAmt };
    });

    const result = await createPurchaseRecord(
      req,
      purchaseNumber,
      updatedItems,
      updateAdditionalCharge
    );

    res.status(201).json({
      success: true,
      data: result,
      message: "Purchase created successfully",
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "An error occurred while creating the purchase.",
      error: error.message,
    });
  }
};
