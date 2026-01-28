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
