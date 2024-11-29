export const truncateToNDecimals = (num, n) => {
  const parts = num.toString().split(".");
  if (parts.length === 1) return num; // No decimal part
  parts[1] = parts[1].substring(0, n); // Truncate the decimal part
  return parseFloat(parts.join("."));
};

///formatting amount with comma

export const formatAmount = (amount) => {
  return amount.toLocaleString("en-IN", { maximumFractionDigits: 2 });
};

/////helper for transactions

import mongoose from "mongoose";

export const aggregateTransactions = (model, matchCriteria, type, voucherNumber) => {
  return model.aggregate([
    { $match: matchCriteria },
    {
      $addFields: {
        Secondary_user_idObj: { $toObjectId: "$Secondary_user_id" },
      },
    },
    {
      $lookup: {
        from: "secondaryusers",
        localField: "Secondary_user_idObj",
        foreignField: "_id",
        as: "secondaryUser",
        pipeline: [
          { $project: { name: 1, _id: 0 } },
        ],
      },
    },
    { $unwind: { path: "$secondaryUser", preserveNullAndEmptyArrays: true } },
    {
      $project: {
        voucherNumber: `$${voucherNumber}`,
        party_name: "$party.partyName",
        accountGroup: "$party.accountGroup",
        type: type,
        enteredAmount:
          type === "Receipt" || type === "Payment"
            ? "$enteredAmount"
            : "$finalAmount",
        createdAt: 1,
        isCancelled: 1,
        paymentMethod: 1,
        secondaryUserName: "$secondaryUser.name",
        balanceAmount: {
          $toString: {
            $ifNull: [
              '$paymentSplittingData.balanceAmount',
              type === 'Receipt' || type === 'Payment'
                ? '$enteredAmount'
                : '$finalAmount'
            ]
          }
        },
        // cashTotal: {
        //   $toString: {
        //     $ifNull: [
        //       '$paymentSplittingData.cashTotal',
        //       "0"
        //     ]
        //   }
        // },
        cashTotal: {
          $toString: {
            $cond: {
              if: { $ifNull: ['$paymentSplittingData.cashTotal', false] },
              then: '$paymentSplittingData.cashTotal',
              else: {
                $cond: {
                  if: { $eq: ['$party.accountGroup', 'Cash-in-Hand'] },
                  then: {
                    $cond: {
                      if: { $or: [{ $eq: [type, 'Receipt'] }, { $eq: [type, 'Payment'] }] },
                      then: '$enteredAmount',
                      else: '$finalAmount'
                    }
                  },
                  else: '0'
                }
              }
            }
          }
        }
      },
    },
  ]);
};

// Function to aggregate opening balance with proper string-to-number conversion
export const aggregateOpeningBalance = async (
  model,
  matchCriteria,
  transactionType
) => {
  try {
    const amountField =
      transactionType === "Receipt" || transactionType === "Payment"
        ? "enteredAmount"
        : "finalAmount";

    const result = await model.aggregate([
      { $match: matchCriteria },
      {
        $addFields: {
          numericAmount: {
            $toDouble: { $ifNull: [`$${amountField}`, 0] },
          },
        },
      },
      {
        $group: {
          _id: null,
          total: { $sum: "$numericAmount" },
        },
      },
    ]);

    return result.length > 0 ? result[0].total : 0;
  } catch (error) {
    console.error(
      `Error calculating opening balance for ${transactionType}:`,
      error
    );
    return 0;
  }
};
