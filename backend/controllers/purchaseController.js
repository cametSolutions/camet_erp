import mongoose from "mongoose";
import { truncateToNDecimals } from "../helpers/helper.js";
import {
  createPurchaseRecord,
  handlePurchaseStockUpdates,
  updatePurchaseNumber,
  revertPurchaseStockUpdates,
  updateTallyData,
} from "../helpers/purchaseHelper.js";
import { processSaleItems as processPurchaseItems } from "../helpers/salesHelper.js";
import { checkForNumberExistence } from "../helpers/secondaryHelper.js";
import purchaseModel from "../models/purchaseModel.js";
import secondaryUserModel from "../models/secondaryUserModel.js";
import TallyData from "../models/TallyData.js";

// @desc create purchase
// route GET/api/sUsers/createPurchase
export const createPurchase = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    const {
      selectedGodownId,
      selectedGodownName,
      orgId,
      party,
      items,
      despatchDetails,
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
      req.body.orgId,
      session
    );

    if (NumberExistence) {
      await session.abortTransaction();
      session.endSession();
      return res.status(400).json({
        message: "Purchase  with the same number already exists",
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

    await handlePurchaseStockUpdates(items, session);
    const updatedItems = await processPurchaseItems(items);
    const updatedPurchaseNumber = await updatePurchaseNumber(
      orgId,
      secondaryUser,
      session
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
      updateAdditionalCharge,
      session
    );

    await updateTallyData(
      orgId,
      purchaseNumber,
      req.owner,
      party,
      lastAmount,
      secondaryMobile,
      session // Pass session if needed
    );

    await session.commitTransaction();
    session.endSession();

    res.status(201).json({
      success: true,
      data: result,
      message: "Purchase created successfully",
    });
  } catch (error) {
    console.error(error);
    await session.abortTransaction();

    res.status(500).json({
      success: false,
      message: "An error occurred while creating the purchase.",
      error: error.message,
    });
  } finally {
    await session.endSession();
  }
};

// @desc edit purchase
// route GET/api/sUsers/editPurchase

export const editPurchase = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    const purchaseId = req.params.id; // Assuming saleId is passed in the URL parameters
    const {
      selectedGodownId,
      selectedGodownName,
      orgId,
      party,
      items,
      despatchDetails,
      additionalChargesFromRedux,
      lastAmount,
      purchaseNumber,
      selectedDate,
    } = req.body;
    // Fetch existing Purchase
    const existingPurchase = await purchaseModel
      .findById(purchaseId)
      .session(session);
    if (!existingPurchase) {
      await session.abortTransaction();
      session.endSession();
      return res
        .status(404)
        .json({ success: false, message: "Purchase not found" });
    }

    // Revert existing stock updates
    await revertPurchaseStockUpdates(existingPurchase.items, session);
    // Process new sale items and update stock
    const updatedItems = processPurchaseItems(
      items,
      additionalChargesFromRedux
    );

    await handlePurchaseStockUpdates(updatedItems, session);

    // Update existing sale record
    const updateData = {
      selectedGodownId: "",
      selectedGodownName: "",
      serialNumber: existingPurchase.serialNumber, // Keep existing serial number
      cmp_id: orgId,
      partyAccount: party?.partyName,
      party,
      despatchDetails,
      items: updatedItems,
      additionalCharges: additionalChargesFromRedux,
      finalAmount: lastAmount,
      Primary_user_id: req.owner,
      Secondary_user_id: req.secondaryUserId,
      purchaseNumber: purchaseNumber,
      createdAt: new Date(selectedDate),
    };

    await purchaseModel.findByIdAndUpdate(purchaseId, updateData, {
      new: true,
      session,
    });

    //// edit outstanding

    const newBillValue = Number(lastAmount);
    const oldBillValue = Number(existingPurchase.finalAmount);
    const diffBillValue = newBillValue - oldBillValue;

    const matchedOutStanding = await TallyData.findOne({
      party_id: party?.party_master_id,
      cmp_id: orgId,
      bill_no: purchaseNumber,
    }).session(session);

    if (matchedOutStanding) {
      const newOutstanding =
        Number(matchedOutStanding?.bill_pending_amt) + diffBillValue;

      // console.log("newOutstanding",newOutstanding);

      const outStandingUpdateResult = await TallyData.updateOne(
        {
          party_id: party?.party_master_id,
          cmp_id: orgId,
          bill_no: purchaseNumber,
        },
        {
          $set: { bill_pending_amt: newOutstanding, bill_amount: newBillValue },
        },
        { new: true, session }
      );
    }
    await session.commitTransaction();
    session.endSession();
    res.status(200).json({
      success: true,
      message: "purchase edited successfully",
    });
  } catch (error) {
    await session.abortTransaction();

    console.error(error);
    res.status(500).json({
      success: false,
      message: "An error occurred while editing the sale.",
      error: error.message,
    });
  } finally {
    await session.endSession();
  }
};

// @desc cancel purchase
// route GET/api/sUsers/cancelpurchase

const MAX_RETRIES = 3;
const RETRY_DELAY = 1000; // 1 second

export const cancelPurchase = async (req, res) => {
  let retryCount = 0;

  while (retryCount < MAX_RETRIES) {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      const purchaseId = req.params.id;
      const existingPurchase = await purchaseModel
        .findById(purchaseId)
        .session(session);

      if (!existingPurchase) {
        await session.abortTransaction();
        session.endSession();
        return res
          .status(404)
          .json({ success: false, message: "Purchase not found" });
      }

      // Revert existing stock updates
      await revertPurchaseStockUpdates(existingPurchase.items, session);

      existingPurchase.isCancelled = true;
      const cancelledPurchase = await existingPurchase.save({ session });

   
      await session.commitTransaction();
      session.endSession();

      return res.status(200).json({
        success: true,
        message: "Purchase canceled successfully",
        data: cancelledPurchase,
      });
    } catch (error) {
      await session.abortTransaction();
      session.endSession();

      if (
        error.errorLabels &&
        error.errorLabels.includes("TransientTransactionError")
      ) {
        retryCount++;
        if (retryCount < MAX_RETRIES) {
          console.log(
            `Retrying transaction attempt ${retryCount + 1} of ${MAX_RETRIES}`
          );
          await new Promise((resolve) => setTimeout(resolve, RETRY_DELAY));
          continue;
        }
      }

      console.error("Error canceling purchase:", error);
      return res.status(500).json({
        success: false,
        message: "An error occurred while canceling the purchase.",
        error: error.message,
      });
    }
  }

  return res.status(500).json({
    success: false,
    message: "Failed to cancel purchase after multiple retries",
  });
};
