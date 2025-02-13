/* eslint-disable no-unsafe-optional-chaining */
/* eslint-disable react/prop-types */
import dayjs from "dayjs";

const ReportTable = ({ data, loading, openingBalances }) => {
  // Initialize running balance with opening balance
  let runningBalance = openingBalances?.debitBalance || 0;

  const transactionsWithBalance = data?.map((transaction) => {
    const debitAmount = ["Debit Note", "Tax Invoice", "Payment"].includes(
      transaction?.type
    )
      ? Number(transaction?.balanceAmount)
      : 0;

    const creditAmount = ["Purchase", "Receipt", "Credit Note"].includes(
      transaction?.type
    )
      ? Number(transaction?.balanceAmount)
      : 0;

    runningBalance = runningBalance + debitAmount - creditAmount;

    return {
      ...transaction,
      debitAmount,
      creditAmount,
      balance: runningBalance,
    };
  });

  return (
    <div className="w-full overflow-x-auto px-3 py-1">
      <table className="w-full border-collapse border-t">
        {/* Opening Balance Row */}
        <tr className="border-b">
          <td
            colSpan="3"
            className="py-2.5 px-3 text-left text-xs font-medium text-gray-600"
          >
            Opening Balance
          </td>
          <td className="py-2.5 px-3 text-right text-xs font-medium text-gray-600">
            ₹ {openingBalances?.debitBalance?.toLocaleString() || 0}
          </td>
        </tr>

        <thead className="">
          <tr className="bg-slate-200">
            <th className="py-2.5 px-3 text-left text-xs font-bold text-gray-600">
              Transaction
            </th>
            <th className="py-2.5 px-3 text-right text-xs font-bold text-gray-600">
              Debit
            </th>
            <th className="py-2.5 px-3 text-right text-xs font-bold text-gray-600">
              Credit
            </th>
            <th className="py-2.5 px-3 text-right text-xs font-bold text-gray-600">
              Balance
            </th>
          </tr>
        </thead>

        <tbody>
          {transactionsWithBalance?.map((transaction) => (
            <tr key={transaction._id} className="border-b">
              <td className="py-2.5 px-3 text-xs text-gray-600">
                <div className="space-y-1">
                  <div className="text-[10px] text-gray-400 font-semibold">
                    <span className="text-violet-400">
                      #{transaction?.voucherNumber} •{" "}
                    </span>
                    {dayjs(transaction?.date).format("DD/MM/YYYY")}
                  </div>
                  <div className="font-medium">{transaction?.type}</div>
                  {transaction.paymentMode && (
                    <div className="text-[11px] text-gray-400">
                      Payment Mode: {transaction?.paymentMode}
                    </div>
                  )}
                </div>
              </td>
              <td className="py-2.5 px-3 text-right text-xs font-medium">
                {transaction.debitAmount > 0 ? (
                  <span className="text-red-500">
                    ₹ {transaction.debitAmount.toLocaleString()}
                  </span>
                ) : (
                  <span className="text-gray-500">₹ 0</span>
                )}
              </td>
              <td className="py-2.5 px-3 text-right text-xs font-medium">
                {transaction.creditAmount > 0 ? (
                  <span className="text-green-500">
                    ₹ {transaction.creditAmount.toLocaleString()}
                  </span>
                ) : (
                  <span className="text-gray-500">₹ 0</span>
                )}
              </td>
              <td className="py-2.5 px-3 text-right text-xs font-medium text-gray-600">
                ₹ {transaction.balance.toLocaleString()}
              </td>
            </tr>
          ))}
        </tbody>

        {!loading && data?.length > 0 && (
          <tfoot>
            <tr className="bg-slate-200 border-t">
              <td className="py-2.5 px-3 text-left text-xs font-bold text-gray-600">
                Closing Balance
              </td>
              <td
                colSpan="2"
                className="py-2.5 px-3 text-right text-xs font-bold text-gray-600"
              >
                ₹ {runningBalance.toLocaleString()}
              </td>
              <td className="py-2.5 px-3 text-right text-xs font-bold text-gray-600">
                ₹ {runningBalance.toLocaleString()}
              </td>
            </tr>
          </tfoot>
        )}
      </table>

      {!loading && data?.length === 0 && (
        <div className="w-full py-2.5 px-4 rounded-sm text-xs font-bold text-gray-700 mt-6 flex justify-center">
          No Transactions Found
        </div>
      )}
    </div>
  );
};

export default ReportTable;
