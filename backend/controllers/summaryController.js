import { startOfDay, endOfDay, parseISO } from "date-fns"
import salesModel from "../models/salesModel.js"
import invoiceModel from "../models/invoiceModel.js"
import vanSaleModel from "../models/vanSaleModel.js"
import purchaseModel from "../models/purchaseModel.js"
import { aggregateSummary } from "../helpers/summaryHelper.js"
import debitNoteModel from "../models/debitNoteModel.js"
import creditNoteModel from "../models/creditNoteModel.js"

//summary report controller
export const getSummary = async (req, res) => {
  const {
    startOfDayParam,
    endOfDayParam,

    selectedVoucher,
    selectedOption
  } = req.query

  try {
    const cmp_id = req.params.cmp_id
    console.log("cmpiddddd", cmp_id)

    let dateFilter = {}
    if (startOfDayParam && endOfDayParam) {
      const startDate = parseISO(startOfDayParam)
      const endDate = parseISO(endOfDayParam)
      dateFilter = {
        date: {
          $gte: startOfDay(startDate),
          $lte: endOfDay(endDate)
        }
      }
    }
    const matchCriteria = {
      ...dateFilter,
      cmp_id: cmp_id
    }

    // Define summary type mappings
    const summaryTypeMap = {
      sale: [{ model: salesModel, numberField: "salesNumber" }],
      saleOrder: [{ model: invoiceModel, numberField: "orderNumber" }],
      vanSale: [{ model: vanSaleModel, numberField: "salesNumber" }],
      purchase: [
        {
          model: purchaseModel,
          numberField: "purchaseNumber"
        }
      ],
      debitNote: [
        {
          model: debitNoteModel,
          numberField: "debitNoteNumber"
        }
      ],
      creditNote: [
        {
          model: creditNoteModel,
          numberField: "creditNoteNumber"
        }
      ]
    }
    // Get the appropriate models to query based on selectedVoucher
    const modelsToQuery = selectedVoucher ? summaryTypeMap[selectedVoucher] : ""

    if (!modelsToQuery) {
      return res.status(400).json({
        status: false,
        message: "Invalid voucher type selected"
      })
    }
    // Create transaction promises based on selected voucher type
    const summaryPromises = modelsToQuery.map(({ model, numberField }) =>
      aggregateSummary(model, matchCriteria, numberField)
    )

    const results = await Promise.all(summaryPromises)
    const flattenedResults = results.flat()

    console.log("res", flattenedResults)
    if (results.length > 0) {
      return res
        .status(200)
        .json({ message: "Sale summary found", flattenedResults })
    }
  } catch (error) {
    console.log("error:", error.message)
  }
}
