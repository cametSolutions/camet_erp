/* eslint-disable react/prop-types */
import React from "react";
import dayjs from "dayjs";

function ReceiptPrintOutForm({ receiptData, org, contentToPrint, inWords }) {
  console.log(receiptData);
  console.log(org);
  return (
    <>
      <div
        ref={contentToPrint}
        style={{ width: "80mm", height: "auto" }}
        className="  rounded-lg   flex justify-center px-2.5 "
      >
        <div className=" print-container  max-w-3xl mx-auto  md:block w-full ">
          <div>
            <div className="flex items-center justify-between flex-col leading-4   font-bold">
              <div className="text-[12px]  tracking-wide ">
                {/* Invoice #:{data?.salesNumber}{" "} */}
              </div>
            </div>
          </div>

          <div className="flex justify-center mt-4">
            <div className=" flex flex-col  items-center">
              <div className=" flex justify-center ">
                <p className="text-black font-extrabold text-[15px] pb-1 text-center">
                  {org?.name}
                </p>
              </div>
              <div className=" flex flex-col items-center leading-4 ">
                <div className="text-black  text-[12px] font-semibold text-center">
                  {[
                    org?.flat,
                    org?.landmark,
                    org?.road,
                    org?.place,
                    org?.pin,
                    org?.mobile,
                  ]
                    .filter(Boolean) // Remove any falsy values (e.g., undefined or null)
                    .join(", ")}
                </div>
              </div>
            </div>
          </div>
          {/* </div> */}
          <div className="leading-4">
            <div className="flex justify-center ">
              <div className="font-bold text-md  mt-6">RECEIPT</div>
            </div>
            <div>
              <div className="flex gap-2 mt-4 grid grid-cols-2">
                <p className="text-black text-[9px] font-bold  tracking-wider grid-cols-1">
                  Receipt No: {receiptData?.billData[0]?.billNo}
                </p>
                <p className="text-black text-[9px] font-bold  tracking-wider grid-cols-1 text-end">
                  Date: {dayjs(receiptData?.createdAt).format("YYYY-MM-DD")}
                </p>
              </div>
            </div>
            {/* <p className="text-black text-[12px] font-semibold">
              {[address?.billToAddress]
                .filter(
                  (item) => item != null && item !== "" && item !== "null"
                )
                .join(", ") || "Address not available"}
            </p> */}
          </div>
          {receiptData?.paymentMethod === "cheque" && (
            <div>
              <div className="leading-4">
                <p className="text-black   text-[13px] font-bold mt-4 tracking-wider">
                  Name: {receiptData?.paymentDetails?.bank}
                </p>
              </div>
              <div className=" gap-2 mt-3 grid grid-cols-2">
                <div>
                  <p className="text-black text-[10px] font-bold  tracking-wider grid-cols-1">
                    CHEQUE No: {receiptData?.paymentDetails?.chequeNumber}
                  </p>
                </div>
                <div>
                  <p className="text-black text-[10px] font-bold  tracking-wider grid-cols-2 text-end">
                    CHEQUE Date: {receiptData?.paymentDetails?.chequeDate}
                  </p>
                </div>
              </div>
            </div>
          )}
          {receiptData?.paymentMethod === "upi" && (
            <div className="leading-4">
              <p className="text-black   text-[13px] font-bold mt-6 tracking-wider">
                Name: {receiptData?.party_name}
              </p>
            </div>
          )}

          {/* <hr className="border-t-2 border-black mb-0.5" /> */}
          <table className="w-full text-left     mt-2 tracking-wider ">
            <thead className="border-b border-t-2 border-black text-[10px] text-right ">
              <tr>
                <th className="text-black font-bold uppercase  px-1 text-left">
                  Particulars
                </th>
                <th className="text-black font-bold uppercase p-2 pr-0">
                  Amount
                </th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <p className=" border-gray-500 text-[14px] bg-white font-bold pt-2 pb-2">
                  Customer Name:{receiptData?.party_name}
                </p>
              </tr>
              {receiptData?.billData?.map((el, index) => {
                const total = el?.total || 0;
                const count = el?.count || 0;
                const rate = (total / count).toFixed(2) || 0;
                return (
                  <tr
                    key={index}
                    className="border-b  border-gray-500 border-t-2 text-[10px] bg-white  text-center  "
                  >
                    <td className="py-1 text-black  font-bold  pr-2 flex ">
                      Ref No{el?.billNo}
                    </td>
                    <td className="py-1 text-black  font-bold text-right pr-2">
                      {el?.settledAmount.toFixed(2)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>

          <div className="flex justify-end">
            <div className=" mt-1  ">
              <div className=" justify-end  border-black  ">
                <div className="w-3/4"></div>

                <div className="  text-black  font-extrabold text-[11px] flex justify-end   ">
                  <p className="text-nowrap border-y-2 py-1">
                    NET AMOUNT :&nbsp;{" "}
                  </p>
                  <div className="text-black  font-bold text-[11px] text-nowrap  border-y-2 py-1    ">
                    {org?.currency} &nbsp; {receiptData?.enteredAmount}
                  </div>
                </div>
                <div className="  text-black  font-extrabold text-[11px] flex justify-end   ">
                  <p className="text-nowrap border-y-2 py-1">
                    BALANCE AMOUNT :&nbsp;{" "}
                  </p>
                  {receiptData?.totalBillAmount - receiptData?.enteredAmount > 0 && (
                  <div className="text-black  font-bold text-[11px] text-nowrap  border-y-2 py-1    ">
                    {org?.currency} &nbsp;{receiptData?.totalBillAmount - receiptData?.enteredAmount}
                  </div>
                  )}
                </div>
              </div>
              
              <div className="flex  justify-end border-black pb-3 w-full ">
                <div className="w-2/4"></div>

                <div className="text-black font-bold text-[12px] flex flex-col justify-end text-right mt-1">
                  <p className="text-nowrap">Total Amount(in words)</p>
                  <div className="text-black full font-bold text-[12px] text-nowrap uppercase mt-1   ">
                    <p className="whitespace-normal text-nowrap">
                      {inWords} {org?.currencyName}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default ReceiptPrintOutForm;
