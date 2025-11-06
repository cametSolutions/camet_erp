import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";

// Helper function to format date
const formatDate = (date) => {
  if (!date) return "";
  return new Date(date).toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
};

// Helper to get base64 from URL
async function getBase64FromUrl(url) {
  try {
    if (url.startsWith("http://")) {
      url = url.replace("http://", "https://");
    }
    const response = await fetch(url);
    const blob = await response.blob();
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result);
      reader.readAsDataURL(blob);
    });
  } catch (error) {
    console.warn("Error loading image:", error);
    return null;
  }
}

// Function to convert number to words (simplified)
function convertNumberToWords(amount) {
  const num = Math.round(amount);
  return `${num} Rupees Only`;
}

// Main Bill Print PDF Generator
export const generateBillPrintPDF = async (billData, isPrint = false) => {
  const doc = new jsPDF("p", "mm", "a4");
  const pageWidth = doc.internal.pageSize.width;
  const pageHeight = doc.internal.pageSize.height;
  const margin = 10;
  let currentY = margin;

  // Add Header Section
  const addHeader = async () => {
    const headerStartY = currentY;
    
    // Add Logo if available
    if (billData?.hotel?.logo) {
      try {
        const base64Logo = await getBase64FromUrl(billData.hotel.logo);
        if (base64Logo) {
          doc.addImage(base64Logo, "PNG", margin + 2, headerStartY + 2, 30, 30);
        }
      } catch (err) {
        console.warn("Logo could not be added:", err);
      }
    }

    // Organization details on the right
    const rightX = pageWidth - margin - 5;
    let headerY = headerStartY + 10;

    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");
    doc.text((billData?.hotel?.name || "").toUpperCase(), rightX, headerY, { align: "right" });
    headerY += 5;

    doc.setFontSize(8);
    doc.setFont("helvetica", "normal");
    
    const headerDetails = [
      billData?.hotel?.address,
      `Phone: ${billData?.hotel?.phone || ""}`,
      `E-mail: ${billData?.hotel?.email || ""} | Website: ${billData?.hotel?.website || ""}`,
      `PAN NO: ${billData?.hotel?.pan || ""} | GSTIN: ${billData?.hotel?.gstin || ""}`,
      `SAC CODE-${billData?.hotel?.sacCode || ""}`
    ].filter(Boolean);

    headerDetails.forEach(line => {
      doc.text(line, rightX, headerY, { align: "right" });
      headerY += 3.5;
    });

    const headerHeight = Math.max(headerY - headerStartY + 3, 38);
    doc.setLineWidth(0.5);
    doc.rect(margin, headerStartY, pageWidth - 2 * margin, headerHeight);
    
    return headerStartY + headerHeight + 3;
  };

  currentY = await addHeader();

  // Guest Information Section
  doc.setFontSize(8);
  doc.setFont("helvetica", "normal");
  
  const colWidth = (pageWidth - 2 * margin) / 3;
  const infoStartY = currentY;
  
  const guestInfoRows = [
    [
      `GRC No: ${billData?.guest?.billNo || ""}`,
      `Bill No: ${billData?.guest?.billNo || ""}`,
      `Date: ${billData?.stay?.billDate || ""}`
    ],
    [
      `GUEST: ${billData?.guest?.name || ""}`,
      `Arrival: ${billData?.stay?.arrival || ""}`,
      `Departure: ${billData?.stay?.departure || ""}`
    ],
    [
      `Address: ${billData?.guest?.address || ""}`,
      "",
      `Plan: ${billData?.stay?.plan || ""} Pax ${billData?.stay?.pax || ""}`
    ],
    [
      `Phone: ${billData?.guest?.phone || ""}`,
      `Tariff: ${billData?.stay?.tariff || ""}`,
      `No. of Days: ${billData?.stay?.days || ""}`
    ],
    [
      `Travel Agent: ${billData?.guest?.travelAgent || ""}`,
      "",
      ""
    ],
    [
      `GST No: ${billData?.guest?.gstNo || ""}`,
      "",
      ""
    ],
    [
      `Company: ${billData?.hotel?.name || ""}`,
      "",
      ""
    ],
    [
      `Room No: ${billData?.guest?.roomNo || ""}`,
      "",
      ""
    ]
  ];

  guestInfoRows.forEach((row, rowIndex) => {
    row.forEach((cell, colIndex) => {
      if (cell) {
        doc.text(cell, margin + 2 + (colIndex * colWidth), currentY + (rowIndex * 4));
      }
    });
  });

  const guestInfoHeight = guestInfoRows.length * 4 + 2;
  doc.setLineWidth(0.5);
  doc.rect(margin, infoStartY - 2, pageWidth - 2 * margin, guestInfoHeight);
  // Column separators
  doc.line(margin + colWidth, infoStartY - 2, margin + colWidth, infoStartY - 2 + guestInfoHeight);
  doc.line(margin + 2 * colWidth, infoStartY - 2, margin + 2 * colWidth, infoStartY - 2 + guestInfoHeight);
  
  currentY += guestInfoHeight + 3;

  // Main Charges Table
  const chargesHeaders = [["Date", "Doc No", "Description", "Amount", "Taxes", "Advance", "Balance"]];
  const chargesBody = (billData?.charges || []).map(charge => [
    charge.date || "",
    charge.docNo || "",
    charge.description || "",
    charge.amount ? charge.amount.toFixed(2) : "",
    charge.taxes || "",
    charge.advance || "",
    charge.balance || ""
  ]);

  autoTable(doc, {
    head: chargesHeaders,
    body: chargesBody,
    startY: currentY,
    margin: { left: margin, right: margin },
    styles: {
      fontSize: 8,
      cellPadding: 1.5,
      lineColor: [0, 0, 0],
      lineWidth: 0.5,
      textColor: [0, 0, 0],
    },
    headStyles: {
      fillColor: [245, 245, 245],
      textColor: [0, 0, 0],
      fontStyle: "bold",
      halign: "center",
    },
    columnStyles: {
      0: { cellWidth: 22, halign: "left" },
      1: { cellWidth: 20, halign: "center" },
      2: { cellWidth: 58, halign: "left" },
      3: { cellWidth: 22, halign: "right" },
      4: { cellWidth: 20, halign: "right" },
      5: { cellWidth: 20, halign: "right" },
      6: { cellWidth: 20, halign: "right" },
    },
    didParseCell: (data) => {
      const text = data.cell.text[0] || "";
      if (text.includes("Advance")) {
        data.cell.styles.fontStyle = "bold";
      }
      if (text.includes("CGST") || text.includes("SGST")) {
        data.cell.styles.fillColor = [240, 240, 240];
      }
      if (text === "Restaurant") {
        data.cell.styles.fontStyle = "bold";
      }
    }
  });

  currentY = doc.lastAutoTable.finalY + 5;

  // Summary and Payment Tables Side by Side
  const tableStartY = currentY;
  const leftTableWidth = (pageWidth - 2 * margin - 5) / 2;
  const rightTableX = margin + leftTableWidth + 5;

  // Summary Table (Left)
  const summaryHeaders = [["Summary", "Amount"]];
  const summaryBody = [
    ["Room Rent", (billData?.summary?.roomRent || 0).toFixed(2)],
  ];
  
  if (billData?.summary?.foodPlan > 0) {
    summaryBody.push(["Food Plan", billData.summary.foodPlan.toFixed(2)]);
  }
  
  summaryBody.push(
    ["SGST on Rent", (billData?.summary?.sgst || 0).toFixed(2)],
    ["CGST on Rent", (billData?.summary?.cgst || 0).toFixed(2)],
    ["Ac Restaurant", (billData?.summary?.restaurant || 0).toFixed(2)],
    ["Room Service", (billData?.summary?.roomService || 0).toFixed(2)],
    ["Total", (billData?.summary?.total || 0).toFixed(2)]
  );

  autoTable(doc, {
    head: summaryHeaders,
    body: summaryBody,
    startY: tableStartY,
    margin: { left: margin, right: rightTableX },
    tableWidth: leftTableWidth,
    styles: {
      fontSize: 9,
      cellPadding: 2,
      lineColor: [0, 0, 0],
      lineWidth: 0.5,
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
    didParseCell: (data) => {
      if (data.row.index === summaryBody.length - 1 && data.section === "body") {
        data.cell.styles.fillColor = [245, 245, 245];
        data.cell.styles.fontStyle = "bold";
      }
    }
  });

  // Payment Details Table (Right)
  const paymentHeaders = [["Payment Details", ""]];
  const paymentBody = [
    ["PAYMODE", "AMOUNT"],
    [billData?.payment?.mode || "Credit", (billData?.payment?.total || 0).toFixed(2)],
    [{ content: billData?.guest?.name || "", colSpan: 2, styles: { halign: "center", fontStyle: "bold" } }],
    [{ content: billData?.summary?.totalWords || "", colSpan: 2, styles: { fontSize: 8 } }],
    ["Total :", (billData?.payment?.total || 0).toFixed(2)],
    ["Less Advance:", (billData?.payment?.advance || 0).toFixed(2)],
    ["Net Pay :", (billData?.payment?.netPay || 0).toFixed(2)]
  ];

  autoTable(doc, {
    head: paymentHeaders,
    body: paymentBody,
    startY: tableStartY,
    margin: { left: rightTableX, right: margin },
    tableWidth: leftTableWidth,
    styles: {
      fontSize: 9,
      cellPadding: 2,
      lineColor: [0, 0, 0],
      lineWidth: 0.5,
    },
    headStyles: {
      fillColor: [245, 245, 245],
      textColor: [0, 0, 0],
      fontStyle: "bold",
      halign: "left",
      colSpan: 2,
    },
    columnStyles: {
      0: { halign: "left" },
      1: { halign: "right" },
    },
    didParseCell: (data) => {
      if (data.row.index === 0 && data.section === "body") {
        data.cell.styles.fontStyle = "bold";
        data.cell.styles.halign = data.column.index === 0 ? "left" : "center";
      }
      if (data.row.index === paymentBody.length - 1 && data.section === "body") {
        data.cell.styles.fontStyle = "bold";
      }
    }
  });

  currentY = Math.max(doc.lastAutoTable.finalY, tableStartY + 60) + 5;

  // Footer Section
  doc.setLineWidth(0.5);
  const footerStartY = currentY;
  
  // Top footer section
  doc.rect(margin, footerStartY, pageWidth - 2 * margin, 15);
  doc.line(margin + (pageWidth - 2 * margin) / 2, footerStartY, margin + (pageWidth - 2 * margin) / 2, footerStartY + 15);
  
  doc.setFontSize(8);
  doc.setFont("helvetica", "bold");
  doc.text("Please Deposit Your Room and Locker Keys", margin + 2, footerStartY + 5);
  
  doc.setFont("helvetica", "normal");
  const disclaimerText = doc.splitTextToSize(
    "Regardless of charge instructions, I agree to be held personally liable for the payment of total amount of bill. Please collect receipt if you have paid cash.",
    (pageWidth - 2 * margin) / 2 - 4
  );
  doc.text(disclaimerText, margin + (pageWidth - 2 * margin) / 2 + 2, footerStartY + 4);

  // Signature section
  const sigStartY = footerStartY + 15;
  doc.rect(margin, sigStartY, pageWidth - 2 * margin, 25);
  doc.line(margin + (pageWidth - 2 * margin) / 3, sigStartY, margin + (pageWidth - 2 * margin) / 3, sigStartY + 25);
  doc.line(margin + 2 * (pageWidth - 2 * margin) / 3, sigStartY, margin + 2 * (pageWidth - 2 * margin) / 3, sigStartY + 25);
  
  doc.setFont("helvetica", "bold");
  doc.text("Prepared By", margin + 2, sigStartY + 5);
  doc.text("Manager", margin + (pageWidth - 2 * margin) / 3 + 2, sigStartY + 5);
  doc.text("Guest Signature & Date", margin + 2 * (pageWidth - 2 * margin) / 3 + 2, sigStartY + 5);
  
  doc.setFont("helvetica", "normal");
  doc.text("FO", margin + 2, sigStartY + 20);

  // Bottom footer
  const bottomFooterY = sigStartY + 25;
  doc.rect(margin, bottomFooterY, pageWidth - 2 * margin, 10);
  doc.line(pageWidth - margin - 30, bottomFooterY, pageWidth - margin - 30, bottomFooterY + 10);
  
  doc.setFontSize(7);
  doc.setFont("helvetica", "italic");
  doc.text("We hope you enjoyed your stay and would like to welcome you back...", margin + 2, bottomFooterY + 5);
  
  doc.setFont("helvetica", "normal");
  doc.text("Original Bill", pageWidth - margin - 25, bottomFooterY + 4, { align: "center" });
  doc.text("Page 1", pageWidth - margin - 25, bottomFooterY + 8, { align: "center" });

  // Return PDF based on action
  if (isPrint) {
    const pdfBlob = doc.output("blob");
    const pdfUrl = URL.createObjectURL(pdfBlob);
    const printWindow = window.open(pdfUrl, "_blank");

    if (printWindow) {
      printWindow.onload = () => {
        printWindow.print();
        setTimeout(() => URL.revokeObjectURL(pdfUrl), 1000);
      };
    } else {
      alert("Please allow popups to print the invoice");
    }
  } else {
    const filename = `Bill-${billData?.guest?.billNo || "Invoice"}.pdf`;
    doc.save(filename);
  }
};

// Export both functions
export const handleBillPrintInvoice = async (billData) => {
  await generateBillPrintPDF(billData, true);
};

export const handleBillDownloadPDF = async (billData) => {
  await generateBillPrintPDF(billData, false);
};