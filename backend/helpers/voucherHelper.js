import VoucherSeriesModel from "../models/VoucherSeriesModel.js";
import SaleOrderModel from "../models/invoiceModel.js";
import VanSaleModel from "../models/vanSaleModel.js";
import PurchaseModel from "../models/purchaseModel.js";
import CreditNoteModel from "../models/creditNoteModel.js";
import DebitNoteModel from "../models/debitNoteModel.js";
import StockTransferModel from "../models/stockTransferModel.js";
import ReceiptModel from "../models/receiptModel.js";
import PaymentModel from "../models/paymentModel.js";
import SalesModel from "../models/salesModel.js";

/**
 * Gets current voucher number, increments it, and returns formatted number
 * @param {string} cmp_id - Company ID
 * @param {string} voucherType - Type of voucher
 * @param {string} seriesId - Series ID to use
 * @param {ClientSession} [session] - Optional MongoDB session
 * @returns {Promise<string>} - Formatted voucher number
 * @throws {Error} - If operation fails
 */
export const generateVoucherNumber = async (
  cmp_id,
  voucherType,
  seriesId,
  session = null
) => {
  const options = session ? { session } : {};
console.log("seriesId",seriesId,"cmp_id",cmp_id,"voucherType",voucherType)
  // 1. First find the current value
  const doc = await VoucherSeriesModel.findOne(
    {
      cmp_id,
      voucherType,
      "series._id": seriesId,
    },
    null,
    options
  );

  if (!doc) throw new Error("Voucher series not found");

  const series = doc.series.find((s) => s._id.toString() === seriesId);
  if (!series) throw new Error("Series not found");

  // 2. Format the number (using current value before increment)
  // 3.currently current number is editable ,so for consistency currently for incrimination we use lastUsedNumber(not editable by user) as reference
  const lastUsedNumber = series.lastUsedNumber;
  const paddedNumber = lastUsedNumber
    .toString()
    .padStart(series.widthOfNumericalPart || 2, "0");
  const voucherNumber = `${series.prefix || ""}${paddedNumber}${
    series.suffix || ""
  }`;


  if (
    voucherNumber === null ||
    voucherNumber === "" ||
    voucherNumber === undefined
  ) {
    throw new Error("Voucher series not found");
  }
  const usedSeriesNumber = lastUsedNumber;

  const updatedLastUsedNumber = lastUsedNumber + 1;
  const updatedCurrentNumber = updatedLastUsedNumber;

  // 3. Increment for next use
  await VoucherSeriesModel.updateOne(
    {
      cmp_id,
      voucherType,
      "series._id": seriesId,
    },
    {
      $set: {
        "series.$.lastUsedNumber": updatedLastUsedNumber,
        "series.$.currentNumber": updatedCurrentNumber,
      },
    },
    options
  );

  // return { voucherNumber, usedSeriesNumber };
  return { voucherNumber, usedSeriesNumber };
};

// Utility function to get the correct model based on voucher type
const getVoucherModel = (voucherType) => {
  const modelMap = {
    sales: SalesModel,
    saleOrder: SaleOrderModel,
    vanSale: VanSaleModel,
    purchase: PurchaseModel,
    creditNote: CreditNoteModel,
    debitNote: DebitNoteModel,
    stockTransfer: StockTransferModel,
    receipt: ReceiptModel,
    payment: PaymentModel,
    // deliveryNote: ,
  };

  return modelMap[voucherType];
};

// Helper function to check if series number is already used in vouchers
export const checkSeriesNumberExists = async (
  cmp_id,
  series_id,
  currentNumber,
  voucherType,
  seriesName
) => {
  const VoucherModel = getVoucherModel(voucherType);

  if (!VoucherModel) {
    throw new Error(`Invalid voucher type: ${voucherType}`);
  }

  // Check if the currentNumber is already used as usedSeriesNumber
  const existingVoucher = await VoucherModel.findOne({
    cmp_id,
    series_id,
    usedSeriesNumber: currentNumber,
    // isCancelled: { $ne: true } // Exclude cancelled vouchers
  }).lean(); //  lean() for better performance as we only need to check existence

  return !!existingVoucher;
};

/// getSeriesDetailsById

export const getSeriesDetailsById = async (seriesId, cmp_id, voucherType) => {
  if (!cmp_id || !voucherType || !seriesId) {
    throw new Error("Missing required fields: cmp_id, voucherType, seriesId");
  }

  try {
    const doc = await VoucherSeriesModel.findOne({
      cmp_id,
      voucherType,
    });

    if (!doc) {
      throw new Error("Voucher series not found");
    }

    const series = doc.series.find(
      (s) => s._id.toString() === seriesId.toString()
    );
    if (!series) {
      throw new Error("Series not found");
    }

    return series;
  } catch (error) {
    throw error;
  }
};
