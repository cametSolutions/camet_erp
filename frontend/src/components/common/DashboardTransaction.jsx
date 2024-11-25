/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable react-refresh/only-export-components */
/* eslint-disable react/prop-types */
/* eslint-disable react/display-name */
import React, { useMemo } from "react";
import dayjs from "dayjs";
import { useNavigate } from "react-router-dom";
import { GiCancel } from "react-icons/gi";

const DashboardTransaction = ({ filteredData, userType, from }) => {
  const navigate = useNavigate();

  const typeColors = useMemo(
    () => ({
      Receipt: "bg-red-500",
      Payment: "bg-[#5e548e]",
      "Tax Invoice": "bg-blue-500",
      Purchase: "bg-[#2d6a4f]",
      "Van Sale": "bg-teal-500",
      "Stock Transfer": "bg-purple-500",
      "Credit Note": "bg-pink-500",
      "Debit Note": "bg-[#3b429f]",
      default: "bg-[#227c9d]",
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
        // billNo,
        createdAt,
        enteredAmount,
        isCancelled,
        voucherNumber,
        secondaryUserName = "",
      } = transaction;

      return (
        <div
          key={_id || index}
          onClick={() => handleTransactionClick(type, _id)}
          className="bg-white cursor-pointer rounded-sm shadow-lg border border-gray-100 flex flex-col justify-between px-4 transition-all duration-150 transform hover:translate-x-[2px] ease-in-out"
        >
          <div className="flex w-full items-center">
            <div className="w-3/4">
              {/*  */}
              <div className=" text-xs mt-2 px-2  lg:px-6 ">
                <p className="font-bold md:font-semibold text-[11.3px] md:text-[12px] text-left text-violet-500">
                  # {voucherNumber}
                </p>
              </div>
              {/* party */}

              <div className=" text-xs  px-2  lg:px-6 ">
                <p className="font-bold mt-2 text-[11.3px]  text-left text-gray-600 ">
                  {party_name}
                </p>
              </div>

              {/* date/type */}

              <div className="flex justify-between  items-center mb-2">
                <div className=" px-2 py-2 lg:px-6  lg:py-1  w-[150px] md:w-[180px] lg:w-[300px] flex justify-center items-start relative flex-col">
                  <section className="flex gap-1  items-center">
                    <p className="text-gray-400 text-[10px] font-bold">
                      {dayjs(createdAt).format("DD/MM/YYYY")}
                    </p>

                    <div
                      // className={`${
                      //   typeColors[type] || typeColors.default
                      // } flex items-center text-white px-2 rounded-sm`}
                      className="flex items-center  rounded-sm"
                    >
                      <p className="p-1 rounded-lg  font-bold text-[10px] text-gray-600">
                        <span className="mr-1">/</span> {type}
                      </p>
                    </div>
                  </section>
                </div>
              </div>
            </div>
            <div className="flex-1">
              <p className="font-bold text-sm text-gray-500">
                ₹{enteredAmount || 0}
              </p>
            </div>
          </div>

          {secondaryUserName !== "" && (
            <>
              <hr className="mx-[-16px]" />
              <div className="flex justify-between flex-wrap px-6 py-3 bg-gray-100 mx-[-16px] items-center ">
                <div className="flex items-center justify-between w-full gap-2 text-md text-violet-500">
                  <div className="flex items-center gap-2">
                    <p className="font-bold  md:font-semibold text-xs text-left  text-gray-500 flex ">
                      Created by : {secondaryUserName || ""}
                    </p>
                  </div>
                  {isCancelled && (
                    <div className="flex text-gray-500  items-center gap-1 text-xs   font-semibold">
                      <GiCancel color="red " className="" />
                      <p>Cancelled</p>
                    </div>
                  )}
                </div>
              </div>
            </>
          )}
        </div>
      );
    },
    [typeColors, getNavigationPath, handleTransactionClick]
  );

  const memoizedData = useMemo(() => filteredData, [filteredData]);

  return (
    <div className="grid grid-cols-1 gap-4 text-center pb-7 mt-2 md:px-2 overflow-hidden">
      {memoizedData?.map(renderTransaction)}
    </div>
  );
};

export default React.memo(DashboardTransaction);
