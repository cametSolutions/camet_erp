import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import Logo from "../../../assets/images/hill.png";

// Margins and spacing
const MARGIN = 5;
const TOP_OFFSET = 5;
const BOTTOM_MARGIN = 5; // Margin at bottom

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

// Page break helper
const checkAndAddNewPage = (doc, currentY, requiredSpace = 40) => {
  const pageHeight = doc.internal.pageSize.height;
  if (currentY + requiredSpace > pageHeight - BOTTOM_MARGIN) {
    doc.addPage();
    return MARGIN + TOP_OFFSET;
  }
  return currentY;
};

const drawSingleBill = async (doc, billData, pageNo, totalPages) => {
  const pageWidth = doc.internal.pageSize.width;
  // Start at top, respecting top margin
  let currentY = MARGIN + TOP_OFFSET;

  // --- Header ---
  const addHeader = async () => {
    const headerStartY = currentY;

    // Logo (left)
    if (billData?.hotel?.logo) {
      try {
        const base64Logo = await getBase64FromUrl(Logo);
        console.log("logo base64 length", base64Logo?.length);
        doc.addImage(base64Logo, "PNG", MARGIN + 2, headerStartY + 2, 32, 32);
      } catch (err) {
        console.error(
          "Failed to load logo for PDF",
          err,
          billData?.hotel?.logo
        );
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
      ...addressParts, // each comma-separated part becomes a line
      `Phone: ${billData?.hotel?.phone || ""}`,
      `E-mail: ${billData?.hotel?.email || ""} | Website: ${
        billData?.hotel?.website || ""
      }`,
      `PAN NO: ${billData?.hotel?.pan || ""} | GSTIN: ${
        billData?.hotel?.gstin || ""
      }`,
      `SAC CODE-${billData?.hotel?.sacCode || ""}`,
    ].filter(Boolean);

    // Keep text clear of the logo
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

    const headerHeight = Math.max(headerY - headerStartY, 38);
    return headerStartY + headerHeight + 5;
  };

  currentY = await addHeader();

  // --- Guest & Bill Info ---
  currentY = checkAndAddNewPage(doc, currentY, 40);
  // --- Guest & Bill Info (3-column grid boxed) ---
  // --- Guest & Bill Info (3-column grid boxed) ---
  doc.setFontSize(9);
  doc.setFont("helvetica", "normal");
  const colWidth = (pageWidth - 2 * MARGIN) / 3;
  const infoStartY = currentY;
const guestInfoRows = [
  [
    { label: "GRC No", value: billData?.guest?.billNo },
    { label: "Bill No", value: billData?.guest?.billNo },
    { label: "Date", value: billData?.stay?.billDate },
  ],
  [
    { label: "GUEST", value: billData?.guest?.name },
    { label: "Arrival", value: billData?.stay?.arrival },
    { label: "Departure", value: billData?.stay?.departure },
  ],
  [
    { label: "Phone", value: billData?.guest?.phone },
    { label: "Tariff", value: billData?.stay?.tariff },
    {
      label: "Plan",
      value: `${billData?.stay?.plan || ""} Pax ${billData?.stay?.pax || ""}`,
    },
  ],
  [
    { label: "Address", value: billData?.guest?.address },
    null,
    { label: "No. of Days", value: billData?.stay?.days },
  ],
  billData?.guest?.travelAgent && [
    { label: "Travel Agent", value: billData.guest.travelAgent },
    null,
    null,
  ],
  billData?.guest?.gstNo && [
    { label: "GST No", value: billData.guest.gstNo },
    null,
    null,
  ],
  billData?.guest?.gstNo && billData?.guest?.companyName && [
    { label: "Company", value: billData.guest.companyName },
    null,
    null,
  ],
  billData?.guest?.roomNo && [
    { label: "Room No", value: billData.guest.roomNo },
    null,
    null,
  ],
].filter(Boolean);


const INNER_CELL_MARGIN = 1;
const baseRowHeight = 4;
const lineHeight = 3.5;
const LABEL_WIDTH = 22;   // fixed label width (controls alignment)
const VALUE_GAP = 2;


// track max visual height per row
const rowHeights = new Array(guestInfoRows.length).fill(baseRowHeight);

guestInfoRows.forEach((row, r) => {
  let maxLinesThisRow = 1;

  row.forEach((cell, c) => {
    if (!cell || !cell.value) return;

    const x = MARGIN + 3 + c * colWidth;
    const y =
      currentY +
      INNER_CELL_MARGIN +
      rowHeights.slice(0, r).reduce((a, b) => a + b, 0);

    /* -------- LABEL -------- */
    doc.setFont("helvetica", "bold");
    doc.text(cell.label, x, y);

    /* -------- COLON -------- */
    doc.text(":", x + LABEL_WIDTH, y);

    /* -------- VALUE -------- */
    doc.setFont("helvetica", "normal");
    const valueX = x + LABEL_WIDTH + VALUE_GAP;
    const maxValueWidth = colWidth - LABEL_WIDTH - 8;

    const wrappedLines = doc.splitTextToSize(
      String(cell.value),
      maxValueWidth
    );

    maxLinesThisRow = Math.max(maxLinesThisRow, wrappedLines.length);

    wrappedLines.forEach((txt, i) => {
      doc.text(txt, valueX, y + i * lineHeight);
    });
  });

  // calculate final row height
  rowHeights[r] = INNER_CELL_MARGIN + maxLinesThisRow * lineHeight;
});


  // total height = sum of all row heights + small bottom padding
  const guestInfoHeight = rowHeights.reduce((a, b) => a + b, 0) + 3;

  doc.setLineWidth(0.2);
  doc.line(MARGIN, infoStartY - 3, pageWidth - 2 * MARGIN, infoStartY - 3);
  // doc.line(
  //   MARGIN + colWidth,
  //   infoStartY - 3,
  //   MARGIN + colWidth,
  //   infoStartY - 3 + guestInfoHeight
  // );
  // doc.line(
  //   MARGIN + 2 * colWidth,
  //   infoStartY - 3,
  //   MARGIN + 2 * colWidth,
  //   infoStartY - 3 + guestInfoHeight
  // );

  currentY = infoStartY + guestInfoHeight;

  // --- Charges Table ---
  currentY = checkAndAddNewPage(doc, currentY, 65);
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
    margin: { left: MARGIN, right: MARGIN },
    tableWidth: pageWidth - 2 * MARGIN ,
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
      2: { cellWidth: 72, halign: "left" },
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
  });
  currentY = doc.lastAutoTable.finalY + 8;

  // --- Summary & Payment ---
  currentY = checkAndAddNewPage(doc, currentY, 55);
  const tableStartY = currentY - 5;
  const halfWidth = (pageWidth - 2 * MARGIN - 8) / 2;
  autoTable(doc, {
    head: [["Summary", "Amount"]],
    body: [
      ["Room Rent", (billData?.summary?.roomRent || 0).toFixed(2)],
      ...(billData?.summary?.foodPlan > 0
        ? [["Food Plan", (billData.summary.foodPlan || 0).toFixed(2)]]
        : []),
      ["SGST on Rent", (billData?.summary?.sgst || 0).toFixed(2)],
      ["CGST on Rent", (billData?.summary?.cgst || 0).toFixed(2)],
      ["Ac Restaurant", (billData?.summary?.restaurant || 0).toFixed(2)],
      ["Room Service", (billData?.summary?.roomService || 0).toFixed(2)],
      ["Total", (billData?.summary?.total || 0).toFixed(2)],
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
    billData?.payment?.advance > 0 && [
      "Less Advance:",
      (billData?.payment?.advance || 0).toFixed(2),
    ],
    ["Net Pay :", (billData?.payment?.netPay || 0).toFixed(2)],
  ].filter(Boolean),
    
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
  
  currentY = Math.max(doc.lastAutoTable.finalY, tableStartY + 60) + 10;

  // --- Footer: Key/Signature/Final message ---
  currentY = checkAndAddNewPage(doc, currentY, 55);
  const footerStartY = currentY - 5;
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
  // Sign boxes
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
  doc.text(`Page ${pageNo}`, pageWidth - MARGIN - 20, finalY + 10, {
    align: "center",
  });

  return finalY + 13;
};

// Main print/download logic unchanged
export const generateBillPrintPDF = async (
  billDataOrArray,
  isPrint = false
) => {
  console.log(billDataOrArray);
  const bills = Array.isArray(billDataOrArray)
    ? billDataOrArray
    : [billDataOrArray];
  if (!bills.length) return;
  const doc = new jsPDF("p", "mm", "a4");
  const totalPages = bills.length;
  for (let i = 0; i < bills.length; i++) {
    await drawSingleBill(doc, bills[i], i + 1, totalPages);
    if (i < bills.length - 1) doc.addPage();
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

export const handleBillPrintInvoice = async (billDataOrArray) => {
  await generateBillPrintPDF(billDataOrArray, true);
};

export const handleBillDownloadPDF = async (billDataOrArray) => {
  await generateBillPrintPDF(billDataOrArray, false);
};
