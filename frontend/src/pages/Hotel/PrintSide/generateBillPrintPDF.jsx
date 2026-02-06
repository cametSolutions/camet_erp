import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import Logo from "../../../assets/images/hill.png";

// Margins and spacing
const MARGIN = 12;
const TOP_OFFSET = 5;
const BOTTOM_MARGIN = 15;
const HEADER_HEIGHT = 45; // Reserve space for header
const FOOTER_HEIGHT = 60; // Reserve space for footer

// Base64 image fetch
const getBase64FromUrl = async (url) => {
  const res = await fetch(url);
  const blob = await res.blob();
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result);
    reader.readAsDataURL(blob);
  });
};

// Draw header (will be called for each page)
const drawHeader = async (doc, billData, base64Logo) => {
  const pageWidth = doc.internal.pageSize.width;
  const headerStartY = MARGIN + TOP_OFFSET;

  // Logo (left)
  if (base64Logo) {
    try {
      doc.addImage(base64Logo, "PNG", MARGIN + 2, headerStartY + 2, 32, 32);
    } catch (err) {
      console.error("Failed to add logo to PDF page", err);
    }
  }

  const rightX = pageWidth - MARGIN;
  let headerY = headerStartY + 8;

  // Hotel name
  doc.setFontSize(15);
  doc.setFont("helvetica", "bold");
  doc.text(billData?.hotel?.name?.toUpperCase() || "", rightX - 2, headerY, {
    align: "right",
  });
  headerY += 7;

  // Details
  doc.setFontSize(9);
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

  const logoX = MARGIN + 2;
  const logoWidth = 32;
  const gapAfterLogo = 12;
  const textLeftLimit = logoX + logoWidth + gapAfterLogo;
  const textRight = rightX - 2;
  const maxTextWidth = textRight - textLeftLimit;

  infoLines.forEach((line) => {
    const wrapped = doc.splitTextToSize(line, maxTextWidth);
    wrapped.forEach((wLine) => {
      doc.text(wLine, textRight, headerY, { align: "right" });
      headerY += 4;
    });
  });

  // Don't draw line under header - it interferes with tables
  const headerEndY = Math.max(headerY, headerStartY + 38);
  
  return headerEndY + 5;
};

// Draw footer (will be called for each page)
const drawFooter = (doc, billData, currentPageNum, totalPages) => {
  const pageWidth = doc.internal.pageSize.width;
  const pageHeight = doc.internal.pageSize.height;
  const footerStartY = pageHeight - FOOTER_HEIGHT - 5;

  // Top message box
  doc.setLineWidth(0.4);
  doc.rect(MARGIN, footerStartY, pageWidth - 2 * MARGIN, 17);
  doc.line(
    MARGIN + (pageWidth - 2 * MARGIN) / 2,
    footerStartY,
    MARGIN + (pageWidth - 2 * MARGIN) / 2,
    footerStartY + 17
  );
  
  doc.setFontSize(9);
  doc.setFont("helvetica", "bold");
  doc.text(
    "Please Deposit Your Room and Locker Keys",
    MARGIN + 3,
    footerStartY + 7
  );
  
  doc.setFont("helvetica", "normal");
  doc.text(
    "Regardless of charge instructions, I agree to be held personally liable for the payment of total amount of bill. Please collect receipt if you have paid cash.",
    MARGIN + (pageWidth - 2 * MARGIN) / 2 + 3,
    footerStartY + 7,
    { maxWidth: (pageWidth - 2 * MARGIN) / 2 - 7 }
  );

  // Signature boxes
  const sigStartY = footerStartY + 17;
  doc.rect(MARGIN, sigStartY, pageWidth - 2 * MARGIN, 25);
  doc.line(
    MARGIN + (pageWidth - 2 * MARGIN) / 3,
    sigStartY,
    MARGIN + (pageWidth - 2 * MARGIN) / 3,
    sigStartY + 25
  );
  doc.line(
    MARGIN + (2 * (pageWidth - 2 * MARGIN)) / 3,
    sigStartY,
    MARGIN + (2 * (pageWidth - 2 * MARGIN)) / 3,
    sigStartY + 25
  );
  
  doc.setFont("helvetica", "bold");
  doc.text("Prepared By", MARGIN + 4, sigStartY + 7);
  doc.text("Manager", MARGIN + (pageWidth - 2 * MARGIN) / 3 + 4, sigStartY + 7);
  doc.text(
    "Guest Signature & Date",
    MARGIN + (2 * (pageWidth - 2 * MARGIN)) / 3 + 4,
    sigStartY + 7
  );
  
  doc.setFont("helvetica", "normal");
  doc.text("FO", MARGIN + 4, sigStartY + 20);

  // Final strip
  const finalY = sigStartY + 25;
  doc.rect(MARGIN, finalY, pageWidth - 2 * MARGIN, 12);
  doc.line(
    pageWidth - MARGIN - 34,
    finalY,
    pageWidth - MARGIN - 34,
    finalY + 12
  );
  
  doc.setFontSize(8);
  doc.setFont("helvetica", "italic");
  doc.text(
    "We hope you enjoyed your stay and would like to welcome you back...",
    MARGIN + 4,
    finalY + 7
  );
  
  doc.setFont("helvetica", "normal");
  doc.text("Original Bill", pageWidth - MARGIN - 20, finalY + 6, {
    align: "center",
  });
  doc.text(`Page ${currentPageNum} of ${totalPages}`, pageWidth - MARGIN - 20, finalY + 10, {
    align: "center",
  });
};

const drawSingleBill = async (doc, billData, billNo, totalBills, base64Logo) => {
  const pageWidth = doc.internal.pageSize.width;
  const pageHeight = doc.internal.pageSize.height;
  
  // Track pages for this bill
  const billStartPage = doc.internal.getCurrentPageInfo().pageNumber;
  let currentPageInBill = 1;
  let totalPagesInBill = 1; // Will be updated later

  // Draw initial header
  let currentY = await drawHeader(doc, billData, base64Logo);

  // --- Guest & Bill Info ---
  doc.setFontSize(9);
  doc.setFont("helvetica", "normal");
  const colWidth = (pageWidth - 2 * MARGIN) / 3;
  const infoStartY = currentY;

  const guestInfoRows = [
    [
      `GRC No: ${billData?.guest?.billNo || ""}`,
      `Bill No: ${billData?.guest?.billNo || ""}`,
      `Date: ${billData?.stay?.billDate || ""}`,
    ],
    [
      `GUEST: ${billData?.guest?.name || ""}`,
      `Arrival: ${billData?.stay?.arrival || ""}`,
      `Departure: ${billData?.stay?.departure || ""}`,
    ],
    [
      `Phone: ${billData?.guest?.phone || ""}`,
      `Tariff: ${billData?.stay?.tariff || ""}`,
      `Plan: ${billData?.stay?.plan || ""} Pax ${billData?.stay?.pax || ""}`,
    ],
    [
      `Address: ${billData?.guest?.address || ""}`,
      "",
      `No. of Days: ${billData?.stay?.days || ""}`,
    ],
    [`Travel Agent: ${billData?.guest?.travelAgent || ""}`, "", ""],
    [`GST No: ${billData?.guest?.gstNo || ""}`, "", ""],
    [`Company: ${billData?.hotel?.name || ""}`, "", ""],
    [`Room No: ${billData?.guest?.roomNo || ""}`, "", ""],
  ];

  const INNER_CELL_MARGIN = 1.5;
  const baseRowHeight = 4;
  const lineHeight = 3.5;

  const rowHeights = new Array(guestInfoRows.length).fill(baseRowHeight);

  guestInfoRows.forEach((row, r) => {
    let maxLinesThisRow = 1;

    row.forEach((cell, c) => {
      if (!cell) return;

      const x = MARGIN + 3 + c * colWidth;
      const y =
        currentY +
        INNER_CELL_MARGIN +
        rowHeights.slice(0, r).reduce((a, b) => a + b, 0);

      const maxWidth = colWidth - 6;
      const wrappedLines = doc.splitTextToSize(cell, maxWidth);
      maxLinesThisRow = Math.max(maxLinesThisRow, wrappedLines.length);

      wrappedLines.forEach((txt, i) => {
        doc.text(txt, x, y + i * lineHeight);
      });
    });

    rowHeights[r] = INNER_CELL_MARGIN + maxLinesThisRow * lineHeight;
  });

  const guestInfoHeight = rowHeights.reduce((a, b) => a + b, 0) + 3;

  doc.setLineWidth(0.2);
  doc.rect(MARGIN, infoStartY - 3, pageWidth - 2 * MARGIN, guestInfoHeight);
  doc.line(
    MARGIN + colWidth,
    infoStartY - 3,
    MARGIN + colWidth,
    infoStartY - 3 + guestInfoHeight
  );
  doc.line(
    MARGIN + 2 * colWidth,
    infoStartY - 3,
    MARGIN + 2 * colWidth,
    infoStartY - 3 + guestInfoHeight
  );

  currentY = infoStartY + guestInfoHeight;

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
      top: HEADER_HEIGHT + 10, 
      bottom: FOOTER_HEIGHT + 10 
    },
    tableWidth: pageWidth - 2 * MARGIN,
    styles: {
      fontSize: 9,
      cellPadding: 2,
      lineColor: [185, 185, 185],
      lineWidth: 0.3,
      textColor: [0, 0, 0],
    },
    headStyles: {
      fillColor: [245, 245, 245],
      textColor: [0, 0, 0],
      fontStyle: "bold",
      halign: "center",
    },
    alternateRowStyles: { fillColor: [250, 250, 250] },
    columnStyles: {
      0: { cellWidth: 22, halign: "left" },
      1: { cellWidth: 24, halign: "center" },
      2: { cellWidth: 58, halign: "left" },
      3: { cellWidth: 22, halign: "right" },
      4: { cellWidth: 20, halign: "right" },
      5: { cellWidth: 20, halign: "right" },
      6: { cellWidth: 20, halign: "right" },
    },
    didParseCell: (data) => {
      const text = data.cell?.text?.[0] || "";
      if (text.includes("Advance")) data.cell.styles.fontStyle = "bold";
      if (text.includes("CGST") || text.includes("SGST"))
        data.cell.styles.fillColor = [235, 235, 235];
      if (text.startsWith("Restaurant")) data.cell.styles.fontStyle = "bold";
    },
    didDrawPage: async (data) => {
      // Draw header and footer on every page
      const currentPage = doc.internal.getCurrentPageInfo().pageNumber;
      
      // If this is not the first page of the bill, draw header
      if (currentPage > billStartPage) {
        await drawHeader(doc, billData, base64Logo);
      }
      
      // Draw footer on every page
      totalPagesInBill = currentPage - billStartPage + 1;
      drawFooter(doc, billData, currentPageInBill, "TBD"); // Will update later
      currentPageInBill++;
    },
  });

  currentY = doc.lastAutoTable.finalY + 8;

  // Check if we need a new page for summary
  if (currentY > pageHeight - FOOTER_HEIGHT - 65) {
    doc.addPage();
    currentY = await drawHeader(doc, billData, base64Logo);
  }

  // --- Summary & Payment ---
  const tableStartY = currentY - 5;
  const halfWidth = (pageWidth - 2 * MARGIN - 8) / 2;

  autoTable(doc, {
    head: [["Summary", "Amount"]],
    body: [
      ["Room Rent", (billData?.summary?.roomRent || 0)],
      ...(billData?.summary?.foodPlan > 0
        ? [["Food Plan", (billData.summary.foodPlan || 0)]]
        : []),
      ["SGST on Rent", (billData?.summary?.sgst || 0)],
      ["CGST on Rent", (billData?.summary?.cgst || 0)],
      ["Ac Restaurant", (billData?.summary?.restaurant || 0)],
      ["Room Service", (billData?.summary?.roomService || 0)],
      ["Total", (billData?.summary?.total || 0)],
    ],
    startY: tableStartY,
    margin: { left: MARGIN, right: MARGIN + halfWidth + 8 },
    tableWidth: halfWidth,
    styles: {
      fontSize: 9,
      cellPadding: 2.2,
      lineColor: [120, 120, 120],
      lineWidth: 0.1,
    },
    headStyles: {
      fillColor: [245, 245, 245],
      textColor: [0, 0, 0],
      fontStyle: "bold",
    },
    columnStyles: { 0: { halign: "left" }, 1: { halign: "right" } },
    didParseCell: (data) => {
      if (data.section === "body" && data.row.index === 6) {
        data.cell.styles.fillColor = [245, 245, 245];
        data.cell.styles.fontStyle = "bold";
      }
    },
  });

  autoTable(doc, {
    head: [["Payment Details", ""]],
    body: [
      ["PAYMODE", "AMOUNT"],
      [
        billData?.payment?.mode || "Credit",
        (billData?.payment?.total || 0).toFixed(2),
      ],
      [
        {
          content: billData?.guest?.name || "",
          colSpan: 2,
          styles: { halign: "center", fontStyle: "bold" },
        },
      ],
      [
        {
          content: billData?.summary?.totalWords || "",
          colSpan: 2,
          styles: { fontSize: 8 },
        },
      ],
      ["Total :", (billData?.payment?.total || 0).toFixed(2)],
      ["Less Advance:", (billData?.payment?.advance || 0).toFixed(2)],
      ["Net Pay :", (billData?.payment?.netPay || 0).toFixed(2)],
    ],
    startY: tableStartY,
    margin: { left: MARGIN + halfWidth + 8, right: MARGIN },
    tableWidth: halfWidth,
    styles: {
      fontSize: 9,
      cellPadding: 2.2,
      lineColor: [120, 120, 120],
      lineWidth: 0.3,
    },
    headStyles: {
      fillColor: [245, 245, 245],
      textColor: [0, 0, 0],
      fontStyle: "bold",
    },
    columnStyles: { 0: { halign: "left" }, 1: { halign: "right" } },
    didParseCell: (data) => {
      if (
        (data.section === "body" && data.row.index === 0) ||
        data.row.index === 6
      ) {
        data.cell.styles.fontStyle = "bold";
      }
    },
  });

  // Draw footer on the last page
  const finalPageNum = doc.internal.getCurrentPageInfo().pageNumber;
  totalPagesInBill = finalPageNum - billStartPage + 1;
  drawFooter(doc, billData, totalPagesInBill, totalPagesInBill);

  // Update all page numbers for this bill
  const totalPages = doc.internal.getNumberOfPages();
  for (let i = billStartPage; i <= finalPageNum; i++) {
    doc.setPage(i);
    const pageInBill = i - billStartPage + 1;
    
    // Redraw footer with correct page numbers
    const pageWidth = doc.internal.pageSize.width;
    const pageHeight = doc.internal.pageSize.height;
    const footerY = pageHeight - FOOTER_HEIGHT - 5 + 42 + 25; // Position of final strip
    
    // Clear previous page number
    doc.setFillColor(255, 255, 255);
    doc.rect(pageWidth - MARGIN - 34, footerY, 34, 12, 'F');
    
    // Redraw border
    doc.setDrawColor(0, 0, 0);
    doc.setLineWidth(0.4);
    doc.line(
      pageWidth - MARGIN - 34,
      footerY,
      pageWidth - MARGIN - 34,
      footerY + 12
    );
    
    // Draw correct page number
    doc.setFontSize(8);
    doc.setFont("helvetica", "normal");
    doc.text("Original Bill", pageWidth - MARGIN - 20, footerY + 6, {
      align: "center",
    });
    doc.text(`Page ${pageInBill} of ${totalPagesInBill}`, pageWidth - MARGIN - 20, footerY + 10, {
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
  
  // Load logo once
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

export const handleBillPrintInvoice = async (billDataOrArray,organization) => {
  await generateBillPrintPDF(billDataOrArray, true,organization);
};

export const handleBillDownloadPDF = async (billDataOrArray,organization) => {
  await generateBillPrintPDF(billDataOrArray, false,organization);
};