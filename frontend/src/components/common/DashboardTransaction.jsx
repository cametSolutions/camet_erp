/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable react-refresh/only-export-components */
/* eslint-disable react/prop-types */
/* eslint-disable react/display-name */
import React, { useMemo } from "react";
import dayjs from "dayjs";
import { IoArrowRedoOutline } from "react-icons/io5";
import { useNavigate } from "react-router-dom";
import { GiCancel } from "react-icons/gi";

const DashboardTransaction = ({ filteredData, userType, from }) => {
  const navigate = useNavigate();

  const typeColors = useMemo(
    () => ({
      "Receipt": "bg-red-500",
      "Payment": "bg-[#5e548e]",
      "Tax Invoice": "bg-blue-500",
      "Purchase": "bg-[#2d6a4f]",
      "Van Sale": "bg-teal-500",
      "Stock Transfer": "bg-purple-500",
      "Credit Note": "bg-pink-500",
      "Debit Note": "bg-[#3b429f]",
      "default": "bg-[#227c9d]",
    }),
    []
  );

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
        "Credit Note": `${baseRoute}/creditDetails/${id}`,
        "Debit Note": `${baseRoute}/debitDetails/${id}`,
        default: `${baseRoute}/InvoiceDetails/${id}`,
      };
      return routes[type] || routes.default;
    },
    [userType]
  );

  const handleTransactionClick = (type, id) => {
    const path = getNavigationPath(type, id);
    navigate(path, { state: { from } });
  };

  const renderTransaction = useMemo(
    () => (transaction, index) => {
      const {
        type,
        _id,
        party_name,
        billNo,
        createdAt,
        enteredAmount,
        isCancelled,
      } = transaction;

      return (
        <div
          key={_id || index}
          onClick={() => handleTransactionClick(type, _id)}
          className="bg-white cursor-pointer rounded-md shadow-lg border border-gray-100 flex flex-col justify-between px-4 transition-all duration-150 transform hover:translate-x-1 ease-in-out"
        >
          <div className="flex justify-start text-xs mt-2">
            <div
              className={`${
                typeColors[type] || typeColors.default
              } flex items-center text-white px-2 rounded-sm`}
            >
              <p className="p-1 rounded-lg px-3 font-semibold">{type}</p>
            </div>
          </div>

          <div className="flex justify-between">
            <div className="h-full px-2 py-4 lg:p-6 w-[150px] md:w-[180px] lg:w-[300px] flex justify-center items-start relative flex-col">
              <p className="font-bold md:font-semibold text-[11.3px] md:text-[15px] text-left mb-3">
                {party_name}
              </p>
              <p className="font-bold md:font-semibold text-[11.3px] md:text-[15px] text-left text-violet-500">
                {billNo}
              </p>
              <p className="text-gray-400 text-sm">
                {dayjs(createdAt).format("DD/MM/YYYY")}
              </p>
            </div>
            <div className="h-full p-2 lg:p-6 w-[150px] md:w-[180px] lg:w-[300px] flex justify-center items-end relative flex-col">
              <div className="flex-col">
                <p className="font-semibold text-green-600">₹{enteredAmount}</p>
              </div>
            </div>
          </div>
          <hr />
          <div className="flex justify-between p-4">
            <div className="flex items-center justify-between w-full gap-2 text-md text-violet-500">
              <div className="flex items-center gap-2">
                <IoArrowRedoOutline />
                <p>Send Receipt</p>
              </div>
              {isCancelled && (
                <div className="flex text-gray-500  items-center gap-1 text-xs md:text-sm  font-semibold">
                    <GiCancel  color="red " className="mt-1"/>
                  <p>
                  Cancelled
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      );
    },
    [typeColors, getNavigationPath, handleTransactionClick]
  );

  const memoizedData = useMemo(() => filteredData, [filteredData]);

  return (
    <div className="grid grid-cols-1 gap-4 text-center pb-7 mt-5 md:px-2 overflow-hidden">
      {memoizedData?.map(renderTransaction)}
    </div>
  );
};

  export default React.memo(DashboardTransaction);
