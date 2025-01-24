import salesModel from "../models/salesModel.js"
export const aggregateSummary = async (model, matchCriteria, voucherNumber) => {
  console.log("modelssss", model)
  console.log("cretria", matchCriteria)
  console.log("voucher", voucherNumber)
  return  salesModel.aggregate([
    { $match: matchCriteria }

  ])

  // console.log("resultttdddddd", a)
}
