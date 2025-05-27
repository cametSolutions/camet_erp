/* eslint-disable react/prop-types */
import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import numberToWords from "number-to-words";
import { defaultPrintSettings } from "../../../../../utils/defaultConfigurations";

function VoucherThreeInchPdf({ contentToPrint, data, org }) {
  const [subTotal, setSubTotal] = useState("");
  const [additinalCharge, setAdditinalCharge] = useState("");
  const [inWords, setInWords] = useState("");

  const IsIndian =
    useSelector(
      (state) => state?.secSelectedOrganization?.secSelectedOrg?.country
    ) === "India";

  const party = data?.party;
  const isSameState = org?.state === party?.state || !party?.state;

  const voucherType = data?.voucherType;
  const getVoucherNumber = () => {
    if (!voucherType) return "";
    if (voucherType === "sales" || voucherType === "vanSale") {
      return "salesNumber";
    } else if (voucherType === "saleOrder") {
      return "orderNumber";
    } else {
      return voucherType + "Number";
    }
  };

  const getConfigurationVoucherType = () => {
    const currentVoucherType = data?.voucherType;

    if (currentVoucherType === "sales" || currentVoucherType === "vanSale") {
      return "sale";
    } else if (currentVoucherType === "saleOrder") {
      return "saleOrder";
    } else {
      return "default";
    }
  };

  const allPrintConfigurations = useSelector(
    (state) =>
      state.secSelectedOrganization?.secSelectedOrg?.configurations[0]
        ?.printConfiguration
  );

  const matchedConfiguration = allPrintConfigurations?.find(
    (item) => item.voucher === getConfigurationVoucherType()
  );

  const configurations =
    voucherType && voucherType !== "default" && matchedConfiguration
      ? matchedConfiguration
      : defaultPrintSettings;

  const selectedOrganization = useSelector(
    (state) => state.secSelectedOrganization.secSelectedOrg
  );

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
      console.log(finalAmount);

      const [integerPart, decimalPart] = finalAmount.toString().split(".");
      const integerWords = numberToWords.toWords(parseInt(integerPart, 10));
      console.log(integerWords);
      const decimalWords = decimalPart
        ? ` and ${numberToWords.toWords(parseInt(decimalPart, 10))} `
        : " and Zero";
      console.log(decimalWords);

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
    const totalTax = data?.items?.reduce(
      (acc, curr) => (acc += curr?.totalIgstAmt || 0),
      0
    );

    return totalTax;
  };
  const calculateAddCess = () => {
    return data?.items?.reduce((acc, curr) => {
      return acc + curr?.totalAddlCessAmt;
    }, 0); // Initialize the accumulator with 0
  };

  const calculateCess = () => {
    return data?.items?.reduce((acc, curr) => {
      return acc + curr?.totalCessAmt;
    }, 0); // Initialize the accumulator with 0
  };

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

  // console.log(address);
  return (
    <div
      ref={contentToPrint}
      style={{ width: "80mm", height: "auto" }}
      className="  rounded-lg   flex justify-center px-2.5 "
    >
      <div className=" print-container  max-w-3xl mx-auto  md:block w-full ">
        <div className="flex justify-center ">
          <div className="font-bold text-md  mt-6">
            {configurations?.printTitle || ""}
          </div>
        </div>
        <div>
          <div className="flex items-center justify-between flex-col leading-4   font-bold">
            <div className="text-[12px]  tracking-wide ">
              No: {data?.[getVoucherNumber()]}
            </div>
            <div className="text-[12px] tracking-wide">
              Date:{new Date().toDateString()}{" "}
            </div>
          </div>
        </div>
        {configurations?.showCompanyDetails && (
          <div className="flex justify-center">
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
                <div className="text-black font-semibold   text-[12px] ">
                  {org?.email}
                </div>

                {org?.website && (
                  <div className="text-black font-semibold  text-[12px]">
                    Website: {org?.website}
                  </div>
                )}

                {org?.gstNum && (
                  <div className="text-black font-semibold  text-[12px]">
                    {IsIndian ? "Tax No:" : "Vat No:"}: {org?.gstNum}
                  </div>
                )}

                {org?.pan && (
                  <div className="text-black font-semibold   text-[12px]">
                    Pan No: {org?.pan}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
        {/* </div> */}

        <div className="leading-4">
          <p className="text-black   text-[13px] font-bold mt-6 tracking-wider">
            Name: {data?.party?.partyName}
          </p>
          <p className="text-black text-[12px] font-semibold">
            {[address?.billToAddress]
              .filter((item) => item != null && item !== "" && item !== "null")
              .join(", ") || ""}
          </p>
        </div>

        {/* <hr className="border-t-2 border-black mb-0.5" /> */}
        <table className="w-full text-left     mt-2 tracking-wider ">
          <thead className="border-b border-t-2 border-black text-[10px] text-right ">
            <tr>
              <th className="text-black font-bold uppercase  px-1 text-left">
                Items
              </th>

              {configurations?.showQuantity ? (
                <th className="text-black font-bold uppercase text-center p-2">
                  Qty
                </th>
              ) : (
                <th className="text-black font-bold uppercase text-right p-2"></th>
              )}

              {configurations?.showRate ? (
                <th className="text-black font-bold uppercase text-right p-2">
                  Rate
                </th>
              ) : (
                <th className="text-black font-bold uppercase text-right p-2"></th>
              )}

              {configurations?.showStockWiseAmount && (
                <th className="text-black font-bold uppercase p-2 pr-0">
                  Amount
                </th>
              )}
            </tr>
          </thead>

          <tbody>
            {data?.items?.length > 0 &&
              data?.items.map((el, index) => {
                const total = el?.total || 0;
                // console.log("total", total);
                const count = el?.totalCount || 0;
                // console.log("count", count);
                const rate = (total / count).toFixed(2) || 0;

                return (
                  <tr
                    key={index}
                    className="border-b  border-gray-500 border-t-2 text-[10px] bg-white  text-center  "
                  >
                    <td className="py-1 text-black  font-bold  pr-2 flex ">
                      {el.product_name} <br />
                      {configurations?.showTaxPercentage && (
                        <p className="text-black ">({el.igst}%)</p>
                      )}
                    </td>

                    {configurations?.showQuantity ? (
                      <td className="py-1 text-black  font-bold text-center pr-2">
                        {el?.totalCount}
                        <p className="text-[10px] font-semibold">{el?.unit}</p>
                      </td>
                    ) : (
                      <td className="py-1 text-black  font-bold text-center pr-2"></td>
                    )}

                    {configurations?.showRate ? (
                      <td className="py-1 text-black font-bold  text-right pl-2 pr-1 text-nowrap">
                        {rate || 0}
                      </td>
                    ) : (
                      <td className="py-1 text-black font-bold  text-right pl-2 pr-1 text-nowrap"></td>
                    )}

                    {configurations?.showStockWiseAmount && (
                      <td className="py-1 text-black  font-bold text-right">
                        {el?.total}
                      </td>
                    )}
                  </tr>
                );
              })}

            <tr
              className={`border-gray-500 font-bold text-[12px] bg-white ${
                configurations?.showStockWiseAmount ||
                configurations?.showQuantity
                  ? "border-y"
                  : ""
              }`}
            >
              {configurations?.showStockWiseAmount ? (
                <td className="py-1 text-black">Total</td>
              ) : (
                <td className="py-1 text-black"></td>
              )}
              {configurations?.showQuantity ? (
                <td className="col-span-2 py-1 text-black text-center">
                  {data?.items?.reduce(
                    (acc, curr) => (acc += Number(curr?.totalCount)),
                    0
                  )}
                </td>
              ) : (
                <td className="col-span-2 py-1 text-black text-center"></td>
              )}
              <td className="py-1 text-black"></td>
              {configurations?.showStockWiseAmount && (
                <td className="py-1 text-black text-right">{subTotal}</td>
              )}
            </tr>
          </tbody>
        </table>

        <div className="flex justify-end">
          <div className=" mt-1  ">
            <div className="  flex flex-col items-end ">
              {IsIndian
                ? configurations?.showTaxAmount && (
                    <div className="flex flex-col items-end text-[12px] text-black font-bold gap-1">
                      {isSameState ? (
                        <>
                          <p
                            className={calculateTotalTax() > 0 ? "" : "hidden"}
                          >
                            CGST : {(calculateTotalTax() / 2).toFixed(2)}
                          </p>
                          <p
                            className={calculateTotalTax() > 0 ? "" : "hidden"}
                          >
                            SGST : {(calculateTotalTax() / 2).toFixed(2)}
                          </p>
                        </>
                      ) : (
                        <p className={calculateTotalTax() > 0 ? "" : "hidden"}>
                          IGST : {Number(calculateTotalTax()).toFixed(2)}
                        </p>
                      )}

                      {IsIndian && (
                        <>
                          <p className={calculateCess() > 0 ? "" : "hidden"}>
                            CESS : {calculateCess()}
                          </p>
                          <p className={calculateAddCess() > 0 ? "" : "hidden"}>
                            ADD.CESS : {calculateAddCess()}
                          </p>
                        </>
                      )}
                    </div>
                  )
                : configurations?.showTaxAmount && (
                    <div className="flex flex-col items-end text-[12px] text-black font-bold gap-1">
                      <p className={calculateTotalTax() > 0 ? "" : "hidden"}>
                        VAT : {Number(calculateTotalTax()).toFixed(2)}
                      </p>
                    </div>
                  )}
              {additinalCharge > 0 && (
                <div className="flex items-center mt-1 mb-1">
                  <div className="text-black mr-2 font-bold text-[12px] ">
                    Add on charges:
                  </div>
                  <div className="text-black font-bold text-[12px]">
                    {additinalCharge}
                  </div>
                </div>
              )}
            </div>
            {data?.additionalCharges?.map((el, index) => (
              <>
                <div
                  key={index}
                  className="text-black  text-right font-semibold text-[12px] "
                >
                  <span>({el?.action === "add" ? "+" : "-"})</span> {el?.option}
                  : ₹ {el?.finalValue}
                </div>
                {el?.taxPercentage && (
                  <div className="text-black  text-right font-semibold text-[8px] mb-2">
                    ( {el?.value} + {el?.taxPercentage}% )
                  </div>
                )}
              </>
            ))}

            {configurations?.showNetAmount && (
              <div className="flex justify-end  border-black  ">
                <div className="w-3/4"></div>

                <div className="  text-black  font-extrabold text-[11px] flex justify-end   ">
                  <p className="text-nowrap border-y-2 py-1">
                    NET AMOUNT :&nbsp;{" "}
                  </p>
                  <div className="text-black  font-bold text-[11px] text-nowrap  border-y-2 py-1    ">
                    {selectedOrganization?.currency} {data?.finalAmount}
                  </div>
                </div>
              </div>
            )}

            {configurations?.showNetAmount && (
              <div className="flex  justify-end border-black pb-3 w-full ">
                <div className="w-2/4"></div>

                <div className="text-black font-bold text-[12px] flex flex-col justify-end text-right mt-1">
                  <p className="text-nowrap">Total Amount (in words)</p>
                  <div className="text-black full font-bold text-[9px] text-nowrap uppercase mt-1   ">
                    <p className="whitespace-normal -">{inWords} </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default VoucherThreeInchPdf;
