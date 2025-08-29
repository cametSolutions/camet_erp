import jsPDF from "jspdf";
import { useSelector } from "react-redux";

export const generateKitchenOrderTicket = (
  orderData,
  restaurantName = "ABC RESTAURANT"
) => {
  // Validate required data
  if (
    !orderData ||
    !orderData.kotNo ||
    !orderData.items ||
    !Array.isArray(orderData.items)
  ) {
    throw new Error("Invalid order data: Missing kotNo or items array");
  }

  // Create PDF with thermal printer dimensions (80mm width)
  const pdf = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: [80, 200], // 80mm width, 200mm initial height (will auto-adjust)
  });

  // Set font to monospace for thermal printer style
  pdf.setFont("courier", "normal");

  let yPos = 10; // Starting Y position
  const leftMargin = 5;
  const rightMargin = 75;
  const centerX = 40;

  // Helper function to add centered text
  const addCenteredText = (text, y, fontSize = 10) => {
    if (text) {
      pdf.setFontSize(fontSize);
      const textWidth = pdf.getTextWidth(text);
      pdf.text(text, centerX - textWidth / 2, y);
    }
  };

  // Helper function to add left-right justified text
  const addJustifiedText = (leftText, rightText, y, fontSize = 8) => {
    pdf.setFontSize(fontSize);
    if (leftText) {
      pdf.text(leftText, leftMargin, y);
    }
    if (rightText) {
      const rightTextWidth = pdf.getTextWidth(rightText);
      pdf.text(rightText, rightMargin - rightTextWidth, y);
    }
  };

  // Helper function to add dashed line
  const addDashedLine = (y) => {
    const dashLength = 2;
    const gapLength = 1;
    let currentX = leftMargin;

    while (currentX < rightMargin) {
      pdf.line(currentX, y, Math.min(currentX + dashLength, rightMargin), y);
      currentX += dashLength + gapLength;
    }
  };

  // Header - Restaurant Name
  if (restaurantName) {
    pdf.setFont("courier", "bold");
    addCenteredText(restaurantName, yPos, 14);
    yPos += 8;
  }

  // Header - Ticket Type
  pdf.setFont("courier", "normal");
  addCenteredText("KITCHEN ORDER TICKET", yPos, 12);
  yPos += 10;

  // Dashed line separator
  addDashedLine(yPos);
  yPos += 8;

  // Order Information
  const orderDate = new Date(orderData.createdAt || new Date());
  const formattedDate = orderDate.toLocaleDateString("en-GB");
  const formattedTime = orderDate.toLocaleTimeString("en-GB", {
    hour: "2-digit",
    minute: "2-digit",
  });

  // KOT Number and Date
  if (orderData.kotNo) {
    addJustifiedText(
      `KOT No: ${orderData.kotNo}`,
      `Date: ${formattedDate}`,
      yPos
    );
    yPos += 6;
  }

  // Conditional table number rendering for KOT
  if (orderData?.tableNo) {
    addJustifiedText(
      `Time: ${formattedTime}`,
      `Table: ${orderData.tableNo}`,
      yPos
    );
  } else {
    addJustifiedText(`Time: ${formattedTime}`, "", yPos);
  }
  yPos += 10;

  // Items Header
  pdf.setFont("courier", "bold");
  addJustifiedText("SL  ITEM", "QTY", yPos, 9);
  yPos += 5;

  // Dashed line separator
  addDashedLine(yPos);
  yPos += 6;

  // Order Items with validation
  if (orderData.items && orderData.items.length > 0) {
    pdf.setFont("courier", "normal");
    orderData.items.forEach((item, index) => {
      if (item && (item.product_name || item.name) && item.quantity) {
        const serialNo = (index + 1).toString();
        const itemName = item.product_name || item.name || "Unknown Item";
        const itemText = `${serialNo}   ${itemName}`;
        const qtyText = item.quantity.toString();

        addJustifiedText(itemText, qtyText, yPos, 9);
        yPos += 5;
      }
    });
  }

  yPos += 5;
  // Bottom dashed line
  addDashedLine(yPos);
  yPos += 10;

  // Footer
  pdf.setFont("courier", "bold");
  addCenteredText("** KITCHEN COPY **", yPos, 10);
  yPos += 6;

  pdf.setFont("courier", "normal");
  addCenteredText("Prepare items as per order", yPos, 9);
  yPos += 10;

  // Print timestamp
  pdf.setFontSize(8);
  addCenteredText(`Printed: ${formattedDate}, ${formattedTime}`, yPos);

  return pdf;
};

export const generateCustomerBill = (
  orderData,
  restaurantName = "ABC RESTAURANT",
  restaurantInfo = {}
) => {
  // Validate required data
  if (
    !orderData ||
    !orderData.kotNo ||
    !orderData.items ||
    !Array.isArray(orderData.items)
  ) {
    throw new Error("Invalid order data: Missing kotNo or items array");
  }

  const pdf = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: [80, 250],
  });

  pdf.setFont("courier", "normal");

  let yPos = 10;
  const leftMargin = 5;
  const rightMargin = 75;
  const centerX = 40;

  const addCenteredText = (text, y, fontSize = 10) => {
    if (text) {
      pdf.setFontSize(fontSize);
      const textWidth = pdf.getTextWidth(text);
      pdf.text(text, centerX - textWidth / 2, y);
    }
  };

  const addJustifiedText = (leftText, rightText, y, fontSize = 8) => {
    pdf.setFontSize(fontSize);
    if (leftText) {
      pdf.text(leftText, leftMargin, y);
    }
    if (rightText) {
      const rightTextWidth = pdf.getTextWidth(rightText);
      pdf.text(rightText, rightMargin - rightTextWidth, y);
    }
  };

  const addDashedLine = (y) => {
    const dashLength = 2;
    const gapLength = 1;
    let currentX = leftMargin;

    while (currentX < rightMargin) {
      pdf.line(currentX, y, Math.min(currentX + dashLength, rightMargin), y);
      currentX += dashLength + gapLength;
    }
  };

  // Header
  if (restaurantName) {
    pdf.setFont("courier", "bold");
    addCenteredText(restaurantName, yPos, 14);
    yPos += 6;
  }

  // Restaurant info with conditionals
  if (restaurantInfo?.address) {
    pdf.setFont("courier", "normal");
    addCenteredText(restaurantInfo.address, yPos, 8);
    yPos += 4;
  }
  if (restaurantInfo?.phone) {
    addCenteredText(`Tel: ${restaurantInfo.phone}`, yPos, 8);
    yPos += 4;
  }
  if (restaurantInfo?.gst) {
    addCenteredText(`GST: ${restaurantInfo.gst}`, yPos, 8);
    yPos += 6;
  }

  addDashedLine(yPos);
  yPos += 8;

  // Bill details
  const orderDate = new Date(orderData.createdAt || new Date());
  const formattedDate = orderDate.toLocaleDateString("en-GB");
  const formattedTime = orderDate.toLocaleTimeString("en-GB", {
    hour: "2-digit",
    minute: "2-digit",
  });

  // Bill number and date
  if (orderData.kotNo) {
    addJustifiedText(
      `Bill No: ${orderData.kotNo}`,
      `Date: ${formattedDate}`,
      yPos
    );
    yPos += 5;
  }

  // Conditional table number rendering for customer bill
  if (orderData?.tableNo) {
    addJustifiedText(
      `Table: ${orderData.tableNo}`,
      `Time: ${formattedTime}`,
      yPos
    );
  } else {
    addJustifiedText(`Time: ${formattedTime}`, "", yPos);
  }
  yPos += 8;

  addDashedLine(yPos);
  yPos += 6;

  // Items header for bill
  pdf.setFont("courier", "bold");
  pdf.setFontSize(8);
  pdf.text("ITEM", leftMargin, yPos);
  pdf.text("QTY", 45, yPos);
  pdf.text("RATE", 55, yPos);
  pdf.text("AMT", 68, yPos);
  yPos += 5;

  addDashedLine(yPos);
  yPos += 4;

  // Items with prices and validation
  pdf.setFont("courier", "normal");
  let subtotal = 0;

  if (orderData.items && orderData.items.length > 0) {
    orderData.items.forEach((item) => {
      if (
        item &&
        (item.name || item.product_name) &&
        item.quantity &&
        item.price
      ) {
        const itemTotal = item.price * item.quantity;
        subtotal += itemTotal;

        // Item name (may wrap to next line if too long)
        const itemName = item.name || item.product_name || "Unknown Item";
        const displayName =
          itemName.length > 20 ? itemName.substring(0, 20) : itemName;

        pdf.text(displayName, leftMargin, yPos);
        pdf.text(item.quantity.toString(), 45, yPos);
        pdf.text(item.price.toString(), 55, yPos);
        pdf.text(itemTotal.toFixed(2), 68, yPos);
        yPos += 4;
      }
    });
  }

  yPos += 3;
  addDashedLine(yPos);
  yPos += 6;

  // Totals
  pdf.setFont("courier", "bold");
  addJustifiedText("SUBTOTAL:", `₹${subtotal.toFixed(2)}`, yPos);
  yPos += 5;

  // Calculate tax (assuming 5% GST)
  const taxRate = 0.05;
  const taxAmount = subtotal * taxRate;
  addJustifiedText("GST (5%):", `₹${taxAmount.toFixed(2)}`, yPos);
  yPos += 5;

  const grandTotal = subtotal + taxAmount;
  pdf.setFontSize(10);
  addJustifiedText("TOTAL:", `₹${grandTotal.toFixed(2)}`, yPos);
  yPos += 10;

  addDashedLine(yPos);
  yPos += 8;

  // Footer
  pdf.setFont("courier", "normal");
  addCenteredText("Thank you for dining with us!", yPos, 9);
  yPos += 5;
  addCenteredText("Please visit again", yPos, 8);

  return pdf;
};

export const printThermalReceipt = (
  pdf,
  filename = "receipt",
  useNewWindow = false
) => {
  if (pdf) {
    if (useNewWindow) {
      // Traditional method - opens new window
      pdf.autoPrint();
      window.open(pdf.output("bloburl"), "_blank");
    } else {
      // Direct print without new window
      const pdfBlob = pdf.output("blob");
      const blobUrl = URL.createObjectURL(pdfBlob);

      // Create hidden iframe for printing
      const iframe = document.createElement("iframe");
      iframe.style.display = "none";
      iframe.src = blobUrl;

      document.body.appendChild(iframe);

      iframe.onload = function () {
        iframe.contentWindow.print();

        // Clean up after printing
        setTimeout(() => {
          document.body.removeChild(iframe);
          URL.revokeObjectURL(blobUrl);
        }, 1000);
      };
    }
  }
};

export const downloadReceipt = (pdf, filename = "receipt.pdf") => {
  if (pdf) {
    pdf.save(filename);
  }
};

export const printDirectHTML = (
  orderData,
  restaurantName = "ABC RESTAURANT",
  isKOT = true
) => {
  let loggedUser = JSON.parse(localStorage.getItem("sUserData"));
  console.log(loggedUser);
  if (!orderData) return;

  const orderDate = new Date(orderData.createdAt || new Date());
  const formattedDate = orderDate.toLocaleDateString("en-GB");
  const formattedTime = orderDate.toLocaleTimeString("en-GB", {
    hour: "2-digit",
    minute: "2-digit",
  });

  let printContent = "";

  if (isKOT) {
    // KOT Content
    printContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Kitchen Order Ticket</title>
        <style>
          @media print {
            @page {
              size: 80mm auto;
              margin: 0;
            }
            body {
              margin: 0;
              padding: 5mm;
            }
          }
          body {
            font-family: 'Courier New', monospace;
            font-size: 12px;
            line-height: 1.2;
            width: 70mm;
            margin: 0 auto;
            padding: 5mm;
            border: 2px dashed #000;
          }
          .header {
            text-align: center;
            margin-bottom: 10px;
          }
          .restaurant-name {
            font-size: 16px;
            font-weight: bold;
            margin-bottom: 5px;
          }
          .ticket-type {
            font-size: 14px;
            margin-bottom: 10px;
          }
          .divider {
            border-bottom: 1px dashed #000;
            margin: 10px 0;
          }
          .order-info {
            display: flex;
            justify-content: space-between;
            margin-bottom: 10px;
          }
          .items-header {
            display: flex;
            justify-content: space-between;
            font-weight: bold;
            margin-bottom: 5px;
          }
          .item-row {
            display: flex;
            justify-content: space-between;
            margin-bottom: 3px;
          }
          .footer {
            text-align: center;
            margin-top: 15px;
            font-weight: bold;
          }
          .print-time {
            text-align: center;
            margin-top: 10px;
            font-size: 10px;
          }
        </style>
      </head>
      <body>
        <div class="header">
          <div class="restaurant-name">${restaurantName}</div>
          <div class="ticket-type">KITCHEN ORDER TICKET</div>
        </div>
        
        <div class="divider"></div>
        
        <div class="order-info">
          <div>KOT No: ${orderData.kotNo || "N/A"}</div>
          <div>Date: ${formattedDate}</div>
        </div>
             <div class="order-info">
       ${
         orderData?.customerName
           ? `<div>Name: ${orderData.customerName}</div>`
           : ""
       }
          <div>Type: ${orderData?.type}</div>
        </div>
                     <div class="order-info">
       ${loggedUser ? `<div>Name: ${loggedUser?.name}</div>` : ""}
      
        </div>
        <div class="order-info">
          <div>Time: ${formattedTime}</div>
          ${
            orderData?.tableNo
              ? `<div>Table: ${orderData.tableNo}</div>`
              : "<div></div>"
          }
        </div>
        
        <div class="items-header">
          <span>SL  ITEM</span>
          <span>QTY</span>
        </div>
        <div class="divider"></div>
        
        ${
          orderData.items && orderData.items.length > 0
            ? orderData.items
                .map((item, index) => {
                  if (
                    item &&
                    (item.product_name || item.name) &&
                    item.quantity
                  ) {
                    const itemName =
                      item.product_name || item.name || "Unknown Item";
                    return `
                <div class="item-row">
                  <span>${index + 1}   ${itemName}</span>
                  <span>${item.quantity}</span>
                </div>
              `;
                  }
                  return "";
                })
                .join("")
            : '<div class="item-row"><span>No items</span></div>'
        }
        
        <div class="divider"></div>
        
        <div class="footer">
          ** KITCHEN COPY **<br>
          Prepare items as per order
        </div>
        
        <div class="print-time">
          Printed: ${formattedDate}, ${formattedTime}
        </div>
      </body>
      </html>
    `;
  } else {
    // Bill Content
    let subtotal = 0;
    if (orderData.items && orderData.items.length > 0) {
      subtotal = orderData.items.reduce((sum, item) => {
        if (item && item.price && item.quantity) {
          return sum + item.price * item.quantity;
        }
        return sum;
      }, 0);
    }

    const taxAmount = subtotal * 0.05; // 5% GST
    const grandTotal = subtotal + taxAmount;

    printContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Customer Bill</title>
        <style>
          @media print {
            @page {
              size: 80mm auto;
              margin: 0;
            }
            body {
              margin: 0;
              padding: 5mm;
            }
          }
          body {
            font-family: 'Courier New', monospace;
            font-size: 11px;
            line-height: 1.2;
            width: 70mm;
            margin: 0 auto;
            padding: 5mm;
            border: 2px dashed #000;
          }
          .header {
            text-align: center;
            margin-bottom: 10px;
          }
          .restaurant-name {
            font-size: 16px;
            font-weight: bold;
            margin-bottom: 5px;
          }
          .divider {
            border-bottom: 1px dashed #000;
            margin: 8px 0;
          }
          .bill-info {
            display: flex;
            justify-content: space-between;
            margin-bottom: 8px;
          }
          .items-header {
            display: grid;
            grid-template-columns: 3fr 1fr 1fr 1fr;
            font-weight: bold;
            margin-bottom: 5px;
            font-size: 10px;
          }
          .item-row {
            display: grid;
            grid-template-columns: 3fr 1fr 1fr 1fr;
            margin-bottom: 3px;
            font-size: 10px;
          }
          .totals {
            text-align: right;
            margin-top: 10px;
          }
          .total-row {
            display: flex;
            justify-content: space-between;
            margin-bottom: 3px;
          }
          .grand-total {
            font-weight: bold;
            font-size: 12px;
          }
          .footer {
            text-align: center;
            margin-top: 15px;
          }
        </style>
      </head>
      <body>
        <div class="header">
          <div class="restaurant-name">${restaurantName}</div>
          <div>123 Main Street, City</div>
          <div>Tel: +91 98765 43210</div>
          <div>GST: 22AAAAA0000A1Z5</div>
        </div>
        
        <div class="divider"></div>
        
        <div class="bill-info">
          <div>Bill No: ${orderData.kotNo || "N/A"}</div>
          <div>Date: ${formattedDate}</div>
        </div>
        <div class="bill-info">
          ${
            orderData?.tableNo
              ? `<div>Table: ${orderData.tableNo}</div>`
              : "<div></div>"
          }
          <div>Time: ${formattedTime}</div>
        </div>
        
        <div class="divider"></div>
        
        <div class="items-header">
          <span>ITEM</span>
          <span>QTY</span>
          <span>RATE</span>
          <span>AMT</span>
        </div>
        <div class="divider"></div>
        
        ${
          orderData.items && orderData.items.length > 0
            ? orderData.items
                .map((item) => {
                  if (
                    item &&
                    (item.product_name || item.name) &&
                    item.quantity &&
                    item.price
                  ) {
                    const itemName =
                      item.product_name || item.name || "Unknown Item";
                    const displayName =
                      itemName.length > 15
                        ? itemName.substring(0, 15)
                        : itemName;
                    const itemTotal = item.price * item.quantity;
                    return `
                <div class="item-row">
                  <span>${displayName}</span>
                  <span>${item.quantity}</span>
                  <span>₹${item.price}</span>
                  <span>₹${itemTotal.toFixed(2)}</span>
                </div>
              `;
                  }
                  return "";
                })
                .join("")
            : '<div class="item-row"><span>No items</span></div>'
        }
        
        <div class="divider"></div>
        
        <div class="totals">
          <div class="total-row">
            <span>SUBTOTAL:</span>
            <span>₹${subtotal.toFixed(2)}</span>
          </div>
          <div class="total-row">
            <span>GST (5%):</span>
            <span>₹${taxAmount.toFixed(2)}</span>
          </div>
          <div class="total-row grand-total">
            <span>TOTAL:</span>
            <span>₹${grandTotal.toFixed(2)}</span>
          </div>
        </div>
        
        <div class="divider"></div>
        
        <div class="footer">
          <div>Thank you for dining with us!</div>
          <div>Please visit again</div>
        </div>
      </body>
      </html>
    `;
  }

  // Create and print without new window
  const iframe = document.createElement("iframe");
  iframe.style.position = "fixed";
  iframe.style.right = "0";
  iframe.style.bottom = "0";
  iframe.style.width = "0";
  iframe.style.height = "0";
  iframe.style.border = "none";

  document.body.appendChild(iframe);

  const doc = iframe.contentDocument || iframe.contentWindow.document;
  doc.open();
  doc.write(printContent);
  doc.close();

  iframe.onload = function () {
    iframe.contentWindow.print();

    // Clean up after printing
    setTimeout(() => {
      document.body.removeChild(iframe);
    }, 1000);
  };
};

/**
 * Complete function to generate and print KOT
 * @param {Object} orderData - Order data
 * @param {boolean} autoPrint - Whether to auto-print (default: true)
 * @param {boolean} download - Whether to download PDF (default: false)
 * @param {string} restaurantName - Restaurant name (optional)
 * @param {boolean} useHTML - Use HTML printing instead of PDF (default: true)
 */
export const generateAndPrintKOT = (
  orderData,
  autoPrint = true,
  download = false,
  restaurantName = "ABC RESTAURANT",
  useHTML = true
) => {
  try {
    if (!orderData) {
      throw new Error("Order data is required");
    }

    if (useHTML && autoPrint) {
      // Use direct HTML printing (no new window)
      printDirectHTML(orderData, restaurantName, true);
      return null;
    } else {
      // Use PDF method
      const pdf = generateKitchenOrderTicket(orderData, restaurantName);

      if (download && orderData.kotNo) {
        downloadReceipt(pdf, `KOT_${orderData.kotNo}.pdf`);
      }

      if (autoPrint) {
        printThermalReceipt(pdf, "KOT", false); // false = no new window
      }

      return pdf;
    }
  } catch (error) {
    console.error("Error generating KOT:", error);
    throw error;
  }
};

/**
 * Complete function to generate and print customer bill
 * @param {Object} orderData - Order data with prices
 * @param {boolean} autoPrint - Whether to auto-print (default: true)
 * @param {boolean} download - Whether to download PDF (default: false)
 * @param {string} restaurantName - Restaurant name (optional)
 * @param {Object} restaurantInfo - Restaurant information (optional)
 * @param {boolean} useHTML - Use HTML printing instead of PDF (default: true)
 */
export const generateAndPrintBill = (
  orderData,
  autoPrint = true,
  download = false,
  restaurantName = "ABC RESTAURANT",
  restaurantInfo,
  useHTML = true
) => {
  try {
    if (!orderData) {
      throw new Error("Order data is required");
    }

    if (useHTML && autoPrint) {
      // Use direct HTML printing (no new window)
      printDirectHTML(orderData, restaurantName, false);
      return null;
    } else {
      // Use PDF method
      const defaultRestaurantInfo = restaurantInfo || {
        address: "123 Main Street, City",
        phone: "+91 98765 43210",
        gst: "22AAAAA0000A1Z5",
      };

      const pdf = generateCustomerBill(
        orderData,
        restaurantName,
        defaultRestaurantInfo
      );

      if (download && orderData.kotNo) {
        downloadReceipt(pdf, `Bill_${orderData.kotNo}.pdf`);
      }

      if (autoPrint) {
        printThermalReceipt(pdf, "Bill", false); // false = no new window
      }

      return pdf;
    }
  } catch (error) {
    console.error("Error generating bill:", error);
    throw error;
  }
};
