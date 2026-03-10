/* eslint-disable react/prop-types */
import { useEffect, useState, useRef } from "react";
import { useSelector } from "react-redux";

import { defaultPrintSettings } from "../../../../../utils/defaultConfigurations";
import { useLocation } from "react-router-dom";
import { useReactToPrint } from "react-to-print";
import TitleDiv from "@/components/common/TitleDiv";

function VoucherThreeInchPdfFormat2({
  data,
  org,
  isPreview,
  sendToParent,
}) {
  const [subTotal, setSubTotal] = useState(0);
  const location = useLocation();
  const contentToPrint = useRef(null);

  !data && (data = location?.state);
  !org &&
    (org = useSelector(
      (state) => state?.secSelectedOrganization?.secSelectedOrg,
    ));

  const isIndian = useSelector(
    (state) =>
      state?.secSelectedOrganization?.secSelectedOrg?.country === "India",
  );
  const party = data?.party;
  const isSameState =
    org?.state?.toLowerCase() === party?.state?.toLowerCase() ||
    !party?.state;

  const voucherType = data?.voucherType;

  const getVoucherNumber = () => {
    if (!voucherType) return "";
    if (voucherType === "sales" || voucherType === "vanSale")
      return "salesNumber";
    if (voucherType === "saleOrder") return "orderNumber";
    return voucherType + "Number";
  };

  const getConfigurationVoucherType = () => {
    const currentVoucherType = data?.voucherType;
    if (currentVoucherType === "sales" || currentVoucherType === "vanSale")
      return "sale";
    if (currentVoucherType === "saleOrder") return "saleOrder";
    return "default";
  };

  const allPrintConfigurations = useSelector(
    (state) =>
      state.secSelectedOrganization?.secSelectedOrg?.configurations[0]
        ?.printConfiguration,
  );

  const matchedConfiguration = allPrintConfigurations?.find(
    (item) => item.voucher === getConfigurationVoucherType(),
  );

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
            curr?.totalIgstAmt ||
              curr?.totalCgstAmt + curr?.totalSgstAmt ||
              0,
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
    const hasCheckIn = data?.voucherNumber?.[0]?.checkInNumber;
    const roomNo =
      data?.roomDetails?.roomno ||
      data?.voucherNumber?.[0]?.roomNumber ||
      data?.roomId?.roomno ||
      data?.roomId?.roomName;

    if (!hasCheckIn || !roomNo) return null;
    return `Room: ${roomNo}`;
  };

  const netAmount = Math.round(Number(data?.finalAmount || 0)).toFixed(2);
  const discount = Math.round(
    Number(
      data?.totalAdditionalCharges || data?.additionalCharges?.[0]?.amount,
    ),
  ).toFixed(2);
  const tax = Math.round(calculateTotalTax()).toFixed(2);
  const cgst = Math.round(calculateTotalTax() / 2).toFixed(2);

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

  // MAIN CONTAINER: force left align
  const containerStyle = {
    width: "80mm",
    margin: "0 auto",
    fontFamily: "Arial, sans-serif",
    fontSize: "11px",
    lineHeight: 1.2,
    padding: "4mm",
    border: "1px dotted #000",
    textAlign: "left",
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
    gridTemplateColumns: "35px 1fr 45px 55px 65px",
    fontSize: "11px",
    fontWeight: "bold",
    paddingBottom: "3px",
    borderBottom: "1px dotted #000",
    marginBottom: "4px",
  };

  const itemGrid = {
    display: "grid",
    gridTemplateColumns: "35px 1fr 45px 55px 65px",
    fontSize: "10px",
    marginBottom: "2px",
    padding: "1px 0",
  };

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

  const getPaymentSummary = () => {
    if (!paymentSplits.length) return null;

    if (paymentSplits.length === 1) {
      const p = paymentSplits[0];
      return `${prettyType(p.type)}`;
    }

    return paymentSplits
      .map((p) => `${prettyType(p.type)} `)
      .join(" | ");
  };

  return (
    <>
      <TitleDiv title="Restaurant sale print" />

      {/* print-only CSS override to force left align if any global CSS interferes */}
      <style type="text/css" media="print">
        {`
          html, body {
            text-align: left !important;
          }
          .receipt-container {
            text-align: left !important;
          }
        `}
      </style>

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
                style={{
                  width: "25mm",
                  height: "auto",
                  objectFit: "contain",
                }}
              />
            )}
            <div style={{ flex: 1, textAlign: "center" }}>
              <div
                style={{
                  ...bold,
                  fontSize: "16px",
                  marginBottom: "2px",
                }}
              >
                {org?.name}
              </div>
              {(org?.road || org?.place) && (
                <div>{`${
                  org?.road || ""
                }${org?.road && org?.place ? ", " : ""}${
                  org?.place || ""
                }`}</div>
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
              <span style={{ minWidth: "170px" }}>
                Bill {getBillNumber()}
              </span>
              <span>
                Date:{" "}
                {new Date(
                  data?.Date || data?.createdAt,
                ).toLocaleDateString("en-GB")}
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
                {new Date(
                  data?.Date || data?.createdAt,
                ).toLocaleTimeString("en-GB", {
                  hour: "2-digit",
                  minute: "2-digit",
                  hour12: false,
                })}
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
          {data?.items?.map((el, index) => {
            const total = Number(el?.total || 0);
            const count = Number(el?.totalCount || 1);
            const totalTax = Number(
              el?.totalIgstAmt ||
                (el?.totalCgstAmt || 0) + (el?.totalSgstAmt || 0) ||
                0,
            );

            const addRateWithTax =
              org?.configurations?.[0]?.addRateWithTax?.restaurantSale ??
              org?.configurations?.[0]?.addRateWithTax?.sale ??
              true;

            const rate = addRateWithTax
              ? count > 0
                ? Math.round(
                    (total * 100) / (100 + el.igst),
                  ).toFixed(2)
                : "0.00"
              : count > 0
              ? ((total - totalTax) / count).toFixed(2)
              : "0.00";

            const amount = Math.round(
              Number(rate) * count,
            ).toFixed(2);

            return (
              <div key={index} style={itemGrid}>
                <div style={textLeft}>{index + 1}</div>
                <div
                  style={{
                    ...textLeft,
                    wordBreak: "break-word",
                  }}
                >
                  {el.product_name}
                </div>
                <div style={centerText}>{count}</div>
                <div style={textRight}>{rate}</div>
                <div style={textRight}>{amount}</div>
              </div>
            );
          })}

          <div
            style={{
              borderBottom: "1px dotted #000",
              margin: "6px 0",
            }}
          />

          {/* Totals */}
          <div style={{ fontSize: "10px", marginBottom: "4px" }}>
            <div
              style={{
                ...flexRow,
                marginBottom: "2px",
                fontWeight: "bold",
              }}
            >
              <div style={{ marginLeft: "auto", width: "60px" }}>
                Amount
              </div>
              <div style={textRight}>
                {Math.round(subTotal).toFixed(2)}
              </div>
            </div>

            {getPaymentSummary() && (
              <div style={{ ...bold }}>Payment: {getPaymentSummary()}</div>
            )}

            {isIndian &&
              isSameState &&
              calculateTotalTax() > 0 &&
              (() => {
                const entries = Object.entries(cgstGroups);

                if (entries.length === 0) {
                  return (
                    <>
                      <div style={flexRow}>
                        <div
                          style={{
                            marginLeft: "auto",
                            width: "70px",
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
                            width: "70px",
                            fontWeight: "bold",
                          }}
                        >
                          SGST {sgstPercentage}%
                        </div>
                        <div style={textRight}>{cgst}</div>
                      </div>
                    </>
                  );
                }

                return entries.map(
                  ([rate, { cgstAmt, sgstAmt, sgstRate }]) => (
                    <div key={rate}>
                      <div style={flexRow}>
                        <div
                          style={{
                            marginLeft: "auto",
                            width: "70px",
                            fontWeight: "bold",
                          }}
                        >
                          CGST {rate}%
                        </div>
                        <div style={textRight}>
                          {cgstAmt.toFixed(2)}
                        </div>
                      </div>
                      <div style={flexRow}>
                        <div
                          style={{
                            marginLeft: "auto",
                            width: "70px",
                            fontWeight: "bold",
                          }}
                        >
                          SGST {sgstRate}%
                        </div>
                        <div style={textRight}>
                          {sgstAmt.toFixed(2)}
                        </div>
                      </div>
                    </div>
                  ),
                );
              })()}

            {isIndian &&
              !isSameState &&
              calculateTotalTax() > 0 && (
                <div style={flexRow}>
                  <div
                    style={{
                      marginLeft: "auto",
                      width: "70px",
                      fontWeight: "bold",
                    }}
                  >
                    IGST {igstPercentage}%
                  </div>
                  <div style={textRight}>{tax}</div>
                </div>
              )}

            {!isIndian && calculateTotalTax() > 0 && (
              <div style={flexRow}>
                <div
                  style={{
                    marginLeft: "auto",
                    width: "70px",
                    fontWeight: "bold",
                  }}
                >
                  Tax {igstPercentage}%
                </div>
                <div style={textRight}>{tax}</div>
              </div>
            )}
          </div>

          <div
            style={{
              borderBottom: "1px dotted #000",
              margin: "6px 0",
            }}
          />

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

          <div
            style={{
              borderBottom: "1px dotted #000",
              margin: "6px 0",
            }}
          />

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
          <button
            className="px-3 py-1 rounded-lg bg-gray-500 text-white font-medium hover:bg-gray-600 active:scale-95 transition"
            onClick={handlePrint}
          >
            Print
          </button>
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
