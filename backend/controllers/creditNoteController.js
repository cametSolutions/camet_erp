import { truncateToNDecimals } from "../helpers/helper.js";
import {
  createCreditNoteRecord,
  handleCreditNoteStockUpdates,
  updateCreditNoteNumber
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
