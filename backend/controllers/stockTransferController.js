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
import { formatToLocalDate } from "../helpers/stockTransferHelper.js";

////////// facing many issues while adding session and transaction in stock transfer so keeping it without session and transaction  for further updation ///////////

/**
 * @desc To create stock transfer
 * @route POST /api/sUsers/createStockTransfer
 * @access Public
 */

export const createStockTransfer = async (req, res) => {
  // Start a MongoDB session for transactions
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const {
      selectedDate,
      orgId,
      stockTransferToGodown,
      items,
      finalAmount: lastAmount,
      stockTransferNumber,
    } = req.body;

    const transferData = {
      stockTransferNumber,
      selectedDate,
      orgId,
      stockTransferToGodown,
      items,
      lastAmount,
      req,
      session, // Pass session to all database operations
    };

    const id = req.sUserId;
    const secondaryUser = await SecondaryUser.findById(id).session(session);

    if (!secondaryUser) {
      await session.abortTransaction();
      session.endSession();
      return res.status(404).json({
        error: "Secondary user not found",
      });
    }

    const NumberExistence = await checkForNumberExistence(
      stockTransferModel,
      "stockTransferNumber",
      stockTransferNumber,
      orgId,
      session
    );

    if (NumberExistence) {
      await session.abortTransaction();
      session.endSession();
      return res.status(400).json({
        message: "Stock Transfer with the same number already exists",
      });
    }

    const addSerialNumber = await getNewSerialNumber(
      stockTransferModel,
      "serialNumber",
      session
    );
    if (addSerialNumber) {
      transferData.serialNumber = addSerialNumber;
    }

    // Execute all database operations within the transaction
    const updatedProducts = await processStockTransfer(transferData);
    const createNewStockTransfer = await handleStockTransfer(transferData);
    await increaseStockTransferNumber(secondaryUser, orgId, session);

    // If everything succeeded, commit the transaction
    await session.commitTransaction();
    session.endSession();

    res.status(200).json({
      message: "Stock transfer completed successfully",
      data: createNewStockTransfer,
    });
  } catch (error) {
    // If any operation fails, abort the transaction and roll back all changes
    await session.abortTransaction();
    session.endSession();

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
  // Start a MongoDB session for transactions
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const transferId = req.params.id;
    const {
      stockTransferNumber,
      selectedDate,
      orgId,
      stockTransferToGodown, // Fixing the variable name to match other functions
      items,
      finalAmount: lastAmount,
    } = req.body;

    // Find the existing stock transfer document by ID with session
    const existingTransfer = await stockTransferModel
      .findById(transferId)
      .session(session);
    if (!existingTransfer) {
      await session.abortTransaction();
      session.endSession();
      return res.status(404).json({
        error: "Stock transfer not found",
      });
    }

    // Check if transfer is already cancelled
    if (existingTransfer.isCancelled) {
      await session.abortTransaction();
      session.endSession();
      return res.status(400).json({
        error: "Cannot edit a cancelled stock transfer",
      });
    }

    // Revert the stock levels affected by the existing transfer using session
    await revertStockTransfer(existingTransfer, session);

    // Process the stock transfer with the new data
    const transferData = {
      stockTransferNumber,
      selectedDate,
      orgId,
      stockTransferToGodown,
      items,
      lastAmount,
      req,
      session, // Pass session to all database operations
    };

    // Process the updated stock transfer
    await processStockTransfer(transferData);

    // Update the existing stock transfer document with new data
    const updateData = {
      date: await formatToLocalDate(selectedDate, orgId),
      stockTransferNumber: existingTransfer.stockTransferNumber, // Keep the same number
      stockTransferToGodown: stockTransferToGodown,
      items: items,
      finalAmount: lastAmount,
      updatedAt: new Date(),
      updatedBy: req.sUserId, // Track who made the update
    };

    // Update the document with session
    const updatedTransfer = await stockTransferModel.findByIdAndUpdate(
      existingTransfer._id,
      updateData,
      { new: true, session }
    );

    // Commit the transaction if everything succeeded
    await session.commitTransaction();
    session.endSession();

    res.status(200).json({
      message: "Stock transfer updated successfully",
      data: updatedTransfer,
    });
  } catch (error) {
    // If any operation fails, abort the transaction
    await session.abortTransaction();
    session.endSession();

    console.error("Error in editing stock transfer:", error);
    res.status(500).json({
      error: "Internal Server Error",
      details: error.message,
    });
  }
};

export const cancelStockTransfer = async (req, res) => {
  // Start a MongoDB session for transactions
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const transferId = req.params.id;

    // Find the existing stock transfer document by ID with session
    const existingTransfer = await stockTransferModel
      .findById(transferId)
      .session(session);
    if (!existingTransfer) {
      await session.abortTransaction();
      session.endSession();
      return res.status(404).json({
        error: "Stock transfer not found",
      });
    }

    // Check if it's already cancelled
    if (existingTransfer.isCancelled) {
      await session.abortTransaction();
      session.endSession();
      return res.status(400).json({
        error: "Stock transfer is already cancelled",
      });
    }

    // Revert stock changes using the session
    await revertStockTransfer(existingTransfer, session);

    // Mark transfer as cancelled
    existingTransfer.isCancelled = true;

    // Update the transfer document with session
    const updateTransfer = await stockTransferModel.findByIdAndUpdate(
      existingTransfer._id,
      existingTransfer,
      { new: true, session }
    );

    // Commit the transaction if everything succeeded
    await session.commitTransaction();
    session.endSession();

    res.status(200).json({
      message: "Stock transfer cancelled successfully",
      data: updateTransfer,
    });
  } catch (error) {
    // If any operation fails, abort the transaction
    await session.abortTransaction();
    session.endSession();

    console.error("Error in canceling stock transfer:", error);
    res.status(500).json({
      error: "Internal Server Error",
      details: error.message,
    });
  }
};
