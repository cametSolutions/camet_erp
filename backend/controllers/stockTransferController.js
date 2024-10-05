import mongoose from "mongoose";
import {
  checkForNumberExistence,
  getNewSerialNumber,
} from "../helpers/secondaryHelper.js";
import {
  handleStockTransfer,
  increaseStockTransferNumber,
  processStockTransfer,
  revertStockTransfer,
} from "../helpers/stockTranferHelper.js";
import SecondaryUser from "../models/secondaryUserModel.js";
import stockTransferModel from "../models/stockTransferModel.js";

////////// facing many issues while adding session and transaction in stock transfer so keeping it without session and transaction  for further updation ///////////

/**
 * @desc To create stock transfer
 * @route POST /api/sUsers/createStockTransfer
 * @access Public
 */

export const createStockTransfer = async (req, res) => {
  try {
    const {
      selectedDate,
      orgId,
      selectedGodown,
      selectedGodownId,
      items,
      lastAmount,
      stockTransferNumber,
    } = req.body;

    const transferData = {
      stockTransferNumber,
      selectedDate,
      orgId,
      selectedGodown,
      selectedGodownId,
      items,
      lastAmount,
      req,
    };

    const id = req.sUserId;
    const secondaryUser = await SecondaryUser.findById(id);

    if (!secondaryUser) {
      return res.status(404).json({
        error: "Secondary user not found",
      });
    }

    const NumberExistence = await checkForNumberExistence(
      stockTransferModel,
      "stockTransferNumber",
      stockTransferNumber,
      orgId
    );

    if (NumberExistence) {
      return res.status(400).json({
        message: "Stock Transfer with the same number already exists",
      });
    }

    const addSerialNumber = await getNewSerialNumber(
      stockTransferModel,
      "serialNumber"
    );
    if (addSerialNumber) {
      transferData.serialNumber = addSerialNumber;
    }

    const updatedProducts = await processStockTransfer(transferData);
    const createNewStockTransfer = await handleStockTransfer(transferData);
    const increaseSTNumber = await increaseStockTransferNumber(
      secondaryUser,
      orgId
    );

    res.status(200).json({
      message: "Stock transfer completed successfully",
      data: createNewStockTransfer,
    });
  } catch (error) {
    console.error("Error in stock transfer:", error);
    res.status(500).json({
      error: "Internal Server Error",
      details: error.message,
    });
  }
};

/**
 * @desc To edit stock transfer
 * @route POST /api/sUsers/editStockTransfer
 * @access Public
 */

export const editStockTransfer = async (req, res) => {
  try {
    const transferId = req.params.id;
    const {
      // ID of the stock transfer to be edited
      selectedDate,
      orgId,
      selectedGodown,
      selectedGodownId,
      items,
      lastAmount,
    } = req.body;

    // Find the existing stock transfer document by ID
    const existingTransfer = await stockTransferModel.findById(transferId);
    if (!existingTransfer) {
      return res.status(404).json({
        error: "Stock transfer not found",
      });
    }

    // Revert the stock levels affected by the existing transfer
    await revertStockTransfer(existingTransfer);
    // Process the stock transfer with the new data
    const transferData = {
      selectedDate,
      orgId,
      selectedGodown,
      selectedGodownId,
      items,
      lastAmount,
      req,
    };

    const updatedProducts = await processStockTransfer(transferData);

    // Update the existing stock transfer document with new data
    existingTransfer.selectedDate = selectedDate;
    existingTransfer.orgId = orgId;
    existingTransfer.selectedGodown = selectedGodown;
    existingTransfer.selectedGodownId = selectedGodownId;
    existingTransfer.items = items;
    existingTransfer.lastAmount = lastAmount;
    existingTransfer.updatedAt = new Date();

    await stockTransferModel.findByIdAndUpdate(
      existingTransfer._id,
      existingTransfer
    );

    res.status(200).json({
      message: "Stock transfer updated successfully",
      data: existingTransfer,
      updatedProducts,
    });
  } catch (error) {
    console.error("Error in editing stock transfer:", error);
    res.status(500).json({
      error: "Internal Server Error",
      details: error.message,
    });
  }
};

export const cancelStockTransfer = async (req, res) => {
  const transferId = req.params.id;

  try {
    // Find the existing stock transfer document by ID
    const existingTransfer = await stockTransferModel.findById(transferId);
    if (!existingTransfer) {
      return res.status(404).json({
        error: "Stock transfer not found",
      });
    }

    const result = await revertStockTransfer(existingTransfer);
    existingTransfer.isCancelled = true;
    const updateTransfer = await stockTransferModel.findByIdAndUpdate(
      existingTransfer._id,
      existingTransfer,
      { new: true }
    );

    res.status(200).json({
      message: "Stock transfer cancelled successfully",
      data: existingTransfer,
      updatedProducts: result,
    });
  } catch (error) {
    console.error("Error in canceling stock transfer:", error);
    res.status(500).json({
      error: "Internal Server Error",
      details: error.message,
    });
  }
};
