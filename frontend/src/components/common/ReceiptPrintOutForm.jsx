/* eslint-disable react/prop-types */
import React from "react";
import dayjs from "dayjs";

function ReceiptPrintOutForm({
  title,
  voucherNumber,
  receiptData,
  org,
  contentToPrint,
  inWords,
}) {
  console.log(receiptData);
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
              <div className="flex justify-center ">
                <div className="font-bold text-md  mt-6 uppercase">{title}</div>
              </div>
              <div className="text-[12px]  tracking-wide mt-1 ">
                {voucherNumber}{" "}
              </div>
            </div>
          </div>

          <div className="flex justify-center mt-2">
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
          <div className="leading-4 mt-4">
            <div className="flex justify-start">
              <p className="text-black text-[9px] font-bold  tracking-wider text-end">
                Date: {dayjs(receiptData?.createdAt).format("YYYY-MM-DD")}
              </p>
            </div>

            {receiptData?.paymentMethod === "Cheque" && (
              <div>
                <div>
                  <p className="text-black   text-[11px] font-bold mt-1 tracking-wider">
                    Bank: {receiptData?.paymentDetails?.bank_name}
                  </p>
                </div>
                <div className="">
                  <div>
                    <p className="text-black text-[10px] font-bold  tracking-wider ">
                      CHEQUE No: {receiptData?.paymentDetails?.chequeNumber}
                    </p>
                  </div>
                  <div>
                    <p className="text-black text-[10px] font-bold  tracking-wider ">
                      CHEQUE Date:{" "}
                      {new Date(
                        receiptData?.paymentDetails?.chequeDate
                      ).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              </div>
            )}
            {receiptData?.paymentMethod === "Online" && (
              <div>
                <div>
                  <p className="text-black   text-[11px] font-bold mt-1 tracking-wider">
                    Bank: {receiptData?.paymentDetails?.bank_name}
                  </p>
                </div>
              </div>
            )}
          </div>

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
                <p className=" border-gray-500 text-[11px] bg-white font-bold pt-2 pb-2">
                  Name: {receiptData?.party?.partyName}
                </p>
              </tr>
              {receiptData?.billData?.length > 0 ? (
                receiptData?.billData?.map((el, index) => {
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
                })
              ) : (
                <tr
                
                  className="border-b  border-gray-500 border-t-2 text-[10px] bg-white  text-center  "
                >
                  <td className="py-1 text-black  font-bold  pr-2 flex ">
                    Ref No #
                  </td>
                  <td className="py-1 text-black  font-bold text-right pr-2">
                   0
                  </td>
                </tr>
              )}
            </tbody>
          </table>

          <div className="flex justify-end">
            <div className=" mt-1  ">
              <div className=" justify-end  border-black  ">
                <div className="  text-black  font-extrabold text-[11px] flex justify-end   ">
                  <p className="text-nowrap border-b-2 py-1">
                    Settled Amount :&nbsp;{" "}
                  </p>
                  <div className="text-black  font-bold text-[11px] text-nowrap  border-b-2 py-1    ">
                    {org?.currency} &nbsp;{" "}
                    {receiptData?.enteredAmount > receiptData?.totalBillAmount
                      ? receiptData?.totalBillAmount
                      : receiptData?.enteredAmount}
                  </div>
                </div>

                {receiptData?.advanceAmount > 0 && (
                  <div className="  text-black  font-extrabold text-[11px] flex justify-end   ">
                    <p className="text-nowrap border-b-2 py-1">
                      Advance Amount :&nbsp;{" "}
                    </p>
                    <div className="text-black  font-bold text-[11px] text-nowrap  border-b-2 py-1    ">
                      {org?.currency} &nbsp; {receiptData?.advanceAmount}
                    </div>
                  </div>
                )}
                <div className="  text-black  font-extrabold text-[11px] flex justify-end   ">
                  <p className="text-nowrap border-b-2 py-1">
                    Received Amount :&nbsp;{" "}
                  </p>
                  <div className="text-black  font-bold text-[11px] text-nowrap  border-b-2 py-1    ">
                    {org?.currency} &nbsp; {receiptData?.enteredAmount}
                  </div>
                </div>
                {receiptData?.remainingAmount > 0 && (
                  <div className="  text-black  font-extrabold text-[11px] flex justify-end   ">
                    <p className="text-nowrap border-b-2 py-1">
                      Balance Amount :&nbsp;{" "}
                    </p>
                    <div className="text-black  font-bold text-[11px] text-nowrap  border-b-2 py-1    ">
                      {org?.currency} &nbsp; {receiptData?.remainingAmount}
                    </div>
                  </div>
                )}
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
