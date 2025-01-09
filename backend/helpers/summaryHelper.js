import salesModel from "../models/salesModel.js"
export const aggregateSummary = (model, matchCriteria, voucherNumber) => {
  console.log("modelssss", model)
  console.log("cretria", matchCriteria)
  console.log("voucher", voucherNumber)
  return model.aggregate([
    { $match: matchCriteria }

    // {
    //   $project: {
    //     voucherNumber: `$${voucherNumber}`,
    //     party_name: "$party.partyName",
    //     accountGroup: "$party.accountGroup",
    //     type: type,
    //     enteredAmount:
    //       type === "Receipt" || type === "Payment"
    //         ? "$enteredAmount"
    //         : "$finalAmount",
    //     date: 1,
    //     createdAt: 1,
    //     isCancelled: 1,
    //     paymentMethod: 1,
    //     secondaryUserName: "$secondaryUser.name",
    //     balanceAmount: {
    //       $toString: {
    //         $ifNull: [
    //           "$paymentSplittingData.balanceAmount",
    //           type === "Receipt" || type === "Payment"
    //             ? "$enteredAmount"
    //             : "$finalAmount"
    //         ]
    //       }
    //     },

    //     cashTotal: {
    //       $toString: {
    //         $cond: {
    //           if: { $ifNull: ["$paymentSplittingData.cashTotal", false] },
    //           then: "$paymentSplittingData.cashTotal",
    //           else: {
    //             $cond: {
    //               if: { $eq: ["$party.accountGroup", "Cash-in-Hand"] },
    //               then: {
    //                 $cond: {
    //                   if: {
    //                     $or: [
    //                       { $eq: [type, "Receipt"] },
    //                       { $eq: [type, "Payment"] }
    //                     ]
    //                   },
    //                   then: "$enteredAmount",
    //                   else: "$finalAmount"
    //                 }
    //               },
    //               else: "0"
    //             }
    //           }
    //         }
    //       }
    //     }
    //   }
    // }
  ])
  // console.log("resultttdddddd", a)
}
