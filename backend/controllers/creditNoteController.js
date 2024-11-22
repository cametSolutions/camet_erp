import { truncateToNDecimals } from "../helpers/helper.js";
import {
  createCreditNoteRecord,
  handleCreditNoteStockUpdates,
  updateCreditNoteNumber,
  revertCreditNoteStockUpdates,
  updateTallyData,
} from "../helpers/creditNoteHelper.js";
import {
  processSaleItems as processCreditNoteItems,
  updateOutstandingBalance,
} from "../helpers/salesHelper.js";

import { checkForNumberExistence } from "../helpers/secondaryHelper.js";
import creditNoteModel from "../models/creditNoteModel.js";
import secondaryUserModel from "../models/secondaryUserModel.js";
import mongoose from "mongoose";
import TallyData from "../models/TallyData.js";

// @desc create credit note
// route GET/api/sUsers/createCreditNote
export const createCreditNote = async (req, res) => {
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
      creditNoteNumber,
      selectedDate,
    } = req.body;

    const Secondary_user_id = req.sUserId;

    const NumberExistence = await checkForNumberExistence(
      creditNoteModel,
      "creditNoteNumber",
      creditNoteNumber,
      req.body.orgId,
      session
    );

    if (NumberExistence) {
      await session.abortTransaction();
      session.endSession();
      return res.status(400).json({
        message: "Credit Note with the same number already exists",
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

    await handleCreditNoteStockUpdates(items, session);
    const updatedItems = await processCreditNoteItems(items);
    const updatedCreditNoteNumber = await updateCreditNoteNumber(
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

    const result = await createCreditNoteRecord(
      req,
      creditNoteNumber,
      updatedItems,
      updateAdditionalCharge,
      session
    );

    if (
      party.accountGroup === "Sundry Debtors" ||
      party.accountGroup === "Sundry Creditors"
    ) {
      await updateTallyData(
        orgId,
        creditNoteNumber,
        result._id,
        req.owner,
        party,
        lastAmount,
        secondaryMobile,
        session // Pass session if needed
      );
    }

    await session.commitTransaction();
    session.endSession();

    res.status(201).json({
      success: true,
      data: result,
      message: "Credit Note created successfully",
    });
  } catch (error) {
    console.error(error);
    await session.abortTransaction();
    res.status(500).json({
      success: false,
      message: "An error occurred while creating the Credit",
      error: error.message,
    });
  } finally {
    await session.endSession();
  }
};

// @desc cancel credit note
// route GET/api/sUsers/cancelCreditNote

const MAX_RETRIES = 3;
const RETRY_DELAY = 1000; // 1 second

export const cancelCreditNote = async (req, res) => {
  let retryCount = 0;

  while (retryCount < MAX_RETRIES) {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      const creditNoteId = req.params.id;
      const existingCreditNote = await creditNoteModel
        .findById(creditNoteId)
        .session(session);

      if (!existingCreditNote) {
        await session.abortTransaction();
        session.endSession();
        return res
          .status(404)
          .json({ success: false, message: "Credit note not found" });
      }

      // Revert existing stock updates
      await revertCreditNoteStockUpdates(existingCreditNote.items, session);

      const cancelOutstanding = await TallyData.findOneAndUpdate(
        {
          bill_no: existingCreditNote?.creditNoteNumber,
          billId: creditNoteId?.toString(),
        },
        {
          $set: {
            isCancelled: true,
          },
        }
      ).session(session);

      existingCreditNote.isCancelled = true;
      const cancelledCreditNote = await existingCreditNote.save({ session });

      await session.commitTransaction();
      session.endSession();

      return res.status(200).json({
        success: true,
        message: "Credit note canceled successfully",
        data: cancelledCreditNote,
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

      console.error("Error canceling credit note:", error);
      return res.status(500).json({
        success: false,
        message: "An error occurred while canceling the credit note.",
        error: error.message,
      });
    }
  }

  return res.status(500).json({
    success: false,
    message: "Failed to cancel credit note after multiple retries",
  });
};

// @desc edit credit note
// route GET/api/sUsers/editCreditNote

export const editCreditNote = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    const creditNoteId = req.params.id; // Assuming saleId is passed in the URL parameters
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
    // Fetch existing Purchase
    const existingCreditNote = await creditNoteModel
      .findById(creditNoteId)
      .session(session);
    if (!existingCreditNote) {
      await session.abortTransaction();
      session.endSession();
      return res
        .status(404)
        .json({ success: false, message: "Purchase not found" });
    }

    // Revert existing stock updates
    await revertCreditNoteStockUpdates(existingCreditNote.items, session);
    // Process new sale items and update stock
    const updatedItems = await processCreditNoteItems(
      items,
      additionalChargesFromRedux
    );

    await handleCreditNoteStockUpdates(updatedItems, session);

    // Update existing sale record
    const updateData = {
      selectedGodownId: "",
      selectedGodownName: "",
      serialNumber: existingCreditNote.serialNumber, // Keep existing serial number
      cmp_id: orgId,
      partyAccount: party?.partyName,
      party,
      despatchDetails,
      items: updatedItems,
      additionalCharges: additionalChargesFromRedux,
      finalAmount: lastAmount,
      Primary_user_id: req.owner,
      Secondary_user_id: req.secondaryUserId,
      creditNoteNumber: creditNoteNumber,
      createdAt: new Date(selectedDate),
    };

    await creditNoteModel.findByIdAndUpdate(creditNoteId, updateData, {
      new: true,
      session,
    });

    //// edit outstanding

    // ///updating the existing outstanding record by calculating the difference in bill value

    const secondaryUser = await secondaryUserModel
      .findById(req.sUserId)
      .session(session);
    const secondaryMobile = secondaryUser?.mobile;

    

    const outstandingResult = await updateOutstandingBalance({
      existingVoucher: existingCreditNote,
      newVoucherData: {
        paymentSplittingData :{},
        lastAmount,
        
      },
      orgId,
      voucherNumber: creditNoteNumber,
      party,
      session,
      createdBy: req.owner,
      transactionType: "creditNote",
      secondaryMobile,
    });

    // const newBillValue = Number(lastAmount);
    // const oldBillValue = Number(existingCreditNote.finalAmount);
    // const diffBillValue = newBillValue - oldBillValue;

    // const matchedOutStanding = await TallyData.findOne({
    //   party_id: party?.party_master_id,
    //   cmp_id: orgId,
    //   bill_no: creditNoteNumber,
    //   billId: existingCreditNote._id.toString(),
    // }).session(session);

    // if (matchedOutStanding) {
    //   const newOutstanding =
    //     Number(matchedOutStanding?.bill_pending_amt) + diffBillValue;

    //   // console.log("newOutstanding",newOutstanding);

    //   const outStandingUpdateResult = await TallyData.updateOne(
    //     {
    //       party_id: party?.party_master_id,
    //       cmp_id: orgId,
    //       bill_no: creditNoteNumber,
    //       billId: existingCreditNote._id.toString(),
    //     },
    //     {
    //       $set: { bill_pending_amt: newOutstanding, bill_amount: newBillValue },
    //     },
    //     { new: true, session }
    //   );
    // }

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
