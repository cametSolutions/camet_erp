/* eslint-disable react/prop-types */
import dayjs from "dayjs";
import { useEffect, useMemo } from "react";
import { useLocation, useNavigate } from "react-router-dom";

const TransactionTable = ({
  transactionData,
  getDifference,
  loading,
  // userType,
}) => {
  const location = useLocation();
  const navigate = useNavigate();

  let userType;
  if (location.pathname.startsWith("/pUsers")) {
    userType = "primaryUser";
  } else if (location.pathname.startsWith("/sUsers")) {
    userType = "secondaryUser";
  }

  // Helper function to determine transaction type and color
  const getTransactionDisplay = (transaction) => {
    const { type, accountGroup, paymentMethod, enteredAmount, cashTotal } =
      transaction;

    // Check if it's a debit (green) transaction
    const isDebitTransaction =
      (["Tax Invoice", "Debit Note"].includes(type) &&
        accountGroup === "Cash-in-Hand") ||
      (type === "Receipt" && paymentMethod === "Cash") ||
      (["Tax Invoice", "Debit Note"].includes(type) && cashTotal > 0);

    // Check if it's a credit (red) transaction
    const isCreditTransaction =
      (["Purchase", "Credit Note"].includes(type) &&
        accountGroup === "Cash-in-Hand") ||
      (type === "Payment" && paymentMethod === "Cash");

    // Return appropriate display object
    if (isDebitTransaction) {
      return {
        amount: cashTotal > 0 ? cashTotal : enteredAmount,
        color: "text-green-500",
        type: "debit",
      };
    } else if (isCreditTransaction) {
      return {
        amount: cashTotal > 0 ? cashTotal : enteredAmount,
        color: "text-red-500",
        type: "credit",
      };
    }
    // else if (accountGroup === "Bank Accounts") {
    //   return {
    //     amount: enteredAmount,
    //     color: "text-gray-500",
    //     type: "bank"
    //   };
    // }

    return null;
  };

  useEffect(() => {
    const totals = transactionData?.reduce(
      (acc, transaction) => {
        const display = getTransactionDisplay(transaction);
        const amount = Number(transaction.enteredAmount) || 0;

        if (display?.type === "debit") {
          acc.debitSum += amount;
        } else if (display?.type === "credit") {
          acc.creditSum += amount;
        }

        return acc;
      },
      { debitSum: 0, creditSum: 0 }
    );

    getDifference(totals?.debitSum - totals?.creditSum);
  }, [transactionData]);

  const getNavigationPath = useMemo(
    () => (type, id) => {
      const baseRoute = `/${userType === "primary" ? "pUsers" : "sUsers"}`;
      const routes = {
        Receipt: `${baseRoute}/receipt/details/${id}`,
        Payment: `${baseRoute}/payment/details/${id}`,
        "Tax Invoice": `${baseRoute}/salesDetails/${id}`,
        "Van Sale": `${baseRoute}/vanSaleDetails/${id}`,
        Purchase: `${baseRoute}/purchaseDetails/${id}`,
        "Stock Transfer": `${baseRoute}/stockTransferDetails/${id}`,
        "Credit Note": `${baseRoute}/creditNoteDetails/${id}`,
        "Debit Note": `${baseRoute}/debitNoteDetails/${id}`,
        default: `${baseRoute}/saleOrderDetails/${id}`,
      };
      return routes[type] || routes.default;
    },
    [userType]
  );

  const handleTransactionClick = (type, id) => {
    const path = getNavigationPath(type, id);
    navigate(path, { state: { from: location?.pathname } });
  };

  return (
    <div className="w-full mx-auto">
      <div className="relative">
        <div className="text-xs p-2">
          <table className="w-full border-collapse">
            <tbody>
              {transactionData?.map((transaction) => {
                const display = getTransactionDisplay(transaction);

                return (
                  <tr
                    onClick={() =>
                      handleTransactionClick(
                        transaction?.type,
                        transaction?._id
                      )
                    }
                    key={transaction?._id}
                    className="border-b hover:bg-gray-50 cursor-pointer"
                  >
                    <td className="p-3 w-1/2">
                      <div className="font-bold text-[0.7rem] text-gray-500">
                        #{transaction?.voucherNumber}
                      </div>
                      <div className="font-bold text-[0.7rem] mb-2 mt-1 text-violet-400">
                        {dayjs(transaction?.date).format("DD/MM/YYYY")}
                      </div>
                      <div className="font-bold text-gray-700 mt-3">
                        {transaction?.party_name}
                      </div>
                      <div className="text-gray-500 text-[0.7rem] font-bold mt-2">
                        {transaction?.type}
                      </div>
                      <div className="text-gray-500 text-[0.7rem] font-bold mt-2 ">
                        Created By:{" "}
                        {transaction?.secondaryUserName?.length > 15
                          ? `${transaction?.secondaryUserName.slice(0, 15)}...`
                          : transaction?.secondaryUserName}
                      </div>
                    </td>
                    <td className="p-3 font-bold text-gray-500 text-right w-1/4">
                      {transaction?.enteredAmount}
                    </td>
                    <td className="p-3 font-bold text-right w-1/4">
                      {display && (
                        <span className={display.color}>{display.amount}</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>

          {!loading && (transactionData?.length === 0 || !transactionData) && (
            <div className="w-full py-5 px-4 rounded-sm text-xs font-bold text-gray-700 mt-6 flex justify-center">
              OOps. No Transactions Found !!
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TransactionTable;
