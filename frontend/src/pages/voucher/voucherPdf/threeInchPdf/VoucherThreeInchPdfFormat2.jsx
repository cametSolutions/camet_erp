/* eslint-disable react/prop-types */
import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import numberToWords from "number-to-words";
import { defaultPrintSettings } from "../../../../../utils/defaultConfigurations";

function VoucherThreeInchPdfFormat2({
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

  const IsIndian = useSelector(
    (state) => state?.secSelectedOrganization?.secSelectedOrg?.country
  ) === "India";

  const party = data?.party;
  const isSameState =
    org?.state?.toLowerCase() === party?.state?.toLowerCase() || !party?.state;

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
      data.discount = data.additionalCharges?.[0]?.value || 0;
      const calculatedSubTotal = data.items
        .reduce((acc, curr) => acc + Number(curr?.total) * Number(curr?.totalCount), 0)
        .toFixed(2);
      setSubTotal(Number(data?.subtotal || calculatedSubTotal));

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
  }, [data, selectedOrganization]);

  const calculateTotalTax = () => {
    const totalTax = data?.items?.reduce((acc, curr) => (acc += curr?.totalIgstAmt || 0), 0);
    return totalTax;
  };

  const handlePrint = () => {
    handlePrintData();
  };

  return (
    <div className="grid">
      <div
        ref={contentToPrint}
        className="receipt-container"
        style={{
          width: "100%",
          maxWidth: "80mm",
          margin: "0 auto",
          fontFamily: "Arial, sans-serif",
          fontSize: "11px",
          lineHeight: "1.3",
          padding: "4mm",
          border: "1px dotted #000",
        }}
      >
        {/* Header with Logo and Company Name */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "8px",
            marginBottom: "8px",
            paddingBottom: "6px",
            borderBottom: "1px dotted #000",
          }}
        >
          {/* Logo on left */}
          {org?.logo && (
            <img
              src={org?.logo}
              alt="Logo"
              style={{
                width: "25mm",
                height: "auto",
                objectFit: "contain",
              }}
            />
          )}
          
          {/* Company Name on right */}
          <div style={{ flex: 1, textAlign: "center" }}>
            <div
              style={{
                fontSize: "16px",
                fontWeight: "bold",
                marginBottom: "2px",
              }}
            >
              {org?.name || "HILL TOWN HOTEL"}
            </div>
               <div>{org?.road || "Erattayar road"}, {org?.place || "Kattapana"}</div>
          <div>PH: {org?.mobile || "04868 272777"}</div>
          <div>SAC CODE: {org?.sacCode || "996331"}</div>
          {org?.gstNum && <div>GSTNO: {org?.gstNum}</div>}
          </div>
        </div>

        {/* Company Details */}
        

        {/* Bill Title */}
        <div
          style={{
            textAlign: "center",
            marginBottom: "6px",
            paddingBottom: "6px",
            borderBottom: "1px dotted #000",
          }}
        >
          <div
            style={{
              fontSize: "14px",
              fontWeight: "bold",
              fontStyle: "italic",
            }}
          >
            BILL
          </div>
          <div
            style={{
              fontSize: "9px",
              fontStyle: "italic",
              marginTop: "2px",
            }}
          >
            **Duplicate Copy
          </div>
        </div>

        {/* Bill Info */}
        <div
          style={{
            marginBottom: "6px",
            fontSize: "11px",
              fontWeight: "bold",
            paddingBottom: "6px",
            borderBottom: "1px dotted #000",
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              marginBottom: "2px",
            }}
          >
            <div>
              Bill{" "}
              {data?.[getVoucherNumber()] ||
                data?.voucherNumber?.[0]?.voucherNumber ||
                "11007"}
            </div>
            <div>
              Date: {new Date(data?.Date || data?.createdAt).toLocaleDateString("en-GB")}
            </div>
          </div>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
            }}
          >
            <div>
              Table:{" "}
              {data?.voucherNumber?.map((item) => item?.tableNumber).join(", ") ||
                data?.convertedFrom?.map((item) => item?.tableNumber).join(", ") ||
                "1"}
            </div>
            <div>
              Time:{" "}
              {new Date(data?.Date || data?.createdAt).toLocaleTimeString("en-GB", {
                hour: "2-digit",
                minute: "2-digit",
                second: "2-digit",
                hour12: false,
              })}
            </div>
          </div>
        </div>

        {/* Items Table Header */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "35px 1fr 45px 55px 65px",
            fontSize: "11px",
            fontWeight: "bold",
            paddingBottom: "3px",
            borderBottom: "1px dotted #000",
            marginBottom: "4px",
          }}
        >
          <div style={{ textAlign: "left" }}>No</div>
          <div style={{ textAlign: "left", paddingLeft: "3px" }}>Item</div>
          <div style={{ textAlign: "center" }}>Qty</div>
          <div style={{ textAlign: "right", paddingRight: "3px" }}>Rate</div>
          <div style={{ textAlign: "right", paddingRight: "3px" }}>Amount</div>
        </div>

        {/* Items */}
        {data?.items?.length > 0 &&
          data?.items.map((el, index) => {
            const total = el?.total || 0;
            const count = el?.totalCount || 1;
            const rate = count > 0 ? (total / count).toFixed(2) : "0.00";

            return (
              <div
                key={index}
                style={{
                  display: "grid",
                  gridTemplateColumns: "35px 1fr 45px 55px 65px",
                  fontSize: "10px",
                  fontWeight: "bold",

                  marginBottom: "2px",
                  padding: "1px 0",
                }}
              >
                <div style={{ textAlign: "left" }}>{index + 1}</div>
                <div
                  style={{
                    textAlign: "left",
                    paddingLeft: "3px",
                    wordBreak: "break-word",
                  }}
                >
                  {el.product_name}
                </div>
                <div style={{ textAlign: "center" }}>{el?.totalCount || 1}</div>
                <div style={{ textAlign: "right", paddingRight: "3px" }}>{rate}</div>
                <div style={{ textAlign: "right", paddingRight: "3px" }}>
                  {total.toFixed(2)}
                </div>
              </div>
            );
          })}

        {/* Divider after items */}
        <div
          style={{
            borderBottom: "1px dotted #000",
            margin: "6px 0",
          }}
        ></div>

        {/* Subtotal and Taxes */}
        <div style={{ fontSize: "10px", marginBottom: "4px" }}>
          <div
            style={{
              display: "flex",
                          fontWeight: "bold",

              justifyContent: "space-between",
              marginBottom: "2px",
            }}
          >
            <div style={{ marginLeft: "auto", marginRight: "70px" }}>Amount</div>
            <div style={{ textAlign: "right", paddingRight: "3px" }}>{subTotal}</div>
          </div>

          {/* Tax Details */}
          {IsIndian && isSameState && calculateTotalTax() > 0 && (
            <>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  marginBottom: "2px",
                              fontWeight: "bold",

                }}
              >
                <div style={{ marginLeft: "auto", marginRight: "70px" }}>
                  CGST @ 2.50%
                </div>
                <div style={{ textAlign: "right", paddingRight: "3px" }}>
                  {(calculateTotalTax() / 2).toFixed(2)}
                </div>
              </div>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                              fontWeight: "bold",

                  marginBottom: "2px",
                }}
              >
                <div style={{ marginLeft: "auto", marginRight: "70px" }}>
                  SGST @ 2.50%
                </div>
                <div style={{ textAlign: "right", paddingRight: "3px" }}>
                  {(calculateTotalTax() / 2).toFixed(2)}
                </div>
              </div>
            </>
          )}

          {IsIndian && !isSameState && calculateTotalTax() > 0 && (
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                marginBottom: "2px",
              }}
            >
              <div style={{ marginLeft: "auto", marginRight: "70px" }}>IGST @ 5.00%</div>
              <div style={{ textAlign: "right", paddingRight: "3px" }}>
                {calculateTotalTax().toFixed(2)}
              </div>
            </div>
          )}

          {!IsIndian && calculateTotalTax() > 0 && (
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                marginBottom: "2px",
              }}
            >
              <div style={{ marginLeft: "auto", marginRight: "70px" }}>VAT</div>
              <div style={{ textAlign: "right", paddingRight: "3px" }}>
                {calculateTotalTax().toFixed(2)}
              </div>
            </div>
          )}
        </div>

        {/* Divider */}
        <div
          style={{
            borderBottom: "1px dotted #000",
            margin: "6px 0",
          }}
        ></div>

        {/* Room & Final Details */}
        <div style={{ fontSize: "10px", marginBottom: "6px" }}>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              marginBottom: "2px",
            }}
          >
            <div style={{ fontWeight: "bold" }}>
              {data?.voucherNumber?.[0]?.checkInNumber
                ? `Room`
                : "Room"}
            </div>
            <div
              style={{
                display: "flex",
                gap: "40px",
                paddingRight: "3px",
              }}
            >
              <div>
                Total: <span style={{ fontWeight: "bold" }}>{subTotal}</span>
              </div>
            </div>
          </div>

          {data?.voucherNumber?.[0]?.checkInNumber && (
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                marginBottom: "2px",
              }}
            >
              <div style={{ fontWeight: "bold" }}>
                {data.voucherNumber[0].checkInNumber}
              </div>
              <div
                style={{
                  display: "flex",
                  gap: "50px",
                  paddingRight: "3px",
                }}
              >
                <div>
                  GST:{" "}
                  <span style={{ fontWeight: "bold" }}>
                    {calculateTotalTax().toFixed(2)}
                  </span>
                </div>
              </div>
            </div>
          )}

          {data?.discount > 0 && (
            <div
              style={{
                display: "flex",
                justifyContent: "flex-end",
                marginBottom: "2px",
                paddingRight: "3px",
              }}
            >
              <div>
                Discount:{" "}
                <span style={{ fontWeight: "bold" }}>
                  {parseFloat(data.discount).toFixed(2)}
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Divider */}
        <div
          style={{
            borderBottom: "1px dotted #000",
            margin: "6px 0",
          }}
        ></div>

        {/* Net Amount */}
        <div
          style={{
            textAlign: "center",
            fontSize: "14px",
            fontWeight: "bold",
            marginBottom: "8px",
            paddingBottom: "6px",
            borderBottom: "1px dotted #000",
          }}
        >
          Net Amount: {data?.finalAmount}
        </div>

        {/* Footer */}
        <div
          style={{
            textAlign: "center",
            fontSize: "11px",
            fontWeight: "bold",
            marginTop: "8px",
          }}
        >
          Thank You Visit Again
        </div>
      </div>

      {/* Preview Buttons */}
      {isPreview && (
        <div className="flex gap-3 justify-center p-2">
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
            className="px-3 py-1 rounded-lg bg-red-400 text-gray-800 font-medium hover:bg-gray-300 active:scale-95 transition"
            onClick={() => sendToParent(false)}
          >
            Cancel
          </button>
        </div>
      )}
    </div>
  );
}

export default VoucherThreeInchPdfFormat2;