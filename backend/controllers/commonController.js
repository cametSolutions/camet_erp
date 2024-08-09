import salesModel from "../models/salesModel.js";
import stockTransferModel from "../models/stockTransferModel.js";

// @desc to  get stock transfer details
// route get/api/sUsers/getStockTransferDetails;
export const getStockTransferDetails = async (req, res) => {
  try {
    const id = req.params.id;

    const details = await stockTransferModel.findById(id);
    if (details) {
      res
        .status(200)
        .json({ message: "Stock Transfer Details fetched", data: details });
    } else {
      res.status(404).json({ error: "Stock Transfer Details not found" });
    }
  } catch (error) {
    console.error("Error in getting StockTransferDetails:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

export const getPrintData = async (req, res) => {
  try {
    const id = req.params.id;

    const salesData = await salesModel.findById(id);

    // Create the print data
    const printData = [
      {
        type: 0,
        content: `Invoice #${salesData.salesNumber}`,
        bold: 1,
        align: 1,
        format: 2,
      },
      {
        type: 0,
        content: `Date: ${new Date(salesData.date).toLocaleDateString()}`,
        bold: 0,
        align: 1,
        format: 0,
      },
      // Add more items as needed
    ];

    // Add items to print data
    salesData.items.forEach((item) => {
      printData.push({
        type: 0,
        content: `${item.product_name} x${item.count} - $${item.total}`,
        bold: 0,
        align: 0,
        format: 0,
      });
    });

    // Add total
    printData.push({
      type: 0,
      content: `Total: $${salesData.finalAmount}`,
      bold: 1,
      align: 2,
      format: 0,
    });

    // Set the correct content type
    res.setHeader('Content-Type', 'application/json');
    res.json(printData);
  } catch (error) {
    console.error("Error generating print data:", error);
    res.status(500).json({ error: "Failed to generate print data" });
  }
};
