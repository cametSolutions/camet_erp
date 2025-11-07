import roomModal from "../models/roomModal.js";
import { Booking, CheckIn, CheckOut } from "../models/bookingModal.js";
import mongoose from "mongoose";
import receiptModel from "../models/receiptModel.js";
import VoucherSeriesModel from "../models/VoucherSeriesModel.js";
import { generateVoucherNumber } from "../helpers/voucherHelper.js";
import { createOutstandingWithAdvanceAmount } from "./receiptHelper.js";
import { getNewSerialNumber } from "./secondaryHelper.js";
import Party from "../models/partyModel.js";
import { formatToLocalDate } from "../helpers/helper.js";
import TallyData from "../models/TallyData.js";
import settlementModel from "../models/settlementModel.js";
// helper function used to add search concept with room
export const buildDatabaseFilterForRoom = (params) => {
  console.log("params", params);
  const filter = {
    cmp_id: params.cmp_id,
    primary_user_id: params.Primary_user_id,
  };
  console.log("params.type", params);
  if (params?.type && params?.type !== "All") {
    filter.roomType = params.type;
  }

  // Add search functionality if search term is provided
  if (params.searchTerm) {
    filter.$or = [{ roomName: { $regex: params.searchTerm, $options: "i" } }];
  }

  return filter;
};

export const fetchRoomsFromDatabase = async (filter, params) => {
  // Count total products matching the filter for pagination
  const totalRooms = await roomModal.countDocuments(filter);
  // Build query with pagination
  let query = roomModal.find(filter).populate("hsn").populate("roomType");

  // Apply pagination if limit is specified
  if (params?.limit > 0) {
    query = query.skip(params?.skip).limit(params?.limit);
  }

  // Execute query with population and sorting
  const rooms = await query
    .sort({ roomName: 1 })
    .populate("priceLevel.priceLevel");

  return { rooms, totalRooms };
};

export const sendRoomResponse = (res, rooms, totalRooms, params) => {
  if (rooms && rooms.length > 0) {
    return res.status(200).json({
      roomData: rooms,
      pagination: {
        total: totalRooms,
        page: params.page,
        limit: params.limit,
        hasMore: params.skip + rooms.length < totalRooms,
      },
      message: "Rooms fetched successfully",
    });
  } else {
    return res.status(404).json({
      message: "No rooms were found matching the criteria",
    });
  }
};

// helper function used to add search concept with booking
export const buildDatabaseFilterForBooking = (params) => {

  let filter = {
    cmp_id: params.cmp_id,
    Primary_user_id: params.Primary_user_id,
  };

  if (params.roomId) {
    filter["selectedRooms.roomId"] = params.roomId;
  }

  // Add search functionality if search term is provided
  if (params.searchTerm && params.searchTerm != "completed") {
    if (params.searchTerm != "pending") {
      filter.$or = [
        { voucherNumber: { $regex: params.searchTerm, $options: "i" } },
        { customerName: { $regex: params.searchTerm, $options: "i" } },
      ];
    } 
    else {
      filter = { ...filter,status: "checkIn" };
    }
  } else if (params.searchTerm == "completed") {
    if (params.modal == "booking") {
      filter = { ...filter, status: "checkIn" };
    }
    if (params.modal == "checkIn") {
      filter = { ...filter, status: "checkOut" };
    }
  }


  return filter;
};

// function used to fetch booking
export const fetchBookingsFromDatabase = async (filter = {}, params = {}) => {
  const { skip = 0, limit = 0 } = params;
  console.log("filter", filter);
  try {
    let selectedModal;
    if (params?.modal == "booking") {
      selectedModal = Booking;
    } else if (params?.modal == "checkIn") {
      selectedModal = CheckIn;
    } else {
      selectedModal = CheckOut;
    }
    console.log("selectedModal", selectedModal);
    console.log("params", params);
    const [bookings, totalBookings] = await Promise.all([
      selectedModal
        .find(filter)
        .populate("customerId")
        .populate("agentId")
        .populate("selectedRooms.selectedPriceLevel")
        .populate("bookingId")
        .populate("checkInId")
        .sort({ createdAt: -1 })
        .skip(limit > 0 ? skip : 0)
        .limit(limit > 0 ? limit : 0),
      selectedModal.countDocuments(filter),
    ]);

    return { bookings, totalBookings };
  } catch (error) {
    console.error("❌ Error fetching bookings from database:", error);

    // Optionally, rethrow or return an error object
    throw new Error("Failed to fetch bookings. Please try again.");
  }
};

// function used to send response for booking
export const sendBookingsResponse = (res, bookings, totalBookings, params) => {
  if (bookings && bookings.length > 0) {
    return res.status(200).json({
      bookingData: bookings,
      pagination: {
        total: totalBookings,
        page: params.page,
        limit: params.limit,
        hasMore: params.skip + bookings.length < totalBookings,
      },
      message: "Bookings fetched successfully",
    });
  } else {
    return res.status(404).json({
      message: "No bookings were found matching the criteria",
    });
  }
};

export const extractRequestParamsForBookings = (req) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 0;
  
  return {
    Secondary_user_id: req.sUserId,
    cmp_id: new mongoose.Types.ObjectId(req.params.cmp_id),
    Primary_user_id: req.owner,
    searchTerm: req.query.search || "",
    page,
    limit,
    skip: limit > 0 ? (page - 1) * limit : 0,
    modal: req.query.modal,
   roomId: req.query.roomId || null, 
  };
};

 export const updateStatus = async (roomData, status, session) => {
  const ids = roomData.map((room) => room.roomId);
  await roomModal.updateMany(
    { _id: { $in: ids } },
    { $set: { status } },
    { session }
  );
};
// hotelVoucherSeries.js
export async function hotelVoucherSeries(cmp_id, session) {
  const SaleVoucher = await VoucherSeriesModel.findOne({
    cmp_id,
    voucherType: "sales",
  }).session(session);
  if (!SaleVoucher) throw new Error("Sale voucher not found");

  const specificVoucherSeries = SaleVoucher.series.find(
    (series) => series.under === "hotel"
  );
  if (!specificVoucherSeries)
    throw new Error("No 'hotel' voucher series found");

  return specificVoucherSeries;
}

export const updateReceiptForRooms = async (
  bookingNumber,
  checkInNumber,
  saleNumber,
  saleId,
  session
) => {
  const bookingNumberStr = String(bookingNumber);
  const checkInNumberStr = String(checkInNumber);

  // Find all receipts where billData.bill_no matches either bookingNumber or checkInNumber
  const receiptArray = await receiptModel
    .find({ "billData.bill_no": { $in: [bookingNumberStr, checkInNumberStr] } })
    .session(session);

  console.log("Found receipts:", receiptArray.length);

  // Update each receipt
  await Promise.all(
    receiptArray.map(async (receipt) => {
      // Update each billData object that matches
      receipt.billData = receipt.billData.map((bill) => {
        if (
          bill.bill_no === bookingNumberStr ||
          bill.bill_no === checkInNumberStr
        ) {
          return {
            ...bill,
            _id: new mongoose.Types.ObjectId(saleId),
            bill_no: saleNumber,
            billId: saleId,
          };
        }
        return bill; // keep unchanged
      });

      await receipt.save({ session });
    })
  );

  console.log("Receipts updated successfully.");
};

// export const createReceiptForSales = async (
//   cmp_id,
//   payment,
//   paymentMethod,
//   customerName,
//   amount,
//   partyId,
//   saleData,
//   createdTallyData,
//   req,
//   restaurantBaseSaleData,
//   session
// ) => {
//   const receipts = [];

//   // find voucher series for receipt
//   const voucher = await VoucherSeriesModel.findOne({
//     cmp_id,
//     voucherType: "receipt",
//   }).session(session);

//   const series_id = voucher?.series
//     ?.find((s) => s.under === "hotel")
//     ?._id.toString();

//   if (!series_id) {
//     throw new Error("No valid receipt series found for hotel");
//   }
//   console.log("restaurantBaseSaleData", restaurantBaseSaleData);

//   let billData
//   let outStandingArray = [];
//   restaurantBaseSaleData.map(async (sale) => {
//     let outStandingData = await TallyData.findOne({ billId: sale._id });
//     outStandingArray.push(outStandingData);
//   });

//   // Single Payment Mode
//   if (payment?.paymentMode === "single") {
//     const receiptVoucher = await generateVoucherNumber(
//       cmp_id,
//       "receipt",
//       series_id,
//       session
//     );

//     const serialNumber = await getNewSerialNumber(
//       receiptModel,
//       "serialNumber",
//       session
//     );
//     let trackedBalance = amount;
//     outStandingArray.map(async (outStanding) => {
//       billData.push({
//         _id: outStanding._id,
//         bill_no: outStanding?.bill_no,
//         billId: outStanding.billId,
//         bill_date: new Date(),
//         billPending_amt: outStanding.bill_amount,
//         source: "hotel",
//         settledAmount: outStanding?.bill_amount,
//         remainingAmount: 0,
//       });
//       trackedBalance = trackedBalance - Number(outStanding?.bill_amount);
//     });

//     billData.push({
//       _id: createdTallyData._id,
//       bill_no: saleData?.salesNumber,
//       billId: saleData._id,
//       bill_date: new Date(),
//       billPending_amt: 0,
//       source: "hotel",
//       settledAmount: trackedBalance,
//       remainingAmount: 0,
//     });

//     const paymentDetails =
//       paymentMethod === "cash"
//         ? { cash_ledname: customerName, cash_name: customerName }
//         : { bank_ledname: customerName, bank_name: customerName };

//     const newReceipt = await buildReceipt(
//       receiptVoucher,
//       serialNumber,
//       paymentDetails,
//       amount,
//       paymentMethod === "cash" ? "Cash" : "Online",
//       partyId,
//       cmp_id,
//       series_id,
//       billData,
//       req,
//       session
//     );

//     receipts.push(newReceipt);
//   }

//   // Multiple Payment Mode
//   else if (payment?.paymentMode === "multiple") {
//     // Online part
//     if (Number(payment?.onlineAmount) > 0) {
//       const receiptVoucher = await generateVoucherNumber(
//         cmp_id,
//         "receipt",
//         series_id,
//         session
//       );

//       const serialNumber = await getNewSerialNumber(
//         receiptModel,
//         "serialNumber",
//         session
//       );

//       const paymentDetails = {
//         bank_ledname: customerName,
//         bank_name: customerName,
//       };

//       const newReceipt = await buildReceipt(
//         receiptVoucher,
//         serialNumber,
//         paymentDetails,
//         Number(payment?.onlineAmount),
//         "Online",
//         partyId,
//         cmp_id,
//         series_id,
//         billData,
//         req,
//         session
//       );

//       receipts.push(newReceipt);
//     }

//     // Cash part
//     if (Number(payment?.cashAmount) > 0) {
//       const receiptVoucher = await generateVoucherNumber(
//         cmp_id,
//         "receipt",
//         series_id,
//         session
//       );

//       const serialNumber = await getNewSerialNumber(
//         receiptModel,
//         "serialNumber",
//         session
//       );

//       const paymentDetails = {
//         cash_ledname: customerName,
//         cash_name: customerName,
//       };

//       const newReceipt = await buildReceipt(
//         receiptVoucher,
//         serialNumber,
//         paymentDetails,
//         Number(payment?.cashAmount),
//         "Cash",
//         partyId,
//         cmp_id,
//         series_id,
//         billData,
//         req,
//         session
//       );

//       receipts.push(newReceipt);
//     }
//   }

//   return receipts;
// };

export const createReceiptForSales = async (
  cmp_id,
  payment,
  paymentMethod,
  customerName,
  amount,
  partyId,
  saleData,
  createdTallyData,
  req,
  restaurantBaseSaleData = [],
  session
) => {
  const receipts = [];

  // find voucher series for receipt
  const voucher = await VoucherSeriesModel.findOne({
    cmp_id,
    voucherType: "receipt",
  }).session(session);

  const series_id = voucher?.series
    ?.find((s) => s.under === "hotel")
    ?._id.toString();
  if (!series_id) throw new Error("No valid receipt series found for hotel");

  console.log("series_id", restaurantBaseSaleData);
  // get all outstanding bills
const outStandingArrayRaw = await Promise.all(
  restaurantBaseSaleData.map((sale) =>
    TallyData.findOne({ billId: sale._id })
  )
);

const outStandingArray = outStandingArrayRaw.filter(Boolean); // removes null/undefined


  // helper to distribute amounts across bills
  const distributeBills = (amountLeft) => {
    const billData = [];
    console.log("outStandingArray", outStandingArray);
    for (const out of outStandingArray) {
      if (amountLeft <= 0) break;

      const settleAmt = Math.min(amountLeft, out?.bill_amount || 0);
      billData.push({
        _id: out._id,
        bill_no: out.bill_no,
        billId: out.billId,
        bill_date: new Date(),
        bill_pending_amt: out.bill_amount,
        source: "hotel",
        settledAmount: settleAmt,
        remainingAmount: out.bill_amount - settleAmt,
      });
      amountLeft -= settleAmt;
    }

    // if still extra amount → assign to new tally data (like advance)
    if (amountLeft > 0) {
      billData.push({
        _id: createdTallyData._id,
        bill_no: saleData?.salesNumber,
        billId: saleData._id,
        bill_date: new Date(),
        bill_pending_amt: 0,
        source: "hotel",
        settledAmount: amountLeft,
        remainingAmount: 0,
      });
    }

    return billData;
  };

  // ---------------- SINGLE PAYMENT ----------------
  if (payment?.paymentMode === "single") {
    const receiptVoucher = await generateVoucherNumber(
      cmp_id,
      "receipt",
      series_id,
      session
    );
    const serialNumber = await getNewSerialNumber(
      receiptModel,
      "serialNumber",
      session
    );

    const billData = distributeBills(amount);

    const paymentDetails =
      paymentMethod === "cash"
        ? { cash_ledname: customerName, cash_name: customerName }
        : { bank_ledname: customerName, bank_name: customerName };

    const newReceipt = await buildReceipt(
      receiptVoucher,
      serialNumber,
      paymentDetails,
      amount,
      paymentMethod === "cash" ? "Cash" : "Online",
      partyId,
      cmp_id,
      series_id,
      billData,
      req,
      session
    );

    receipts.push(newReceipt);
  }

  // ---------------- MULTIPLE PAYMENT ----------------
  else if (payment?.paymentMode === "multiple") {
    // online part
    if (Number(payment?.onlineAmount) > 0) {
      const receiptVoucher = await generateVoucherNumber(
        cmp_id,
        "receipt",
        series_id,
        session
      );
      const serialNumber = await getNewSerialNumber(
        receiptModel,
        "serialNumber",
        session
      );

      const billData = distributeBills(Number(payment?.onlineAmount));

      const paymentDetails = {
        bank_ledname: customerName,
        bank_name: customerName,
      };

      const newReceipt = await buildReceipt(
        receiptVoucher,
        serialNumber,
        paymentDetails,
        Number(payment?.onlineAmount),
        "Online",
        partyId,
        cmp_id,
        series_id,
        billData,
        req,
        session
      );

      receipts.push(newReceipt);
    }

    // cash part
    if (Number(payment?.cashAmount) > 0) {
      const receiptVoucher = await generateVoucherNumber(
        cmp_id,
        "receipt",
        series_id,
        session
      );
      const serialNumber = await getNewSerialNumber(
        receiptModel,
        "serialNumber",
        session
      );

      const billData = distributeBills(Number(payment?.cashAmount));

      const paymentDetails = {
        cash_ledname: customerName,
        cash_name: customerName,
      };

      const newReceipt = await buildReceipt(
        receiptVoucher,
        serialNumber,
        paymentDetails,
        Number(payment?.cashAmount),
        "Cash",
        partyId,
        cmp_id,
        series_id,
        billData,
        req,
        session
      );

      receipts.push(newReceipt);
    }
  }

  return receipts;
};

const buildReceipt = async (
  receiptVoucher,
  serialNumber,
  paymentDetails,
  amount,
  paymentMethod,
  partyId,
  cmp_id,
  series_id,
  billData,
  req,
  session
) => {
  let selectedParty = await Party.findOne({ _id: partyId })
    .populate("accountGroup")
    .session(session);
  if (selectedParty) {
    // Convert to plain object to allow modifications
    selectedParty = selectedParty.toObject();

    // Extract only the id from accountGroup
    if (selectedParty.accountGroup && selectedParty.accountGroup._id) {
      selectedParty.accountGroup_id = selectedParty.accountGroup._id.toString();
    }

    // Remove the nested object
    delete selectedParty.accountGroup;
  }

  console.log("selectedParty", selectedParty);

  const receipt = new receiptModel({
    createdAt: new Date(),
    date: await formatToLocalDate(new Date(), cmp_id, session),
    receiptNumber: receiptVoucher?.usedSeriesNumber,
    series_id,
    usedSeriesNumber: receiptVoucher?.usedSeriesNumber || null,
    serialNumber,
    cmp_id,
    party: selectedParty,
    billData,
    totalBillAmount: amount,
    enteredAmount: amount, // each receipt has its own amount
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

export const saveSettlementDataHotel = async (
  party,
  orgId,
  paymentMethod,
  type,
  voucherNumber,
  voucherId,
  amount,
  createdAt,
  partyName,
  selectedCashOrBank,
  selectedModal,
  req,
  session
) => {
  try {
    const object = {
      voucherNumber: voucherNumber,
      voucherId: voucherId,
      voucherModel: selectedModal, // must match enum
      voucherType: type,
      amount: amount,
      payment_mode: paymentMethod?.toLowerCase() || null, // ✅ schema expects lowercase enum
      partyId: party?._id,
      partyName: partyName || party?.partyName,
      partyType: party?.partyType?.toLowerCase(), // must match ["cash","bank","party"]
      sourceId: selectedCashOrBank?._id,
      sourceType: paymentMethod?.toLowerCase() || null, // must match enum
      cmp_id: orgId,
      Primary_user_id: req?.pUserId || req?.owner, // must not be null
      settlement_date: createdAt ? new Date(createdAt) : new Date(),
      voucher_date: createdAt ? new Date(createdAt) : new Date(),
    };

    console.log("Saving settlement object:", object);

    const updatedData = await settlementModel.create([object], { session });
    return updatedData;
  } catch (error) {
    console.error("Error in saveSettlementData:", error);
    throw error;
  }
};

// helper function used to delete receipt and outstanding
export const deleteReceipt = async (tallyId, session = null) => {
  try {
    if (!tallyId) {
      throw new Error("tallyId is required to delete a receipt");
    }

    // Delete receipts by billId
    const receiptQuery = receiptModel.deleteMany({ "billData.billId": tallyId });
    if (session) {
      receiptQuery.session(session);
    }

    const receiptResult = await receiptQuery;

    return {
      success: receiptResult.acknowledged === true,
      deletedCount: receiptResult.deletedCount || 0,
      tallyId,
    };
  } catch (error) {
    console.error("Error in deleteReceipt:", error.message);
    throw error;
  }
};
export const deleteSettlements = async (tallyId, session = null) => {
  try {
    if (!tallyId) {
      throw new Error("tallyId is required to delete a receipt");
    }

    // Delete receipts by billId
    const settlementQuery = settlementModel.deleteMany({ voucherId: tallyId });
    if (session) {
      settlementQuery.session(session);
    }

    const settlementResult = await settlementQuery;

    return {
      success: settlementResult.acknowledged === true,
      deletedCount: settlementResult.deletedCount || 0,
      tallyId,
    };
  } catch (error) {
    console.error("Error in settlementResult:", error.message);
    throw error;
  }
};



