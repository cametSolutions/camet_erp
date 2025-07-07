import hsnModel from "../models/hsnModel.js";
import productModel from "../models/productModel.js";
import salesModel from "../models/salesModel.js";
import stockTransferModel from "../models/stockTransferModel.js";
import creditNoteModel from "../models/creditNoteModel.js";
import debitNoteModel from "../models/debitNoteModel.js";
import invoiceModel from "../models/invoiceModel.js";
import vanSaleModel from "../models/vanSaleModel.js";
import purchaseModel from "../models/purchaseModel.js";

import {
  aggregateTransactions,
  aggregateOpeningBalance,
} from "../helpers/helper.js";
import { startOfDay, endOfDay, parseISO } from "date-fns";
import receiptModel from "../models/receiptModel.js";
import paymentModel from "../models/paymentModel.js";
import mongoose from "mongoose";
import TallyData from "../models/TallyData.js";
import OragnizationModel from "../models/OragnizationModel.js";
import nodemailer from "nodemailer";

/////
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
    summaryType = "none",
    serialNumber = "all",
    ignore = "", // New parameter for collections to ignore
    selectedSecondaryUser,
  } = req.query;

  const isAdmin = req.query.isAdmin === "true" ? true : false;

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
    // Apply user filtering:
    // - If not an admin → filter with logged-in user's ID
    // - If admin:
    //    - If a secondary user is selected → filter with selected user's _id
    //    - If no secondary user selected → don't apply user filter

    const matchCriteria = {
      ...dateFilter,
      cmp_id: new mongoose.Types.ObjectId(cmp_id),
      ...(party_id
        ? { "party._id": new mongoose.Types.ObjectId(party_id) }
        : {}),
      ...(!isAdmin
        ? { Secondary_user_id: new mongoose.Types.ObjectId(userId) }
        : selectedSecondaryUser
          ? {
            Secondary_user_id: new mongoose.Types.ObjectId(
              selectedSecondaryUser
            ),
          }
          : {}),
    };
    if (serialNumber !== "all") {
      matchCriteria.series_id = new mongoose.Types.ObjectId(serialNumber)
    }
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
      saleType: [
        { model: salesModel, type: "Tax Invoice", numberField: "salesNumber" },
        { model: vanSaleModel, type: "Van Sale", numberField: "salesNumber" },
        {
          model: creditNoteModel,
          type: "Credit Note",
          numberField: "creditNoteNumber",
        }
      ],
      purchaseType: [
        { model: purchaseModel, type: "Purchase", numberField: "purchaseNumber" },
        { model: debitNoteModel, type: "Debit Note", numberField: "debitNoteNumber" }
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
      ? (selectedVoucher === "allType" && summaryType === "Sales Summary") ? voucherTypeMap.saleType : (selectedVoucher === "allType" && summaryType === "Purchase Summary") ? voucherTypeMap.purchaseType : voucherTypeMap[selectedVoucher]
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
            // ...(userId && !isAdmin ? { Secondary_user_id: userId } : {}),
          },
          type,
          numberField,
          returnFullDetails
        )
    );

    const results = await Promise.all(transactionPromises);

    const combined = results
      .flat()
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    const totalTransactionAmount = combined.reduce((sum, transaction) => {
      const amount = Number(transaction.enteredAmount) || 0;
      return sum + amount;
    }, 0);
    if (combined.length > 0) {
      return res.status(200).json({
        message: `${selectedVoucher === "all"
          ? "All transactions"
          : selectedVoucher === "allType"
            ? "All"
            : `${voucherTypeMap[selectedVoucher]?.[0]?.type} transactions`
          } fetched${todayOnly === "true" ? " for today" : ""}`,
        data: { combined, totalTransactionAmount },
      });

   
    } else {
      return res.status(404).json({ message: "Transactions not found"});
    }
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      status: false,
      message: "Internal server error",
    });
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
        message: `HSN is linked with product ${attachedProduct[0].product_name} `,
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

        // console.log(`Processing document with bill_no: ${ doc.bill_no }, source: ${ sourceType } `);

        const config = modelConfig[sourceType];

        if (!config || !config.models?.length) {
          // console.log(`Invalid source type: ${ sourceType } `);
          results.failed++;
          results.errors.push({
            bill_no: doc.bill_no,
            error: `Invalid source type: ${doc.source} `,
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

          // console.log(`Searching in ${ modelConfig.type } with query: `, query);

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
          console.log(`No matching document found for bill_no: ${doc.bill_no} `);
          results.notFound++;
          results.errors.push({
            bill_no: doc.bill_no,
            source: doc.source,
            error: `Document not found in any of the relevant collections`,
            searchedIn: config.models.map((m) => m.type),
          });
        }
      } catch (error) {
        console.error(`Error processing document ${doc.bill_no}: `, error);
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
        successRate: `${((results.updated / results.total) * 100).toFixed(2)}% `,
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
