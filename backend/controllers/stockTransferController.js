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
import {
  generateVoucherNumber,
  getSeriesDetailsById,
} from "../helpers/voucherHelper.js";

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
      note,
      series_id,
      voucherType,
    } = req.body;

    const id = req.sUserId;
    const secondaryUser = await SecondaryUser.findById(id).session(session);

    if (!secondaryUser) {
      await session.abortTransaction();
      session.endSession();
      return res.status(404).json({
        error: "Secondary user not found",
      });
    }

    /// generate voucher number(sales number)
    const { voucherNumber: stockTransferNumber, usedSeriesNumber } =
      await generateVoucherNumber(orgId, voucherType, series_id, session);
    if (stockTransferNumber) {
      req.body.stockTransferNumber = stockTransferNumber;
    }
    if (usedSeriesNumber) {
      req.body.usedSeriesNumber = usedSeriesNumber;
    }

    const transferData = {
      stockTransferNumber,
      selectedDate,
      orgId,
      stockTransferToGodown,
      items,
      lastAmount,
      req,
      session, // Pass session to all database operations
      note,

    };

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
      selectedDate,
      orgId,
      stockTransferToGodown, // Fixing the variable name to match other functions
      items,
      finalAmount: lastAmount,
      note,
    } = req.body;

    let { stockTransferNumber, series_id, usedSeriesNumber } = req.body;

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

    if (existingTransfer?.series_id?.toString() !== series_id?.toString()) {
      const { voucherNumber, usedSeriesNumber: newUsedSeriesNumber } =
        await generateVoucherNumber(
          orgId,
          existingTransfer.voucherType,
          series_id,
          session
        );

      stockTransferNumber = voucherNumber; // Always update when series changes
      usedSeriesNumber = newUsedSeriesNumber; // Always update when series changes
    }else{
      usedSeriesNumber = existingTransfer.usedSeriesNumber
      stockTransferNumber = existingTransfer.stockTransferNumber
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
console.log("line 192 stocktranfer")
    // Update the existing stock transfer document with new data
    const updateData = {
      date: await formatToLocalDate(selectedDate, orgId),
      stockTransferNumber: stockTransferNumber,
      series_id,
      usedSeriesNumber,
      stockTransferToGodown: stockTransferToGodown,
      items: items,
      finalAmount: lastAmount,
      note: note,
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

/**
 *  @desc To cancel stock transfer
 * @route POST /api/sUsers/cancelstockTransfer
 * @access Public
 */

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

/**
 *  @desc To get stock transfer details
 * @route GET /api/sUsers/getStockTransferDetails
 * @access Public
 */

// @desc to  get stock transfer details
// route get/api/sUsers/getStockTransferDetails;
// @desc to get stock transfer details
// route get/api/sUsers/getStockTransferDetails;
export const getStockTransferDetails = async (req, res) => {
  try {
    const id = req.params.id;

    const details = await stockTransferModel
      .findById(id)
      .populate({
        path: "stockTransferToGodown._id",
        select: "godown godown_id defaultGodown",
      })
      .populate({
        path: "items._id",
        select: "product_name balance_stock",
      })
      .populate({
        path: "items.GodownList.godownMongoDbId",
        select: "godown godown_id defaultGodown",
      })
      .lean();

    if (!details) {
      return res
        .status(404)
        .json({ error: "Stock Transfer Details not found" });
    }

    // Get series details
    const seriesDetails = await getSeriesDetailsById(
      details?.series_id,
      details?.cmp_id,
      details?.voucherType
    );

    seriesDetails.currentNumber = details?.usedSeriesNumber;

    if (seriesDetails) {
      details.seriesDetails = seriesDetails;
    }

    // Populate stockTransferToGodown details and restore _id
    if (details.stockTransferToGodown?._id) {
      const godownData = details.stockTransferToGodown._id;
      if (godownData.godown) {
        details.stockTransferToGodown.godown = godownData.godown;
        details.stockTransferToGodown.godown_id = godownData.godown_id;
        details.stockTransferToGodown.defaultGodown = godownData.defaultGodown;
        details.stockTransferToGodown._id = godownData._id;
      }
    }

    // Populate item and godown details
    if (details.items && details.items.length > 0) {
      details.items.forEach((item) => {
        // Populate item details
        if (item._id?.product_name) {
          item.product_name = item._id.product_name;
          item.balance_stock = item._id.balance_stock;
          item._id = item._id._id;
        }

        // Populate godown details in GodownList
        if (item.GodownList && item.GodownList.length > 0) {
          item.GodownList.forEach((godown) => {
            if (godown.godownMongoDbId?.godown) {
              godown.godown = godown.godownMongoDbId.godown;
              godown.godown_id = godown.godownMongoDbId.godown_id;
              godown.defaultGodown = godown.godownMongoDbId.defaultGodown;
              godown.godownMongoDbId = godown.godownMongoDbId._id;
            }
          });
        }
      });
    }

    res
      .status(200)
      .json({ message: "Stock Transfer Details fetched", data: details });
  } catch (error) {
    console.error("Error in getting StockTransferDetails:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};
