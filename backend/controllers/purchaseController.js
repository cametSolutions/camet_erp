import mongoose from "mongoose";
import { formatToLocalDate, } from "../helpers/helper.js";
import {
  createPurchaseRecord,
  handlePurchaseStockUpdates,
  updatePurchaseNumber,
  revertPurchaseStockUpdates,
  removeNewBatchCreatedByThisPurchase,
} from "../helpers/purchaseHelper.js";
import {
  processSaleItems as processPurchaseItems,
  revertSettlementData,
  saveSettlementData,
  updateOutstandingBalance,
  updateTallyData,
} from "../helpers/salesHelper.js";
import { checkForNumberExistence } from "../helpers/secondaryHelper.js";
import purchaseModel from "../models/purchaseModel.js";
import secondaryUserModel from "../models/secondaryUserModel.js";
import TallyData from "../models/TallyData.js";
import { generateVoucherNumber, getSeriesDetailsById } from "../helpers/voucherHelper.js";

// @desc create purchase
// route GET/api/sUsers/createPurchase
export const createPurchase = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  const purchase_id = new mongoose.Types.ObjectId();

  try {
    const {
      selectedGodownId,
      selectedGodownName,
      orgId,
      party,
      items,
      despatchDetails,
      additionalChargesFromRedux,
      finalAmount: lastAmount,
      selectedDate,
      voucherType,
      series_id
    } = req.body;

    const Secondary_user_id = req.sUserId;

    /// generate voucher number(purchase number)
    const { voucherNumber: purchaseNumber, usedSeriesNumber } =
      await generateVoucherNumber(orgId, voucherType, series_id, session);
    if (purchaseNumber) {
      req.body.purchaseNumber = purchaseNumber;
    }
    if (usedSeriesNumber) {
      req.body.usedSeriesNumber = usedSeriesNumber;
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

    await handlePurchaseStockUpdates(
      items,
      session,
      purchaseNumber,
      purchase_id
    );
    // const updatedItems = await processPurchaseItems(items);
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
      items,
      updateAdditionalCharge,
      session,
      purchase_id
    );

    ///save settlement data
    await saveSettlementData(
      party,
      orgId,
      "normal purchase",
      "purchase",
      purchaseNumber,
      result._id,
      lastAmount,
      result?.createdAt,
      result?.party?.partyName,
      session
    );

    await updateTallyData(
      orgId,
      purchaseNumber,
      result._id,
      req.owner,
      party,
      lastAmount,
      secondaryMobile,
      session, // Pass session if needed
      lastAmount,
      selectedDate,
      "purchase",
      "Cr"
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
      orgId,
      party,
      items,
      despatchDetails,
      additionalChargesFromRedux,
      finalAmount: lastAmount,
      selectedDate,
    } = req.body;

    let { purchaseNumber, series_id, usedSeriesNumber } = req.body;

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

    if (existingPurchase?.series_id?.toString() !== series_id?.toString()) {
      const { voucherNumber, usedSeriesNumber: newUsedSeriesNumber } =
        await generateVoucherNumber(
          orgId,
          existingPurchase.voucherType,
          series_id,
          session
        );

      purchaseNumber = voucherNumber; // Always update when series changes
      usedSeriesNumber = newUsedSeriesNumber; // Always update when series changes
    }

    // Revert existing stock updates
    await removeNewBatchCreatedByThisPurchase(existingPurchase, session);
    await revertPurchaseStockUpdates(existingPurchase.items, session);
    await handlePurchaseStockUpdates(
      items,
      session,
      existingPurchase?.purchaseNumber,
      existingPurchase?._id
    );

    // Update existing sale record
    const updateData = {
      selectedGodownId: "",
      selectedGodownName: "",
      serialNumber: existingPurchase.serialNumber, // Keep existing serial number
      cmp_id: orgId,
      partyAccount: party?.partyName,
      party,
      despatchDetails,
      items,
      additionalCharges: additionalChargesFromRedux,
      finalAmount: lastAmount,
      Primary_user_id: req.owner,
      Secondary_user_id: req.secondaryUserId,
      purchaseNumber: purchaseNumber,
      series_id,
      usedSeriesNumber,
      date: await formatToLocalDate(selectedDate, orgId, session),
      createdAt: existingPurchase.createdAt,
    };

    await purchaseModel.findByIdAndUpdate(purchaseId, updateData, {
      new: true,
      session,
    });

    /// edit settlement data

    /// revert it
    await revertSettlementData(
      existingPurchase?.party,
      orgId,
      existingPurchase?.purchaseNumber,
      existingPurchase?._id.toString(),
      session
    );

    /// recreate the settlement data

    ///save settlement data
    await saveSettlementData(
      party,
      orgId,
      "normal purchase",
      "purchase",
      updateData?.purchaseNumber,
      purchaseId,
      lastAmount,
      updateData?.createdAt,
      updateData?.party?.partyName,
      session
    );

    //// edit outstanding
    const secondaryUser = await secondaryUserModel
      .findById(req.sUserId)
      .session(session);
    const secondaryMobile = secondaryUser?.mobile;

    const outstandingResult = await updateOutstandingBalance({
      existingVoucher: existingPurchase,
      newVoucherData: {
        paymentSplittingData: {},
        lastAmount,
      },
      orgId,
      voucherNumber: purchaseNumber,
      party,
      session,
      createdBy: req.owner,
      transactionType: "purchase",
      secondaryMobile,
      selectedDate,
      classification: "Cr",
    });

    await session.commitTransaction();
    session.endSession();
    res.status(200).json({
      success: true,
      message: "purchase edited successfully",
      data: existingPurchase,
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
      await removeNewBatchCreatedByThisPurchase(existingPurchase, session);
      await revertPurchaseStockUpdates(existingPurchase.items, session);

      //// revert settlement data
      /// revert it
      await revertSettlementData(
        existingPurchase?.party,
        existingPurchase?.cmp_id,
        existingPurchase?.purchaseNumber,
        existingPurchase?._id.toString(),
        session
      );

      const cancelOutstanding = await TallyData.findOneAndUpdate(
        {
          bill_no: existingPurchase?.purchaseNumber,
          billId: purchaseId?.toString(),
        },
        {
          $set: {
            isCancelled: true,
          },
        }
      ).session(session);

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

// @desc toget the details of transaction or purchase
// route get/api/sUsers/getPurchaseDetails

export const getPurchaseDetails = async (req, res) => {
  const purchaseId = req.params.id;



  try {
    // First, get the sale details with populated references
    let purchaseDetails = await purchaseModel
      .findById(purchaseId)
      .populate({
        path: "party._id",
        select: "partyName", // get only the name or other fields as needed
      })
      .populate({
        path: "items._id",
        select: "product_name", // populate item details
      })
      .populate({
        path: "items.GodownList.godownMongoDbId",
        select: "godown", // populate godown name
      })
      .lean();

    const seriesDetails = await getSeriesDetailsById(
      purchaseDetails?.series_id,
      purchaseDetails?.cmp_id,
      purchaseDetails?.voucherType
    );

    seriesDetails.currentNumber = purchaseDetails?.usedSeriesNumber;

    if (seriesDetails) {
      purchaseDetails.seriesDetails = seriesDetails;
    }

    if (!purchaseDetails) {
      return res.status(404).json({ error: "Sale not found" });
    }

    // Update the party name if it exists and restore original ID structure
    if (purchaseDetails.party?._id?.partyName) {
      // Update the party name with the latest value
      purchaseDetails.partyAccount = purchaseDetails.party._id.partyName;
      purchaseDetails.party.partyName = purchaseDetails.party._id.partyName;

      // Restore ID to original format
      const partyId = purchaseDetails.party._id._id;
      purchaseDetails.party._id = partyId;
    }

    // Update product names in items array
    if (purchaseDetails.items && purchaseDetails.items.length > 0) {
      purchaseDetails.items.forEach((item) => {
        if (item._id?.product_name) {
          // Update the product name with the latest value
          item.product_name = item._id.product_name;

          // Restore ID to original format
          const itemId = item._id._id;
          item._id = itemId;
        }

        // Update godown names in GodownList array
        if (item.GodownList && item.GodownList.length > 0) {
          item.GodownList.forEach((godown) => {
            if (godown.godownMongoDbId?.godown) {
              // Update the godown name with the latest value
              godown.godown = godown.godownMongoDbId.godown;

              // Restore ID to original format
              const godownId = godown.godownMongoDbId._id;
              godown.godownMongoDbId = godownId;
            }
          });
        }
      });
    }

    // Find the outstanding for this sale
    const outstandingOfPurchase = await TallyData.findOne({
      billId: purchaseDetails._id.toString(),
      bill_no: purchaseDetails.salesNumber,
      cmp_id: purchaseDetails.cmp_id,
      Primary_user_id: purchaseDetails.Primary_user_id,
    });

    const isEditable =
      !outstandingOfPurchase || outstandingOfPurchase?.appliedPayments?.length === 0;
    purchaseDetails.isEditable = isEditable;

    res
      .status(200)
      .json({ message: "Purchase details fetched", data: purchaseDetails });
  } catch (error) {
    console.error("Error fetching purchase details:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

