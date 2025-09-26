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
import salesModel from "../models/salesModel.js";

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

import Organization from "../models/OragnizationModel.js";
import { getNewSerialNumber } from "../helpers/secondaryHelper.js";
import partyModel from "../models/partyModel.js";
import {
  updateReceiptForRooms,
  createReceiptForSales,
  deleteReceipt,
  deleteSettlements,
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
    let { arrivalDate, checkOutDate } = params;
    let endDate;
    if (checkOutDate) {
      endDate = checkOutDate;
    } else {
      endDate = new Date();
      endDate.setHours(23, 59, 59, 999);
    }

    const startDate = new Date(); // startDate is required for check date, but not for overlap logic

    // Find rooms that are currently booked for the specified checkout date (ignore arrivalDate)
    const overlappingBookings = await Booking.find({
      cmp_id: req.params.cmp_id,
      status: { $ne: "checkIn" },
      checkOutDate: { $lte: checkOutDate }, // Only consider checkOutDate
    });

    const AllCheckIns = await CheckIn.find({
      cmp_id: req.params.cmp_id,
      status: { $ne: "checkOut" },
    }).select("selectedRooms checkOutDate arrivalDate roomDetails");

    const overlappingCheckIns = AllCheckIns.filter((c) => {
      const co = new Date(c.checkOutDate);
      co.setDate(co.getDate() + 1); // add 1 day

      // normalize both to YYYY-MM-DD
      const checkoutPlusOne = co.toISOString().split("T")[0];
      console.log("checkoutPlusOne", checkoutPlusOne, checkOutDate);
      return checkoutPlusOne >= checkOutDate;
    });

    // Find rooms that are currently checked-in for the specified checkout date
    // const overlappingCheckIns = await CheckIn.find({
    //   cmp_id: req.params.cmp_id,
    //   checkOutDate: { $gt: startDate },
    //   checkOutDate: { $lt: endDate },
    //    status: { $nin: ["CheckOut"] },
    // }).select("roomDetails");

    console.log("Overlapping check-ins found:", overlappingCheckIns);

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
    console.log(
      "occupiedRoomId",
      overlappingBookings.length,
      overlappingCheckIns.length
    );
    console.log("occupiedRoomId", occupiedRoomId);
    // Filter out occupied **and dirty/blocked** rooms
    const vacantRooms = rooms.filter((room) => {
      const roomId = room._id.toString();
      const isOccupied = occupiedRoomId.has(roomId);

      // exclude rooms with status 'dirty' or 'blocked'
      const isCleanAndOpen =
        room.status !== "dirty" && room.status !== "blocked";
      //  &&
      // room.status !== "checkIn";

      return !isOccupied && isCleanAndOpen;
    });
    console.log("vacantRooms", vacantRooms.length);
    console.log("vacantRooms", rooms.length);
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
            _id: advanceObject._id,
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
    const paymentData = req.body?.paymentData;
    const bookingId = req.params.id;
    const orgId = bookingData?.cmp_id;

    if (!bookingData?.arrivalDate) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    // 🔹 Select correct model based on modal type
    let selectedModal;
    if (modal === "checkIn") {
      selectedModal = CheckIn;
    } else if (modal === "Booking") {
      selectedModal = Booking;
    } else {
      selectedModal = CheckOut;
    }
    // Get receipt series
    const voucher = await VoucherSeriesModel.findOne({
      cmp_id: orgId,
      voucherType: "receipt",
    }).session(session);

    const series_idReceipt = voucher?.series
      ?.find((s) => s.under === "hotel")
      ?._id.toString();

    // Party for settlement
    const selectedParty = await partyModel
      .findOne({ _id: bookingData.customerId })
      .session(session);

    // 🔹 Helper to build and save receipt
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

    await session.withTransaction(async () => {
      // 🔹 Clean existing receipts & settlements if updating an existing booking
      if (bookingId) {
        await deleteReceipt(bookingId, session);
        await deleteSettlements(bookingId, session);
      }

      // ✅ Advance Amount Present → Update Tally + Create Receipt + Settlement
      if (bookingData.advanceAmount && bookingData.advanceAmount > 0) {
        // Update tally
        let updatedTallyData = await TallyData.findOneAndUpdate(
          { billId: bookingId.toString() },
          {
            $set: {
              bill_amount: bookingData.advanceAmount,
              bill_pending_amt: 0,
            },
          },
          { session, new: true } // new: true returns the updated doc
        );

        const billData = [
          {
            _id: updatedTallyData?._id, // ✅ now this works
            bill_no: bookingData?.voucherNumber,
            billId: bookingId,
            bill_date: new Date(),
            bill_pending_amt: 0,
            source: "hotel",
            settledAmount: bookingData.advanceAmount,
            remainingAmount: 0,
          },
        ];

        // ✅ Single Payment
        if (paymentData.mode === "single") {
          const method = paymentData.payments[0]?.method;
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

          // Save receipt
          await buildReceipt(
            receiptVoucher,
            serialNumber,
            paymentDetails,
            bookingData.advanceAmount,
            method === "cash" ? "Cash" : "Online"
          );

          // Save settlement
          await saveSettlementDataHotel(
            selectedParty,
            orgId,
            method === "cash" ? "cash" : "bank",
            selectedModal.modelName,
            bookingData.voucherNumber,
            bookingId,
            bookingData.advanceAmount,
            new Date(),
            selectedParty?.partyName,
            selectedBankOrCashParty,
            selectedModal.modelName,
            req,
            session
          );
        }
        // ✅ Multiple Payments
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

            // Save settlement
            await saveSettlementDataHotel(
              selectedParty,
              orgId,
              payment.method === "cash" ? "cash" : "bank",
              selectedModal.modelName,
              bookingData?.voucherNumber,
              bookingId,
              bookingData?.advanceAmount,
              new Date(),
              selectedParty?.partyName,
              selectedBankOrCashParty,
              selectedModal.modelName,
              req,
              session
            );

            // Payment details
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

            // Save receipt
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
      // ❌ No Advance Amount → Delete Tally
      else {
        await TallyData.deleteOne({ billId: bookingId.toString() });
      }

      // 🔹 Update booking itself
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

    const AllCheckIns = await CheckIn.find({
      cmp_id,
      status: { $ne: "checkOut" },
    }).select("selectedRooms checkOutDate arrivalDate");

    const checkins = AllCheckIns.filter((c) => {
      const co = new Date(c.checkOutDate);
      co.setDate(co.getDate() + 1); // add 1 day

      // normalize both to YYYY-MM-DD
      const checkoutPlusOne = co.toISOString().split("T")[0];
      console.log("checkoutPlusOne", checkoutPlusOne, selectedDate);
      return checkoutPlusOne >= selectedDate;
    });

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

    console.log("AllRooms", allRooms);

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
      // arrivalDate: { $lte: selectedDate },
      // checkOutDate: { $gte: selectedDate },
    });
    console.log("checkins", checkins);

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

      allAdvanceDetails.push(
        ...bookingSideAdvanceDetails,
        ...checkInSideAdvanceDetails,
      );
    }
    const checkOutSideAdvanceDetails = !isForPreview
      ? await TallyData.find({
          bill_no: checkoutData[0]?.voucherNumber,
        })
      : [];

    allAdvanceDetails.push(...checkOutSideAdvanceDetails);

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

export const getHotelSalesDetails = async (req, res) => {
  try {
    const { cmp_id } = req.params;
    const { startDate, endDate, owner, businessType = "all" } = req.query;

    // Validate required parameters
    if (!cmp_id) {
      return res.status(400).json({
        success: false,
        message: "Company ID (cmp_id) is required",
      });
    }

    if (!owner) {
      return res.status(400).json({
        success: false,
        message: "Owner ID is required",
      });
    }

    // Validate ObjectId format for owner
    if (!mongoose.Types.ObjectId.isValid(owner)) {
      return res.status(400).json({
        success: false,
        error: "Invalid Owner ID format",
      });
    }

    // Parse dates or use today
    const today = new Date();
    const parsedStartDate = startDate ? new Date(startDate) : today;
    const parsedEndDate = endDate ? new Date(endDate) : today;

    // Set time boundaries
    parsedStartDate.setHours(0, 0, 0, 0);
    parsedEndDate.setHours(23, 59, 59, 999);

    console.log(
      `Combined ${businessType} Date Range:`,
      parsedStartDate,
      "to",
      parsedEndDate
    );

    // Build query filters
    let query = {
      cmp_id: new mongoose.Types.ObjectId(cmp_id),
      voucherType: "sales",
      date: {
        $gte: parsedStartDate,
        $lte: parsedEndDate,
      },
      $or: [
        { isCancelled: { $exists: false } },
        { isCancelled: false },
        { isCancelled: null },
      ],
    };

    // MongoDB aggregation pipeline to get all sales data with classification
    const salesData = await salesModel.aggregate([
      { $match: query },
      {
        $lookup: {
          from: "parties",
          localField: "party",
          foreignField: "_id",
          as: "partyDetails",
        },
      },
      {
        $unwind: {
          path: "$partyDetails",
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $lookup: {
          from: "organizations",
          localField: "cmp_id",
          foreignField: "_id",
          as: "organization",
        },
      },
      {
        $unwind: {
          path: "$organization",
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $addFields: {
          // Extract hour from createdAt for meal period classification
          createdHour: { $hour: { date: "$createdAt", timezone: "+05:30" } }, // IST timezone

          // Meal period classification based on created time
          mealPeriod: {
            $switch: {
              branches: [
                {
                  case: {
                    $and: [
                      {
                        $gte: [
                          { $hour: { date: "$createdAt", timezone: "+05:30" } },
                          7,
                        ],
                      },
                      {
                        $lt: [
                          { $hour: { date: "$createdAt", timezone: "+05:30" } },
                          11,
                        ],
                      },
                    ],
                  },
                  then: "Breakfast",
                },
                {
                  case: {
                    $and: [
                      {
                        $gte: [
                          { $hour: { date: "$createdAt", timezone: "+05:30" } },
                          11,
                        ],
                      },
                      {
                        $lt: [
                          { $hour: { date: "$createdAt", timezone: "+05:30" } },
                          15,
                        ],
                      },
                    ],
                  },
                  then: "Lunch",
                },
                {
                  case: {
                    $and: [
                      {
                        $gte: [
                          { $hour: { date: "$createdAt", timezone: "+05:30" } },
                          15,
                        ],
                      },
                      {
                        $lt: [
                          { $hour: { date: "$createdAt", timezone: "+05:30" } },
                          18,
                        ],
                      },
                    ],
                  },
                  then: "Snack",
                },
              ],
              default: "Dinner", // For hours 18-6 (6 PM to 7 AM)
            },
          },

          // Hotel sale classification
          isHotelSale: {
            $or: [
              { $eq: [{ $toLower: "$businessType" }, "hotel"] },
              { $eq: [{ $toLower: "$businessType" }, "accommodation"] },
              { $eq: [{ $toLower: "$partyDetails.businessType" }, "hotel"] },
              {
                $eq: [
                  { $toLower: "$partyDetails.businessType" },
                  "accommodation",
                ],
              },
              { $eq: [{ $toLower: "$department" }, "hotel"] },
              { $eq: [{ $toLower: "$category" }, "hotel"] },
              { $eq: [{ $toLower: "$department" }, "accommodation"] },
              { $eq: [{ $toLower: "$category" }, "accommodation"] },
              { $eq: [{ $toLower: "$department" }, "rooms"] },
              { $eq: [{ $toLower: "$category" }, "rooms"] },
              {
                $regexMatch: {
                  input: { $toLower: "$partyDetails.accountGroupName" },
                  regex: "hotel",
                },
              },
              {
                $regexMatch: {
                  input: { $toLower: "$partyDetails.accountGroupName" },
                  regex: "accommodation",
                },
              },
              {
                $regexMatch: {
                  input: { $toLower: "$partyDetails.partyName" },
                  regex: "hotel",
                },
              },
              {
                $regexMatch: {
                  input: { $toLower: "$partyDetails.partyName" },
                  regex: "accommodation",
                },
              },
              {
                $regexMatch: {
                  input: { $toLower: "$partyDetails.partyName" },
                  regex: "room",
                },
              },
              {
                $regexMatch: {
                  input: { $toLower: "$partyAccount" },
                  regex: "hotel",
                },
              },
              {
                $regexMatch: {
                  input: { $toLower: "$partyAccount" },
                  regex: "accommodation",
                },
              },
              {
                $regexMatch: {
                  input: { $toLower: "$partyAccount" },
                  regex: "room",
                },
              },
              { $gte: ["$finalAmount", 3000] },
            ],
          },
          // Restaurant sale classification
          isRestaurantSale: {
            $or: [
              { $eq: [{ $toLower: "$businessType" }, "restaurant"] },
              { $eq: [{ $toLower: "$businessType" }, "food"] },
              { $eq: [{ $toLower: "$businessType" }, "dining"] },
              { $eq: [{ $toLower: "$businessType" }, "cafe"] },
              { $eq: [{ $toLower: "$businessType" }, "bar"] },
              {
                $eq: [{ $toLower: "$partyDetails.businessType" }, "restaurant"],
              },
              { $eq: [{ $toLower: "$partyDetails.businessType" }, "food"] },
              { $eq: [{ $toLower: "$partyDetails.businessType" }, "dining"] },
              { $eq: [{ $toLower: "$partyDetails.businessType" }, "cafe"] },
              { $eq: [{ $toLower: "$partyDetails.businessType" }, "bar"] },
              { $eq: [{ $toLower: "$department" }, "restaurant"] },
              { $eq: [{ $toLower: "$category" }, "restaurant"] },
              { $eq: [{ $toLower: "$department" }, "food"] },
              { $eq: [{ $toLower: "$category" }, "food"] },
              { $eq: [{ $toLower: "$department" }, "dining"] },
              { $eq: [{ $toLower: "$category" }, "dining"] },
              { $eq: [{ $toLower: "$department" }, "kitchen"] },
              { $eq: [{ $toLower: "$category" }, "kitchen"] },
              { $eq: [{ $toLower: "$department" }, "cafe"] },
              { $eq: [{ $toLower: "$category" }, "cafe"] },
              { $eq: [{ $toLower: "$department" }, "bar"] },
              { $eq: [{ $toLower: "$category" }, "bar"] },
              {
                $regexMatch: {
                  input: { $toLower: "$partyDetails.accountGroupName" },
                  regex: "restaurant",
                },
              },
              {
                $regexMatch: {
                  input: { $toLower: "$partyDetails.accountGroupName" },
                  regex: "food",
                },
              },
              {
                $regexMatch: {
                  input: { $toLower: "$partyDetails.accountGroupName" },
                  regex: "dining",
                },
              },
              {
                $regexMatch: {
                  input: { $toLower: "$partyDetails.partyName" },
                  regex: "restaurant",
                },
              },
              {
                $regexMatch: {
                  input: { $toLower: "$partyDetails.partyName" },
                  regex: "food",
                },
              },
              {
                $regexMatch: {
                  input: { $toLower: "$partyDetails.partyName" },
                  regex: "dining",
                },
              },
              {
                $regexMatch: {
                  input: { $toLower: "$partyDetails.partyName" },
                  regex: "cafe",
                },
              },
              {
                $regexMatch: {
                  input: { $toLower: "$partyDetails.partyName" },
                  regex: "bar",
                },
              },
              {
                $regexMatch: {
                  input: { $toLower: "$partyAccount" },
                  regex: "restaurant",
                },
              },
              {
                $regexMatch: {
                  input: { $toLower: "$partyAccount" },
                  regex: "food",
                },
              },
              {
                $regexMatch: {
                  input: { $toLower: "$partyAccount" },
                  regex: "dining",
                },
              },
              {
                $gt: [
                  {
                    $size: {
                      $filter: {
                        input: "$items",
                        cond: {
                          $or: [
                            {
                              $regexMatch: {
                                input: { $toLower: "$$this.itemName" },
                                regex: "food",
                              },
                            },
                            {
                              $regexMatch: {
                                input: { $toLower: "$$this.itemName" },
                                regex: "meal",
                              },
                            },
                            {
                              $regexMatch: {
                                input: { $toLower: "$$this.itemName" },
                                regex: "drink",
                              },
                            },
                            {
                              $regexMatch: {
                                input: { $toLower: "$$this.itemName" },
                                regex: "beverage",
                              },
                            },
                            {
                              $regexMatch: {
                                input: { $toLower: "$$this.itemName" },
                                regex: "coffee",
                              },
                            },
                            {
                              $regexMatch: {
                                input: { $toLower: "$$this.itemName" },
                                regex: "tea",
                              },
                            },
                          ],
                        },
                      },
                    },
                  },
                  0,
                ],
              },
              {
                $and: [
                  { $lt: ["$finalAmount", 3000] },
                  { $gt: ["$finalAmount", 0] },
                ],
              },
            ],
          },
        },
      },
      {
        $addFields: {
          businessClassification: {
            $cond: {
              if: "$isHotelSale",
              then: "Hotel",
              else: {
                $cond: {
                  if: "$isRestaurantSale",
                  then: "Restaurant",
                  else: "Other",
                },
              },
            },
          },
        },
      },
      // Filter based on businessType parameter
      {
        $match:
          businessType === "all"
            ? {}
            : businessType === "hotel"
            ? { isHotelSale: true }
            : businessType === "restaurant"
            ? { isRestaurantSale: true }
            : { $or: [{ isHotelSale: true }, { isRestaurantSale: true }] },
      },
      {
        $project: {
          _id: 1,
          date: 1,
          createdAt: 1,
          createdHour: 1,
          mealPeriod: 1,
          salesNumber: 1,
          serialNumber: 1,
          partyAccount: 1,
          party: 1,
          partyDetails: {
            partyName: 1,
            businessType: 1,
            accountGroupName: 1,
          },
          items: 1,
          subTotal: 1,
          finalAmount: 1,
          paymentSplittingData: 1,
          businessType: 1,
          department: 1,
          category: 1,
          tableNumber: 1,
          waiterName: 1,
          roomNumber: 1,
          guestName: 1,
          businessClassification: 1,
          isHotelSale: 1,
          isRestaurantSale: 1,
          // Calculate totals from items
          totalCgst: {
            $sum: {
              $map: {
                input: "$items",
                as: "item",
                in: { $toDouble: { $ifNull: ["$item.totalCgstAmt", 0] } },
              },
            },
          },
          totalSgst: {
            $sum: {
              $map: {
                input: "$items",
                as: "item",
                in: { $toDouble: { $ifNull: ["$item.totalSgstAmt", 0] } },
              },
            },
          },
          totalIgst: {
            $sum: {
              $map: {
                input: "$items",
                as: "item",
                in: { $toDouble: { $ifNull: ["$item.totalIgstAmt", 0] } },
              },
            },
          },
          totalDiscount: {
            $sum: {
              $map: {
                input: "$items",
                as: "item",
                in: {
                  $sum: {
                    $map: {
                      input: { $ifNull: ["$item.GodownList", []] },
                      as: "godown",
                      in: {
                        $toDouble: { $ifNull: ["$godown.discountAmount", 0] },
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
      { $sort: { date: -1, serialNumber: -1 } },
    ]);

    console.log(`Found ${salesData.length} ${businessType} sales records`);

    // Transform data for frontend consumption
    const transformedData = salesData.map((sale) => {
      // Extract payment information
      let cashAmount = 0,
        bankAmount = 0,
        creditAmount = 0,
        upiAmount = 0,
        chequeAmount = 0;

      if (
        sale.paymentSplittingData &&
        Array.isArray(sale.paymentSplittingData)
      ) {
        sale.paymentSplittingData.forEach((payment) => {
          const amount = Number(payment.amount) || 0;
          const paymentType = payment.type?.toLowerCase() || "";

          switch (paymentType) {
            case "cash":
              cashAmount += amount;
              break;
            case "upi":
              upiAmount += amount;
              bankAmount += amount;
              break;
            case "cheque":
            case "check":
              chequeAmount += amount;
              bankAmount += amount;
              break;
            case "card":
            case "debit":
            case "credit_card":
              bankAmount += amount;
              break;
            case "credit":
              creditAmount += amount;
              break;
            case "bank":
            case "online":
            case "netbanking":
              bankAmount += amount;
              break;
            default:
              cashAmount += amount;
              break;
          }
        });
      } else {
        cashAmount = Number(sale.finalAmount) || 0;
      }

      let mode = "Cash"; // default
      if (upiAmount > 0 && upiAmount === bankAmount) {
        mode = "UPI";
      } else if (chequeAmount > 0) {
        mode = "Cheque";
      } else if (creditAmount > 0) {
        mode = "Credit";
      } else if (bankAmount > 0) {
        mode = "Bank";
      } else if (cashAmount > 0) {
        mode = "Cash";
      }

      // Get party name from either nested party object or partyDetails
      const partyName =
        sale.party?.partyName ||
        sale.partyDetails?.partyName ||
        sale.partyAccount ||
        "Cash";

      const finalAmount = Number(sale.finalAmount) || 0;
      const subTotal = Number(sale.subTotal) || finalAmount;
      const totalTax =
        (sale.totalCgst || 0) + (sale.totalSgst || 0) + (sale.totalIgst || 0);
      const roundOff =
        Math.round((finalAmount - subTotal - totalTax) * 100) / 100;

      // Categorize items based on business type
      const foodItems =
        sale.items?.filter((item) => {
          const itemName = item.itemName?.toLowerCase() || "";
          return (
            itemName.includes("food") ||
            itemName.includes("meal") ||
            itemName.includes("breakfast") ||
            itemName.includes("lunch") ||
            itemName.includes("dinner") ||
            itemName.includes("snack")
          );
        }) || [];

      const beverageItems =
        sale.items?.filter((item) => {
          const itemName = item.itemName?.toLowerCase() || "";
          return (
            itemName.includes("drink") ||
            itemName.includes("beverage") ||
            itemName.includes("coffee") ||
            itemName.includes("tea") ||
            itemName.includes("juice") ||
            itemName.includes("water")
          );
        }) || [];

      const accommodationItems =
        sale.items?.filter((item) => {
          const itemName = item.itemName?.toLowerCase() || "";
          return (
            itemName.includes("room") ||
            itemName.includes("accommodation") ||
            itemName.includes("stay") ||
            itemName.includes("night") ||
            itemName.includes("suite") ||
            itemName.includes("booking")
          );
        }) || [];

      // Determine classification reason
      let classificationReason = "Default";
      if (sale.businessType) {
        classificationReason = `Business Type: ${sale.businessType}`;
      } else if (sale.department) {
        classificationReason = `Department: ${sale.department}`;
      } else if (sale.partyDetails?.businessType) {
        classificationReason = `Party Type: ${sale.partyDetails.businessType}`;
      } else if (finalAmount >= 3000) {
        classificationReason = "Amount-based (High)";
      } else if (finalAmount < 3000 && finalAmount > 0) {
        classificationReason = "Amount-based (Low)";
      } else if (accommodationItems.length > 0) {
        classificationReason = "Accommodation Items";
      } else if (foodItems.length > 0 || beverageItems.length > 0) {
        classificationReason = "Food/Beverage Items";
      }

      return {
        billNo: sale.salesNumber || sale.serialNumber?.toString() || "",
        date: sale.date,
        createdAt: sale.createdAt,
        createdHour: sale.createdHour,
        mealPeriod: sale.mealPeriod,
        amount: subTotal,
        disc: sale.totalDiscount || 0,
        roundOff: roundOff,
        total: subTotal,
        cgst: sale.totalCgst || 0,
        sgst: sale.totalSgst || 0,
        igst: sale.totalIgst || 0,
        totalWithTax: finalAmount,
        cash: cashAmount,
        credit: creditAmount,
        upi: upiAmount,
        cheque: chequeAmount,
        bank: bankAmount,
        mode,
        creditDescription: partyName,
        partyName: partyName,
        partyAccount: sale.partyAccount || "Cash-in-Hand",
        items: sale.items || [],

        // Business-specific fields
        businessClassification: sale.businessClassification,
        classificationReason: classificationReason,

        // Restaurant-specific fields
        tableNumber: sale.tableNumber || "",
        waiterName: sale.waiterName || "",
        foodItems: foodItems,
        beverageItems: beverageItems,

        // Hotel-specific fields
        roomNumber: sale.roomNumber || "",
        guestName: sale.guestName || partyName,
        accommodationItems: accommodationItems,

        // General fields
        itemCount: sale.items?.length || 0,
        isHotelSale: sale.isHotelSale || false,
        isRestaurantSale: sale.isRestaurantSale || false,
      };
    });

    // Calculate summary totals with business type breakdown and meal period breakdown
    const summary = transformedData.reduce(
      (acc, item) => {
        // General totals
        acc.totalAmount += item.amount || 0;
        acc.totalDiscount += item.disc || 0;
        acc.totalCgst += item.cgst || 0;
        acc.totalSgst += item.sgst || 0;
        acc.totalIgst += item.igst || 0;
        acc.totalCash += item.cash || 0;
        acc.totalCredit += item.credit || 0;
        acc.totalUpi += item.upi || 0;
        acc.totalCheque += item.cheque || 0;
        acc.totalBank += item.bank || 0;
        acc.totalFinalAmount += item.totalWithTax || 0;
        acc.totalRoundOff += item.roundOff || 0;

        // Meal period breakdown
        const mealPeriod = item.mealPeriod || "Unknown";
        if (!acc.mealPeriodBreakdown[mealPeriod]) {
          acc.mealPeriodBreakdown[mealPeriod] = { amount: 0, count: 0 };
        }
        acc.mealPeriodBreakdown[mealPeriod].amount += item.totalWithTax || 0;
        acc.mealPeriodBreakdown[mealPeriod].count += 1;

        // Business type breakdown
        if (item.businessClassification === "Hotel") {
          acc.hotelSales.amount += item.totalWithTax || 0;
          acc.hotelSales.count += 1;
          acc.hotelSales.rooms += item.accommodationItems?.length || 0;
        } else if (item.businessClassification === "Restaurant") {
          acc.restaurantSales.amount += item.totalWithTax || 0;
          acc.restaurantSales.count += 1;
          acc.restaurantSales.foodItems += item.foodItems?.length || 0;
          acc.restaurantSales.beverageItems += item.beverageItems?.length || 0;
        } else {
          acc.otherSales.amount += item.totalWithTax || 0;
          acc.otherSales.count += 1;
        }

        return acc;
      },
      {
        // General totals
        totalAmount: 0,
        totalDiscount: 0,
        totalCgst: 0,
        totalSgst: 0,
        totalIgst: 0,
        totalCash: 0,
        totalCredit: 0,
        totalUpi: 0,
        totalCheque: 0,
        totalBank: 0,
        totalFinalAmount: 0,
        totalRoundOff: 0,

        // Meal period breakdown
        mealPeriodBreakdown: {},

        // Business type breakdown
        hotelSales: { amount: 0, count: 0, rooms: 0 },
        restaurantSales: {
          amount: 0,
          count: 0,
          foodItems: 0,
          beverageItems: 0,
        },
        otherSales: { amount: 0, count: 0 },
      }
    );

    // Calculate analytics
    const totalSales = summary.totalFinalAmount;
    const totalTransactions = transformedData.length;

    const analytics = {
      paymentBreakdown: {
        cashPercentage:
          totalSales > 0 ? (summary.totalCash / totalSales) * 100 : 0,
        creditPercentage:
          totalSales > 0 ? (summary.totalCredit / totalSales) * 100 : 0,
        upiPercentage:
          totalSales > 0 ? (summary.totalUpi / totalSales) * 100 : 0,
        bankPercentage:
          totalSales > 0 ? (summary.totalBank / totalSales) * 100 : 0,
      },
      businessBreakdown: {
        hotel: {
          percentage:
            totalSales > 0 ? (summary.hotelSales.amount / totalSales) * 100 : 0,
          averageTicket:
            summary.hotelSales.count > 0
              ? summary.hotelSales.amount / summary.hotelSales.count
              : 0,
          transactionCount: summary.hotelSales.count,
        },
        restaurant: {
          percentage:
            totalSales > 0
              ? (summary.restaurantSales.amount / totalSales) * 100
              : 0,
          averageTicket:
            summary.restaurantSales.count > 0
              ? summary.restaurantSales.amount / summary.restaurantSales.count
              : 0,
          transactionCount: summary.restaurantSales.count,
        },
        other: {
          percentage:
            totalSales > 0 ? (summary.otherSales.amount / totalSales) * 100 : 0,
          averageTicket:
            summary.otherSales.count > 0
              ? summary.otherSales.amount / summary.otherSales.count
              : 0,
          transactionCount: summary.otherSales.count,
        },
      },
      mealPeriodBreakdown: Object.keys(summary.mealPeriodBreakdown).reduce(
        (acc, period) => {
          acc[period] = {
            amount: summary.mealPeriodBreakdown[period].amount,
            count: summary.mealPeriodBreakdown[period].count,
            percentage:
              totalSales > 0
                ? (summary.mealPeriodBreakdown[period].amount / totalSales) *
                  100
                : 0,
            averageTicket:
              summary.mealPeriodBreakdown[period].count > 0
                ? summary.mealPeriodBreakdown[period].amount /
                  summary.mealPeriodBreakdown[period].count
                : 0,
          };
          return acc;
        },
        {}
      ),
      overallMetrics: {
        averageTicketSize:
          totalTransactions > 0 ? totalSales / totalTransactions : 0,
        totalTransactions: totalTransactions,
        averageItemsPerTransaction:
          totalTransactions > 0
            ? transformedData.reduce(
                (sum, order) => sum + (order.itemCount || 0),
                0
              ) / totalTransactions
            : 0,
      },
      serviceMetrics: {
        // Restaurant metrics
        tablesServed: [
          ...new Set(
            transformedData
              .filter((s) => s.tableNumber)
              .map((s) => s.tableNumber)
          ),
        ].length,
        waitersActive: [
          ...new Set(
            transformedData.filter((s) => s.waiterName).map((s) => s.waiterName)
          ),
        ].length,
        // Hotel metrics
        roomsOccupied: [
          ...new Set(
            transformedData.filter((s) => s.roomNumber).map((s) => s.roomNumber)
          ),
        ].length,
        guestsServed: [
          ...new Set(
            transformedData
              .filter((s) => s.guestName && s.guestName !== "Cash")
              .map((s) => s.guestName)
          ),
        ].length,
      },
    };

    console.log(
      `Combined transformedData sample:`,
      transformedData.slice(0, 2)
    );

    res.json({
      success: true,
      data: {
        sales: transformedData,
        summary: summary,
        analytics: analytics,
        companyId: cmp_id,
        owner: owner,
        dateRange: {
          startDate: parsedStartDate.toISOString().split("T")[0],
          endDate: parsedEndDate.toISOString().split("T")[0],
        },
        totalRecords: transformedData.length,
        businessType: businessType,
        businessBreakdown: {
          hotel: summary.hotelSales.count,
          restaurant: summary.restaurantSales.count,
          other: summary.otherSales.count,
          total: totalTransactions,
        },
        mealPeriodSummary: summary.mealPeriodBreakdown,
        message: `Found ${transformedData.length} ${
          businessType === "all" ? "combined" : businessType
        } sales records`,
      },
    });
  } catch (error) {
    console.error("Error fetching combined sales details:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error:
        process.env.NODE_ENV === "development"
          ? error.message
          : "Something went wrong",
    });
  }
};
