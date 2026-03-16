/* eslint-disable react/prop-types */
import { useEffect, useState, useRef } from "react";
import { useSelector } from "react-redux";

import { defaultPrintSettings } from "../../../../../utils/defaultConfigurations";
import { useLocation, useParams } from "react-router-dom";
import { useReactToPrint } from "react-to-print";
import TitleDiv from "@/components/common/TitleDiv";

function VoucherThreeInchPdfFormat2({ data, org, isPreview, sendToParent }) {
  const [subTotal, setSubTotal] = useState(0);
  const location = useLocation();
  const contentToPrint = useRef(null);

  !data && (data = location?.state);
  !org &&
    (org = useSelector(
      (state) => state?.secSelectedOrganization?.secSelectedOrg,
    ));
  let showPrintButton =
    org?.configurations?.[0]?.defaultPrint?.showBeforeSaleInRestaurant;
  const { isFinalized } = useParams();
  console.log("isFinalized", isFinalized);
  console.log("showPrintButton", showPrintButton);

  const isIndian = useSelector(
    (state) =>
      state?.secSelectedOrganization?.secSelectedOrg?.country === "India",
  );
  const party = data?.party;
  const isSameState =
    org?.state?.toLowerCase() === party?.state?.toLowerCase() || !party?.state;

  const voucherType = data?.voucherType;

  const getVoucherNumber = () => {
    if (!voucherType) return "";
    if (voucherType === "sales" || voucherType === "vanSale")
      return "salesNumber";
    if (voucherType === "saleOrder") return "orderNumber";
    return voucherType + "Number";
  };




  useEffect(() => {
    if (data && data.items) {
      data.discount = data.additionalCharges?.[0]?.value || 0;
      const calculatedSubTotal = data.items
        .reduce(
          (acc, curr) =>
            acc +
            Number(curr?.total) -
            Number(
              curr?.totalIgstAmt ||
                curr?.totalCgstAmt + curr?.totalSgstAmt ||
                0,
            ),
          0,
        )
        .toFixed(2);
      setSubTotal(Number(calculatedSubTotal || data?.subTotal));
    }
  }, [data]);

  const calculateTotalTax = () =>
    Number(
      data?.items?.reduce((acc, curr) => {
        return (
          acc +
          Number(
            curr?.totalIgstAmt || curr?.totalCgstAmt + curr?.totalSgstAmt || 0,
          )
        );
      }, 0) || 0,
    );

  const getBillNumber = () =>
    data?.[getVoucherNumber()] ||
    data?.voucherNumber?.[0]?.voucherNumber ||
    "11007";

  const getTableNumber = () =>
    data?.voucherNumber
      ?.map((item) => item?.tableNumber)
      .filter(Boolean)
      .join(", ") ||
    data?.convertedFrom
      ?.map((item) => item?.tableNumber)
      .filter(Boolean)
      .join(", ") ||
    null;

  const getRoomNumber = () => {
    const hasCheckIn = data?.voucherNumber?.[0]?.checkInNumber  ;
    const roomNo =
      data?.roomDetails?.roomno ||
      data?.voucherNumber?.[0]?.roomNumber ||
      data?.roomId?.roomno ||
      data?.roomId?.roomName;

    if (!hasCheckIn && !roomNo) return null;
    return `Room: ${roomNo}`;
  };
const getFoodPlan = () => {
  console.log();
  const hasCheckIn = data?.voucherNumber?.[0]?.checkInNumber;
  const foodPlanArray = data?.roomDetails?.foodPlanDetails;

  if (!hasCheckIn && !Array.isArray(foodPlanArray)) return null;

  // array of names:
  // return foodPlanArray.map(item => item.planType);

  // or a single comma‑separated string:
  const names = foodPlanArray.map(item => item.planType).join(", ");
  return `Food Paln: ${names}`;
};
  const netAmount = Math.round(Number(data?.finalAmount || 0)).toFixed(2);
  const discount = Math.round(
    Number(
      data?.totalAdditionalCharges || data?.additionalCharges?.[0]?.amount,
    ),
  ).toFixed(2);
  console.log("discount", discount);
  console.log("netAmount", netAmount);
  const tax = Math.round(calculateTotalTax()).toFixed(2);
  const cgst = Math.round(calculateTotalTax() / 2).toFixed(2);

  // const cgstPercentage = (Number(cgst) / Number(data?.subtotal || data?.subTotal)) * 100;

  // Get actual tax rates directly from item data instead of back-calculating
  const getCgstPercentage = () => {
    const item = data?.items?.find((el) => el.cgst > 0);
    return item?.cgst || 0;
  };
  const getSgstPercentage = () => {
    const item = data?.items?.find((el) => el.sgst > 0);
    return item?.sgst || 0;
  };
  const getIgstPercentage = () => {
    const item = data?.items?.find((el) => el.igst > 0);
    return item?.igst || 0;
  };
  const cgstPercentage = getCgstPercentage();
  const sgstPercentage = getSgstPercentage();
  const igstPercentage = getIgstPercentage();
  const handlePrint = useReactToPrint({
    content: () => contentToPrint.current,
  });

  const containerStyle = {
    width: "72mm",
    margin: "0 auto", // center on the roll
    fontFamily: "Arial, sans-serif",
    fontSize: "11px",
    lineHeight: 1.2,
    padding: "2mm 3mm",
    border: "1px dotted #000",
    textAlign: "left",
    boxSizing: "border-box",
  };

  const flexRow = {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "2px",
  };

  const textRight = { textAlign: "right", paddingRight: "3px" };
  const textLeft = { textAlign: "left", paddingLeft: "3px" };
  const centerText = { textAlign: "center" };
  const bold = { fontWeight: "bold" };

  const headerGrid = {
    display: "grid",
    gridTemplateColumns: "0.6fr 2.2fr 0.7fr 1fr 1.1fr", // No, Item, Qty, Rate, Amount
    fontSize: "11px",
    fontWeight: "bold",
    paddingBottom: "3px",
    borderBottom: "1px dotted #000",
    marginBottom: "4px",
  };

  const itemGrid = {
    display: "grid",
    gridTemplateColumns: "0.6fr 2.2fr 0.7fr 1fr 1.1fr",
    fontSize: "10px",
    marginBottom: "2px",
    padding: "1px 0",
  };
  console.log(data);
  console.log({
    cgst,
    tax,
    subTotal,
    cgstPercentage,
    totalTax: calculateTotalTax(),
  });
  const cgstGroups =
    data?.items?.reduce((acc, item) => {
      const cgstRate = item?.cgst || 0;
      const sgstRate = item?.sgst || 0;
      const cgstAmt = Number(item?.totalCgstAmt || 0);
      const sgstAmt = Number(item?.totalSgstAmt || 0);
      if (cgstAmt > 0 || sgstAmt > 0) {
        if (!acc[cgstRate]) {
          acc[cgstRate] = { cgstAmt: 0, sgstAmt: 0, sgstRate };
        }
        acc[cgstRate].cgstAmt += cgstAmt;
        acc[cgstRate].sgstAmt += sgstAmt;
      }
      return acc;
    }, {}) || {};

  const paymentSplits = data?.paymentSplittingData || [];

  const prettyType = (type) => {
    if (!type) return "";
    const map = {
      cash: "Cash",
      upi: "UPI",
      card: "Card",
      bank: "Bank",
    };
    return map[type] || type.toUpperCase();
  };

// Payment splits LEFT side list
const getPaymentSummary = () => {
  if (!paymentSplits.length) return null;
  console.log(paymentSplits);

  return paymentSplits
    .filter((p) => p.amount > 0)
    .map((p) => (
      <div
        key={p.type}
        style={{
          fontSize: "10px",
          fontWeight: "bold",
        }}
      >
        {prettyType(p.type)} : ₹ {Math.round(p.amount).toFixed(2)}
      </div>
    ));
};


  return (
    <>
      <style type="text/css" media="print">
        {`
    @page {
      size: 80mm auto;
      margin: 0;
    }
    html, body {
      margin: 0 !important;
      padding: 0 !important;
      text-align: left !important;
    }
    .receipt-container {
      width: 72mm !important;
      margin: 0 auto !important;
      padding: 2mm 3mm !important;
      text-align: left !important;
      box-sizing: border-box;
    }
  `}
      </style>
      <TitleDiv title="Restaurant sale print" />
      <div className="grid mt-2">
        <div
          ref={contentToPrint}
          className="receipt-container"
          style={containerStyle}
        >
          {/* Header */}
          <div
            style={{
              ...flexRow,
              marginBottom: "8px",
              paddingBottom: "6px",
              borderBottom: "1px dotted #000",
              alignItems: "flex-start",
              gap: "8px",
            }}
          >
            {org?.logo && (
              <img
                src={org.logo}
                alt="Logo"
                style={{ width: "25mm", height: "auto", objectFit: "contain" }}
              />
            )}
            <div style={{ flex: 1, textAlign: "center" }}>
              <div style={{ ...bold, fontSize: "16px", marginBottom: "2px" }}>
                {org?.name}
              </div>
              {(org?.road || org?.place) && (
                <div>{`${org?.road || ""}${org?.road && org?.place ? ", " : ""}${org?.place || ""}`}</div>
              )}
              {org?.mobile && <div>PH: {org.mobile}</div>}
              {org?.gstNum && <div>GSTNO: {org.gstNum}</div>}
            </div>
          </div>

          {/* Title */}
          <div
            style={{
              ...centerText,
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
              INVOICE
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
            <div style={{ display: "flex" }}>
              <span style={{ minWidth: "170px" }}>Bill {getBillNumber()}</span>
              <span>
                Date:{" "}
                {new Date(data?.Date || data?.createdAt).toLocaleDateString(
                  "en-GB",
                )}
              </span>
            </div>
            <div style={{ display: "flex" }}>
              <span
                style={{
                  minWidth: "170px",
                  visibility:
                    getTableNumber() && getTableNumber() !== "10"
                      ? "visible"
                      : "hidden",
                }}
              >
                Table: {getTableNumber()}
              </span>
              <span>
                Time:{" "}
                {new Date(data?.Date || data?.createdAt).toLocaleTimeString(
                  "en-GB",
                  {
                    hour: "2-digit",
                    minute: "2-digit",
                    hour12: false,
                  },
                )}
              </span>
            </div>

            {data?.orderType && (
              <div style={{ marginTop: "2px" }}>
                <span style={{ textTransform: "capitalize" }}>
                  {data.orderType.replace(/-/g, " ")}
                </span>
              </div>
            )}
          </div>

          {/* Items Header */}
          <div style={headerGrid}>
            <div style={textLeft}>No</div>
            <div style={textLeft}>Item</div>
            <div style={centerText}>Qty</div>
            <div style={textRight}>Rate</div>
            <div style={textRight}>Amount</div>
          </div>

          {/* Items */}
          {/* Items */}
          {data?.items?.map((el, index) => {
            console.log(el);
            const total = Number(el?.total || 0);
            const count = Number(el?.totalCount || 1);
            const totalTax = Number(
              el?.totalIgstAmt ||
                (el?.totalCgstAmt || 0) + (el?.totalSgstAmt || 0) ||
                0,
            );
            console.log(el);

            console.log({ total, count, totalTax });

            // ✅ Same logic as Format 1 — addRateWithTax controls rate/amount display
            const addRateWithTax =
              org?.configurations?.[0]?.addRateWithTax?.restaurantSale 
              // ??
              // org?.configurations?.[0]?.addRateWithTax?.sale ??
              // true;

            console.log(addRateWithTax);
            console.log(count);
            console.log(el.igst);
            console.log(total);

            const rate = addRateWithTax
              ? count > 0
                ? ((total * 100) / (100 + el.igst) / count).toFixed(2)
                : "0.00" // WITH tax (like format 1)
              : count > 0
                ? ((total - totalTax) / count).toFixed(2)
                : "0.00"; // WITHOUT tax

            console.log({ rate });

            const amount = (Number(rate) * count).toFixed(2); // WITHOUT tax

            return (
              <div key={index} style={itemGrid}>
                <div style={textLeft}>{index + 1}</div>
                <div style={{ ...textLeft, wordBreak: "break-word" }}>
                  {el.product_name}
                </div>
                <div style={centerText}>{count}</div>
                <div style={textRight}>{rate}</div>
                <div style={textRight}>{amount}</div>
              </div>
            );
          })}
          <div style={{ borderBottom: "1px dotted #000", margin: "6px 0" }} />

          {/* Totals */}

       {/* Totals row: left = payment splits, right = Amount / taxes */}
<div
  style={{
    fontSize: "10px",
    marginBottom: "4px",
    display: "flex",
    flexDirection: "row",
  }}
>
  {/* LEFT SIDE: payment splits */}
  <div style={{ flex: 1 }}>
    {getPaymentSummary()}
  </div>

  {/* RIGHT SIDE: Amount + taxes */}
  <div style={{ flex: 1 }}>
    {/* Amount */}
    <div
      style={{
        display: "flex",
        flexDirection: "row",
        marginBottom: "2px",
        fontWeight: "bold",
      }}
    >
      <div
        style={{
          marginLeft: "auto",
          width: 60,
          textAlign: "right",
        }}
      >
        Amount
      </div>
      <div
        style={{
          width: 60,
          textAlign: "right",
        }}
      >
        {subTotal.toFixed(2)}
      </div>
    </div>

    {/* same‑state Indian tax */}
    {isIndian &&
      isSameState &&
      calculateTotalTax() > 0 &&
      (() => {
        const entries = Object.entries(cgstGroups);

        // if (entries.length === 0) {
          return (
            <>
              <div style={flexRow}>
                <div
                  style={{
                    marginLeft: "auto",
                    width: 70,
                    fontWeight: "bold",
                  }}
                >
                  CGST {cgstPercentage}%
                </div>
                <div style={textRight}>{cgst}</div>
              </div>
              <div style={flexRow}>
                <div
                  style={{
                    marginLeft: "auto",
                    width: 70,
                    fontWeight: "bold",
                  }}
                >
                  SGST {sgstPercentage}%
                </div>
                <div style={textRight}>{cgst}</div>
              </div>
            </>
          );
        // }

        // return entries.map(([rate, { cgstAmt, sgstAmt, sgstRate }]) => (
        //   <div key={rate}>
        //     <div style={flexRow}>
        //       <div
        //         style={{
        //           marginLeft: "auto",
        //           width: 70,
        //           fontWeight: "bold",
        //         }}
        //       >
        //         CGST {rate}%
        //       </div>
        //       <div style={textRight}>{cgstAmt.toFixed(2)}</div>
        //     </div>
        //     <div style={flexRow}>
        //       <div
        //         style={{
        //           marginLeft: "auto",
        //           width: 70,
        //           fontWeight: "bold",
        //         }}
        //       >
        //         SGST {sgstRate}%
        //       </div>
        //       <div style={textRight}>{sgstAmt.toFixed(2)}</div>
        //     </div>
        //   </div>
        // ));
      })()}

    {/* IGST */}
    {isIndian && !isSameState && calculateTotalTax() > 0 && (
      <div style={flexRow}>
        <div
          style={{
            marginLeft: "auto",
            width: 70,
            fontWeight: "bold",
          }}
        >
          IGST {igstPercentage}%
        </div>
        <div style={textRight}>{tax}</div>
      </div>
    )}

    {/* Non‑Indian tax */}
    {!isIndian && calculateTotalTax() > 0 && (
      <div style={flexRow}>
        <div
          style={{
            marginLeft: "auto",
            width: 70,
            fontWeight: "bold",
          }}
        >
          Tax {igstPercentage}%
        </div>
        <div style={textRight}>{tax}</div>
      </div>
    )}
  </div>
</div>


          <div style={{ borderBottom: "1px dotted #000", margin: "6px 0" }} />

          {/* Final Details */}
          <div style={{ fontSize: "10px", marginBottom: "6px" }}>
            <div
              style={{
                display: "flex",
                fontWeight: "bold",
                marginBottom: "2px",
              }}
            >
              {getRoomNumber() && <div style={bold}>{getRoomNumber()}</div>}
              
              <div
                style={{
                  marginLeft: "auto",
                  paddingRight: "3px",
                  fontWeight: "bold",
                }}
              >
                Total: {netAmount}
              </div>
            </div>
 {getFoodPlan() && <div style={bold}>{getFoodPlan()}</div>}
            {/* {data?.voucherNumber?.[0]?.checkInNumber && (
              <div style={flexRow}>
                <div style={bold}>{data.voucherNumber[0].checkInNumber}</div>
                <div style={{ paddingRight: "3px" }}>
                  GST: <span style={bold}>{tax}</span>
                </div>
              </div>
            )} */}

            {Number(discount) > 0 && (
              <div
                style={{
                  ...flexRow,
                  justifyContent: "flex-end",
                  paddingRight: "3px",
                  fontWeight: "bold",
                }}
              >
                Discount: <span style={bold}>{discount}</span>
              </div>
            )}
          </div>

          <div style={{ borderBottom: "1px dotted #000", margin: "6px 0" }} />

          {/* Net Amount */}
          <div
            style={{
              ...centerText,
              fontSize: "14px",
              fontWeight: "bold",
              marginBottom: "8px",
              paddingBottom: "6px",
              borderBottom: "1px dotted #000",
            }}
          >
            Net Amount: {netAmount}
          </div>

          {/* Footer */}
          <div
            style={{
              ...centerText,
              fontSize: "11px",
              fontWeight: "bold",
              marginTop: "8px",
            }}
          >
            Thank You Visit Again
          </div>
        </div>

        {/* Controls */}
        <div className="flex gap-3 justify-center p-2">
          {(showPrintButton || isFinalized) && (
            <button
              className="px-3 py-1 rounded-lg bg-gray-500 text-white font-medium hover:bg-gray-600 active:scale-95 transition"
              onClick={handlePrint}
            >
              Print
            </button>
          )}

          {isPreview && (
            <>
              <button
                className="px-3 py-1 rounded-lg bg-blue-500 text-white font-medium hover:bg-blue-600 active:scale-95 transition"
                onClick={() => sendToParent(true)}
              >
                Confirm
              </button>
              <button
                className="px-3 py-1 rounded-lg bg-red-400 text-gray-800 font-medium hover:bg-red-500 active:scale-95 transition"
                onClick={() => sendToParent(false)}
              >
                Cancel
              </button>
            </>
          )}
        </div>
      </div>
    </>
  );
}

export default VoucherThreeInchPdfFormat2;
