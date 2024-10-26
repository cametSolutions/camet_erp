/* eslint-disable no-unsafe-optional-chaining */
/* eslint-disable react/prop-types */
const ReportTable = ({ data, loading, openingBalances }) => {
  // Calculate total debit and credit amounts
  const { totalDebit, totalCredit } = data?.reduce(
    (totals, transaction) => {
      if (["Debit Note", "Tax Invoice", "Payment"].includes(transaction?.type)) {
        totals.totalDebit += Number(transaction?.enteredAmount);
      } else if (
        ["Purchase", "Receipt", "Credit Note"].includes(transaction?.type)
      ) {
        totals.totalCredit += Number(transaction?.enteredAmount);
      }
      return totals;
    },
    { totalDebit: 0, totalCredit: 0 }
  );

  const closingDebit = totalDebit + (openingBalances?.debitBalance || 0);
  const closingCredit = totalCredit + (openingBalances?.creditBalance || 0);

  return (
    <div className="w-full overflow-x-auto px-3 py-4">
      <table className="w-full border-collapse">
        <thead>
          <tr className="border-b bg-slate-100">
            <th className="py-6 px-6 text-left text-gray-400 text-sm">
              Transactions
            </th>
            <th className="py-6 px-6 text-right text-gray-400 text-sm">
              Debit
            </th>
            <th className="py-6 px-6 text-right text-gray-400 text-sm">
              Credit
            </th>
          </tr>
        </thead>
        <tbody>
          {/* Opening Balance Row */}
          <tr className="bg-slate-200 w-full">
            <td className="py-3 px-4 text-left font-bold text-xs text-gray-700">
              Opening Balance
            </td>
            <td className="py-3 px-6 text-right font-bold text-xs text-gray-500">
              {openingBalances?.debitBalance > openingBalances?.creditBalance &&
                `₹ ${openingBalances?.debitBalance}`}
            </td>
            <td className="py-3 px-6 text-right font-bold text-xs text-gray-500">
              {openingBalances?.creditBalance > openingBalances?.debitBalance &&
                `₹ ${openingBalances?.creditBalance}`}
            </td>
          </tr>

          {/* Transaction Rows */}
          {data?.map((transaction) => (
            <tr
              key={transaction._id}
              className="border-b shadow-md cursor-pointer"
            >
              <td className="py-6 px-6 font-bold">
                <div className="space-y-1">
                  <div className="text-[10px]  flex gap-1 flex-col">
                    <span className="text-gray-400">#{transaction?.voucherNumber}</span>
                    <span className="text-violet-400">
                      {new Date(transaction?.createdAt).toLocaleDateString(
                        "en-IN"
                      )}
                    </span>
                  </div>
                  <div className="font-bold text-[13px] text-gray-500">
                    {transaction?.type}
                  </div>
                  {transaction.paymentMode && (
                    <div className="text-[11px] text-gray-400">
                      Payment Mode:{" "}
                      <span className="text-[11px] text-gray-600">
                        {transaction?.paymentMode}
                      </span>
                    </div>
                  )}
                </div>
              </td>
              <td className="py-6 px-6 text-right text-[11px] font-bold">
                {["Debit Note", "Tax Invoice", "Payment"].includes(
                  transaction.type
                ) ? (
                  <span className="text-red-500">
                    ₹ {transaction?.enteredAmount}
                  </span>
                ) : (
                  "₹ 0"
                )}
              </td>
              <td className="py-6 px-6 text-right text-[11px] font-bold">
                {["Purchase", "Receipt", "Credit Note"].includes(
                  transaction.type
                ) ? (
                  <span className="text-green-500">
                    ₹ {transaction?.enteredAmount}
                  </span>
                ) : (
                  "₹ 0"
                )}
              </td>
            </tr>
          ))}
        </tbody>

        {/* Closing balance row */}
        {!loading && data?.length > 0 && (
          <tfoot>
            <tr className="bg-slate-200">
              <td className="py-3 px-4 text-left font-bold text-xs text-gray-700">
                Closing Balance
              </td>
              <td className="py-3 px-6 text-right font-bold text-xs text-gray-500">
                {closingDebit > closingCredit && "₹ " + closingDebit}
              </td>
              <td className="py-3 px-6 text-right font-bold text-xs text-gray-500">
                {closingCredit > closingDebit && "₹ " + closingCredit}
              </td>
            </tr>
          </tfoot>
        )}
      </table>

      {!loading && data?.length === 0 && (
        <div className="w-full py-5 px-4 rounded-sm text-xs font-bold text-gray-700 mt-6 flex justify-center">
          OOps. No Transactions Found !!
        </div>
      )}
    </div>
  );
};

export default ReportTable;
