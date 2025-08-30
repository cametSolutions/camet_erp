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
      
      const [integerPart, decimalPart] = finalAmount.toString().split(".");
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
    handlePrintData();
  };

  return (
    <div className="grid">
      <div
        ref={contentToPrint}
        style={{
          width: "70mm", // Reduced width to fit thermal printer
          height: "auto",
          fontSize: "10px", // Smaller font
          fontFamily: "monospace",
          margin: "0",
          padding: "1mm 2mm", // Left/right margins for thermal printer
          boxSizing: "border-box"
        }}
        className="print-container"
      >
        <div className="w-full">
          <div className="text-center">
            <div className="font-bold text-[11px] mt-2">
              {configurations?.printTitle || ""}
            </div>
          </div>
          <div className="text-center">
            <div className="font-bold text-[10px] mt-1">
              <div>No: {data?.[getVoucherNumber()]}</div>
              <div>Date: {new Date().toDateString()}</div>
            </div>
          </div>

          {configurations?.showCompanyDetails && (
            <div className="text-center mt-2">
              <div className="text-black font-bold text-[12px] mb-1">
                {org?.name}
              </div>
              <div className="text-[10px] font-medium leading-tight">
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
              <div className="text-[10px] font-medium">{org?.email}</div>

              {org?.website && (
                <div className="text-[10px] font-medium">
                  Website: {org?.website}
                </div>
              )}

              {org?.gstNum && (
                <div className="text-[10px] font-medium">
                  {IsIndian ? "Tax No:" : "Vat No:"}: {org?.gstNum}
                </div>
              )}

              {org?.pan && (
                <div className="text-[10px] font-medium">
                  Pan No: {org?.pan}
                </div>
              )}
            </div>
          )}

          <div className="mt-2">
            <div className="text-[11px] font-bold">
              Name: {data?.party?.partyName}
            </div>
            <div className="text-[10px] font-medium">
              {[address?.billToAddress]
                .filter(
                  (item) => item != null && item !== "" && item !== "null"
                )
                .join(", ") || ""}
            </div>
          </div>

          {/* CORRECTED TABLE SECTION */}
          <table 
            className="w-full mt-2" 
            style={{ 
              tableLayout: 'fixed',
              borderCollapse: 'collapse',
              width: '100%'
            }}
          >
            <thead>
              <tr className="border-t border-b border-black">
                <th 
                  className="text-black font-bold text-[9px] text-left py-1" 
                  style={{ width: '45%' }}
                >
                  ITEMS
                </th>
                {configurations?.showQuantity && (
                  <th 
                    className="text-black font-bold text-[9px] text-center py-1" 
                    style={{ width: '15%' }}
                  >
                    QTY
                  </th>
                )}
                {configurations?.showRate && (
                  <th 
                    className="text-black font-bold text-[9px] text-right py-1" 
                    style={{ width: '18%' }}
                  >
                    RATE
                  </th>
                )}
                {configurations?.showStockWiseAmount && (
                  <th 
                    className="text-black font-bold text-[9px] text-right py-1" 
                    style={{ width: '22%' }}
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
                      <td className="py-1 text-[9px] align-top">
                        <div className="text-black font-medium leading-tight break-words">
                          {el.product_name}
                        </div>
                        {configurations?.showTaxPercentage && (
                          <div className="text-black text-[8px] mt-0.5">
                            ({el.igst}%)
                          </div>
                        )}
                      </td>

                      {configurations?.showQuantity && (
                        <td className="py-1 text-center text-[9px] align-top">
                          <div className="text-black font-medium">
                            {el?.totalCount}
                          </div>
                          <div className="text-black text-[8px]">
                            {el?.unit}
                          </div>
                        </td>
                      )}

                      {configurations?.showRate && (
                        <td className="py-1 text-right text-[9px] align-top">
                          <div className="text-black font-medium">
                            {rate}
                          </div>
                        </td>
                      )}

                      {configurations?.showStockWiseAmount && (
                        <td className="py-1 text-right text-[9px] align-top">
                          <div className="text-black font-medium">
                            {total?.toFixed(2)}
                          </div>
                        </td>
                      )}
                    </tr>
                  );
                })}

              {/* Total Row */}
              <tr className="border-t border-black">
                <td className="py-1 text-[10px] font-bold text-black">
                  TOTAL
                </td>
                {configurations?.showQuantity && (
                  <td className="py-1 text-center text-[10px] font-bold text-black">
                    {data?.items?.reduce(
                      (acc, curr) => acc + Number(curr?.totalCount),
                      0
                    )}
                  </td>
                )}
                {configurations?.showRate && (
                  <td className="py-1"></td>
                )}
                {configurations?.showStockWiseAmount && (
                  <td className="py-1 text-right text-[10px] font-bold text-black">
                    {subTotal}
                  </td>
                )}
              </tr>
            </tbody>
          </table>

          <div className="mt-2">
            <div className="text-right">
              {IsIndian
                ? configurations?.showTaxAmount && (
                    <div className="text-[10px] text-black font-medium space-y-0.5">
                      {isSameState ? (
                        <>
                          <div className={calculateTotalTax() > 0 ? "" : "hidden"}>
                            CGST : {(calculateTotalTax() / 2).toFixed(2)}
                          </div>
                          <div className={calculateTotalTax() > 0 ? "" : "hidden"}>
                            SGST : {(calculateTotalTax() / 2).toFixed(2)}
                          </div>
                        </>
                      ) : (
                        <div className={calculateTotalTax() > 0 ? "" : "hidden"}>
                          IGST : {Number(calculateTotalTax()).toFixed(2)}
                        </div>
                      )}

                      {IsIndian && (
                        <>
                          <div className={calculateCess() > 0 ? "" : "hidden"}>
                            CESS : {calculateCess()}
                          </div>
                          <div className={calculateAddCess() > 0 ? "" : "hidden"}>
                            ADD.CESS : {calculateAddCess()}
                          </div>
                        </>
                      )}
                    </div>
                  )
                : configurations?.showTaxAmount && (
                    <div className="text-[10px] text-black font-medium">
                      <div className={calculateTotalTax() > 0 ? "" : "hidden"}>
                        VAT : {Number(calculateTotalTax()).toFixed(2)}
                      </div>
                    </div>
                  )}

              {additinalCharge > 0 && (
                <div className="text-right mt-1">
                  <div className="text-black font-medium text-[10px]">
                    Add on charges: {additinalCharge}
                  </div>
                </div>
              )}

              {data?.additionalCharges?.map((el, index) => (
                <div key={index}>
                  <div className="text-black text-right font-medium text-[10px]">
                    <span>({el?.action === "add" ? "+" : "-"})</span>{" "}
                    {el?.option}: ₹ {el?.finalValue}
                  </div>
                  {el?.taxPercentage && (
                    <div className="text-black text-right font-medium text-[8px]">
                      ( {el?.value} + {el?.taxPercentage}% )
                    </div>
                  )}
                </div>
              ))}

              {configurations?.showNetAmount && (
                <div className="border-t border-black mt-2 pt-1">
                  <div className="text-black font-bold text-[11px] text-right">
                    NET AMOUNT : {selectedOrganization?.currency} {data?.finalAmount}
                  </div>
                </div>
              )}

              {configurations?.showNetAmount && (
                <div className="mt-2">
                  <div className="text-black font-medium text-[9px] text-center">
                    <div>Total Amount (in words)</div>
                    <div className="font-bold uppercase mt-1 break-words">
                      {inWords}
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
            className="px-3 py-1 rounded-lg bg-gray-500 text-white font-medium hover:bg-gray-600 active:scale-95 transition"
            onClick={handlePrint}
          >
            Print
          </button>
          <button
            className="px-3 py-1 rounded-lg bg-blue-500 text-white font-medium hover:bg-blue-600 active:scale-95 transition"
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