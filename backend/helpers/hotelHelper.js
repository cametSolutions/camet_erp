import roomModal from "../models/roomModal.js";
import RoomStatusHistory from "../models/roomStatusHistory.js";
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
import salesModel from "../models/salesModel.js";

// helper function used to add search concept with room
export const buildDatabaseFilterForRoom = (params) => {
  // console.log("params", params);
  const filter = {
    cmp_id: params.cmp_id,
    primary_user_id: params.Primary_user_id,
  };
  // console.log("params.type", params);
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
// helper function used to add search concept with booking
export const buildDatabaseFilterForBooking = (params) => {
  let filter = {
    cmp_id: params.cmp_id,
    Primary_user_id: params.Primary_user_id,
    status: { $ne: "cancelled" }
  };

  if (params.modal === "checkIn") {
    filter.status = { $nin: ["checkOut"] };
  }
  if (params.roomId) {
    filter["selectedRooms.roomId"] = params.roomId;
  }

  // ✅ Apply date filter FIRST — before searchTerm logic
  if (params.fromDate && params.toDate) {
    const fromStr = new Date(params.fromDate).toISOString().split("T")[0]; // "2026-05-08"
    const toStr = new Date(params.toDate).toISOString().split("T")[0]; // "2026-05-08"

    if (params.modal === "booking") {
      filter.arrivalDate = { $gte: fromStr, $lte: toStr }; // string comparison
    } else if (params.modal === "checkIn") {
      filter.arrivalDate = { $gte: fromStr, $lte: toStr }; // string comparison
    } else {
      // checkOut — use createdAt (proper Date object in DB)
      filter.checkOutDate = {
        $gte: fromStr,
        $lte: toStr,
      };
    }
  }
  // searchTerm logic AFTER date filter
  if (params.searchTerm && params.searchTerm !== "completed") {
    if (params.searchTerm !== "pending") {
      filter.$or = [
        { voucherNumber: { $regex: params.searchTerm, $options: "i" } },
        { customerName: { $regex: params.searchTerm, $options: "i" } },
        {
          "selectedRooms.roomName": {
            $regex: params.searchTerm,
            $options: "i",
          },
        },
        {
          "selectedRooms.roomNumber": {
            $regex: params.searchTerm,
            $options: "i",
          },
        },
      ];
    } else {
      // ✅ Keep existing date filter, only add status
      filter.status = { $exists: false };
    }
  } else if (params.searchTerm === "completed") {
    if (params.modal === "booking") filter.status = "checkIn";
    if (params.modal === "checkIn") filter.status = "checkOut";
  }

  console.log("🔍 Final filter:", JSON.stringify(filter, null, 2));

  return filter;
};

// function used to fetch booking
export const fetchBookingsFromDatabase = async (filter = {}, params = {}) => {
  const { skip = 0, limit = 0 } = params;

  try {
    let selectedModal;

    if (params?.modal === "booking") {
      selectedModal = Booking;
    } else if (params?.modal === "checkIn") {
      selectedModal = CheckIn;
    } else {
      selectedModal = CheckOut;
    }

    const [bookings, totalBookings] = await Promise.all([
      selectedModal
        .find(filter)
        .populate("customerId")
        .populate("guestId")
        .populate("agentId")
        .populate("isHotelAgent")
        .populate("selectedRooms.selectedPriceLevel")
        .populate("bookingId")
        .populate("checkInId")
        .sort({ createdAt: -1 })
        .skip(limit > 0 ? skip : 0)
        .limit(limit > 0 ? limit : 0),

      selectedModal.countDocuments(filter),
    ]);

    const checkInNumbers =
      params?.modal === "checkIn"
        ? bookings.map((b) => b.voucherNumber)
        : params?.modal === "checkOut"
          ? bookings.map((b) => b.checkInId?.voucherNumber)
          : [];

    // Get all room posted sales
    const sales = await salesModel
      .find({
        cmp_id: filter.cmp_id,
        isPostToRoom: true,
        isCancelled: false,
        "convertedFrom.checkInNumber": {
          $in: checkInNumbers,
        },
      })
      .select(
        "_id finalAmount isPostToRoom convertedFrom.checkInNumber paymentSplittingData",
      )
      .lean();

    // Get checkout sales dates
    const checkoutSale = await salesModel
      .find({
        cmp_id: filter.cmp_id,
        isPostToRoom: false,
        isCancelled: false,
        "convertedFrom.checkInNumber": {
          $in: checkInNumbers,
        },
      })
      .select("createdAt salesNumber")
      .lean();

    const saleObject = {};

    for (const sale of checkoutSale) {
      saleObject[sale.salesNumber] = sale.createdAt;
    }

    // Build checkIn mapping

    const totalByCheckIn = {};
    const processedSaleIds = new Set();

    for (const sale of sales) {
      const saleId = String(sale._id);

      if (processedSaleIds.has(saleId)) continue;

      processedSaleIds.add(saleId);

      const saleAmount = Number(sale.finalAmount || 0);

      const saleSplits = sale.paymentSplittingData || [];

      const uniqueCheckIns = new Set(
        (sale.convertedFrom || []).map((c) => c?.checkInNumber).filter(Boolean),
      );

      for (const checkInNumber of uniqueCheckIns) {
        if (!totalByCheckIn[checkInNumber]) {
          totalByCheckIn[checkInNumber] = {
            totalAmount: 0,
            paymentSplittingData: [],
          };
        }

        totalByCheckIn[checkInNumber].totalAmount += saleAmount;

        for (const split of saleSplits) {
          const existing = totalByCheckIn[
            checkInNumber
          ].paymentSplittingData.find(
            (s) => s.source === split.source && s.type === split.type,
          );

          if (existing) {
            existing.amount = parseFloat(
              (existing.amount + Number(split.amount || 0)).toFixed(2),
            );
          } else {
            totalByCheckIn[checkInNumber].paymentSplittingData.push({
              ...split,
            });
          }
        }
      }
    }

    // Attach sales info to bookings

    const bookingsWithSales = await Promise.all(
      bookings.map(async (b) => {
        const voucherNumber =
          params?.modal === "checkIn"
            ? b.voucherNumber
            : params?.modal === "checkOut"
              ? b.checkInId?.voucherNumber
              : "";

        const checkInData = totalByCheckIn[voucherNumber] || {
          totalAmount: 0,
          paymentSplittingData: [],
        };

        const specificSale =
          params?.modal === "checkOut"
            ? await salesModel
                .findOne({
                  cmp_id: filter.cmp_id,
                  salesNumber: b.voucherNumber,
                })
                .lean()
            : null;

        return {
          ...b.toObject(),

          displayTotal:
            params?.modal === "checkOut" &&
            specificSale?.paymentSplittingData?.length
              ? specificSale.paymentSplittingData.reduce(
                  (total, split) => total + Number(split.amount || 0),
                  0,
                ) + Number(checkInData.totalAmount || 0)
              : 0,

          restaurantSubTotal: checkInData.totalAmount,

          restaurantPaymentSplittingData: [
            ...(specificSale?.paymentSplittingData || []),

            ...(checkInData.paymentSplittingData || []),
          ],

          createdDate: saleObject[b.voucherNumber],
        };
      }),
    );

    return {
      bookings: bookingsWithSales,
      totalBookings,
    };
  } catch (error) {
    console.error("❌ Error fetching bookings:", error);

    throw new Error("Failed to fetch bookings.");
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

  const modal = parseInt(req.query.modal) || 0;
  const roomId = parseInt(req.query.roomId) || 0;

  const today = new Date();

  const rawFrom = req.query.fromDate;
  const rawTo = req.query.toDate;
  const fromDate = rawFrom ? new Date(rawFrom) : today;
  const toDate = rawTo ? new Date(rawTo) : today;

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
    fromDate,
    toDate,
  };
};

export const updateStatus = async (roomData, status, session) => {
  const ids = roomData.map((room) => room.roomId);

  if (ids.length === 0) {
    return;
  }

  const rooms = await roomModal
    .find({ _id: { $in: ids } })
    .select("_id primary_user_id secondary_user_id cmp_id roomName status")
    .session(session);

  const roomsToUpdate = rooms.filter((room) => room.status !== status);

  if (roomsToUpdate.length === 0) {
    return;
  }

  const roomIds = roomsToUpdate.map((room) => room._id);
  const now = new Date();

  await RoomStatusHistory.updateMany(
    { roomId: { $in: roomIds }, isCurrent: true },
    { $set: { toDate: now, isCurrent: false } },
    { session },
  );

  await RoomStatusHistory.insertMany(
    roomsToUpdate.map((room) => ({
      primary_user_id: room.primary_user_id,
      secondary_user_id: room.secondary_user_id,
      cmp_id: room.cmp_id,
      roomId: room._id,
      roomNumber: room.roomName,
      status: status == "booking" ? "booked" : status == "checkIn" ? "occupied" : status,
      fromDate: now,
      toDate: null,
      isCurrent: true,
    })),
    { session },
  );

  await roomModal.updateMany(
    { _id: { $in: roomIds } },
    { $set: { status } },
    { session },
  );
};

export const createInitialRoomStatusHistory = async (room, session) => {
  await RoomStatusHistory.create(
    [
      {
        primary_user_id: room.primary_user_id,
        secondary_user_id: room.secondary_user_id,
        cmp_id: room.cmp_id,
        roomId: room._id,
        roomNumber: room.roomName,
        status: room.status == "booking" ? "booked" : room.status,
        fromDate: new Date(),
        toDate: null,
        isCurrent: true,
      },
    ],
    { session },
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
    (series) => series.under === "hotel",
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
  session,
) => {
  const bookingNumberStr = String(bookingNumber);
  const checkInNumberStr = String(checkInNumber);

  // Find all receipts where billData.bill_no matches either bookingNumber or checkInNumber
  const receiptArray = await receiptModel
    .find({ "billData.bill_no": { $in: [bookingNumberStr, checkInNumberStr] } })
    .session(session);

  // console.log("Found receipts:", receiptArray.length);

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
    }),
  );

  // console.log("Receipts updated successfully.");
};

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
  session,
) => {
  const receipts = [];

  // Find voucher series for receipt
  const voucher = await VoucherSeriesModel.findOne({
    cmp_id,
    voucherType: "receipt",
  }).session(session);

  const series_id = voucher?.series
    ?.find((s) => s.under === "hotel")
    ?._id.toString();
  if (!series_id) throw new Error("No valid receipt series found for hotel");

  // Get checkInId from request
  // const checkInId = req.body.selectedCheckOut?.map((it) => it.allCheckInIds)

  let checkInId = [];
  if (req.body.selectedCheckOut.length == 1) {
    checkInId = [req.body.selectedCheckOut[0]._id];
  } else {
    checkInId = req.body.selectedCheckOut
      ?.flatMap((it) => it.allCheckInIds)
      .filter(Boolean);
  }

  if (!checkInId) {
    throw new Error("Missing checkInId in selectedCheckOut");
  }

  // Find all sales with this checkInId
  const allSales = await salesModel
    .find({
      checkInId: { $in: checkInId },
      cmp_id,
    })
    .sort({ createdAt: 1 }) // FIFO: oldest first
    .session(session);

  const saleIds = allSales.map((s) => s._id);

  // ============ CASE 1: SPLIT PAYMENT MODE ============
  if (payment?.paymentMode === "split") {
    const splitDetails = payment?.splitDetails || [];
    // Find all outstandings for this customer from sales with this
    const customerids = splitDetails.map(
      (item) => new mongoose.Types.ObjectId(item.customer),
    );
    console.log("custmereidsssss", customerids);
    console.log("salesids", saleIds);
    const outstandings = await TallyData.find({
      billId: { $in: saleIds },
      cmp_id,
      source: "sales",
    })
      .sort({ bill_date: 1, createdAt: 1 }) // FIFO: oldest first
      .session(session);

    if (outstandings.length === 0) {
      console.log(`No outstanding found for customer ${customerids}`);
    }
    let balancetoset = amount;
    // Process each split detail
    for (const split of splitDetails) {
      if (split.sourceType === "credit") {
        continue;
      }
      const billData = [];
      const splitCustomerId = split.customer;
      const splitAmount = Number(split.amount || 0);
      const splitSourceType = split.sourceType; // "cash" or "bank"

      if (splitAmount <= 0) continue;
      // console.log("splitamount",splitAmount,splitAmount <= 0)
      // Create receipt for this split
      const receiptVoucher = await generateVoucherNumber(
        cmp_id,
        "receipt",
        series_id,
        session,
      );
      const serialNumber = await getNewSerialNumber(
        receiptModel,
        "serialNumber",
        session,
      );

      const paymentDetails =
        splitSourceType === "cash"
          ? { cash_ledname: customerName, cash_name: customerName }
          : { bank_ledname: customerName, bank_name: customerName };
      const matchedoutstanding = outstandings.find(
        (item) => item.party_id === splitCustomerId,
      );

      const matchedsale = allSales.find(
        (item) => String(item.party?._id) === String(splitCustomerId),
      );
      console.log("outstandings", outstandings);
      for (const item of outstandings) {
        console.log(outstandings);
        const sale = allSales.find((s) => s.salesNumber === item.bill_no);
        console.log("ssssalesssssssss", sale);
        billData.push({
          _id: item._id,
          bill_no: sale.salesNumber,
          billId: sale._id,
          bill_date: item.bill_date,
          bill_pending_amt: splitAmount,
          source: "hotel",
          settledAmount: splitAmount,
          remainingAmount: 0,
        });
      }
      console.log("billdata", billData);

      const newReceipt = await buildReceipt(
        receiptVoucher,
        serialNumber,
        paymentDetails,
        balancetoset,
        splitAmount,
        splitSourceType === "cash" ? "Cash" : "Online",
        splitCustomerId,
        cmp_id,
        series_id,
        billData,
        req,
        session,
      );

      receipts.push(newReceipt);

      balancetoset -= splitAmount;
    }

    for (const item of outstandings) {
      // 1. Find matching sale for this outstanding
      const sale = allSales.find((s) => s.salesNumber === item.bill_no);
      if (!sale) continue;

      // 2. Find ALL receipts matching this sale's salesNumber
      const receipts = await receiptModel.find({
        "billData.bill_no": sale.salesNumber, // Matches any billData.bill_no
      });

      // 3. Push ALL matching receipts to this outstanding
      if (receipts.length > 0) {
        await TallyData.updateOne(
          { _id: item._id },
          {
            $push: {
              appliedReceipts: {
                $each: receipts.map((receipt) => ({
                  _id: receipt._id,
                  receiptNumber: receipt.receiptNumber,
                  settledAmount: receipt.settledAmount, // or calculate per receipt
                  date: new Date(),
                })),
              },
            },
          },
          { session },
        );
      }
    }
  }

  // ============ CASE 2: SINGLE PAYMENT MODE (FIFO) ============
  else if (payment?.paymentMode === "single") {
    // Find all outstanding bills for sales with this checkInId (FIFO order)
    const outstandings = await TallyData.find({
      billId: { $in: saleIds },
      bill_pending_amt: { $gt: 0 }, // Only pending bills
      cmp_id,
      source: "sales", // Only sales outstandings
    })
      .sort({ bill_date: 1, createdAt: 1 }) // FIFO: oldest first
      .session(session);

    // If no pending outstandings, create advance only
    if (outstandings.length === 0) {
      const advanceTally = await TallyData.create(
        [
          {
            Primary_user_id: req.pUserId || req.owner,
            cmp_id,
            party_id: partyId,
            party_name: customerName,
            bill_date: new Date(),
            bill_no: `ADV-${Date.now()}`, // Temporary
            billId: null,
            bill_amount: 0,
            bill_pending_amt: -amount,
            accountGroup: createdTallyData,
            user_id: req.sUserId,
            advanceAmount: amount,
            advanceDate: new Date(),
            classification: "Cr",
            source: "receipt",
          },
        ],
        { session },
      );

      const billData = [
        {
          _id: advanceTally[0]._id,
          bill_no: `ADV-${Date.now()}`,
          billId: null,
          bill_date: new Date(),
          bill_pending_amt: 0,
          source: "hotel",
          settledAmount: amount,
          remainingAmount: 0,
        },
      ];

      const receiptVoucher = await generateVoucherNumber(
        cmp_id,
        "receipt",
        series_id,
        session,
      );
      const serialNumber = await getNewSerialNumber(
        receiptModel,
        "serialNumber",
        session,
      );

      const paymentDetails =
        paymentMethod === "cash"
          ? { cash_ledname: customerName, cash_name: customerName }
          : { bank_ledname: customerName, bank_name: customerName };
      console.log("checkkkkkkkkkkkkk", cmp_id);
      console.log("seriesiddd", series_id);
      console.log("partyidd", partyId);
      const balancetoset = null;
      const newReceipt = await buildReceipt(
        receiptVoucher,
        serialNumber,
        paymentDetails,
        balancetoset,
        amount,
        paymentMethod === "cash" ? "Cash" : "Online",
        partyId,
        cmp_id,
        series_id,
        billData,
        req,
        session,
      );

      receipts.push(newReceipt);

      // Update advance tally with receipt number
      await TallyData.updateOne(
        { _id: advanceTally[0]._id },
        {
          $set: {
            bill_no: newReceipt.receiptNumber,
          },
        },
        { session },
      );

      return receipts;
    }

    // Distribute amount across bills using FIFO
    let amountLeft = amount;
    const billData = [];
    const outstandingsToUpdate = [];

    for (const outstanding of outstandings) {
      if (amountLeft <= 0) break;

      const pendingAmount = outstanding.bill_pending_amt || 0;
      const settleAmount = Math.min(amountLeft, pendingAmount);

      const matchedsale = allSales.find(
        (item) => String(item.party?._id) === String(outstanding.party_id),
      );

      billData.push({
        _id: outstanding._id,
        bill_no: matchedsale.salesNumber,
        billId: matchedsale._id,
        bill_date: outstanding.bill_date,
        bill_pending_amt: pendingAmount,
        source: "hotel",
        settledAmount: pendingAmount,
        remainingAmount: 0,
      });

      outstandingsToUpdate.push({
        outstandingId: outstanding._id,
        settledAmount: pendingAmount,
        newPendingAmount: 0,
      });

      amountLeft -= settleAmount;
    }

    // Create advance tally BEFORE receipt if still amount left
    let advanceTallyId = null;
    if (amountLeft > 0) {
      const advanceTally = await TallyData.create(
        [
          {
            Primary_user_id: req.pUserId || req.owner,
            cmp_id,
            party_id: partyId,
            party_name: customerName,
            bill_date: new Date(),
            bill_no: `ADV-${Date.now()}`, // Temporary
            billId: null,
            bill_amount: 0,
            bill_pending_amt: -amountLeft,
            accountGroup: createdTallyData,
            user_id: req.sUserId,
            advanceAmount: amountLeft,
            advanceDate: new Date(),
            classification: "Cr",
            source: "receipt",
          },
        ],
        { session },
      );

      advanceTallyId = advanceTally[0]._id;

      billData.push({
        _id: advanceTallyId,
        bill_no: `ADV-${Date.now()}`,
        billId: null,
        bill_date: new Date(),
        bill_pending_amt: 0,
        source: "hotel",
        settledAmount: amountLeft,
        remainingAmount: 0,
      });
    }

    // Create single receipt
    const receiptVoucher = await generateVoucherNumber(
      cmp_id,
      "receipt",
      series_id,
      session,
    );
    const serialNumber = await getNewSerialNumber(
      receiptModel,
      "serialNumber",
      session,
    );

    const paymentDetails =
      paymentMethod === "cash"
        ? { cash_ledname: customerName, cash_name: customerName }
        : { bank_ledname: customerName, bank_name: customerName };
    console.log("cmpid before buildreceipt", cmp_id);
    const balancetoset = null;
    const newReceipt = await buildReceipt(
      receiptVoucher,
      serialNumber,
      paymentDetails,
      balancetoset,
      amount,
      paymentMethod === "cash" ? "Cash" : "Online",
      partyId,
      cmp_id,
      series_id,
      billData,
      req,
      session,
    );

    receipts.push(newReceipt);

    // Update all affected outstandings with receipt info
    for (const update of outstandingsToUpdate) {
      await TallyData.updateOne(
        { _id: update.outstandingId },
        {
          $set: {
            bill_pending_amt: update.newPendingAmount,
          },
          $push: {
            appliedReceipts: {
              _id: newReceipt._id,
              receiptNumber: newReceipt.receiptNumber,
              settledAmount: update.settledAmount,
              date: new Date(),
            },
          },
        },
        { session },
      );
    }

    // Update advance tally with receipt number if exists
    if (advanceTallyId) {
      await TallyData.updateOne(
        { _id: advanceTallyId },
        {
          $set: {
            bill_no: newReceipt.receiptNumber,
          },
        },
        { session },
      );
    }
  }

  return receipts;
};

const buildReceipt = async (
  receiptVoucher,
  serialNumber,
  paymentDetails,
  balancetoset = null,
  amount,
  paymentMethod,
  partyId,
  cmp_id,
  series_id,
  billData,
  req,
  session,
) => {
  console.log("cmpid in the buld receipt", cmp_id);
  let selectedParty = await Party.findOne({ _id: partyId })
    .populate("accountGroup")
    .session(session);

  if (selectedParty) {
    selectedParty = selectedParty.toObject();

    if (selectedParty.accountGroup && selectedParty.accountGroup._id) {
      selectedParty.accountGroup_id = selectedParty.accountGroup._id.toString();
    }

    delete selectedParty.accountGroup;
  }
  console.log("line 886 hotelhelper");
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
    totalBillAmount: balancetoset ?? amount,
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
  session,
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
      sourceId: selectedCashOrBank,
      sourceType:
        paymentMethod?.toLowerCase() === "cash"
          ? "cash"
          : ["card", "upi"].includes(paymentMethod?.toLowerCase())
            ? "bank"
            : paymentMethod?.toLowerCase() || null, // must match enum
      cmp_id: orgId,
      Primary_user_id: req?.pUserId || req?.owner, // must not be null
      settlement_date: createdAt ? new Date(createdAt) : new Date(),
      voucher_date: createdAt ? new Date(createdAt) : new Date(),
    };

    // console.log("Saving settlement object:", object);

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
    const receiptQuery = receiptModel.deleteMany({
      "billData.billId": tallyId,
    });
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

export const handleAdvanceAndDiscountSettlementInRestaurant = async (
  settlementData,
  selectedCheckOut,
  cmp_id,
  session,
) => {
  try {
    if (!Array.isArray(settlementData) || settlementData.length === 0)
      return true;
    if (!Array.isArray(selectedCheckOut) || selectedCheckOut.length === 0) {
      throw new Error("selectedCheckOut is required");
    }
    if (!cmp_id) throw new Error("Missing cmp_id");
    const checkInIds = selectedCheckOut.map((item) => item._id).filter(Boolean);

    const tallyData = await TallyData.find({
      billId: { $in: checkInIds },
    }).session(session);

    // Make sure this array exists
    const restaurantSideDiscountAdjustmentArray = settlementData;

    let totalOfDiscountAndAdvance =
      restaurantSideDiscountAdjustmentArray.reduce(
        (acc, item) =>
          acc + Number(item.finalValue || 0) + Number(item.advanceAmount || 0),
        0,
      );

    // Handle discount + advance adjustments
    if (restaurantSideDiscountAdjustmentArray.length > 0) {
      for (const item of restaurantSideDiscountAdjustmentArray) {
        const finalValue = Number(item.finalValue || 0);
        const advanceAmount = Number(item.advanceAmount || 0);

        const totalAmountToDeduct = finalValue + advanceAmount;

        // Add discount entry to sale
        if (finalValue > 0) {
          const discountObject = {
            _id: item._id,
            option: "discount",
            value: item.value,
            action: "sub",
            taxPercentage: item.taxPercentage,
            taxAmt: item.taxAmt,
            hsn: item.hsn,
            finalValue: finalValue,
          };

          await salesModel.updateOne(
            { _id: item.saleId },
            {
              $inc: {
                totalAdditionalCharges: finalValue,
              },
              $push: {
                additionalCharges: discountObject,
              },
            },
            { session },
          );
        }

        // Deduct from tally
        if (totalAmountToDeduct > 0) {
          await TallyData.updateOne(
            { billId: item.saleId },
            {
              $inc: {
                bill_amount: -totalAmountToDeduct,
                bill_pending_amt: -totalAmountToDeduct,
              },
            },
            { session },
          );
        }
      }
    }

    // Settlement adjustment
    if (tallyData.length > 0 && totalOfDiscountAndAdvance > 0) {
      for (let i = 0; i < tallyData.length; i++) {
        if (totalOfDiscountAndAdvance <= 0) break;

        const currentBillAmount = Number(tallyData[i].bill_amount || 0);

        let maximumAmountToDeduct = 0;

        if (currentBillAmount > totalOfDiscountAndAdvance) {
          maximumAmountToDeduct = totalOfDiscountAndAdvance;
        } else {
          maximumAmountToDeduct = currentBillAmount;
        }

        if (maximumAmountToDeduct > 0) {
          // Reduce bill values
          await TallyData.updateOne(
            { _id: tallyData[i]._id },
            {
              $inc: {
                bill_amount: -maximumAmountToDeduct,
                bill_pending_amt: -maximumAmountToDeduct,
              },
            },
            { session },
          );

          // Update nested bill data
          await receiptModel.updateOne(
            { "billData.billId": tallyData[i]._id },
            {
              $set: {
                totalBillAmount: maximumAmountToDeduct,
                enteredAmount: maximumAmountToDeduct,
                "billData.$.settledAmount": maximumAmountToDeduct,
              },
            },
            { session },
          );

          totalOfDiscountAndAdvance -= maximumAmountToDeduct;
        }
      }
    }

    return true;
  } catch (error) {
    console.error(
      "Error in handleAdvanceAndDiscountSettlementInRestaurant:",
      error.message,
    );

    throw error;
    // helper used convert room to available
  }
};

export const updateSwapDetails = async (existingRoom, updatedRoom, session) => {
  console.log("=== UPDATE SWAP DETAILS STARTED ===", existingRoom);
  console.log("=== UPDATE SWAP DETAILS STARTED ===", updatedRoom);
  try {
    // ✅ Find rooms that are in existingRoom but NOT in updatedRoom, and isSwap is true
    const removedRooms = existingRoom.filter(
      (room) =>
        room.isSwapped === false &&
        !updatedRoom.some(
          (updated) => updated.roomId.toString() === room.roomId.toString(),
        ),
    );

    console.log("Removed rooms:", removedRooms);

    // ✅ Delete these rooms
    if (removedRooms.length > 0) {
      const result = await roomModal.updateMany(
        {
          _id: {
            $in: removedRooms.map((room) => room.roomId),
          },
        },
        {
          $set: {
            status: "dirty",
          },
        },
        { session },
      );

      console.log("reessE", result);
    }
  } catch (error) {
    console.error(error);
  }
};


export const findBlockedRooms = async (
  cmp_id,
  reportDate,
  reportMonth,
  reportYear,
) => {
  try {
    const errors = [];

    const isValidObjectId = (id) =>
      mongoose.Types.ObjectId.isValid(id) &&
      String(new mongoose.Types.ObjectId(id)) === String(id);

    const isValidDateObject = (date) =>
      date instanceof Date && !Number.isNaN(date.valueOf());

    const isValidYear = (year) => {
      const y = Number(year);
      return Number.isInteger(y) && y >= 2000 && y <= 3000;
    };

    const isValidMonth = (month) => {
      const m = Number(month);
      return Number.isInteger(m) && m >= 1 && m <= 12;
    };

    if (!cmp_id) errors.push("cmp_id is required");
    else if (!isValidObjectId(cmp_id)) errors.push("cmp_id is invalid");

    if (reportYear != null && reportYear !== "" && !isValidYear(reportYear)) {
      errors.push("reportYear must be a valid year");
    }

    if (reportMonth != null && reportMonth !== "" && !isValidMonth(reportMonth)) {
      errors.push("reportMonth must be between 1 and 12");
    }

    if (reportDate != null && reportDate !== "") {
      const parsedDate = new Date(reportDate);
      if (!isValidDateObject(parsedDate)) {
        errors.push("reportDate must be a valid date");
      }
    }

    if (errors.length) {
      return {
        success: false,
        message: "Validation failed",
        errors,
        data: null,
      };
    }

    const MS_PER_DAY = 1000 * 60 * 60 * 24;
    const cmpObjectId = new mongoose.Types.ObjectId(cmp_id);

    const toDay = (d) =>
      new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()));

    const addDays = (date, days) => {
      const d = new Date(date);
      d.setUTCDate(d.getUTCDate() + days);
      return d;
    };

    const todayDay = toDay(new Date());
    const tomorrowDay = addDays(todayDay, 1);

    // ─── Financial year window ───────────────────────────────────────
    const now = new Date();
    const fallbackYear =
      now.getMonth() >= 3 ? now.getFullYear() : now.getFullYear() - 1;

    const selectedYear = reportYear ? Number(reportYear) : fallbackYear;

    const fyStart = new Date(Date.UTC(selectedYear, 3, 1));
    const fyEndCap = new Date(Date.UTC(selectedYear + 1, 3, 1));

    // If reportDate exists, year should usually be MTD within FY up to report date/today
    let fyEnd = fyEndCap;
    if (reportDate) {
      const rd = toDay(new Date(reportDate));
      fyEnd = addDays(rd, 1) < fyEndCap ? addDays(rd, 1) : fyEndCap;
    } else if (todayDay < fyEndCap) {
      fyEnd = tomorrowDay;
    }

    // ─── Month window ────────────────────────────────────────────────
    let monthStart = null;
    let monthEnd = null;

    if (reportMonth != null && reportMonth !== "") {
      monthStart = new Date(Date.UTC(selectedYear, Number(reportMonth) - 1, 1));

      const nextMonthStart = new Date(
        Date.UTC(selectedYear, Number(reportMonth), 1),
      );

      if (reportDate) {
        const rd = toDay(new Date(reportDate));
        monthEnd = addDays(rd, 1) < nextMonthStart ? addDays(rd, 1) : nextMonthStart;
      } else if (todayDay >= monthStart && todayDay < nextMonthStart) {
        monthEnd = tomorrowDay;
      } else {
        monthEnd = nextMonthStart;
      }
    } else if (reportDate) {
      // Fix: derive month window from reportDate for day reports
      const rd = new Date(reportDate);
      const y = rd.getUTCFullYear();
      const m = rd.getUTCMonth();
      const dayOnly = toDay(rd);

      monthStart = new Date(Date.UTC(y, m, 1));
      const nextMonthStart = new Date(Date.UTC(y, m + 1, 1));
      monthEnd = addDays(dayOnly, 1) < nextMonthStart ? addDays(dayOnly, 1) : nextMonthStart;
    }

    // ─── Target day ──────────────────────────────────────────────────
    let targetDay = null;
    if (reportDate) {
      targetDay = toDay(new Date(reportDate));
    }

    // ─── Fetch blocked + household ───────────────────────────────────
    const allRecords = await RoomStatusHistory.find(
      {
        cmp_id: cmpObjectId,
        status: { $in: ["blocked", "household"] },
      },
      {
        roomId: 1,
        roomNumber: 1,
        status: 1,
        fromDate: 1,
        toDate: 1,
        isCurrent: 1,
      },
    ).lean();

    // ─── Filter invalid zero-night rows ──────────────────────────────
    const validRecords = allRecords.filter((r) => {
      if (!r?.fromDate) return false;
      if (r.toDate == null) return true;

      const fromDay = toDay(new Date(r.fromDate));
      const toDateDay = toDay(new Date(r.toDate));

      // same-day start/end contributes 0 nights and shouldn't affect monthly/yearly
      if (fromDay.getTime() === toDateDay.getTime()) return false;

      return true;
    });

    const blockedRecords = validRecords.filter((r) => r.status === "blocked");
    const householdRecords = validRecords.filter((r) => r.status === "household");

    // ─── Helpers ─────────────────────────────────────────────────────
    const isActiveOnDay = (record, day) => {
      const fromDay = toDay(new Date(record.fromDate));
      if (fromDay.getTime() > day.getTime()) return false;

      if (record.toDate == null) return true;

      const toDateDay = toDay(new Date(record.toDate));

      // exclusive end-day logic
      return day.getTime() < toDateDay.getTime();
    };

    const getDailyCount = (records) => {
      if (!targetDay) return 0;
      return records.filter((r) => isActiveOnDay(r, targetDay)).length;
    };

    const getRoomNightCount = (records, windowStart, windowEnd) => {
      if (!windowStart || !windowEnd) return 0;

      let totalNights = 0;

      for (const record of records) {
        const fromDay = toDay(new Date(record.fromDate));
        const endDay =
          record.toDate == null
            ? windowEnd < tomorrowDay ? windowEnd : tomorrowDay
            : toDay(new Date(record.toDate));

        const effectiveStart =
          fromDay > windowStart ? fromDay : windowStart;
        const effectiveEnd =
          endDay < windowEnd ? endDay : windowEnd;

        const nights = Math.round(
          (effectiveEnd.getTime() - effectiveStart.getTime()) / MS_PER_DAY,
        );

        if (nights > 0) totalNights += nights;
      }

      return totalNights;
    };

    // ─── Counts: blocked ─────────────────────────────────────────────
    const blockedDaily = getDailyCount(blockedRecords);
    const blockedMonthly =
      monthStart && monthEnd
        ? getRoomNightCount(blockedRecords, monthStart, monthEnd)
        : 0;
    const blockedYearly = getRoomNightCount(blockedRecords, fyStart, fyEnd);

    // ─── Counts: household ───────────────────────────────────────────
    const householdDaily = getDailyCount(householdRecords);
    const householdMonthly =
      monthStart && monthEnd
        ? getRoomNightCount(householdRecords, monthStart, monthEnd)
        : 0;
    const householdYearly = getRoomNightCount(householdRecords, fyStart, fyEnd);

    return {
      success: true,
      message: "Blocked room event counts fetched successfully",
      errors: [],
      data: {
        // blocked only
        yearlyRooms: blockedYearly,
        monthlyRooms: blockedMonthly,
        dailyRooms: blockedDaily,

        // household only
        householdYearly,
        householdMonthly,
        householdDaily,

        // combined
        combinedYearly: blockedYearly + householdYearly,
        combinedMonthly: blockedMonthly + householdMonthly,
        combinedDaily: blockedDaily + householdDaily,
      },
    };
  } catch (error) {
    console.error("findBlockedRooms error:", error);
    return {
      success: false,
      message: "Failed to fetch blocked rooms",
      errors: [error.message],
      data: null,
    };
  }
};

export const getRoomMetricsForPeriod = ({
  reportType,
  fromDate,
  toDate,
  totalPhysicalRooms,
  blockedCounts,
}) => {
  const MS_PER_DAY = 1000 * 60 * 60 * 24;

  const toUTCDay = (str) => {
    if (!str) return null;
    if (str instanceof Date) {
      return new Date(Date.UTC(str.getFullYear(), str.getMonth(), str.getDate()));
    }
    const [y, m, d] = str.split("T")[0].split("-").map(Number);
    return new Date(Date.UTC(y, m - 1, d));
  };

  // ─── DAY ────────────────────────────────────────────────────────────
  if (reportType === "day") {
    const blockedRooms  = blockedCounts?.data?.dailyRooms  || 0;
    const totalRooms    = totalPhysicalRooms;
    const saleableRooms = totalRooms - blockedRooms;

    return {
      reportType,
      totalRooms,
      blockedRooms,
      saleableRooms,
      availableRoomNights:  saleableRooms,
      totalRoomNights:      totalRooms,
      saleableRoomNights:   saleableRooms,
      blockedRoomNights:    blockedRooms,
      periodDays: 1,
    };
  }

  // ─── MONTH / YEAR ────────────────────────────────────────────────────
  const start = toUTCDay(fromDate);
  const end   = toUTCDay(toDate);

  // periodDays is inclusive: Jun1→Jun18 = 18 days
  const periodDays = Math.round((end - start) / MS_PER_DAY) + 1;

  const totalRooms      = totalPhysicalRooms;
  const totalRoomNights = totalRooms * periodDays;

  // Use pre-fetched blockedCounts — NO day loop, NO extra DB calls
  const blockedRoomNights =
    reportType === "month"
      ? blockedCounts?.data?.monthlyRooms || 0
      : blockedCounts?.data?.yearlyRooms  || 0;

  const saleableRoomNights = Math.max(0, totalRoomNights - blockedRoomNights);

  return {
    reportType,
    totalRooms,
    periodDays,
    totalRoomNights,
    blockedRoomNights,
    saleableRoomNights,
    availableRoomNights: saleableRoomNights,
    // aliases for backward compat used in processCheckins
    blockedRooms:  blockedRoomNights,
    saleableRooms: saleableRoomNights,
  };
};

export const fetchRestaurantDetails = async (cmp_id, fromDate, toDate) => {
  try {
    const startDate = new Date(fromDate);
    const endDate = new Date(toDate);
    endDate.setDate(endDate.getDate() + 1);

    const result = await salesModel.aggregate([
      {
        $match: {
          cmp_id: new mongoose.Types.ObjectId(cmp_id),
          voucherType: "sales",
          isCancelled: { $ne: true },
          date: {
            $gte: startDate,
            $lt: endDate,
          },
        },
      },
      {
        $lookup: {
          from: "voucherseries",
          localField: "series_id",
          foreignField: "series._id",
          as: "seriesMaster",
        },
      },
      {
        $addFields: {
          matchedSeriesDoc: { $first: "$seriesMaster" },
        },
      },
      {
        $addFields: {
          matchedSeries: {
            $first: {
              $filter: {
                input: { $ifNull: ["$matchedSeriesDoc.series", []] },
                as: "sr",
                cond: {
                  $eq: ["$$sr._id", "$series_id"],
                },
              },
            },
          },
        },
      },
      {
        $match: {
          "matchedSeries.under": "restaurant",
        },
      },
      {
        $group: {
          _id: null,
          restaurantServiceTotal: {
            $sum: {
              $cond: [
                { $eq: ["$isPostToRoom", true] },
                { $ifNull: ["$finalAmount", 0] },
                0,
              ],
            },
          },
          restaurantTotal: {
            $sum: {
              $cond: [
                { $eq: ["$isPostToRoom", false] },
                { $ifNull: ["$finalAmount", 0] },
                0,
              ],
            },
          },
          totalRestaurantSales: {
            $sum: { $ifNull: ["$finalAmount", 0] },
          },
          salesCount: { $sum: 1 },
        },
      },
      {
        $project: {
          _id: 0,
          restaurantServiceTotal: 1,
          restaurantTotal: 1,
          totalRestaurantSales: 1,
          salesCount: 1,
        },
      },
    ]);

    return (
      result[0] || {
        restaurantServiceTotal: 0,
        restaurantTotal: 0,
        totalRestaurantSales: 0,
        salesCount: 0,
      }
    );
  } catch (error) {
    console.error("fetchRestaurantDetails error:", error);
    return {
      restaurantServiceTotal: 0,
      restaurantTotal: 0,
      totalRestaurantSales: 0,
      salesCount: 0,
    };
  }
};
