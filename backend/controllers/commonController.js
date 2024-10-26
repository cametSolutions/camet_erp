import hsnModel from "../models/hsnModel.js";
import productModel from "../models/productModel.js";
import salesModel from "../models/salesModel.js";
import stockTransferModel from "../models/stockTransferModel.js";
import creditNoteModel from "../models/creditNoteModel.js";
import debitNoteModel from "../models/debitNoteModel.js";
import TransactionModel from "../models/TransactionModel.js";
import invoiceModel from "../models/invoiceModel.js";
import vanSaleModel from "../models/vanSaleModel.js";
import purchaseModel from "../models/purchaseModel.js";
import Oragnization from "../models/OragnizationModel.js";
import AdditionalChargesModel from "../models/additionalChargesModel.js";
import {
  aggregateTransactions,
  aggregateOpeningBalance,
} from "../helpers/helper.js";
import { startOfDay, endOfDay, parseISO } from "date-fns";
import receiptModel from "../models/receiptModel.js";
import paymentModel from "../models/paymentModel.js";
import OutstandingModel from "../models/TallyData.js";
import { Brand } from "../models/subDetails.js";
import { Category } from "../models/subDetails.js";
import { Subcategory } from "../models/subDetails.js";
import { Godown } from "../models/subDetails.js";
import { PriceLevel } from "../models/subDetails.js";
import mongoose from "mongoose";

// @desc toget the details of transaction or sale
// route get/api/sUsers/getSalesDetails

export const getSalesDetails = async (req, res) => {
  const saleId = req.params.id;
  const vanSaleQuery = req.query.vanSale;

  const isVanSale = vanSaleQuery === "true";

  let model;
  if (isVanSale) {
    model = vanSaleModel;
  } else {
    model = salesModel;
  }

  try {
    const saleDetails = await model.findById(saleId).lean();

    ////find the outstanding of the sale
    const outstandingOfSale = await OutstandingModel.findOne({
      bill_no: saleDetails.salesNumber,
      cmp_id: saleDetails.cmp_id,
      Primary_user_id: saleDetails.Primary_user_id,
    });

    let isEditable = true;

    if (outstandingOfSale) {
      isEditable =
        outstandingOfSale?.appliedReceipts?.length == 0 ? true : false;
    }

    saleDetails.isEditable = isEditable;

    if (saleDetails) {
      res
        .status(200)
        .json({ message: "Sales details fetched", data: saleDetails });
    } else {
      res.status(404).json({ error: "Sale not found" });
    }
  } catch (error) {
    console.error("Error fetching sale details:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

// @desc to  get stock transfer details
// route get/api/sUsers/getStockTransferDetails;
export const getStockTransferDetails = async (req, res) => {
  try {
    const id = req.params.id;

    const details = await stockTransferModel.findById(id);
    if (details) {
      res
        .status(200)
        .json({ message: "Stock Transfer Details fetched", data: details });
    } else {
      res.status(404).json({ error: "Stock Transfer Details not found" });
    }
  } catch (error) {
    console.error("Error in getting StockTransferDetails:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

// @desc adding new Product
// route POst/api/pUsers/addProduct

export const addProduct = async (req, res) => {
  try {
    const {
      body: {
        cmp_id,
        product_name,
        product_code,
        balance_stock,
        brand,
        category,
        batchEnabled,
        sub_category,
        unit,
        alt_unit,
        unit_conversion,
        alt_unit_conversion,
        // hsn_code,
        purchase_price,
        purchase_cost,
        Priceleveles,
        GodownList,
      },
    } = req;

    let hsn_code = req.body.hsn_code;

    // Fetch HSN details
    const hsnDetails = await hsnModel.findById(hsn_code);

    // Extract required fields from HSN details
    let cgst, sgst, igst, cess, addl_cess, hsn_id;
    if (hsnDetails) {
      ({
        igstRate: igst,
        cgstRate: cgst,
        sgstUtgstRate: sgst,
        onValue: cess,
        onQuantity: addl_cess,
        hsn: hsn_code,
        _id: hsn_id,
      } = hsnDetails);
    }

    // Prepare data to save
    const dataToSave = {
      cmp_id,

      product_name,
      Primary_user_id: req.pUserId || req.owner,
      product_code,
      balance_stock,
      brand,
      category,
      sub_category,
      batchEnabled,
      unit,
      alt_unit,
      unit_conversion,
      alt_unit_conversion,
      hsn_code,
      purchase_price,
      purchase_cost,
      Priceleveles,
      GodownList,
      cgst,
      sgst,
      igst,
      cess,
      addl_cess,
      hsn_id,
    };

    console.log("data to save in add product ", dataToSave);

    // Save the product
    const newProduct = await productModel.create(dataToSave);

    // Return success response
    return res.status(200).json({
      success: true,
      message: "Product added successfully",
    });
  } catch (error) {
    console.error(error);

    // Return error response
    return res.status(500).json({
      success: false,
      message: "Internal server error, try again!",
    });
  }
};

// @desc  edit product details
// route get/api/pUsers/editProduct

export const editProduct = async (req, res) => {
  const productId = req.params.id;

  try {
    const {
      body: {
        product_name,
        product_code,
        balance_stock,
        brand,
        category,
        sub_category,
        unit,
        alt_unit,
        unit_conversion,
        alt_unit_conversion,
        // hsn_code,
        purchase_price,
        purchase_cost,
        Priceleveles,
        GodownList,
        batchEnabled,
      },
    } = req;

    let hsn_code = req.body.hsn_code;

    // Fetch HSN details
    const hsnDetails = await hsnModel.findById(hsn_code);

    // Extract required fields from HSN details
    let cgst, sgst, igst, cess, addl_cess;
    if (hsnDetails) {
      ({
        igstRate: igst,
        cgstRate: cgst,
        sgstUtgstRate: sgst,
        onValue: cess,
        onQuantity: addl_cess,
        hsn: hsn_code,
      } = hsnDetails);
    }

    // Prepare data to save
    const dataToSave = {
      product_name,
      Primary_user_id: req.pUserId || req.owner,
      product_code,
      balance_stock,
      brand,
      category,
      sub_category,
      unit,
      alt_unit,
      unit_conversion,
      alt_unit_conversion,
      hsn_code,
      purchase_price,
      purchase_cost,
      Priceleveles,
      GodownList,
      cgst,
      sgst,
      igst,
      cess,
      addl_cess,
      batchEnabled,
    };

    const updateProduct = await productModel.findOneAndUpdate(
      { _id: productId },
      dataToSave,
      { new: true }
    );
    res.status(200).json({
      success: true,
      message: "Product updated successfully",
      data: updateProduct,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};

// @desc to  get details of credit note
// route get/api/sUsers/getCreditNoteDetails
export const getCreditNoteDetails = async (req, res) => {
  try {
    const id = req.params.id;

    const details = await creditNoteModel.findById(id).lean();

    if (details) {
      ////find the outstanding of the sale
      const outstandingOfCreditNote = await OutstandingModel.findOne({
        bill_no: details.creditNoteNumber,
        cmp_id: details.cmp_id,
        Primary_user_id: details.Primary_user_id,
      });

      let isEditable = true;

      if (outstandingOfCreditNote) {
        isEditable =
          outstandingOfCreditNote?.appliedPayments?.length == 0 ? true : false;
      }

      details.isEditable = isEditable;

      res
        .status(200)
        .json({ message: "Credit Note Details fetched", data: details });
    } else {
      res.status(404).json({ error: "Credit Note Details not found" });
    }
  } catch (error) {
    console.error("Error in getting Credit Note:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

// @desc to  get transactions
// route get/api/sUsers/transactions

export const transactions = async (req, res) => {
  const userId = req.sUserId;
  const cmp_id = req.params.cmp_id;
  const { todayOnly, startOfDayParam, endOfDayParam, party_id } = req.query; // Added parameters

  try {
    // Initialize dateFilter based on provided parameters
    let dateFilter = {};

    if (startOfDayParam && endOfDayParam) {
      // If startOfDay and endOfDay are provided, use them
      const startDate = parseISO(startOfDayParam);
      const endDate = parseISO(endOfDayParam);

      dateFilter = {
        createdAt: {
          $gte: startOfDay(startDate),
          $lte: endOfDay(endDate),
        },
      };
    } else if (todayOnly === "true") {
      // Otherwise, check for todayOnly
      dateFilter = {
        createdAt: {
          $gte: startOfDay(new Date()),
          $lte: endOfDay(new Date()),
        },
      };
    } else {
      dateFilter = {};
    }

    // Conditionally include `Secondary_user_id` only if it exists
    const matchCriteria = {
      ...dateFilter,
      cmp_id: cmp_id,
      ...(userId ? { Secondary_user_id: userId } : {}), // If `userId` exists, match with `Secondary_user_id`
      ...(party_id ? { "party._id": party_id } : {}), // If `party_id` exists, match with `_id` in the party object
    };

    const transactionPromises = [
      aggregateTransactions(
        receiptModel,
        { ...matchCriteria, ...(userId ? { Secondary_user_id: userId } : {}) },
        "Receipt",
        "receiptNumber"
      ),
      aggregateTransactions(
        paymentModel,
        { ...matchCriteria, ...(userId ? { Secondary_user_id: userId } : {}) },
        "Payment",
        "paymentNumber"
      ),
      aggregateTransactions(
        invoiceModel,
        matchCriteria,
        "Sale Order",
        "orderNumber"
      ),
      aggregateTransactions(
        salesModel,
        matchCriteria,
        "Tax Invoice",
        "salesNumber"
      ),
      aggregateTransactions(
        vanSaleModel,
        matchCriteria,
        "Van Sale",
        "salesNumber"
      ),
      aggregateTransactions(
        purchaseModel,
        matchCriteria,
        "Purchase",
        "purchaseNumber"
      ),
      aggregateTransactions(
        stockTransferModel,
        matchCriteria,
        "Stock Transfer",
        "stockTransferNumber"
      ),
      aggregateTransactions(
        creditNoteModel,
        matchCriteria,
        "Credit Note",
        "creditNoteNumber"
      ),
      aggregateTransactions(
        debitNoteModel,
        matchCriteria,
        "Debit Note",
        "debitNoteNumber"
      ),
      // aggregateTransactions(receiptModel, matchCriteria, "Receipt"),
    ];

    const results = await Promise.all(transactionPromises);

    const combined = results
      .flat()
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    if (combined.length > 0) {
      return res.status(200).json({
        message: `Transactions fetched${
          todayOnly === "true" ? " for today" : ""
        }`,
        data: { combined },
      });
    } else {
      return res.status(404).json({ message: "Transactions not found" });
    }
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      status: false,
      message: "Internal server error",
    });
  }
};

// @desc to  get additional charges
// route get/api/sUsers/additionalCharges

export const fetchAdditionalCharges = async (req, res) => {
  try {
    const cmp_id = req.params.cmp_id;
    const pUser = req.pUserId || req.owner;

    const company = await Oragnization.findById(cmp_id);
    const type = company.type;
    let aditionalDetails;

    if (type === "self") {
      aditionalDetails = company?.additionalCharges;
    } else {
      aditionalDetails = await AdditionalChargesModel.find({
        cmp_id: cmp_id,
        Primary_user_id: pUser,
      });
    }

    res.json(aditionalDetails);
  } catch (error) {
    console.error("Error fetching godownwise products:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

// @desc to  get details of debit note
// route get/api/sUsers/getCreditNoteDetails
export const getDebitNoteDetails = async (req, res) => {
  try {
    const id = req.params.id;

    const details = await debitNoteModel.findById(id).lean();
    if (details) {
      ////find the outstanding of the sale
      const outstandingOfCreditNote = await OutstandingModel.findOne({
        bill_no: details.debitNoteNumber,
        cmp_id: details.cmp_id,
        Primary_user_id: details.Primary_user_id,
      });

      let isEditable = true;

      if (outstandingOfCreditNote) {
        isEditable =
          outstandingOfCreditNote?.appliedReceipts?.length == 0 ? true : false;
      }

      details.isEditable = isEditable;
      res
        .status(200)
        .json({ message: "Debit Note Details fetched", data: details });
    } else {
      res.status(404).json({ error: "Debit Note Details not found" });
    }
  } catch (error) {
    console.error("Error in getting Debit Note:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

/**
 * @desc  get receipt details
 * @route GET/api/sUsers/getReceiptDetails
 * @access Public
 */

export const getReceiptDetails = async (req, res) => {
  const receiptNumber = req.params.id;
  try {
    const receipt = await receiptModel.findById(receiptNumber);
    if (receipt) {
      return res.status(200).json({
        receipt: receipt,
        message: "receipt details fetched",
      });
    } else {
      return res
        .status(404)
        .json({ success: false, message: "Receipt not found" });
    }
  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .json({ success: false, message: "Internal server error, try again!" });
  }
};

/**
 * @desc  get payment details
 * @route GET/api/sUsers/getPaymentDetails
 * @access Public
 */

export const getPaymentDetails = async (req, res) => {
  const paymentId = req.params.id;
  try {
    const payment = await paymentModel.findById(paymentId);
    if (payment) {
      return res.status(200).json({
        payment: payment,
        message: "payment details fetched",
      });
    } else {
      return res
        .status(404)
        .json({ success: false, message: "payment not found" });
    }
  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .json({ success: false, message: "Internal server error, try again!" });
  }
};

/**
 * @desc  adding subDetails of product such as brand category subcategory etc
 * @route POST/api/pUsers/addProductSubDetails
 * @access public
 */

export const addProductSubDetails = async (req, res) => {
  try {
    const subDetails = req.body;
    const key = Object.keys(subDetails)[0];
    const orgId = req.params.orgId;

    let Model;
    let dataToSave;

    switch (key) {
      case "brand":
        Model = Brand;
        dataToSave = {
          brand: subDetails[key],
          cmp_id: orgId,
          Primary_user_id: req.pUserId || req.owner,
        };
        break;
      case "category":
        Model = Category;
        dataToSave = {
          category: subDetails[key],
          cmp_id: orgId,
          Primary_user_id: req.pUserId || req.owner,
        };
        break;
      case "subcategory":
        Model = Subcategory;
        dataToSave = {
          subcategory: subDetails[key],
          categoryId: subDetails.categoryId,
          cmp_id: orgId,
          Primary_user_id: req.pUserId || req.owner,
        };
        break;
      case "godown":
        Model = Godown;
        dataToSave = {
          godown: subDetails[key],
          address: subDetails.address,
          cmp_id: orgId,
          Primary_user_id: req.pUserId || req.owner,
          defaultGodown: false,
        };

        // Check if this is the first godown for the company
        const existingGodowns = await Godown.find({ cmp_id: orgId });
        if (existingGodowns.length === 0) {
          // Create default godown
          const defaultGodown = new Godown({
            godown: "Default Godown",
            address: "Default Address",
            cmp_id: orgId,
            Primary_user_id: req.pUserId || req.owner,
            defaultGodown: true,
          });
          const savedDefaultGodown = await defaultGodown.save();

          // Update all products with the default godown
          const update = await productModel.updateMany(
            { cmp_id: orgId },
            {
              $set: {
                "GodownList.$[].godown": "Default Godown",
                "GodownList.$[].defaultGodown": true,
                "GodownList.$[].godown_id": savedDefaultGodown._id,
              },
            }
          );
        }
        break;
      case "pricelevel":
        Model = PriceLevel;
        dataToSave = {
          pricelevel: subDetails[key],
          cmp_id: orgId,
          Primary_user_id: req.pUserId || req.owner,
        };
        break;
      default:
        return res.status(400).json({ message: "Invalid sub-detail type" });
    }

    const newSubDetail = new Model(dataToSave);
    await newSubDetail.save();

    res.status(201).json({ message: `${key} added successfully` });
  } catch (error) {
    console.error("Error in addProductSubDetails:", error);
    res
      .status(500)
      .json({ message: "An error occurred while adding the sub-detail" });
  }
};

/**
 * @desc  get subDetails of product such as brand category subcategory etc
 * @route GET/api/pUsers/getProductSubDetails
 * @access Public
 */

export const getProductSubDetails = async (req, res) => {
  try {
    const { orgId } = req.params;
    const { type } = req.query; // 'type' can be 'brand', 'category', 'subcategory', 'godown', or 'pricelevel'
    const Primary_user_id = req.pUserId || req.owner;

    let data;

    switch (type) {
      case "brand":
        data = await Brand.find({
          cmp_id: orgId,
          Primary_user_id: Primary_user_id,
        });
        break;
      case "category":
        data = await Category.find({
          cmp_id: orgId,
          Primary_user_id: Primary_user_id,
        });
        break;
      case "subcategory":
        data = await Subcategory.find({
          cmp_id: orgId,
          Primary_user_id: Primary_user_id,
        });
        break;
      case "godown":
        data = await Godown.find({
          cmp_id: orgId,
          Primary_user_id: Primary_user_id,
        });
        break;
      case "pricelevel":
        data = await PriceLevel.find({
          cmp_id: orgId,
          Primary_user_id: Primary_user_id,
        });
        break;
      default:
        return res.status(400).json({ message: "Invalid sub-detail type" });
    }

    res.status(200).json({
      message: `${type} details retrieved successfully`,
      data: data,
    });
  } catch (error) {
    console.error("Error in getProductSubDetails:", error);
    res
      .status(500)
      .json({ message: "An error occurred while fetching the sub-details" });
  }
};

/**
 * @desc  delete subDetails of product such as brand category subcategory etc
 * @route DELETE/api/pUsers/deleteProductSubDetails
 * @access Public
 */
export const deleteProductSubDetails = async (req, res) => {
  try {
    const { orgId, id } = req.params;
    const { type } = req.query;

    let Model;
    switch (type) {
      case "brand":
        Model = Brand;
        break;
      case "category":
        Model = Category;
        break;
      case "subcategory":
        Model = Subcategory;
        break;
      case "godown":
        Model = Godown;
        break;
      case "pricelevel":
        Model = PriceLevel;
        break;
      default:
        return res.status(400).json({ message: "Invalid sub-detail type" });
    }

    const deletedItem = await Model.findOneAndDelete({
      _id: id,
      cmp_id: orgId,
    });

    if (!deletedItem) {
      return res.status(404).json({ message: "Item not found" });
    }

    res.status(200).json({ message: `${type} deleted successfully` });
  } catch (error) {
    console.error("Error in deleteProductSubDetails:", error);
    res
      .status(500)
      .json({ message: "An error occurred while deleting the sub-detail" });
  }
};

/**
 * @desc  edit subDetails of product such as brand category subcategory etc
 * @route PUT/api/pUsers/editProductSubDetails
 * @access Public
 */
export const editProductSubDetails = async (req, res) => {
  try {
    const { orgId, id } = req.params;
    const { type } = req.query;
    const updateData = req.body[type];

    let Model;
    switch (type) {
      case "brand":
        Model = Brand;
        break;
      case "category":
        Model = Category;
        break;
      case "subcategory":
        Model = Subcategory;
        break;
      case "godown":
        Model = Godown;
        break;
      case "pricelevel":
        Model = PriceLevel;
        break;
      default:
        return res.status(400).json({ message: "Invalid sub-detail type" });
    }

    const queryConditions = { _id: id, cmp_id: orgId };
    const updateOperation = { [type]: updateData };

    const result = await Model.updateOne(queryConditions, updateOperation);

    if (result.modifiedCount === 0) {
      return res
        .status(404)
        .json({ message: "Item not found or not modified" });
    }

    const updatedItem = await Model.findOne(queryConditions);

    res.status(200).json({
      message: `${type} updated successfully`,
      data: updatedItem,
    });
  } catch (error) {
    console.error("Error in editProductSubDetails:", error);
    res
      .status(500)
      .json({ message: "An error occurred while updating the sub-detail" });
  }
};

// @desc adding new Hsn
// route POst/api/pUsers/addHsn
export const addHsn = async (req, res) => {
  const Primary_user_id = req.pUserId || req.owner;
  try {
    const {
      cpm_id,
      hsn,
      description,
      tab,
      taxabilityType,
      igstRate,
      cgstRate,
      sgstUtgstRate,
      onValue,
      onQuantity,
      isRevisedChargeApplicable,
      rows,
    } = req.body;

    const hsnCreation = new hsnModel({
      cpm_id,
      Primary_user_id,
      hsn,
      description,
      tab,
      taxabilityType,
      igstRate,
      cgstRate,
      sgstUtgstRate,
      onValue,
      onQuantity,
      isRevisedChargeApplicable,
      rows,
    });

    const result = await hsnCreation.save();

    if (result) {
      return res.status(200).json({
        success: true,
        message: "Hsn added successfully",
      });
    } else {
      return res.status(400).json({
        success: false,
        message: "Hsn adding failed",
      });
    }
  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .json({ success: false, message: "Internal server error, try again!" });
  }
};

// @desc  getting a single hsn detail for edit
// route get/api/pUsers/getSinglePartyDetails

export const getSingleHsn = async (req, res) => {
  const id = req.params.hsnId;
  try {
    const hsn = await hsnModel.findById(id);

    if (hsn) {
      return res.status(200).json({ success: true, data: hsn });
    } else {
      return res.status(404).json({ success: false, message: "HSN not found" });
    }
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: "Internal server error, try again!",
    });
  }
};

// @desc  editHsn details
// route get/api/pUsers/editHsn

export const editHsn = async (req, res) => {
  const hsnId = req.params.hsnId;
  const Primary_user_id = req.pUserId || req.owner;
  req.body.Primary_user_id = Primary_user_id.toString();

  try {
    const updateHsn = await hsnModel.findOneAndUpdate(
      { _id: hsnId },
      req.body,
      { new: true }
    );

    res.status(200).json({
      success: true,
      message: "HSN updated successfully",
      data: updateHsn,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};

// @desc delete hsn
// route get/api/pUsers/deleteProduct

export const deleteHsn = async (req, res) => {
  const hsnId = req.params.id;

  try {
    const newHsnId = new mongoose.Types.ObjectId(hsnId);

    const attachedProduct = await productModel.find({ hsn_id: newHsnId });

    if (attachedProduct.length > 0) {
      return res.status(404).json({
        success: false,
        message: `HSN is linked with product ${attachedProduct[0].product_name}`,
      });
    } else {
      const deletedHsn = await hsnModel.findByIdAndDelete(hsnId);
      if (deletedHsn) {
        return res.status(200).json({
          success: true,
          message: "HSN deleted successfully",
        });
      } else {
        return res.status(404).json({
          success: false,
          message: "HSN not found",
        });
      }
    }
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: "Internal server error, try again!",
    });
  }
};

// @desc toget the details of transaction or purchase
// route get/api/sUsers/getPurchaseDetails

export const getPurchaseDetails = async (req, res) => {
  const purchaseId = req.params.id;

  try {
    const purchaseDetails = await purchaseModel.findById(purchaseId).lean();

    if (!purchaseDetails) {
      return res.status(404).json({ error: "Purchase not found" });
    }

    ////find the outstanding of the sale
    const outstandingOfPurchase = await OutstandingModel.findOne({
      bill_no: purchaseDetails.purchaseNumber,
      cmp_id: purchaseDetails.cmp_id,
      Primary_user_id: purchaseDetails.Primary_user_id,
    });
    let isEditable = true;

    if (outstandingOfPurchase) {
      isEditable =
        outstandingOfPurchase?.appliedPayments?.length == 0 ? true : false;
    }

    purchaseDetails.isEditable = isEditable;

    if (purchaseDetails) {
      res
        .status(200)
        .json({ message: "purchaseDetails  fetched", data: purchaseDetails });
    } else {
      res.status(404).json({ error: "Purchase not found" });
    }
  } catch (error) {
    console.error("Error fetching purchase details:", error);
    res.status(500).json({ error: "Internal Server Error" });

  }

}
/**
 * @desc   To calculate opening balances
 * @route  Get /api/sUsers/getOpeningBalances
 * @access Public
 */
export const getOpeningBalances = async (req,res) => {
  try {
    const userId = req.sUserId;
    const cmp_id = req.params.cmp_id;
    const {startOfDayParam, party_id } = req.query;
    const startDate = parseISO(startOfDayParam) || new Date();


    const openingBalanceDateFilter = {
      createdAt: {
        $lt: startOfDay(startDate),
      },
    };

    const openingBalanceMatchCriteria = {
      ...openingBalanceDateFilter,
      cmp_id: cmp_id,
      ...(userId ? { Secondary_user_id: userId } : {}),
      ...(party_id ? { 'party._id': party_id } : {}),
    };


   // Calculate opening balances
   const openingBalancePromises = [
    // Debit opening balances
    aggregateOpeningBalance(debitNoteModel, openingBalanceMatchCriteria, "Debit Note"),
    aggregateOpeningBalance(salesModel, openingBalanceMatchCriteria, "Tax Invoice"),
    aggregateOpeningBalance(paymentModel, openingBalanceMatchCriteria, "Payment"),
    aggregateOpeningBalance(vanSaleModel, openingBalanceMatchCriteria, "Van Sale"),
    // Credit opening balances
    aggregateOpeningBalance(purchaseModel, openingBalanceMatchCriteria, "Purchase"),
    aggregateOpeningBalance(receiptModel, openingBalanceMatchCriteria, "Receipt"),
    aggregateOpeningBalance(creditNoteModel, openingBalanceMatchCriteria, "Credit Note"),
  ];


    const openingBalances = await Promise.all(openingBalancePromises);

    // Calculate total opening balances
    const totalDebitOpening = openingBalances.slice(0, 4).reduce((sum, amount) => sum + amount, 0);
    const totalCreditOpening = openingBalances.slice(4, 7).reduce((sum, amount) => sum + amount, 0);
    const netOpeningBalance = totalDebitOpening - totalCreditOpening;


    return res.status(200).json({
      success: true,
      data: {
        totalDebitOpening,
        totalCreditOpening,
        netOpeningBalance,
      },
    });

 
  } catch (error) {
    console.error("Error calculating opening balances:", error);
    throw error;
  }
};
