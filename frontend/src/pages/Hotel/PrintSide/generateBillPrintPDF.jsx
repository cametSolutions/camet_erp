import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";

// Margins and spacing
const MARGIN = 12;
const TOP_OFFSET = 5;
const BOTTOM_MARGIN = 15;
const HEADER_HEIGHT = 50; // Reserve space for header
const FOOTER_HEIGHT = 40; // Reserve space for footer (adjusted to prevent overlap)

// Base64 image fetch
const getBase64FromUrl = async (url) => {
  if (!url) return null;
  try {
    const res = await fetch(url);
    const blob = await res.blob();
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result);
      reader.onerror = () => reject(new Error('Failed to read image'));
      reader.readAsDataURL(blob);
    });
  } catch (err) {
    console.error('Failed to fetch image from URL:', url, err);
    return null;
  }
};

// Draw header (will be called for each page)
const drawHeader = async (doc, billData, base64Logo) => {
  const pageWidth = doc.internal.pageSize.width;
  const headerStartY = MARGIN;

  // Logo (left)
  if (base64Logo) {
    try {
      doc.addImage(base64Logo, "PNG", MARGIN, headerStartY, 30, 30);
    } catch (err) {
      console.error("Failed to add logo to PDF page", err);
    }
  }

  const rightX = pageWidth - MARGIN;
  let headerY = headerStartY + 3;

  // Hotel name
  doc.setFontSize(14);
  doc.setFont("helvetica", "bold");
  doc.text(billData?.hotel?.name?.toUpperCase() || "", rightX, headerY, {
    align: "right",
  });
  headerY += 5;

  // Details
  doc.setFontSize(8);
  doc.setFont("helvetica", "normal");

  // Split address by comma into multiple lines
  const addressParts = (billData?.hotel?.address || "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);

  const infoLines = [
    ...addressParts,
    `Phone: ${billData?.hotel?.phone || ""}`,
    `E-mail: ${billData?.hotel?.email || ""} | Website: ${
      billData?.hotel?.website || ""
    }`,
    `PAN NO: ${billData?.hotel?.pan || ""} | GSTIN: ${
      billData?.hotel?.gstin || ""
    }`,
    `SAC CODE-${billData?.hotel?.sacCode || ""}`,
  ].filter(Boolean);

  const logoX = MARGIN;
  const logoWidth = 30;
  const gapAfterLogo = 8;
  const textLeftLimit = logoX + logoWidth + gapAfterLogo;
  const textRight = rightX;
  const maxTextWidth = textRight - textLeftLimit;

  infoLines.forEach((line) => {
    const wrapped = doc.splitTextToSize(line, maxTextWidth);
    wrapped.forEach((wLine) => {
      doc.text(wLine, textRight, headerY, { align: "right" });
      headerY += 3.5;
    });
  });

  // Draw line under header
  const headerEndY = Math.max(headerY, headerStartY + 35);
  doc.setLineWidth(0.5);
  doc.line(MARGIN, headerEndY, pageWidth - MARGIN, headerEndY);

  return headerEndY + 3;
};

// Draw footer (will be called for each page)
const drawFooter = (doc, billData, currentPageNum, totalPages) => {
  const pageWidth = doc.internal.pageSize.width;
  const pageHeight = doc.internal.pageSize.height;
  const footerStartY = pageHeight - FOOTER_HEIGHT;

  doc.setLineWidth(0.3);

  // Top message box
  const msgBoxHeight = 8; // Reduced from 10
  doc.rect(MARGIN, footerStartY, pageWidth - 2 * MARGIN, msgBoxHeight);
  doc.line(
    MARGIN + (pageWidth - 2 * MARGIN) / 2,
    footerStartY,
    MARGIN + (pageWidth - 2 * MARGIN) / 2,
    footerStartY + msgBoxHeight
  );

  doc.setFontSize(7);
  doc.setFont("helvetica", "bold");
  doc.text(
    "Please Deposit Your Room and Locker Keys",
    MARGIN + 2,
    footerStartY + 3.5 // Reduced from 4
  );

  doc.setFont("helvetica", "normal");
  const rightText = doc.splitTextToSize(
    "Regardless of charge instructions, I agree to be held personally liable for the payment of total amount of bill. Please collect receipt if you have paid cash.",
    (pageWidth - 2 * MARGIN) / 2 - 4
  );
  doc.text(
    rightText,
    MARGIN + (pageWidth - 2 * MARGIN) / 2 + 2,
    footerStartY + 2.5 // Further reduced to fit in smaller box
  );

  // Signature boxes
  const sigStartY = footerStartY + msgBoxHeight;
  const sigHeight = 13; // Reduced from 16
  doc.rect(MARGIN, sigStartY, pageWidth - 2 * MARGIN, sigHeight);
  doc.line(
    MARGIN + (pageWidth - 2 * MARGIN) / 3,
    sigStartY,
    MARGIN + (pageWidth - 2 * MARGIN) / 3,
    sigStartY + sigHeight
  );
  doc.line(
    MARGIN + (2 * (pageWidth - 2 * MARGIN)) / 3,
    sigStartY,
    MARGIN + (2 * (pageWidth - 2 * MARGIN)) / 3,
    sigStartY + sigHeight
  );

  doc.setFont("helvetica", "bold");
  doc.text("Prepared By", MARGIN + 2, sigStartY + 3.5); // Reduced from 4
  doc.text("Manager", MARGIN + (pageWidth - 2 * MARGIN) / 3 + 2, sigStartY + 3.5); // Reduced from 4
  doc.text(
    "Guest Signature & Date",
    MARGIN + (2 * (pageWidth - 2 * MARGIN)) / 3 + 2,
    sigStartY + 3.5 // Reduced from 4
  );

  doc.setFont("helvetica", "normal");
  doc.text("FO", MARGIN + 2, sigStartY + 11); // Reduced from 13

  // Final strip
  const finalY = sigStartY + sigHeight;
  const finalHeight = 7; // Reduced from 8

  // Use thicker line for all borders in footer
  doc.setLineWidth(0.3);
  doc.rect(MARGIN, finalY, pageWidth - 2 * MARGIN, finalHeight);
  doc.line(
    pageWidth - MARGIN - 30,
    finalY,
    pageWidth - MARGIN - 30,
    finalY + finalHeight
  );

  doc.setFontSize(7);
  doc.setFont("helvetica", "italic");
  doc.text(
    "We hope you enjoyed your stay and would like to welcome you back...",
    MARGIN + 2,
    finalY + 4.5 // Reduced from 5
  );

  doc.setFont("helvetica", "normal");
  doc.text("Original Bill", pageWidth - MARGIN - 15, finalY + 2.5, { // Reduced from 3
    align: "center",
  });
  doc.text(`Page ${currentPageNum} of ${totalPages}`, pageWidth - MARGIN - 15, finalY + 5.5, { // Reduced from 6
    align: "center",
  });
};

const drawSingleBill = async (doc, billData, billNo, totalBills, base64Logo) => {
  const pageWidth = doc.internal.pageSize.width;
  const pageHeight = doc.internal.pageSize.height;

  // Track pages for this bill
  const billStartPage = doc.internal.getCurrentPageInfo().pageNumber;
  let currentPageInBill = 1;
  let totalPagesInBill = 1;

  // Draw initial header
  let currentY = await drawHeader(doc, billData, base64Logo);

  // --- Guest & Bill Info (2 COLUMNS) ---
  doc.setFontSize(8);
  doc.setFont("helvetica", "normal");

  const infoStartY = currentY;
  const guestInfoHeight = 35;
  
  // Draw outer border
  doc.setLineWidth(0.3);
  doc.rect(MARGIN, infoStartY, pageWidth - 2 * MARGIN, guestInfoHeight);

  // Define column positions (2 columns) - right column moved further right for more left space
  const leftColX = MARGIN + 2;
  const rightColX = MARGIN + (pageWidth - 2 * MARGIN) * 0.6 + 2;
  
  let lineY = infoStartY + 4;
  const lineSpacing = 4.5;

  // LEFT COLUMN - Guest Information
  // Row 1: GRC No
  doc.setFont("helvetica", "bold");
  doc.text("GRC No", leftColX, lineY);
  doc.setFont("helvetica", "normal");
  doc.text(`: ${billData?.guest?.grcNo || ""}`, leftColX + 18, lineY);

  // RIGHT COLUMN - Bill Information
  doc.setFont("helvetica", "bold");
  doc.text("Bill No", rightColX, lineY);
  doc.setFont("helvetica", "normal");
  doc.text(`: ${billData?.guest?.billNo || ""}`, rightColX + 18, lineY);
  
  lineY += lineSpacing;

  // Row 2: Guest Name and Date
  doc.setFont("helvetica", "bold");
  doc.text("GUEST", leftColX, lineY);
  doc.setFont("helvetica", "normal");
  doc.text(`: ${billData?.guest?.name || ""}`, leftColX + 18, lineY);

  doc.setFont("helvetica", "bold");
  doc.text("Date", rightColX, lineY);
  doc.setFont("helvetica", "normal");
  doc.text(`: ${billData?.stay?.billDate || ""}`, rightColX + 18, lineY);

  lineY += lineSpacing;

  // Row 3: Address and Arrival
  doc.setFont("helvetica", "bold");
  doc.text("Address", leftColX, lineY);
  doc.setFont("helvetica", "normal");
  const addressText = billData?.guest?.address || "";
  const addressWidth = (pageWidth - 2 * MARGIN) * 0.6 - 25; // Use 60% of width minus offset
  const addressLines = doc.splitTextToSize(`: ${addressText}`, addressWidth);
  doc.text(addressLines, leftColX + 18, lineY);

  doc.setFont("helvetica", "bold");
  doc.text("Arrival", rightColX, lineY);
  doc.setFont("helvetica", "normal");
  doc.text(`: ${billData?.stay?.arrival || ""}`, rightColX + 18, lineY);

  lineY += Math.max(addressLines.length * 3.5, lineSpacing);

  // Row 4: Phone and Departure
  doc.setFont("helvetica", "bold");
  doc.text("Phone", leftColX, lineY);
  doc.setFont("helvetica", "normal");
  doc.text(`: ${billData?.guest?.phone || ""}`, leftColX + 18, lineY);

  doc.setFont("helvetica", "bold");
  doc.text("Departure", rightColX, lineY);
  doc.setFont("helvetica", "normal");
  doc.text(`: ${billData?.stay?.departure || ""}`, rightColX + 18, lineY);

  lineY += lineSpacing;

  // Row 5: Room No and Plan
  doc.setFont("helvetica", "bold");
  doc.text("Room No", leftColX, lineY);
  doc.setFont("helvetica", "normal");
  doc.text(`: ${billData?.guest?.roomNo || ""}`, leftColX + 18, lineY);

  doc.setFont("helvetica", "bold");
  doc.text("Plan", rightColX, lineY);
  doc.setFont("helvetica", "normal");
  doc.text(`: ${billData?.stay?.plan || ""} Pax ${billData?.stay?.pax || ""}`, rightColX + 18, lineY);

  lineY += lineSpacing;

  // Row 6: GST No (if exists) and Tariff
  if (billData?.guest?.gstNo) {
    doc.setFont("helvetica", "bold");
    doc.text("GST No", leftColX, lineY);
    doc.setFont("helvetica", "normal");
    doc.text(`: ${billData?.guest?.gstNo || ""}`, leftColX + 18, lineY);
  }

  doc.setFont("helvetica", "bold");
  doc.text("Tariff", rightColX, lineY);
  doc.setFont("helvetica", "normal");
  doc.text(`: ${(billData?.stay?.tariff || "").toString()}`, rightColX + 18, lineY);

  lineY += lineSpacing;

  // Row 7: Company (only if GST No exists) / Travel Agent and No. of Days
  if (billData?.guest?.companyName && billData?.guest?.gstNo) {
    doc.setFont("helvetica", "bold");
    doc.text("Company", leftColX, lineY);
    doc.setFont("helvetica", "normal");
    doc.text(`: ${billData?.guest?.companyName || ""}`, leftColX + 20, lineY);
  } else if (billData?.guest?.travelAgent) {
    doc.setFont("helvetica", "bold");
    doc.text("Travel Agent", leftColX, lineY);
    doc.setFont("helvetica", "normal");
    doc.text(`: ${billData?.guest?.travelAgent || ""}`, leftColX + 25, lineY);
  }

  doc.setFont("helvetica", "bold");
  doc.text("No. of Days", rightColX, lineY);
  doc.setFont("helvetica", "normal");
  doc.text(`: ${(billData?.stay?.days || "").toString()}`, rightColX + 22, lineY);

  currentY = infoStartY + guestInfoHeight + 5;

  // --- Charges Table with page breaks ---
  autoTable(doc, {
    head: [
      [
        "Date",
        "Doc No",
        "Description",
        "Amount",
        "Taxes",
        "Advance",
        "Balance",
      ],
    ],
    body: (billData?.charges || []).map((charge) => [
      charge.date || "",
      charge.docNo || "",
      charge.description || "",
      charge.amount !== undefined ? Number(charge.amount || 0).toFixed(2) : "",
      charge.taxes || "",
      charge.advance || "",
      charge.balance || "",
    ]),
    startY: currentY,
    margin: {
      left: MARGIN,
      right: MARGIN,
      top: HEADER_HEIGHT + 15,
      bottom: FOOTER_HEIGHT + 8 // Increased from 5 to prevent overlap
    },
    tableWidth: pageWidth - 2 * MARGIN,
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
      halign: "left",
    },
    columnStyles: {
      0: { cellWidth: 22, halign: "left" },
      1: { cellWidth: 22, halign: "center" },
      2: { cellWidth: 60, halign: "left" },
      3: { cellWidth: 22, halign: "right" },
      4: { cellWidth: 18, halign: "right" },
      5: { cellWidth: 20, halign: "right" },
      6: { cellWidth: 22, halign: "right" },
    },
    didParseCell: (data) => {
      const text = data.cell?.text?.[0] || "";
      if (text.includes("Advance")) {
        data.cell.styles.fontStyle = "bold";
      }
      if (text.includes("CGST") || text.includes("SGST")) {
        data.cell.styles.fillColor = [240, 240, 240];
      }
      if (text.startsWith("Restaurant") || text.startsWith("Room Service")) {
        data.cell.styles.fontStyle = "bold";
      }
    },
    didDrawPage: async (data) => {
      const currentPage = doc.internal.getCurrentPageInfo().pageNumber;

      // Draw header on every page except first
      if (currentPage > billStartPage) {
        await drawHeader(doc, billData, base64Logo);
      }

      // Always draw footer on every page
      const tempPageNum = currentPage - billStartPage + 1;
      drawFooter(doc, billData, tempPageNum, tempPageNum);
      currentPageInBill++;
    },
  });

  currentY = doc.lastAutoTable.finalY + 5;

  // Check if we need a new page for summary
  if (currentY > pageHeight - FOOTER_HEIGHT - 50) {
    doc.addPage();
    currentY = await drawHeader(doc, billData, base64Logo);

    // Draw footer on the new page
    const newPageNum = doc.internal.getCurrentPageInfo().pageNumber;
    const pageNumForFooter = newPageNum - billStartPage + 1;
    drawFooter(doc, billData, pageNumForFooter, pageNumForFooter);
  }

  // --- Summary & Payment Tables (Side by Side) ---
  const halfWidth = (pageWidth - 2 * MARGIN - 4) / 2;

  // Summary table (left side)
  const summaryRows = [
    ["Room Rent", Number(billData?.summary?.roomRent || 0).toLocaleString("en-IN", { minimumFractionDigits: 2 })],
  ];

  if (billData?.summary?.foodPlan > 0) {
    summaryRows.push(["Food Plan", Number(billData.summary.foodPlan || 0).toLocaleString("en-IN", { minimumFractionDigits: 2 })]);
  }

  summaryRows.push(
    ["SGST on Rent", Number(billData?.summary?.sgst || 0).toLocaleString("en-IN", { minimumFractionDigits: 2 })],
    ["CGST on Rent", Number(billData?.summary?.cgst || 0).toLocaleString("en-IN", { minimumFractionDigits: 2 })]
  );

  if (billData?.summary?.restaurant > 0) {
    summaryRows.push(["Restaurant", Number(billData.summary.restaurant || 0).toLocaleString("en-IN", { minimumFractionDigits: 2 })]);
  }

  if (billData?.summary?.roomService > 0) {
    summaryRows.push(["Room Service", Number(billData.summary.roomService || 0).toLocaleString("en-IN", { minimumFractionDigits: 2 })]);
  }

  summaryRows.push(["Total", Number(billData?.summary?.total || 0).toLocaleString("en-IN", { minimumFractionDigits: 2 })]);

  autoTable(doc, {
    head: [["Summary", "Amount"]],
    body: summaryRows,
    startY: currentY,
    margin: { left: MARGIN, right: MARGIN + halfWidth + 4 },
    tableWidth: halfWidth,
    styles: {
      fontSize: 9,
      cellPadding: 2,
      lineColor: [0, 0, 0],
      lineWidth: 0.2,
    },
    headStyles: {
      fillColor: [245, 245, 245],
      textColor: [0, 0, 0],
      fontStyle: "bold",
    },
    columnStyles: {
      0: { halign: "left" },
      1: { halign: "right" }
    },
    didParseCell: (data) => {
      if (data.section === "body" && data.cell.raw === "Total") {
        data.cell.styles.fillColor = [245, 245, 245];
        data.cell.styles.fontStyle = "bold";
      }
      if (data.section === "body" && data.row.index === summaryRows.length - 1) {
        data.cell.styles.fillColor = [245, 245, 245];
        data.cell.styles.fontStyle = "bold";
      }
    },
  });

  // Payment table (right side)
  const paymentRows = [
    [
      { content: "PAYMODE", styles: { fontStyle: "bold" } },
      { content: "AMOUNT", styles: { fontStyle: "bold", halign: "center" } }
    ]
  ];

  // Add payment mode details
  if (billData?.paymentModeDetails) {
    Object.entries(billData.paymentModeDetails).forEach(([key, amount]) => {
      paymentRows.push([
        key.toUpperCase(),
        Number(amount).toLocaleString("en-IN", { minimumFractionDigits: 2 })
      ]);
    });
  } else {
    paymentRows.push([
      billData?.payment?.mode || "Credit",
      Number(billData?.payment?.total || 0).toLocaleString("en-IN", { minimumFractionDigits: 2 })
    ]);
  }

  paymentRows.push(
    [{ content: billData?.guest?.name || "", colSpan: 2, styles: { halign: "center", fontStyle: "bold" } }],
    [{ content: billData?.summary?.totalWords || "", colSpan: 2, styles: { fontSize: 8 } }],
    [
      { content: "Total :", styles: { fontStyle: "bold" } },
      { content: Number(billData?.payment?.total || 0).toFixed(2), styles: { fontStyle: "bold", halign: "right" } }
    ],
    [
      "Less Advance:",
      { content: Number(billData?.payment?.advance || 0).toFixed(2), styles: { halign: "right" } }
    ],
    [
      { content: "Net Pay :", styles: { fontStyle: "bold" } },
      { content: Number(billData?.payment?.netPay || 0).toFixed(2), styles: { fontStyle: "bold", halign: "right" } }
    ]
  );

  autoTable(doc, {
    head: [["Payment Details", ""]],
    body: paymentRows,
    startY: currentY,
    margin: { left: MARGIN + halfWidth + 4, right: MARGIN },
    tableWidth: halfWidth,
    styles: {
      fontSize: 9,
      cellPadding: 2,
      lineColor: [0, 0, 0],
      lineWidth: 0.2,
    },
    headStyles: {
      fillColor: [245, 245, 245],
      textColor: [0, 0, 0],
      fontStyle: "bold",
    },
    columnStyles: {
      0: { halign: "left" },
      1: { halign: "right" }
    },
  });

  // Draw footer on the last page
  const finalPageNum = doc.internal.getCurrentPageInfo().pageNumber;
  totalPagesInBill = finalPageNum - billStartPage + 1;

  // Update all page numbers for this bill
  for (let i = billStartPage; i <= finalPageNum; i++) {
    doc.setPage(i);
    const pageInBill = i - billStartPage + 1;

    // Redraw footer with correct page numbers
    const pageWidth = doc.internal.pageSize.width;
    const pageHeight = doc.internal.pageSize.height;
    const footerY = pageHeight - FOOTER_HEIGHT + 8 + 13; // Position of final strip (8 for msgBox + 13 for sigBox)
    const finalHeight = 7; // Reduced from 8

    // Clear previous page number area
    doc.setFillColor(255, 255, 255);
    doc.rect(pageWidth - MARGIN - 30, footerY, 30, finalHeight, 'F');

    // Redraw complete border around the final strip with proper line width
    doc.setDrawColor(0, 0, 0);
    doc.setLineWidth(0.3);

    // Redraw the complete rectangle border
    doc.rect(MARGIN, footerY, pageWidth - 2 * MARGIN, finalHeight);

    // Redraw the vertical divider line
    doc.line(
      pageWidth - MARGIN - 30,
      footerY,
      pageWidth - MARGIN - 30,
      footerY + finalHeight
    );

    // Redraw the text on left side
    doc.setFontSize(7);
    doc.setFont("helvetica", "italic");
    doc.text(
      "We hope you enjoyed your stay and would like to welcome you back...",
      MARGIN + 2,
      footerY + 4.5 // Reduced from 5
    );

    // Draw correct page number on right side
    doc.setFont("helvetica", "normal");
    doc.text("Original Bill", pageWidth - MARGIN - 15, footerY + 2.5, { // Reduced from 3
      align: "center",
    });
    doc.text(`Page ${pageInBill} of ${totalPagesInBill}`, pageWidth - MARGIN - 15, footerY + 5.5, { // Reduced from 6
      align: "center",
    });
  }

  return finalPageNum;
};

// Main print/download logic
export const generateBillPrintPDF = async (
  billDataOrArray,
  isPrint = false,
  organization
) => {
  const bills = Array.isArray(billDataOrArray)
    ? billDataOrArray
    : [billDataOrArray];

  if (!bills.length) return;

  const doc = new jsPDF("p", "mm", "a4");

  // Load logo
  let base64Logo = null;
  try {
    base64Logo = await getBase64FromUrl(organization?.logo);
  } catch (err) {
    console.error("Failed to load logo", err);
  }

  const totalBills = bills.length;

  for (let i = 0; i < bills.length; i++) {
    if (i > 0) {
      doc.addPage();
    }
    await drawSingleBill(doc, bills[i], i + 1, totalBills, base64Logo);
  }

  if (isPrint) {
    const blob = doc.output("blob");
    const url = URL.createObjectURL(blob);
    const w = window.open(url, "_blank");
    if (w) {
      w.onload = () => {
        w.print();
        setTimeout(() => URL.revokeObjectURL(url), 1000);
      };
    } else {
      alert("Please allow popups to print the invoice");
    }
  } else {
    const filename =
      bills.length === 1
        ? `Bill-${bills[0]?.guest?.billNo || "Invoice"}.pdf`
        : `Bills-${bills.length}-pages.pdf`;
    doc.save(filename);
  }
};

export const handleBillPrintInvoice = async (billDataOrArray, organization) => {
  await generateBillPrintPDF(billDataOrArray, true, organization);
};

export const handleBillDownloadPDF = async (billDataOrArray, organization) => {
  await generateBillPrintPDF(billDataOrArray, false, organization);
};