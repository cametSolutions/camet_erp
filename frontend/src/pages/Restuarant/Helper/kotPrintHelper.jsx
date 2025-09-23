import jsPDF from "jspdf";

// Constants - Optimized for thermal printers
const THERMAL_WIDTH = 58; // Reduced to 58mm for better fit
const PRINT_MARGINS = {
  left: 2,    // Minimal left margin
  right: 56,  // Adjusted right margin
  center: 29, // Center position
};

const TAX_RATE = 0.05; // 5% GST

// Helper Functions
const formatDateTime = (date) => {
  const orderDate = new Date(date || new Date());
  return {
    date: orderDate.toLocaleDateString("en-GB"),
    time: orderDate.toLocaleTimeString("en-GB", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true  // Changed to 12-hour format
    }),
  };
};

const validateOrderData = (orderData) => {
  if (!orderData?.kotNo || !Array.isArray(orderData.items)) {
    throw new Error("Invalid order data: Missing kotNo or items array");
  }
};

// PDF Helper Functions
const addCenteredText = (pdf, text, y, fontSize = 8) => {
  if (!text) return;
  pdf.setFontSize(fontSize);
  const textWidth = pdf.getTextWidth(text);
  pdf.text(text, PRINT_MARGINS.center - textWidth / 2, y);
};

const addJustifiedText = (pdf, leftText, rightText, y, fontSize = 6) => {
  pdf.setFontSize(fontSize);
  if (leftText) {
    pdf.text(leftText, PRINT_MARGINS.left, y);
  }
  if (rightText) {
    const rightTextWidth = pdf.getTextWidth(rightText);
    pdf.text(rightText, PRINT_MARGINS.right - rightTextWidth, y);
  }
};

const addDashedLine = (pdf, y) => {
  const dashLength = 1.5;
  const gapLength = 0.5;
  let currentX = PRINT_MARGINS.left;

  while (currentX < PRINT_MARGINS.right) {
    pdf.line(
      currentX,
      y,
      Math.min(currentX + dashLength, PRINT_MARGINS.right),
      y
    );
    currentX += dashLength + gapLength;
  }
};

// PDF Generation Functions
export const generateKitchenOrderTicket = (
  orderData,
  restaurantName = "ABC RESTAURANT"
) => {
  validateOrderData(orderData);

  const pdf = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: [THERMAL_WIDTH, 150], // Reduced height
  });

  pdf.setFont("courier", "normal");
  let yPos = 8;
  const { date, time } = formatDateTime(orderData.createdAt);

  // Header
  pdf.setFont("courier", "bold");
  addCenteredText(pdf, restaurantName, yPos, 10);
  yPos += 6;

  pdf.setFont("courier", "normal");
  addCenteredText(pdf, "KITCHEN ORDER TICKET", yPos, 8);
  yPos += 8;

  addDashedLine(pdf, yPos);
  yPos += 6;

  // Order Information - Abbreviated labels
  addJustifiedText(pdf, `KOT: ${orderData.kotNo}`, date, yPos, 5);
  yPos += 5;

  if (orderData.tableNo) {
    addJustifiedText(pdf, time, `T:${orderData.tableNo}`, yPos, 5);
  } else {
    addJustifiedText(pdf, time, "", yPos, 5);
  }
  yPos += 8;

  // Items Header
  pdf.setFont("courier", "bold");
  addJustifiedText(pdf, "SL ITEM", "QTY", yPos, 6);
  yPos += 4;

  addDashedLine(pdf, yPos);
  yPos += 4;

  // Order Items
  pdf.setFont("courier", "normal");
  orderData.items.forEach((item, index) => {
    if (item?.product_name || item?.name) {
      const itemName = item.product_name || item.name;
      // Truncate long item names
      const shortName = itemName.length > 15 ? itemName.substring(0, 15) + "..." : itemName;
      const itemText = `${index + 1} ${shortName}`;
      addJustifiedText(
        pdf,
        itemText,
        item.quantity?.toString() || "1",
        yPos,
        5
      );
      yPos += 4;
    }
  });

  yPos += 4;
  addDashedLine(pdf, yPos);
  yPos += 6;

  // Footer
  pdf.setFont("courier", "bold");
  addCenteredText(pdf, "** KITCHEN COPY **", yPos, 7);
  yPos += 5;

  pdf.setFont("courier", "normal");
  addCenteredText(pdf, "Prepare items as per order", yPos, 6);

  return pdf;
};

export const generateCustomerBill = (
  orderData,
  restaurantName = "ABC RESTAURANT",
  restaurantInfo = {}
) => {
  validateOrderData(orderData);

  const pdf = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: [THERMAL_WIDTH, 200],
  });

  pdf.setFont("courier", "normal");
  let yPos = 8;
  const { date, time } = formatDateTime(orderData.createdAt);

  // Header
  pdf.setFont("courier", "bold");
  addCenteredText(pdf, restaurantName, yPos, 10);
  yPos += 5;

  // Restaurant Info
  pdf.setFont("courier", "normal");
  if (restaurantInfo.address) {
    addCenteredText(pdf, restaurantInfo.address, yPos, 6);
    yPos += 3;
  }
  if (restaurantInfo.phone) {
    addCenteredText(pdf, `Tel: ${restaurantInfo.phone}`, yPos, 6);
    yPos += 3;
  }
  if (restaurantInfo.gst) {
    addCenteredText(pdf, `GST: ${restaurantInfo.gst}`, yPos, 6);
    yPos += 5;
  }

  addDashedLine(pdf, yPos);
  yPos += 6;

  // Bill Details
  addJustifiedText(pdf, `Bill: ${orderData.kotNo}`, date, yPos, 5);
  yPos += 4;

  if (orderData.tableNo) {
    addJustifiedText(pdf, `T:${orderData.tableNo}`, time, yPos, 5);
  } else {
    addJustifiedText(pdf, time, "", yPos, 5);
  }
  yPos += 6;

  addDashedLine(pdf, yPos);
  yPos += 4;

  // Items Header - Fixed positions for columns
  pdf.setFont("courier", "bold");
  pdf.setFontSize(5);
  pdf.text("ITEM", PRINT_MARGINS.left, yPos);
  pdf.text("Q", 30, yPos);
  pdf.text("RT", 38, yPos);
  pdf.text("AMT", 48, yPos);
  yPos += 3;

  addDashedLine(pdf, yPos);
  yPos += 3;

  // Items and Calculations
  pdf.setFont("courier", "normal");
  let subtotal = 0;

  orderData.items.forEach((item) => {
    if (item?.name || item?.product_name) {
      const itemName = item.name || item.product_name;
      const displayName = itemName.length > 12 ? itemName.substring(0, 12) : itemName;
      const price = item.price || 0;
      const quantity = item.quantity || 1;
      const itemTotal = price * quantity;

      subtotal += itemTotal;

      pdf.setFontSize(4);
      pdf.text(displayName, PRINT_MARGINS.left, yPos);
      pdf.text(quantity.toString(), 30, yPos);
      pdf.text(price.toString(), 38, yPos);
      pdf.text(itemTotal.toFixed(0), 48, yPos);
      yPos += 3;
    }
  });

  yPos += 2;
  addDashedLine(pdf, yPos);
  yPos += 4;

  // Totals
  pdf.setFont("courier", "bold");
  const taxAmount = subtotal * TAX_RATE;
  const grandTotal = subtotal + taxAmount;

  addJustifiedText(pdf, "SUBTOTAL:", `₹${subtotal.toFixed(0)}`, yPos, 5);
  yPos += 4;
  addJustifiedText(pdf, "GST (5%):", `₹${taxAmount.toFixed(0)}`, yPos, 5);
  yPos += 4;

  pdf.setFontSize(6);
  addJustifiedText(pdf, "TOTAL:", `₹${grandTotal.toFixed(0)}`, yPos, 6);
  yPos += 8;

  addDashedLine(pdf, yPos);
  yPos += 6;

  // Footer
  pdf.setFont("courier", "normal");
  addCenteredText(pdf, "Thank you for dining!", yPos, 6);
  yPos += 4;
  addCenteredText(pdf, "Please visit again", yPos, 5);

  return pdf;
};

// Print Functions
export const printThermalReceipt = (pdf, filename = "receipt") => {
  if (!pdf) return;

  const pdfBlob = pdf.output("blob");
  const blobUrl = URL.createObjectURL(pdfBlob);

  const iframe = document.createElement("iframe");
  iframe.style.display = "none";
  iframe.src = blobUrl;
  document.body.appendChild(iframe);

  iframe.onload = () => {
    iframe.contentWindow.print();
    setTimeout(() => {
      document.body.removeChild(iframe);
      URL.revokeObjectURL(blobUrl);
    }, 1000);
  };
};

export const downloadReceipt = (pdf, filename = "receipt.pdf") => {
  if (pdf) {
    pdf.save(filename);
  }
};

// HTML Print Function - Optimized for thermal printers
export const printDirectHTML = (
  orderData,
  restaurantName = "ABC RESTAURANT",
  isKOT = true
) => {
  if (!orderData) return;

  const { date, time } = formatDateTime(orderData.createdAt);
  const loggedUser = JSON.parse(localStorage.getItem("sUserData") || "{}");

  const styles = `
    <style>
      @media print {
        @page { size: 58mm auto; margin: 0; }
        body { margin: 0; padding: 2mm; }
      }
      body {
        font-family: 'Courier New', monospace;
        font-size: 12px;
        line-height: 1.1;
        width: 54mm;
        margin: 0 auto;
        padding: 2mm;
        border: 1px dashed #000;
        font-weight: bold
      }
      .header { text-align: center; margin-bottom: 4px; }
      .restaurant-name { font-size: 20px; font-weight: bold; margin-bottom: 2px; }
      .ticket-type { font-size: 16px; margin-bottom: 4px; }
      .divider { border-bottom: 1px dashed #000; margin: 3px 0; }
      .order-info { display: flex; justify-content: space-between; margin-bottom: 3px; font-size: 12px; }
      .items-header { display: flex; justify-content: space-between; font-weight: bold; margin-bottom: 2px; font-size: 12px; }
      .item-row { display: flex; justify-content: space-between; margin-bottom: 1px; font-size: 12px; }
      .footer { text-align: center; margin-top: 6px; font-weight: bold; font-size: 12px; }
      .totals { margin-top: 4px; }
      .total-row { display: flex; justify-content: space-between; margin-bottom: 2px; font-size: 12px; }
      .grid-header, .grid-row { display: grid; grid-template-columns: 3fr 1fr 1fr 1fr; gap: 1px; font-size: 12px; }
    </style>
  `;

  let content = "";

  if (isKOT) {
    content = `
      ${styles}
      <div class="header">
        <div class="restaurant-name">${restaurantName}</div>
        <div class="ticket-type">KOT</div>
      </div>
      <div class="divider"></div>
      <div class="order-info">
        <div>KOT: ${orderData.kotNo}</div>
        <div>${date}</div>
      </div>
      ${orderData.customerName ? `<div class="order-info"><div>Name: ${orderData.customerName}</div><div>Type: ${orderData.type || ''}</div></div>` : ''}
      ${loggedUser.name ? `<div class="order-info"><div>Staff: ${loggedUser.name}</div></div>` : ''}
      <div class="order-info">
        <div>${time}</div>
        ${orderData.tableNo ? `<div>T:${orderData.tableNo}</div>` : '<div></div>'}
      </div>
      <div class="items-header"><span>SL ITEM</span><span>QTY</span></div>
      <div class="divider"></div>
      ${orderData.items.map((item, index) => 
        item?.product_name || item?.name ? 
        `<div class="item-row"><span>${index + 1} ${(item.product_name || item.name).substring(0, 15)}</span><span>${item.quantity || 1}</span></div>` : ''
      ).join('')}
      <div class="divider"></div>
      <div class="footer">** KITCHEN COPY **<br>Prepare items as per order</div>
    `;
  } else {
    const subtotal = orderData.items.reduce(
      (sum, item) => sum + (item.price || 0) * (item.quantity || 1),
      0
    );
    const taxAmount = subtotal * TAX_RATE;
    const grandTotal = subtotal + taxAmount;

    content = `
      ${styles}
      <div class="header">
        <div class="restaurant-name">${restaurantName}</div>
        <div style="font-size: 4px;">123 Main Street, City</div>
        <div style="font-size: 4px;">Tel: +91 98765 43210</div>
      </div>
      <div class="divider"></div>
      <div class="order-info">
        <div>Bill: ${orderData.kotNo}</div>
        <div>${date}</div>
      </div>
      <div class="order-info">
        <div>${orderData.tableNo ? `T:${orderData.tableNo}` : ''}</div>
        <div>${time}</div>
      </div>
      <div class="divider"></div>
      <div class="grid-header"><span>ITEM</span><span>Q</span><span>RT</span><span>AMT</span></div>
      <div class="divider"></div>
      ${orderData.items.map(item => 
        item?.name || item?.product_name ? 
        `<div class="grid-row">
          <span>${(item.name || item.product_name).substring(0, 10)}</span>
          <span>${item.quantity || 1}</span>
          <span>₹${item.price || 0}</span>
          <span>₹${((item.price || 0) * (item.quantity || 1)).toFixed(0)}</span>
        </div>` : ''
      ).join('')}
      <div class="divider"></div>
      <div class="totals">
        <div class="total-row"><span>SUBTOTAL:</span><span>₹${subtotal.toFixed(0)}</span></div>
        <div class="total-row"><span>GST (5%):</span><span>₹${taxAmount.toFixed(0)}</span></div>
        <div class="total-row"><strong><span>TOTAL:</span><span>₹${grandTotal.toFixed(0)}</span></strong></div>
      </div>
      <div class="divider"></div>
      <div class="footer">Thank you for dining!<br>Please visit again</div>
    `;
  }

  const iframe = document.createElement("iframe");
  iframe.style.cssText = "position:fixed;right:0;bottom:0;width:0;height:0;border:none;";
  document.body.appendChild(iframe);

  const doc = iframe.contentDocument;
  doc.open();
  doc.write(`<!DOCTYPE html><html><head><title>${isKOT ? "KOT" : "Bill"}</title></head><body>${content}</body></html>`);
  doc.close();

  iframe.onload = () => {
    iframe.contentWindow.print();
    setTimeout(() => document.body.removeChild(iframe), 1000);
  };
};

// Main Export Functions
export const generateAndPrintKOT = (
  orderData,
  autoPrint = true,
  download = false,
  restaurantName = "ABC RESTAURANT",
  useHTML = true
) => {
  try {
    validateOrderData(orderData);

    if (useHTML && autoPrint) {
      printDirectHTML(orderData, restaurantName, true);
      return null;
    }

    const pdf = generateKitchenOrderTicket(orderData, restaurantName);
    if (download) downloadReceipt(pdf, `KOT_${orderData.kotNo}.pdf`);
    if (autoPrint) printThermalReceipt(pdf, "KOT");
    return pdf;
  } catch (error) {
    console.error("Error generating KOT:", error);
    throw error;
  }
};

export const generateAndPrintBill = (
  orderData,
  autoPrint = true,
  download = false,
  restaurantName = "ABC RESTAURANT",
  restaurantInfo,
  useHTML = true
) => {
  try {
    validateOrderData(orderData);

    if (useHTML && autoPrint) {
      printDirectHTML(orderData, restaurantName, false);
      return null;
    }

    const defaultInfo = restaurantInfo || {
      address: "123 Main Street, City",
      phone: "+91 98765 43210",
      gst: "22AAAAA0000A1Z5",
    };

    const pdf = generateCustomerBill(orderData, restaurantName, defaultInfo);
    if (download) downloadReceipt(pdf, `Bill_${orderData.kotNo}.pdf`);
    if (autoPrint) printThermalReceipt(pdf, "Bill");
    return pdf;
  } catch (error) {
    console.error("Error generating bill:", error);
    throw error;
  }
};
