import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";

export const generateHotelInvoicePDF = async (invoiceData) => {
  const doc = new jsPDF("p", "mm", "a4");
  const pageWidth = doc.internal.pageSize.width;
  const pageHeight = doc.internal.pageSize.height;
  const margin = 10;
  let currentY = 0;

  // Helper function to format date
  const formatDate = (date) => {
    if (!date) return "";
    return new Date(date).toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "2-digit", 
      year: "numeric",
    });
  };

  // Add header to each page
  const addHeader = async () => {
    const startY = 10;
    const margin = 10;
    const maxWidth = pageWidth - (margin + 5) * 2;

    // Add Logo
    if (invoiceData.organization?.logo) {
      try {
        const base64Logo = await getBase64FromUrl(invoiceData.organization.logo);
        doc.addImage(base64Logo, "PNG", margin + 2, startY + 2, 30, 30);
      } catch (err) {
        console.warn("Logo could not be added:", err);
      }
    }

    // Organization name
    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");
    const orgName = invoiceData.organization?.name || "";
    const nameLines = doc.splitTextToSize(orgName, maxWidth - 40);
    doc.text(nameLines, pageWidth - (margin + 5), startY + 10, { align: "right" });

    // Organization details
    doc.setFontSize(9);
    doc.setFont("helvetica", "normal");
    let headerY = startY + 10 + nameLines.length * 6;

    const orgDetails = [
      invoiceData.organization?.address || `${invoiceData.organization?.flat || ""}, ${invoiceData.organization?.landmark || ""}`.replace(/^,\s*|,\s*$/g, ''),
      invoiceData.organization?.road,
      invoiceData.organization?.gstNum ? `GSTIN: ${invoiceData.organization.gstNum}` : null,
      `State Name: ${invoiceData.organization?.state || ""}, Pin: ${invoiceData.organization?.pin || ""}`,
      invoiceData.organization?.email ? `E-Mail: ${invoiceData.organization.email}` : null,
    ].filter(Boolean);

    orgDetails.forEach((detail) => {
      doc.text(detail, pageWidth - (margin + 5), headerY, { align: "right" });
      headerY += 5;
    });

    const headerHeight = Math.max(headerY - startY + 5, 40);
    doc.setLineWidth(0.5);
    doc.rect(margin, startY, pageWidth - 2 * margin, headerHeight);
    return startY + headerHeight + 5;
  };

  // Add footer
  const addFooter = () => {
    const footerY = pageHeight - 15;
    doc.setFontSize(8);
    doc.text(`Page ${doc.internal.getNumberOfPages()}`, pageWidth / 2, footerY + 5, { align: "center" });
  };

  // Start PDF generation
  currentY = await addHeader();

  // Invoice Details Section - 3 column grid
  doc.setFontSize(8);
  doc.setFont("helvetica", "normal");
  const columnWidth = (pageWidth - 2 * margin) / 3;

  // Dynamic column data from your component
  const leftDetails = [
    `GRC No: ${invoiceData.selectedCheckOutData?.voucherNumber || ""}`,
    `Pax: ${invoiceData.totalPax || ""}`,
    `Guest: ${invoiceData.selectedCheckOutData?.customerName || ""}`,
    `Agent: ${invoiceData.selectedCheckOutData?.agentId?.name || "Walk-In Customer"}`,
  ];

  const middleDetails = [
    `Bill No: ${invoiceData.selectedCheckOutData?.voucherNumber || ""}`,
    `Arrival: ${formatDate(invoiceData.selectedCheckOutData?.arrivalDate)} / ${invoiceData.selectedCheckOutData?.arrivalTime || ""}`,
    `Room No: ${invoiceData.roomNumbers || ""}`,
    `Plan: ${invoiceData.foodPlan || ""}`,
  ];

  const rightDetails = [
    `Bill Date: ${formatDate(new Date())}`,
    `Departure: ${formatDate(new Date())} / ${new Date().toLocaleTimeString("en-US", { hour12: true, hour: "2-digit", minute: "2-digit", second: "2-digit" })}`,
    `Room Type: ${invoiceData.roomType || ""}`,
    `Tariff: ${invoiceData.tariff || ""}`,
  ];

  // Draw columns
  [leftDetails, middleDetails, rightDetails].forEach((column, colIndex) => {
    const x = margin + colIndex * columnWidth + 2;
    column.forEach((item, rowIndex) => {
      const y = currentY + rowIndex * 4;
      doc.text(item, x, y);
    });
  });

  // Grid border and separators
  doc.setLineWidth(0.5);
  doc.rect(margin, currentY - 5, pageWidth - 2 * margin, 21);
  doc.line(margin + columnWidth, currentY - 5, margin + columnWidth, currentY - 5 + 21);
  doc.line(margin + 2 * columnWidth, currentY - 5, margin + 2 * columnWidth, currentY - 5 + 21);
  currentY += 16;

  // Main Transaction Table - Dynamic Data
  const tableHeaders = ["DATE", "VOUCHER", "DESCRIPTION", "HSN", "DEBIT", "CREDIT", "AMOUNT"];
  const tableData = [];

  // Outstanding Transactions (Advances)
  if (invoiceData.outStanding && invoiceData.outStanding.length > 0) {
    invoiceData.outStanding.forEach((transaction) => {
      tableData.push([
        formatDate(transaction?.bill_date),
        transaction?.bill_no || "",
        "Advance",
        "",
        "",
        (transaction?.bill_amount || 0).toFixed(2),
        "",
      ]);
    });
  }

  // Room Tariff Entries
  if (invoiceData.dateWiseDisplayedData && invoiceData.dateWiseDisplayedData.length > 0) {
    invoiceData.dateWiseDisplayedData.forEach((order) => {
      tableData.push([
        order?.date,
        order?.voucherNumber || "",
        `Room Tariff [${order?.roomName || ""} - ${order?.customerName || ""}]`,
        order?.hsn || "",
        (order?.baseAmount || 0).toFixed(2),
        "",
        "",
      ]);
    });
  }

  // Assessable value summary
  const roomTariffTotal = invoiceData.totals?.roomTariffTotal || 0;
  tableData.push(["", "", "Room Tariff Assessable Value", "", roomTariffTotal.toFixed(2), "", ""]);

  // Food plan
  if (invoiceData.foodPlanAmount && invoiceData.foodPlanAmount > 0) {
    tableData.push(["", "", "Food Plan Sales", "", invoiceData.foodPlanAmount.toFixed(2), "", ""]);
  }

  // Additional pax
  if (invoiceData.additionalPaxAmount && invoiceData.additionalPaxAmount > 0) {
    tableData.push(["", "", "Additional Pax Amount", "", invoiceData.additionalPaxAmount.toFixed(2), "", ""]);
  }

  // Tax entries
  const cgstAmount = (invoiceData.totals?.taxData || 0) / 2;
  const sgstAmount = (invoiceData.totals?.taxData || 0) / 2;
  tableData.push(["", "", "CGST", "", cgstAmount.toFixed(2), "", ""]);
  tableData.push(["", "", "SGST", "", sgstAmount.toFixed(2), "", ""]);

  // Room summary
  const roomNumbers = invoiceData.roomNumbers || "";
  const totalDebit = (invoiceData.totals?.totalAmountIncludeAllTax || 0);
  const totalCredit = (invoiceData.totals?.advanceTotal || 0);
  const balanceAmount = (invoiceData.totals?.balanceAmount || 0);
  
  tableData.push([
    "",
    "",
    `ROOM NO : ${roomNumbers}`,
    "",
    totalDebit.toFixed(2),
    totalCredit.toFixed(2),
    balanceAmount.toFixed(2),
  ]);

  // Room service header and entries
  if (invoiceData.kotData && invoiceData.kotData.length > 0) {
    tableData.push(["", "", "ROOM SERVICE BILL DETAILS", "", "", "", ""]);
    
    // KOT entries
    invoiceData.kotData.forEach((kot) => {
      tableData.push([
        formatDate(kot?.createdAt),
        kot?.salesNumber || kot?.voucherNumber || "",
        "POS [Restaurant]",
        "",
        (kot?.finalAmount || 0).toFixed(2),
        "",
        "",
      ]);
    });
  }

  // Final totals
  const kotTotal = invoiceData.totals?.kotTotal || 0;
  const grandTotal = invoiceData.totals?.sumOfRestaurantAndRoom || 0;
  
  tableData.push(["", "", "", "Total", (roomTariffTotal + kotTotal).toFixed(2), "", grandTotal.toFixed(2)]);
  tableData.push(["", "", "", "", "", "TOTAL", grandTotal.toFixed(2)]);

  // Create main table
  autoTable(doc, {
    head: [tableHeaders],
    body: tableData,
    startY: currentY,
    columnStyles: {
      0: { cellWidth: 22, halign: "left" },
      1: { cellWidth: 26, halign: "left" },
      2: { cellWidth: 60, halign: "left" },
      3: { cellWidth: 18, halign: "left" },
      4: { cellWidth: 22, halign: "right" },
      5: { cellWidth: 22, halign: "right" },
      6: { cellWidth: 20, halign: "right" },
    },
    styles: {
      fontSize: 8,
      cellPadding: 1,
      lineColor: [0, 0, 0],
      lineWidth: 0.5,
      textColor: [0, 0, 0],
      valign: "middle",
    },
    headStyles: {
      fillColor: [240, 240, 240],
      textColor: [0, 0, 0],
      fontStyle: "bold",
      halign: "center",
    },
    margin: { left: margin, right: margin },
    didDrawPage: () => {
      addHeader();
      addFooter();
    },
    didParseCell: (data) => {
      const cellText = data.cell.text[0] || "";
      
      if (
        cellText.includes("Room Tariff Assessable Value") ||
        cellText.includes("Total") ||
        cellText.includes("TOTAL INVOICE AMOUNT")
      ) {
        data.cell.styles.fillColor = [240, 240, 240];
        data.cell.styles.fontStyle = "bold";
      }
      
      if (cellText.includes("ROOM SERVICE BILL DETAILS")) {
        data.cell.styles.fillColor = [200, 255, 200];
        data.cell.styles.fontStyle = "bold";
        data.cell.styles.halign = "center";
      }
      
      if (cellText.includes("ROOM NO :")) {
        data.cell.styles.fontStyle = "bold";
      }
    },
  });

  currentY = doc.lastAutoTable.finalY + 5;

  // Dynamic Tax Breakdown Table
  const taxTableData = [];
  
  // Room tariff tax
  if (roomTariffTotal > 0) {
    const roomTaxRate = invoiceData.totals?.taxRate || 0;
    const roomTaxAmount = (invoiceData.totals?.taxAmount || 0) / 2;
    taxTableData.push([
      roomTariffTotal.toFixed(2),
      (roomTaxRate / 2).toFixed(2),
      roomTaxAmount.toFixed(2),
      (roomTaxRate / 2).toFixed(2),
      roomTaxAmount.toFixed(2),
      (roomTaxAmount * 2).toFixed(2),
    ]);
  }

  // Food plan tax (if applicable)
  if (invoiceData.foodPlanAmount && invoiceData.foodPlanAmount > 0) {
    const foodTaxRate = invoiceData.totals?.taxRateFoodPlan || 0;
    const foodTaxAmount = (invoiceData.totals?.taxAmountFoodPlan || 0) / 2;
    taxTableData.push([
      invoiceData.foodPlanAmount.toFixed(2),
      (foodTaxRate / 2).toFixed(2),
      foodTaxAmount.toFixed(2),
      (foodTaxRate / 2).toFixed(2),
      foodTaxAmount.toFixed(2),
      (foodTaxAmount * 2).toFixed(2),
    ]);
  }

  // Total tax row
  const totalTaxableAmount = roomTariffTotal + (invoiceData.foodPlanAmount || 0);
  const totalCGST = cgstAmount;
  const totalSGST = sgstAmount;
  const totalTaxAmount = totalCGST + totalSGST;

  if (totalTaxableAmount > 0) {
    taxTableData.push([
      totalTaxableAmount.toFixed(2),
      "",
      totalCGST.toFixed(2),
      "",
      totalSGST.toFixed(2),
      totalTaxAmount.toFixed(2),
    ]);
  }

  // Create tax breakdown table only if there's tax data
  if (taxTableData.length > 0) {
    autoTable(doc, {
      head: [
        [
          "Taxable",
          { content: "CGST", colSpan: 2 },
          { content: "SGST", colSpan: 2 },
          "Total"
        ],
        ["Amount", "Rate", "Amount", "Rate", "Amount", "Tax"]
      ],
      body: taxTableData,
      startY: currentY,
      margin: { left: pageWidth / 2 + 5, right: margin },
      columnStyles: {
        0: { halign: "right", cellWidth: 18 },
        1: { halign: "center", cellWidth: 12 },
        2: { halign: "right", cellWidth: 15 },
        3: { halign: "center", cellWidth: 12 },
        4: { halign: "right", cellWidth: 15 },
        5: { halign: "right", cellWidth: 15 },
      },
      styles: {
        fontSize: 7,
        cellPadding: 1,
        lineColor: [0, 0, 0],
        lineWidth: 0.5,
      },
      headStyles: {
        fillColor: [0, 0, 0],
        textColor: [255, 255, 255],
        fontStyle: "bold",
        halign: "center",
      },
      didParseCell: (data) => {
        if (data.section === "body" && data.row.index === taxTableData.length - 1) {
          data.cell.styles.fontStyle = "bold";
          data.cell.styles.fillColor = [240, 240, 240];
        }
      },
    });
  }

  currentY = Math.max(currentY + 30, doc.lastAutoTable.finalY + 15);

  // Dynamic Footer Details
  doc.setFontSize(8);
  doc.setFont("helvetica", "normal");

  // Left side - Settlement details
  const leftColumn1 = [
    "Settlement: Cash",
    `Prepared By: ${invoiceData.secondaryUser?.name || "System"}`,
    "Billed By: Reception",
  ];

  const leftColumn2 = [
    `Rooms: ${roomNumbers}`,
    `Total Rooms: ${invoiceData.selectedCheckOutData?.selectedRooms?.length || 0}`,
    `Total Pax: ${invoiceData.totalPax || 0}`,
  ];

  leftColumn1.forEach((detail, index) => {
    doc.text(detail, margin + 2, currentY + index * 4);
  });

  leftColumn2.forEach((detail, index) => {
    doc.text(detail, margin + 65, currentY + index * 4);
  });

  // Right side - Dynamic Bank Details
  const bankX = pageWidth / 2 + 30;
  doc.setFont("helvetica", "bold");
  doc.text("Bank Details", bankX + 25, currentY, { align: "center" });
  doc.setLineWidth(0.3);
  doc.line(bankX + 5, currentY + 1, bankX + 45, currentY + 1);

  doc.setFont("helvetica", "normal");
  const bankDetails = [
    `Bank Name: ${invoiceData.organization?.configurations[0]?.bank?.acholder_name || ""}`,
    `A/C Number: ${invoiceData.organization?.configurations[0]?.bank?.ac_no || ""}`,
    `Branch & IFSC: ${invoiceData.organization?.configurations?.[0]?.bank?.branch || ""}${
      invoiceData.organization?.configurations?.[0]?.bank?.ifsc 
        ? ", " + invoiceData.organization.configurations[0].bank.ifsc 
        : ""
    }`,
  ];

  bankDetails.forEach((detail, index) => {
    doc.text(detail, bankX, currentY + 5 + index * 4);
  });

  // Signature lines
  const sigY = currentY + 20;
  doc.setLineWidth(0.3);
  doc.line(margin + 10, sigY, margin + 60, sigY);
  doc.line(pageWidth - 80, sigY, pageWidth - 30, sigY);

  doc.setFontSize(8);
  doc.text("Cashier Signature", margin + 35, sigY + 4, { align: "center" });
  doc.text("Guest Signature", pageWidth - 55, sigY + 4, { align: "center" });

  // Add footer to all pages
  const totalPages = doc.internal.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    addFooter();
  }

  return doc;
};

// Updated handler functions with proper data extraction
export const handlePrintInvoice = async (invoiceData = {}) => {
  try {
    const doc = await generateHotelInvoicePDF(invoiceData);
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
  } catch (error) {
    console.error("Error generating PDF:", error);
    alert("Error generating PDF. Please check console for details.");
  }
};

export const handleDownloadPDF = async (invoiceData = {}, filename) => {
  try {
    const doc = await generateHotelInvoicePDF(invoiceData);
    const defaultFilename = `CheckOut-${invoiceData.selectedCheckOutData?.voucherNumber || "CO-001-2025"}.pdf`;
    doc.save(filename || defaultFilename);
  } catch (error) {
    console.error("Error generating PDF:", error);
    alert("Error generating PDF. Please check console for details.");
  }
};

async function getBase64FromUrl(url) {
  // Force HTTPS if it starts with http://
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
}

