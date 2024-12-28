/* eslint-disable react/prop-types */

import { useSelector } from "react-redux";
import { useEffect, useState } from "react";
import numberToWords from "number-to-words";
import PdfFooter from "./PdfFotterNonInd";
import PdfHeader from "./PdfHeaderNonInd";

function SalesOrderPdfNonInd({
  data,
  org,
  contentToPrint,
  bank,
  userType,
  // printTitle,
}) {
  const [subTotal, setSubTotal] = useState("");
  const [additinalCharge, setAdditinalCharge] = useState("");
  const [inWords, setInWords] = useState("");
  const party = data?.party;
  const despatchDetails = data?.despatchDetails;

  const primarySelectedOrg = useSelector(
    (state) => state.setSelectedOrganization.selectedOrg
  );
  const secondarySelectedOrg = useSelector(
    (state) => state.secSelectedOrganization.secSelectedOrg
  );
  // console.log("secondarySelectedOrg", secondarySelectedOrg);

  const configurations = useSelector(
    (state) =>
      state.secSelectedOrganization?.secSelectedOrg?.configurations[0]
        ?.printConfiguration
  );

  // console.log("configurations", configurations);

  const saleOrderConfiguration = configurations?.find(
    (item) => item.voucher === "saleOrder"
  );

  const selectedOrganization =
    userType === "primaryUser" ? primarySelectedOrg : secondarySelectedOrg;

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

      const finalAmount = data.finalAmount;

      const [integerPart, decimalPart] = finalAmount.toString().split(".");
      const integerWords = numberToWords.toWords(parseInt(integerPart, 10));
      // console.log(integerWords);
      const decimalWords = decimalPart
        ? ` and ${numberToWords.toWords(parseInt(decimalPart, 10))} `
        : " and Zero";
      // console.log(decimalWords);

      const mergedWord = [
        ...(integerWords + " "),
        (selectedOrganization?.currencyName ?? "") + " ",
        ...decimalWords,
        (selectedOrganization?.subunit ?? "") + " ",
      ].join("");

      setInWords(mergedWord);
    }
  }, [data]);

  const calculateTotalTax = () => {
    const individualTax = data?.items?.map((el) => el?.igstAmt || 0);
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

  // const calculateDiscount = (rate, count, taxAmt, finalAmt, isTaxInclusive) => {
  //   // Calculate the total price
  //   const totalPrice = rate * count;

  //   // Calculate the discount amount
  //   let discountAmount;

  //   // Check if tax is inclusive
  //   if (isTaxInclusive) {
  //     // For tax-inclusive items, directly compare totalPrice and finalAmt
  //     discountAmount = totalPrice === finalAmt ? 0 : totalPrice - finalAmt;
  //   } else {
  //     // For non-tax-inclusive items, adjust for tax
  //     discountAmount = totalPrice - (finalAmt - taxAmt);
  //   }

  //   // Calculate discount percentage
  //   const discountPercentage =
  //     totalPrice !== 0 ? ((discountAmount / totalPrice) * 100).toFixed(2) : 0;

  //   return {
  //     discountAmount: discountAmount.toFixed(2),
  //     discountPercentage: discountPercentage + "%",
  //   };
  // };

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
            {saleOrderConfiguration?.printTitle || "Quotation"}
          </div>
        </div>

        <PdfHeader
          saleOrderConfiguration={saleOrderConfiguration}
          data={data}
          org={org}
          address={address}
          despatchDetails={despatchDetails}
          tab={"salesOrder"}
        />

        {/* <hr className="border-t-2 border-black mb-0.5" /> */}
        <table className="w-full text-left  bg-slate-200 table-fixed ">
          <thead className="border-b-2 border-t-2 border-black text-[10px] text-right ">
            <tr>
              <th className="text-gray-700 font-bold uppercase  px-1 text-left">
                No
              </th>
              <th className="text-gray-700 font-bold uppercase  px-1 text-left">
                Items
              </th>
            

              {saleOrderConfiguration?.showTaxPercentage && (
                <th className="text-gray-700 font-bold uppercase p-2">Vat %</th>
              )}

              <th className="text-gray-700 font-bold uppercase p-2">Qty</th>
              <th className="text-gray-700 font-bold uppercase p-2">Rate</th>
              {saleOrderConfiguration?.showDiscount &&
                saleOrderConfiguration?.showDiscountAmount && (
                  <th className="text-gray-700 font-bold uppercase p-2">
                    Disc
                  </th>
                )}
              {saleOrderConfiguration?.showDiscount &&
                !saleOrderConfiguration?.showDiscountAmount && (
                  <th className="text-gray-700 font-bold uppercase p-2">
                    Disc{" "}
                  </th>
                )}
              {saleOrderConfiguration?.showStockWiseTaxAmount && (
                <th className="text-gray-700 font-bold uppercase p-2">Vat</th>
              )}
              <th className="text-gray-700 font-bold uppercase p-2 pr-0 ">
                Amount
              </th>
            </tr>
          </thead>

          <tbody>
            {data?.items?.length > 0 &&
              data?.items.map((el, index) => {
                let rate = el?.selectedPriceRate || 0;

                if (
                  saleOrderConfiguration?.showInclTaxRate &&
                  !el?.isTaxInclusive
                ) {
                  ///add tax amount with respect to base price
                  rate = Number(
                    (
                      el?.selectedPriceRate +
                      el?.selectedPriceRate * (Number(el?.igst / 100) || 0)
                    ).toFixed(2)
                  );
                } else if (
                  !saleOrderConfiguration?.showInclTaxRate &&
                  el?.isTaxInclusive
                ) {
                  ///add tax amount with respect to base price
                  rate = Number(
                    (
                      el?.selectedPriceRate / (1 + Number(el?.igst / 100) || 0)
                    ).toFixed(2)
                  );
                } else {
                  rate = el?.selectedPriceRate;
                }

                const count = el?.count || 0;
                const finalAmt = Number(el?.total) || 0;

                return (
                  <tr
                    key={index}
                    className="border-b-2 border-t-1 text-[9px] bg-white w-full"
                  >
                    <td className="w-2  ">{index + 1}</td>

                    <td className="py-1 text-black pr-2">
                      {el.product_name} <br />
                    </td>

                   

                    {saleOrderConfiguration?.showTaxPercentage && (
                      <td className="py-1 text-black text-right pr-2">
                        {el?.igst || "0"}
                      </td>
                    )}
                    <td className="py-1 text-black text-right pr-2">
                      {count} {el?.unit?.split("-")[0]}
                    </td>
                    <td className="py-1 text-black text-right pr-2 text-nowrap">
                      {rate}
                    </td>

                    {saleOrderConfiguration?.showDiscount &&
                      saleOrderConfiguration?.showDiscountAmount && (
                        <td className="py-1 text-black text-right pr-2 ">
                          {el?.discount || 0}
                        </td>
                      )}

                    {saleOrderConfiguration?.showDiscount &&
                      !saleOrderConfiguration?.showDiscountAmount && (
                        <td className="py-1 text-black text-right pr-2 ">
                          {el?.discountPercentage || 0}
                        </td>
                      )}

                    {saleOrderConfiguration?.showStockWiseTaxAmount && (
                      <td className="py-1 text-black text-end pr-2">
                        {el?.igstAmt}
                      </td>
                    )}

                    <td className="py-1 text-black w-full text-right">
                      {" "}
                      {finalAmt}
                    </td>
                  </tr>
                );
              })}
          </tbody>

          <tfoot className="">
            <tr className="bg-gray-200  border-black border-y ">
              <td className="font-bold"></td>

              <td className="font-bold text-[9px] p-2">Subtotal</td>

           
              {saleOrderConfiguration?.showTaxPercentage && (
                <td className="font-bold"></td>
              )}
              <td className="text-black text-[9px] ">
                <p className="text-right pr-1 font-bold">
                  {calculateTotalQunatity()}/unit
                </p>{" "}
              </td>

              <td className="font-bold"></td>

              {saleOrderConfiguration?.showDiscount && (
                <td className="text-right pr-1 text-black font-bold text-[9px]"></td>
              )}

              {saleOrderConfiguration?.showStockWiseTaxAmount &&  (
              <td className="text-right pr-1 text-black font-bold text-[9px]">
                {calculateTotalTax()}
              </td>
               )} 

              <td className="text-right pr-1 text-black font-bold text-[9px]">
                {subTotal}
              </td>
            </tr>
          </tfoot>
        </table>

        <PdfFooter
          saleOrderConfiguration={saleOrderConfiguration}
          bank={bank}
          org={org}
          data={data}
          additinalCharge={additinalCharge}
          inWords={inWords}
          selectedOrganization={selectedOrganization}
          calculateTotalTax={calculateTotalTax}
          party={party}
        />
      </div>
    </div>
  );
}

export default SalesOrderPdfNonInd;
