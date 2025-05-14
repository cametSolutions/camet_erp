import invoiceModel from "../models/invoiceModel.js";
import receiptModel from "../models/receiptModel.js";
import paymentModel from "../models/paymentModel.js";
import salesModel from "../models/salesModel.js";
import stockTransferModel from "../models/stockTransferModel.js";
import TransactionModel from "../models/TransactionModel.js";
import vanSaleModel from "../models/vanSaleModel.js";
import purchaseModel from "../models/purchaseModel.js";
import mongoose from "mongoose";

export const fetchData = async (type, cmp_id, serialNumber, res, userId) => {
  let model;
  switch (type) {
    case "invoices":
      model = invoiceModel;
      break;
    case "sales":
      model = salesModel;
      break;
    case "vanSales":
      model = vanSaleModel;
      break;
    case "purchase":
      model = purchaseModel;
      break;
    case "transactions":
      model = TransactionModel;
      break;
    case "stockTransfers":
      model = stockTransferModel;
      break;
    case "receipt":
      model = receiptModel;
      break;
    case "payment":
      model = paymentModel;
      break;
    default:
      return res.status(400).json({ message: "Invalid type parameter" });
  }

  console.log(type, userId);

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

    console.log("query", query);

    const data = await model.find(query).lean();

    if (data.length === 0) {
      return res.status(404).json({ message: `${type} not found` });
    }

    // For receipt and payment, return full data without processing
    if (type === "receipt" || type === "payment") {
      data.forEach((doc) => {
        doc.party.billData = doc.billData;
        delete doc.billData;
      });
      return res.status(200).json({
        message: `${type} fetched`,
        data: data,
      });
    }

    // For other document types, process GodownList and Priceleveles
    const processedData = data.map((document) => {
      // Skip processing if no items array
      if (!Array.isArray(document.items)) {
        return document;
      }

      return {
        ...document,
        items: document.items.map((item) => {
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
        }),
      };
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
