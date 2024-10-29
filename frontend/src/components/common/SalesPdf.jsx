/* eslint-disable react/prop-types */
import React from "react";
import PdfHeader from "../pdfComponents/PdfHeader";
import PdfFooter from "../pdfComponents/PdfFooter";
import { useSelector } from "react-redux";

function SalesPdf({
  data,
  org,
  contentToPrint,
  bank,
  inWords,
  subTotal,
  additinalCharge,
  userType,
  tab,
}) {
  let title = "";

  switch (tab) {
    case "sales":
      title = "Tax Invoice";
      break;

    case "purchase":
      title = "Purchase Invoice";
      break;

    case "stockTransfer":
      title = "Stock Transfer";
      break;

    case "salesOrder":
      title = "Sales Order";
      break;

    case "vanSale":
      title = "Tax Invoice";
      break;

    case "creditNote":
      title = "Credit Note";
      break;

    case "debitNote":
      title = "Debit Note";
      break;

    default:
      title = "Tax Invoice";
      break;
  }

  const primarySelectedOrg = useSelector(
    (state) => state.setSelectedOrganization.selectedOrg
  );
  const secondarySelectedOrg = useSelector(
    (state) => state.secSelectedOrganization.secSelectedOrg
  );

  const selectedOrganization =
    userType === "primaryUser" ? primarySelectedOrg : secondarySelectedOrg;

  const calculateDiscountAmntOFNoBAtch = (el) => {
    if (!el || !el.GodownList || !el.GodownList[0]) {
      console.error("Invalid input data");
      return 0;
    }

    const selectedPriceRate =
      parseFloat(el.GodownList[0].selectedPriceRate) || 0;
    const count = parseFloat(el.count) || 0;
    const total = parseFloat(el.total) || 0;
    const igst = parseFloat(el.igst) || 0;

    const priceRateCount = selectedPriceRate * count;

    const igstFactor = Number(
      (total - (total * 100) / (igst + 100)).toFixed(2)
    );

    const finalValue = parseFloat(
      (priceRateCount + igstFactor - total).toFixed(2)
    );

    return finalValue;
  };

  const calculateTotalTax = () => {
    const individualTax = data?.items?.map(
      (el) => el?.total - (el?.total * 100) / (parseFloat(el.igst) + 100)
    );
    const totalTax = individualTax
      ?.reduce((acc, curr) => (acc += curr), 0)
      .toFixed(2);
    return totalTax;
  };

  const calculateTotalQunatity = () => {
    return data?.items?.reduce((acc, curr) => {
      // Ensure curr.count is a number, defaulting to 0 if not
      curr.count = Number(curr?.count) || 0;
      // Add curr.count to the accumulator
      return acc + curr?.count;
    }, 0);
  };

  const party = data?.party;
  const despatchDetails = data?.despatchDetails;

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
      {/* <style dangerouslySetInnerHTML={{ __html: `
        tbody::after {
          content: "";
          display: block;
          height: 10px; 
          width: 100%;
          background-color: white;
        }
      ` }} /> */}
      <div className="flex-1">
        <div
          ref={contentToPrint}
          className="pdf-content rounded-lg px-3 max-w-3xl mx-auto md:block"
        >
          <div className="pdf-page">
            <div className="flex">
              <div className="font-bold text-sm md:text-xl mb-2 mt-6">
                {title}
              </div>
            </div>
            <PdfHeader
              data={data}
              org={org}
              address={address}
              despatchDetails={despatchDetails}
              tab={tab}
            />
            <table className="w-full text-left bg-slate-200">
              <thead
                className=" 
               border-b-2 border-t-2 border-black text-[10px] text-right no-repeat-header"
              >
                <tr>
                  <th className="text-gray-700 font-bold uppercase py-2 px-1 text-left">
                    No
                  </th>
                  <th className="text-gray-700 font-bold uppercase py-2 px-1 text-left">
                    Items
                  </th>
                  <th className="text-gray-700 font-bold uppercase p-2">Qty</th>
                  <th className="text-gray-700 font-bold uppercase p-2">
                    Rate
                  </th>
                  <th className="text-gray-700 font-bold uppercase p-2">
                    Disc
                  </th>
                  <th className="text-gray-700 font-bold uppercase p-2">Tax</th>
                  <th className="text-gray-700 font-bold uppercase p-2 pr-0">
                    Amount
                  </th>
                </tr>
              </thead>
              <tbody>
                {data?.items?.length > 0 &&
                  data?.items.map((el, index) => {
                    return (
                      <React.Fragment key={index}>
                        <tr className={`text-[9px] bg-white  `}>
                          <td className="w-2  ">{index + 1}</td>
                          <td className="pt-2  text-black pr-2 font-bold ">
                            {el.product_name}
                            <br />
                            <p className="text-gray-400 font-normal mt-1">
                              {el?.hsn_code !== " Not Found" &&
                                `HSN: ${el?.hsn_code} (${el?.igst}%)`}
                            </p>
                          </td>
                          <td className="pt-2 text-black text-right pr-2 font-bold">
                            {el?.count} {el?.unit}
                          </td>

                          <td className="pt-2 text-black text-right pr-2 text-nowrap">
                            {(!el.hasGodownOrBatch ||
                              (el.hasGodownOrBatch &&
                                el.GodownList &&
                                el.GodownList.length > 0 &&
                                el.GodownList.every(
                                  (godown) => godown.godown_id && !godown.batch
                                ))) &&
                              `  ${el.GodownList[0]?.selectedPriceRate || 0}`}
                          </td>

                          <td className="pt-2 text-black text-right pr-2">
                            {` ${calculateDiscountAmntOFNoBAtch(el)}`}
                          </td>
                          <td className="pt-2 text-black text-right pr-2 font-bold">
                            {`  ${(
                              el?.total -
                              (el?.total * 100) / (parseFloat(el.igst) + 100)
                            )?.toFixed(2)}`}
                          </td>
                          <td className="pt-2 pr-1 text-black text-right font-bold">
                            {el?.total}
                          </td>
                        </tr>
                        {el.hasGodownOrBatch &&
                          el.GodownList.map((godownOrBatch, idx) => {
                            const rate = godownOrBatch?.selectedPriceRate || 0;
                            const taxAmt =
                              Number(
                                (
                                  godownOrBatch?.individualTotal -
                                  (godownOrBatch?.individualTotal * 100) /
                                    (parseFloat(el.igst) + 100)
                                )?.toFixed(2)
                              ) || 0;
                            const count = godownOrBatch?.count || 0;
                            const finalAmt =
                              Number(godownOrBatch?.individualTotal) || 0;

                            const discountAmount = (
                              rate * count + (taxAmt - Number(finalAmt)) || 0
                            ).toFixed(2);

                            return godownOrBatch.added &&
                              godownOrBatch.batch ? (
                              <tr key={idx} className={`bg-white text-[9px]`}>
                                <td> </td>
                                <td className="">
                                  {godownOrBatch.batch && (
                                    <p className="ml-1.5">
                                      Batch: {godownOrBatch?.batch}
                                    </p>
                                  )}
                                </td>
                                <td className="pt-2  flex justify-end pr-2">
                                  {godownOrBatch?.count} {el?.unit}
                                </td>
                                <td className="pt-2  text-end pr-2">
                                  {godownOrBatch?.selectedPriceRate || 0}
                                </td>

                                <td className="pt-2  pr-2 text-end">
                                  {` ${discountAmount}`}
                                </td>

                                <td className="pt-2  text-black text-right pr-2">
                                  {`${(
                                    godownOrBatch?.individualTotal -
                                    (godownOrBatch?.individualTotal * 100) /
                                      (parseFloat(el.igst) + 100)
                                  )?.toFixed(2)}` || " 0"}
                                </td>
                                <td className="pt-2 text-end pr-1">
                                  <p>{godownOrBatch.individualTotal ?? 0}</p>
                                </td>
                              </tr>
                            ) : null;
                          })}
                      </React.Fragment>
                    );
                  })}
              </tbody>

              <tfoot className="">
                <tr className="bg-white border-y-2 ">
                  <td className="font-bold"></td>
                  <td className="font-bold text-[9px] p-3">Subtotal</td>
                  <td className="text-black text-[9px] ">
                    <p className="text-right pr-1 font-bold">
                      {calculateTotalQunatity()}/unit
                    </p>{" "}
                  </td>
                  <td className="text-right pr-1 text-black font-bold text-[9px]"></td>
                  <td className="text-right pr-1 text-black font-bold text-[9px]"></td>
                  <td className="text-right pr-1 text-black font-bold text-[9px]">
                    {calculateTotalTax()}
                  </td>
                  <td className="text-right pr-1 text-black font-bold text-[9px]">
                    {subTotal}
                  </td>
                </tr>
              </tfoot>
            </table>

            <PdfFooter
              bank={bank}
              org={org}
              data={data}
              additinalCharge={additinalCharge}
              inWords={inWords}
              tab={"sales"}
              selectedOrganization={selectedOrganization}
            />

            <div className="page-number"></div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default SalesPdf;
