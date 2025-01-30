import mongoose from "mongoose";
import Sales from "../models/salesModel.js";
import Purchases from "../models/purchaseModel.js";
import Invoices from "../models/invoiceModel.js";
import CreditNotes from "../models/creditNoteModel.js";
import DebitNotes from "../models/debitNoteModel.js";
import VanSales from "../models/vanSaleModel.js";
import Receipts from "../models/receiptModel.js";
import Payments from "../models/paymentModel.js";
import ProductModel from "../models/productModel.js";
import salesModel from "../models/salesModel.js";
import purchaseModel from "../models/purchaseModel.js";
import primaryUserModel from "../models/primaryUserModel.js";
import OragnizationModel from "../models/OragnizationModel.js";
import secondaryUserModel from "../models/secondaryUserModel.js";

/**
 * @description Updates the `date` field in documents where it is missing
 * by using the `createdAt` field as the value. This is useful for
 * backfilling the `date` field in legacy data.
 */
export const updateDateFields = async (req, res) => {
  try {
    // List of collections to process
    const collections = [
      "sales",
      "purchases",
      "invoices",
      "creditnotes",
      "debitnotes",
      "vansales",
      "receipts",
      "payments",
    ];

    const results = [];
    const failedDocuments = [];

    for (const collectionName of collections) {
      const collection = mongoose.connection.collection(collectionName);

      // Find documents missing the `date` field
      const documents = await collection
        .find({ date: { $exists: false } })
        .toArray();

      console.log(
        `Processing ${documents.length} documents in ${collectionName}`
      );

      let successCount = 0;

      for (const doc of documents) {
        try {
          if (doc.createdAt) {
            // Convert `createdAt` to local date with time set to midnight
            const createdAtDate = new Date(doc.createdAt);
            createdAtDate.setHours(0, 0, 0, 0);

            // Update the document with the new `date` field
            await collection.updateOne(
              { _id: doc._id },
              { $set: { date: createdAtDate } }
            );
            successCount++;
          } else {
            failedDocuments.push({ id: doc._id, collection: collectionName });
          }
        } catch (error) {
          console.error(`Failed to update document ${doc._id}:`, error.message);
          failedDocuments.push({ id: doc._id, collection: collectionName });
        }
      }

      results.push({
        collection: collectionName,
        totalDocuments: documents.length,
        successCount,
        failureCount: documents.length - successCount,
      });
    }

    return res.status(200).json({
      message: "Date fields updated with results.",
      results,
      failedDocuments,
    });
  } catch (error) {
    console.error("Error updating date fields:", error);
    return res.status(500).json({
      message: "Failed to update date fields.",
      error: error.message,
    });
  }
};

/**
 * @desc Updates `date` fields of sales, purchases, invoices, creditnotes, debitnotes, vansales, receipts, and payments
 *        by taking the `createdAt` field and setting the time to midnight.
 * @route PUT /api/testing/updateDateFields/:cmp_id
 * @access Private
 */
export const updateDateFieldsByCompany = async (req, res) => {
  try {
    const { cmp_id } = req.params;
    if (!cmp_id) {
      return res.status(400).json({
        message: "Missing cmp_id parameter.",
      });
    }

    const models = {
      sales: Sales,
      purchases: Purchases,
      invoices: Invoices,
      creditnotes: CreditNotes,
      debitnotes: DebitNotes,
      vansales: VanSales,
      receipts: Receipts,
      payments: Payments,
    };

    const results = [];
    const failedDocuments = [];

    for (const [collectionName, model] of Object.entries(models)) {
      // console.log("model", model);
      // console.log("cmp_id", cmp_id);
      const documents = await model.find({});
      console.log(
        `Processing ${documents.length} documents in ${collectionName} for cmp_id: ${cmp_id}`
      );

      let successCount = 0;
      for (const doc of documents) {
        try {
          if (doc.createdAt) {
            // Simply create new date and set time to midnight
            const dateObj = new Date(doc.createdAt);
            dateObj.setUTCHours(0, 0, 0, 0); // Using setUTCHours to ensure consistency

            await model.updateOne(
              { _id: doc._id },
              { $set: { date: dateObj } }
            );
            successCount++;
          } else {
            failedDocuments.push({ id: doc._id, collection: collectionName });
          }
        } catch (error) {
          console.error(`Failed to update document ${doc._id}:`, error.message);
          failedDocuments.push({ id: doc._id, collection: collectionName });
        }
      }

      results.push({
        collection: collectionName,
        totalDocuments: documents.length,
        successCount,
        failureCount: documents.length - successCount,
      });
    }

    return res.status(200).json({
      message: "Date fields updated with results.",
      cmp_id,
      results,
      failedDocuments,
    });
  } catch (error) {
    console.error("Error updating date fields:", error);
    return res.status(500).json({
      message: "Failed to update date fields.",
      error: error.message,
    });
  }
};

/**
 * @desc Updates unit fields of a product by removing any '-' (hyphen) from the unit and alt_unit fields.
 * @route PUT /api/testing/updateUnitFields/:cmp_id
 * @access Private
 */
export const updateUnitFields = async (req, res) => {
  try {
    // Find all products and update the unit and alt_unit fields
    const result = await ProductModel.updateMany(
      {}, // Empty filter to match all documents
      [
        {
          $set: {
            unit: {
              $arrayElemAt: [
                { $split: ["$unit", "-"] }, // Split 'unit' on '-' and get the first part
                0,
              ],
            },
            alt_unit: {
              $arrayElemAt: [
                { $split: ["$alt_unit", "-"] }, // Split 'alt_unit' on '-' and get the first part
                0,
              ],
            },
          },
        },
      ]
    );

    return res.status(200).json({
      message: "Unit fields updated for all products.",
      modifiedCount: result.modifiedCount,
    });
  } catch (error) {
    console.error("Error updating all unit fields:", error);
    return res.status(500).json({
      message: "An error occurred while updating unit fields for all products.",
      error: error.message,
    });
  }
};

export const updateSalesItemUnitFields = async (req, res) => {
  try {
    // Find all sales documents and update the unit and alt_unit fields in items array
    // const result = await salesModel.updateMany(
    const result = await purchaseModel.updateMany(
      {}, // Empty filter to match all documents
      [
        {
          $set: {
            items: {
              $map: {
                input: "$items",
                as: "item",
                in: {
                  $mergeObjects: [
                    "$$item",
                    {
                      unit: {
                        $arrayElemAt: [{ $split: ["$$item.unit", "-"] }, 0],
                      },
                      alt_unit: {
                        $cond: {
                          if: { $eq: ["$$item.alt_unit", ""] },
                          then: "",
                          else: {
                            $arrayElemAt: [
                              { $split: ["$$item.alt_unit", "-"] },
                              0,
                            ],
                          },
                        },
                      },
                    },
                  ],
                },
              },
            },
          },
        },
      ]
    );

    return res.status(200).json({
      message: "Unit fields updated for all sales items.",
      modifiedCount: result.modifiedCount,
    });
  } catch (error) {
    console.error("Error updating sales items unit fields:", error);
    return res.status(500).json({
      message: "An error occurred while updating unit fields for sales items.",
      error: error.message,
    });
  }
};

export const convertPrimaryToSecondary = async (req, res) => {
  try {
    const primaryUsers = await primaryUserModel.find({});
    if (!primaryUsers || primaryUsers.length === 0) {
      return res.status(404).json({ message: "No primary users found" });
    }

    for (const user of primaryUsers) {
      const existingSecondary = await secondaryUserModel.findOne({
        // email: user.email,
        mobile: user.mobile,
      });

      if (existingSecondary) {
        console.log(`User with email ${user.email} and mobile ${user.mobile} already exists as a secondary user.`);
        // continue; // Skip conversion if already exists
      }

      const organizations = await OragnizationModel.find({ owner: user._id });

      const secondaryUser = new secondaryUserModel({
        name: user.userName,
        email: user.email,
        mobile: user.mobile,
        password: user.password,
        organization: organizations.map((org) => org._id),
        primaryUser: user._id,
        role: "admin",
      });

      await secondaryUser.save();
      console.log("Converted primary user to secondary:", secondaryUser);
    }

    return res.status(200).json({ message: "Primary users successfully converted to secondary users where applicable." });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Error in converting primary to secondary" });
  }
};
