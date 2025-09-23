import {
  AdditionalPax,
  VisitOfPurpose,
  IdProof,
  FoodPlan,
} from "../models/hotelSubMasterModal.js";
import TallyData from "../models/TallyData.js";
import hsnModel from "../models/hsnModel.js";
import roomModal from "../models/roomModal.js";
import { Booking, CheckIn, CheckOut } from "../models/bookingModal.js";
import ReceiptModel from "../models/receiptModel.js";
import { formatToLocalDate } from "../helpers/helper.js";

import {
  buildDatabaseFilterForRoom,
  sendRoomResponse,
  fetchRoomsFromDatabase,
  buildDatabaseFilterForBooking,
  fetchBookingsFromDatabase,
  sendBookingsResponse,
  extractRequestParamsForBookings,
  updateStatus,
  saveSettlementDataHotel,
} from "../helpers/hotelHelper.js";
import { extractRequestParams } from "../helpers/productHelper.js";
import { generateVoucherNumber } from "../helpers/voucherHelper.js";
import mongoose, { get } from "mongoose";
import VoucherSeriesModel from "../models/VoucherSeriesModel.js";
const { ObjectId } = mongoose.Types;
import Party from "../models/partyModel.js";
import { saveSettlementData } from "../helpers/salesHelper.js";
import salesModel from "../models/salesModel.js";
import Organization from "../models/OragnizationModel.js";
import { getNewSerialNumber } from "../helpers/secondaryHelper.js";
import partyModel from "../models/partyModel.js";
import {
  updateReceiptForRooms,
  createReceiptForSales,
} from "../helpers/hotelHelper.js";
// function used to save additional pax details
export const saveAdditionalPax = async (req, res) => {
  try {
    const { additionalPaxName, amount } = req.body;
    const { cmp_id } = req.params;

    const generatedId = new mongoose.Types.ObjectId();
    const newPax = new AdditionalPax({
      _id: generatedId,
      additionalPaxName,
      amount,
      additionalPaxId: generatedId,
      cmp_id,
      Primary_user_id: req.pUserId || req.owner,
    });

    const result = await newPax.save();
    return res.status(201).json({
      message: "Additional Pax saved successfully",
      data: result,
    });
  } catch (error) {
    console.error("Error saving additional pax:", error);
    return res.status(500).json({
      message: "Internal Server Error",
      error: error.message,
    });
  }
};

// function used to fetch additional pax details
export const getAdditionalPax = async (req, res) => {
  try {
    const { cmp_id } = req.params;
    const primaryUserId = req.pUserId || req.owner;

    if (!cmp_id || !primaryUserId) {
      return res.status(400).json({
        message: "Missing required parameters: cmp_id or Primary_user_id",
      });
    }

    const additionalPax = await AdditionalPax.find({
      cmp_id,
      Primary_user_id: primaryUserId,
    });

    return res.status(200).json({
      message: "Additional Pax fetched successfully",
      data: additionalPax,
    });
  } catch (error) {
    console.error("Error fetching Additional Pax:", error);
    return res.status(500).json({
      message: "Internal Server Error",
      error: error.message,
    });
  }
};

// function used to edit additional pax
export const updateAdditionalPax = async (req, res) => {
  try {
    const { additionalPaxName, amount, id } = req.body;
    const updatedPax = await AdditionalPax.findOneAndUpdate(
      { _id: id },
      {
        $set: {
          additionalPaxName,
          amount,
        },
      },
      { new: true }
    );
    if (!updatedPax) {
      return res.status(404).json({
        message: "Additional Pax not found",
      });
    }

    return res.status(200).json({
      message: "Additional Pax updated successfully",
      data: updatedPax,
    });
  } catch (error) {
    console.error("Error updating additional pax:", error);
    return res.status(500).json({
      message: "Internal Server Error",
      error: error.message,
    });
  }
};

//function used to handle delete data

export const deleteAdditionalPax = async (req, res) => {
  try {
    const { cmp_id, id } = req.params;

    // Validate input
    if (!cmp_id || !id) {
      return res.status(400).json({
        message: "Company ID and Additional Pax ID are required.",
      });
    }

    // Attempt to delete the document
    const result = await AdditionalPax.deleteOne({ _id: id, cmp_id });

    if (result.deletedCount === 0) {
      return res.status(404).json({
        message: "Additional Pax not found or already deleted.",
      });
    }

    return res.status(200).json({
      message: "Additional Pax deleted successfully.",
    });
  } catch (error) {
    console.log("Error deleting Additional Pax:", error);
    return res.status(500).json({
      message: "Internal Server Error",
      error: error.message,
    });
  }
};

// function used to save visit of purpose
export const saveVisitOfPurpose = async (req, res) => {
  try {
    const { visitOfPurpose } = req.body;
    const { cmp_id } = req.params;
    const generatedId = new mongoose.Types.ObjectId();
    const newVisitOfPurpose = new VisitOfPurpose({
      _id: generatedId,
      visitOfPurpose,
      visitOfPurposeId: generatedId,
      cmp_id,
      Primary_user_id: req.pUserId || req.owner,
    });

    const result = await newVisitOfPurpose.save();
    return res.status(201).json({
      message: "Visit of purpose saved successfully",
      data: result,
    });
  } catch (error) {
    console.error("Error saving  visit of purpose:", error);
    return res.status(500).json({
      message: "Internal Server Error",
      error: error.message,
    });
  }
};

// function used to fetch visit of purpose
export const getVisitOfPurpose = async (req, res) => {
  try {
    const { cmp_id } = req.params;
    const primaryUserId = req.pUserId || req.owner;

    if (!cmp_id || !primaryUserId) {
      return res.status(400).json({
        message: "Missing required parameters: cmp_id or Primary_user_id",
      });
    }

    const visitOfPurpose = await VisitOfPurpose.find({
      cmp_id,
      Primary_user_id: primaryUserId,
    });

    return res.status(200).json({
      message: "Visit of purpose fetched successfully",
      data: visitOfPurpose,
    });
  } catch (error) {
    console.error("Error fetching Additional Pax:", error);
    return res.status(500).json({
      message: "Internal Server Error",
      error: error.message,
    });
  }
};

// function used to update visit of purpose
export const updateVisitOfPurpose = async (req, res) => {
  try {
    const { visitOfPurpose, visitOfPurposeId } = req.body;
    const { cmp_id } = req.params;

    if (!ObjectId.isValid(visitOfPurposeId) || !ObjectId.isValid(cmp_id)) {
      return res.status(400).json({ error: "Invalid ID format" });
    }

    const updatedVisitOfPurpose = await VisitOfPurpose.findOneAndUpdate(
      {
        _id: new ObjectId(visitOfPurposeId),
        cmp_id: new ObjectId(cmp_id),
      },
      {
        $set: {
          visitOfPurpose,
        },
      },
      { new: true }
    );

    if (!updatedVisitOfPurpose) {
      return res.status(404).json({
        message: "Visit of purpose not found",
      });
    }

    return res.status(200).json({
      message: "Visit of purpose updated successfully",
      data: updatedVisitOfPurpose,
    });
  } catch (error) {
    console.error("Error updating visit of purpose:", error);
    return res.status(500).json({
      message: "Internal Server Error",
      error: error.message,
    });
  }
};

// function used to delete visit of purpose data

export const deleteVisitOfPurpose = async (req, res) => {
  try {
    const { cmp_id, id } = req.params;

    // Validate input
    if (!cmp_id || !id) {
      return res.status(400).json({
        message: "Company ID and Visit of purpose ID are required.",
      });
    }

    // Attempt to delete the document
    const result = await VisitOfPurpose.deleteOne({ _id: id, cmp_id });

    if (result.deletedCount === 0) {
      return res.status(404).json({
        message: "Visit of purpose not found or already deleted.",
      });
    }

    return res.status(200).json({
      message: "Visit of purpose deleted successfully.",
    });
  } catch (error) {
    console.log("Error deleting visit of purpose:", error);
    return res.status(500).json({
      message: "Internal Server Error",
      error: error.message,
    });
  }
};

// function used to save id proof
export const saveIdProof = async (req, res) => {
  try {
    const { idProof } = req.body;
    const { cmp_id } = req.params;
    const generatedId = new mongoose.Types.ObjectId();
    const newIdProof = new IdProof({
      _id: generatedId,
      idProof,
      idProofId: generatedId,
      cmp_id,
      Primary_user_id: req.pUserId || req.owner,
    });

    const result = await newIdProof.save();
    return res.status(201).json({
      message: "Id proof saved successfully",
      data: result,
    });
  } catch (error) {
    console.error("Error saving  id proof:", error);
    return res.status(500).json({
      message: "Internal Server Error",
      error: error.message,
    });
  }
};

// function used to fetch id proof

export const getIdProof = async (req, res) => {
  try {
    const { cmp_id } = req.params;
    const primaryUserId = req.pUserId || req.owner;

    if (!cmp_id || !primaryUserId) {
      return res.status(400).json({
        message: "Missing required parameters: cmp_id or Primary_user_id",
      });
    }

    const idProofData = await IdProof.find({
      cmp_id,
      Primary_user_id: primaryUserId,
    });

    return res.status(200).json({
      message: "Id proof fetched successfully",
      data: idProofData,
    });
  } catch (error) {
    console.error("Error fetching Additional Pax:", error);
    return res.status(500).json({
      message: "Internal Server Error",
      error: error.message,
    });
  }
};

// function used to update id proof
export const updateIdProof = async (req, res) => {
  try {
    const { idProof, idProofId } = req.body;

    const { cmp_id } = req.params;

    if (!ObjectId.isValid(idProofId) || !ObjectId.isValid(cmp_id)) {
      return res.status(400).json({ error: "Invalid ID format" });
    }

    const updateIdProof = await IdProof.findOneAndUpdate(
      {
        _id: new ObjectId(idProofId),
        cmp_id: new ObjectId(cmp_id),
      },
      {
        $set: {
          idProof,
        },
      },
      { new: true }
    );

    if (!updateIdProof) {
      return res.status(404).json({
        message: "Id proof data not found",
      });
    }

    return res.status(200).json({
      message: "Id proof updated successfully",
      data: updateIdProof,
    });
  } catch (error) {
    console.error("Error updating id proof:", error);
    return res.status(500).json({
      message: "Internal Server Error",
      error: error.message,
    });
  }
};

// function used to delete id proof data

export const deleteIdProof = async (req, res) => {
  try {
    const { cmp_id, id } = req.params;

    // Validate input
    if (!cmp_id || !id) {
      return res.status(400).json({
        message: "Company ID and Id proof ID are required.",
      });
    }

    // Attempt to delete the document
    const result = await IdProof.deleteOne({ _id: id, cmp_id });

    if (result.deletedCount === 0) {
      return res.status(404).json({
        message: "Id proof data not found or already deleted.",
      });
    }

    return res.status(200).json({
      message: "Id proof deleted successfully.",
    });
  } catch (error) {
    console.log("Error deleting id proof:", error);
    return res.status(500).json({
      message: "Internal Server Error",
      error: error.message,
    });
  }
};

// function used to save food plan
export const saveFoodPlan = async (req, res) => {
  try {
    const { foodPlan, amount } = req.body;
    const { cmp_id } = req.params;
    const generatedId = new mongoose.Types.ObjectId();
    const newFoodPlan = new FoodPlan({
      _id: generatedId,
      foodPlan,
      amount,
      foodPlanId: generatedId,
      cmp_id,
      Primary_user_id: req.pUserId || req.owner,
    });

    const result = await newFoodPlan.save();
    return res.status(201).json({
      message: "Food plan saved successfully",
      data: result,
    });
  } catch (error) {
    console.error("Error saving food plan:", error);
    return res.status(500).json({
      message: "Internal Server Error",
      error: error.message,
    });
  }
};

// function used to get food plan details

export const getFoodPlan = async (req, res) => {
  try {
    const { cmp_id } = req.params;
    const primaryUserId = req.pUserId || req.owner;

    if (!cmp_id || !primaryUserId) {
      return res.status(400).json({
        message: "Missing required parameters: cmp_id or Primary_user_id",
      });
    }

    const foodPlans = await FoodPlan.find({
      cmp_id,
      Primary_user_id: primaryUserId,
    });

    return res.status(200).json({
      message: "Food plan fetched successfully",
      data: foodPlans,
    });
  } catch (error) {
    console.error("Error fetching Additional Pax:", error);
    return res.status(500).json({
      message: "Internal Server Error",
      error: error.message,
    });
  }
};

//function used to update food plan
export const updateFoodPlan = async (req, res) => {
  try {
    const { foodPlan, amount, foodPlanId } = req.body;

    const { cmp_id } = req.params;

    const updatedFoodPlan = await FoodPlan.findOneAndUpdate(
      { _id: foodPlanId, cmp_id },
      {
        $set: {
          foodPlan,
          amount,
        },
      },
      { new: true }
    );
    if (!updatedFoodPlan) {
      return res.status(404).json({
        message: "Food plan  not found",
      });
    }

    return res.status(200).json({
      message: "Food plan updated successfully",
      data: updatedFoodPlan,
    });
  } catch (error) {
    console.error("Error updating food plan:", error);
    return res.status(500).json({
      message: "Internal Server Error",
      error: error.message,
    });
  }
};
// function used to delete food plan data

export const deleteFoodPlan = async (req, res) => {
  try {
    const { cmp_id, id } = req.params;

    // Validate input
    if (!cmp_id || !id) {
      return res.status(400).json({
        message: "Company ID and Visit of purpose ID are required.",
      });
    }

    // Attempt to delete the document
    const result = await FoodPlan.deleteOne({ _id: id, cmp_id });

    if (result.deletedCount === 0) {
      return res.status(404).json({
        message: "Food plan not found or already deleted.",
      });
    }

    return res.status(200).json({
      message: "Food plan deleted successfully.",
    });
  } catch (error) {
    console.log("Error deleting food plan:", error);
    return res.status(500).json({
      message: "Internal Server Error",
      error: error.message,
    });
  }
};

// function used to save room details

export const addRoom = async (req, res) => {
  const session = await mongoose.startSession(); // Step 1: Start session

  try {
    const { formData, tableData } = req.body;

    session.startTransaction(); // Step 2: Start transaction

    // Step 3: Fetch HSN data inside the session
    const correspondingHsn = await hsnModel
      .findOne({ _id: formData.hsn })
      .session(session);
    if (!correspondingHsn) {
      await session.abortTransaction();
      return res.status(400).json({ message: "HSN data missing" });
    }

    // Step 4: Create Room document
    const newRoom = new roomModal({
      primary_user_id: req.pUserId || req.owner,
      secondary_user_id: req.sUserId,
      cmp_id: req.params.cmp_id,
      roomName: formData.roomName,
      roomType: formData.roomType,
      bedType: formData.bedType,
      unit: formData.unit,
      roomFloor: formData.roomFloor,
      hsn: formData.hsn,
      priceLevel: tableData,
    });

    // Step 5: Save using session
    await newRoom.save({ session });

    // Step 6: Commit the transaction
    await session.commitTransaction();

    res.status(201).json({ message: "Room Added Successfully", data: newRoom });
  } catch (error) {
    console.log("Error saving room details:", error);

    // Rollback on error
    await session.abortTransaction();

    res
      .status(500)
      .json({ message: "Internal Server Error", error: error.message });
  } finally {
    // Step 7: Always end session
    session.endSession();
  }
};

// function used to fetch rooms
export const getRooms = async (req, res) => {
  try {
    const params = extractRequestParams(req);
    console.log("Rooms params:", params);
    const filter = buildDatabaseFilterForRoom(params);

    // Get current date and time
    const now = new Date();

    // Get all rooms based on basic filters
    const { rooms, totalRooms } = await fetchRoomsFromDatabase(filter, params);

    // Only care about checkOutDate in further logic
    // Extract checkout only from params if given, else use today
    let { checkOutDate } = params;
    let endDate;
    if (checkOutDate) {
      endDate = checkOutDate;
    } else {
      endDate = new Date();
      endDate.setHours(23, 59, 59, 999);
    }

    const startDate = new Date(); // startDate is required for check date, but not for overlap logic

    console.log("Checking availability for date (checkOutDate logic only):", {
      endDate,
    });
    console.log("companyId", req.params.cmp_id);

    // Find rooms that are currently booked for the specified checkout date (ignore arrivalDate)
    const overlappingBookings = await Booking.find({
      cmp_id: req.params.cmp_id,
      checkOutDate: { $gt: startDate }, // Only consider checkOutDate
      status: { $nin: ["CheckIn"] },
    });

    console.log("Overlapping bookings found:", overlappingBookings.length);

    // Find rooms that are currently checked-in for the specified checkout date
    const overlappingCheckIns = await CheckIn.find({
      cmp_id: req.params.cmp_id,
      checkOutDate: { $gt: startDate },
    }).select("roomDetails");

    console.log("Overlapping check-ins found:", overlappingCheckIns.length);

    // Collect all occupied room IDs
    const occupiedRoomId = new Set();

    // Add booked room IDs
    overlappingBookings.forEach((booking) => {
      if (booking.selectedRooms && Array.isArray(booking.selectedRooms)) {
        booking.selectedRooms.forEach((room) => {
          const roomId = room.roomId || room._id || room;
          if (roomId) {
            occupiedRoomId.add(roomId.toString());
          }
        });
      }
    });

    // Add checked-in room IDs
    overlappingCheckIns.forEach((checkIn) => {
      if (checkIn.selectedRooms && Array.isArray(checkIn.selectedRooms)) {
        checkIn.selectedRooms.forEach((room) => {
          const roomId = room.roomId || room._id || room;
          if (roomId) {
            occupiedRoomId.add(roomId.toString());
          }
        });
      }
    });

    // Filter out occupied **and dirty/blocked** rooms
    const vacantRooms = rooms.filter((room) => {
      const roomId = room._id.toString();
      const isOccupied = occupiedRoomId.has(roomId);

      // exclude rooms with status 'dirty' or 'blocked'
      const isCleanAndOpen =
        room.status !== "dirty" && room.status !== "blocked";

      return !isOccupied && isCleanAndOpen;
    });

    // Add availability status
    const roomsWithStatus = vacantRooms.map((room) => ({
      ...room.toObject(),
      status: "vacant",
      checkedAt: now,
    }));

    // Send response
    const sendRoomResponseData = sendRoomResponse(
      res,
      roomsWithStatus,
      vacantRooms.length,
      params
    );

    return sendRoomResponseData;
  } catch (error) {
    console.error("Error in getRooms:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error, try again!",
    });
  }
};

// function used to get all rooms

export const getAllRooms = async (req, res) => {
  try {
    const { cmp_id } = req.params;
    const selectedDate = req.query.selectedData;

    // Validate company ID
    if (!cmp_id) {
      return res.status(400).json({
        success: false,
        message: "Company ID is required",
      });
    }

    // Validate if cmp_id is a valid ObjectId
    if (!mongoose.Types.ObjectId.isValid(cmp_id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid Company ID format",
      });
    }

    // if(selectedDate){

    // }

    // Fetch all rooms for the company
    const rooms = await roomModal
      .find({
        cmp_id: cmp_id, // MongoDB will automatically cast valid ObjectId strings
      })
      .populate("cmp_id", "name") // Populate organization details
      .populate("roomType") // Populate from brand collection
      .populate("roomFloor") // Populate from subCategory collection
      .populate("bedType") // Populate from category collection
      .populate("priceLevel.priceLevel", "name") // Populate price level details
      .sort({ roomName: 1 }) // Sort by room name (roomNumber doesn't exist in schema)
      .lean(); // Use lean() for better performance

    return res.status(200).json({
      success: true,
      message: "Rooms fetched successfully",
      data: {
        rooms,
      },
    });
  } catch (error) {
    console.error("Error in getAllRooms:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error, try again!",
      data: [],
    });
  }
};

// function used to edit room details

export const editRoom = async (req, res) => {
  const session = await mongoose.startSession(); // Step 1: Start a session

  try {
    const { formData, tableData } = req.body;

    // Step 2: Start the transaction
    session.startTransaction();

    // Step 3: Validate HSN existence within session
    const correspondingHsn = await hsnModel
      .findOne({ _id: formData.hsn })
      .session(session);

    if (!correspondingHsn) {
      await session.abortTransaction();
      return res.status(400).json({ message: "HSN data missing" });
    }

    // Step 4: Update room using session
    const updatedRoom = await roomModal.findOneAndUpdate(
      { _id: req.params.id, cmp_id: req.params.cmp_id },
      {
        $set: {
          roomName: formData.roomName,
          roomType: formData.roomType,
          bedType: formData.bedType,
          roomFloor: formData.roomFloor,
          hsn: formData.hsn,
          unit: formData.unit,
          priceLevel: tableData,
        },
      },
      { new: true, session } // Important: pass session in options
    );

    if (!updatedRoom) {
      await session.abortTransaction();
      return res.status(404).json({ message: "Room not found" });
    }

    // Step 5: Commit the transaction
    await session.commitTransaction();

    res.status(200).json({ message: "Room data updated successfully" });
  } catch (error) {
    console.error("Error saving room details:", error);

    // Step 6: Abort on error
    await session.abortTransaction();

    res
      .status(500)
      .json({ message: "Internal Server Error", error: error.message });
  } finally {
    // Step 7: Always end the session
    session.endSession();
  }
};

// function used to delete room

export const deleteRoom = async (req, res) => {
  const roomId = req.params.id;

  try {
    const deletedRoom = await roomModal.findByIdAndDelete(roomId);
    if (deletedRoom) {
      return res.status(200).json({
        success: true,
        message: "Room deleted successfully",
      });
    } else {
      return res.status(404).json({
        success: false,
        message: "Room not found",
      });
    }
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: "Internal server error, try again!",
    });
  }
};

// function used for room booking
export const roomBooking = async (req, res) => {
  const session = await Booking.startSession();

  try {
    const bookingData = req.body?.data;
    const isFor = req.body?.modal;
    const paymentData = req.body?.paymentData;
    const orgId = req.params.cmp_id;

    if (!bookingData.arrivalDate) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    let selectedModal;
    let voucherType;
    let under = "hotel";

    // 🔹 Decide which modal & voucherType to use
    if (isFor === "bookingPage") {
      selectedModal = Booking;
      voucherType = "saleOrder";
    } else if (isFor === "checkIn") {
      if (bookingData?.bookingId) {
        const updateBookingData = await Booking.findByIdAndUpdate(
          bookingData.bookingId,
          { status: "checkIn" },
          { new: true }
        ).session(session);

        if (!updateBookingData) {
          return res.status(400).json({
            success: false,
            message: "Booking not found",
          });
        }
      }
      selectedModal = CheckIn;
      voucherType = "deliveryNote";
    } else {
      if (bookingData?.checkInId) {
        const updateBookingData = await CheckIn.findByIdAndUpdate(
          bookingData.checkInId,
          { status: "checkOut" },
          { new: true }
        ).session(session);

        if (!updateBookingData) {
          return res.status(400).json({
            success: false,
            message: "Check In not found",
          });
        }
      }
      selectedModal = CheckOut;
      voucherType = "sales";
    }

    const series_id = bookingData.voucherId || null;
    let savedBooking;

    // ✅ Start Transaction
    await session.withTransaction(async () => {
      // 🔹 Generate Voucher Number
      const bookingNumber = await generateVoucherNumber(
        orgId,
        voucherType,
        series_id,
        session
      );

      bookingData.voucherNumber = bookingNumber?.voucherNumber;
      bookingData.voucherId = series_id;

      // 🔹 Save Booking
      const newBooking = new selectedModal({
        cmp_id: orgId,
        Primary_user_id: req.pUserId || req.owner,
        Secondary_user_id: req.sUserId,
        ...bookingData,
      });

      savedBooking = await newBooking.save({ session });

      // 🔹 Handle Advance Receipt if advanceAmount > 0
      if (bookingData.advanceAmount && bookingData.advanceAmount > 0) {
        const voucher = await VoucherSeriesModel.findOne({
          cmp_id: orgId,
          voucherType: "receipt",
        }).session(session);

        const series_idReceipt = voucher?.series
          ?.find((s) => s.under === "hotel")
          ?._id.toString();

        // 🔹 Save Advance Object
        const advanceObject = new TallyData({
          Primary_user_id: req.pUserId || req.owner,
          cmp_id: orgId,
          party_id: bookingData?.customerId,
          party_name: bookingData?.customerName,
          mobile_no: bookingData?.mobileNumber,
          bill_date: new Date(),
          bill_no: savedBooking?.voucherNumber,
          billId: savedBooking._id,
          bill_amount: bookingData.advanceAmount,
          bill_pending_amt: 0,
          accountGroup: bookingData.accountGroup,
          user_id: req.sUserId,
          advanceAmount: bookingData.advanceAmount,
          advanceDate: new Date(),
          classification: "Cr",
          source: under,
          from: selectedModal.modelName, // ✅ store model name, not function
        });

        await advanceObject.save({ session });

        // 🔹 Bill Data for Receipt
        const billData = [
          {
            _id: savedBooking._id,
            bill_no: savedBooking?.voucherNumber,
            billId: savedBooking._id,
            bill_date: new Date(),
            bill_pending_amt: 0,
            source: under,
            settledAmount: bookingData.advanceAmount,
            remainingAmount: 0,
          },
        ];

        // 🔹 Build Receipt Function
        const buildReceipt = async (
          receiptVoucher,
          serialNumber,
          paymentDetails,
          amount,
          paymentMethod
        ) => {
          let selectedParty = await partyModel
            .findOne({ _id: bookingData?.customerId })
            .populate("accountGroup")
            .session(session);

          if (selectedParty) {
            selectedParty = selectedParty.toObject();
            if (selectedParty.accountGroup?._id) {
              selectedParty.accountGroup_id =
                selectedParty.accountGroup._id.toString();
            }
            delete selectedParty.accountGroup;
          }

          const receipt = new ReceiptModel({
            createdAt: new Date(),
            date: await formatToLocalDate(new Date(), orgId, session),
            receiptNumber: receiptVoucher?.usedSeriesNumber,
            series_id: series_idReceipt,
            usedSeriesNumber: receiptVoucher?.usedSeriesNumber || null,
            serialNumber,
            cmp_id: orgId,
            party: selectedParty,
            billData,
            totalBillAmount: bookingData.advanceAmount,
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

        // 🔹 Party for Settlement
        const selectedParty = await partyModel
          .findOne({ _id: bookingData.customerId })
          .session(session);

        // ✅ Single Payment Mode
        if (paymentData.mode === "single") {
          const receiptVoucher = await generateVoucherNumber(
            orgId,
            "receipt",
            series_idReceipt,
            session
          );

          const serialNumber = await getNewSerialNumber(
            ReceiptModel,
            "serialNumber",
            session
          );

          const method = paymentData.payments[0]?.method;
          const selectedBankOrCashParty = await partyModel
            .findOne({ _id: paymentData.payments[0]?.accountId })
            .session(session);

          const paymentDetails =
            method === "cash"
              ? {
                  cash_ledname: bookingData?.customerName,
                  cash_name: bookingData?.customerName,
                }
              : {
                  bank_ledname: bookingData?.customerName,
                  bank_name: bookingData?.customerName,
                };

          await buildReceipt(
            receiptVoucher,
            serialNumber,
            paymentDetails,
            bookingData.advanceAmount,
            method === "cash" ? "Cash" : "Online"
          );

          await saveSettlementDataHotel(
            selectedParty,
            orgId,
            method === "cash" ? "cash" : "bank",
            selectedModal.modelName,
            newBooking.voucherNumber,
            newBooking?._id,
            newBooking.advanceAmount,
            new Date(),
            selectedParty?.partyName,
            selectedBankOrCashParty,
            selectedModal.modelName,
            req,
            session
          );
        }
        // ✅ Multiple Payment Mode
        else {
          for (const payment of paymentData?.payments || []) {
            const receiptVoucher = await generateVoucherNumber(
              orgId,
              "receipt",
              series_idReceipt,
              session
            );

            const serialNumber = await getNewSerialNumber(
              ReceiptModel,
              "serialNumber",
              session
            );

            const selectedBankOrCashParty = await partyModel
              .findOne({ _id: payment.accountId })
              .session(session);

            await saveSettlementDataHotel(
              selectedParty,
              orgId,
              payment.method === "cash" ? "cash" : "bank",
              selectedModal.modelName,
              newBooking.voucherNumber,
              newBooking?._id,
              newBooking.advanceAmount,
              new Date(),
              selectedParty?.partyName,
              selectedBankOrCashParty,
              selectedModal.modelName,
              req,
              session
            );

            const paymentDetails =
              payment.method === "cash"
                ? {
                    cash_ledname: bookingData?.customerName,
                    cash_name: bookingData?.customerName,
                  }
                : {
                    bank_ledname: bookingData?.customerName,
                    bank_name: bookingData?.customerName,
                  };

            await buildReceipt(
              receiptVoucher,
              serialNumber,
              paymentDetails,
              payment.amount,
              payment.method === "cash" ? "Cash" : "Online"
            );
          }
        }
      }

      // 🔹 Update Room Status
      let status =
        selectedModal.modelName === "CheckIn" ? "checkIn" : "booking";
      await updateStatus(bookingData?.selectedRooms, status, session);
    });

    res.status(201).json({
      success: true,
      message: "Booking saved successfully",
    });
  } catch (error) {
    console.error("Error saving booking:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  } finally {
    await session.endSession();
  }
};

// function used to fetch booking list
export const getBookings = async (req, res) => {
  try {
    const params = extractRequestParamsForBookings(req);
    const filter = buildDatabaseFilterForBooking(params);
    const { bookings, totalBookings } = await fetchBookingsFromDatabase(
      filter,
      params
    );

    const sendRoomResponseData = sendBookingsResponse(
      res,
      bookings,
      totalBookings,
      params
    );
  } catch (error) {
    console.error("Error in getProducts:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error, try again!",
    });
  }
};

// function used to delete booking details
export const deleteBooking = async (req, res) => {
  try {
    const bookingId = req.params.id;
    const deletedBooking = await Booking.findByIdAndDelete(bookingId);
    if (deletedBooking) {
      return res.status(200).json({
        success: true,
        message: "Booking deleted successfully",
      });
    } else {
      return res.status(404).json({
        success: false,
        message: "Booking not found",
      });
    }
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: "Internal server error, try again!",
    });
  }
};

// function used to update booking details
export const updateBooking = async (req, res) => {
  const session = await Booking.startSession();

  try {
    const bookingData = req.body?.data;
    const modal = req.body?.modal;
    const bookingId = req.params.id;

    if (!bookingData.arrivalDate) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    let selectedModal;
    if (modal == "checkIn") {
      selectedModal = CheckIn;
    } else if (modal == "Booking") {
      selectedModal = Booking;
    } else {
      selectedModal = CheckOut;
    }

    await session.withTransaction(async () => {
      console.log("Booking Data:", bookingData);
      // If advance amount is present, update TallyData
      if (bookingData.advanceAmount && bookingData.advanceAmount > 0) {
        let findOne = await TallyData.findOne({
          billId: bookingId.toString(),
        });

        const updatedTally = await TallyData.updateOne(
          {
            billId: bookingId.toString(), // ensure type match
          },
          {
            $set: {
              bill_amount: bookingData.advanceAmount,
              bill_pending_amt: 0,
            },
          },
          {
            new: true, // return updated document
            session, // required if using transaction
            upsert: false, // set true if you want to create if not found
          }
        );
        console.log("updatedTally", updatedTally);
      }

      // Update booking data
      await selectedModal.findByIdAndUpdate(
        bookingId,
        { $set: bookingData },
        { new: true, session }
      );
    });

    res.status(200).json({
      success: true,
      message: "Booking updated successfully",
    });
  } catch (error) {
    console.error("Error updating booking:", {
      error: error.message,
      bookingId: req.params.id,
      body: req.body,
    });
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  } finally {
    await session.endSession();
  }
};

// function used to fetch booking advance details

export const fetchAdvanceDetails = async (req, res) => {
  try {
    const bookingId = req.params.id;
    const type = req.query?.type;
    console.log("type", type);
    console.log("bookingId", bookingId);
    let advanceDetails = null;
    if (type == "EditCheckOut") {
      let checkOutData = await CheckOut.findOne({ _id: bookingId });
      if (checkOutData) {
        let checkInData = await CheckIn.findOne({
          _id: checkOutData.checkInId,
        });
        let bookingSideAdvanceDetails = await TallyData.find({
          billId: checkInData.bookingId,
        });
        let checkInSideAdvanceDetails = await TallyData.find({
          billId: checkInData._id,
        });
        let checkOutSideAdvanceDetails = await TallyData.find({
          billId: checkOutData._id,
        });
        advanceDetails = [
          ...bookingSideAdvanceDetails,
          ...checkInSideAdvanceDetails,
          ...checkOutSideAdvanceDetails,
        ];
      }
    } else if (type == "EditChecking") {
      let checkInData = await CheckIn.findOne({
        _id: bookingId,
      });
      if (checkInData) {
        let bookingSideAdvanceDetails = await TallyData.find({
          billId: checkInData.bookingId,
        });
        let checkInSideAdvanceDetails = await TallyData.find({
          billId: checkInData._id,
        });
        advanceDetails = [
          ...bookingSideAdvanceDetails,
          ...checkInSideAdvanceDetails,
        ];
      }
    } else {
      advanceDetails = await TallyData.find({ billId: bookingId });
    }
    if (advanceDetails) {
      return res.status(200).json({
        success: true,
        message: "Advance details fetched successfully",
        data: advanceDetails,
      });
    } else {
      return res.status(404).json({
        success: false,
        message: "Advance details not found",
      });
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch advance details",
    });
  }
};

export const getAllRoomsWithStatusForDate = async (req, res) => {
  const { cmp_id } = req.params;
  const { selectedDate } = req.query; // expected format: "YYYY-MM-DD"

  try {
    // 1. Fetch all rooms for the company
    const allRooms = await roomModal
      .find({ cmp_id })
      .populate("cmp_id", "name") // Populate organization details
      .populate("roomType") // Populate from brand collection
      .populate("roomFloor") // Populate from subCategory collection
      .populate("bedType") // Populate from category collection
      .populate("priceLevel.priceLevel", "name") // Populate price level details
      .sort({ roomName: 1 }) // Sort by room name (roomNumber doesn't exist in schema)
      .lean();

    // 2. Bookings: status NOT 'checkIn' AND date overlaps selectedDate
    const bookings = await Booking.find({
      cmp_id,
      status: { $ne: "checkIn" }, // skip check-ins, only pre-arrival bookings
      arrivalDate: { $lte: selectedDate },
      checkOutDate: { $gte: selectedDate },
    }).select("selectedRooms");

    // 3. CheckIns: status NOT 'checkOut' AND date overlaps selectedDate
    const checkins = await CheckIn.find({
      cmp_id,
      status: { $ne: "checkOut" }, // skip already checked out
      arrivalDate: { $lte: selectedDate },
      checkOutDate: { $gte: selectedDate },
    }).select("selectedRooms");

    // --- Collect booked room IDs
    const bookedRoomIds = new Set();
    for (const booking of bookings) {
      for (const selRoom of booking.selectedRooms) {
        if (selRoom.roomId) {
          bookedRoomIds.add(selRoom.roomId.toString());
        }
      }
    }

    // --- Collect occupied room IDs
    const occupiedRoomIds = new Set();
    for (const checkin of checkins) {
      for (const selRoom of checkin.selectedRooms) {
        if (selRoom.roomId) {
          occupiedRoomIds.add(selRoom.roomId.toString());
        }
      }
    }

    // --- Mark each room's status
    const roomsWithStatus = allRooms.map((room) => {
      let status = room?.status;
      if (occupiedRoomIds.has(room._id.toString())) {
        status = "occupied";
      } else if (bookedRoomIds.has(room._id.toString())) {
        status = "booked";
      }
      return { ...room, status };
    });

    return res.json({ success: true, rooms: roomsWithStatus });
  } catch (error) {
    console.error("Error getting rooms with status:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch rooms",
      error: error.message,
    });
  }
};
// Update room status
export const updateRoomStatus = async (req, res) => {
  try {
    const { id } = req.params; // Get room ID from URL
    const { status } = req.body; // Get status from request body

    console.log("Updating room status:", { id, status }); // Debug log

    // Validate room ID
    if (!id) {
      return res.status(400).json({ message: "Room ID is required" });
    }

    // Validate status
    const validStatuses = ["vacant", "booked", "occupied", "dirty", "blocked"];
    if (!status || !validStatuses.includes(status)) {
      return res.status(400).json({
        message: "Invalid or missing status",
        validStatuses,
      });
    }

    // Find room by ID and update
    const updatedRoom = await roomModal
      .findByIdAndUpdate(id, { status }, { new: true, runValidators: true })
      .populate("roomType")
      .populate("bedType")
      .populate("roomFloor");

    console.log("Room found and updated:", updatedRoom); // Debug log

    if (!updatedRoom) {
      return res.status(404).json({ message: "Room not found" });
    }

    res.json({
      message: "Room status updated successfully",
      room: updatedRoom,
    });
  } catch (error) {
    console.error("Error updating room status:", error);
    res.status(500).json({
      message: "Server error",
      error: error.message,
      stack: process.env.NODE_ENV === "development" ? error.stack : undefined,
    });
  }
};
// function used  to fetch date based booking details and checking details
export const getDateBasedRoomsWithStatus = async (req, res) => {
  const { cmp_id } = req.params;
  const { selectedDate } = req.query;

  try {
    // 1. Fetch pre-arrival bookings (status not 'checkIn')
    const bookings = await Booking.find({
      cmp_id,
      status: { $ne: "checkIn" },
      arrivalDate: { $lte: selectedDate },
      checkOutDate: { $gte: selectedDate },
    });

    // 2. Fetch check-ins (status not 'checkOut')
    const checkins = await CheckIn.find({
      cmp_id,
      status: { $ne: "checkOut" },
      arrivalDate: { $lte: selectedDate },
      checkOutDate: { $gte: selectedDate },
    });

    // ✅ Send response
    return res.status(200).json({
      success: true,
      bookings,
      checkins,
    });
  } catch (error) {
    console.error("Error getting bookings:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch bookings",
      error: error.message,
    });
  }
};
// function used to close multiple checkouts
export const checkoutWithArrayOfData = async (req, res) => {
  const session = await CheckOut.startSession();
  try {
    const checkOutArray = req.body?.data; // checkout array
    const orgId = req.params.cmp_id;
    const isFor = req.body?.modal;

    if (!checkOutArray || checkOutArray.length === 0) {
      return res.status(400).json({
        success: false,
        message: "No checkout data provided",
      });
    }

    const selectedModal = CheckOut; // Always checkout here
    const voucherType = "sales";
    const under = "hotel";

    await session.withTransaction(async () => {
      for (const bookingData of checkOutArray) {
        // ✅ Step 1: Update checkIn if linked
        if (bookingData?.checkInId) {
          let updateBookingData = await CheckIn.findByIdAndUpdate(
            bookingData.checkInId,
            { status: "checkOut" },
            { new: true, session }
          );

          if (!updateBookingData) {
            throw new Error(
              "Check In not found for ID: " + bookingData.checkInId
            );
          }
        }

        const findSeries = await VoucherSeriesModel.findOne({
          cmp_id: orgId,
          voucherType,
        });
        let series_id = findSeries?.series
          .find((s) => s.under === under)
          ?._id.toString();

        console.log("series_id", series_id);

        const bookingNumber = await generateVoucherNumber(
          orgId,
          voucherType,
          series_id,
          session
        );

        let checkInId = bookingData._id;
        // Attach generated voucher details
        bookingData.voucherNumber = bookingNumber?.voucherNumber;
        bookingData.voucherId = series_id;
        bookingData.advanceAmount = 0;
        delete bookingData._id;
        // bookingData.advanceAmount = Number(bookingData.balanceToPay)
        // bookingData.balanceToPay = 0;
        // ✅ Step 3: Save checkout entry
        const newBooking = new selectedModal({
          cmp_id: orgId,
          Primary_user_id: req.pUserId || req.owner,
          Secondary_user_id: req.sUserId,
          customerId: bookingData.customerId?._id,
          checkInId,
          ...bookingData,
        });

        let updateCheckIn = await CheckIn.findByIdAndUpdate(
          checkInId,
          { status: "checkOut" },
          { new: true, session }
        );
        if (!updateCheckIn) {
          throw new Error("Check In not found for ID: " + bookingData._id);
        }

        const savedBooking = await newBooking.save({ session });

        // ✅ Step 4: If advance exists, save tally entry
        // if (bookingData.advanceAmount && bookingData.advanceAmount > 0) {
        //   const advanceObject = new TallyData({
        //     Primary_user_id: req.pUserId || req.owner,
        //     cmp_id: orgId,
        //     party_id: bookingData.customerId?._id,
        //     party_name: bookingData?.customerName,
        //     mobile_no: bookingData?.mobileNumber,
        //     bill_date: new Date(),
        //     bill_no: savedBooking?.voucherNumber,
        //     billId: savedBooking._id,
        //     bill_amount: bookingData.advanceAmount,
        //     bill_pending_amt: bookingData.advanceAmount,
        //     accountGroup: bookingData.customerId?.accountGroup,
        //     user_id: req.sUserId,
        //     advanceAmount: bookingData.advanceAmount,
        //     advanceDate: new Date(),
        //     classification: "Cr",
        //     source: under,
        //   });

        //   await advanceObject.save({ session });
        // }
      }
    });

    res.status(201).json({
      success: true,
      message: "All checkouts saved successfully",
    });
  } catch (error) {
    console.error("Error saving booking:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  } finally {
    await session.endSession();
  }
};

// function used to fetch out standing data
export const fetchOutStandingAndFoodData = async (req, res) => {
  try {
    const checkoutData = req.body?.data;
    const isForPreview = req.body?.isForPreview;
    console.log(isForPreview);
    if (!checkoutData || checkoutData.length === 0) {
      return res.status(400).json({
        success: false,
        message: "No checkout data provided",
      });
    }

    // Collect all advanceDetails across checkouts
    let allAdvanceDetails = [];
    let allKotData = [];
    for (const item of checkoutData) {
      console.log(
        "itemsd",
        checkoutData[0]?.checkInId?.voucherNumber,
        isForPreview
      );

 const docs = await salesModel.find({
  "convertedFrom.id": { $exists: true, $ne: null }, // only if id exists & not null
  "convertedFrom.checkInNumber": isForPreview
    ? item.voucherNumber
    : item?.checkInId?.voucherNumber,
});

      console.log("docs", docs);
      allKotData.push(...docs);

      const checkInData = await CheckIn.findOne({
        _id: isForPreview ? item._id : item?.checkInId?._id,
      });

      if (!checkInData) continue;

      const bookingSideAdvanceDetails = await TallyData.find({
        billId: checkInData.bookingId,
      });

      console.log("bookingSideAdvanceDetails", item.checkInId);

      const checkInSideAdvanceDetails = await TallyData.find({
        billId: isForPreview ? item._id : item.checkInId?._id,
      });
      const checkOutSideAdvanceDetails = !isForPreview ? await TallyData.find({
        bill_no: item.voucherNumber,
      }) : []

      allAdvanceDetails.push(
        ...bookingSideAdvanceDetails,
        ...checkInSideAdvanceDetails,
        ...checkOutSideAdvanceDetails
      );
      
    }

    console.log("allAdvanceDetails", allKotData);

    if (allAdvanceDetails.length > 0 || allKotData.length > 0) {
      return res.status(200).json({
        success: true,
        message: "Advance details fetched successfully",
        data: allAdvanceDetails || [],
        kotData: allKotData || [],
      });
    } else {
      return res.status(404).json({
        success: false,
        message: "Advance details not found",
      });
    }
  } catch (error) {
    console.error("Error fetching advance details:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch advance details",
      error: error.message,
    });
  }
};

async function hotelVoucherSeries(cmp_id, session) {
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

export const convertCheckOutToSale = async (req, res) => {
  const session = await mongoose.startSession();
  try {
    let saleNumber, savedVoucherData;

    await session.withTransaction(async () => {
      const { cmp_id } = req.params;
      let {
        paymentMethod,
        paymentDetails,
        selectedCheckOut,
        selectedParty,
        restaurantBaseSaleData,
        isPostToRoom = false,
      } = req.body;

      if (!paymentDetails) {
        throw new Error("Missing payment details");
      }

      const cashAmt = Number(paymentDetails?.cashAmount || 0);
      const onlineAmt = Number(paymentDetails?.onlineAmount || 0);

      if (cashAmt > 0 && onlineAmt > 0) {
        paymentMethod = "mixed";
      }

      // ✅ Fetch voucher series correctly
      const specificVoucherSeries = await hotelVoucherSeries(cmp_id, session);

      // ✅ Generate sale number
      saleNumber = await generateVoucherNumber(
        cmp_id,
        "sales",
        specificVoucherSeries._id.toString(),
        session
      );

      // ✅ Payment splitting
      const paymentSplittingArray = createPaymentSplittingArray(
        paymentDetails,
        cashAmt,
        onlineAmt
      );

      // ✅ Party info
      const partyData = await getSelectedParty(selectedParty, cmp_id, session);
      const party = mapPartyData(partyData);

      // ✅ Save Sales Voucher
      savedVoucherData = await createSalesVoucher(
        cmp_id,
        specificVoucherSeries,
        saleNumber,
        req,
        selectedCheckOut,
        party,
        partyData,
        paymentSplittingArray,
        session
      );
      // // ✅ Handle Outstanding
      const paidAmount = isPostToRoom ? 0 : cashAmt + onlineAmt;
      const pendingAmount = selectedCheckOut.reduce(
        (acc, item) => acc + (item.balanceToPay || 0),
        0
      );

      let createdTallyData = await createTallyEntry(
        cmp_id,
        req,
        selectedParty,
        selectedCheckOut,
        savedVoucherData[0],
        paidAmount,
        pendingAmount,
        session
      );

      await createReceiptForSales(
        cmp_id,
        paymentDetails,
        paymentMethod,
        party?.customerName,
        Number(cashAmt || 0) + Number(onlineAmt || 0),
        party._id,
        savedVoucherData[0],
        createdTallyData[0],
        req,
        restaurantBaseSaleData,
        session
      );
      let selectedCashOrBank;

      if (cashAmt > 0) {
        selectedCashOrBank = await Party.findOne({
          _id: paymentDetails?.selectedCash,
        }).session(session);
        // ✅ Save Settlement
        await saveSettlement(
          paymentDetails,
          selectedParty,
          selectedCashOrBank,
          cmp_id,
          savedVoucherData[0],
          cashAmt,
          "cash",
          req,
          session
        );
      }
      if (onlineAmt > 0) {
        selectedCashOrBank = await Party.findOne({
          _id: paymentDetails?.selectedBank,
        }).session(session);
        await saveSettlement(
          paymentDetails,
          selectedParty,
          selectedCashOrBank,
          cmp_id,
          savedVoucherData[0],
          onlineAmt,
          "bank",
          req,
          session
        );
      }

      if (selectedCheckOut?.length > 0) {
        await Promise.all(
          selectedCheckOut.map((item) =>
            updateReceiptForRooms(
              item?.voucherNumber,
              item?.bookingId?.voucherNumber,
              saleNumber?.voucherNumber,
              savedVoucherData[0]?._id,
              session
            )
          )
        );
      }

      // ✅ Save CheckOut and update CheckIn
      if (selectedCheckOut?.length > 0) {
        await Promise.all(
          selectedCheckOut.map(async (item) => {
            item.bookingId = item?.bookingId ?? item?.bookingId?._id;
            item.customerId = item?.customerId ?? item?.customerId?._id;
            item.checkInId = item?._id;
            item.balanceToPay = 0;

            // ✅ Create CheckOut document (array + session + required fields)
            await CheckOut.create(
              [
                {
                  ...item,
                  _id: undefined,
                  cmp_id,
                  Primary_user_id: req.owner || req.pUserId,
                  voucherNumber: saleNumber?.voucherNumber,
                  checkInId: item?._id,
                  bookingId: item?.bookingId ?? item?.bookingId?._id,
                  balanceToPay: 0,
                },
              ],
              { session }
            );

            // ✅ Update CheckIn status
            await CheckIn.updateOne(
              { _id: item._id },
              { status: "checkOut" },
              { session }
            );
          })
        );
      }

      // ✅ Update room status
      await Promise.all(
        selectedCheckOut.map((item) =>
          updateStatus(item?.selectedRooms, "dirty", session)
        )
      );
    });

    // ✅ Send response after transaction completes
    res.status(200).json({
      success: true,
      message: "Checkout converted to Sales successfully",
      data: { saleNumber, salesRecord: savedVoucherData[0] },
    });
  } catch (error) {
    console.error("Error converting checkout:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Internal server error",
    });
  } finally {
    await session.endSession();
  }
};

function createPaymentSplittingArray(paymentDetails, cashAmt, onlineAmt) {
  const arr = [];
  console.log("paymentDetails", paymentDetails);
  if (cashAmt > 0) {
    arr.push({
      type: "cash",
      amount: cashAmt,
      ref_id: paymentDetails?.selectedCash,
      // ref_collection: "Cash",
    });
  }
  if (onlineAmt > 0) {
    arr.push({
      type: "upi",
      amount: onlineAmt,
      ref_id: paymentDetails?.selectedBank,
      // ref_collection: "BankDetails",
    });
  }
  return arr;
}

function mapPartyData(selectedParty) {
  console.log("selectedParty", selectedParty);
  return {
    _id: selectedParty._id,
    partyName: selectedParty.partyName,
    accountGroup_id: selectedParty.accountGroup?._id,
    accountGroupName: selectedParty.accountGroup?.accountGroup,
    subGroup_id: selectedParty.subGroup_id || null,
    subGroupName: selectedParty.subGroupName || null,
    mobileNumber: selectedParty.mobileNumber || null,
    country: selectedParty.country || null,
    state: selectedParty.state || null,
    pin: selectedParty.pin || null,
    emailID: selectedParty.emailID || null,
    gstNo: selectedParty.gstNo || null,
    party_master_id: selectedParty.party_master_id || null,
    billingAddress: selectedParty.billingAddress || null,
    shippingAddress: selectedParty.shippingAddress || null,
    accountGroup: selectedParty.accountGroup?.toString() || null,
    totalOutstanding: selectedParty.totalOutstanding || 0,
    latestBillDate: selectedParty.latestBillDate || null,
    newAddress: selectedParty.newAddress || {},
  };
}

async function createSalesVoucher(
  cmp_id,
  specificVoucherSeries,
  saleNumber,
  req,
  selectedCheckOut,
  party,
  selectedParty,
  paymentSplittingArray,
  session
) {
  let items = selectedCheckOut.flatMap((item) => item.selectedRooms);
  let amount = selectedCheckOut.reduce(
    (acc, item) => acc + Number(item.grandTotal),
    0
  );
  let convertedFrom = selectedCheckOut.map((item) => {
    return {
      voucherNumber: item.voucherNumber,
      checkInNumber: item.voucherNumber,
    };
  });

  console.log("paymentSplittingArray", selectedParty);

  return await salesModel.create(
    [
      {
        date: new Date(),
        selectedDate: new Date().toLocaleDateString(),
        voucherType: "sales",
        serialNumber: saleNumber.usedSeriesNumber,
        userLevelSerialNumber: saleNumber.usedSeriesNumber,
        salesNumber: saleNumber.voucherNumber,
        series_id: specificVoucherSeries._id.toString(),
        usedSeriesNumber: saleNumber.usedSeriesNumber,
        Primary_user_id: req.pUserId || req.owner,
        cmp_id,
        secondary_user_id: req.sUserId,
        party,
        partyAccount: selectedParty.accountGroup?.accountGroup,
        items,
        address: selectedParty.billingAddress,
        finalAmount: amount,
        subTotal: amount,
        paymentSplittingData: paymentSplittingArray,
        convertedFrom,
      },
    ],
    { session }
  );
}

async function createTallyEntry(
  cmp_id,
  req,
  selectedParty,
  selectedCheckOut,
  savedVoucher,
  paidAmount,
  pendingAmount,
  session
) {
  const selectedOne = await Party.findOne({ _id: selectedParty });

  console.log("saved", savedVoucher);
  // for (const item of selectedCheckOut) {
  return await TallyData.create(
    [
      {
        Primary_user_id: req.pUserId || req.owner,
        cmp_id,
        party_id: selectedOne?._id,
        party_name: selectedOne?.partyName,
        mobile_no: selectedOne?.mobileNumber,
        bill_date: new Date(),
        bill_no: savedVoucher?.salesNumber,
        billId: savedVoucher?._id,
        bill_amount: paidAmount,
        bill_pending_amt: 0,
        accountGroup: selectedOne?.accountGroup.toString(),
        user_id: req.sUserId,
        advanceAmount: 0,
        advanceDate: new Date(),
        classification: "Cr",
        source: "sales",
      },
    ],
    { session }
  );
  // }
}

async function saveSettlement(
  paymentDetails,
  selectedParty,
  selectedCashOrBank,
  cmp_id,
  savedVoucher,
  paidAmount,
  paymentMethod,
  req,
  session
) {
  const selectedOne = await Party.findOne({ _id: selectedParty });
  await saveSettlementDataHotel(
    selectedOne,
    cmp_id,
    paymentMethod,
    "sales",
    savedVoucher?.salesNumber,
    savedVoucher?._id,
    paidAmount,
    new Date(),
    selectedOne?.partyName,
    selectedCashOrBank,
    "Sales",
    req,
    session
  );
}

async function getSelectedParty(selected, cmp_id, session) {
  console.log(selected, cmp_id);
  const selectedParty = await Party.findOne({ cmp_id, _id: selected })
    .populate("accountGroup")
    .session(session);
  if (!selectedParty) throw new Error(`Party not found: ${partyName}`);

  return selectedParty;
}

export const updateConfigurationForHotelAndRestaurant = async (req, res) => {
  try {
    const { cmp_id } = req.params;
    const data = req.body;

    let updateData = {};

    // Handle different types of updates
    if (data.fieldType === "defaultPrint") {
      // Handle defaultPrint checkbox group updates
      if (data.field === "print1") {
        updateData = {
          $set: {
            [`configurations.0.defaultPrint.${data.field}`]: data.checked,
            [`configurations.0.defaultPrint.print2`]: false,
          },
        };
      } else {
        updateData = {
          $set: {
            [`configurations.0.defaultPrint.${data.field}`]: data.checked,
            [`configurations.0.defaultPrint.print1`]: false,
          },
        };
      }
    } else if (data.fieldType === "addRateWithTax") {
      // Handle existing addRateWithTax toggle updates
      updateData = {
        $set: {
          [`configurations.0.addRateWithTax.${data.title || data.field}`]:
            data.checked,
        },
      };
    } else if (data.title) {
      // Fallback for backward compatibility with old toggle structure
      updateData = {
        $set: {
          [`configurations.0.addRateWithTax.${data.title}`]: data.checked,
        },
      };
    } else {
      return res.status(400).json({ message: "Invalid data structure" });
    }

    const updatedDoc = await Organization.findOneAndUpdate(
      { _id: cmp_id },
      updateData,
      { new: true }
    );

    if (!updatedDoc) {
      return res.status(404).json({ message: "Organization not found" });
    }

    res.status(200).json({
      message: "Configuration updated",
      success: true,
      organization: updatedDoc,
    });
  } catch (error) {
    console.error("Error updating configuration:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// controllers/checkInController.js
// adjust path as needed

export const checkedInGuest = async (req, res) => {
  try {
    const { cmp_id } = req.params;

    const activeCheckIns = await CheckIn.find({
      cmp_id: new mongoose.Types.ObjectId(cmp_id),
    })
      .populate("customerId", "customerName mobileNumber email") // if referenced
      .populate("selectedRooms.roomId", "roomName roomType roomFloor bedType")
      .sort({ createdAt: -1 })
      .lean();

    res.status(200).json({
      success: true,
      message: "Active check-ins fetched successfully",
      guests: activeCheckIns,
      count: activeCheckIns.length,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error fetching active check-ins",
      error: error.message,
    });
  }
};

export const swapRoom = async (req, res) => {
  try {
    const { checkInId } = req.params;
    const { newRoomId, oldRoomId } = req.body;
    console.log("body", req.body);
    console.log("Swap Room Request:", { checkInId, newRoomId, oldRoomId });

    if (!newRoomId || !oldRoomId) {
      return res.status(400).json({
        success: false,
        message: "Both new room ID and old room ID are required",
      });
    }

    // 🔹 Find CheckIn document
    const checkIn = await CheckIn.findById(checkInId);
    if (!checkIn) {
      return res.status(404).json({
        success: false,
        message: "CheckIn record not found",
      });
    }

    console.log(
      "CheckIn selectedRooms:",
      JSON.stringify(checkIn.selectedRooms, null, 2)
    );
    console.log("Looking for oldRoomId:", oldRoomId, "Type:", typeof oldRoomId);

    // 🔹 Find the index of old room inside selectedRooms
    const checkInRoomIndex = checkIn.selectedRooms.findIndex((r) => {
      const currentId =
        r.roomId && r.roomId._id
          ? r.roomId._id.toString()
          : r.roomId.toString();
      return currentId === oldRoomId.toString();
    });

    console.log("CheckIn room index found:", checkInRoomIndex);

    if (checkInRoomIndex === -1) {
      return res.status(400).json({
        success: false,
        message: `Old room not found in CheckIn. Searching for: "${oldRoomId}". Available rooms: ${checkIn.selectedRooms
          .map((r, idx) => {
            const roomId =
              typeof r.roomId === "object" && r.roomId?._id
                ? r.roomId._id.toString()
                : r.roomId.toString();
            return `[${idx}] ${roomId} (${r.roomName || "No name"})`;
          })
          .join(", ")}`,
      });
    }

    // 🔹 Verify new room exists and is vacant
    const newRoom = await roomModal.findById(newRoomId);
    if (!newRoom) {
      return res.status(404).json({
        success: false,
        message: "New room not found",
      });
    }
    if (newRoom.status !== "vacant") {
      return res.status(400).json({
        success: false,
        message: "New room is not available for swap",
      });
    }

    // 🔹 Get old room details
    const oldRoom = await roomModal.findById(oldRoomId);

    // 🔹 Update room statuses
    await roomModal.findByIdAndUpdate(oldRoomId, { status: "dirty" });
    await roomModal.findByIdAndUpdate(newRoomId, { status: "occupied" });

    // 🔹 Update CheckIn document selectedRooms
    console.log(
      "Old CheckIn room data:",
      checkIn.selectedRooms[checkInRoomIndex]
    );

    // Update roomId
    checkIn.selectedRooms[checkInRoomIndex].roomId = newRoomId;

    // Update room name/number based on schema
    if (checkIn.selectedRooms[checkInRoomIndex].hasOwnProperty("roomName")) {
      checkIn.selectedRooms[checkInRoomIndex].roomName = newRoom.roomName;
    }
    if (checkIn.selectedRooms[checkInRoomIndex].hasOwnProperty("roomNumber")) {
      checkIn.selectedRooms[checkInRoomIndex].roomNumber = newRoom.roomNumber;
    }

    console.log(
      "Updated CheckIn room data:",
      checkIn.selectedRooms[checkInRoomIndex]
    );

    // 🔹 Add room swap history to CheckIn
    if (!checkIn.roomSwapHistory) {
      checkIn.roomSwapHistory = [];
    }
    checkIn.roomSwapHistory.push({
      fromRoomId: oldRoomId,
      toRoomId: newRoomId,
      swapDate: new Date(),
      reason: "Guest requested room change",
    });

    // 🔹 Mark as modified and save CheckIn
    checkIn.markModified("selectedRooms");
    const savedCheckIn = await checkIn.save();

    console.log(
      "CheckIn after save:",
      JSON.stringify(savedCheckIn.selectedRooms, null, 2)
    );

    return res.status(200).json({
      success: true,
      message: `Room successfully swapped from ${oldRoom?.roomName} to ${newRoom.roomName}`,
      swapDetails: {
        checkInId: checkIn._id,
        customerName: checkIn.customerName,
        fromRoom: {
          id: oldRoomId,
          name: oldRoom?.roomName,
        },
        toRoom: {
          id: newRoomId,
          name: newRoom.roomName,
        },
        swapDate: new Date(),
      },
    });
  } catch (error) {
    console.error("Error in swapRoom:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to swap room",
      error: error.message,
    });
  }
};
export const getRoomSwapHistory = async (req, res) => {
  try {
    const { checkInId } = req.params;

    const checkIn = await CheckIn.findById(checkInId)
      .populate("roomSwapHistory.fromRoomId", "roomName")
      .populate("roomSwapHistory.toRoomId", "roomName")
      .populate("customerId", "customerName");

    if (!checkIn) {
      return res.status(404).json({
        success: false,
        message: "Check-in record not found",
      });
    }

    res.status(200).json({
      success: true,
      swapHistory: checkIn.roomSwapHistory || [],
      customerName: checkIn.customerId?.customerName || checkIn.customerName,
    });
  } catch (error) {
    console.error("Error fetching room swap history:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch room swap history",
      error: error.message,
    });
  }
};
