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
      const [integerPart, decimalPart] = finalAmount.toString().split(".");
      const integerWords = numberToWords.toWords(parseInt(integerPart, 10));
      const decimalWords = decimalPart
        ? ` and ${numberToWords.toWords(parseInt(decimalPart, 10))} `
        : " and Zero";

      const mergedWord = [
        integerWords + " ",
        (selectedOrganization?.currencyName ?? "") + " ",
        decimalWords,
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
      return acc + (curr?.totalAddlCessAmt || 0);
    }, 0);
  };

  const calculateCess = () => {
    return data?.items?.reduce((acc, curr) => {
      return acc + (curr?.totalCessAmt || 0);
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

  return (
    <div
      ref={contentToPrint}
      style={{
        width: "79mm",
        maxWidth: "79mm",
        fontSize: "11px",
        fontFamily: "monospace, 'Courier New', Courier",
        lineHeight: "1.2",
        margin: "0",
        padding: "2mm",
        boxSizing: "border-box"
      }}
    >
      {/* Header */}
      <div style={{ textAlign: "center", marginBottom: "3mm" }}>
        <div style={{ fontSize: "12px", fontWeight: "bold" }}>
          {configurations?.printTitle || "INVOICE"}
        </div>
      </div>

      {/* Voucher Number and Date */}
      <div style={{ textAlign: "center", marginBottom: "3mm" }}>
        <div style={{ fontSize: "10px" }}>No: {data?.[getVoucherNumber()]}</div>
        <div style={{ fontSize: "10px" }}>Date: {new Date().toDateString()}</div>
      </div>

      {/* Company Details */}
      {configurations?.showCompanyDetails && (
        <div style={{ textAlign: "center", marginBottom: "3mm" }}>
          <div style={{ fontSize: "13px", fontWeight: "bold", marginBottom: "1mm" }}>
            {org?.name}
          </div>
          <div style={{ fontSize: "9px", lineHeight: "1.3" }}>
            {[org?.flat, org?.landmark, org?.road, org?.place, org?.pin, org?.mobile]
              .filter(Boolean)
              .join(", ")}
          </div>
          {org?.email && (
            <div style={{ fontSize: "9px" }}>{org?.email}</div>
          )}
          {org?.website && (
            <div style={{ fontSize: "9px" }}>Website: {org?.website}</div>
          )}
          {org?.gstNum && (
            <div style={{ fontSize: "9px" }}>
              {IsIndian ? "Tax No:" : "Vat No:"} {org?.gstNum}
            </div>
          )}
          {org?.pan && (
            <div style={{ fontSize: "9px" }}>Pan No: {org?.pan}</div>
          )}
        </div>
      )}

      {/* Customer Details */}
      <div style={{ marginBottom: "3mm" }}>
        <div style={{ fontSize: "10px", fontWeight: "bold" }}>
          Name: {data?.party?.partyName}
        </div>
        {address?.billToAddress && (
          <div style={{ fontSize: "9px", wordWrap: "break-word" }}>
            {address.billToAddress}
          </div>
        )}
      </div>

      {/* Separator Line */}
      <div style={{ 
        borderTop: "1px solid black", 
        marginBottom: "2mm" 
      }}></div>

      {/* Items Header */}
      <div style={{ 
        display: "flex", 
        borderBottom: "1px solid black",
        paddingBottom: "1mm",
        marginBottom: "1mm",
        fontSize: "9px",
        fontWeight: "bold"
      }}>
        <div style={{ width: "35mm", textAlign: "left" }}>ITEMS</div>
        {configurations?.showQuantity && (
          <div style={{ width: "10mm", textAlign: "center" }}>QTY</div>
        )}
        {configurations?.showRate && (
          <div style={{ width: "12mm", textAlign: "right" }}>RATE</div>
        )}
        {configurations?.showStockWiseAmount && (
          <div style={{ width: "15mm", textAlign: "right" }}>AMOUNT</div>
        )}
      </div>

      {/* Items */}
      {data?.items?.map((el, index) => {
        const total = el?.total || 0;
        const count = el?.totalCount || 0;
        const rate = count > 0 ? (total / count).toFixed(2) : "0.00";

        return (
          <div key={index}>
            <div style={{ 
              display: "flex", 
              alignItems: "flex-start",
              marginBottom: "1mm",
              fontSize: "9px",
              minHeight: "4mm"
            }}>
              <div style={{ 
                width: "35mm", 
                textAlign: "left",
                wordWrap: "break-word",
                overflow: "hidden"
              }}>
                <div style={{ fontWeight: "bold" }}>
                  {el.product_name}
                  {configurations?.showTaxPercentage && el.igst && (
                    <span style={{ fontSize: "8px" }}> ({el.igst}%)</span>
                  )}
                </div>
              </div>
              
              {configurations?.showQuantity && (
                <div style={{ width: "10mm", textAlign: "center" }}>
                  <div>{el?.totalCount}</div>
                  <div style={{ fontSize: "8px" }}>{el?.unit}</div>
                </div>
              )}
              
              {configurations?.showRate && (
                <div style={{ width: "12mm", textAlign: "right" }}>
                  {rate}
                </div>
              )}
              
              {configurations?.showStockWiseAmount && (
                <div style={{ width: "15mm", textAlign: "right" }}>
                  {total.toFixed(2)}
                </div>
              )}
            </div>
            
            {/* Item separator */}
            <div style={{ 
              borderBottom: "0.5px solid #ccc", 
              marginBottom: "1mm" 
            }}></div>
          </div>
        );
      })}

      {/* Total Row */}
      <div style={{ 
        display: "flex", 
        borderTop: "1px solid black",
        borderBottom: "1px solid black",
        paddingTop: "1mm",
        paddingBottom: "1mm",
        fontSize: "10px",
        fontWeight: "bold"
      }}>
        <div style={{ width: "35mm", textAlign: "left" }}>
          {configurations?.showStockWiseAmount ? "Total" : ""}
        </div>
        {configurations?.showQuantity && (
          <div style={{ width: "10mm", textAlign: "center" }}>
            {data?.items?.reduce((acc, curr) => acc + Number(curr?.totalCount || 0), 0)}
          </div>
        )}
        {configurations?.showRate && (
          <div style={{ width: "12mm", textAlign: "right" }}></div>
        )}
        {configurations?.showStockWiseAmount && (
          <div style={{ width: "15mm", textAlign: "right" }}>
            {subTotal}
          </div>
        )}
      </div>

      {/* Tax Details */}
      <div style={{ marginTop: "2mm", fontSize: "9px" }}>
        {IsIndian ? (
          configurations?.showTaxAmount && calculateTotalTax() > 0 && (
            <div style={{ textAlign: "right" }}>
              {isSameState ? (
                <>
                  <div>CGST: {(calculateTotalTax() / 2).toFixed(2)}</div>
                  <div>SGST: {(calculateTotalTax() / 2).toFixed(2)}</div>
                </>
              ) : (
                <div>IGST: {calculateTotalTax().toFixed(2)}</div>
              )}
              {calculateCess() > 0 && <div>CESS: {calculateCess().toFixed(2)}</div>}
              {calculateAddCess() > 0 && <div>ADD.CESS: {calculateAddCess().toFixed(2)}</div>}
            </div>
          )
        ) : (
          configurations?.showTaxAmount && calculateTotalTax() > 0 && (
            <div style={{ textAlign: "right" }}>
              <div>VAT: {calculateTotalTax().toFixed(2)}</div>
            </div>
          )
        )}
      </div>

      {/* Additional Charges */}
      {data?.additionalCharges?.map((el, index) => (
        <div key={index} style={{ textAlign: "right", fontSize: "9px" }}>
          <div>
            ({el?.action === "add" ? "+" : "-"}) {el?.option}: {el?.finalValue}
          </div>
        </div>
      ))}

      {/* Net Amount */}
      {configurations?.showNetAmount && (
        <div style={{ 
          borderTop: "1px solid black",
          borderBottom: "1px solid black",
          marginTop: "2mm",
          paddingTop: "1mm",
          paddingBottom: "1mm",
          textAlign: "right",
          fontSize: "11px",
          fontWeight: "bold"
        }}>
          <div>NET AMOUNT: {selectedOrganization?.currency} {data?.finalAmount}</div>
        </div>
      )}

      {/* Amount in Words */}
      {configurations?.showNetAmount && (
        <div style={{ 
          marginTop: "2mm",
          fontSize: "9px",
          textAlign: "center"
        }}>
          <div style={{ fontWeight: "bold" }}>Total Amount (in words)</div>
          <div style={{ 
            textTransform: "uppercase",
            marginTop: "1mm",
            wordWrap: "break-word"
          }}>
            {inWords}
          </div>
        </div>
      )}
    </div>
  );
}

export default VoucherThreeInchPdf;