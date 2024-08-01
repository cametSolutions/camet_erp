import invoiceModel from "../models/invoiceModel.js";
import salesModel from "../models/salesModel.js";
import TransactionModel from "../models/TransactionModel.js";
import vanSaleModel from "../models/vanSaleModel.js";

export const fetchData = async (type, cmp_id, serialNumber, res) => {
    let model;
    switch (type) {
      case 'invoices':
        model = invoiceModel;
        break;
      case 'sales':
        model = salesModel;
        break;
      case 'vanSales':
        model = vanSaleModel;
        break;
        case 'transactions':
            model = TransactionModel;
            break;
      default:
        return res.status(400).json({ message: "Invalid type parameter" });
    }
  
    try {
      const data = await model.find({
        cmp_id: cmp_id,
        serialNumber: { $gt: serialNumber },
      });
  
      if (data.length > 0) {
        return res.status(200).json({
          message: `${type} fetched`,
          data: data,
        });
      } else {
        return res.status(404).json({ message: `${type} not found` });
      }
    } catch (error) {
      console.error(error);
      return res.status(500).json({
        status: false,
        message: "Internal server error",
      });
    }
  };