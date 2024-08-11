/* eslint-disable react/prop-types */
import dayjs from "dayjs";
import { FcCancel } from "react-icons/fc";
import { IoArrowRedoOutline } from "react-icons/io5";
import { useNavigate } from "react-router-dom";

function DashboardTransaction({ filteredData, userType }) {
  console.log(userType);
  const navigate = useNavigate();
  return (
    <div className="grid grid-cols-1 gap-4  text-center pb-7 mt-5 md:px-2 overflow-hidden  ">
      {filteredData?.map((el, index) => (
        <div
          key={index}
          onClick={() => {
            const navigationPath =
              el.type === "Receipt"
                ? `/${
                    userType === "primary" ? "pUsers" : "sUsers"
                  }/receiptDetails/${el._id}`
                : el.type === "Tax Invoice"
                ? `/${
                    userType === "primary" ? "pUsers" : "sUsers"
                  }/salesDetails/${el._id}`
                : el.type === "Van Sale"
                ? `/${
                    userType === "primary" ? "pUsers" : "sUsers"
                  }/vanSaleDetails/${el._id}`
                : el.type === "Purchase"
                ? `/${
                    userType === "primary" ? "pUsers" : "sUsers"
                  }/purchaseDetails/${el._id}`
                : el.type === "Stock Transfer"
                ? `/${
                    userType === "primary" ? "pUsers" : "sUsers"
                  }/stockTransferDetails/${el._id}`
                : `/${
                    userType === "primary" ? "pUsers" : "sUsers"
                  }/InvoiceDetails/${el._id}`;
            navigate(navigationPath, { state: { from: "dashboard" } });
          }}
          className={`
          
          
          bg-[#fff] cursor-pointer rounded-md shadow-lg border border-gray-100 flex flex-col justify-between px-4 transition-all duration-150 transform hover:scale-105 ease-in-out`}
        >
          <div className=" flex justify-start text-xs mt-2 ">
            <div
              className={` ${
                el.type === "Receipt"
                  ? "bg-[#FB6D48]"
                  : el.type === "Tax Invoice"
                  ? "bg-violet-500"
                  : el.type === "Purchase"
                  ? "bg-pink-500"
                  : el.type === "Van Sale"
                  ? "bg-[#25cbcb]"
                  : el?.type === "Stock Transfer"
                  ? "bg-[#c42383]"
                  : "bg-[#1b47ae]"
              }   flex items-center text-white px-2 rounded-sm `}
            >
              {/* <FaRegCircleDot /> */}
              <p className=" p-1  rounded-lg px-3 font-semibold"> {el.type}</p>
            </div>
          </div>

          <div className="flex justify-between ">
            <div className=" h-full px-2 py-4  lg:p-6 w-[150px] md:w-[180px] lg:w-[300px] flex justify-center items-start relative flex-col ">
              <p className="font-bold md:font-semibold text-[11.3px] md:text-[15px] text-left mb-3 ">
                {el.party_name}
              </p>
              <p className="font-bold md:font-semibold text-[11.3px] md:text-[15px] text-left text-violet-500 ">
                {el.billNo}
              </p>

              <p className="text-gray-400 text-sm  ">
                {dayjs(el?.createdAt).format("DD/MM/YYYY")}
              </p>
            </div>
            <div className=" h-full p-2 lg:p-6 w-[150px] md:w-[180px] lg:w-[300px] flex justify-center items-end relative flex-col">
              <div className="flex-col  ">
                <p className=" font-semibold text-green-600  ">
                  ₹{el.enteredAmount}
                </p>
              </div>
            </div>
          </div>
          <hr />
          <hr />
          <hr />
          <div className="flex justify-between p-4">
            {/* <button
                    onClick={() => {
                      handleCancel(el._id);
                    }}
                    className="p-2 py-1 rounded-lg text-white bg-red-500 flex items-center gap-2 transition-all duration-150 transform hover:scale-105 hover:bg-red-600"
                  >
                    <ImCancelCircle />
                    {el.isCancelled ? "Cancelled" : "Cancel"}
                  </button> */}

            <div className=" flex items-center justify-between w-full gap-2 text-md text-violet-500">
              <div className="flex items-center gap-2">
                <IoArrowRedoOutline />

                <p>Send Receipt</p>
              </div>
              {el.isCancelled && (
                <div className="flex justify-center items-center gap-2 text-red-500">
                  <FcCancel />
                  <p>Canelled</p>
                </div>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

export default DashboardTransaction;
