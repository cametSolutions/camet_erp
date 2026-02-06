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
      data.discount = data.additionalCharges[0]?.value;
      const calculatedSubTotal = data.items
        .reduce(
          (acc, curr) =>
            acc + Number(curr?.total) * Number(curr?.totalCount),
          0
        )
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
    const totalTax = data?.items?.reduce(
      (acc, curr) => (acc += curr?.totalIgstAmt || 0),
      0
    );
    return totalTax;
  };

  const handlePrint = () => {
    handlePrintData();
  };

  return (
    <div
      ref={contentToPrint}
      style={{
        width: "80mm",
        margin: "0 auto",
        padding: "5mm",
        fontFamily: "Arial, sans-serif",
        fontSize: "11px",
        lineHeight: "1.3",
      }}
    >
      {/* Header */}
      <div style={{ textAlign: "center", marginBottom: "8px" }}>
        <div
          style={{
            fontSize: "16px",
            fontWeight: "bold",
            marginBottom: "4px",
          }}
        >
          {org?.name || "HILL TOWN HOTEL"}
        </div>
        <div style={{ fontSize: "10px", marginBottom: "2px" }}>
          {org?.road || "Erattayar road"}, {org?.place || "Kattapana"}
        </div>
        <div style={{ fontSize: "10px", marginBottom: "2px" }}>
          PH: {org?.mobile || "04868 272777"}
        </div>
        <div style={{ fontSize: "10px", marginBottom: "2px" }}>
          SAC CODE: {org?.sacCode || "996331"}
        </div>
        {org?.gstNum && (
          <div style={{ fontSize: "10px", marginBottom: "4px" }}>
            GSTNO: {org?.gstNum}
          </div>
        )}
      </div>

      {/* Horizontal line */}
      <div
        style={{
          borderTop: "1px solid #000",
          margin: "5px 0",
        }}
      ></div>

      {/* Bill Title */}
      <div style={{ textAlign: "center", marginBottom: "8px" }}>
        <div style={{ fontSize: "14px", fontWeight: "bold", fontStyle: "italic" }}>
          BILL
        </div>
        <div style={{ fontSize: "9px", fontStyle: "italic" }}>
          **Duplicate Copy
        </div>
      </div>

      {/* Bill Info */}
      <div style={{ marginBottom: "8px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "3px" }}>
          <div style={{ fontSize: "11px" }}>
            Bill {data?.[getVoucherNumber()] || data?.voucherNumber?.[0]?.voucherNumber || "11007"}
          </div>
          <div style={{ fontSize: "11px" }}>
            Date: {new Date(data?.Date || data?.createdAt).toLocaleDateString("en-GB")}
          </div>
        </div>
        <div style={{ display: "flex", justifyContent: "space-between" }}>
          <div style={{ fontSize: "11px" }}>
            Table: {data?.voucherNumber?.map((item) => item?.tableNumber).join(", ") || data?.convertedFrom?.map((item) => item?.tableNumber).join(", ") || "1"}
          </div>
          <div style={{ fontSize: "11px" }}>
            Time: {new Date(data?.Date || data?.createdAt).toLocaleTimeString("en-GB", {
              hour: "2-digit",
              minute: "2-digit",
              second: "2-digit",
              hour12: false,
            })}
          </div>
        </div>
      </div>

      {/* Horizontal line */}
      <div
        style={{
          borderTop: "1px solid #000",
          margin: "5px 0",
        }}
      ></div>

      {/* Items Table Header */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "40px 1fr 50px 60px 70px",
          fontWeight: "bold",
          fontSize: "10px",
          marginBottom: "4px",
          backgroundColor: "#f0f0f0",
          padding: "3px 0",
        }}
      >
        <div style={{ textAlign: "center" }}>No</div>
        <div style={{ paddingLeft: "5px" }}>Item</div>
        <div style={{ textAlign: "center" }}>Qty</div>
        <div style={{ textAlign: "right", paddingRight: "5px" }}>Rate</div>
        <div style={{ textAlign: "right", paddingRight: "5px" }}>Amount</div>
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
                gridTemplateColumns: "40px 1fr 50px 60px 70px",
                fontSize: "10px",
                marginBottom: "3px",
                padding: "2px 0",
              }}
            >
              <div style={{ textAlign: "center" }}>{index + 1}</div>
              <div style={{ paddingLeft: "5px" }}>{el.product_name}</div>
              <div style={{ textAlign: "center" }}>{el?.totalCount || 1}</div>
              <div style={{ textAlign: "right", paddingRight: "5px" }}>{rate}</div>
              <div style={{ textAlign: "right", paddingRight: "5px" }}>{total.toFixed(2)}</div>
            </div>
          );
        })}

      {/* Horizontal line */}
      <div
        style={{
          borderTop: "1px solid #000",
          margin: "8px 0 5px 0",
        }}
      ></div>

      {/* Totals Section */}
      <div style={{ fontSize: "10px", marginBottom: "5px" }}>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            marginBottom: "2px",
            paddingRight: "5px",
          }}
        >
          <div style={{ paddingLeft: "180px" }}>Amount</div>
          <div style={{ textAlign: "right" }}>{subTotal}</div>
        </div>

        {/* Tax Details */}
        {IsIndian && isSameState && calculateTotalTax() > 0 && (
          <>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                marginBottom: "2px",
                paddingRight: "5px",
              }}
            >
              <div style={{ paddingLeft: "180px" }}>CGST @ 2.50%</div>
              <div style={{ textAlign: "right" }}>{(calculateTotalTax() / 2).toFixed(2)}</div>
            </div>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                marginBottom: "2px",
                paddingRight: "5px",
              }}
            >
              <div style={{ paddingLeft: "180px" }}>SGST @ 2.50%</div>
              <div style={{ textAlign: "right" }}>{(calculateTotalTax() / 2).toFixed(2)}</div>
            </div>
          </>
        )}

        {IsIndian && !isSameState && calculateTotalTax() > 0 && (
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              marginBottom: "2px",
              paddingRight: "5px",
            }}
          >
            <div style={{ paddingLeft: "180px" }}>IGST @ 5.00%</div>
            <div style={{ textAlign: "right" }}>{calculateTotalTax().toFixed(2)}</div>
          </div>
        )}

        {!IsIndian && calculateTotalTax() > 0 && (
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              marginBottom: "2px",
              paddingRight: "5px",
            }}
          >
            <div style={{ paddingLeft: "180px" }}>VAT</div>
            <div style={{ textAlign: "right" }}>{calculateTotalTax().toFixed(2)}</div>
          </div>
        )}
      </div>

      {/* Horizontal line */}
      <div
        style={{
          borderTop: "1px solid #000",
          margin: "5px 0",
        }}
      ></div>

      {/* Room & Final Details */}
      <div style={{ fontSize: "11px", marginBottom: "8px" }}>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            marginBottom: "3px",
          }}
        >
          <div style={{ fontWeight: "bold" }}>
            {data?.voucherNumber?.[0]?.roomId ? `Room ${data.voucherNumber[0].checkInNumber}` : "Room"}
          </div>
          <div style={{ display: "flex", gap: "50px", paddingRight: "5px" }}>
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
              marginBottom: "3px",
            }}
          >
            <div style={{ fontWeight: "bold" }}>{data.voucherNumber[0].checkInNumber}</div>
            <div style={{ display: "flex", gap: "50px", paddingRight: "5px" }}>
              <div>
                GST: <span style={{ fontWeight: "bold" }}>{calculateTotalTax().toFixed(2)}</span>
              </div>
            </div>
          </div>
        )}

        {data?.discount > 0 && (
          <div
            style={{
              display: "flex",
              justifyContent: "flex-end",
              marginBottom: "3px",
              paddingRight: "5px",
            }}
          >
            <div>
              Discount: <span style={{ fontWeight: "bold" }}>{parseFloat(data.discount).toFixed(2)}</span>
            </div>
          </div>
        )}
      </div>

      {/* Horizontal line */}
      <div
        style={{
          borderTop: "1px solid #000",
          margin: "5px 0",
        }}
      ></div>

      {/* Net Amount */}
      <div
        style={{
          textAlign: "center",
          fontSize: "14px",
          fontWeight: "bold",
          marginBottom: "10px",
        }}
      >
        Net Amount: {data?.finalAmount}
      </div>

      {/* Horizontal line */}
      <div
        style={{
          borderTop: "1px solid #000",
          margin: "5px 0",
        }}
      ></div>

      {/* Footer */}
      <div style={{ textAlign: "center", fontSize: "11px", marginTop: "10px" }}>
        Thank You Visit Again
      </div>

      {/* Preview Buttons */}
      {isPreview && (
        <div
          style={{
            display: "flex",
            gap: "10px",
            marginTop: "20px",
            justifyContent: "center",
          }}
        >
          <button
            onClick={handlePrint}
            style={{
              padding: "8px 16px",
              backgroundColor: "#4CAF50",
              color: "white",
              border: "none",
              borderRadius: "4px",
              cursor: "pointer",
              fontSize: "12px",
            }}
          >
            Print
          </button>
          <button
            onClick={() => sendToParent(true)}
            style={{
              padding: "8px 16px",
              backgroundColor: "#2196F3",
              color: "white",
              border: "none",
              borderRadius: "4px",
              cursor: "pointer",
              fontSize: "12px",
            }}
          >
            Confirm
          </button>
          <button
            onClick={() => sendToParent(false)}
            style={{
              padding: "8px 16px",
              backgroundColor: "#f44336",
              color: "white",
              border: "none",
              borderRadius: "4px",
              cursor: "pointer",
              fontSize: "12px",
            }}
          >
            Cancel
          </button>
        </div>
      )}
    </div>
  );
}

export default VoucherThreeInchPdfFormat2;