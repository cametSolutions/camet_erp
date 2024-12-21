/* eslint-disable react/prop-types */
import React, { useEffect, useState } from "react";

import { useSelector } from "react-redux";
import numberToWords from "number-to-words";
import PdfHeader from "./PdfHeader";
import PdfFooter from "./PdfFooter";

function SalesPdf({
  data,
  org,
  contentToPrint,
  bank,
  // inWords,
  // subTotal,
  // additinalCharge,
  userType,
  tab,
}) {
  const [subTotal, setSubTotal] = useState("");
  const [additinalCharge, setAdditinalCharge] = useState("");
  const [inWords, setInWords] = useState("");

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

  const configurations = useSelector(
    (state) =>
      state.secSelectedOrganization?.secSelectedOrg?.configurations[0]
        ?.printConfiguration
  ).find((item) => item.voucher === "sale");

  console.log("configurations", configurations);

  // const salesConfiguration = configurations?.find(
  //   (item) => item.voucher === "sale"
  // );

  // const calculateDiscountAmntOFNoBAtch = (el) => {
  //   if (!el || !el.GodownList || !el.GodownList[0]) {
  //     console.error("Invalid input data");
  //     return 0;
  //   }

  //   const selectedPriceRate =
  //     parseFloat(el.GodownList[0].selectedPriceRate) || 0;
  //   const count = parseFloat(el.count) || 0;
  //   const total = parseFloat(el.total) || 0;
  //   const igst = parseFloat(el.igst) || 0;
  //   const isTaxInclusive = el.isTaxInclusive || false; // Flag to check if price is tax-inclusive

  //   // Calculate the total price before tax
  //   const priceRateCount = selectedPriceRate * count;

  //   // Check if tax is included or not
  //   if (isTaxInclusive) {
  //     // For tax-inclusive, compare totalPrice and finalAmt
  //     // If they are equal, there's no discount. Otherwise, calculate the discount
  //     const discount = (
  //       priceRateCount === total ? 0 : priceRateCount - total
  //     ).toFixed(2);
  //     return parseFloat(discount);
  //     // return 100;
  //   } else {
  //     // For tax-exclusive, adjust the total amount by subtracting igst
  //     const priceWithoutTax = total - igst;
  //     const discount = (priceRateCount - priceWithoutTax).toFixed(2);
  //     return parseFloat(discount);
  //     // return 200;
  //   }
  // };

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

  const calculateTaxAmount = (godownOrBatch, item) => {
    console.log("godownOrBatch", godownOrBatch);
    console.log("item", item);

    const { selectedPriceRate, count, discount } = godownOrBatch;
    const { isTaxInclusive, igst } = item;
    const igstValue = parseFloat(igst) || 0;

    let basePrice = Number(selectedPriceRate * count);
    let taxBasePrice = 0;

    if (isTaxInclusive) {
      console.log("isTaxInclusive", isTaxInclusive);

      taxBasePrice = Number((basePrice / (1 + igstValue / 100)).toFixed(2));
    } else {
      taxBasePrice = basePrice;
    }

    console.log("taxBasePrice", taxBasePrice);

    let priceAfterDiscount = taxBasePrice;

    if (discount) {
      priceAfterDiscount = Number((taxBasePrice - discount).toFixed(2));
    }

    const taxAmount = Number(
      ((priceAfterDiscount * igstValue) / 100).toFixed(2)
    );

    return taxAmount;
  };

  //// for batch and godown

  // const calculateDiscount = (rate, count, taxAmt, finalAmt, isTaxInclusive) => {
  //   // Calculate the total price
  //   const totalPrice = rate * count;

  //   // Check if tax is inclusive
  //   if (isTaxInclusive) {
  //     // For tax-inclusive items, directly compare totalPrice and finalAmt
  //     return (totalPrice === finalAmt ? 0 : totalPrice - finalAmt).toFixed(2);
  //   } else {
  //     // For non-tax-inclusive items
  //     return (totalPrice - (finalAmt - taxAmt)).toFixed(2);
  //   }
  // };

  useEffect(() => {
    if (data && data.items) {
      const subTotal = data.items
        .reduce((acc, curr) => acc + parseFloat(curr?.total), 0)
        .toFixed(2);
      setSubTotal(subTotal);

      const addiTionalCharge = data?.additionalCharges
        ?.reduce((acc, curr) => {
          let value = curr?.finalValue === "" ? 0 : parseFloat(curr.finalValue);
          if (curr?.action === "add") {
            return acc + value;
          } else if (curr?.action === "sub") {
            return acc - value;
          }
          return acc;
        }, 0)

        ?.toFixed(2);
      setAdditinalCharge(addiTionalCharge);

      const [integerPart, decimalPart] = data.finalAmount.toString().split(".");
      const integerWords = numberToWords.toWords(parseInt(integerPart, 10));
      const decimalWords = decimalPart
        ? ` and ${numberToWords.toWords(parseInt(decimalPart, 10))} `
        : " and Zero";

      const mergedWord = [
        ...(integerWords + " "),
        (selectedOrganization?.currencyName ?? "") + " ",
        ...decimalWords,
        (selectedOrganization?.subunit ?? "") + " ",
      ].join("");

      setInWords(mergedWord);
    }
  }, [data]);

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
                {configurations?.printTitle || "Tax Invoice"}
              </div>
            </div>
            <PdfHeader
              configurations={configurations}
              data={data}
              org={org}
              address={address}
              despatchDetails={despatchDetails}
              tab={tab}
            />
            <table className="w-full text-left bg-slate-200">
              <thead className="border-b-2 border-t-2 border-black text-[10px] text-right ">
                <tr>
                  <th className="text-gray-700 font-bold uppercase py-2 px-1 text-left">
                    No
                  </th>
                  <th className="text-gray-700 font-bold uppercase py-2 px-1 text-left">
                    Items
                  </th>
                  {configurations?.showHsn && (
                    <th className="text-gray-700 font-bold uppercase p-2">
                      HSN
                    </th>
                  )}

                  {configurations?.showTaxPercentage && (
                    <th className="text-gray-700 font-bold uppercase p-2">
                      Tax %
                    </th>
                  )}

                  <th className="text-gray-700 font-bold uppercase p-2">Qty</th>
                  <th className="text-gray-700 font-bold uppercase p-2">
                    Rate
                  </th>
                  {configurations?.showDiscount &&
                    configurations?.showDiscountAmount && (
                      <th className="text-gray-700 font-bold uppercase p-2">
                        Disc
                      </th>
                    )}
                  {configurations?.showDiscount &&
                    !configurations?.showDiscountAmount && (
                      <th className="text-gray-700 font-bold uppercase p-2">
                        Disc{" "}
                      </th>
                    )}
                  {configurations?.showStockWiseTaxAmount && (
                    <th className="text-gray-700 font-bold uppercase p-2">
                      Tax
                    </th>
                  )}
                  <th className="text-gray-700 font-bold uppercase p-2 pr-0 ">
                    Amount
                  </th>
                </tr>
              </thead>
              <tbody className="">
                {data?.items?.length > 0 &&
                  data?.items.map((el, index) => {
                    return (
                      <React.Fragment key={index}>
                        <tr className={`text-[9px] bg-white `}>
                          <td className="w-2  ">{index + 1}</td>
                          <td
                            className={`  ${
                              data?.items?.length === index + 1 ? "pb-3" : ""
                            }  pt-2  text-black pr-2 font-bold`}
                          >
                            {el.product_name}{" "}
                          </td>
                          {configurations?.showHsn &&
                            (!el?.hasGodownOrBatch ? (
                              <td className="py-4 text-black text-right pr-2">
                                {el?.hsn_code || ""}
                              </td>
                            ) : (
                              <td className="py-4 text-black text-right pr-2"></td>
                            ))}

                          {configurations?.showTaxPercentage &&
                            (!el?.hasGodownOrBatch ? (
                              <td className="pt-2 text-black text-right pr-2 ">
                                {el?.igst}
                              </td>
                            ) : (
                              <td></td>
                            ))}
                          <td className="pt-2 text-black text-right pr-2 font-bold">
                            {el?.count} {el?.unit.split("-")[0]}
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
                          {configurations?.showDiscount && (
                            <td className="pt-2 text-black text-right pr-2">
                              {el?.hasGodownOrBatch === true
                                ? null
                                : el.GodownList && el.GodownList.length > 0
                                ? configurations?.showDiscountAmount
                                  ? el?.discount
                                  : el?.discountPercentage + " %"
                                : null}
                            </td>
                          )}

                          {configurations?.showStockWiseTaxAmount && (
                            <td className="pt-2 text-black text-right pr-2 font-bold">
                              {el?.hasGodownOrBatch === true
                                ? null
                                : `  ${(
                                    el?.total -
                                    (el?.total * 100) /
                                      (parseFloat(el.igst) + 100)
                                  )?.toFixed(2)}`}
                            </td>
                          )}

                          <td className="pt-2 pr-1 text-black text-right font-bold">
                            {el?.total}
                          </td>
                        </tr>
                        {el.hasGodownOrBatch &&
                          el.GodownList.map((godownOrBatch, idx) => {
                            // const rate = godownOrBatch?.selectedPriceRate || 0;
                            // const taxAmt =
                            //   Number(
                            //     (
                            //       godownOrBatch?.individualTotal -
                            //       (godownOrBatch?.individualTotal * 100) /
                            //         (parseFloat(el.igst) + 100)
                            //     )?.toFixed(2)
                            //   ) || 0;
                            // const count = godownOrBatch?.count || 0;
                            // const finalAmt =
                            //   Number(godownOrBatch?.individualTotal) || 0;
                            // const discountAmount = ((rate * count + taxAmt) - Number(finalAmt)).toFixed(2);
                            // const discountAmount = calculateDiscount(
                            //   rate,
                            //   count,
                            //   taxAmt,
                            //   finalAmt,
                            //   el?.isTaxInclusive
                            // );

                            return godownOrBatch.added &&
                              godownOrBatch.batch ? (
                              <tr key={idx} className={`bg-white text-[9px] `}>
                                <td> </td>
                                <td className="">
                                  {godownOrBatch.batch && (
                                    <p className="ml-1.5  ">
                                      Batch: {godownOrBatch?.batch}
                                    </p>
                                  )}
                                </td>
                                {configurations?.showHsn && (
                                  <td className="pt-2 text-black text-right pr-2  text-[8px]">
                                    {el?.hsn_code}
                                  </td>
                                )}

                                {configurations?.showTaxPercentage && (
                                  <td className="pt-2 text-black text-right pr-2  text-[8px]">
                                    {el?.igst}
                                  </td>
                                )}

                                <td className="pt-2  flex justify-end pr-2">
                                  {godownOrBatch?.count} {el?.unit}
                                </td>
                                <td className="pt-2  text-end pr-2">
                                  {godownOrBatch?.selectedPriceRate || 0}
                                </td>

                                {configurations?.showDiscount && (
                                  <td className="pt-2  pr-2 text-end">
                                    {configurations?.showDiscountAmount
                                      ? godownOrBatch?.discount || 0
                                      : godownOrBatch?.discountPercentage +
                                          " %" || 0 + " %"}
                                  </td>
                                )}

                                {configurations?.showStockWiseTaxAmount && (
                                  <td className="pt-2  text-end pr-2">
                                    {calculateTaxAmount(godownOrBatch, el)}
                                  </td>
                                )}

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
                <tr className="border-y  border-black bg-slate-200 py-6">
                  <td className="font-bold "></td>
                  <td className="font-bold text-[9px] p-2">Subtotal</td>
                  {configurations?.showHsn && (
                    <td className="font-bold text-[9px] p-2"></td>
                  )}
                  {configurations?.showTaxPercentage && (
                    <td className="font-bold text-[9px] p-2"></td>
                  )}
                  <td className="text-black text-[9px] ">
                    <p className="text-right pr-1 font-bold">
                      {calculateTotalQunatity()}/unit
                    </p>{" "}
                  </td>
                  {configurations?.showDiscount && (
                    <td className="text-right pr-1 text-black font-bold text-[9px]"></td>
                  )}

                  {configurations?.showStockWiseTaxAmount && (
                    <td className="text-right pr-1 text-black font-bold text-[9px]">
                      {" "}
                      {calculateTotalTax()}
                    </td>
                  )}
                  {}
                  <td className="text-right pr-1 text-black font-bold text-[9px]"></td>
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
              calculateTotalTax={calculateTotalTax}
              configurations={configurations}
              party={party}
            />

            <div className="page-number"></div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default SalesPdf;
