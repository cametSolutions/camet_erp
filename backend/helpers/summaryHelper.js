export const aggregateSummary = async (
  model,
  matchCriteria,
  numberField,
  type,
  selectedOption,
  serialNumber
) => {
  try {
    const results = await model.aggregate([{ $match: matchCriteria }]);
    // Add type to each result to identify its source if not already included in projection
    if (results && results.length && !results[0]?.sourceType) {
      results.forEach((item) => {

        item.sourceType = type
      });
    }
    const calculateTotalsWithTransactions = () => {

      if (!Array.isArray(results) || results.length === 0) return [];

      const totalsMap = new Map()
      if (selectedOption === "Ledger") {
        const filteredResults =
          serialNumber === "all"
            ? results
            : results.filter(item => item.series_id?.toString() === serialNumber)
 

        filteredResults.forEach((item) => {
          if (!item.party?._id) return
          const partyName = item.party.partyName


          // Get existing data or initialize
          const existing = totalsMap.get(partyName) || {
            total: 0,
            sourceType: item.sourceType,
            isCreditOrDebit: item.voucherType === "creditNote" || item.voucherType === "debitNote",
            transactions: []
          }

          // Update total
          existing.total += Number(item.finalAmount) || 0

          // Add transaction details using the requested format
          existing.transactions.push({
            voucherNumber: item.salesNumber || "N/A",
            party_name: partyName,
            date: item.date,
            enteredAmount: Number(item.finalAmount) || 0,
            _id: item._id,
            isCancelled: false,
            type: "Tax Invoice",

          })

          totalsMap.set(partyName, existing)
        })
      } else if (selectedOption === "Stock Item") {
        // Create a map to organize transactions by product
        const productTransactionsMap = new Map()
        const filteredResults =
          serialNumber === "all"
            ? results
            : results.filter(item => item.series_id?.toString() === serialNumber)
        filteredResults.forEach((sale) => {
          sale.items?.forEach((item) => {
            if (!item.product_name) return

            // Get existing data or initialize
            const existing = totalsMap.get(item.product_name) || {
              total: 0,
              isCreditOrDebit: sale.voucherType === "creditNote" || sale.voucherType === "debitNote",
              transactions: []
            }

            // Update total
            existing.total += item.total || 0

            // Track this product in this sale if not already tracked
            const transactionKey = `${sale._id}-${item.product_name}`
            if (!productTransactionsMap.has(transactionKey)) {
              existing.transactions.push({
                voucherNumber: sale.salesNumber || "N/A",
                party_name: sale.party?.partyName || "N/A",
                date: sale.date,
                enteredAmount: item.total || 0,
                _id: sale._id,
                product: item.product_name,
                isCancelled: false,
                type: "Tax Invoice"
              })
              productTransactionsMap.set(transactionKey, true)
            }

            totalsMap.set(item.product_name, existing)
          })
        })
      } else if (selectedOption === "Stock Group") {
        // Create a map to organize transactions by brand group
        const brandTransactionsMap = new Map()
        const filteredResults =
          serialNumber === "all"
            ? results
            : results.filter(item => item.series_id?.toString() === serialNumber)
        filteredResults.forEach((sale) => {
          sale.items?.forEach((item) => {
            if (!item?.brand?._id) return
            const groupName = item.brand.name

            // Get existing data or initialize
            const existing = totalsMap.get(groupName) || {
              total: 0,
              isCreditOrDebit: item.voucherType === "creditNote" || item.voucherType === "debitNote",
              transactions: []
            }

            // Update total
            existing.total += item.total || 0

            // Track this brand in this sale if not already tracked
            const transactionKey = `${sale._id}-${groupName}`
            if (!brandTransactionsMap.has(transactionKey)) {
              existing.transactions.push({
                voucherNumber: sale.salesNumber || "N/A",
                party_name: sale.party?.partyName || "N/A",
                date: sale.date,
                enteredAmount: item.total || 0,
                _id: sale._id,
                brand: groupName,
                isCancelled: false,
                type: "Tax Invoice"
              })
              brandTransactionsMap.set(transactionKey, true)
            }

            totalsMap.set(groupName, existing)
          })
        })
      } else if (selectedOption === "Stock Category") {
        // Create a map to organize transactions by category
        const categoryTransactionsMap = new Map()
        const filteredResults =
          serialNumber === "all"
            ? results
            : results.filter(item => item.series_id?.toString() === serialNumber)
        filteredResults.forEach((sale) => {
          sale.items?.forEach((item) => {
            if (!item?.category?._id) return
            const categoryName = item.category.name

            // Get existing data or initialize
            const existing = totalsMap.get(categoryName) || {
              total: 0,
              isCreditOrDebit: item.voucherType === "creditNote" || item.voucherType === "debitNote",
              transactions: []
            }

            // Update total
            existing.total += item.total || 0

            // Track this category in this sale if not already tracked
            const transactionKey = `${sale._id}-${categoryName}`
            if (!categoryTransactionsMap.has(transactionKey)) {
              existing.transactions.push({
                voucherNumber: sale.salesNumber || "N/A",
                party_name: sale.party?.partyName || "N/A",
                date: sale.date,
                enteredAmount: item.total || 0,
                _id: sale._id,
                category: categoryName,
                isCancelled: false,
                type: "Tax Invoice"
              })
              categoryTransactionsMap.set(transactionKey, true)
            }

            totalsMap.set(categoryName, existing)
          })
        })
      }

      // Convert map to array
      return Array.from(totalsMap).map(([name, data]) => ({
        name,
        sourceType:data.sourceType,
        isCreditOrDebit: data.isCreditOrDebit,
        total: data.total,
        transactions: data.transactions
      }))
    }
    return calculateTotalsWithTransactions()

    // return results;
  } catch (error) {
    console.error(`Error in aggregateSummary for ${type}:`, error.message);
    return [];
  }
};
