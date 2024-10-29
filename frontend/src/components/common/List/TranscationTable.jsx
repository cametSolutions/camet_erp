import React from "react";

const TransactionTable = ({height}) => {
  const transactions = [
    {
      id: "6",
      date: "21 Oct 2024",
      name: "RBY",
      type: "Sales Invoice",
      amount: 440,
      moneyInOut: 0,
    },
    {
      id: "7",
      date: "21 Oct 2024",
      name: "RBY",
      type: "Sales Invoice",
      amount: 440,
      moneyInOut: 0,
    },
    {
      id: "8",
      date: "21 Oct 2024",
      name: "Riyas",
      type: "Sales Invoice",
      amount: 660,
      moneyInOut: 0,
    },
    {
      id: "9",
      date: "21 Oct 2024",
      name: "Cash Sale",
      type: "Sales Invoice",
      amount: 250,
      moneyInOut: 250,
    },
    {
      id: "1",
      date: "21 Oct 2024",
      name: "RBY",
      type: "Purchase Invoice",
      amount: 950,
      moneyInOut: 0,
    },
    {
      id: "14",
      date: "21 Oct 2024",
      name: "RBY",
      type: "Receive Payment In",
      amount: 450,
      moneyInOut: 450,
    },
    {
      id: "1",
      date: "21 Oct 2024",
      name: "RBY",
      type: "",
      amount: 400,
      moneyInOut: 400,
    },
  ];

  return (
    <div className="w-full mx-auto   ">
      <div className="relative">
        {/* Fixed Header */}
    

        {/* Scrollable Body */}
        <div className="text-xs p-2">
          <table className="w-full border-collapse">
            <tbody>
              {transactions.map((transaction) => (
                <tr
                  key={`${transaction.date}-${transaction.id}`}
                  className="border-b hover:bg-gray-50   "
                >
                  <td className="p-3 w-1/2">
                    <div className="font-bold text-[0.7rem]  text-gray-500">
                      #{transaction.id}
                    </div>
                    <div className="font-bold text-[0.7rem] mb-2 text-violet-400">
                      {transaction.date}
                    </div>
                    <div className="font-semibold">{transaction.name}</div>
                    <div className="text-gray-500 text-[0.7rem]  font-bold mt-2">
                      {transaction.type}
                    </div>
                  </td>
                  <td className="p-3 text-right w-1/4">
                    <span>₹ {transaction.amount}</span>
                  </td>
                  <td className="p-3 text-right w-1/4">
                    <span
                      className={
                        transaction.moneyInOut > 0 ? "text-green-600" : ""
                      }
                    >
                      {transaction.moneyInOut > 0
                        ? `₹ ${transaction.moneyInOut}`
                        : "₹ 0"}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default TransactionTable;
