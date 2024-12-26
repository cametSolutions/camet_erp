import mongoose from "mongoose";
import Sales from '../models/salesModel.js';
import Purchases from '../models/purchaseModel.js';
import Invoices from '../models/invoiceModel.js';
import CreditNotes from '../models/creditNoteModel.js';
import DebitNotes from '../models/debitNoteModel.js';
import VanSales from '../models/vanSaleModel.js';
import Receipts from '../models/receiptModel.js';
import Payments from '../models/paymentModel.js';

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
        const documents = await collection.find({ date: { $exists: false } }).toArray();
  
        console.log(`Processing ${documents.length} documents in ${collectionName}`);
  
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
        const documents = await model.find({ });
        console.log(
          `Processing ${documents.length} documents in ${collectionName} for cmp_id: ${cmp_id}`
        );
  
        let successCount = 0;
        for (const doc of documents) {
          try {
            if (doc.createdAt) {
              // Simply create new date and set time to midnight
              const dateObj = new Date(doc.createdAt);
              dateObj.setUTCHours(0, 0, 0, 0);  // Using setUTCHours to ensure consistency
  
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
  
  
  
  
  
