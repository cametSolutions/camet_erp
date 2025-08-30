/* eslint-disable react/prop-types */
import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import numberToWords from "number-to-words";
import { defaultPrintSettings } from "../../../../../utils/defaultConfigurations";

function VoucherThreeInchPdf({
  contentToPrint,
  data,
  org,
  isPreview,
  sendToParent,
  handlePrintData,
}) {
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
    }, 0);
  };

  const calculateCess = () => {
    return data?.items?.reduce((acc, curr) => {
      return acc + curr?.totalCessAmt;
    }, 0);
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

  const handlePrint = () => {
    console.log("welcome");
    handlePrintData();
  };

  return (
    <div className="grid">
      <div
        ref={contentToPrint}
        style={{
          width: "80mm",
          height: "auto",
          fontSize: "12px",
          fontFamily: "monospace",
          padding: "10px",
        }}
        className="print-container rounded-lg flex justify-center px-2.5"
      >
        <div className="max-w-3xl mx-auto md:block w-full">
          <div className="flex justify-center">
            <div className="font-bold text-md mt-6">
              {configurations?.printTitle || ""}
            </div>
          </div>
          <div>
            <div className="flex items-center justify-between flex-col leading-4 font-bold">
              <div className="text-[12px] tracking-wide">
                No: {data?.[getVoucherNumber()]}
              </div>
              <div className="text-[12px] tracking-wide">
                Date: {new Date().toDateString()}
              </div>
            </div>
          </div>
          {configurations?.showCompanyDetails && (
            <div className="flex justify-center">
              <div className="flex flex-col items-center">
                <div className="flex justify-center">
                  <p className="text-black font-extrabold text-[15px] pb-1 text-center">
                    {org?.name}
                  </p>
                </div>
                <div className="flex flex-col items-center leading-4">
                  <div className="text-black text-[12px] font-semibold text-center">
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
                  <div className="text-black font-semibold text-[12px]">
                    {org?.email}
                  </div>

                  {org?.website && (
                    <div className="text-black font-semibold text-[12px]">
                      Website: {org?.website}
                    </div>
                  )}

                  {org?.gstNum && (
                    <div className="text-black font-semibold text-[12px]">
                      {IsIndian ? "Tax No:" : "Vat No:"}: {org?.gstNum}
                    </div>
                  )}

                  {org?.pan && (
                    <div className="text-black font-semibold text-[12px]">
                      Pan No: {org?.pan}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          <div className="leading-4">
            <p className="text-black text-[13px] font-bold mt-6 tracking-wider">
              Name: {data?.party?.partyName}
            </p>
            <p className="text-black text-[12px] font-semibold">
              {[address?.billToAddress]
                .filter(
                  (item) => item != null && item !== "" && item !== "null"
                )
                .join(", ") || ""}
            </p>
          </div>

          {/* CORRECTED TABLE SECTION */}
          <table 
            className="w-full border-collapse mt-2" 
            style={{ 
              tableLayout: 'fixed',
              borderCollapse: 'collapse'
            }}
          >
            <thead>
              <tr className="border-t-2 border-b-2 border-black">
                <th 
                  className="text-black font-bold text-[10px] text-left py-1 px-1" 
                  style={{ width: '45%' }}
                >
                  ITEMS
                </th>
                {configurations?.showQuantity && (
                  <th 
                    className="text-black font-bold text-[10px] text-center py-1 px-1" 
                    style={{ width: '15%' }}
                  >
                    QTY
                  </th>
                )}
                {configurations?.showRate && (
                  <th 
                    className="text-black font-bold text-[10px] text-right py-1 px-1" 
                    style={{ width: '20%' }}
                  >
                    RATE
                  </th>
                )}
                {configurations?.showStockWiseAmount && (
                  <th 
                    className="text-black font-bold text-[10px] text-right py-1 px-1" 
                    style={{ width: '20%' }}
                  >
                    AMOUNT
                  </th>
                )}
              </tr>
            </thead>

            <tbody>
              {data?.items?.length > 0 &&
                data?.items.map((el, index) => {
                  const total = el?.total || 0;
                  const count = el?.totalCount || 0;
                  const rate = count > 0 ? (total / count).toFixed(2) : "0.00";

                  return (
                    <tr key={index} className="border-b border-gray-400">
                      <td className="py-2 px-1 text-[10px] align-top">
                        <div className="text-black font-semibold leading-tight">
                          {el.product_name}
                        </div>
                        {configurations?.showTaxPercentage && (
                          <div className="text-black text-[9px] mt-1">
                            ({el.igst}%)
                          </div>
                        )}
                      </td>

                      {configurations?.showQuantity && (
                        <td className="py-2 px-1 text-center text-[10px] align-top">
                          <div className="text-black font-semibold">
                            {el?.totalCount}
                          </div>
                          <div className="text-black text-[9px]">
                            {el?.unit}
                          </div>
                        </td>
                      )}

                      {configurations?.showRate && (
                        <td className="py-2 px-1 text-right text-[10px] align-top">
                          <div className="text-black font-semibold">
                            {rate}
                          </div>
                        </td>
                      )}

                      {configurations?.showStockWiseAmount && (
                        <td className="py-2 px-1 text-right text-[10px] align-top">
                          <div className="text-black font-semibold">
                            {total?.toFixed(2)}
                          </div>
                        </td>
                      )}
                    </tr>
                  );
                })}

              {/* Total Row */}
              <tr className="border-t-2 border-black bg-gray-50">
                <td className="py-2 px-1 text-[11px] font-bold text-black">
                  TOTAL
                </td>
                {configurations?.showQuantity && (
                  <td className="py-2 px-1 text-center text-[11px] font-bold text-black">
                    {data?.items?.reduce(
                      (acc, curr) => acc + Number(curr?.totalCount),
                      0
                    )}
                  </td>
                )}
                {configurations?.showRate && (
                  <td className="py-2 px-1"></td>
                )}
                {configurations?.showStockWiseAmount && (
                  <td className="py-2 px-1 text-right text-[11px] font-bold text-black">
                    {subTotal}
                  </td>
                )}
              </tr>
            </tbody>
          </table>

          <div className="flex justify-end">
            <div className="mt-1">
              <div className="flex flex-col items-end">
                {IsIndian
                  ? configurations?.showTaxAmount && (
                      <div className="flex flex-col items-end text-[12px] text-black font-bold gap-1">
                        {isSameState ? (
                          <>
                            <p
                              className={
                                calculateTotalTax() > 0 ? "" : "hidden"
                              }
                            >
                              CGST : {(calculateTotalTax() / 2).toFixed(2)}
                            </p>
                            <p
                              className={
                                calculateTotalTax() > 0 ? "" : "hidden"
                              }
                            >
                              SGST : {(calculateTotalTax() / 2).toFixed(2)}
                            </p>
                          </>
                        ) : (
                          <p
                            className={calculateTotalTax() > 0 ? "" : "hidden"}
                          >
                            IGST : {Number(calculateTotalTax()).toFixed(2)}
                          </p>
                        )}

                        {IsIndian && (
                          <>
                            <p className={calculateCess() > 0 ? "" : "hidden"}>
                              CESS : {calculateCess()}
                            </p>
                            <p
                              className={calculateAddCess() > 0 ? "" : "hidden"}
                            >
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
                    <div className="text-black mr-2 font-bold text-[12px]">
                      Add on charges:
                    </div>
                    <div className="text-black font-bold text-[12px]">
                      {additinalCharge}
                    </div>
                  </div>
                )}
              </div>
              {data?.additionalCharges?.map((el, index) => (
                <div key={index}>
                  <div className="text-black text-right font-semibold text-[12px]">
                    <span>({el?.action === "add" ? "+" : "-"})</span>{" "}
                    {el?.option}: ₹ {el?.finalValue}
                  </div>
                  {el?.taxPercentage && (
                    <div className="text-black text-right font-semibold text-[8px] mb-2">
                      ( {el?.value} + {el?.taxPercentage}% )
                    </div>
                  )}
                </div>
              ))}

              {configurations?.showNetAmount && (
                <div className="flex justify-end border-black">
                  <div className="w-3/4"></div>
                  <div className="text-black font-extrabold text-[11px] flex justify-end">
                    <p className="text-nowrap border-y-2 py-1">
                      NET AMOUNT :&nbsp;
                    </p>
                    <div className="text-black font-bold text-[11px] text-nowrap border-y-2 py-1">
                      {selectedOrganization?.currency} {data?.finalAmount}
                    </div>
                  </div>
                </div>
              )}

              {configurations?.showNetAmount && (
                <div className="flex justify-end border-black pb-3 w-full">
                  <div className="w-2/4"></div>
                  <div className="text-black font-bold text-[12px] flex flex-col justify-end text-right mt-1">
                    <p className="text-nowrap">Total Amount (in words)</p>
                    <div className="text-black full font-bold text-[9px] text-nowrap uppercase mt-1">
                      <p className="whitespace-normal">{inWords}</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      {isPreview && (
        <div className="flex gap-3 justify-end p-2">
          <button
            className="px-3 py-1 rounded-lg bg-gray-500 text-black font-medium hover:bg-gray-600 active:scale-95 transition"
            onClick={handlePrint}
          >
            Print
          </button>
          <button
            className="px-3 py-1 rounded-lg bg-gray-500 text-black font-medium hover:bg-gray-600 active:scale-95 transition"
            onClick={() => sendToParent(true)}
          >
            Confirm
          </button>
          <button
            className="px-3 py-1 rounded-lg bg-gray-200 text-gray-800 font-medium hover:bg-gray-300 active:scale-95 transition"
            onClick={() => sendToParent(false)}
          >
            Cancel
          </button>
        </div>
      )}
    </div>
  );
}

export default VoucherThreeInchPdf;