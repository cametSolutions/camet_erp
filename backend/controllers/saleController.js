import mongoose from "mongoose";
import {
  createSaleRecord,
  handleSaleStockUpdates,
  processSaleItems,
  updateSalesNumber,
  updateTallyData,
  checkForNumberExistence,
  revertSaleStockUpdates,
} from "../helpers/salesHelper.js";
import secondaryUserModel from "../models/secondaryUserModel.js";
import salesModel from "../models/salesModel.js";
import vanSaleModel from "../models/vanSaleModel.js";
import TallyData from "../models/TallyData.js";

/**
 * @desc To createSale
 * @route POST /api/sUsers/createSale
 * @access Public
 */

export const createSale = async (req, res) => {

  
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    const {
      orgId,
      items,
      additionalChargesFromRedux,
      salesNumber,
      party,
      lastAmount
    } = req.body;

    const Secondary_user_id = req.sUserId;

    const NumberExistence = await checkForNumberExistence(
      req.query.vanSale === "true" ? vanSaleModel : salesModel,
      "salesNumber",
      salesNumber,
      req.body.orgId,
      session
    );

    if (NumberExistence) {
      await session.abortTransaction();
      session.endSession();
      return res.status(400).json({
        message: "Sales with the same number already exists",
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

    const configuration = secondaryUser.configurations.find(
      (config) => config.organization.toString() === orgId
    );

    const updatedSalesNumber = await updateSalesNumber(
      orgId,
      req.query.vanSale,
      secondaryUser,
      configuration,
      session
    );

    const updatedItems = processSaleItems(items);
    await handleSaleStockUpdates(updatedItems, false, session); // Include session

    const updateAdditionalCharge = additionalChargesFromRedux.map((charge) => {
      const { value, taxPercentage } = charge;
      const taxAmt = parseFloat(
        ((parseFloat(value) * parseFloat(taxPercentage)) / 100).toFixed(2)
      );
      return { ...charge, taxAmt };
    });

    const result = await createSaleRecord(
      req,
      salesNumber,
      updatedItems,
      updateAdditionalCharge,
      session // Pass session
    );

    await updateTallyData(
      orgId,
      salesNumber,
      req.owner,
      party,
      lastAmount,
      secondaryMobile,
      session // Pass session if needed
    );

    await session.commitTransaction();
    res.status(201).json({
      success: true,
      data: result,
      message: "Sale created successfully",
    });
  } catch (error) {
    console.error("Error in createSale:", error);
    await session.abortTransaction();
    res.status(500).json({
      success: false,
      message: "An error occurred while creating the sale.",
      error: error.message,
    });
  } finally {
    session.endSession(); // Ensure session is ended
  }
};

/**
 * @desc To editSale
 * @route POST /api/sUsers/editSale
 * @access Public
 */

const MAX_RETRIES = 3;
const RETRY_DELAY_MS = 1000;

export const editSale = async (req, res) => {
  const saleId = req.params.id;
  const {
    selectedGodownId,
    selectedGodownName,
    orgId,
    party,
    items,
    despatchDetails,
    priceLevelFromRedux,
    additionalChargesFromRedux,
    lastAmount,
    salesNumber,
    selectedDate,
  } = req.body;

  const vanSaleQuery = req.query.vanSale;
  const isVanSale = vanSaleQuery === "true";
  const model = isVanSale ? vanSaleModel : salesModel;

  let retries = 0;
  while (retries < MAX_RETRIES) {
    const session = await mongoose.startSession();
    try {
      session.startTransaction();

      const existingSale = await model.findById(saleId).session(session);
      if (!existingSale) {
        await session.abortTransaction();
        session.endSession();
        return res.status(404).json({ success: false, message: "Sale not found" });
      }

      await revertSaleStockUpdates(existingSale.items, session);

      const updatedItems = processSaleItems(items, priceLevelFromRedux, additionalChargesFromRedux);
      await handleSaleStockUpdates(updatedItems, false, session);

      const updateData = {
        selectedGodownId: selectedGodownId || existingSale.selectedGodownId,
        selectedGodownName: selectedGodownName ? selectedGodownName[0] : existingSale.selectedGodownName,
        serialNumber: existingSale.serialNumber,
        cmp_id: orgId,
        partyAccount: party?.partyName,
        party,
        despatchDetails,
        items: updatedItems,
        priceLevel: priceLevelFromRedux,
        additionalCharges: additionalChargesFromRedux,
        finalAmount: lastAmount,
        Primary_user_id: req.owner,
        Secondary_user_id: req.secondaryUserId,
        salesNumber: salesNumber,
        createdAt: new Date(selectedDate),
      };

      await model.findByIdAndUpdate(saleId, updateData, { new: true, session });

      const newBillValue = Number(lastAmount);
      const oldBillValue = Number(existingSale.finalAmount);
      const diffBillValue = newBillValue - oldBillValue;

      const matchedOutStanding = await TallyData.findOne({
        party_id: party?.party_master_id,
        cmp_id: orgId,
        bill_no: salesNumber,
      }).session(session);

      if (matchedOutStanding) {
        const newOutstanding = Number(matchedOutStanding?.bill_pending_amt) + diffBillValue;

        // console.log("newOutstanding",newOutstanding);
        
       const outStandingUpdateResult = await TallyData.updateOne(
          {
            party_id: party?.party_master_id,
            cmp_id: orgId,
            bill_no: salesNumber,
          },
          { $set: { bill_pending_amt: newOutstanding, bill_amount: newBillValue } },
          { new: true,session }
        );
      }

      await session.commitTransaction();
      session.endSession();
      return res.status(200).json({
        success: true,
        message: "Sale edited successfully",
        // outStandingUpdateResult
      });
    } catch (error) {
      await session.abortTransaction();
      session.endSession();

      if (error.code === 112 && retries < MAX_RETRIES - 1) {
        console.log(`Retrying transaction (attempt ${retries + 1})...`);
        retries++;
        await new Promise(resolve => setTimeout(resolve, RETRY_DELAY_MS));
      } else {
        console.error("Error editing sale:", error);
        return res.status(500).json({
          success: false,
          message: "An error occurred while editing the sale.",
          error: error.message,
        });
      }
    }
  }

  return res.status(500).json({
    success: false,
    message: "Failed to edit sale after multiple attempts.",
  });
};


/**
 * @desc To cancel sale
 * @route POST /api/sUsers/cancelSale
 * @access Public
 */


export const cancelSale = async (req, res) => {
  const saleId = req.params.id; // ID of the sale to cancel
  const vanSaleQuery = req.query.vanSale;

  const session = await mongoose.startSession(); // Start the session

  try {
    session.startTransaction(); // Begin a transaction

    // Find the sale to cancel
    const sale = await (vanSaleQuery === "true"
      ? vanSaleModel
      : salesModel
    ).findById(saleId).session(session); // Use the session in the query

    if (!sale) {
      await session.abortTransaction(); // Rollback transaction if sale not found
      session.endSession(); // End the session
      return res
        .status(404)
        .json({ success: false, message: "Sale not found" });
    }

    // Revert stock updates
    await revertSaleStockUpdates(sale.items, session); // Ensure stock updates use session

    // Update sale status
    sale.isCancelled = true;
    await (vanSaleQuery === "true"
      ? vanSaleModel
      : salesModel
    ).findByIdAndUpdate(saleId, sale, { session }); // Use the session in the update

    // Commit the transaction
    await session.commitTransaction();
    session.endSession(); // End the session

    res.status(200).json({
      success: true,
      message: "Sale canceled and stock reverted successfully",
    });
  } catch (error) {
    // Rollback the transaction if something goes wrong
    await session.abortTransaction();
    session.endSession(); // End the session
    console.error("Error in canceling sale:", error);
    res.status(500).json({
      success: false,
      message: "An error occurred while canceling the sale.",
      error: error.message,
    });
  }
};


  
