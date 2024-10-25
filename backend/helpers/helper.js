
export const  truncateToNDecimals=(num, n)=> {
  const parts = num.toString().split(".");
  if (parts.length === 1) return num; // No decimal part
  parts[1] = parts[1].substring(0, n); // Truncate the decimal part
  return parseFloat(parts.join("."));
}

///formatting amount with comma

export const  formatAmount=(amount) =>{
  return amount.toLocaleString("en-IN", { maximumFractionDigits: 2 });
}


/////helper for transactions

export const aggregateTransactions = (model, matchCriteria, type,voucherNumber) => {
  return model.aggregate([
    { $match: matchCriteria },
    {
      $project: {
      voucherNumber: `$${voucherNumber}`,
        party_name: '$party.partyName',
        type: type,
        enteredAmount: (type === 'Receipt' || type==="Payment") ? '$enteredAmount' : '$finalAmount',
        createdAt: 1,
        itemsLength: (type === 'Receipt' || type==="Payment") ? undefined : { $size: '$items' },
        isCancelled: 1,
        paymentMethod: 1,
      },
    },
  ]);
};


export const calculateOpeningBalance = async (model, type, openingBalanceCriteria) => {
  return model.aggregate([
    { $match: openingBalanceCriteria },
    {
      $group: {
        _id: null,
        debitTotal: {
          $sum: {
            $cond: [
              { $in: [type, ["Debit Note", "Tax Invoice", "Payment","Van Sale"]] },
              { $toDouble: "$enteredAmount" },
              0
            ],
          },
        },
        creditTotal: {
          $sum: {
            $cond: [
              { $in: [type, ["Purchase", "Receipt", "Credit Note"]] },
              { $toDouble: "$enteredAmount" },
              0
            ],
          },
        },
      },
    },
    { $project: { _id: 0, debitTotal: 1, creditTotal: 1 } },
  ]);
};

