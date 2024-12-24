/* eslint-disable react/prop-types */

function PdfHeader({ data, org, address, despatchDetails, tab = "sales" }) {
  // console.log(tab);

  let pdfNumber;
  let title;

  switch (tab) {
    case "sales":
      (pdfNumber = data?.salesNumber), (title = "Invoice No ");
      break;

    case "salesOrder":
      pdfNumber = data?.orderNumber;
      title = "No";

      break;

    case "vanSale":
      pdfNumber = data?.salesNumber;
      title = "No";

      break;

    case "purchase":
      pdfNumber = data?.purchaseNumber;
      title = "No";

      break;

    case "creditNote":
      pdfNumber = data?.creditNoteNumber;
      title = "No";

      break;

    case "debitNote":
      pdfNumber = data?.debitNoteNumber;
      title = "No";

      break;

    case "stockTransfer":
      pdfNumber = data?.stockTransferNumber;
      title = "No";

      break;

    default:
      pdfNumber = "Unknown";
      title = "No";
      // or any default value you prefer
      break;
  }
  function capitalizeFirstLetter(str) {
    return str.charAt(0).toUpperCase() + str.slice(1);
  }

  let enableBillToShipTo;

  let displayTitles = {};
  if (org?.configurations) {
    enableBillToShipTo = org?.configurations[0]?.enableBillToShipTo ?? true;

    const despatchDetailsConfig = org?.configurations[0]?.despatchDetails ?? {};
    for (const key in despatchDetailsConfig) {
      displayTitles[key] =
        despatchDetailsConfig[key] ||
        capitalizeFirstLetter(key.split(/(?=[A-Z])/).join(" "));
    }
  }

  return (
    <div>
      <div>
        <div className="bg-gray-500 h-2 w-full mt-1"></div>
        <div className="flex items-center justify-between bg-gray-300 px-3 py-1">
          <div className="text-xs md:text-sm">
            {title} : {pdfNumber}
          </div>
          <div className="text-xs md:text-sm">
            Date: {new Date(data?.createdAt).toDateString()}
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
          {org?.pan && (
            <div className="text-gray-500 mb-0.5 md:text-xs text-[9px]">
              Pan: {org?.pan && org?.pan}
            </div>
          )}
          <div className="text-gray-500 mb-0.5 md:text-xs text-[9px]">
            {org?.country === "India" ? "Gst No" : "Vat"}:{" "}
            {org?.gstNum && org?.gstNum !== null ? org.gstNum : ""}
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

      <div className="   print-md-layout flex flex-col md:flex-row  py-3 px-2 gap-3     ">
        {/* bill to  */}
        <div className=" bill-to  w-[70%]   mt-1  flex justify-between  gap-3 tracking-wider text-[11px]  md:border-r md:pr-4 ">
          <div className="border-gray-300 mb-2 ">
            <h2 className="text-xs font-bold mb-1">Supplier (Bill From):</h2>
            <div className="text-gray-700 ">{address?.billToName}</div>
            {address?.billToAddress?.split(/[\n,]+/).map((line, index) => (
              <div key={index} className="text-gray-700">
                {line.trim()}
              </div>
            ))}
            <div className="text-gray-700">
              {address?.billToEmail && address?.billToEmail !== "null"
                ? address?.billToEmail
                : ""}
            </div>
            <div className="text-gray-700">
              {address?.billToMobile && address?.billToMobile !== "null"
                ? address?.billToMobile
                : ""}
            </div>
            <div className="text-gray-700">
              {address?.billToGst && address?.billToGst !== "null"
                ? address?.billToGst
                : ""}
            </div>
          </div>
          {enableBillToShipTo && (
            <div className="border-gray-300 ">
              <h2 className="text-xs font-bold mb-1">Consignee (Ship to):</h2>
              <div className="text-gray-700">{address?.shipToName}</div>
              {address?.shipToAddress?.split(/[\n,]+/).map((line, index) => (
                <div key={index} className="text-gray-700">
                  {line.trim()}
                </div>
              ))}

              <div className="text-gray-700">
                {address?.shipToEmail !== "null" ? address?.shipToEmail : ""}
              </div>
              <div className="text-gray-700">
                {address?.shipToMobile && address?.shipToMobile !== "null"
                  ? address?.shipToMobile
                  : ""}
              </div>
              <div className="text-gray-700">
                {address?.shipToGst && address?.shipToGst !== "null"
                  ? address?.shipToGst
                  : ""}
              </div>
            </div>
          )}
        </div>

        {/* table */}
        <hr className="mb-1" />

        <table className=" details-table w-[30%]  divide-y divide-gray-200">
          <tbody>
            {despatchDetails &&
              Object?.entries(despatchDetails)
                ?.filter(([key]) => key !== "title")
                .map(([key, value]) => {
                  if (value) {
                    return (
                      <tr key={key} className="flex justify-between">
                        <td className="text-gray-500 mb-0.5 text-[9px]">
                          {displayTitles[key] ||
                            capitalizeFirstLetter(
                              key?.split(/(?=[A-Z])/).join(" ")
                            )}
                          :
                        </td>
                        <td className="text-gray-500 mb-0.5 text-[9px]">
                          {value}
                        </td>
                      </tr>
                    );
                  }
                  return null;
                })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default PdfHeader;
