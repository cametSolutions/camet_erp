import mongoose from "mongoose";
import { checkForNumberExistence, getNewSerialNumber } from "../helpers/secondaryHelper.js";
import { handleStockTransfer, increaseStockTransferNumber, processStockTransfer } from "../helpers/stockTranferHelper.js";
import SecondaryUser from "../models/secondaryUserModel.js";
import stockTransferModel from "../models/stockTransferModel.js";

/**
 * @desc To create stock transfer
 * @route POST /api/sUsers/createStockTransfer
 * @access Public
 */

export const createStockTransfer = async (req, res) => {
    const session = await mongoose.startSession();
    session.startTransaction();
  
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
        session, // Pass session to helper functions
      };
  
      const id = req.sUserId;
      const secondaryUser = await SecondaryUser.findById(id).session(session);
  
      if (!secondaryUser) {
        await session.abortTransaction();
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
        await session.abortTransaction();
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
      await increaseStockTransferNumber(secondaryUser, orgId, session);
  
      await session.commitTransaction();
  
      res.status(200).json({
        message: "Stock transfer completed successfully",
        data: createNewStockTransfer,
      });
    } catch (error) {
      await session.abortTransaction();
      console.error("Error in stock transfer:", error);
      res.status(500).json({
        error: "Internal Server Error",
        details: error.message,
      });
    } finally {
      session.endSession();
    }
  };