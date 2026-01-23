import { startOfDay, endOfDay, parseISO } from "date-fns";
import salesModel from "../models/salesModel.js";
import invoiceModel from "../models/invoiceModel.js";
import vanSaleModel from "../models/vanSaleModel.js";
import purchaseModel from "../models/purchaseModel.js";
import { aggregateSummary } from "../helpers/summaryHelper.js";
import debitNoteModel from "../models/debitNoteModel.js";
import creditNoteModel from "../models/creditNoteModel.js";
import mongoose from "mongoose";

//summary report controller
// export const getSummary = async (req, res) => {
//   const {
//     startOfDayParam,
//     endOfDayParam,
//     selectedVoucher,
//     summaryType,
//     selectedOption
//   } = req.query;

//   try {
//     const cmp_id = req.params.cmp_id;
//     const companyObjectId = new mongoose.Types.ObjectId(cmp_id);

//     /* ---------------- DATE FILTER ---------------- */
//     let dateFilter = {};
//     if (startOfDayParam && endOfDayParam) {
//       const startDate = parseISO(startOfDayParam);
//       const endDate = parseISO(endOfDayParam);
//       dateFilter = {
//         date: {
//           $gte: startOfDay(startDate),
//           $lte: endOfDay(endDate),
//         },
//       };
//     }

//     const matchCriteria = {
//       ...dateFilter,
//       cmp_id: companyObjectId,
//     };

//     /* ---------------- CONFIG ---------------- */
//     const config = {
//       "sales summary": {
//         alltype: [
//           { model: salesModel, billField: "salesNumber" },
//           { model: vanSaleModel, billField: "salesNumber" },
//           { model: creditNoteModel, billField: "creditNoteNumber" },
//         ],
//         sale: [{ model: salesModel, billField: "salesNumber" }],
//         vansale: [{ model: vanSaleModel, billField: "salesNumber" }],
//         creditnote: [{ model: creditNoteModel, billField: "creditNoteNumber" }],
//       },
//       "purchase summary": {
//         alltype: [
//           { model: purchaseModel, billField: "purchaseNumber" },
//           { model: debitNoteModel, billField: "debitNoteNumber" },
//         ],
//         purchase: [{ model: purchaseModel, billField: "purchaseNumber" }],
//         debitnote: [{ model: debitNoteModel, billField: "debitNoteNumber" }],
//       },
//       "order summary": {
//         saleorder: [{ model: invoiceModel, billField: "orderNumber" }],
//       },
//     };

//     const selectedSummary = config[summaryType?.toLowerCase()];
//     if (!selectedSummary) throw new Error("Invalid summaryType");

//     const selectedModels = selectedSummary[selectedVoucher?.toLowerCase()];
//     if (!selectedModels) throw new Error("Invalid voucherType");

//     /* ---------------- GROUP ID ---------------- */
//     let groupId = {};
//     switch (selectedOption) {
//       case "Ledger":
//         groupId = {
//           partyName: "$party.partyName",
//           itemName: "$items.product_name",
//         };
//         break;
//       case "Stock Category":
//         groupId = { categoryName: "$categoryInfo.category" };
//         break;
//       case "Stock Group":
//         groupId = { groupName: "$brandInfo.brand" };
//         break;
//       case "Stock Item":
//         groupId = { itemName: "$items.product_name" };
//         break;
//       default:
//         groupId = { itemName: "$items.product_name" };
//     }

//     /* ---------------- PIPELINES ---------------- */
//     const pipelines = [];

//     for (const { model, billField } of selectedModels) {
//       pipelines.push(
//         model.aggregate([
//           { $match: matchCriteria },
//           { $unwind: "$items" },

//           /* ---------- SAFE UNWIND ---------- */
//           {
//             $unwind: {
//               path: "$items.GodownList",
//               preserveNullAndEmptyArrays: true,
//             },
//           },

//           /* ---------- CATEGORY LOOKUP ---------- */
//           {
//             $lookup: {
//               from: "categories",
//               localField: "items.category",
//               foreignField: "_id",
//               as: "categoryInfo",
//             },
//           },
//           { $unwind: { path: "$categoryInfo", preserveNullAndEmptyArrays: true } },

//           /* ---------- BRAND LOOKUP ---------- */
//           {
//             $lookup: {
//               from: "brands",
//               localField: "items.brand",
//               foreignField: "_id",
//               as: "brandInfo",
//             },
//           },
//           { $unwind: { path: "$brandInfo", preserveNullAndEmptyArrays: true } },

//           /* ---------- GROUP ---------- */
//           {
//             $group: {
//               _id: {
//                 ...groupId,
//                 voucherSeries: `$${billField}`,
//               },

//               gstNo: { $first: "$party.gstNo" },
//               seriesid: { $first: "$series_id" },

//               godownList: {
//                 $push: {
//                   godown_id: "$items.GodownList.godown_id",
//                   batch: "$items.GodownList.batch",
//                   count: { $ifNull: ["$items.GodownList.count", "$items.qty"] },
//                   rate: { $ifNull: ["$items.GodownList.basePrice", "$items.rate"] },
//                   taxableAmount: {
//                     $ifNull: ["$items.GodownList.taxableAmount", "$items.taxableAmount"],
//                   },
//                   individualTotal: {
//                     $ifNull: ["$items.GodownList.individualTotal", "$items.totalAmount"],
//                   },
//                   discountAmount: {
//                     $ifNull: ["$items.GodownList.discountAmount", 0],
//                   },
//                   igstValue: { $ifNull: ["$items.GodownList.igstValue", "$items.taxPercentage"] },
//                   igstAmount: { $ifNull: ["$items.GodownList.igstAmount", "$items.taxAmount"] },
//                   partyName: "$party.partyName",
//                   hsn: "$items.hsn_code",
//                 },
//               },

//               itemMeta: {
//                 $first: {
//                   billnumber: `$${billField}`,
//                   billDate: {
//                     $dateToString: { format: "%d-%m-%Y", date: "$date" },
//                   },
//                   itemName: "$items.product_name",
//                   item_mrp: "$items.item_mrp",
//                   product_code: "$items.product_code",
//                   categoryName: "$categoryInfo.category",
//                   groupName: "$brandInfo.brand",
//                 },
//               },
//             },
//           },
//         ])
//       );
//     }

//     /* ---------------- EXECUTION ---------------- */
//     const output = await Promise.all(pipelines);
//     const mergedResults = output.flat();

//     /* ---------------- POST PROCESS ---------------- */
//     const grouped = new Map();

//     for (const record of mergedResults) {
//       const key =
//         selectedOption === "Ledger"
//           ? record._id.partyName
//           : selectedOption === "Stock Category"
//           ? record._id.categoryName
//           : selectedOption === "Stock Group"
//           ? record._id.groupName
//           : record._id.itemName;

//       if (!grouped.has(key)) {
//         grouped.set(key, {
//           itemType: key,
//           seriesID: record.seriesid,
//           saleAmount: 0,
//           sale: [],
//         });
//       }

//       const group = grouped.get(key);

//       for (const g of record.godownList) {
//         const amount = g.taxableAmount || 0;
//         group.saleAmount += amount;

//         group.sale.push({
//           ...record.itemMeta,
//           quantity: g.count || 0,
//           rate: g.rate || 0,
//           taxPercentage: g.igstValue || 0,
//           taxAmount: g.igstAmount || 0,
//           netAmount: g.individualTotal || 0,
//           gstNo: record.gstNo,
//           hsn: g.hsn,
//           amount,
//           partyName: g.partyName,
//         });
//       }
//     }

//     const mergedsummary = Array.from(grouped.values());

//     if (!mergedsummary.length) {
//       return res.status(404).json({ message: "No summary data found" });
//     }

//     return res.status(200).json({
//       message: "Summary data found",
//       mergedsummary,
//     });
//   } catch (error) {
//     console.error("Summary Error:", error);
//     return res.status(500).json({
//       status: false,
//       message: "Error retrieving summary data",
//       error: error.message,
//     });
//   }
// };

export const getSummary = async (req, res) => {
  const {
    startOfDayParam,
    endOfDayParam,
    selectedVoucher,
    summaryType,
    selectedOption,
  } = req.query;

  try {
    const cmp_id = req.params.cmp_id;
    const companyObjectId = new mongoose.Types.ObjectId(cmp_id);

    // ---------------- DATE FILTER ----------------
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
      cmp_id: companyObjectId,
    };

    // ---------------- CONFIG ----------------
    const config = {
      "sales summary": {
        alltype: [
          { model: salesModel, billField: "salesNumber" },
          { model: vanSaleModel, billField: "salesNumber" },
          { model: creditNoteModel, billField: "creditNoteNumber" },
        ],
        sale: [{ model: salesModel, billField: "salesNumber" }],
        vansale: [{ model: vanSaleModel, billField: "salesNumber" }],
        creditnote: [{ model: creditNoteModel, billField: "creditNoteNumber" }],
      },

      "purchase summary": {
        alltype: [
          { model: purchaseModel, billField: "purchaseNumber" },
          { model: debitNoteModel, billField: "debitNoteNumber" },
        ],
        purchase: [{ model: purchaseModel, billField: "purchaseNumber" }],
        debitnote: [{ model: debitNoteModel, billField: "debitNoteNumber" }],
      },

      "order summary": {
        saleorder: [{ model: invoiceModel, billField: "orderNumber" }],
      },
    };

    const selectedSummary = config[summaryType.toLowerCase()];
    if (!selectedSummary) throw new Error("Invalid summaryType");

    const selectedModels = selectedSummary[selectedVoucher.toLowerCase()];
    if (!selectedModels) throw new Error("Invalid voucherType");

    // ---------------- GROUP ID ----------------
    let groupId = {};
    switch (selectedOption) {
      case "Ledger":
        groupId = {
          partyName: "$party.partyName",
          itemName: "$items.product_name",
        };
        break;
      case "Stock Category":
        groupId = { categoryName: "$categoryInfo.category" };
        break;
      case "Stock Group":
        groupId = { groupName: "$brandInfo.brand" };
        break;
      case "voucher":
      case "Stock Item":
      default:
        groupId = { itemName: "$items.product_name" };
    }

    const pipelines = [];

    // ---------------- AGGREGATION ----------------
    for (const { model, billField } of selectedModels) {
      pipelines.push(
        model.aggregate([
          { $match: matchCriteria },

          { $unwind: "$items" },

          // detect godown existence
          {
            $addFields: {
              hasGodown: {
                $gt: [{ $size: { $ifNull: ["$items.GodownList", []] } }, 0],
              },
            },
          },

          // unwind godown safely
          {
            $unwind: {
              path: "$items.GodownList",
              preserveNullAndEmptyArrays: true,
            },
          },

          // allow service OR added stock
          {
            $match: {
              $or: [{ hasGodown: false }, { "items.GodownList.added": true }],
            },
          },

          // category lookup
          {
            $lookup: {
              from: "categories",
              localField: "items.category",
              foreignField: "_id",
              as: "categoryInfo",
            },
          },
          {
            $unwind: {
              path: "$categoryInfo",
              preserveNullAndEmptyArrays: true,
            },
          },

          // brand lookup
          {
            $lookup: {
              from: "brands",
              localField: "items.brand",
              foreignField: "_id",
              as: "brandInfo",
            },
          },
          {
            $unwind: {
              path: "$brandInfo",
              preserveNullAndEmptyArrays: true,
            },
          },

          // group
          {
            $group: {
              _id: {
                ...groupId,
                voucherSeries: `$${billField}`,
              },

              gstNo: { $first: "$party.gstNo" },
              seriesid: { $first: "$series_id" },

              godownList: {
                $push: {
                  godown_id: "$items.GodownList.godown_id",
                  batch: "$items.GodownList.batch",

                  count: {
                    $cond: ["$hasGodown", "$items.GodownList.count", 1],
                  },

                  selectedPriceRate: {
                    $cond: [
                      "$hasGodown",
                      "$items.GodownList.selectedPriceRate",
                      "$items.rate",
                    ],
                  },

                  discountAmount: {
                    $ifNull: ["$items.GodownList.discountAmount", 0],
                  },

                  igstValue: {
                    $cond: [
                      "$hasGodown",
                      "$items.GodownList.igstValue",
                      "$items.igst",
                    ],
                  },

                  igstAmount: {
                    $cond: [
                      "$hasGodown",
                      "$items.GodownList.igstAmount",
                      "$items.totalIgstAmt",
                    ],
                  },

                  cessValue: {
                    $ifNull: ["$items.GodownList.cessValue", 0],
                  },

                  cessAmount: {
                    $ifNull: ["$items.GodownList.cessAmount", 0],
                  },

                  taxableAmount: {
                    $cond: [
                      "$hasGodown",
                      "$items.GodownList.taxableAmount",
                      "$items.total",
                    ],
                  },

                  individualTotal: {
                    $cond: [
                      "$hasGodown",
                      "$items.GodownList.individualTotal",
                      "$items.total",
                    ],
                  },

                  partyName: "$party.partyName",
                  hsn: "$items.hsn_code",
                  batchEnabled: "$items.batchEnabled",
                  gdnEnabled: "$items.gdnEnabled",
                },
              },

              itemMeta: {
                $first: {
                  billnumber: `$${billField}`,
                  billDate: {
                    $dateToString: {
                      format: "%d-%m-%Y",
                      date: "$date",
                    },
                  },
                  itemName: "$items.product_name",
                  item_mrp: "$items.item_mrp",
                  product_code: "$items.product_code",
                  categoryName: "$categoryInfo.category",
                  groupName: "$brandInfo.brand",
                },
              },
            },
          },
        ]),
      );
    }

    // ---------------- EXECUTE ----------------
    const output = await Promise.all(pipelines);
    const mergedResults = output.flat();

    // ---------------- POST PROCESS ----------------
    const groupedByParty = new Map();

    for (const record of mergedResults) {
      const filtername =
        selectedOption === "Ledger"
          ? record._id.partyName
          : selectedOption === "Stock Category"
            ? record._id.categoryName
            : selectedOption === "Stock Group"
              ? record._id.groupName
              : record._id.itemName;

      if (!groupedByParty.has(filtername)) {
        groupedByParty.set(filtername, {
          itemType: filtername,
          seriesID: record.seriesid,
          saleAmount: 0,
          sale: [],
        });
      }

      const partySummary = groupedByParty.get(filtername);

      const rate =
        record.godownList?.[0]?.selectedPriceRate ??
        record.itemMeta.item_mrp ??
        0;

      for (const g of record.godownList) {
        partySummary.sale.push({
          ...record.itemMeta,
          quantity: g.count,
          rate: Number(rate).toFixed(2),
          discount: g.discountAmount,
          taxPercentage: g.igstValue,
          taxAmount: g.igstAmount,
          gstNo: record.gstNo,
          hsn: g.hsn,
          netAmount: g.individualTotal,
          amount: g.taxableAmount,
          partyName: g.partyName,
        });

        partySummary.saleAmount += g.individualTotal || 0;
      }
    }

    const mergedsummary = Array.from(groupedByParty.values());

    // ---------------- RESPONSE ----------------
    if (mergedsummary.length > 0) {
      return res.status(200).json({
        message: "Summary data found",
        mergedsummary,
      });
    }

    return res.status(404).json({
      message: "No summary data found",
    });
  } catch (error) {
    console.error("getSummary error:", error);
    return res.status(500).json({
      status: false,
      message: "Error retrieving summary data",
      error: error.message,
    });
  }
};

export const getSummaryReport = async (req, res) => {
  try {
    const cmp_id = req.params.cmp_id;
    const companyObjectId = new mongoose.Types.ObjectId(cmp_id);

    const {
      start,
      end,
      voucherType,
      serialNumber,
      summaryType,
      selectedOption,
    } = req.query;

    let dateFilter = {};
    if (start && end) {
      const startDate = parseISO(start);
      const endDate = parseISO(end);
      dateFilter = {
        date: {
          $gte: startOfDay(startDate),
          $lte: endOfDay(endDate),
        },
      };
    }
    const matchCriteria = {
      ...dateFilter,
      cmp_id: companyObjectId,
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
    //alltype is only for sale and purchase
    if (voucherType === "allType") {
      if (summaryType === "Sales Summary") {
        modelsToQuery = [
          ...summaryTypeMap.sale,
          ...summaryTypeMap.vanSale,
          ...summaryTypeMap.creditNote,
        ];
      } else if (summaryType === "Purchase Summary") {
        modelsToQuery = [
          ...summaryTypeMap.purchase,
          ...summaryTypeMap.debitNote,
        ];
      }
    } else {
      modelsToQuery = voucherType ? summaryTypeMap[voucherType] : "";
    }
    if (!modelsToQuery || modelsToQuery.length === 0) {
      return res.status(400).json({
        status: false,
        message: "Invalid voucher type selected",
      });
    }
    if (selectedOption === "MonthWise") {
      const monthNames = [
        "",
        "January",
        "February",
        "March",
        "April",
        "May",
        "June",
        "July",
        "August",
        "September",
        "October",
        "November",
        "December",
      ];

      const summaryPromises = modelsToQuery.map(async ({ model, type }) => {
        const isCredit = type === "creditNote" || type === "debitNote";

        const result = await model.aggregate([
          { $match: matchCriteria },
          {
            $group: {
              _id: { $month: "$date" },
              total: {
                $sum: {
                  $toDouble: {
                    $ifNull: ["$finalAmount", "$enteredAmount", 0],
                  },
                },
              },
              count: { $sum: 1 },
            },
          },
          {
            $addFields: {
              name: {
                $arrayElemAt: [monthNames, { $toInt: "$_id" }],
              },
              isCredit: isCredit,
              sourceType: type,
              transactions: [],
            },
          },
          {
            $project: {
              _id: 0,
              name: 1,
              total: 1,
              count: 1,
              isCredit: 1,
              sourceType: 1,
              transactions: 1,
            },
          },
        ]);

        return result;
      });

      const results = await Promise.all(summaryPromises);
      const flattenedResults = results.flat();

      if (flattenedResults.length > 0) {
        return res
          .status(200)
          .json({ message: "Summary data found", flattenedResults });
      } else {
        return res
          .status(404)
          .json({ message: "No summary data found", flattenedResults: [] });
      }
    }

    // Create transaction promises based on selected voucher type
    const summaryPromises = modelsToQuery.map(({ model, numberField, type }) =>
      aggregateSummary(
        model,
        matchCriteria,
        numberField,
        type,
        selectedOption,
        serialNumber,
      ),
    );
    const results = await Promise.all(summaryPromises);

    // Flatten results while adding a source identifiers
    const flattenedResults = results.flat();

    if (flattenedResults.length > 0) {
      return res
        .status(200)
        .json({ message: "Summary data found", flattenedResults });
    } else {
      return res
        .status(404)
        .json({ message: "No summary data found", flattenedResults: [] });
    }
  } catch (error) {
    console.log("error:", error.message);
    return res.status(500).json({ message: "Internal server error" });
  }
};

// Aggregation helper function
