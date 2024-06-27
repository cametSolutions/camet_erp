/* eslint-disable react/prop-types */
import QRCode from "react-qr-code";

function SaleOrderPdf({
  data,
  org,
  contentToPrint,
  bank,
  inWords,
  subTotal,
  additinalCharge,
}) {


  const party = data?.party;
  console.log(party);

  let address;

  if (
    party?.newBillToShipTo &&
    Object.keys(party?.newBillToShipTo).length > 0
  ) {
    address = party?.newBillToShipTo;
  } else {
    if (party) {
      const {
        partyName,
        mobileNumber,
        emailID,
        gstNo,
        state_reference,
        billingAddress,
        shippingAddress,
        pincode,
      } = party;

      address = {
        billToName: partyName,
        billToAddress: billingAddress,
        billToPin: pincode,
        billToGst: gstNo,
        billToMobile: mobileNumber,
        billToEmail: emailID,
        billToSupply: state_reference,
        shipToName: partyName,
        shipToAddress: shippingAddress,
        shipToPin: pincode,
        shipToGst: gstNo,
        shipToMobile: mobileNumber,
        shipToEmail: emailID,
        shipToSupply: state_reference,
      };
    }
  }


  return (
    <div>
      <div
        ref={contentToPrint}
        className="rounded-lg  px-3 max-w-3xl mx-auto  md:block"
      >
        <div className="flex ">
          <div className="font-bold text-sm md:text-xl mb-2 mt-6">
            QUOTATION
          </div>
        </div>
        <div>
          <div className="bg-gray-500 h-2 w-full mt-1"></div>
          <div className="flex items-center justify-between  bg-gray-300 px-3 py-1 ">
            <div className="text-xs md:text-sm">
              Invoice #:{data?.orderNumber}{" "}
            </div>
            <div className="text-xs md:text-sm">
              Date:{new Date().toDateString()}{" "}
            </div>
          </div>
        </div>

        <div className="flex mt-2 border-t-2 py-3">
          <div className="w-0.5/5">
            {org.logo && (
              <img className="h-16 w-16 mr-2 mt-1 " src={org.logo} alt="Logo" />
            )}
          </div>
          <div className="w-4/5 flex flex-col mt-1 ml-2">
            <div className="">
              <p className="text-gray-700 font-semibold text-base pb-1">
                {org?.name}
              </p>
            </div>
            <div className="">
              <div className="text-gray-500 md:text-xs text-[10px] mt-1">
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
        <div className="flex justify-between px-5 gap-6 mt-2  bg-slate-100 py-2">
          <div className="">
            <div className="text-gray-500  mb-0.5 md:text-xs text-[9px]">
              Pan No: {org?.pan}
            </div>
            <div className="text-gray-500 mb-0.5 md:text-xs text-[9px]">
              Gst No: {org?.gstNum}
            </div>
          </div>
          <div className="flex  flex-col ">
            <div className="text-gray-500  mb-0.5 md:text-xs text-[9px] text-right">
              {org?.email}
            </div>
            <div className="text-gray-500 mb-0.5 md:text-xs text-[9px] text-right">
              {org?.website}
            </div>
          </div>
        </div>

         <div className="flex md:gap-[130px] justify-between text-[9px] md:text-xs mt-4 px-5 border-t-2 pt-4">
              <div className="border-gray-300 pb-4 mb-2">
                <h2 className="text-xs font-bold mb-1">Bill To:</h2>
                <div className="text-gray-700 ">{address?.billToName}</div>
                {address?.billToAddress?.split(/[\n,]+/).map((line, index) => (
                  <div key={index} className="text-gray-700">
                    {line.trim()}
                  </div>
                ))}
                <div className="text-gray-700">{address?.billToEmail}</div>
                <div className="text-gray-700">{address?.billToMobile}</div>
              </div>
              <div className="border-gray-300 pb-4 mb-0.5">
                <h2 className="text-xs font-bold mb-1">Ship To:</h2>
                <div className="text-gray-700">{address?.shipToName}</div>
                {address?.shipToAddress
                  ?.split(/[\n,]+/)
                  .map((line, index) => (
                    <div key={index} className="text-gray-700">
                      {line.trim()}
                    </div>
                  ))}
                <div className="text-gray-700">{address?.shipToEmail}</div>
                <div className="text-gray-700">{address?.shipToMobile}</div>
              </div>
            </div>

        {/* <hr className="border-t-2 border-black mb-0.5" /> */}
        <table className="w-full text-left  bg-slate-200">
          <thead className="border-b-2 border-t-2 border-black text-[10px] text-right">
            <tr>
              <th className="text-gray-700 font-bold uppercase py-2 px-1 text-left">
                Items
              </th>
              <th className="text-gray-700 font-bold uppercase p-2">Qty</th>
              <th className="text-gray-700 font-bold uppercase p-2">Rate</th>
              <th className="text-gray-700 font-bold uppercase p-2">Disc</th>
              <th className="text-gray-700 font-bold uppercase p-2">Tax</th>
              <th className="text-gray-700 font-bold uppercase p-2 pr-0">
                Amount
              </th>
            </tr>
          </thead>

          <tbody>
            {data?.items?.length > 0 &&
              data?.items.map((el, index) => {
                const rate = el?.selectedPriceRate || 0;
                const taxAmt = Number(
                  (
                    el?.total -
                    (el?.total * 100) / (parseFloat(el.igst) + 100)
                  )?.toFixed(2)
                ) || 0;
                const count = el?.count || 0;
                const finalAmt = Number(el?.total) || 0;

                const discountAmount =( rate * count + taxAmt - Number(finalAmt)) || 0;
                return (
                  <tr
                    key={index}
                    className="border-b-2 border-t-1 text-[9px] bg-white"
                  >
                    <td className="py-4 text-black pr-2">
                      {el.product_name} <br />
                      <p className="text-gray-400 mt-1">
                        HSN: {el?.hsn_code} ({el.igst}%)
                      </p>
                    </td>
                    <td className="py-4 text-black text-right pr-2">
                      {count} {el?.unit}
                    </td>
                    <td className="py-4 text-black text-right pr-2 text-nowrap">
                      ₹ {rate}
                    </td>
                    <td className="py-4 text-black text-right pr-2 ">
                      {discountAmount > 0
                        ? ` ₹${discountAmount?.toFixed(2)} `
                        : "₹ 0"}
                      {/* <br />
                        {el?.discountPercentage > 0 &&
                          `(${el?.discountPercentage}%)`} */}
                    </td>
                    <td className="py-4 text-black text-right pr-2">
                      {taxAmt}
                    </td>
                    <td className="py-4 text-black text-right">₹ {finalAmt}</td>
                  </tr>
                );
              })}
          </tbody>
        </table>

        <div className="flex justify-between  border-y-2 border-black py-2">
          <div className="text-gray-700 text-[10px] font-bold mr-2 uppercase">
            Subtotal:
          </div>
          <div className="text-black font-bold text-[10px]  ">₹ {subTotal}</div>
        </div>
        <div className="flex justify-between">
          <div className="mt-3 w-1/2 ">
            {bank && Object.keys(bank).length > 0 ? (
              <>
                <div className="text-gray-500 font-semibold text-[10px] leading-5">
                  Bank Name: {bank?.bank_name}
                </div>
                <div className="text-gray-500 font-semibold text-[10px] leading-5">
                  IFSC Code: {bank?.ifsc}
                </div>
                <div className="text-gray-500 font-semibold text-[10px] leading-5">
                  Account Number: {bank?.ac_no}
                </div>
                <div className="text-gray-500 font-semibold text-[10px] leading-5">
                  Branch: {bank?.branch}
                </div>
                <div
                  style={{
                    height: "auto",
                    margin: "0 ",
                    marginTop: "10px",
                    maxWidth: 64,
                    width: "100%",
                  }}
                >
                  <QRCode
                    size={250}
                    style={{
                      height: "auto",
                      maxWidth: "100%",
                      width: "100%",
                    }}
                    value={`upi://pay?pa=${bank?.upi_id}&am=${data?.finalAmount}`}
                    viewBox={`0 0 256 256`}
                  />
                </div>
              </>
            ) : (
              <div className="text-gray-500 font-semibold text-[10px] leading-5"></div>
            )}
          </div>

          <div className="w-1/2">
            <div className=" py-3   ">
              <div className="  flex justify-end ">
                <div className="text-gray-700 mr-2 font-bold text-[10px] mb-1">
                  Add on charges:
                </div>
                <div className="text-gray-700 font-bold text-[10px]">
                  ₹ {additinalCharge}
                </div>
              </div>
              {data?.additionalCharges?.map((el, index) => (
                <>
                  <div
                    key={index}
                    className="text-gray-700  text-right font-semibold text-[10px]    "
                  >
                    <span>({el?.action === "add" ? "+" : "-"})</span>{" "}
                    {el?.option}: ₹ {el?.finalValue}
                  </div>
                  {el?.taxPercentage && (
                    <div className="text-gray-700  text-right font-semibold text-[8px] mb-2">
                      ( {el?.value} + {el?.taxPercentage}% )
                    </div>
                  )}
                </>
              ))}
            </div>

            <div className="flex justify-end  border-black py-3 ">
              <div className="w-3/4"></div>

              <div className=" w-2/4 text-gray-700  font-bold text-[10px] flex justify-end   ">
                <p className="text-nowrap border-y-2 py-2">TOTAL AMOUNT:</p>
                <div className="text-gray-700  font-bold text-[10px] text-nowrap  border-y-2 py-2   ">
                  ₹ {data?.finalAmount}
                </div>
              </div>
            </div>
            <div className="flex justify-end border-black pb-3 w-full ">
              <div className="w-2/4"></div>

              <div className="  text-gray-700  font-bold text-[10px] flex flex-col justify-end text-right   ">
                <p className="text-nowrap ">Total Amount(in words)</p>
                <div className="text-gray-700  font-bold text-[7.5px] text-nowrap uppercase mt-1 ">
                  ₹ {inWords}
                </div>
              </div>
            </div>
          </div>
        </div>

        {org && org.configurations?.length > 0 && (
          <div className="border-gray-300 mb-5 mt-4">
            <div className="text-gray-700 mb-2 font-bold text-[10px]">
              Terms and Conditions
            </div>
            <div className="text-gray-700 text-[9px] leading-5">
              {org?.configurations[0]?.terms?.map((el, index) => (
                <p key={index}>
                  {" "}
                  <span className="font-bold">{index + 1}.</span> {el}
                </p>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default SaleOrderPdf;
