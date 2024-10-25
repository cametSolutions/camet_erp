const ReportTable = () => {
  const transactions = [
    {
      id: 6,
      date: "21 Oct 2024",
      type: "Sales Invoice",
      description: "Balance: ₹ 140",
      debit: 440,
      credit: 0,
    },
    {
      id: 7,
      date: "21 Oct 2024",
      type: "Sales Invoice",
      description: "Balance: ₹ 580",
      debit: 440,
      credit: 0,
    },
    {
      id: 1,
      date: "21 Oct 2024",
      type: "Purchase Invoice",
      description: "Balance: ₹ -370",
      debit: 0,
      credit: 950,
    },
    {
      id: 14,
      date: "21 Oct 2024",
      type: "Receive Payment In",
      description: "Balance: ₹ -820",
      paymentMode: "Cash",
      debit: 0,
      credit: 450,
    },
    {
      id: 1,
      date: "21 Oct 2024",
      type: "Record Payment Out",
      description: "Balance: ₹ -420",
      paymentMode: "Cash",
      debit: 400,
      credit: 0,
    },
  ];

  return (
    <div className="w-full overflow-x-auto px-3 py-4">
      <table className="w-full border-collapse">
        <thead>
          <tr className="border-b  bg-slate-100 ">
            <th className="py-6 px-6 text-left text-gray-400 text-sm  ">
              Transactions
            </th>
            <th className="py-6 px-6 text-right text-gray-400 text-sm ">
              Debit
            </th>
            <th className="py-6 px-6 text-right text-gray-400 text-sm ">
              Credit
            </th>
          </tr>
        </thead>
        <tbody>
          {transactions.map((transaction) => (
            <tr
              key={`${transaction.type}-${transaction.id}`}
              className="border-b shadow-md cursor-pointer  "
            >
              <td className="py-6 px-6 font-bold">
                <div className="space-y-1">
                  <div className="text-[9px]  text-violet-400">
                    {transaction.date} |{" "}
                    <span className="">#{transaction.id}</span>
                  </div>
                  <div className="font-bold text-[13px] text-gray-500">
                    {transaction.type}
                  </div>
                  {/* <div className="text-xs text-gray-500">
                    {transaction.description}
                  </div> */}
                  {transaction.paymentMode && (
                    <div className="text-[11px] text-gray-400">
                      Payment Mode:{" "}
                      <span className="text-[11px] text-gray-600">
                        {transaction.paymentMode}
                      </span>
                    </div>
                  )}
                </div>
              </td>
              <td className="py-6 px-6 text-right text-[11px] font-bold">
                {transaction.debit > 0 ? (
                  <span className="text-red-500">₹ {transaction.debit}</span>
                ) : (
                  <span>₹ {transaction.debit}</span>
                )}
              </td>
              <td className="py-6 px-6 text-right text-[11px] font-bold">
                {transaction.credit > 0 ? (
                  <span className="text-green-500">₹ {transaction.credit}</span>
                ) : (
                  <span>₹ {transaction.credit}</span>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className="w-full py-5 px-4 rounded-sm text-xs font-bold bg-slate-200 text-gray-700  mt-6 ">
        Closing Balance
      </div>
    </div>
  );
};

export default ReportTable;
