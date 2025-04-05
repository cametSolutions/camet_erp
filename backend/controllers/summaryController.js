import { startOfDay, endOfDay, parseISO } from "date-fns";
import salesModel from "../models/salesModel.js";
import invoiceModel from "../models/invoiceModel.js";
import vanSaleModel from "../models/vanSaleModel.js";
import purchaseModel from "../models/purchaseModel.js";
import { aggregateSummary } from "../helpers/summaryHelper.js";
import debitNoteModel from "../models/debitNoteModel.js";
import creditNoteModel from "../models/creditNoteModel.js";

//summary report controller
export const getSummary = async (req, res) => {
  const { startOfDayParam, endOfDayParam, selectedVoucher } = req.query;

  try {
    const cmp_id = req.params.cmp_id;

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
    }
    const matchCriteria = {
      ...dateFilter,
      cmp_id: cmp_id,
    };

    // Define summary type mappings
    const summaryTypeMap = {
      sale: [{ model: salesModel, numberField: "salesNumber", type: "sale" }],
      saleOrder: [
        { model: invoiceModel, numberField: "orderNumber", type: "saleOrder" },
      ],
      vanSale: [
        { model: vanSaleModel, numberField: "salesNumber", type: "vanSale" },
      ],
      purchase: [
        {
          model: purchaseModel,
          numberField: "purchaseNumber",
          type: "purchase",
        },
      ],
      debitNote: [
        {
          model: debitNoteModel,
          numberField: "debitNoteNumber",
          type: "debitNote",
        },
      ],
      creditNote: [
        {
          model: creditNoteModel,
          numberField: "creditNoteNumber",
          type: "creditNote",
        },
      ],
    };

    // Handle special case for "sale" which should include both sale and vanSale
    let modelsToQuery = [];
    if (selectedVoucher === "sale") {
      modelsToQuery = [...summaryTypeMap.sale, ...summaryTypeMap.vanSale];
    } else {
      modelsToQuery = selectedVoucher ? summaryTypeMap[selectedVoucher] : "";
    }

    if (!modelsToQuery || modelsToQuery.length === 0) {
      return res.status(400).json({
        status: false,
        message: "Invalid voucher type selected",
      });
    }

    // Create transaction promises based on selected voucher type
    const summaryPromises = modelsToQuery.map(({ model, numberField, type }) =>
      aggregateSummary(model, matchCriteria, numberField, type)
    );

    const results = await Promise.all(summaryPromises);

    // Flatten results while adding a source identifier
    const flattenedResults = results.flat();

    if (flattenedResults.length > 0) {
      return res
        .status(200)
        .json({ message: "Summary data found", flattenedResults });
    } else {
      return res.status(404).json({ message: "No summary data found" });
    }
  } catch (error) {
    console.log("error:", error.message);
    return res.status(500).json({
      status: false,
      message: "Error retrieving summary data",
      error: error.message,
    });
  }
};

// Aggregation helper function
