import invoiceModel from "../models/invoiceModel.js";
import receiptModel from "../models/receiptModel.js";
import paymentModel from "../models/paymentModel.js";
import salesModel from "../models/salesModel.js";
import stockTransferModel from "../models/stockTransferModel.js";
import TransactionModel from "../models/TransactionModel.js";
import vanSaleModel from "../models/vanSaleModel.js";
import purchaseModel from "../models/purchaseModel.js";
import VoucherSeriesModel from "../models/VoucherSeriesModel.js";

import mongoose from "mongoose";

export const fetchData = async (type, cmp_id, serialNumber, res, userId) => {
  let model;
  let voucherType; // For series lookup
  
  switch (type) {
    case "invoices":
      model = invoiceModel;
      voucherType = "saleOrder";
      break;
    case "sales":
      model = salesModel;
      voucherType = "sales";
      break;
    case "vanSales":
      model = vanSaleModel;
      voucherType = "vanSale";
      break;
    case "purchase":
      model = purchaseModel;
      voucherType = "purchase";
      break;
    case "transactions":
      model = TransactionModel;
      voucherType = "transactions";
      break;
    case "stockTransfers":
      model = stockTransferModel;
      voucherType = "stockTransfer";
      break;
    case "receipt":
      model = receiptModel;
      voucherType = "receipt";
      break;
    case "payment":
      model = paymentModel;
      voucherType = "payment";
      break;
    default:
      return res.status(400).json({ message: "Invalid type parameter" });
  }


  try {
    let query = {
      cmp_id: new mongoose.Types.ObjectId(cmp_id),
    };

    // Special case for vanSales when userId is present
    if (type === "vanSales" && userId) {
      // Use userLevelSerialNumber for vanSales with userId
      if (serialNumber) {
        query.userLevelSerialNumber = { $gt: serialNumber };
        query.Secondary_user_id = new mongoose.Types.ObjectId(userId);
      }
    } else {
      // Default behavior for all other cases
      if (serialNumber) {
        query.serialNumber = { $gt: serialNumber };
      }
    }

    const data = await model.find(query).lean();

    if (data.length === 0) {
      return res.status(404).json({ message: `${type} not found` });
    }

    // Extract unique series_ids from all documents
    const seriesIds = [...new Set(
      data
        .filter(doc => doc.series_id)
        .map(doc => doc.series_id.toString())
    )];

    console.log("Series IDs:", seriesIds);
    

    // Fetch all series documents in one query
    let seriesMap = new Map();
    if (seriesIds.length > 0) {
      const seriesDocuments = await VoucherSeriesModel.find({
        cmp_id: new mongoose.Types.ObjectId(cmp_id),
        voucherType: voucherType, // Use voucherType instead of type
        "series._id": { $in: seriesIds.map(id => new mongoose.Types.ObjectId(id)) }
      }).lean();

      // Create a map for O(1) lookup: series_id -> series details
      seriesDocuments.forEach(seriesDoc => {
        if (seriesDoc.series && Array.isArray(seriesDoc.series)) {
          seriesDoc.series.forEach(series => {
            // Store only required fields
            seriesMap.set(series._id.toString(), {
              seriesName: series.seriesName,
              prefix: series.prefix,
              suffix: series.suffix
            });
          });
        }
      });
    }

    console.log("Series Map:", seriesMap);

    // For receipt and payment, return full data without processing
    if (type === "receipt" || type === "payment") {
      const processedData = data.map(doc => {
        const processedDoc = { ...doc };
        processedDoc.party.billData = doc.billData;
        delete processedDoc.billData;
        
        // Attach series details if available
        if (doc.series_id && seriesMap.has(doc.series_id.toString())) {
          processedDoc.seriesDetails = seriesMap.get(doc.series_id.toString());
        }
        
        return processedDoc;
      });

      return res.status(200).json({
        message: `${type} fetched`,
        data: processedData,
      });
    }

    // For other document types, process GodownList and Priceleveles
    const processedData = data.map((document) => {
      let processedDocument = { ...document };

      // Attach series details if available
      if (document.series_id && seriesMap.has(document.series_id.toString())) {
        processedDocument.seriesDetails = seriesMap.get(document.series_id.toString());
      }

      // Skip processing if no items array
      if (!Array.isArray(document.items)) {
        return processedDocument;
      }

      processedDocument.items = document.items.map((item) => {
        const processedItem = { ...item };

        // Filter Priceleveles array to match document's priceLevel
        if (Array.isArray(item.Priceleveles) && document.priceLevel) {
          processedItem.Priceleveles = item.Priceleveles.filter(
            (price) => price.pricelevel === document.priceLevel
          );
        }

        // Process GodownList if it exists
        if (Array.isArray(item.GodownList)) {
          if (item.hasGodownOrBatch === true) {
            processedItem.GodownList = item.GodownList.filter(
              (godown) => godown.added === true
            );
          }
        }

        return processedItem;
      });

      return processedDocument;
    });

    return res.status(200).json({
      message: `${type} fetched`,
      data: processedData,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      status: false,
      message: "Internal server error",
    });
  }
};