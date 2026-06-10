/* eslint-disable react/prop-types */
import { useEffect, useState, useRef } from "react";
import { useSelector } from "react-redux";
import { defaultPrintSettings } from "../../../../../utils/defaultConfigurations";
import { useLocation, useParams } from "react-router-dom";
import { useReactToPrint } from "react-to-print";
import TitleDiv from "@/components/common/TitleDiv";
import Swal from "sweetalert2";
import api from "@/api/api";
import html2canvas from "html2canvas";
import { jsPDF } from "jspdf";

function VoucherThreeInchPdfFormat2({ data, org, isPreview, sendToParent }) {
  const [subTotal, setSubTotal] = useState(0);
  const isConfirmingRef = useRef(false);
  const [isConfirming, setIsConfirming] = useState(false);
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
  // const isIndian = useSelector(
  //   (state) =>
  //     state?.secSelectedOrganization?.secSelectedOrg?.country === "India",
  // );
  const isIndian = true;
  const party = data?.party;

  // ✅ FIX: Proper isSameState logic
  const isSameState =
    org?.state?.toLowerCase() === party?.state?.toLowerCase() || !party?.state;

  const voucherType = data?.voucherType;
  const discountBasedOnGrossAmount =
    org?.configurations?.[0]?.discountBasedOnGrossAmount ?? false;

  const includeTaxWithPrint =
    org?.configurations?.[0]?.defaultPrint?.showPrintWithTaxInRestaurant;

  // ✅ FIX: Read emailBillSizeA5 from org config — was missing before (caused ReferenceError)
  const emailBillSizeA5 =
    org?.configurations?.[0]?.defaultPrint?.emailBillSizeA5 ?? false;

  // Derived: is wide format (A4 or A5) vs thermal 3-inch roll
  const isWideFormat = emailBillSizeA5; // A5=true, A4=false (both wider than thermal)
  const emailPaperFormat = emailBillSizeA5 ? "a5" : "a4";
  const emailPageWidth = emailBillSizeA5 ? 148 : 210; // mm
  const emailPageHeight = emailBillSizeA5 ? 210 : 297; // mm
  const emailWindowWidth = emailBillSizeA5 ? 560 : 794; // px (for html2canvas)
  const emailMargin = emailBillSizeA5 ? 6 : 10; // mm

  const getVoucherNumber = () => {
    if (!voucherType) return "";
    if (voucherType === "sales" || voucherType === "vanSale")
      return "salesNumber";
    if (voucherType === "saleOrder") return "orderNumber";
    return voucherType + "Number";
  };

  useEffect(() => {
    if (!data?.items?.length) return;

    const discountValue = Number(data?.additionalCharges?.[0]?.finalValue || 0);

    console.log(data);
    const taxableSubTotal = data.items.reduce(
      (acc, curr) =>
        acc +
        Number(
          curr?.GodownList?.[0]?.taxableAmount ?? curr?.taxableAmount ?? 0,
        ),
      0,
    );

    const finalSubTotal = taxableSubTotal - discountValue;
    console.log(taxableSubTotal);
    setSubTotal(Number(finalSubTotal.toFixed(2)));
  }, [data, discountBasedOnGrossAmount]);

  const getItemTaxableAfterDiscount = (item, totalDiscount, grossAmount) => {
    const lineGross = Number(item.total || 0);
    const totalTax = Number(item.totalIgstAmt || 0);
    const lineBeforeTax = lineGross - totalTax;
    const lineDiscount =
      grossAmount > 0 ? (lineBeforeTax / grossAmount) * totalDiscount : 0;
    return lineBeforeTax - lineDiscount;
  };

  const calculateTotalTaxWithDiscountLogic = () => {
    if (!data?.items?.length) return 0;

    const totalDiscount =
      Number(
        data?.totalAdditionalCharges ||
          data?.additionalCharges?.[0]?.finalValue,
      ) || 0;

    const grossTaxable = data.items.reduce((acc, item) => {
      const lineTax = Number(item.totalIgstAmt || 0);
      const lineBeforeTax = Number(item.total || 0) - lineTax;
      return acc + lineBeforeTax;
    }, 0);

    const isInterState = !isSameState;

    const totalTax = data.items.reduce((acc, item) => {
      const taxableAfterDiscount = getItemTaxableAfterDiscount(
        item,
        totalDiscount,
        grossTaxable,
      );
      if (isInterState) {
        const igstRate = Number(item.igst || 0);
        return acc + (taxableAfterDiscount * igstRate) / 100;
      }
      const cgstRate = Number(item.cgst || 0);
      const sgstRate = Number(item.sgst || 0);
      return (
        acc +
        (taxableAfterDiscount * cgstRate) / 100 +
        (taxableAfterDiscount * sgstRate) / 100
      );
    }, 0);

    return Number(totalTax.toFixed(2));
  };

  const calculateTotalTax = () =>
    discountBasedOnGrossAmount
      ? Number(
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
        )
      : calculateTotalTaxWithDiscountLogic();

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
    if (!hasCheckIn && !roomNo) return null;
    return `Room: ${roomNo}`;
  };

  const getFoodPlan = () => {
    const hasCheckIn = data?.voucherNumber?.[0]?.checkInNumber;
    const foodPlanArray = data?.roomDetails?.foodPlanDetails;
    if (!hasCheckIn && !Array.isArray(foodPlanArray)) return null;
    const names = foodPlanArray?.map((item) => item.planType).join(", ");

    return names?.length > 0 ? `Food Paln: ${names}` : null;
  };

  const netAmount = Math.round(Number(data?.finalAmount || 0)).toFixed(2);
  const discount = Number(
    data?.totalAdditionalCharges ||
      data?.additionalCharges?.[0]?.finalValue ||
      0,
  ).toFixed(2);

  const tax = Math.round(calculateTotalTax()).toFixed(2);
  const cgst = (calculateTotalTax() / 2).toFixed(2);
  // ✅ FIX: sgst was incorrectly showing cgst value before
  const sgst = (calculateTotalTax() / 2).toFixed(2);

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

  // ✅ FIX: handlePrint now uses dynamic @page size
  // Thermal (Print button) always stays 80mm; A4/A5 only applies to Share → Email PDF
  const handlePrint = useReactToPrint({
    content: () => contentToPrint.current,
    pageStyle: `
      @page {
        size: 80mm auto;
        margin: 0;
      }
      html, body {
        margin: 0 !important;
        padding: 0 !important;
      }
      .receipt-container {
        width: 72mm !important;
        margin: 0 auto !important;
        padding: 2mm 3mm !important;
        box-sizing: border-box;
      }
    `,
  });

  // ✅ FIX: generateReceiptPDFAsBase64 now uses dynamic config values
  const generateReceiptPDFAsBase64 = async () => {
    const element = contentToPrint.current;
    if (!element) throw new Error("Receipt element not found");

    const originalWidth = element.style.width;
    const originalMargin = element.style.margin;

    // Temporarily resize element to match paper width
    element.style.width = `${emailPageWidth}mm`;
    element.style.margin = "0";

    const canvas = await html2canvas(element, {
      scale: 2,
      useCORS: true,
      backgroundColor: "#ffffff",
      logging: false,
      windowWidth: emailWindowWidth,
    });

    // Restore original size
    element.style.width = originalWidth;
    element.style.margin = originalMargin;

    const imgData = canvas.toDataURL("image/png");
    const availableWidth = emailPageWidth - emailMargin * 2;
    const availableHeight = emailPageHeight - emailMargin * 2;
    const imgAspectRatio = canvas.height / canvas.width;
    const imgRenderedHeight = availableWidth * imgAspectRatio;

    const doc = new jsPDF({
      orientation: "portrait",
      unit: "mm",
      format: emailPaperFormat, // ✅ "a4" or "a5" from settings
    });

    if (imgRenderedHeight <= availableHeight) {
      const topOffset = emailMargin + (availableHeight - imgRenderedHeight) / 2;
      doc.addImage(
        imgData,
        "PNG",
        emailMargin,
        topOffset,
        availableWidth,
        imgRenderedHeight,
      );
    } else {
      const scaledHeight = availableHeight;
      const scaledWidth =
        availableWidth * (availableHeight / imgRenderedHeight);
      const leftOffset = emailMargin + (availableWidth - scaledWidth) / 2;
      doc.addImage(
        imgData,
        "PNG",
        leftOffset,
        emailMargin,
        scaledWidth,
        scaledHeight,
      );
    }

    return new Promise((resolve) => {
      const blob = doc.output("blob");
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result.split(",")[1]);
      reader.readAsDataURL(blob);
    });
  };

  const handleShareBill = async (option, message, ccEmails, toEmail) => {
    if (option === "WhatsApp") {
      const encodedText = encodeURIComponent(message);
      window.open(`https://wa.me/?text=${encodedText}`, "_blank");
      return true;
    }
    if (option === "Mail") {
      const pdfBase64 = await generateReceiptPDFAsBase64();
      if (!pdfBase64) throw new Error("Failed to generate receipt PDF");
      const billNo = getBillNumber();
      const res = await api.post(
        "/api/sUsers/send-bill-email",
        {
          toEmail,
          ccEmails,
          message,
          billNo,
          guestName: data?.party?.partyName || data?.customerName || "Customer",
          organizationName: org?.name,
          pdfBase64,
          pdfFileName: `Receipt-${billNo}.pdf`,
        },
        { withCredentials: true },
      );
      if (!res.data?.success)
        throw new Error(res.data?.message || "Failed to send email");
      return true;
    }
  };

  const handleShareClick = async () => {
    const billNo = getBillNumber();
    const tableNo = getTableNumber();
    const roomNo = getRoomNumber();
    const orgName = org?.name || "";
    const orgPhone = org?.mobile || "";
    const itemsList =
      data?.items
        ?.map(
          (el, i) =>
            `  ${i + 1}. ${el.product_name} x${el.totalCount || 1} = ₹${Number(el.total || 0).toFixed(2)}`,
        )
        .join("\n") || "";

    const defaultMessage = `Dear Customer,

Thank you for dining at ${orgName}!

Your Bill Summary:
  Bill No    : ${billNo}
  ${tableNo ? `Table      : ${tableNo}` : ""}
  ${roomNo ? `${roomNo}` : ""}
  Date       : ${new Date(data?.Date || data?.createdAt).toLocaleDateString("en-GB")}

Items:
${itemsList}

  Gross      : ₹${subTotal?.toFixed(2)}
  Tax        : ₹${tax}
  Net Amount : ₹${netAmount}

We look forward to serving you again!

${orgPhone ? `Contact: ${orgPhone}` : ""}

Warm Regards,
${orgName}`;

    const { value: option } = await Swal.fire({
      title: "Share through",
      input: "radio",
      inputOptions: { WhatsApp: "WhatsApp", Mail: "Mail" },
      confirmButtonText: "Next",
      confirmButtonColor: "#000000",
      showCancelButton: true,
      cancelButtonText: "Cancel",
      cancelButtonColor: "#dd3333",
      inputValidator: (v) => !v && "Please select an option!",
    });

    if (!option) return;

    let toEmail = "";
    let ccEmails = [];

    if (option === "Mail") {
      const { value: emailData, isDismissed } = await Swal.fire({
        title: "Email Details",
        html: `
          <div style="text-align:left; padding:10px;">
            <label style="display:block; margin-bottom:6px; font-weight:bold; font-size:14px;">
              To Email <span style="color:red;">*</span>
            </label>
            <input id="swal-to" type="email" class="swal2-input"
              placeholder="customer@example.com" style="width:95%; margin:0 0 14px 0;" />
            <label style="display:block; margin-bottom:6px; font-weight:bold; font-size:14px;">
              CC Emails <span style="color:gray; font-weight:normal;">(Optional)</span>
            </label>
            <input id="swal-cc" type="text" class="swal2-input"
              placeholder="cc1@example.com, cc2@example.com" style="width:95%; margin:0;" />
            <small style="color:gray; display:block; margin-top:6px;">
              💡 Separate multiple CC emails with commas
            </small>
          </div>
        `,
        showCancelButton: true,
        cancelButtonColor: "#dd3333",
        confirmButtonText: "Next",
        confirmButtonColor: "#000000",
        width: "540px",
        focusConfirm: false,
        preConfirm: () => {
          const to = document.getElementById("swal-to").value.trim();
          const cc = document.getElementById("swal-cc").value.trim();
          const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
          if (!to) {
            Swal.showValidationMessage("Please enter recipient email");
            return false;
          }
          if (!emailRegex.test(to)) {
            Swal.showValidationMessage("Please enter a valid email address");
            return false;
          }
          if (cc) {
            const invalid = cc
              .split(",")
              .map((e) => e.trim())
              .filter((e) => e && !emailRegex.test(e));
            if (invalid.length) {
              Swal.showValidationMessage(
                `Invalid CC email(s): ${invalid.join(", ")}`,
              );
              return false;
            }
          }
          return { to, cc };
        },
      });

      if (isDismissed || !emailData) return;
      toEmail = emailData.to;
      ccEmails = emailData.cc
        ? emailData.cc
            .split(",")
            .map((e) => e.trim())
            .filter(Boolean)
        : [];
    }

    const { value: finalMessage, isDismissed: msgDismissed } = await Swal.fire({
      title: "Compose Message",
      html: `
        <div style="text-align:left; padding:10px;">
          <label style="display:block; margin-bottom:6px; font-weight:bold; font-size:14px;">
            Message <span style="color:red;">*</span>
          </label>
          <textarea id="swal-message" class="swal2-textarea"
            style="width:95%; height:280px; padding:10px; font-size:13px; resize:vertical;"
          >${defaultMessage}</textarea>
        </div>
      `,
      showCancelButton: true,
      cancelButtonColor: "#dd3333",
      confirmButtonText: "Send",
      confirmButtonColor: "#000000",
      width: "660px",
      focusConfirm: false,
      preConfirm: () => {
        const msg = document.getElementById("swal-message").value;
        if (!msg?.trim()) {
          Swal.showValidationMessage("Please enter a message");
          return false;
        }
        return msg;
      },
    });

    if (msgDismissed || !finalMessage) return;

    Swal.fire({
      title: option === "Mail" ? "Sending Email..." : "Opening WhatsApp...",
      html: `
        <div style="text-align:center; padding:16px;">
          <p>Please wait...</p>
          ${option === "Mail" && toEmail ? `<p style="color:gray; font-size:13px; margin-top:8px;">To: ${toEmail}</p>` : ""}
          ${ccEmails.length ? `<p style="color:gray; font-size:13px;">CC: ${ccEmails.join(", ")}</p>` : ""}
        </div>
      `,
      allowOutsideClick: false,
      didOpen: () => Swal.showLoading(),
    });

    try {
      await handleShareBill(option, finalMessage, ccEmails, toEmail);
      Swal.fire({
        icon: "success",
        title: "Success!",
        text:
          option === "Mail" ? "Email sent successfully!" : "WhatsApp opened!",
        confirmButtonColor: "#000000",
      });
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "Error",
        text: error.message || "Failed to share. Please try again.",
        confirmButtonColor: "#000000",
      });
    }
  };

  // ✅ FIX: containerStyle stays thermal (72mm) always — width only changes temporarily
  // inside generateReceiptPDFAsBase64 for PDF capture
  const containerStyle = {
    width: "72mm",
    margin: "0 auto",
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
    gridTemplateColumns: "0.6fr 2.2fr 0.7fr 1fr 1.1fr",
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

  const paymentSplits = data?.paymentSplittingData || [];
  const prettyType = (type) => {
    console.log("type", type);
    if (!type) return "";
    const map = { cash: "Cash", upi: "UPI", card: "Card", bank: "Bank" };
    return map[type] || type.toUpperCase();
  };

  const getPaymentSummary = () => {
    if (!paymentSplits.length) return null;
    return paymentSplits
      .filter((p) => p.amount > 0)
      .map((p) => (
        <>
          <div key={p.type} style={{ fontSize: "10px", fontWeight: "bold" }}>
            {p.subsource} : ₹ {Math.round(p.amount).toFixed(2)}
          </div>
          {p?.credit_reference_type && (
            <div key={p.type} style={{ fontSize: "10px", fontWeight: "bold" }}>
              Party : {p?.credit_reference_type}{" "}
              {p?.creditor_gst && `(${p.creditor_gst})`}
            </div>
          )}
        </>
      ));
  };

  return (
    <>
      {/* ✅ FIX: @page CSS is now dynamic — thermal for Print button, A4/A5 is handled
          inside generateReceiptPDFAsBase64 via jsPDF format, not via @page */}
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
                  { hour: "2-digit", minute: "2-digit", hour12: false },
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
            {data?.party?.partyName && (
              <div style={{ marginTop: "2px" }}>
                <span style={{ textTransform: "capitalize" }}>Guest : </span>
                <span style={{ textTransform: "capitalize" }}>
                  {data?.party?.partyName}
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
            const IsComplimentary = data?.isComplimentary;
            const total = Number(el?.total || 0);
            const count = Number(el?.totalCount || 1);
            const totalTax = IsComplimentary
              ? 0
              : el?.totalIgstAmt != null
                ? Number(el.totalIgstAmt)
                : Number(el?.totalCgstAmt || 0) + Number(el?.totalSgstAmt || 0);
            const igst = IsComplimentary ? 0 : Number(el?.igst || 0);
            console.log(igst);
            const addRateWithTax =
              org?.configurations?.[0]?.addRateWithTax?.restaurantSale;
            const addRate = addRateWithTax
              ? count > 0
                ? ((total * 100) / (100 + igst) / count).toFixed(2)
                : "0.00"
              : count > 0
                ? ((total - totalTax) / count).toFixed(2)
                : "0.00";
            const rate = includeTaxWithPrint
              ? count > 0
                ? (
                    Number(addRate) + Number((totalTax / count).toFixed(2))
                  ).toFixed(2)
                : "0.00"
              : addRate;
            const amount = (Number(rate) * count).toFixed(2);

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
          <div
            style={{
              fontSize: "10px",
              marginBottom: "4px",
              display: "flex",
              flexDirection: "row",
            }}
          >
            <div style={{ flex: 1 }}>{getPaymentSummary()}</div>
            <div style={{ flex: 1 }}>
              {!discountBasedOnGrossAmount && Number(discount) > 0 && (
                <>
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
                      SubTotal
                    </div>
                    <div style={{ width: 60, textAlign: "right" }}>
                      {(Number(subTotal || 0) + Number(discount || 0)).toFixed(
                        2,
                      )}
                    </div>
                  </div>
                  {Number(discount) > 0 && (
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
                        Discount
                      </div>
                      <div style={{ width: 60, textAlign: "right" }}>
                        {discount}
                      </div>
                    </div>
                  )}
                </>
              )}

              {/* Gross Amount */}
              {!data?.isComplimentary && (
                <>
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
                        width: 80,
                        textAlign: "right",
                      }}
                    >
                      Gross Amount
                    </div>
                    <div style={{ width: 60, textAlign: "right" }}>
                      {subTotal?.toFixed(2)}
                    </div>
                  </div>

                  {(org?.industry == 7
                    ? calculateTotalTax() > 0
                    : isIndian && isSameState && calculateTotalTax() > 0) && (
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

                        <div style={textRight}>{sgst}</div>
                      </div>
                    </>
                  )}
                </>
              )}
              {/* IGST (inter-state) */}
              {!org?.industry == 7 &&
                isIndian &&
                !isSameState &&
                calculateTotalTax() > 0 && (
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

              {/* Non-Indian tax */}
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

            {/* {Number(discount) > 0 && ( */}
            <div
              style={{
                ...flexRow,
                justifyContent: "flex-end",
                paddingRight: "3px",
                fontWeight: "bold",
              }}
            >
              {discountBasedOnGrossAmount && Number(discount) && (
                <>
                  Discount: <span style={bold}>{discount || "0.00"}</span>
                </>
              )}
            </div>
            {/* )} */}
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
          {isFinalized && (
            <button
              className="px-3 py-1 rounded-lg bg-black text-white font-medium hover:bg-green-600 active:scale-95 transition"
              onClick={handleShareClick}
            >
              Share
            </button>
          )}
          {isPreview && (
            <>
              <button
                className="px-3 py-1 rounded-lg bg-blue-500 text-white font-medium hover:bg-blue-600 active:scale-95 transition disabled:opacity-60 disabled:cursor-not-allowed flex items-center gap-1.5"
                disabled={isConfirming}
                onClick={() => {
                  // ref check fires instantly — blocks before re-render
                  if (isConfirmingRef.current) return;
                  isConfirmingRef.current = true;
                  setIsConfirming(true);
                  sendToParent(true);
                }}
              >
                {isConfirming ? (
                  <>
                    <svg
                      className="animate-spin h-4 w-4 text-white"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      />
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8v8H4z"
                      />
                    </svg>
                    Confirming...
                  </>
                ) : (
                  "Confirm"
                )}
              </button>

              <button
                className="px-3 py-1 rounded-lg bg-red-400 text-gray-800 font-medium hover:bg-red-500 active:scale-95 transition disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={isConfirming}
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
