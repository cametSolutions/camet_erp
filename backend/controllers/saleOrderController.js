import { checkForNumberExistence } from "../helpers/secondaryHelper.js";
import {
  calculateAdditionalCharges,
  fetchLastInvoice,
  revertStockChanges,
  updateItemStockAndCalculatePrice,
  updateSecondaryUserConfiguration,
} from "../helpers/saleOrderHelper.js";
import invoiceModel from "../models/invoiceModel.js";
import secondaryUserModel from "../models/secondaryUserModel.js";
import mongoose from "mongoose";

/**
 * @desc  create sale order
 * @route POST/api/sUsers/createInvoice
 * @access Public
 */

export const createInvoice = async (req, res) => {
  const Secondary_user_id = req.sUserId;
  const owner = req.owner.toString();
  const maxRetries = 5; // Maximum number of retries
  let attempts = 0;

  while (attempts < maxRetries) {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      const {
        orgId,
        party,
        items,
        priceLevelFromRedux,
        additionalChargesFromRedux,
        lastAmount,
        orderNumber,
        despatchDetails,
        selectedDate,
      } = req.body;

      const numberExistence = await checkForNumberExistence(
        invoiceModel,
        "orderNumber",
        orderNumber,
        orgId,
        session
      );

      if (numberExistence) {
        await session.abortTransaction();
        session.endSession();
        return res.status(400).json({ message: "SaleOrder with the same number already exists" });
      }

      const newSerialNumber = await fetchLastInvoice(invoiceModel, session);

      const updatedItems = await Promise.all(
        items.map((item) =>
          updateItemStockAndCalculatePrice(item, priceLevelFromRedux, session)
        )
      );

      const updateAdditionalCharge =
        additionalChargesFromRedux.length > 0
          ? calculateAdditionalCharges(additionalChargesFromRedux)
          : [];

      const invoice = new invoiceModel({
        serialNumber: newSerialNumber,
        cmp_id: orgId,
        partyAccount: party?.partyName,
        party,
        items: updatedItems,
        priceLevel: priceLevelFromRedux,
        additionalCharges: updateAdditionalCharge,
        finalAmount: lastAmount,
        Primary_user_id: owner,
        Secondary_user_id,
        orderNumber,
        despatchDetails,
        createdAt: selectedDate,
      });

      const result = await invoice.save({ session });

      const secondaryUser = await secondaryUserModel
        .findById(Secondary_user_id)
        .session(session);

      if (!secondaryUser) {
        await session.abortTransaction();
        session.endSession();
        return res.status(404).json({ success: false, message: "Secondary user not found" });
      }

      await updateSecondaryUserConfiguration(secondaryUser, orgId, session);

      await session.commitTransaction();
      session.endSession();

      return res.status(200).json({
        success: true,
        message: "Sale order created successfully",
        data: result,
      });
    } catch (error) {
      await session.abortTransaction();
      session.endSession();
      if (error.code === 112) { // Write conflict error code
        attempts++;
        console.warn(`Retrying transaction, attempt ${attempts}...`);
        continue; // Retry the transaction
      }
      console.error(error);
      return res.status(500).json({
        success: false,
        message: "Internal server error, try again!",
        error: error.message,
      });
    }
  }

  return res.status(500).json({ 
    success: false, 
    message: "Transaction failed after multiple attempts" 
  });
};

/**
 * @desc  edit sale order
 * @route POST/api/sUsers/editInvoice
 * @access Public
 */
export const editInvoice = async (req, res) => {
  const session = await mongoose.startSession();
  let retries = 3; // Retry up to 3 times

  while (retries > 0) {
    try {
      session.startTransaction();

      const Secondary_user_id = req.sUserId;
      const Primary_user_id = req.owner;
      const invoiceId = req.params.id;

      const {
        orgId,
        party,
        items,
        priceLevelFromRedux,
        additionalChargesFromRedux,
        lastAmount,
        orderNumber,
        despatchDetails,
        selectedDate,
      } = req.body;

      // Fetch the existing invoice
      const existingInvoice = await invoiceModel
        .findById(invoiceId)
        .session(session);
      if (!existingInvoice) {
        await session.abortTransaction();
        session.endSession();
        return res
          .status(404)
          .json({ success: false, message: "Invoice not found" });
      }

      // Revert stock changes based on the original invoice
      await revertStockChanges(existingInvoice, session);

      // Calculate the updated item values (price, discount, etc.)
      const updatedItems = await Promise.all(
        items.map((item) =>
          updateItemStockAndCalculatePrice(item, priceLevelFromRedux, session)
        )
      );

      const updateAdditionalCharge =
        additionalChargesFromRedux.length > 0
          ? calculateAdditionalCharges(additionalChargesFromRedux)
          : [];

      // Update the invoice with new data
      const updatedInvoice = await invoiceModel.findByIdAndUpdate(
        invoiceId,
        {
          $set: {
            cmp_id: orgId,
            party,
            items: updatedItems,
            priceLevel: priceLevelFromRedux,
            additionalCharges: updateAdditionalCharge, // Use calculated charges
            finalAmount: lastAmount,
            Primary_user_id,
            Secondary_user_id,
            orderNumber,
            despatchDetails,
            createdAt: new Date(selectedDate),
          },
        },
        { new: true, session, timestamps: false }
      );

      await session.commitTransaction();
      session.endSession();

      return res.status(200).json({
        success: true,
        message: "Invoice updated successfully",
        data: updatedInvoice,
      });
    } catch (error) {
      // Handle write conflict or transient transaction errors
      if (
        error.codeName === "WriteConflict" ||
        error.errorLabels.has("TransientTransactionError")
      ) {
        retries -= 1;
        console.log(`Retrying transaction, remaining retries: ${retries}`);
        await session.abortTransaction(); // Ensure we abort the session before retrying
        if (retries === 0) {
          console.error("Transaction failed after multiple retries");
          return res.status(500).json({
            success: false,
            message: "Transaction failed after multiple retries.",
            error: error.message,
          });
        }
      } else {
        await session.abortTransaction();
        session.endSession();
        console.error(error);
        return res.status(500).json({
          success: false,
          message: "Internal server error, try again!",
          error: error.message,
        });
      }
    }
  }
};

/**
 * @desc  cancel sale order
 * @route POST/api/sUsers/cancelSalesOrder
 * @access Public
 */

export const cancelSalesOrder = async (req, res) => {
  const invoiceId = req.params.id;
  const secondary_user_id = req.sUserId;
  const owner = req.owner.toString();

  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    // Find the invoice by ID within the session
    const invoice = await invoiceModel.findById(invoiceId).session(session);
    if (!invoice) {
      await session.abortTransaction();
      session.endSession();
      return res.status(404).json({
        message: "Invoice not found",
      });
    }

    // Check if the invoice is already cancelled
    if (invoice?.isCancelled) {
      await session.abortTransaction();
      session.endSession();
      return res.status(400).json({
        success: false,
        message: "Invoice is already cancelled",
      });
    }

    // Revert stock changes based on the original invoice
    await revertStockChanges(invoice, session);

    // Mark the invoice as cancelled
    invoice.isCancelled = true;

    // Update the invoice in the database
    const result = await invoiceModel.findByIdAndUpdate(invoiceId, invoice, {
      new: true,
      session,
    });

    // Commit the transaction if everything is successful
    await session.commitTransaction();
    session.endSession();

    return res.status(200).json({
      message: "Invoice cancelled successfully",
      data: result,
    });
  } catch (error) {
    // Abort the transaction if any error occurs
    await session.abortTransaction();
    session.endSession();
    console.error(error);
    return res.status(500).json({
      success: false,
      message: "Internal server error, try again!",
      error: error.message,
    });
  }
};
