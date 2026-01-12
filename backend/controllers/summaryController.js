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
export const getSummary = async (req, res) => {
  const { startOfDayParam, endOfDayParam, selectedVoucher, summaryType, selectedOption } = req.query;

  try {
    const cmp_id = req.params.cmp_id;
    const companyObjectId = new mongoose.Types.ObjectId(cmp_id);


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
    const config = {
      'sales summary': {
        alltype: [
          { model: salesModel, billField: 'salesNumber' },
          { model: vanSaleModel, billField: 'salesNumber' },
          { model: creditNoteModel, billField: 'creditNoteNumber' }
        ],
        sale: [
          { model: salesModel, billField: 'salesNumber' }
        ],
        vansale: [
          { model: vanSaleModel, billField: 'salesNumber' }
        ],
        creditnote: [
          { model: creditNoteModel, billField: 'creditNoteNumber' }
        ]
      },
      'purchase summary': {
        alltype: [
          { model: purchaseModel, billField: 'purchaseNumber' },
          { model: debitNoteModel, billField: 'debitNoteNumber' }
        ],
        purchase: [
          { model: purchaseModel, billField: 'purchaseNumber' }
        ],
        debitnote: [
          { model: debitNoteModel, billField: 'debitNoteNumber' }
        ]
      },
      'order summary': {

        saleorder: [
          { model: invoiceModel, billField: 'orderNumber' }
        ]
      }
    };
    const pipelines = [];
    const selectedSummary = config[summaryType.toLowerCase()];
    if (!selectedSummary) throw new Error("Invalid summaryType");

    const selectedModels = selectedSummary[selectedVoucher.toLowerCase()];
    if (!selectedModels) throw new Error("Invalid voucherType");
    let groupId = {};
    switch (selectedOption) {
      case "Ledger":
        groupId = {
          partyName: "$party.partyName",
          itemName: "$items.product_name"
        };
        break;

      case "Stock Category":
        groupId = { categoryName: "$categoryInfo.category" };
        break;

      case "Stock Group":
        groupId = { groupName: "$brandInfo.brand" };
        break;

      case "voucher":


        groupId = {

          itemName: "$items.product_name"
        };
        break;

      case "Stock Item":
        groupId = { itemName: "$items.product_name" };
        break;

      default:
        // fallback if needed
        groupId = { itemName: "$items.product_name" };
    }


    for (const { model, billField } of selectedModels) {

      pipelines.push(
        model.aggregate([
          { $match: matchCriteria },
          { $unwind: "$items" },
          { $unwind: "$items.GodownList" },
          { $match: { "items.GodownList.added": true } },

          // category lookup
          {
            $lookup: {
              from: "categories",
              localField: "items.category",
              foreignField: "_id",
              as: "categoryInfo"
            }
          },
          { $unwind: { path: "$categoryInfo", preserveNullAndEmptyArrays: true } },

          // brand lookup
          {
            $lookup: {
              from: "brands",
              localField: "items.brand",
              foreignField: "_id",
              as: "brandInfo"
            }
          },
          { $unwind: { path: "$brandInfo", preserveNullAndEmptyArrays: true } },

          {
            $group: {
              _id: {
                ...groupId,
                voucherSeries: `$${billField}`
              },
              gstNo: { $first: "$party.gstNo" },
              seriesid: { $first: "$series_id" },
              godownList: {
                $push: {
                  godown_id: "$items.GodownList.godown_id",
                  batch: "$items.GodownList.batch",
                  count: "$items.GodownList.count",
                  hsn: "$items.hsn_code",
                  rate: "$items.GodownList.basePrice",
                  batchEnabled: "$items.batchEnabled",
                  gdnEnabled: "$items.gdnEnabled",
                  partyName: "$party.partyName",
                  selectedPriceRate: "$items.GodownList.selectedPriceRate",
                  discountAmount: "$items.GodownList.discountAmount",
                  igstValue: "$items.GodownList.igstValue",
                  igstAmount: "$items.GodownList.igstAmount",
                  cessValue: "$items.GodownList.cessValue",
                  cessAmount: "$items.GodownList.cessAmount",
                  addtionalCess: "$items.GodownList.addlCessValue",
                  addtionalCessAmount: "$items.GodownList.additionalCessAmount",
                  individualTotal: "$items.GodownList.individualTotal",
                  taxableAmount: "$items.GodownList.taxableAmount"
                }
              },
              itemMeta: {
                $first: {
                  billnumber: `$${billField}`,
                  // billDate: "$date",
                  billDate: {
                    $dateToString: { format: "%d-%m-%Y", date: "$date" }
                  },
                  itemName: "$items.product_name",
                  item_mrp: "$items.item_mrp",
                  product_code: "$items.product_code",
                  categoryName: "$categoryInfo.category",
                  groupName: "$brandInfo.brand"

                }
              }
            }
          }
        ])
      );
    }
    const output = await Promise.all(pipelines);

    const mergedResults = output.flat();

    const isGodownOnly = (product) => {
      return (
        product.every((item) => item.godown_id && !item.batchEnabled && item.gdnEnabled)
      );
    };

    // Post-process
    const groupedByParty = new Map();

    for (const record of mergedResults) {
      const filtername = (selectedOption === "Ledger" ? record._id.partyName : selectedOption === "Stock Item" ? record._id.itemName : selectedOption === "Stock Category" ? record._id.categoryName : selectedOption === "Stock Group" ? record._id.groupName : record._id.voucherSeries).toString();//fot grouping same items

      const isGodown = isGodownOnly(record.godownList);
      const itemType = selectedOption === "Ledger" ? "partyName" : selectedOption === "Stock Category" ? "categoryName" : selectedOption === "Stock Group" ? "groupName" : "itemName"
      if (!groupedByParty.has(filtername)) {
        groupedByParty.set(filtername, {

          itemType: filtername,///filteration type
          saleAmount: 0,
          seriesID: record.seriesid,
          sale: []
        });
      }
      const ratevalue = record.godownList[0].selectedPriceRate 
      const partySummary = groupedByParty.get(filtername);
      if (isGodown) {

        // if godownOnly, merge as one entry
        const totalAmount = record.godownList.reduce((sum, g) => sum + g.taxableAmount, 0);
        const netAmount = record.godownList.reduce((sum, g) => sum + g.individualTotal, 0)

        partySummary.sale.push({
          ...record.itemMeta,
          quantity: record.godownList.reduce((q, g) => q + g.count, 0),
          rate: (Math.round(ratevalue * 100) / 100).toFixed(2),//math.round for getting gettting rounded value like 2.246 get as 2.25
          discount: record.godownList.reduce((d, g) => d + g.discountAmount, 0),
          taxPercentage: record.godownList[0].igstValue,
          cessPercentage: record.godownList[0].cessValue,
          cessAmount: record.godownList[0].cessAmount,
          addtlnCess: record.godownList[0].addtionalCess,
          addtnlnCessAmount: record.godownList[0].addtionalCessAmount,
          taxAmount: record.godownList.reduce((a, b) => a + b.igstAmount, 0),
          partyName: record.godownList[0].partyName,
          gstNo: record.gstNo,
          hsn: record.godownList[0].hsn,
          netAmount: netAmount,
          amount: totalAmount
        });

        partySummary.saleAmount += totalAmount;

      } else {

        // otherwise create separate entries
        for (const g of record.godownList) {
          partySummary.sale.push({
            ...record.itemMeta,
            batch: g.batch,
            quantity: g.count,
            rate: (Math.round(ratevalue * 100) / 100).toFixed(2),///math.round for getting 2.435 gets 2.44
            discount: g.discountAmount,
            taxPercentage: g.igstValue,
            cessPercentage: g.cessValue,
            cessAmount: g.cessAmount,
            addtlnCess: g.addtionalCess,
            addtnlnCessAmount: g.addtionalCessAmount,
            partyName: g.partyName,
            taxAmount: g.igstAmount,
            netAmount: g.individualTotal,
            gstNo: record.gstNo,
            hsn: g.hsn,
            amount: g.taxableAmount
          });
          partySummary.saleAmount += g.individualTotal;


        }
      }
    }
    const result = Array.from(groupedByParty.values())//for converting to array 
    const grouped = new Map()
    for (const record of result) {
      const partyId = record.itemType
      if (!grouped.has(partyId)) {
        grouped.set(partyId, {

          itemType: partyId,
          seriesID: record.seriesID,
          saleAmount: 0,
          sale: []
        })
      }
      const group = grouped.get(partyId)
      group.saleAmount += record.saleAmount
      group.sale.push(...(record.sale || []))
    }
    const mergedsummary = Array.from(grouped.values())
    if (mergedsummary.length > 0) {
      return res
        .status(200)
        .json({ message: "Summary data found", mergedsummary });
    } else {
      return res.status(404).json({ message: "No summary data found" });
    }
  } catch (error) {
    console.log("error:", error);
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
    const companyObjectId = new mongoose.Types.ObjectId(cmp_id)

    const { start, end, voucherType, serialNumber, summaryType, selectedOption } = req.query

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
        modelsToQuery = [...summaryTypeMap.sale, ...summaryTypeMap.vanSale, ...summaryTypeMap.creditNote]
      } else if (summaryType === "Purchase Summary") {
        modelsToQuery = [...summaryTypeMap.purchase, ...summaryTypeMap.debitNote]
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
        "", "January", "February", "March", "April", "May", "June",
        "July", "August", "September", "October", "November", "December"
      ];

          const summaryPromises = modelsToQuery.map(async ({ model, type }) => {
        const isCredit = (type === "creditNote" || type === "debitNote");
        
        const result = await model.aggregate([
          { $match: matchCriteria },
          {
            $group: {
              _id: { $month: "$date" }, // Group by Month (1-12)
              total: { 
                $sum: { 
                  $toDouble: { 
                    $ifNull: ["$totalWithAdditionalCharges", "$enteredAmount", 0] 
                  } 
                } 
              } 
            }
          },
          {
            $project: {
              _id: 0,
              monthIndex: "$_id",
              total: 1
            }
          }
        ]);

        // Transform to match frontend expectation
        return result.map(item => ({
          name: monthNames[item.monthIndex], // Convert 1 -> January
          monthIndex: item.monthIndex,
          total: item.total || 0,
          isCredit: isCredit, // To determine if we subtract or add
          sourceType: type,
          transactions: [] // We don't need details for this high-level view
        }));
      });

      const results = await Promise.all(summaryPromises);
      const flattenedResults = results.flat();
      
    if (flattenedResults.length > 0) {
          return res.status(200).json({ message: "Summary data found", flattenedResults });
      } else {
          return res.status(404).json({ message: "No summary data found", flattenedResults: [] });
      }
    }

    // Create transaction promises based on selected voucher type
    const summaryPromises = modelsToQuery.map(({ model, numberField, type }) =>
      aggregateSummary(model, matchCriteria, numberField, type, selectedOption, serialNumber)

    );
    const results = await Promise.all(summaryPromises);

    // Flatten results while adding a source identifiers
    const flattenedResults = results.flat();

    if (flattenedResults.length > 0) {
      return res
        .status(200)
        .json({ message: "Summary data found", flattenedResults });
    } else {
      return res.status(404).json({ message: "No summary data found", flattenedResults: [] });
    }
  } catch (error) {
    console.log("error:", error.message)
    return res.status(500).json({ message: "Internal server error" })
  }


}

// Aggregation helper function
