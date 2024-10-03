
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

export const aggregateTransactions = (model, matchCriteria, type) => {
  return model.aggregate([
    { $match: matchCriteria },
    {
      $project: {
        party_name: '$party.partyName',
        type: type,
        enteredAmount: (type === 'Receipt' || type==="Payment") ? '$enteredAmount' : '$finalAmount',
        createdAt: 1,
        itemsLength: (type === 'Receipt' || type==="Payment") ? undefined : { $size: '$items' },
        isCancelled: 1,
      },
    },
  ]);
};

