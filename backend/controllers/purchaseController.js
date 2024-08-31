import { truncateToNDecimals } from "../helpers/helper.js";
import {
  createPurchaseRecord,
  handlePurchaseStockUpdates,
  updatePurchaseNumber,
   revertPurchaseStockUpdates
  
} from "../helpers/purchaseHelper.js";
import { processSaleItems as processPurchaseItems } from "../helpers/salesHelper.js";
import { checkForNumberExistence } from "../helpers/secondaryHelper.js";
import purchaseModel from "../models/purchaseModel.js";
import secondaryUserModel from "../models/secondaryUserModel.js";

// @desc create purchase
// route GET/api/sUsers/createPurchase
export const createPurchase = async (req, res) => {
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
      req.body.orgId
    );

    if (NumberExistence) {
      return res.status(400).json({
        message: "Purchase with the same number already exists",
      });
    }

    const secondaryUser = await secondaryUserModel.findById(Secondary_user_id);
    const secondaryMobile = secondaryUser?.mobile;

    if (!secondaryUser) {
      return res
        .status(404)
        .json({ success: false, message: "Secondary user not found" });
    }

    await handlePurchaseStockUpdates(items);
    const updatedItems = await processPurchaseItems(items);
    const updatedPurchaseNumber = await updatePurchaseNumber(
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

    const result = await createPurchaseRecord(
      req,
      purchaseNumber,
      updatedItems,
      updateAdditionalCharge
    );

    res.status(201).json({
      success: true,
      data: result,
      message: "Purchase created successfully",
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

// @desc edit purchase
// route GET/api/sUsers/editPurchase

export const editPurchase = async (req, res) => {
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
    const existingPurchase = await purchaseModel.findById(purchaseId);
    if (!existingPurchase) {
      return res
        .status(404)
        .json({ success: false, message: "Purchase not found" });
    }

    // Revert existing stock updates
    await revertPurchaseStockUpdates(existingPurchase.items);
    // Process new sale items and update stock
    const updatedItems = processPurchaseItems(
      items,
      additionalChargesFromRedux
    );

    await handlePurchaseStockUpdates(updatedItems);

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

    await purchaseModel.findByIdAndUpdate(purchaseId, updateData, { new: true });

    //     ///////////////////////////////////// for reflecting the rate change in outstanding  ////////////////////////////////////

    // const newBillValue = Number(lastAmount);
    // const oldBillValue = Number(existingSale.finalAmount);
    // const diffBillValue = newBillValue - oldBillValue;

    // const matchedOutStanding = await TallyData.findOne({
    //   party_id: party?.party_master_id,
    //   cmp_id: orgId,
    //   bill_no: salesNumber,
    // });

    // if (matchedOutStanding) {
    //   // console.log("editSale: matched outstanding found");
    //   const newOutstanding =
    //     Number(matchedOutStanding?.bill_pending_amt) + diffBillValue;

    //   // console.log("editSale: new outstanding calculated", newOutstanding);
    //   await TallyData.updateOne(
    //     {
    //       party_id: party?.party_master_id,
    //       cmp_id: orgId,
    //       bill_no: salesNumber,
    //     },
    //     { $set: { bill_pending_amt: newOutstanding } }
    //   );

    //   // console.log("editSale: outstanding updated");
    // } else {
    //   console.log("editSale: matched outstanding not found");
    // }

    res.status(200).json({
      success: true,
      message: "purchase edited successfully",
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
