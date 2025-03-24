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
  addCorrespondingParty,
  editCorrespondingParty,
  getEmailService,
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
import cashModel from "../models/cashModel.js";
import TallyData from "../models/TallyData.js";
import bankModel from "../models/bankModel.js";
import OragnizationModel from "../models/OragnizationModel.js";
import nodemailer from "nodemailer";
import barcodeModel from "../models/barcodeModel.js";

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
      billId: saleDetails?._id.toString(),
      bill_no: saleDetails?.salesNumber,
      billId: saleDetails?._id.toString(),
      cmp_id: saleDetails?.cmp_id,
      Primary_user_id: saleDetails?.Primary_user_id,
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
        gdnEnabled,
        sub_category,
        unit,
        alt_unit,
        unit_conversion,
        alt_unit_conversion,
        hsn_code: hsn_id,
        purchase_price,
        item_mrp,
        purchase_cost,
        Priceleveles,
        GodownList,
      },
    } = req;


    // Fetch HSN details
    const hsnDetails = await hsnModel.findById(hsn_id);

    // Extract required fields from HSN details
    let cgst, sgst, igst, cess, addl_cess, hsn_code;
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
      cmp_id,

      product_name,
      Primary_user_id: req.pUserId || req.owner,
      product_code,
      balance_stock,
      brand,
      category,
      sub_category,
      batchEnabled,
      gdnEnabled,
      unit,
      alt_unit,
      unit_conversion,
      alt_unit_conversion,
      hsn_code,
      purchase_price,
      purchase_cost,
      item_mrp,
      Priceleveles,
      GodownList,
      cgst,
      sgst,
      igst,
      cess,
      addl_cess,
    };

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
        hsn_code: hsn_id,
        
        purchase_price,
        item_mrp,
        purchase_cost,
        Priceleveles,
        GodownList,
        batchEnabled,
      },
    } = req;

    // Fetch HSN details
    const hsnDetails = await hsnModel.findById(hsn_id);

    // Extract required fields from HSN details
    let cgst, sgst, igst, cess, addl_cess, hsn_code;
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
      item_mrp,
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
        billId: details._id.toString(),
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
  const {
    todayOnly,
    startOfDayParam,
    endOfDayParam,
    party_id,
    selectedVoucher,
    fullDetails = "false",
    ignore = "", // New parameter for collections to ignore
  } = req.query;

  let returnFullDetails = false;
  if (fullDetails === "true") {
    returnFullDetails = true;
  }

  try {
    // Parse ignore parameter - split by comma to handle multiple collections
    const ignoredCollections = ignore
      .split(",")
      .map((item) => item.trim().toLowerCase());

    // Initialize dateFilter based on provided parameters
    let dateFilter = {};
    if (startOfDayParam && endOfDayParam) {
      const startDate = parseISO(startOfDayParam);
      const endDate = parseISO(endOfDayParam);
      dateFilter = {
        date: {
          $gte: startOfDay(startDate),
          $lte: endOfDay(endDate),
        },
      };
    } else if (todayOnly === "true") {
      const today = new Date();
      dateFilter = {
        date: {
          $gte: new Date(
            Date.UTC(
              today.getUTCFullYear(),
              today.getUTCMonth(),
              today.getUTCDate(),
              0,
              0,
              0,
              0
            )
          ),
          $lte: new Date(
            Date.UTC(
              today.getUTCFullYear(),
              today.getUTCMonth(),
              today.getUTCDate(),
              23,
              59,
              59,
              999
            )
          ),
        },
      };
    }

    const matchCriteria = {
      ...dateFilter,
      cmp_id: cmp_id,
      ...(userId ? { Secondary_user_id: userId } : {}),
      ...(party_id ? { "party._id": party_id } : {}),
    };

    // Define voucher type mappings
    const voucherTypeMap = {
      sale: [
        { model: salesModel, type: "Tax Invoice", numberField: "salesNumber" },
      ],
      saleOrder: [
        { model: invoiceModel, type: "Sale Order", numberField: "orderNumber" },
      ],
      vanSale: [
        { model: vanSaleModel, type: "Van Sale", numberField: "salesNumber" },
      ],
      purchase: [
        {
          model: purchaseModel,
          type: "Purchase",
          numberField: "purchaseNumber",
        },
      ],
      debitNote: [
        {
          model: debitNoteModel,
          type: "Debit Note",
          numberField: "debitNoteNumber",
        },
      ],
      creditNote: [
        {
          model: creditNoteModel,
          type: "Credit Note",
          numberField: "creditNoteNumber",
        },
      ],
      receipt: [
        { model: receiptModel, type: "Receipt", numberField: "receiptNumber" },
      ],
      payment: [
        { model: paymentModel, type: "Payment", numberField: "paymentNumber" },
      ],
      stockTransfer: [
        {
          model: stockTransferModel,
          type: "Stock Transfer",
          numberField: "stockTransferNumber",
        },
      ],
      all: [
        { model: salesModel, type: "Tax Invoice", numberField: "salesNumber" },
        { model: invoiceModel, type: "Sale Order", numberField: "orderNumber" },
        { model: vanSaleModel, type: "Van Sale", numberField: "salesNumber" },
        {
          model: purchaseModel,
          type: "Purchase",
          numberField: "purchaseNumber",
        },
        {
          model: debitNoteModel,
          type: "Debit Note",
          numberField: "debitNoteNumber",
        },
        {
          model: creditNoteModel,
          type: "Credit Note",
          numberField: "creditNoteNumber",
        },
        { model: receiptModel, type: "Receipt", numberField: "receiptNumber" },
        { model: paymentModel, type: "Payment", numberField: "paymentNumber" },
        {
          model: stockTransferModel,
          type: "Stock Transfer",
          numberField: "stockTransferNumber",
        },
      ],
    };

    // Get the appropriate models to query based on selectedVoucher
    let modelsToQuery = selectedVoucher
      ? voucherTypeMap[selectedVoucher]
      : voucherTypeMap.all;

    // Filter out ignored collections
    modelsToQuery = modelsToQuery.filter(
      ({ type }) =>
        !ignoredCollections.includes(type.toLowerCase().replace(/\s+/g, ""))
    );

    if (!modelsToQuery || modelsToQuery.length === 0) {
      return res.status(400).json({
        status: false,
        message: "Invalid voucher type selected or all collections ignored",
      });
    }

    // Create transaction promises based on selected voucher type
    const transactionPromises = modelsToQuery.map(
      ({ model, type, numberField }) =>
        aggregateTransactions(
          model,
          {
            ...matchCriteria,
            ...(userId ? { Secondary_user_id: userId } : {}),
          },
          type,
          numberField,
          returnFullDetails
        )
    );

    const results = await Promise.all(transactionPromises);

    const combined = results
      .flat()
      .sort((a, b) => new Date(b.date) - new Date(a.date));

    const totalTransactionAmount = combined.reduce((sum, transaction) => {
      const amount = Number(transaction.enteredAmount) || 0;
      return sum + amount;
    }, 0);

    if (combined.length > 0) {
      return res.status(200).json({
        message: `${
          selectedVoucher === "all"
            ? "All transactions"
            : `${voucherTypeMap[selectedVoucher]?.[0]?.type} transactions`
        } fetched${todayOnly === "true" ? " for today" : ""}`,
        data: { combined, totalTransactionAmount },
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
        billId: details._id.toString(),
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
    /// add godownEnabled tag to company
    const company = await OragnizationModel.findOne({ _id: orgId });
    const generatedId = new mongoose.Types.ObjectId();

    switch (key) {
      case "brand":
        Model = Brand;
        dataToSave = {
          _id: generatedId,
          brand: subDetails[key],
          brand_id: generatedId,
          cmp_id: orgId,
          Primary_user_id: req.pUserId || req.owner,
        };
        break;
      case "category":
        Model = Category;
        dataToSave = {
          _id: generatedId,
          category: subDetails[key],
          category_id: generatedId,
          cmp_id: orgId,
          Primary_user_id: req.pUserId || req.owner,
        };
        break;
      case "subcategory":
        Model = Subcategory;
        dataToSave = {
          _id: generatedId,
          subcategory: subDetails[key],
          categoryId: subDetails.categoryId,
          subcategory_id: generatedId,
          cmp_id: orgId,
          Primary_user_id: req.pUserId || req.owner,
        };
        break;
      case "godown":
        Model = Godown;
        dataToSave = {
          _id: generatedId,
          godown: subDetails[key],
          godown_id: generatedId,
          address: subDetails.address,
          cmp_id: orgId,
          Primary_user_id: req.pUserId || req.owner,
          defaultGodown: false,
        };

        // Check if this is the first godown for the company
        // const existingGodowns = await Godown.find({ cmp_id: orgId });
        // if (existingGodowns.length === 0) {
        //   // Create default godown
        //   const defaultGodownId = new mongoose.Types.ObjectId();
        //   const defaultGodown = new Godown({
        //     _id: defaultGodownId,
        //     godown_id: defaultGodownId,
        //     godown: "Default Godown",
        //     // address: "Default Address",
        //     cmp_id: orgId,
        //     Primary_user_id: req.pUserId || req.owner,
        //     defaultGodown: true,
        //   });
        //   const savedDefaultGodown = await defaultGodown.save();

        //   company.gdnEnabled = true;
        //   await company.save();

        //   // Update all products with the default godown
        //   const update = await productModel.updateMany(
        //     { cmp_id: orgId },
        //     {
        //       $set: {
        //         "GodownList.$[].godown": savedDefaultGodown._id,
        //         gdnEnabled: true, // ✅ Add this line to update gdnEnabled
        //       },
        //     }
        //   );
          
        // }
        break;
      case "pricelevel":
        Model = PriceLevel;
        dataToSave = {
          _id: generatedId,
          pricelevel: subDetails[key],
          pricelevel_id: generatedId,
          cmp_id: orgId,
          Primary_user_id: req.pUserId || req.owner,
        };
        break;
      default:
        return res
          .status(400)
          .json({ message: "Invalid sub-detail type", });
    }

    const newSubDetail = new Model(dataToSave);
    await newSubDetail.save();
    
    const companyUpdate=key==="godown" ? company : null

    res.status(201).json({ message: `${key} added successfully`, companyUpdate });
    
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

    console.log(typeof orgId);

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
      billId: purchaseDetails._id.toString(),
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
};
/**
 * @desc   To calculate opening balances
 * @route  Get /api/sUsers/getOpeningBalances
 * @access Public
 */
export const getOpeningBalances = async (req, res) => {
  try {
    const userId = req.sUserId;
    const cmp_id = req.params.cmp_id;
    const { startOfDayParam, party_id } = req.query;
    const startDate = parseISO(startOfDayParam) || new Date();

    const openingBalanceDateFilter = {
      date: {
        $lt: startOfDay(startDate),
      },
    };

    const openingBalanceMatchCriteria = {
      ...openingBalanceDateFilter,
      cmp_id: cmp_id,
      ...(userId ? { Secondary_user_id: userId } : {}),
      ...(party_id ? { "party._id": party_id } : {}),
    };

    // Calculate opening balances
    const openingBalancePromises = [
      // Debit opening balances
      aggregateOpeningBalance(
        debitNoteModel,
        openingBalanceMatchCriteria,
        "Debit Note"
      ),
      aggregateOpeningBalance(
        salesModel,
        openingBalanceMatchCriteria,
        "Tax Invoice"
      ),
      aggregateOpeningBalance(
        paymentModel,
        openingBalanceMatchCriteria,
        "Payment"
      ),
      aggregateOpeningBalance(
        vanSaleModel,
        openingBalanceMatchCriteria,
        "Van Sale"
      ),
      // Credit opening balances
      aggregateOpeningBalance(
        purchaseModel,
        openingBalanceMatchCriteria,
        "Purchase"
      ),
      aggregateOpeningBalance(
        receiptModel,
        openingBalanceMatchCriteria,
        "Receipt"
      ),
      aggregateOpeningBalance(
        creditNoteModel,
        openingBalanceMatchCriteria,
        "Credit Note"
      ),
    ];

    const openingBalances = await Promise.all(openingBalancePromises);

    // Calculate total opening balances
    const totalDebitOpening = openingBalances
      .slice(0, 4)
      .reduce((sum, amount) => sum + amount, 0);
    const totalCreditOpening = openingBalances
      .slice(4, 7)
      .reduce((sum, amount) => sum + amount, 0);
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

// Update all missing billIds
export const updateMissingBillIds = async (req, res) => {
  try {
    const startTime = Date.now();
    const results = {
      total: 0,
      updated: 0,
      failed: 0,
      notFound: 0,
      errors: [],
    };

    // Get all outstanding documents without billId
    const outstandingDocs = await TallyData.find({
      billId: { $exists: false },
      // cmp_id: "66b870a95387e8f388f9af6c"
    });
    results.total = outstandingDocs.length;

    // console.log("Total documents to process:", outstandingDocs.length);

    // Create a map for model lookup with corresponding bill number fields
    const modelConfig = {
      sale: {
        models: [
          {
            model: salesModel,
            billField: "salesNumber",
            type: "Regular Sale",
          },
          {
            model: vanSaleModel,
            billField: "salesNumber",
            type: "Van Sale",
          },
        ],
      },

      creditnote: {
        models: [
          {
            model: creditNoteModel,
            billField: "creditNoteNumber",
            type: "Credit Note",
          },
        ],
      },
      purchase: {
        models: [
          {
            model: purchaseModel,
            billField: "purchaseNumber",
            type: "Purchase",
          },
        ],
      },

      debitnote: {
        models: [
          {
            model: debitNoteModel,
            billField: "debitNoteNumber",
            type: "Debit Note",
          },
        ],
      },
    };

    // Process each document
    for (const doc of outstandingDocs) {
      try {
        const sourceType = doc.source?.toLowerCase()?.trim();

        // console.log(`Processing document with bill_no: ${doc.bill_no}, source: ${sourceType}`);

        const config = modelConfig[sourceType];

        if (!config || !config.models?.length) {
          // console.log(`Invalid source type: ${sourceType}`);
          results.failed++;
          results.errors.push({
            bill_no: doc.bill_no,
            error: `Invalid source type: ${doc.source}`,
            source: doc.source,
          });
          continue;
        }

        let sourceDoc = null;
        let matchedModel = null;

        // Try each model in the config until we find a match
        for (const modelConfig of config.models) {
          const query = {
            [modelConfig.billField]: doc.bill_no,
            cmp_id: doc.cmp_id,
          };

          // console.log(`Searching in ${modelConfig.type} with query:`, query);

          const foundDoc = await modelConfig.model.findOne(query);
          if (foundDoc) {
            sourceDoc = foundDoc;
            matchedModel = modelConfig;
            break;
          }
        }

        if (sourceDoc && sourceDoc._id) {
          await TallyData.updateOne(
            { _id: doc._id },
            {
              $set: {
                billId: sourceDoc._id,
                updatedAt: new Date(),
                lastModifiedBy: "system",
                documentType: matchedModel.type, // Adding document type for reference
              },
            }
          );
          console.log(
            `Updated document ${doc._id} with billId ${sourceDoc._id} (${matchedModel.type})`
          );
          results.updated++;
        } else {
          console.log(`No matching document found for bill_no: ${doc.bill_no}`);
          results.notFound++;
          results.errors.push({
            bill_no: doc.bill_no,
            source: doc.source,
            error: `Document not found in any of the relevant collections`,
            searchedIn: config.models.map((m) => m.type),
          });
        }
      } catch (error) {
        console.error(`Error processing document ${doc.bill_no}:`, error);
        results.failed++;
        results.errors.push({
          bill_no: doc.bill_no,
          error: error.message,
          stack:
            process.env.NODE_ENV === "development" ? error.stack : undefined,
        });
      }
    }

    // Calculate execution time
    const executionTime = (Date.now() - startTime) / 1000;

    // Return detailed response
    return res.status(200).json({
      success: true,
      executionTime: `${executionTime} seconds`,
      results: {
        ...results,
        errors: results.errors.slice(0, 10), // Limit error list to first 10
      },
      message: "Bill ID update process completed",
      summary: {
        processed: results.total,
        updated: results.updated,
        notFound: results.notFound,
        failed: results.failed,
        successRate: `${((results.updated / results.total) * 100).toFixed(2)}%`,
      },
    });
  } catch (error) {
    console.error("Error in updateMissingBillIds:", error);
    return res.status(500).json({
      success: false,
      error: error.message,
      stack: process.env.NODE_ENV === "development" ? error.stack : undefined,
      message: "Failed to update bill IDs",
    });
  }
};

////find source details

export const findSourceBalance = async (req, res) => {
  const cmp_id = req.params.cmp_id;

  const { startOfDayParam, endOfDayParam } = req.query;

  // Initialize dateFilter for settlements.created_at
  let dateFilter = {};
  if (startOfDayParam && endOfDayParam) {
    const startDate = parseISO(startOfDayParam);
    const endDate = parseISO(endOfDayParam);
    dateFilter = {
      "settlements.created_at": {
        $gte: startOfDay(startDate),
        $lte: endOfDay(endDate),
      },
    };
  }
  // else if (todayOnly === "true") {
  //   dateFilter = {
  //     "settlements.created_at": {
  //       $gte: startOfDay(new Date()),
  //       $lte: endOfDay(new Date()),
  //     },
  //   };
  // }
  try {
    const bankTotal = await bankModel.aggregate([
      {
        $match: {
          cmp_id: cmp_id,
          settlements: { $exists: true, $ne: [] },
        },
      },
      {
        $unwind: "$settlements",
      },
      {
        $match: dateFilter,
      },
      {
        $group: {
          _id: null,
          totalAmount: { $sum: "$settlements.amount" },
        },
      },
    ]);

    // Aggregation pipeline for cash collection
    const cashTotal = await cashModel.aggregate([
      {
        $match: {
          settlements: { $exists: true, $ne: [] },
          cmp_id: cmp_id,
        },
      },
      {
        $unwind: "$settlements",
      },

      {
        $match: dateFilter,
      },
      {
        $group: {
          _id: null,
          totalAmount: { $sum: "$settlements.amount" },
        },
      },
    ]);

    // console.log("cashTotal", cashTotal);

    // Extract totals or set to 0 if no settlements found
    const bankSettlementTotal =
      bankTotal.length > 0 ? bankTotal[0].totalAmount : 0;
    const cashSettlementTotal =
      cashTotal.length > 0 ? cashTotal[0].totalAmount : 0;
    const grandTotal = bankSettlementTotal + cashSettlementTotal;

    return res.status(200).json({
      message: "Balance found successfully",
      success: true,
      bankSettlementTotal,
      cashSettlementTotal,
      grandTotal,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
};

export const findSourceDetails = async (req, res) => {
  const cmp_id = req.params.cmp_id;
  const { accountGroup, startOfDayParam, endOfDayParam, todayOnly } = req.query;

  // Initialize dateFilter for settlements.created_at
  let dateFilter = {};
  if (startOfDayParam && endOfDayParam) {
    const startDate = parseISO(startOfDayParam);
    const endDate = parseISO(endOfDayParam);
    dateFilter = {
      $gte: startOfDay(startDate),
      $lte: endOfDay(endDate),
    };
  } else if (todayOnly === "true") {
    dateFilter = {
      $gte: startOfDay(new Date()),
      $lte: endOfDay(new Date()),
    };
  }

  try {
    let model;
    let nameField;

    switch (accountGroup) {
      case "cashInHand":
        model = cashModel;
        nameField = "cash_ledname";
        break;
      case "bankBalance":
        model = bankModel;
        nameField = "bank_ledname";
        break;
      default:
        return res.status(400).json({ message: "Invalid account group" });
    }

    const balanceDetails = await model.aggregate([
      {
        $match: {
          cmp_id: cmp_id, // Match by company ID initially
        },
      },
      {
        $project: {
          name: `$${nameField}`,
          settlements: {
            $cond: {
              if: { $isArray: "$settlements" },
              then: "$settlements",
              else: [],
            },
          },
          originalId: "$_id",
        },
      },
      {
        $unwind: {
          path: "$settlements",
          preserveNullAndEmptyArrays: true, // Keep documents even if no settlements
        },
      },
      {
        $project: {
          name: 1,
          originalId: 1,
          settlement: {
            $cond: [
              {
                $and: [
                  { $ifNull: ["$settlements", false] },
                  {
                    $gte: [
                      "$settlements.created_at",
                      dateFilter.$gte || new Date(0),
                    ],
                  },
                  {
                    $lte: [
                      "$settlements.created_at",
                      dateFilter.$lte || new Date(),
                    ],
                  },
                ],
              },
              "$settlements",
              null,
            ],
          },
        },
      },
      {
        $group: {
          _id: "$originalId",
          name: { $first: "$name" },
          settlementTotal: {
            $sum: {
              $cond: [
                { $ifNull: ["$settlement.amount", false] },
                "$settlement.amount",
                0,
              ],
            },
          },
        },
      },
      {
        $sort: { name: 1 }, // Sort by name alphabetically
      },
    ]);

    return res.status(200).json({
      message: "Balance details found successfully",
      success: true,
      accountGroup,
      data: balanceDetails.map((detail) => ({
        _id: detail._id,
        name: detail.name,
        total: detail.settlementTotal || 0, // Ensure zero if no total
      })),
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      error: "Internal Server Error",
      details: error.message,
    });
  }
};

export const findSourceTransactions = async (req, res) => {
  const { cmp_id, id } = req.params;
  const { startOfDayParam, endOfDayParam, accGroup } = req.query;

  try {
    let dateFilter = {};
    let openingBalanceFilter = {};
    if (startOfDayParam && endOfDayParam) {
      const startDate = parseISO(startOfDayParam);
      const endDate = parseISO(endOfDayParam);

      dateFilter = {
        "settlements.created_at": {
          $gte: startOfDay(startDate),
          $lte: endOfDay(endDate),
        },
      };

      // Filter for opening balance (before start date)
      openingBalanceFilter = {
        "settlements.created_at": {
          $lt: startOfDay(startDate),
        },
      };
    }

    let model;
    let openingField;
    switch (accGroup) {
      case "cashInHand":
        model = cashModel;
        openingField = "cash_opening";
        break;
      case "bankBalance":
        model = bankModel;
        openingField = "bank_opening";
        break;
      default:
        return res.status(400).json({ message: "Invalid account group" });
    }

    const [openingBalanceResult, transactions] = await Promise.all([
      // First pipeline to calculate opening balance
      model.aggregate([
        {
          $match: {
            _id: new mongoose.Types.ObjectId(id),
            cmp_id: cmp_id,
          },
        },
        {
          $project: {
            [openingField]: 1, // Include opening field
            settlements: {
              $cond: {
                if: { $isArray: "$settlements" },
                then: "$settlements",
                else: [],
              },
            },
          },
        },
        {
          $unwind: {
            path: "$settlements",
            preserveNullAndEmptyArrays: true,
          },
        },
        {
          $match: openingBalanceFilter,
        },
        {
          $group: {
            _id: null,
            calculatedOpeningBalance: { $sum: "$settlements.amount" },
            openingField: { $first: `$${openingField}` }, // Retrieve opening field value
          },
        },
        {
          $project: {
            _id: 0,
            openingBalance: {
              $add: ["$calculatedOpeningBalance", "$openingField"], // Combine calculated and opening field
            },
          },
        },
      ]),

      // Second pipeline to get current period transactions
      model.aggregate([
        {
          $match: {
            _id: new mongoose.Types.ObjectId(id),
            cmp_id: cmp_id,
          },
        },
        {
          $project: {
            settlements: {
              $cond: {
                if: { $isArray: "$settlements" },
                then: "$settlements",
                else: [],
              },
            },
          },
        },
        {
          $unwind: {
            path: "$settlements",
            preserveNullAndEmptyArrays: true,
          },
        },
        {
          $match: dateFilter,
        },
        {
          $group: {
            _id: null,
            settlements: { $push: "$settlements" },
            count: { $sum: 1 },
            total: { $sum: "$settlements.amount" },
          },
        },
        {
          $project: {
            _id: 0,
            settlements: {
              $map: {
                input: "$settlements",
                as: "settlement",
                in: {
                  voucherNumber: "$$settlement.voucherNumber",
                  _id: "$$settlement.voucherId",
                  party_name: "$$settlement.party",
                  enteredAmount: "$$settlement.amount",
                  createdAt: "$$settlement.created_at",
                  payment_mode: "$$settlement.payment_mode",
                  type: {
                    $switch: {
                      branches: [
                        {
                          case: { $eq: ["$$settlement.type", "receipt"] },
                          then: "Receipt",
                        },
                        {
                          case: { $eq: ["$$settlement.type", "payment"] },
                          then: "Payment",
                        },
                        {
                          case: { $eq: ["$$settlement.type", "sale"] },
                          then: "Tax Invoice",
                        },
                        {
                          case: { $eq: ["$$settlement.type", "vanSale"] },
                          then: "Van Sale",
                        },
                        {
                          case: { $eq: ["$$settlement.type", "purchase"] },
                          then: "Purchase",
                        },
                        {
                          case: { $eq: ["$$settlement.type", "creditNote"] },
                          then: "Credit Note",
                        },
                        {
                          case: { $eq: ["$$settlement.type", "debitNote"] },
                          then: "Debit Note",
                        },
                      ],
                      default: "$$settlement.type",
                    },
                  },
                },
              },
            },
            count: 1,
            total: 1,
          },
        },
      ]),
    ]);

    // Handle case when no transactions are found
    if (!transactions.length) {
      return res.status(200).json({
        message: "No transactions found for the specified period",
        success: true,
        data: {
          settlements: [],
          total: 0,
          count: 0,
          openingBalance: 0,
        },
      });
    }

    return res.status(200).json({
      message: "Transactions found successfully",
      success: true,
      data: {
        ...transactions[0],
        openingBalance: openingBalanceResult[0]?.openingBalance || 0,
      },
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      error: "Internal Server Error",
      details: error.message,
    });
  }
};

/// add bank

export const addBank = async (req, res) => {
  const {
    acholder_name,
    ac_no,
    ifsc,
    bank_name,
    branch,
    upi_id,
    cmp_id,
    bank_opening,
  } = req.body;
  const Primary_user_id = req.pUserId || req.owner;
  const bank_ledname = bank_name;

  try {
    const session = await mongoose.startSession();
    session.startTransaction();
    const bank = await bankModel({
      acholder_name,
      ac_no,
      ifsc,
      bank_name,
      branch,
      upi_id,
      cmp_id,
      Primary_user_id,
      bank_ledname,
      bank_opening,
    });

    const result = await bank.save();

    result.bank_id = result._id;
    await result.save({ session });

    await addCorrespondingParty(
      bank_name,
      Primary_user_id,
      cmp_id,
      "Bank Accounts",
      result._id,
      session
    );

    await session.commitTransaction();
    session.endSession();
    return res.status(200).json({
      success: true,
      message: "Bank added successfully",
      data: result,
    });
  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .json({ success: false, message: "Internal server error, try again!" });
  }
};

// @desc  edit edit bank details
// route get/api/pUsers/editBank

export const editBank = async (req, res) => {
  const bank_id = req.params.bank_id;

  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const udatedBank = await bankModel.findOneAndUpdate(
      { _id: bank_id },
      req.body,
      { new: true }
    );

    udatedBank.bank_id = udatedBank._id;
    udatedBank.bank_ledname = udatedBank.bank_name;
    udatedBank.save({ session });

    //// update corresponding party
    await editCorrespondingParty(
      udatedBank.bank_ledname,
      udatedBank.Primary_user_id,
      udatedBank.cmp_id,
      "Bank Accounts",
      udatedBank._id,
      session
    );

    await session.commitTransaction();
    session.endSession();

    res.status(200).json({
      success: true,
      message: "Bank updated successfully",
      data: udatedBank,
    });
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    console.error(error);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};

export const getBankDetails = async (req, res) => {
  try {
    const bankId = req?.params?.bank_id;
    if (!bankId) {
      return res
        .status(400)
        .json({ success: false, message: "Bank ID is required" });
    }

    const bankDetails = await bankModel.findById(bankId);

    if (!bankDetails) {
      return res
        .status(404)
        .json({ success: false, message: "Bank details not found" });
    }

    return res.status(200).json({ success: true, data: bankDetails });
  } catch (error) {
    console.error(`Error fetching bank details: ${error.message}`);

    return res
      .status(500)
      .json({ success: false, message: "Internal server error, try again!" });
  }
};

/// add bank

export const addCash = async (req, res) => {
  const { cash_ledname, cash_opening, cmp_id } = req.body;
  const Primary_user_id = req.pUserId || req.owner;
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const cash = await cashModel({
      cash_ledname,
      cash_opening,
      Primary_user_id,
      cmp_id,
    });

    const result = await cash.save({ session });

    result.cash_id = result._id;
    await result.save();

    await addCorrespondingParty(
      cash_ledname,
      Primary_user_id,
      cmp_id,
      "Cash-in-Hand",
      result._id,
    
      session
    );

    await session.commitTransaction();
    session.endSession();
    return res
      .status(200)
      .json({ success: true, message: "Cash added successfully" });
  } catch (error) {
    session.abortTransaction();
    session.endSession();
    console.error(error);
    return res
      .status(500)
      .json({ success: false, message: "Internal server error, try again!" });
  }
};

// gest cash details
export const getCashDetails = async (req, res) => {
  try {
    const cashId = req?.params?.cash_id;
    if (!cashId) {
      return res
        .status(400)
        .json({ success: false, message: "Cash is required" });
    }

    const cashDetails = await cashModel.findById(cashId);

    if (!cashDetails) {
      return res
        .status(404)
        .json({ success: false, message: "Bank details not found" });
    }

    return res.status(200).json({ success: true, data: cashDetails });
  } catch (error) {
    console.error(`Error fetching cash details: ${error.message}`);

    return res
      .status(500)
      .json({ success: false, message: "Internal server error, try again!" });
  }
};

// @desc  edit edit bank details
// route get/api/pUsers/editBank

export const editCash = async (req, res) => {
  const cash_id = req.params.cash_id;
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    const updatedCash = await cashModel.findOneAndUpdate(
      { _id: cash_id },
      req.body,
      { new: true }
    );

    updatedCash.cash_id = updatedCash._id;
    updatedCash.save({ session });

    //// update corresponding party
    await editCorrespondingParty(
      updatedCash.cash_ledname,
      updatedCash.Primary_user_id,
      updatedCash.cmp_id,
      "Cash-in-Hand",
      updatedCash._id,
      session
    );

    await session.commitTransaction();
    session.endSession();
    res.status(200).json({
      success: true,
      message: "Cash updated successfully",
      data: updatedCash,
    });
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    console.error(error);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};

export const sendPdfViaEmail = async (req, res) => {
  try {
    const { email: toEmail, subject, pdfBlob } = req.body;
    const cmp_id = req.params.cmp_id;

    if (!toEmail || !subject || !pdfBlob) {
      return res.status(400).json({ error: "Required fields are missing." });
    }

    // Fetch dynamic from email configuration from OrgModel
    const org = await OragnizationModel.findById(cmp_id).lean();
    if (!org || !org?.configurations[0]?.emailConfiguration) {
      return res.status(400).json({ error: "Email configuration not found." });
    }

    const { email: fromEmail, appPassword } =
      org?.configurations[0]?.emailConfiguration;

    // Create a transporter dynamically based on the from email domain
    const transporter = nodemailer.createTransport({
      service: getEmailService(fromEmail), // Dynamically determine the email service
      auth: {
        user: fromEmail,
        pass: appPassword,
      },
    });

    // Create the email options
    const mailOptions = {
      from: fromEmail,
      to: toEmail,
      subject,
      // text: message,
      attachments: [
        {
          filename: "camet.pdf", // The name you want the file to have
          content: pdfBlob, // The PDF buffer
          contentType: "application/pdf", // MIME type
          encoding: "base64", // Specify the encoding
        },
      ],
    };

    // Send the email
    await transporter.sendMail(mailOptions);
    return res.status(200).json({ message: "Email sent successfully." });
  } catch (error) {
    console.error("Error sending email:", error);
    return res.status(500).json({ error: "Failed to send email." });
  }
};
