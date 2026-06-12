import { startOfDay, endOfDay, parseISO } from "date-fns";
import salesModel from "../models/salesModel.js";
import invoiceModel from "../models/invoiceModel.js";
import vanSaleModel from "../models/vanSaleModel.js";
import purchaseModel from "../models/purchaseModel.js";
import { aggregateSummary } from "../helpers/summaryHelper.js";
import debitNoteModel from "../models/debitNoteModel.js";
import creditNoteModel from "../models/creditNoteModel.js";
import OrganizationModel from "../models/OragnizationModel.js";
import RoomModel from "../models/roomModal.js";
import VoucherSeriesModel from "../models/VoucherSeriesModel.js";
import mongoose from "mongoose";


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
      console.log("record", record)
      const filtername =
        selectedOption === "Ledger"
          ? record._id.partyName
          : selectedOption === "Stock Category"
            ? record._id.categoryName
            : selectedOption === "Stock Group"
              ? record._id.groupName
              : selectedOption === "voucher" ? record._id.voucherSeries : record._id.itemName;

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

/// get summary of hotel

export const fetchDashboardConsolidatedTotals = async (req, res) => {
  try {
    const { cmp_id, primaryUserId } = req.params;

    // ── IST boundaries ──────────────────────────────────────────
    const IST_OFFSET_MS = 5.5 * 60 * 60 * 1000;

    const nowIST = new Date(Date.now() + IST_OFFSET_MS);

    // Today: 00:00:00 IST → 23:59:59 IST (stored as UTC in Mongo)
    const todayStartIST = new Date(
      Date.UTC(
        nowIST.getUTCFullYear(),
        nowIST.getUTCMonth(),
        nowIST.getUTCDate(),
        0, 0, 0, 0
      ) - IST_OFFSET_MS
    );
    const todayEndIST = new Date(
      Date.UTC(
        nowIST.getUTCFullYear(),
        nowIST.getUTCMonth(),
        nowIST.getUTCDate(),
        23, 59, 59, 999
      ) - IST_OFFSET_MS
    );

    // This month: 1st 00:00:00 IST → last day 23:59:59 IST
    const monthStartIST = new Date(
      Date.UTC(
        nowIST.getUTCFullYear(),
        nowIST.getUTCMonth(),
        1, 0, 0, 0, 0
      ) - IST_OFFSET_MS
    );
    const monthEndIST = new Date(
      Date.UTC(
        nowIST.getUTCFullYear(),
        nowIST.getUTCMonth() + 1,
        0, 23, 59, 59, 999
      ) - IST_OFFSET_MS
    );
    // ─────────────────────────────────────────────────────────────

    const result = await salesModel.aggregate([

      // ── Stage 1: Base filter ──────────────────────────────────
      {
        $match: {
          Primary_user_id: new mongoose.Types.ObjectId(primaryUserId),
          // cmp_id: new mongoose.Types.ObjectId(cmp_id),
          isComplimentary: { $ne: true },
        },
      },

      // ── Stage 2: Faceted calculations ─────────────────────────
      {
        $facet: {

          // ── A. All-time total revenue ─────────────────────────
          allTimeTotal: [
            {
              $group: {
                _id: null,
                total: { $sum: "$finalAmount" },
              },
            },
          ],

          // ── B. This month total ───────────────────────────────
          monthlyTotal: [
            {
              $match: {
                date: { $gte: monthStartIST, $lte: monthEndIST },
              },
            },
            {
              $group: {
                _id: null,
                total: { $sum: "$finalAmount" },
              },
            },
          ],

          // ── C. Today total ────────────────────────────────────
          dailyTotal: [
            {
              $match: {
                date: { $gte: todayStartIST, $lte: todayEndIST },
              },
            },
            {
              $group: {
                _id: null,
                total: { $sum: "$finalAmount" },
              },
            },
          ],

          // ── D. Cash & Bank — daily ────────────────────────────
          cashBankDaily: [
            {
              $match: {
                date: { $gte: todayStartIST, $lte: todayEndIST },
              },
            },
            { $unwind: "$paymentSplittingData" },
            {
              $match: {
                "paymentSplittingData.type": { $ne: "credit" },
                "paymentSplittingData.amount": { $gt: 0 },
              },
            },
            {
              $group: {
                _id: {
                  $cond: {
                    if: { $eq: ["$paymentSplittingData.type", "cash"] },
                    then: "cash",
                    else: "bank",
                  },
                },
                total: { $sum: "$paymentSplittingData.amount" },
              },
            },
          ],

          // ── E. Cash & Bank — monthly (includes today) ─────────
          cashBankMonthly: [
            {
              $match: {
                date: { $gte: monthStartIST, $lte: monthEndIST },
              },
            },
            { $unwind: "$paymentSplittingData" },
            {
              $match: {
                "paymentSplittingData.type": { $ne: "credit" },
                "paymentSplittingData.amount": { $gt: 0 },
              },
            },
            {
              $group: {
                _id: {
                  $cond: {
                    if: { $eq: ["$paymentSplittingData.type", "cash"] },
                    then: "cash",
                    else: "bank",
                  },
                },
                total: { $sum: "$paymentSplittingData.amount" },
              },
            },
          ],

          // ── F. Cash & Bank — all-time ─────────────────────────
          cashBankAllTime: [
            { $unwind: "$paymentSplittingData" },
            {
              $match: {
                "paymentSplittingData.type": { $ne: "credit" },
                "paymentSplittingData.amount": { $gt: 0 },
              },
            },
            {
              $group: {
                _id: {
                  $cond: {
                    if: { $eq: ["$paymentSplittingData.type", "cash"] },
                    then: "cash",
                    else: "bank",
                  },
                },
                total: { $sum: "$paymentSplittingData.amount" },
              },
            },
          ],
        },
      },

      // ── Stage 3: Shape the response ───────────────────────────
      {
        $project: {
          totalRevenue: {
            $ifNull: [{ $arrayElemAt: ["$allTimeTotal.total", 0] }, 0],
          },
          monthlyCollection: {
            $ifNull: [{ $arrayElemAt: ["$monthlyTotal.total", 0] }, 0],
          },
          dailyCollection: {
            $ifNull: [{ $arrayElemAt: ["$dailyTotal.total", 0] }, 0],
          },
          cashBankDaily:   1,
          cashBankMonthly: 1,
          cashBankAllTime: 1,
        },
      },
    ]);

    // ── Helper: [{_id: "cash", total: X}] → { cash: X, bank: Y } 
    const toMap = (arr) => {
      const map = { cash: 0, bank: 0 };
      (arr || []).forEach(({ _id, total }) => {
        map[_id] = total;
      });
      return map;
    };

    const daily   = toMap(result[0]?.cashBankDaily);
    const monthly = toMap(result[0]?.cashBankMonthly);
    const allTime = toMap(result[0]?.cashBankAllTime);

    return res.status(200).json({
      totalRevenue:      result[0]?.totalRevenue      ?? 0,
      monthlyCollection: result[0]?.monthlyCollection ?? 0,
      dailyCollection:   result[0]?.dailyCollection   ?? 0,
      cashCollection: {
        allTime: allTime.cash,
        monthly: monthly.cash,
        daily:   daily.cash,
      },
      bankCollection: {
        allTime: allTime.bank,
        monthly: monthly.bank,
        daily:   daily.bank,
      },
    });

  } catch (error) {
    console.log("error:", error.message);
    return res.status(500).json({ message: "Internal server error" });
  }
};

export const fetchDashboardCompanyRevenueBreakdown = async (req, res) => {
  try {
    const { primaryUserId } = req.params;
    const primaryUserObjectId = new mongoose.Types.ObjectId(primaryUserId);

    const companyWiseRevenue = await OrganizationModel.aggregate([
      {
        $match: {
          owner: primaryUserObjectId,
        },
      },
      {
        $lookup: {
          from: salesModel.collection.name,
          let: { companyId: "$_id" },
          pipeline: [
            {
              $match: {
                $expr: {
                  $and: [
                    { $eq: ["$cmp_id", "$$companyId"] },
                    { $eq: ["$Primary_user_id", primaryUserObjectId] },
                    { $ne: ["$isComplimentary", true] },
                  ],
                },
              },
            },
            {
              $group: {
                _id: null,
                revenue: { $sum: { $ifNull: ["$finalAmount", 0] } },
              },
            },
          ],
          as: "revenueData",
        },
      },
      {
        $project: {
          _id: 0,
          cmp_id: "$_id",
          companyName: { $ifNull: ["$name", "Unknown Company"] },
          revenue: {
            $round: [
              {
                $ifNull: [
                  { $arrayElemAt: ["$revenueData.revenue", 0] },
                  0,
                ],
              },
              2,
            ],
          },
        },
      },
      { $sort: { revenue: -1, companyName: 1 } },
    ]);

    return res.status(200).json({
      message: "Company-wise revenue fetched successfully",
      companyWiseRevenue,
    });
  } catch (error) {
    console.log("error:", error.message);
    return res.status(500).json({ message: "Internal server error" });
  }
};

const getISTDateRanges = () => {
  const IST_OFFSET_MS = 5.5 * 60 * 60 * 1000;
  const nowIST = new Date(Date.now() + IST_OFFSET_MS);

  const todayStartIST = new Date(
    Date.UTC(
      nowIST.getUTCFullYear(),
      nowIST.getUTCMonth(),
      nowIST.getUTCDate(),
      0, 0, 0, 0
    ) - IST_OFFSET_MS
  );

  const todayEndIST = new Date(
    Date.UTC(
      nowIST.getUTCFullYear(),
      nowIST.getUTCMonth(),
      nowIST.getUTCDate(),
      23, 59, 59, 999
    ) - IST_OFFSET_MS
  );

  const monthStartIST = new Date(
    Date.UTC(
      nowIST.getUTCFullYear(),
      nowIST.getUTCMonth(),
      1, 0, 0, 0, 0
    ) - IST_OFFSET_MS
  );

  const monthEndIST = new Date(
    Date.UTC(
      nowIST.getUTCFullYear(),
      nowIST.getUTCMonth() + 1,
      0, 23, 59, 59, 999
    ) - IST_OFFSET_MS
  );

  return { todayStartIST, todayEndIST, monthStartIST, monthEndIST };
};

const getCompanyWiseCollectionBreakdown = async ({ primaryUserId, dateMatch }) => {
  const primaryUserObjectId = new mongoose.Types.ObjectId(primaryUserId);

  return OrganizationModel.aggregate([
    {
      $match: {
        owner: primaryUserObjectId,
      },
    },
    {
      $lookup: {
        from: salesModel.collection.name,
        let: { companyId: "$_id" },
        pipeline: [
          {
            $match: {
              $expr: {
                $and: [
                  { $eq: ["$cmp_id", "$$companyId"] },
                  { $eq: ["$Primary_user_id", primaryUserObjectId] },
                  { $ne: ["$isComplimentary", true] },
                  { $gte: ["$date", dateMatch.$gte] },
                  { $lte: ["$date", dateMatch.$lte] },
                ],
              },
            },
          },
          { $unwind: "$paymentSplittingData" },
          {
            $match: {
              "paymentSplittingData.type": { $ne: "credit" },
              "paymentSplittingData.amount": { $gt: 0 },
            },
          },
          {
            $group: {
              _id: null,
              cashTotal: {
                $sum: {
                  $cond: [
                    { $eq: ["$paymentSplittingData.type", "cash"] },
                    "$paymentSplittingData.amount",
                    0,
                  ],
                },
              },
              bankTotal: {
                $sum: {
                  $cond: [
                    { $eq: ["$paymentSplittingData.type", "cash"] },
                    0,
                    "$paymentSplittingData.amount",
                  ],
                },
              },
            },
          },
        ],
        as: "collectionData",
      },
    },
    {
      $project: {
        _id: 0,
        cmp_id: "$_id",
        companyName: { $ifNull: ["$name", "Unknown Company"] },
        cashTotal: {
          $round: [
            {
              $ifNull: [
                { $arrayElemAt: ["$collectionData.cashTotal", 0] },
                0,
              ],
            },
            2,
          ],
        },
        bankTotal: {
          $round: [
            {
              $ifNull: [
                { $arrayElemAt: ["$collectionData.bankTotal", 0] },
                0,
              ],
            },
            2,
          ],
        },
        total: {
          $round: [
            {
              $add: [
                {
                  $ifNull: [
                    { $arrayElemAt: ["$collectionData.cashTotal", 0] },
                    0,
                  ],
                },
                {
                  $ifNull: [
                    { $arrayElemAt: ["$collectionData.bankTotal", 0] },
                    0,
                  ],
                },
              ],
            },
            2,
          ],
        },
      },
    },
    { $sort: { total: -1, companyName: 1 } },
  ]);
};

export const fetchDashboardCompanyDailyCollectionBreakdown = async (req, res) => {
  try {
    const { primaryUserId } = req.params;
    const { todayStartIST, todayEndIST } = getISTDateRanges();

    const companyWiseCollection = await getCompanyWiseCollectionBreakdown({
      primaryUserId,
      dateMatch: { $gte: todayStartIST, $lte: todayEndIST },
    });

    return res.status(200).json({
      message: "Company-wise daily collection fetched successfully",
      companyWiseCollection,
    });
  } catch (error) {
    console.log("error:", error.message);
    return res.status(500).json({ message: "Internal server error" });
  }
};

export const fetchDashboardCompanyMonthlyCollectionBreakdown = async (req, res) => {
  try {
    const { primaryUserId } = req.params;
    const { monthStartIST, monthEndIST } = getISTDateRanges();

    const companyWiseCollection = await getCompanyWiseCollectionBreakdown({
      primaryUserId,
      dateMatch: { $gte: monthStartIST, $lte: monthEndIST },
    });

    return res.status(200).json({
      message: "Company-wise monthly collection fetched successfully",
      companyWiseCollection,
    });
  } catch (error) {
    console.log("error:", error.message);
    return res.status(500).json({ message: "Internal server error" });
  }
};

export const fetchDashboardRoomCountSummary = async (req, res) => {
  try {
    const { primaryUserId } = req.params;
    const primaryUserObjectId = new mongoose.Types.ObjectId(primaryUserId);

    const companyWiseRoomCount = await OrganizationModel.aggregate([
      {
        $match: {
          owner: primaryUserObjectId,
        },
      },
      {
        $lookup: {
          from: RoomModel.collection.name,
          let: { companyId: "$_id" },
          pipeline: [
            {
              $match: {
                $expr: {
                  $and: [
                    { $eq: ["$cmp_id", "$$companyId"] },
                    { $eq: ["$primary_user_id", primaryUserObjectId] },
                  ],
                },
              },
            },
            {
              $group: {
                _id: null,
                roomCount: { $sum: 1 },
                availableCount: {
                  $sum: {
                    $cond: [
                      { $in: ["$status", ["available", "vacant"]] },
                      1,
                      0,
                    ],
                  },
                },
                blockedCount: {
                  $sum: {
                    $cond: [{ $eq: ["$status", "blocked"] }, 1, 0],
                  },
                },
              },
            },
          ],
          as: "roomData",
        },
      },
      {
        $project: {
          _id: 0,
          cmp_id: "$_id",
          companyName: { $ifNull: ["$name", "Unknown Company"] },
          roomCount: {
            $ifNull: [{ $arrayElemAt: ["$roomData.roomCount", 0] }, 0],
          },
          availableCount: {
            $ifNull: [{ $arrayElemAt: ["$roomData.availableCount", 0] }, 0],
          },
          blockedCount: {
            $ifNull: [{ $arrayElemAt: ["$roomData.blockedCount", 0] }, 0],
          },
        },
      },
      { $sort: { roomCount: -1, companyName: 1 } },
    ]);

    const totalRooms = companyWiseRoomCount.reduce(
      (sum, company) => sum + Number(company.roomCount || 0),
      0
    );
    const totalAvailableRooms = companyWiseRoomCount.reduce(
      (sum, company) => sum + Number(company.availableCount || 0),
      0
    );
    const totalBlockedRooms = companyWiseRoomCount.reduce(
      (sum, company) => sum + Number(company.blockedCount || 0),
      0
    );

    return res.status(200).json({
      message: "Room count summary fetched successfully",
      totalRooms,
      totalAvailableRooms,
      totalBlockedRooms,
      companyWiseRoomCount,
    });
  } catch (error) {
    console.log("error:", error.message);
    return res.status(500).json({ message: "Internal server error" });
  }
};

export const fetchDashboardPropertySalesSummary = async (req, res) => {
  try {
    const { primaryUserId } = req.params;
    const primaryUserObjectId = new mongoose.Types.ObjectId(primaryUserId);

    const companyWisePropertySales = await OrganizationModel.aggregate([
      {
        $match: {
          owner: primaryUserObjectId,
        },
      },
      {
        $lookup: {
          from: salesModel.collection.name,
          let: { companyId: "$_id" },
          pipeline: [
            {
              $match: {
                $expr: {
                  $and: [
                    { $eq: ["$cmp_id", "$$companyId"] },
                    { $eq: ["$Primary_user_id", primaryUserObjectId] },
                    { $ne: ["$isComplimentary", true] },
                  ],
                },
              },
            },
            {
              $lookup: {
                from: VoucherSeriesModel.collection.name,
                let: { saleSeriesId: "$series_id", saleCmpId: "$cmp_id" },
                pipeline: [
                  {
                    $match: {
                      $expr: { $eq: ["$cmp_id", "$$saleCmpId"] },
                    },
                  },
                  { $unwind: "$series" },
                  {
                    $match: {
                      $expr: { $eq: ["$series._id", "$$saleSeriesId"] },
                    },
                  },
                  {
                    $project: {
                      _id: 0,
                      under: { $toLower: "$series.under" },
                    },
                  },
                ],
                as: "seriesMeta",
              },
            },
            {
              $addFields: {
                saleUnder: { $arrayElemAt: ["$seriesMeta.under", 0] },
              },
            },
            {
              $group: {
                _id: null,
                hotelSales: {
                  $sum: {
                    $cond: [
                      { $eq: ["$saleUnder", "hotel"] },
                      { $ifNull: ["$finalAmount", 0] },
                      0,
                    ],
                  },
                },
                restaurantSales: {
                  $sum: {
                    $cond: [
                      { $eq: ["$saleUnder", "restaurant"] },
                      { $ifNull: ["$finalAmount", 0] },
                      0,
                    ],
                  },
                },
              },
            },
          ],
          as: "propertySalesData",
        },
      },
      {
        $project: {
          _id: 0,
          cmp_id: "$_id",
          companyName: { $ifNull: ["$name", "Unknown Company"] },
          hotelSales: {
            $round: [
              { $ifNull: [{ $arrayElemAt: ["$propertySalesData.hotelSales", 0] }, 0] },
              2,
            ],
          },
          restaurantSales: {
            $round: [
              {
                $ifNull: [
                  { $arrayElemAt: ["$propertySalesData.restaurantSales", 0] },
                  0,
                ],
              },
              2,
            ],
          },
        },
      },
      {
        $addFields: {
          totalSales: {
            $round: [
              { $add: ["$hotelSales", "$restaurantSales"] },
              2,
            ],
          },
        },
      },
      { $sort: { totalSales: -1, companyName: 1 } },
    ]);

    const totalHotelSales = companyWisePropertySales.reduce(
      (sum, company) => sum + Number(company.hotelSales || 0),
      0
    );
    const totalRestaurantSales = companyWisePropertySales.reduce(
      (sum, company) => sum + Number(company.restaurantSales || 0),
      0
    );
    const totalPropertySales = totalHotelSales + totalRestaurantSales;

    return res.status(200).json({
      message: "Property sales summary fetched successfully",
      totalPropertySales: Number(totalPropertySales.toFixed(2)),
      totalHotelSales: Number(totalHotelSales.toFixed(2)),
      totalRestaurantSales: Number(totalRestaurantSales.toFixed(2)),
      companyWisePropertySales,
    });
  } catch (error) {
    console.log("error:", error.message);
    return res.status(500).json({ message: "Internal server error" });
  }
};
