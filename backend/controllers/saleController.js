import mongoose from "mongoose";
import {
  createSaleRecord,
  handleSaleStockUpdates,
  processSaleItems,
  updateSalesNumber,
  updateTallyData,
  checkForNumberExistence,
} from "../helpers/salesHelper.js";
import secondaryUserModel from "../models/secondaryUserModel.js";
import salesModel from "../models/salesModel.js";
import vanSaleModel from "../models/vanSaleModel.js";

/**
 * @desc To createSale
 * @route POST /api/sUsers/createSale
 * @access Public
 */

export const createSale = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    const {
      orgId,
      items,
      additionalChargesFromRedux,
      salesNumber,
      party,
      lastAmount
    } = req.body;

    const Secondary_user_id = req.sUserId;

    const NumberExistence = await checkForNumberExistence(
      req.query.vanSale === "true" ? vanSaleModel : salesModel,
      "salesNumber",
      salesNumber,
      req.body.orgId,
      session
    );

    if (NumberExistence) {
      await session.abortTransaction();
      session.endSession();
      return res.status(400).json({
        message: "Sales with the same number already exists",
      });
    }

    const secondaryUser = await secondaryUserModel
      .findById(Secondary_user_id)
      .session(session);
    const secondaryMobile = secondaryUser?.mobile;

    if (!secondaryUser) {
      await session.abortTransaction();
      session.endSession();
      return res
        .status(404)
        .json({ success: false, message: "Secondary user not found" });
    }

    const configuration = secondaryUser.configurations.find(
      (config) => config.organization.toString() === orgId
    );

    const updatedSalesNumber = await updateSalesNumber(
      orgId,
      req.query.vanSale,
      secondaryUser,
      configuration,
      session
    );

    const updatedItems = processSaleItems(items);
    await handleSaleStockUpdates(updatedItems, false, session); // Include session

    const updateAdditionalCharge = additionalChargesFromRedux.map((charge) => {
      const { value, taxPercentage } = charge;
      const taxAmt = parseFloat(
        ((parseFloat(value) * parseFloat(taxPercentage)) / 100).toFixed(2)
      );
      return { ...charge, taxAmt };
    });

    const result = await createSaleRecord(
      req,
      salesNumber,
      updatedItems,
      updateAdditionalCharge,
      session // Pass session
    );

    await updateTallyData(
      orgId,
      salesNumber,
      req.owner,
      party,
      lastAmount,
      secondaryMobile,
      session // Pass session if needed
    );

    await session.commitTransaction();
    res.status(201).json({
      success: true,
      data: result,
      message: "Sale created successfully",
    });
  } catch (error) {
    console.error("Error in createSale:", error);
    await session.abortTransaction();
    res.status(500).json({
      success: false,
      message: "An error occurred while creating the sale.",
      error: error.message,
    });
  } finally {
    session.endSession(); // Ensure session is ended
  }
};
