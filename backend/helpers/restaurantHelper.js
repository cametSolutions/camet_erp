import productModel from "../models/productModel.js";
import restaurantModels from "../models/restaurantModels.js";
import roomModal from "../models/roomModal.js";
import product from "../models/productModel.js";
import VoucherSeriesModel from "../models/VoucherSeriesModel.js";
import { generateVoucherNumber } from "../helpers/voucherHelper.js";
import { getNewSerialNumber } from "../helpers/secondaryHelper.js";
import ReceiptModel from "../models/receiptModel.js";
import { formatToLocalDate } from "./helper.js";
// import voucherModal from "../models/voucherModal.js";
// helper function used to add search concept with room
export const buildDatabaseFilterForRoom = (params) => {
  const filter = {
    cmp_id: params.cmp_id,
    Primary_user_id: params.Primary_user_id,
  };
  console.log("params.type", params);

  // Add search functionality if search term is provided
  if (params.searchTerm) {
    filter.$or = [
      { product_name: { $regex: params.searchTerm, $options: "i" } },
       { itemCode: { $regex:params.searchTerm, $options: "i" } },
    ];
  }

  return filter;
};

export const fetchRoomsFromDatabase = async (filter, params) => {
  // Count total products matching the filter for pagination
  const totalItems = await product.countDocuments(filter);
  // Build query with pagination
 let query = product.find(filter)
  .populate({
    path: "Priceleveles.pricelevel",
    model: "PriceLevel",
    select: "pricelevel dineIn takeaway roomService delivery"
  })
  .populate("hsn_code");

  

  // Apply pagination if limit is specified
  if (params?.limit > 0) {
    query = query.skip(params?.skip).limit(params?.limit);
  }

  // Execute query with population and sorting
  const items = await query.sort({ itemName: 1 });

  return { items, totalItems };
};

export const sendRoomResponse = (res, items, totalItems, params) => {
  console.log(items?.length);
  if (items && items.length > 0) {
    return res.status(200).json({
      roomData: items,
      pagination: {
        total: totalItems,
        page: params.page,
        limit: params.limit,
        hasMore: params.skip + items.length < totalItems,
      },
      message: "Rooms fetched successfully",
    });
  } else {
    return res.status(404).json({
      message: "No rooms were found matching the criteria",
    });
  }
};

// function use to build receipt
export const buildReceipt = async ({
  cmp_id,
  selectedParty,
  advanceObject,
  saleData,
  amount,
  paymentDetails,
  paymentMethod,
  req,
  session,
}) => {
  console.log("saleData", saleData);
  const billData = [
    {
      _id: advanceObject._id,
      bill_no: saleData?.salesNumber,
      billId: saleData._id.toString(),
      bill_date: new Date(),
      bill_pending_amt: 0,
      source: "restaurant",
      settledAmount: amount,
      remainingAmount: 0,
    },
  ];

  console.log("billData", billData);
    console.log("billData", cmp_id);

  const voucher = await VoucherSeriesModel.findOne({
    cmp_id,
    voucherType: "receipt",
  }).session(session);

  console.log("voucher", voucher);
  const series_idReceipt = voucher?.series
    ?.find((s) => s.under === "restaurant")
    ?._id.toString();

  const receiptVoucher = await generateVoucherNumber(
    cmp_id,
    "receipt",
    series_idReceipt,
    session
  );

  const serialNumber = await getNewSerialNumber(
    ReceiptModel,
    "serialNumber",
    session
  );
console.log("line 125 restarurant")
  const receipt = new ReceiptModel({
    createdAt: new Date(),
    date: await formatToLocalDate(new Date(), cmp_id, session),
    receiptNumber: receiptVoucher?.usedSeriesNumber,
    series_id: series_idReceipt,
    usedSeriesNumber: receiptVoucher?.usedSeriesNumber || null,
    serialNumber,
    cmp_id,
    party: selectedParty,
    billData,
    totalBillAmount: amount,
    enteredAmount: amount,
    advanceAmount: 0,
    remainingAmount: 0,
    paymentMethod,
    paymentDetails,
    note: "",
    Primary_user_id: req.pUserId || req.owner,
    Secondary_user_id: req.sUserId,
  });

  return await receipt.save({ session });
};



export const round2 = (num) => Number((Number(num) || 0).toFixed(2));

export const calculateTax = ({
  remainingQty = 0,
  price = 0,
  discountType = "none",
  discountPercentage = 0,
  discountAmount = 0,
  cgst = 0,
  sgst = 0,
  igst = 0,
  cess = 0,
  addlCess = 0,
  isTaxIncluded = true,
}) => {
  const qty = Number(remainingQty || 0);
  const unitPrice = Number(price || 0);

  console.log("unitPrice", qty);

  const cgstRate = Number(cgst || 0);
  const sgstRate = Number(sgst || 0);
  const igstRate = Number(igst || 0);
  const cessRate = Number(cess || 0);
  const addlCessRate = Number(addlCess || 0);

  const discountPct = Number(discountPercentage || 0);
  const flatDiscount = Number(discountAmount || 0);

  let unitDiscount = 0;

  if (discountType === "percentage") {
    unitDiscount = (unitPrice * discountPct) / 100;
  } else if (discountType === "amount") {
    unitDiscount = flatDiscount;
  }

  unitDiscount = Math.min(unitDiscount, unitPrice);

  const discountedUnitPrice = Math.max(unitPrice - unitDiscount, 0);
console.log("discountedUnitPrice", discountedUnitPrice)
  const totalTaxRate =
    cgstRate + sgstRate ;

  let basePricePerUnit = 0;
  let taxableAmount = 0;
console.log("isTaxIncluded", isTaxIncluded)
  if (isTaxIncluded) {
    basePricePerUnit =
      totalTaxRate > 0
        ? discountedUnitPrice / (1 + totalTaxRate / 100)
        : discountedUnitPrice;

    taxableAmount = basePricePerUnit * qty;
  } else {
    basePricePerUnit = discountedUnitPrice;
    taxableAmount = discountedUnitPrice * qty;
  }
  console.log("taxableAmount",basePricePerUnit, taxableAmount)

  const cgstAmount = (taxableAmount * cgstRate) / 100;
  const sgstAmount = (taxableAmount * sgstRate) / 100;
  const igstAmount = (taxableAmount * igstRate) / 100;
  const cessAmount = (taxableAmount * cessRate) / 100;
  const additionalCessAmount = (taxableAmount * addlCessRate) / 100;

  const totalTaxAmount =
    cgstAmount +
    sgstAmount 

  const total = isTaxIncluded
    ? discountedUnitPrice * qty
    : taxableAmount + totalTaxAmount;
console.log("total",total)
  return {
    remainingQty: qty,
    price: round2(unitPrice),

    discountType,
    discountPercentage: round2(discountPct),
    discountAmount: round2(unitDiscount),
    discountedUnitPrice: round2(discountedUnitPrice),

    basePrice: round2(basePricePerUnit),
    taxableAmount: round2(taxableAmount),

    cgstValue: round2(cgstRate),
    sgstValue: round2(sgstRate),
    igstValue: round2(igstRate),
    cessValue: round2(cessRate),
    addlCessValue: round2(addlCessRate),

    cgstAmount: round2(cgstAmount),
    sgstAmount: round2(sgstAmount),
    igstAmount: round2(igstAmount),
    cessAmount: round2(cessAmount),
    additionalCessAmount: round2(additionalCessAmount),

    totalTaxAmount: round2(totalTaxAmount),
    total: round2(total),
    isTaxIncluded,
  };
};


export const recalculateKotItem = (item = {}) => {
  const remainingQty = Number(item?.remainingQty ?? item?.remainingQty ?? 0);

  // ❌ skip if no remaining
  if (remainingQty <= 0 ) return null;

  const calc = calculateTax({
    remainingQty,
    price: item?.price || 0,
    discountType: item?.discountType || "none",
    discountPercentage: item?.discountPercentage || 0,
    discountAmount: item?.discountAmount || 0,
    cgst: item?.cgst || 0,
    sgst: item?.sgst || 0,
    igst: item?.igst || 0,
    cess: item?.cess || 0,
    addlCess: item?.addlCess || 0,
    isTaxIncluded:
      item?.taxInclusive ?? item?.isTaxIncluded ?? true,
  });

  return {
    ...item,
    remainingQty: calc.remainingQty,
    quantity: calc.remainingQty,

    price: calc.price,
    discountType: calc.discountType,
    discountPercentage: calc.discountPercentage,
    discountAmount: calc.discountAmount,

    basePrice: calc.basePrice,
    taxableAmount: calc.taxableAmount,

    cgstValue: calc.cgstValue,
    sgstValue: calc.sgstValue,
    igstValue: calc.igstValue,
    cessValue: calc.cessValue,
    addlCessValue: calc.addlCessValue,

    cgstAmount: calc.cgstAmount,
    sgstAmount: calc.sgstAmount,
    igstAmount: calc.igstAmount,
    cessAmount: calc.cessAmount,
    additionalCessAmount: calc.additionalCessAmount,

    totalCgstAmt: calc.cgstAmount,
    totalSgstAmt: calc.sgstAmount,
    totalIgstAmt: calc.igstAmount,
    totalCessAmt: calc.cessAmount,
    totalAddlCessAmt: calc.additionalCessAmount,

    total: calc.total,
    individualTotal: calc.total,
    isTaxIncluded: calc.isTaxIncluded,
    taxInclusive: calc.isTaxIncluded,
  };
};