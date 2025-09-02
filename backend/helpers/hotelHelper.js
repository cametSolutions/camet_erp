import roomModal from "../models/roomModal.js";
import { Booking, CheckIn, CheckOut } from "../models/bookingModal.js";
import mongoose from "mongoose";
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

  // Add search functionality if search term is provided
  if (params.searchTerm && params.searchTerm != "completed") {
    if (params.searchTerm != "pending") {
      filter.$or = [
        { voucherNumber: { $regex: params.searchTerm, $options: "i" } },
        { customerName: { $regex: params.searchTerm, $options: "i" } },
      ];
    }else{
     filter = { ...filter, status: { $exists: false } };

    }                                                    

  } else if (params.searchTerm == "completed") {
   
    if (params.modal == "booking") {
      filter = { ...filter, status: "checkIn" };
    }
    if(params.modal == "checkIn") {
      filter = {...filter,status:"checkIn"}
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
  };
};
