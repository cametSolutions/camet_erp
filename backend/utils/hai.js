export const transactions = async (req, res) => {
  const userId = req.sUserId;
  const cmp_id = req.params.cmp_id;
  const { todayOnly, startOfDayParam, endOfDayParam, party_id } = req.query;

  // Define transaction types for credit and debit
  const debitTransactions = ["Debit Note", "Tax Invoice", "Payment", "Van Sale"];
  const creditTransactions = ["Purchase", "Receipt", "Credit Note"];

  try {
    // Initialize date filters
    let dateFilter = {};
    let openingBalanceDateFilter = {};

    if (startOfDayParam && endOfDayParam) {
      const startDate = parseISO(startOfDayParam);
      const endDate = parseISO(endOfDayParam);

      dateFilter = {
        createdAt: {
          $gte: startOfDay(startDate),
          $lte: endOfDay(endDate),
        },
      };

      openingBalanceDateFilter = {
        createdAt: {
          $lt: startOfDay(startDate),
        },
      };
    } else if (todayOnly === "true") {
      dateFilter = {
        createdAt: {
          $gte: startOfDay(new Date()),
          $lte: endOfDay(new Date()),
        },
      };

      openingBalanceDateFilter = {
        createdAt: {
          $lt: startOfDay(new Date()),
        },
      };
    }

    // Base match criteria
    const matchCriteria = {
      ...dateFilter,
      cmp_id: cmp_id,
      ...(userId ? { Secondary_user_id: userId } : {}),
      ...(party_id ? { 'party._id': party_id } : {}),
    };

    const openingBalanceMatchCriteria = {
      ...openingBalanceDateFilter,
      cmp_id: cmp_id,
      ...(userId ? { Secondary_user_id: userId } : {}),
      ...(party_id ? { 'party._id': party_id } : {}),
    };

    // Function to aggregate opening balance with proper string-to-number conversion
     // Function to aggregate opening balance with correct amount field
     const aggregateOpeningBalance = async (model, matchCriteria, transactionType) => {
      try {
        const amountField = (transactionType === 'Receipt' || transactionType === 'Payment') 
          ? 'enteredAmount' 
          : 'finalAmount';

        const result = await model.aggregate([
          { $match: matchCriteria },
          {
            $addFields: {
              numericAmount: {
                $toDouble: {
                  $cond: {
                    if: { $eq: [{ $type: `$${amountField}` }, "string"] },
                    then: { $convert: { input: { $trim: { input: `$${amountField}` } }, to: "double", onError: 0 } },
                    else: { $convert: { input: `$${amountField}`, to: "double", onError: 0 } }
                  }
                }
              }
            }
          },
          {
            $group: {
              _id: null,
              total: { $sum: "$numericAmount" }
            }
          }
        ]);
        return result.length > 0 ? result[0].total : 0;
      } catch (error) {
        console.error(`Error calculating opening balance for ${transactionType}:`, error);
        return 0;
      }
    };

    // Modified aggregateTransactions function with proper string-to-number conversion
  

    // Calculate opening balances
    const openingBalancePromises = [
      // Debit opening balances
      aggregateOpeningBalance(debitNoteModel, openingBalanceMatchCriteria, "Debit Note"),
      aggregateOpeningBalance(salesModel, openingBalanceMatchCriteria, "Tax Invoice"),
      aggregateOpeningBalance(paymentModel, openingBalanceMatchCriteria, "Payment"),
      aggregateOpeningBalance(vanSaleModel, openingBalanceMatchCriteria, "Van Sale"),
      // Credit opening balances
      aggregateOpeningBalance(purchaseModel, openingBalanceMatchCriteria, "Purchase"),
      aggregateOpeningBalance(receiptModel, openingBalanceMatchCriteria, "Receipt"),
      aggregateOpeningBalance(creditNoteModel, openingBalanceMatchCriteria, "Credit Note"),
    ];

    // Get current period transactions
    const transactionPromises = [
      aggregateTransactions(receiptModel, matchCriteria, "Receipt", "receiptNumber"),
      aggregateTransactions(paymentModel, matchCriteria, "Payment", "paymentNumber"),
      aggregateTransactions(invoiceModel, matchCriteria, "Sale Order", "orderNumber"),
      aggregateTransactions(salesModel, matchCriteria, "Tax Invoice", "salesNumber"),
      aggregateTransactions(vanSaleModel, matchCriteria, "Van Sale", "salesNumber"),
      aggregateTransactions(purchaseModel, matchCriteria, "Purchase", "purchaseNumber"),
      aggregateTransactions(stockTransferModel, matchCriteria, "Stock Transfer", "stockTransferNumber"),
      aggregateTransactions(creditNoteModel, matchCriteria, "Credit Note", "creditNoteNumber"),
      aggregateTransactions(debitNoteModel, matchCriteria, "Debit Note", "debitNoteNumber"),
    ];

    // Wait for all promises to resolve
    const [openingBalances, currentTransactions] = await Promise.all([
      Promise.all(openingBalancePromises),
      Promise.all(transactionPromises),
    ]);

    // Calculate total opening balances
    const totalDebitOpening = openingBalances.slice(0, 4).reduce((sum, amount) => sum + amount, 0);
    const totalCreditOpening = openingBalances.slice(4, 7).reduce((sum, amount) => sum + amount, 0);
    const netOpeningBalance = totalDebitOpening - totalCreditOpening;

    // Process current transactions
    const combined = currentTransactions
      .flat()
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      .map(transaction => ({
        ...transaction,
        transactionCategory: debitTransactions.includes(transaction.transactionType) ? 'debit' : 'credit'
      }));

    // Calculate running balances
    let runningBalance = netOpeningBalance;
    const transactionsWithBalance = combined.map(transaction => {
      const amount = parseFloat(transaction.totalAmount) || 0;
      if (transaction.transactionCategory === 'debit') {
        runningBalance += amount;
      } else {
        runningBalance -= amount;
      }
      return {
        ...transaction,
        totalAmount: amount,
        runningBalance: Number(runningBalance.toFixed(2))
      };
    });

    if (combined.length > 0 || netOpeningBalance !== 0) {
      return res.status(200).json({
        message: `Transactions fetched${todayOnly === "true" ? " for today" : ""}`,
        data: {
          openingBalance: {
            debit: Number(totalDebitOpening.toFixed(2)),
            credit: Number(totalCreditOpening.toFixed(2)),
            net: Number(netOpeningBalance.toFixed(2))
          },
          transactions: transactionsWithBalance,
          closingBalance: Number(runningBalance.toFixed(2))
        },
      });
    } else {
      return res.status(404).json({ message: "Transactions not found" });
    }
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      status: false,
      message: "Internal server error",
    });
  }
};