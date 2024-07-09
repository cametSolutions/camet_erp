/* eslint-disable react/prop-types */

function PdfHeader({ data, org, address, despatchDetails, tab="sales" }) {
  let pdfNumber;

  switch (tab) {
    case "sales":
      pdfNumber = data?.salesNumber;
      break;

    case "salesOrder":
      pdfNumber = data?.orderNumber;
      break;

    default:
      pdfNumber = "Unknown"; // or any default value you prefer
      break;
  }

  return (
    <div>
      <div>
        <div className="bg-gray-500 h-2 w-full mt-1"></div>
        <div className="flex items-center justify-between bg-gray-300 px-3 py-1">
          <div className="text-xs md:text-sm">Invoice #: {pdfNumber}</div>
          <div className="text-xs md:text-sm">
            Date: {new Date().toDateString()}
          </div>
        </div>
      </div>
      <div className="flex items-center border-t-2 py-2">
        <div className="w-0.5/5">
          {org.logo && (
            <img className="h-16 w-16 mr-2 mt-1" src={org.logo} alt="Logo" />
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
                .filter(Boolean)
                .join(", ")}
            </div>
          </div>
        </div>
      </div>

      <div className="  flex  justify-between px-5 gap-6  bg-slate-100 py-2">
        <div className="">
          <div className="text-gray-500 mb-0.5 md:text-xs text-[9px]">
            Pan No: {org?.pan && org?.pan}
          </div>
          <div className="text-gray-500 mb-0.5 md:text-xs text-[9px]">
            Gst No: {org?.gstNum && org?.gstNum !== null ? org.gstNum : ""}

          </div>
        </div>
        <div className="flex flex-col">
          <div className="text-gray-500 mb-0.5 md:text-xs text-[9px] text-right">
          {org?.email && org?.email !== null ? org.email : ""}
          </div>
          <div className="text-gray-500 mb-0.5 md:text-xs text-[9px] text-right">
          {org?.website && org?.website !== null ? org.website : ""}
          </div>
        </div>
      </div>
      <hr className="border-2" />

      <div className="   print-md-layout flex flex-col md:flex-row  w-full py-3 px-2 gap-3     ">
        {/* bill to  */}
        <div className=" bill-to  md:w-1/2  w-full mt-1  flex justify-between tracking-wider text-[11px]  md:border-r md:pr-4 ">
          <div className="border-gray-300 mb-2 ">
            <h2 className="text-xs font-bold mb-1">Bill To:</h2>
            <div className="text-gray-700 ">{address?.billToName}</div>
            {address?.billToAddress?.split(/[\n,]+/).map((line, index) => (
              <div key={index} className="text-gray-700">
                {line.trim()}
              </div>
            ))}
            <div className="text-gray-700">{address?.billToEmail && address?.billToEmail !== "null" ? address?.billToEmail:""}</div>
            <div className="text-gray-700">{address?.billToMobile && address?.billToMobile !== "null" ? address?.billToMobile:""}</div>
          </div>
          <div className="border-gray-300 ">
            <h2 className="text-xs font-bold mb-1">Ship To:</h2>
            <div className="text-gray-700">{address?.shipToName}</div>
            {address?.shipToAddress?.split(/[\n,]+/).map((line, index) => (
              <div key={index} className="text-gray-700">
                {line.trim()}
              </div>
            ))}

            <div className="text-gray-700">{address?.shipToEmail !== "null" ? address?.shipToEmail:""}</div>
            <div className="text-gray-700">{address?.shipToMobile && address?.shipToMobile !== "null" ? address?.shipToMobile:""}</div>
          </div>
        </div>

        {/* table */}
        <hr className="mb-1" />

        <table className=" m details-table md:w-1/2  w-full  divide-y divide-gray-200  ">
          <tbody className="  ">
            {despatchDetails?.challanNo && (
            <tr className="flex justify-between">
              <td className="text-gray-500 mb-0.5  text-[11px]">Challan No:</td>
              <td className="text-gray-500 mb-0.5  text-[11px]">
                {despatchDetails?.challanNo}
              </td>
            </tr>
               )}
               {despatchDetails?.containerNo && (
            <tr className="flex justify-between">
              <td className="text-gray-500 mb-0.5  text-[11px]">
                Container No:
              </td>
              <td className="text-gray-500 mb-0.5  text-[11px]">
                {despatchDetails?.containerNo}
              </td>
            </tr>
              )}
              {despatchDetails?.despatchThrough && (        
            <tr className="flex justify-between">
              <td className="text-gray-500 mb-0.5  text-[11px]">
                Despatch Through:
              </td>
              <td className="text-gray-500 mb-0.5  text-[11px]">
                {despatchDetails?.despatchThrough}
              </td>
            </tr>
              )}
              {despatchDetails?.destination && (
            <tr className="flex justify-between">
              <td className="text-gray-500 mb-0.5  text-[11px]">
                Destination:
              </td>
              <td className="text-gray-500 mb-0.5  text-[11px]">
                {despatchDetails?.destination}
              </td>
            </tr> 
              )}
            {despatchDetails?.vehicleNo && (
            <tr className="flex justify-between">
              <td className="text-gray-500 mb-0.5  text-[11px]">Vehicle No:</td>
              <td className="text-gray-500 mb-0.5  text-[11px]">
                {despatchDetails?.vehicleNo}
              </td>
            </tr>
            )}
            {despatchDetails?.orderNo && (
            <tr className="flex justify-between">
              <td className="text-gray-500 mb-0.5  text-[11px]">Order No:</td>
              <td className="text-gray-500 mb-0.5  text-[11px]">
                {despatchDetails?.orderNo}
              </td>
            </tr>
              )}
              {despatchDetails?.termsOfPay && (
            <tr className="flex justify-between">
              <td className="text-gray-500 mb-0.5  text-[11px]">
                Terms Of Pay:
              </td>
              <td className="text-gray-500 mb-0.5  text-[11px]">
                {despatchDetails?.termsOfPay}
              </td>
            </tr>
              )}
              {despatchDetails?.termsOfDelivery && (
            <tr className="flex justify-between">
              <td className="text-gray-500 mb-0.5  text-[11px]">
                Terms Of Delivery
              </td>
              <td className="text-gray-500 mb-0.5  text-[11px]">
                {despatchDetails?.termsOfDelivery}
              </td>
            </tr>
              )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default PdfHeader;
