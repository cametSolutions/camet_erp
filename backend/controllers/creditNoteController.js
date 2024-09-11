import { truncateToNDecimals } from "../helpers/helper.js";
import {
  createCreditNoteRecord,
  handleCreditNoteStockUpdates,
  updateCreditNoteNumber,
  revertCreditNoteStockUpdates
} from "../helpers/creditNoteHelper.js";
import { processSaleItems as processCreditNoteItems } from "../helpers/salesHelper.js";

import { checkForNumberExistence } from "../helpers/secondaryHelper.js";
import creditNoteModel from "../models/creditNoteModel.js";
import secondaryUserModel from "../models/secondaryUserModel.js";

// @desc create credit note
// route GET/api/sUsers/createCreditNote
export const createCreditNote = async (req, res) => {
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
      creditNoteNumber,
      selectedDate,
    } = req.body;

    const Secondary_user_id = req.sUserId;

    const NumberExistence = await checkForNumberExistence(
      creditNoteModel,
      "creditNoteNumber",
      creditNoteNumber,
      req.body.orgId
    );

    if (NumberExistence) {
      return res.status(400).json({
        message: "Credit Note with the same number already exists",
      });
    }

    const secondaryUser = await secondaryUserModel.findById(Secondary_user_id);
    const secondaryMobile = secondaryUser?.mobile;

    if (!secondaryUser) {
      return res
        .status(404)
        .json({ success: false, message: "Secondary user not found" });
    }

    await handleCreditNoteStockUpdates(items);
    const updatedItems = await   processCreditNoteItems(items);
    const updatedCreditNoteNumber = await updateCreditNoteNumber(
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

    const result = await createCreditNoteRecord(
      req,
      creditNoteNumber,
      updatedItems,
      updateAdditionalCharge
    );

    res.status(201).json({
      success: true,
      data: result,
      message: "Credit Note created successfully",
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

// @desc cancel credit note
// route GET/api/sUsers/cancelCreditNote

export const cancelCreditNote = async (req, res) => {
  try {
  const creditNoteId = req.params.id; // Assuming saleId is passed in the URL parameters
  const existingCreditNote = await creditNoteModel.findById(creditNoteId);
  if (!existingCreditNote) {
    return res
      .status(404)
      .json({ success: false, message: "Purchase not found" });
  }

  // Revert existing stock updates
  await revertCreditNoteStockUpdates(existingCreditNote.items);

  // flagging is cancelled true

  existingCreditNote.isCancelled = true;

  const cancelledPurchase=await existingCreditNote.save();

  res.status(200).json({
    success: true,
    message: "purchase canceled successfully",
    data:cancelledPurchase
  });
} catch (error) {
  console.error(error);
  res.status(500).json({
    success: false,
    message: "An error occurred while editing the sale.",
    error: error.message,
  });
}
};

