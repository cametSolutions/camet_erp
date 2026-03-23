import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";

// ─── Layout Constants ────────────────────────────────────────────────────────
const MARGIN = 10;
const HEADER_HEIGHT = 42; // height reserved at top of every continuation page
const FOOTER_HEIGHT = 38; // height reserved at bottom of every page

// ─── Helpers ─────────────────────────────────────────────────────────────────
const getBase64FromUrl = async (url) => {
  if (!url) return null;
  try {
    const res = await fetch(url);
    const blob = await res.blob();
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result);
      reader.onerror = () => reject(new Error("Failed to read image"));
      reader.readAsDataURL(blob);
    });
  } catch (err) {
    console.error("Failed to fetch image:", url, err);
    return null;
  }
};

// ─── Header ──────────────────────────────────────────────────────────────────
// Returns the Y coordinate right after the header divider line
const drawHeader = async (doc, billData, base64Logo) => {
  const pageWidth = doc.internal.pageSize.width;
  const startY = MARGIN;

  // Logo – left side
  if (base64Logo) {
    try {
      doc.addImage(base64Logo, "PNG", MARGIN, startY, 28, 28);
    } catch (_) {}
  }

  // Hotel info – right side
  const rightX = pageWidth - MARGIN;
  let y = startY + 3;

  doc.setFontSize(13);
  doc.setFont("helvetica", "bold");
  doc.text((billData?.hotel?.name || "").toUpperCase(), rightX, y, {
    align: "right",
  });
  y += 5;

  doc.setFontSize(7.5);
  doc.setFont("helvetica", "normal");

  const addressParts = (billData?.hotel?.address || "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);

  const infoLines = [
    ...addressParts,
    `Phone: ${billData?.hotel?.phone || ""}`,
    `E-mail: ${billData?.hotel?.email || ""}  |  Website: ${billData?.hotel?.website || ""}`,
    `PAN NO: ${billData?.hotel?.pan || ""}  |  GSTIN: ${billData?.hotel?.gstin || ""}`,
    `SAC CODE - ${billData?.hotel?.sacCode || ""}`,
  ].filter(Boolean);

  // Keep text away from logo on the left
  const maxW = rightX - (MARGIN + 30 + 6); // full width minus logo zone

  infoLines.forEach((line) => {
    const wrapped = doc.splitTextToSize(line, maxW);
    wrapped.forEach((wl) => {
      doc.text(wl, rightX, y, { align: "right" });
      y += 3.2;
    });
  });

  // Divider
  const endY = Math.max(y + 1, startY + 32);
  doc.setDrawColor(0);
  doc.setLineWidth(0.4);
  doc.line(MARGIN, endY, pageWidth - MARGIN, endY);

  return endY + 3; // content starts here
};

// ─── Footer ───────────────────────────────────────────────────────────────────
// Drawn at a fixed position from the bottom; accepts final page count so we can
// write "Page X of Y" correctly.
const drawFooter = (doc, pageInBill, totalPagesInBill) => {
  const pageWidth = doc.internal.pageSize.width;
  const pageHeight = doc.internal.pageSize.height;

  const contentW = pageWidth - 2 * MARGIN;
  const halfW = contentW / 2;
  const thirdW = contentW / 3;

  // ── Row 1: disclaimer strip (height 10) ──────────────────────────────────
  const row1H = 10;
  const row1Y = pageHeight - FOOTER_HEIGHT;

  doc.setDrawColor(0);
  doc.setLineWidth(0.3);
  // outer rect
  doc.rect(MARGIN, row1Y, contentW, row1H);
  // vertical divider at midpoint
  doc.line(MARGIN + halfW, row1Y, MARGIN + halfW, row1Y + row1H);

  doc.setFontSize(7);
  doc.setFont("helvetica", "bold");
  doc.text(
    "Please Deposit Your Room and Locker Keys",
    MARGIN + 2,
    row1Y + 4
  );

  doc.setFont("helvetica", "normal");
  const disclaimer = doc.splitTextToSize(
    "Regardless of charge instructions, I agree to be held personally liable for the payment of total amount of bill. Please collect receipt if you have paid cash.",
    halfW - 4
  );
  doc.text(disclaimer, MARGIN + halfW + 2, row1Y + 3);

  // ── Row 2: signature strip (height 15) ───────────────────────────────────
  const row2H = 15;
  const row2Y = row1Y + row1H;

  doc.rect(MARGIN, row2Y, contentW, row2H);
  // two vertical dividers → three equal columns
  doc.line(MARGIN + thirdW, row2Y, MARGIN + thirdW, row2Y + row2H);
  doc.line(MARGIN + 2 * thirdW, row2Y, MARGIN + 2 * thirdW, row2Y + row2H);

  doc.setFont("helvetica", "bold");
  doc.setFontSize(7);
  doc.text("Prepared By", MARGIN + 2, row2Y + 4);
  doc.text("Manager", MARGIN + thirdW + 2, row2Y + 4);
  doc.text("Guest Signature & Date", MARGIN + 2 * thirdW + 2, row2Y + 4);

  doc.setFont("helvetica", "normal");
  doc.text("FO", MARGIN + 2, row2Y + 12);

  // ── Row 3: closing strip (height 8) ──────────────────────────────────────
  const row3H = 8;
  const row3Y = row2Y + row2H;

  doc.rect(MARGIN, row3Y, contentW, row3H);
  // vertical divider 30 mm from right
  doc.line(pageWidth - MARGIN - 30, row3Y, pageWidth - MARGIN - 30, row3Y + row3H);

  doc.setFont("helvetica", "italic");
  doc.setFontSize(7);
  doc.text(
    "We hope you enjoyed your stay and would like to welcome you back...",
    MARGIN + 2,
    row3Y + 5
  );

  doc.setFont("helvetica", "normal");
  doc.text("Original Bill", pageWidth - MARGIN - 15, row3Y + 3, { align: "center" });
  doc.text(
    `Page ${pageInBill} of ${totalPagesInBill}`,
    pageWidth - MARGIN - 15,
    row3Y + 6.5,
    { align: "center" }
  );
};

// ─── Guest Info Block ─────────────────────────────────────────────────────────
const drawGuestInfo = (doc, billData, startY) => {
  const pageWidth = doc.internal.pageSize.width;
  const contentW = pageWidth - 2 * MARGIN;
  const blockH = 38;

  doc.setDrawColor(0);
  doc.setLineWidth(0.3);
  doc.rect(MARGIN, startY, contentW, blockH);

  // Two columns: left 58 %, right 42 %
  const leftW = contentW * 0.58;
  const lx = MARGIN + 2;        // text start – left col
  const rx = MARGIN + leftW + 2; // text start – right col
  const labelW = 20;             // label column width
  const labelWR = 22;

  let ly = startY + 4.5;
  let ry = startY + 4.5;
  const ls = 4.5; // line spacing

  const cell = (x, y, label, value, lw = labelW) => {
    doc.setFont("helvetica", "bold");
    doc.setFontSize(8);
    doc.text(label, x, y);
    doc.setFont("helvetica", "normal");
    doc.text(`: ${value || ""}`, x + lw, y);
  };

  // Row 1
  cell(lx, ly, "GRC No", billData?.guest?.grcNo || "");
  cell(rx, ry, "Bill No", billData?.guest?.billNo || "", labelWR);
  ly += ls; ry += ls;

  // Row 2
  cell(lx, ly, "GUEST", billData?.guest?.name || "");
  cell(rx, ry, "Date", billData?.stay?.billDate || "", labelWR);
  ly += ls; ry += ls;

  // Row 3 – Address (may wrap) + Arrival
  doc.setFont("helvetica", "bold");
  doc.text("Address", lx, ly);
  doc.setFont("helvetica", "normal");
  const addrMaxW = leftW - labelW - 6;
  const addrLines = doc.splitTextToSize(`: ${billData?.guest?.address || ""}`, addrMaxW);
  doc.text(addrLines, lx + labelW, ly);
  cell(rx, ry, "Arrival", billData?.stay?.arrival || "", labelWR);
  const addrH = Math.max(addrLines.length * 3.5, ls);
  ly += addrH; ry += ls;

  // Row 4
  cell(lx, ly, "Phone", billData?.guest?.phone || "");
  cell(rx, ry, "Departure", billData?.stay?.departure || "", labelWR);
  ly += ls; ry += ls;

  // Row 5
  cell(lx, ly, "Room No", billData?.guest?.roomNo || "");
  cell(rx, ry, "Plan", `${billData?.stay?.plan || ""}  Pax ${billData?.stay?.pax || ""}`, labelWR);
  ly += ls; ry += ls;

  // Row 6 – conditional GST / Travel Agent  +  Tariff
  if (billData?.guest?.gstNo) {
    cell(lx, ly, "GST No", billData?.guest?.gstNo || "");
  } else if (billData?.guest?.travelAgent) {
    cell(lx, ly, "Travel Agent", billData?.guest?.travelAgent || "", 24);
  }
  cell(rx, ry, "Tariff", String(billData?.stay?.tariff || ""), labelWR);
  ly += ls; ry += ls;

  // Row 7 – Company (if GST) + No. of Days
  if (billData?.guest?.gstNo && billData?.guest?.companyName) {
    cell(lx, ly, "Company", billData?.guest?.companyName || "", 22);
  }
  cell(rx, ry, "No. of Days", String(billData?.stay?.days || ""), labelWR);

  return startY + blockH + 4;
};

// ─── Charges Table ────────────────────────────────────────────────────────────
const drawChargesTable = async (doc, billData, startY, base64Logo, billStartPage) => {
  const pageWidth = doc.internal.pageSize.width;

  await new Promise((resolve) => {
    autoTable(doc, {
      head: [["Date", "Doc No", "Description", "Amount", "Taxes", "Advance", "Balance"]],
      body: (billData?.charges || []).map((c) => [
        c.date || "",
        c.docNo || "",
        c.description || "",
        c.amount !== undefined ? Number(c.amount || 0).toFixed(2) : "",
        c.taxes !== "" && c.taxes !== undefined ? String(c.taxes) : "",
        c.advance || "",
        c.balance || "",
      ]),
      startY,
      margin: {
        left: MARGIN,
        right: MARGIN,
        top: HEADER_HEIGHT + 5,
        bottom: FOOTER_HEIGHT + 5,
      },
      tableWidth: pageWidth - 2 * MARGIN,
      styles: {
        fontSize: 7.5,
        cellPadding: 1.8,
        lineColor: [0, 0, 0],
        lineWidth: 0.2,
        textColor: [0, 0, 0],
        overflow: "linebreak",
      },
      headStyles: {
        fillColor: [245, 245, 245],
        textColor: [0, 0, 0],
        fontStyle: "bold",
        halign: "left",
        fontSize: 7.5,
      },
      columnStyles: {
        0: { cellWidth: 20, halign: "left" },
        1: { cellWidth: 22, halign: "center" },
        2: { cellWidth: "auto", halign: "left" },
        3: { cellWidth: 22, halign: "right" },
        4: { cellWidth: 18, halign: "right" },
        5: { cellWidth: 20, halign: "right" },
        6: { cellWidth: 22, halign: "right" },
      },
      didParseCell: (data) => {
        if (data.section !== "body") return;
        const desc = data.row.raw?.[2] || "";
        if (data.column.index === 2) {
          if (desc.includes("CGST") || desc.includes("SGST")) {
            data.cell.styles.fillColor = [248, 248, 248];
            data.cell.styles.textColor = [80, 80, 80];
          }
          if (desc === "Advance" || desc === "CheckOut") {
            data.cell.styles.fontStyle = "bold";
          }
          if (desc.startsWith("Restaurant") || desc.startsWith("Room Service")) {
            data.cell.styles.fontStyle = "bold";
          }
        }
        // highlight advance row
        if (desc === "Advance" || desc === "CheckOut") {
          data.cell.styles.fillColor = [255, 255, 240];
        }
      },
      didDrawPage: async (data) => {
        const currentPage = doc.internal.getCurrentPageInfo().pageNumber;
        // On continuation pages: draw header again
        if (currentPage > billStartPage) {
          await drawHeader(doc, billData, base64Logo);
        }
        // Draw footer placeholder on every page (page numbers fixed later)
        drawFooter(doc, 1, 1);
      },
    });
    resolve();
  });

  return doc.lastAutoTable.finalY + 4;
};

// ─── Summary + Payment tables ─────────────────────────────────────────────────
const drawSummaryAndPayment = (doc, billData, startY, isForPreview, paymentModeDetails) => {
  const pageWidth = doc.internal.pageSize.width;
  const contentW = pageWidth - 2 * MARGIN;
  const halfW = (contentW - 4) / 2;

  // ── Summary rows ─────────────────────────────────────────────────────────
  const summaryRows = [];

  summaryRows.push([
    "Room Rent",
    Number(billData?.summary?.roomRent || 0).toLocaleString("en-IN", { minimumFractionDigits: 2 }),
  ]);

  if (Number(billData?.summary?.foodPlan || 0) > 0) {
    summaryRows.push([
      "Food Plan",
      Number(billData.summary.foodPlan).toLocaleString("en-IN", { minimumFractionDigits: 2 }),
    ]);
  }

  if (Number(billData?.summary?.sgst || 0) > 0) {
    summaryRows.push([
      "SGST on Rent",
      Number(billData.summary.sgst).toLocaleString("en-IN", { minimumFractionDigits: 2 }),
    ]);
  }

  if (Number(billData?.summary?.cgst || 0) > 0) {
    summaryRows.push([
      "CGST on Rent",
      Number(billData.summary.cgst).toLocaleString("en-IN", { minimumFractionDigits: 2 }),
    ]);
  }

  if (Number(billData?.summary?.restaurant || 0) > 0) {
    summaryRows.push([
      "Dine-In",
      Number(billData.summary.restaurant).toLocaleString("en-IN", { minimumFractionDigits: 2 }),
    ]);
  }

  if (Number(billData?.summary?.roomService || 0) > 0) {
    summaryRows.push([
      "Room Service",
      Number(billData.summary.roomService).toLocaleString("en-IN", { minimumFractionDigits: 2 }),
    ]);
  }

  if (Number(billData?.summary?.otherChargeAmount || 0) > 0) {
    summaryRows.push([
      "Other Charges",
      Number(billData.summary.otherChargeAmount).toLocaleString("en-IN", { minimumFractionDigits: 2 }),
    ]);
  }

  summaryRows.push([
    { content: "Total", styles: { fontStyle: "bold", fillColor: [245, 245, 245] } },
    {
      content: Number(billData?.summary?.total || 0).toLocaleString("en-IN", { minimumFractionDigits: 2 }),
      styles: { fontStyle: "bold", fillColor: [245, 245, 245], halign: "right" },
    },
  ]);

  autoTable(doc, {
    head: [
      [
        { content: "Summary", styles: { fontStyle: "bold" } },
        { content: "Amount", styles: { fontStyle: "bold", halign: "right" } },
      ],
    ],
    body: summaryRows,
    startY,
    margin: { left: MARGIN, right: MARGIN + halfW + 4 },
    tableWidth: halfW,
    styles: {
      fontSize: 8,
      cellPadding: 2,
      lineColor: [0, 0, 0],
      lineWidth: 0.2,
      textColor: [0, 0, 0],
    },
    headStyles: {
      fillColor: [245, 245, 245],
      textColor: [0, 0, 0],
      fontStyle: "bold",
    },
    columnStyles: {
      0: { halign: "left" },
      1: { halign: "right" },
    },
  });

  // ── Payment rows ──────────────────────────────────────────────────────────
  const paymentBody = [];

  // Header-like row inside body
  paymentBody.push([
    { content: "PAYMODE", styles: { fontStyle: "bold" } },
    { content: "AMOUNT", styles: { fontStyle: "bold", halign: "center" } },
  ]);

  console.log(paymentModeDetails)
  // Payment mode details (array of { customerName, mode, amount })
  if (Array.isArray(paymentModeDetails) && paymentModeDetails.length > 0) {
    
    paymentModeDetails.forEach((item) => {
      paymentBody.push([
        `${item.customerName || ""} (${(item.mode || "").toUpperCase()})`,
        {
          content: Number(item.amount || 0).toLocaleString("en-IN", { minimumFractionDigits: 2 }),
          styles: { halign: "right" },
        },
      ]);
    });
  }

  // Total words
  paymentBody.push([
    {
      content: billData?.summary?.totalWords || "",
      colSpan: 2,
      styles: { fontSize: 7.5, fontStyle: "bold" },
    },
  ]);

  // Total / Advance / Net Pay section
  if (!isForPreview) {
    paymentBody.push(
      [
        { content: "Total ", styles: { fontStyle: "bold" } },
        {
          content: Number(billData?.payment?.total || 0).toFixed(2),
          styles: { fontStyle: "bold", halign: "right" },
        },
      ],
        [
        { content: "Total Advance ", styles: { fontStyle: "bold" } },
        {
          content: Number(billData?.payment?.advance || 0).toFixed(2),
          styles: { fontStyle: "bold", halign: "right" },
        },
      ],
      [
        { content: "Net Pay ", styles: { fontStyle: "bold" } },
        {
          content: Number(billData?.payment?.netPay || 0).toFixed(2),
          styles: { fontStyle: "bold", halign: "right" },
        },
      ]
    );
  } else {
    paymentBody.push(
      [
        "Total :",
        { content: Number(billData?.payment?.total || 0).toFixed(2), styles: { halign: "right" } },
      ],
      [
        "Less Advance:",
        { content: Number(billData?.payment?.advance || 0).toFixed(2), styles: { halign: "right" } },
      ],
      [
        { content: "Net Pay :", styles: { fontStyle: "bold" } },
        {
          content: Number(billData?.payment?.netPay || 0).toFixed(2),
          styles: { fontStyle: "bold", halign: "right" },
        },
      ]
    );
  }

  autoTable(doc, {
    head: [
      [
        { content: "Payment Details", colSpan: 2, styles: { fontStyle: "bold" } },
      ],
    ],
    body: paymentBody,
    startY,
    margin: { left: MARGIN + halfW + 4, right: MARGIN },
    tableWidth: halfW,
    styles: {
      fontSize: 8,
      cellPadding: 2,
      lineColor: [0, 0, 0],
      lineWidth: 0.2,
      textColor: [0, 0, 0],
    },
    headStyles: {
      fillColor: [245, 245, 245],
      textColor: [0, 0, 0],
      fontStyle: "bold",
    },
    columnStyles: {
      0: { halign: "left" },
      1: { halign: "right" },
    },
  });

  return Math.max(doc.lastAutoTable.finalY, startY) + 2;
};

// ─── Draw one complete bill ───────────────────────────────────────────────────
const drawSingleBill = async (
  doc,
  billData,
  isForPreview,
  paymentModeDetails,
  base64Logo
) => {
  const pageHeight = doc.internal.pageSize.height;
  const billStartPage = doc.internal.getCurrentPageInfo().pageNumber;

  // 1. Header
  let y = await drawHeader(doc, billData, base64Logo);

  // 2. Guest info block
  y = drawGuestInfo(doc, billData, y);

  // 3. Charges table (handles page breaks internally)
  y = await drawChargesTable(doc, billData, y, base64Logo, billStartPage);

  // 4. If not enough room for summary + footer, add a new page
  const neededH = 60 + FOOTER_HEIGHT; // rough estimate for summary tables
  if (y + neededH > pageHeight - FOOTER_HEIGHT) {
    doc.addPage();
    y = await drawHeader(doc, billData, base64Logo);
  }

  // 5. Summary + Payment tables
  drawSummaryAndPayment(doc, billData, y, isForPreview, paymentModeDetails);

  // 6. Fix all page numbers for this bill now that we know total pages
  const finalPage = doc.internal.getCurrentPageInfo().pageNumber;
  const totalPagesInBill = finalPage - billStartPage + 1;

  for (let p = billStartPage; p <= finalPage; p++) {
    doc.setPage(p);
    drawFooter(doc, p - billStartPage + 1, totalPagesInBill);
  }

  return finalPage;
};

// ─── Public API ───────────────────────────────────────────────────────────────
export const generateBillPrintPDF = async (
  billDataOrArray,
  isPrint = false,
  organization,
  isForPreview = false,
  paymentModeDetails = []
) => {

  console.log(paymentModeDetails);
  const bills = Array.isArray(billDataOrArray)
    ? billDataOrArray
    : [billDataOrArray];

  if (!bills.length) return;

  const doc = new jsPDF("p", "mm", "a4");

  let base64Logo = null;
  try {
    base64Logo = await getBase64FromUrl(organization?.logo);
  } catch (err) {
    console.error("Failed to load logo", err);
  }

  for (let i = 0; i < bills.length; i++) {
    if (i > 0) doc.addPage();
    await drawSingleBill(
      doc,
      bills[i],
      isForPreview,
      paymentModeDetails,
      base64Logo
    );
  }

  if (isPrint) {
    const blob = doc.output("blob");
    const url = URL.createObjectURL(blob);
    const w = window.open(url, "_blank");
    if (w) {
      w.onload = () => {
        w.print();
        setTimeout(() => URL.revokeObjectURL(url), 1500);
      };
    } else {
      alert("Please allow popups to print the invoice.");
    }
  } else {
    const filename =
      bills.length === 1
        ? `Bill-${bills[0]?.guest?.billNo || "Invoice"}.pdf`
        : `Bills-${bills.length}-pages.pdf`;
    doc.save(filename);
  }
};

export const handleBillPrintInvoice = async (
  billDataOrArray,
  organization,
  paymentModeDetails = [],
  isForPreview = false,
   
) => {
    console.log(paymentModeDetails);
  await generateBillPrintPDF(
    billDataOrArray,
    true,
    organization,
    isForPreview,
    paymentModeDetails
  );
};

export const handleBillDownloadPDF = async (
  billDataOrArray,
  organization,
  isForPreview = false,
  paymentModeDetails = []
) => {
  console.log(paymentModeDetails);
  await generateBillPrintPDF(
    billDataOrArray,
    false,
    organization,
    isForPreview,
    paymentModeDetails
  );
};