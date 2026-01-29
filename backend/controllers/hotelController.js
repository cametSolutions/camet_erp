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

import Kot from "../models/kotModal.js";

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
import receiptModel from "../models/receiptModel.js";
import paymentModel from "../models/paymentModel.js";
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
      { new: true },
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
      { new: true },
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
      { new: true },
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
    const { foodPlan, amount, isComplimentary = false } = req.body; // ✅ EXTRACT
    const { cmp_id } = req.params;

    const generatedId = new mongoose.Types.ObjectId();

    const newFoodPlan = new FoodPlan({
      _id: generatedId,
      foodPlan,
      amount,
      isComplimentary: isComplimentary, // ✅ SAVE THIS
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
    const { foodPlan, amount, foodPlanId, isComplimentary = false } = req.body;

    const { cmp_id } = req.params;

    const updatedFoodPlan = await FoodPlan.findOneAndUpdate(
      { _id: foodPlanId, cmp_id },
      {
        $set: {
          foodPlan,
          amount,
          isComplimentary: isComplimentary, // ✅ UPDATE THIS
        },
      },
      { new: true },
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
      //to check the date range for booking if already have a booking
      arrivalDate: { $lte: checkOutDate },
      checkOutDate: { $gte: arrivalDate },
    });
    // console.log("overlappingbookings", overlappingBookings)
    const AllCheckIns = await CheckIn.find({
      cmp_id: req.params.cmp_id,
      status: { $ne: "checkOut" },
      arrivalDate: { $lte: checkOutDate },
      checkOutDate: { $gte: arrivalDate },
    }).select("selectedRooms checkOutDate arrivalDate roomDetails");

    const overlappingCheckIns = AllCheckIns.filter((c) => {
      const co = new Date(c.checkOutDate);
      co.setDate(co.getDate() + 1); // add 1 day

      // normalize both to YYYY-MM-DD
      const checkoutPlusOne = co.toISOString().split("T")[0];

      return checkoutPlusOne >= checkOutDate;
    });

    // Find rooms that are currently checked-in for the specified checkout date
    // const overlappingCheckIns = await CheckIn.find({
    //   cmp_id: req.params.cmp_id,
    //   checkOutDate: { $gt: startDate },
    //   checkOutDate: { $lt: endDate },
    //    status: { $nin: ["CheckOut"] },
    // }).select("roomDetails");

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
    // console.log("allcheckins", AllCheckIns)
    // Add checked-in room IDs
    AllCheckIns.forEach((checkIn) => {
      if (checkIn.selectedRooms && Array.isArray(checkIn.selectedRooms)) {
        checkIn.selectedRooms.forEach((room) => {
          const roomId = room.roomId || room._id || room;
          if (roomId) {
            occupiedRoomId.add(roomId.toString());
          }
        });
      }
    });
    // console.log("occupiedbookingid", occupiedRoomId)
    // console.log("overlappingchekins", overlappingCheckIns)

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
      params,
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
      { new: true, session }, // Important: pass session in options
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
    // console.log("bookingdata",bookingData)
    const isFor = req.body?.modal;
    // console.log("isfor",isFor)
    // console.log("idddd", bookingData.bookingId)

    // console.log("mpdal", isFor)
    const paymentData = req.body?.paymentData;
    // console.log("paymentdata", paymentData)
    const orgId = req.params.cmp_id;
    const paymenttypeDetails = req.body?.paymenttypeDetails;

    if (!bookingData.arrivalDate) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    let customerData = null;
    if (bookingData.customerId) {
      customerData = await partyModel
        .findById(bookingData.customerId)
        .session(session);
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
          { new: true },
        ).session(session);

        if (!updateBookingData) {
          console.log("notfound");
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
          { new: true },
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
        session,
      );

      bookingData.voucherNumber = bookingNumber?.voucherNumber;
      bookingData.voucherId = series_id;

      const isHotelAgent = customerData?.isHotelAgent || false;
      // 🔹 Save Booking
      const newBooking = new selectedModal({
        cmp_id: orgId,
        Primary_user_id: req.pUserId || req.owner,
        Secondary_user_id: req.sUserId,
        paymenttypeDetails,
        isHotelAgent,
        currentDate: new Date().toISOString().split("T")[0],
        advanceTracking: {
          [new Date().toISOString().split("T")[0]]: bookingData.advanceAmount,
        },

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

          from: selectedModal.modelName, // ✅ store model name, not
          paymenttypeDetails,
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
        console.log("buiidddreceipttttttt")
        // 🔹 Build Receipt Function
        const buildReceipt = async (
          receiptVoucher,
          serialNumber,
          paymentDetails,
          amount,
          paymentMethod,
        ) => {
          let selectedParty = await partyModel
            .findOne({ _id: bookingData?.customerId })
            .populate("accountGroup")
            .session(session);
          // console.log("selectedpartyinroombookingcontroller", selectedParty)

          if (selectedParty) {
            selectedParty = selectedParty.toObject();
            if (selectedParty.accountGroup?._id) {
              selectedParty.accountGroup_id =
                selectedParty.accountGroup._id.toString();
            }
            delete selectedParty.accountGroup;
          }
          console.log("line 1083 hotelcontroller")
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
            totalBillAmount: Math.round(bookingData.advanceAmount),
            enteredAmount: Math.round(amount),
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
        if (paymentData?.mode === "single") {
          const receiptVoucher = await generateVoucherNumber(
            orgId,
            "receipt",
            series_idReceipt,
            session,
          );

          const serialNumber = await getNewSerialNumber(
            ReceiptModel,
            "serialNumber",
            session,
          );

          const singlePaymentDetails = paymentData.payments[0];

          const method = singlePaymentDetails?.method;
          const selectedBankOrCashParty = singlePaymentDetails?.accountId;

          const paymentDetails =
            method === "cash"
              ? {
                cash_ledname: singlePaymentDetails?.accountName,
                cash_name: singlePaymentDetails?.accountName,
              }
              : {
                bank_ledname: singlePaymentDetails?.accountName,
                bank_name: singlePaymentDetails?.accountName,
              };

          await buildReceipt(
            receiptVoucher,
            serialNumber,
            paymentDetails,
            bookingData.advanceAmount,
            method === "cash" ? "Cash" : "Online",
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
            session,
          );
        }
        // ✅ Multiple Payment Mode
        else {
          for (const payment of paymentData?.payments || []) {
            const receiptVoucher = await generateVoucherNumber(
              orgId,
              "receipt",
              series_idReceipt,
              session,
            );

            const serialNumber = await getNewSerialNumber(
              ReceiptModel,
              "serialNumber",
              session,
            );

            const selectedBankOrCashParty = payment?.accountId;

            await saveSettlementDataHotel(
              selectedParty,
              orgId,
              payment.method === "cash" ? "cash" : "bank",
              selectedModal.modelName,
              newBooking.voucherNumber,
              newBooking?._id,
              payment.amount,
              new Date(),
              selectedParty?.partyName,
              selectedBankOrCashParty,
              selectedModal.modelName,
              req,
              session,
            );

            const paymentDetails =
              payment.method === "cash"
                ? {
                  cash_ledname: payment?.accountName,
                  cash_name: payment?.accountName,
                }
                : {
                  bank_ledname: payment?.accountName,
                  bank_name: payment?.accountName,
                };

            await buildReceipt(
              receiptVoucher,
              serialNumber,
              paymentDetails,
              payment.amount,
              payment.method === "cash" ? "Cash" : "Online",
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
      params,
    );

    // ✅ Process bookings to add payment status and travel agent info
    const processedBookings = bookings.map((booking) => {
      const processed = booking.toObject ? booking.toObject() : { ...booking };

      // ✅ Add payment status (shows payment type names, not amounts)
      processed.paymentStatus = getPaymentStatus(processed.paymenttypeDetails);

      // ✅ Add travel agent name - check both agentId and isHotelAgent
      if (processed.agentId?.partyName) {
        // If there's a separate agentId, use that
        processed.travelAgentName = processed.agentId.partyName;
      } else if (
        processed.isHotelAgent === true ||
        processed.customerId?.isHotelAgent === true
      ) {
        // Otherwise check if customer is hotel agent
        processed.travelAgentName = processed.customerId?.partyName || "-";
      } else {
        processed.travelAgentName = "-";
      }

      processed.roomNumbers = processed.selectedRooms
        ?.map(room => room.roomName || room.roomNumber)
        .filter(Boolean)
        .join(", ") || "-";

      return processed;
    });

    return sendBookingsResponse(res, processedBookings, totalBookings, params);
  } catch (error) {
    console.error("Error in getBookings:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error, try again!",
    });
  }
};
const getPaymentStatus = (paymenttypeDetails) => {
  if (!paymenttypeDetails) return "Unpaid";

  const paymentTypes = [];

  if (parseFloat(paymenttypeDetails.cash || 0) > 0) {
    paymentTypes.push("Cash");
  }
  if (parseFloat(paymenttypeDetails.bank || 0) > 0) {
    paymentTypes.push("Bank");
  }
  if (parseFloat(paymenttypeDetails.upi || 0) > 0) {
    paymentTypes.push("UPI");
  }
  if (parseFloat(paymenttypeDetails.card || 0) > 0) {
    paymentTypes.push("Card");
  }
  if (parseFloat(paymenttypeDetails.credit || 0) > 0) {
    paymentTypes.push("Credit");
  }

  return paymentTypes.length > 0 ? paymentTypes.join(", ") : "Unpaid";
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
// In hotelController.js, replace the updateBooking function with this fixed version:

// export const updateBooking = async (req, res) => {
//   const session = await Booking.startSession();

//   try {
//     const bookingData = req.body?.data;
//     const modal = req.body?.modal;
//     const paymentData = req.body?.paymentData;
//     const bookingId = req.params.id;
//     const orgId = req.body?.orgId;
//     const isTariffRateChange = req.body?.isTariffRateChange || false;
//     const roomIdToEdit = req.body?.roomIdToEdit;

//     // console.log("=== UPDATE BOOKING STARTED ===");
//     // console.log("isTariffRateChange:", isTariffRateChange);
//     // console.log("roomIdToEdit:", roomIdToEdit);
//     // console.log("Incoming selectedRooms count:", bookingData.selectedRooms?.length);
//     // console.log("Incoming room names:", bookingData.selectedRooms?.map(r => r.roomName));

//     if (!bookingData?.arrivalDate) {
//       return res.status(400).json({ message: "Missing required fields" });
//     }

//     // Select correct model
//     let selectedModal;
//     if (modal === "checkIn") {
//       selectedModal = CheckIn;
//     } else if (modal === "Booking") {
//       selectedModal = Booking;
//     } else {
//       selectedModal = CheckOut;
//     }

//     let findOne = await selectedModal
//       .findOne({ _id: bookingId })
//       .session(session);

//     // console.log("Original DB rooms count:", findOne?.selectedRooms?.length);
//     // console.log("Original DB room names:", findOne?.selectedRooms?.map(r => r.roomName));

//     // ✅ CRITICAL SAFETY CHECK: Verify room count
//     let finalSelectedRooms = bookingData.selectedRooms;

//     if (isTariffRateChange && roomIdToEdit) {
//       const originalRoomCount = findOne?.selectedRooms?.length || 0;
//       const incomingRoomCount = finalSelectedRooms?.length || 0;

//       console.log(
//         "Room count check - Original:",
//         originalRoomCount,
//         "Incoming:",
//         incomingRoomCount
//       );

//       // ⚠️ SAFETY: If room count doesn't match, backend merge as fallback
//       if (incomingRoomCount !== originalRoomCount) {
//         console.warn(
//           "⚠️ Room count mismatch detected! Applying backend safety merge..."
//         );

//         // Find the edited room in incoming data
//         const editedRoom = finalSelectedRooms.find((room) => {
//           const roomId =
//             room.roomId?._id?.toString() ||
//             room.roomId?.toString() ||
//             room._id?.toString();
//           return roomId === roomIdToEdit.toString();
//         });

//         if (editedRoom) {
//           // console.log("Found edited room:", editedRoom.roomName);

//           // Merge: Replace only the edited room, keep all others
//           finalSelectedRooms = findOne.selectedRooms.map((originalRoom) => {
//             const originalRoomId =
//               originalRoom.roomId?._id?.toString() ||
//               originalRoom.roomId?.toString() ||
//               originalRoom._id?.toString();

//             if (originalRoomId === roomIdToEdit.toString()) {
//               console.log(
//                 "Replacing room:",
//                 originalRoom.roomName,
//                 "with updated data"
//               );
//               return {
//                 ...(originalRoom.toObject
//                   ? originalRoom.toObject()
//                   : originalRoom),
//                 ...editedRoom,
//                 _id: originalRoom._id,
//                 roomId: originalRoom.roomId,
//               };
//             }
//             return originalRoom.toObject
//               ? originalRoom.toObject()
//               : originalRoom;
//           });

//           // console.log("✅ Backend merge completed. Final room count:", finalSelectedRooms.length);
//           // console.log("Final room names:", finalSelectedRooms.map(r => r.roomName));
//         } else {
//           console.error("❌ Could not find edited room in incoming data!");
//           throw new Error("Room data integrity check failed");
//         }
//       } else {
//         console.log("✅ Room count matches. Using incoming data.");
//       }
//     }

//     // Recalculate totals with final merged rooms
//     const newRoomTotal = finalSelectedRooms.reduce(
//       (sum, room) => sum + Number(room.amountAfterTax || room.totalAmount || 0),
//       0
//     );

//     bookingData.selectedRooms = finalSelectedRooms;
//     bookingData.roomTotal = newRoomTotal;

//     // Recalculate grand total
//     const paxTotal = Number(bookingData.paxTotal || 0);
//     const foodPlanTotal = Number(bookingData.foodPlanTotal || 0);
//     const totalBeforeDiscount = newRoomTotal + paxTotal + foodPlanTotal;
//     const discountAmount = Number(bookingData.discountAmount || 0);
//     bookingData.grandTotal = totalBeforeDiscount - discountAmount;
//     bookingData.totalAmount = totalBeforeDiscount;

//     // console.log("Final calculated totals:");
//     // console.log("  Room Total:", newRoomTotal);
//     // console.log("  Grand Total:", bookingData.grandTotal);
//     // console.log("  Final room count:", finalSelectedRooms.length);

//     // Get receipt series
//     const voucher = await VoucherSeriesModel.findOne({
//       cmp_id: orgId,
//       voucherType: "receipt",
//     }).session(session);

//     const series_idReceipt = voucher?.series
//       ?.find((s) => s.under === "hotel")
//       ?._id.toString();

//     const selectedParty = await partyModel
//       .findOne({ _id: bookingData.customerId })
//       .session(session);

//     await session.withTransaction(async () => {
//       // Clean existing receipts & settlements if updating
//       if (bookingId) {
//         await deleteReceipt(bookingId, session);
//         await deleteSettlements(bookingId, session);
//       }

//       // Handle advance payment logic (existing code remains same)
//       if (bookingData.advanceAmount && bookingData.advanceAmount > 0) {
//         // ... existing advance payment logic ...
//       } else {
//         await TallyData.deleteOne({ billId: bookingId.toString() });
//       }

//       // ✅ Update booking with final merged rooms
//       const updateResult = await selectedModal.findByIdAndUpdate(
//         bookingId,
//         { $set: bookingData },
//         { new: true, session }
//       );

//       // console.log("✅ Update completed successfully");
//       // console.log("Saved rooms count:", updateResult?.selectedRooms?.length);
//       // console.log("Saved room names:", updateResult?.selectedRooms?.map(r => r.roomName));

//       // Final verification
//       if (isTariffRateChange && roomIdToEdit) {
//         const savedCount = updateResult?.selectedRooms?.length || 0;
//         const originalCount = findOne?.selectedRooms?.length || 0;

//         if (savedCount !== originalCount) {
//           throw new Error(
//             `Room count mismatch after save! Original: ${originalCount}, Saved: ${savedCount}`
//           );
//         }
//       }
//     });

//     // console.log("=== UPDATE BOOKING COMPLETED SUCCESSFULLY ===");

//     res.status(200).json({
//       success: true,
//       message: isTariffRateChange
//         ? `Room tariff rate updated successfully. All ${finalSelectedRooms?.length} rooms preserved.`
//         : "Booking updated successfully",
//       roomsCount: finalSelectedRooms?.length,
//     });
//   } catch (error) {
//     console.error("❌ Error updating booking:", {
//       error: error.message,
//       bookingId: req.params.id,
//     });
//     res.status(500).json({
//       success: false,
//       message: "Server error: " + error.message,
//       error: error.message,
//     });
//   } finally {
//     await session.endSession();
//   }
// };

export const updateBooking = async (req, res) => {
  const session = await Booking.startSession();

  try {
    const bookingData = req.body?.data;
    const modal = req.body?.modal; // "checkIn" | "Booking" | "checkOut"
    const paymentData = req.body?.paymentData;
    const bookingId = req.params.id;
    const orgId = req.body?.orgId;
    const isTariffRateChange = req.body?.isTariffRateChange || false;
    const roomIdToEdit = req.body?.roomIdToEdit;

    if (!bookingData?.arrivalDate) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    // Select correct model
    let selectedModal;
    if (modal === "checkIn") {
      selectedModal = CheckIn;
    } else if (modal === "Booking") {
      selectedModal = Booking;
    } else {
      selectedModal = CheckOut;
    }

    // Get existing booking/checkIn/checkOut
    const findOne = await selectedModal
      .findOne({ _id: bookingId })
      .session(session);

    // -----------------------------
    // ROOM MERGE + TOTAL RECALC
    // -----------------------------
    let finalSelectedRooms = bookingData.selectedRooms;

    if (isTariffRateChange && roomIdToEdit) {
      const originalRoomCount = findOne?.selectedRooms?.length || 0;
      const incomingRoomCount = finalSelectedRooms?.length || 0;

      if (incomingRoomCount !== originalRoomCount) {
        console.warn(
          "⚠️ Room count mismatch detected! Applying backend safety merge...",
        );

        const editedRoom = finalSelectedRooms.find((room) => {
          const roomId =
            room.roomId?._id?.toString() ||
            room.roomId?.toString() ||
            room._id?.toString();
          return roomId === roomIdToEdit.toString();
        });

        if (editedRoom) {
          finalSelectedRooms = findOne.selectedRooms.map((originalRoom) => {
            const originalRoomId =
              originalRoom.roomId?._id?.toString() ||
              originalRoom.roomId?.toString() ||
              originalRoom._id?.toString();

            if (originalRoomId === roomIdToEdit.toString()) {
              return {
                ...(originalRoom.toObject
                  ? originalRoom.toObject()
                  : originalRoom),
                ...editedRoom,
                _id: originalRoom._id,
                roomId: originalRoom.roomId,
              };
            }
            return originalRoom.toObject
              ? originalRoom.toObject()
              : originalRoom;
          });
        } else {
          console.error("❌ Could not find edited room in incoming data!");
          throw new Error("Room data integrity check failed");
        }
      } else {
        console.log("✅ Room count matches. Using incoming data.");
      }
    }

    // Recalculate room / grand totals with finalSelectedRooms
    const newRoomTotal = finalSelectedRooms.reduce(
      (sum, room) => sum + Number(room.amountAfterTax || room.totalAmount || 0),
      0,
    );

    bookingData.selectedRooms = finalSelectedRooms;
    bookingData.roomTotal = newRoomTotal;

    const paxTotal = Number(bookingData.paxTotal || 0);
    const foodPlanTotal = Number(bookingData.foodPlanTotal || 0);
    const totalBeforeDiscount = newRoomTotal + paxTotal + foodPlanTotal;
    const discountAmount = Number(bookingData.discountAmount || 0);
    bookingData.grandTotal = totalBeforeDiscount - discountAmount;
    bookingData.totalAmount = totalBeforeDiscount;

    // -----------------------------
    // ADVANCE / RECEIPT CONTEXT
    // -----------------------------
    const voucher = await VoucherSeriesModel.findOne({
      cmp_id: orgId,
      voucherType: "receipt",
    }).session(session);

    const series_idReceipt = voucher?.series
      ?.find((s) => s.under === "hotel")
      ?._id.toString();

    // Common party used in multiple places
    let selectedParty = await partyModel
      .findOne({ _id: bookingData.customerId })
      .populate("accountGroup")
      .session(session);

    // convert to plain object & flatten accountGroup -> accountGroup_id
    if (selectedParty) {
      selectedParty = selectedParty.toObject();
      if (selectedParty.accountGroup?._id) {
        selectedParty.accountGroup_id =
          selectedParty.accountGroup._id.toString();
      }
      delete selectedParty.accountGroup;
    }

    // Helper: build receipt (same pattern as create)
    const buildReceipt = async (
      receiptVoucher,
      serialNumber,
      paymentDetails,
      amount,
      paymentMethod,
      billData,
      orgId,
      series_idReceipt,
      selectedParty,
      bookingData,
      req,
      session,
    ) => {
      console.log("line1696 hotelcontroller")
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
        totalBillAmount: Math.round(bookingData.advanceAmount),
        enteredAmount: Math.round(amount),
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

    // -----------------------------
    // TRANSACTION
    // -----------------------------
    await session.withTransaction(async () => {
      // 1) Delete existing receipts & settlements & advance (TallyData)
      if (bookingId) {
        await deleteReceipt(bookingId, session);
        await deleteSettlements(bookingId, session);
        await TallyData.deleteMany({ billId: bookingId.toString() }).session(
          session,
        );
      }

      // 2) Handle advance logic (delete-only vs delete+recreate)
      if (bookingData.advanceAmount && bookingData.advanceAmount > 0) {
        // a) Create new TallyData advance object
        const advanceObject = new TallyData({
          Primary_user_id: req.pUserId || req.owner,
          cmp_id: orgId,
          party_id: bookingData?.customerId,
          party_name: bookingData?.customerName,
          mobile_no: bookingData?.mobileNumber,
          bill_date: new Date(),
          bill_no: findOne?.voucherNumber || bookingData.voucherNumber,
          billId: bookingId,
          bill_amount: bookingData.advanceAmount,
          bill_pending_amt: 0,
          accountGroup: bookingData.accountGroup,
          user_id: req.sUserId,
          advanceAmount: bookingData.advanceAmount,
          advanceDate: new Date(),
          classification: "Cr",
          source: "hotel",
          from: selectedModal.modelName,
        });

        await advanceObject.save({ session });

        // b) Bill data for receipts
        const billData = [
          {
            _id: advanceObject._id,
            bill_no: findOne?.voucherNumber || bookingData.voucherNumber,
            billId: bookingId,
            bill_date: new Date(),
            bill_pending_amt: 0,
            source: "hotel",
            settledAmount: bookingData.advanceAmount,
            remainingAmount: 0,
          },
        ];

        // c) Party for settlement (raw doc for saveSettlementDataHotel, not flattened)
        const rawParty = await partyModel
          .findOne({ _id: bookingData.customerId })
          .session(session);

        // d) Single vs Multiple payment creation (same pattern as create)
        if (paymentData?.mode === "single") {
          const singlePaymentDetails = paymentData.payments[0];
          const method = singlePaymentDetails?.method; // "cash" | "bank" / "online"
          const selectedBankOrCashParty = singlePaymentDetails?.accountId;

          const receiptVoucher = await generateVoucherNumber(
            orgId,
            "receipt",
            series_idReceipt,
            session,
          );

          const serialNumber = await getNewSerialNumber(
            ReceiptModel,
            "serialNumber",
            session,
          );

          const paymentDetails =
            method === "cash"
              ? {
                cash_ledname: singlePaymentDetails?.accountName,
                cash_name: singlePaymentDetails?.accountName,
              }
              : {
                bank_ledname: singlePaymentDetails?.accountName,
                bank_name: singlePaymentDetails?.accountName,
              };
          console.log("line 1807")
          // Receipt
          await buildReceipt(
            receiptVoucher,
            serialNumber,
            paymentDetails,
            bookingData.advanceAmount,
            method === "cash" ? "Cash" : "Online",
            billData,
            orgId,
            series_idReceipt,
            selectedParty,
            bookingData,
            req,
            session,
          );

          // Settlement
          await saveSettlementDataHotel(
            rawParty,
            orgId,
            method === "cash" ? "cash" : "bank",
            selectedModal.modelName,
            findOne?.voucherNumber || bookingData.voucherNumber,
            bookingId,
            bookingData.advanceAmount,
            new Date(),
            rawParty?.partyName,
            selectedBankOrCashParty,
            selectedModal.modelName,
            req,
            session,
          );
        } else {
          // multiple payments
          for (const payment of paymentData?.payments || []) {
            const receiptVoucher = await generateVoucherNumber(
              orgId,
              "receipt",
              series_idReceipt,
              session,
            );

            const serialNumber = await getNewSerialNumber(
              ReceiptModel,
              "serialNumber",
              session,
            );

            const selectedBankOrCashParty = payment?.accountId;

            await saveSettlementDataHotel(
              rawParty,
              orgId,
              payment.method === "cash" ? "cash" : "bank",
              selectedModal.modelName,
              findOne?.voucherNumber || bookingData.voucherNumber,
              bookingId,
              payment.amount,
              new Date(),
              rawParty?.partyName,
              selectedBankOrCashParty,
              selectedModal.modelName,
              req,
              session,
            );

            const paymentDetails =
              payment.method === "cash"
                ? {
                  cash_ledname: payment?.accountName,
                  cash_name: payment?.accountName,
                }
                : {
                  bank_ledname: payment?.accountName,
                  bank_name: payment?.accountName,
                };
            console.log("line 1884")
            await buildReceipt(
              receiptVoucher,
              serialNumber,
              paymentDetails,
              payment.amount,
              payment.method === "cash" ? "Cash" : "Online",
              billData,
              orgId,
              series_idReceipt,
              selectedParty,
              bookingData,
              req,
              session,
            );
          }
        }
      } else {
        // No advance now -> ensure old advance records are gone
        await TallyData.deleteMany({ billId: bookingId.toString() }).session(
          session,
        );
      }
      //advance tracking
      const today = new Date().toISOString().slice(0, 10);
      const newAdvance = bookingData.advanceAmount;

      const advanceMap = bookingData.advanceTracking || new Map();

      // Calculate total previous advance
      let totalPreviousAdvance = 0;
      for (const value of advanceMap.values()) {
        totalPreviousAdvance += value;
      }

      if (advanceMap.has(today)) {
        // Replace today's value
        advanceMap.set(today, newAdvance);
      } else {
        // Add difference
        const difference = newAdvance - totalPreviousAdvance;
        advanceMap.set(today, difference);
      }

      bookingData.advanceTracking = Array.from(advanceMap.entries());

      // 3) Finally, update booking/checkIn/checkOut document
      const updateResult = await selectedModal.findByIdAndUpdate(
        bookingId,
        { $set: bookingData },
        { new: true, session },
      );

      if (isTariffRateChange && roomIdToEdit) {
        const savedCount = updateResult?.selectedRooms?.length || 0;
        const originalCount = findOne?.selectedRooms?.length || 0;

        if (savedCount !== originalCount) {
          throw new Error(
            `Room count mismatch after save! Original: ${originalCount}, Saved: ${savedCount}`,
          );
        }
      }

      // 4) Optionally update room status if your edit flow needs it:
      //    (if required, uncomment & adapt)
      // let status =
      //   selectedModal.modelName === "CheckIn" ? "checkIn" : "booking";
      // await updateStatus(bookingData?.selectedRooms, status, session);
    });

    res.status(200).json({
      success: true,
      message: isTariffRateChange
        ? `Room tariff rate updated successfully. All ${finalSelectedRooms?.length} rooms preserved.`
        : "Booking updated successfully",
      roomsCount: finalSelectedRooms?.length,
    });
  } catch (error) {
    console.error("❌ Error updating booking:", {
      error: error.message,
      bookingId: req.params.id,
    });
    res.status(500).json({
      success: false,
      message: "Server error: " + error.message,
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
        let bookingSideAdvanceDetails = [];
        if (checkInData.bookingId) {
          bookingSideAdvanceDetails = await TallyData.find({
            billId: checkInData.bookingId,
          });
        }

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
export const getallroomsCurrentStatus = async (req, res) => {
  try {
    const { cmp_id } = req.params;
    const allroomswithstatus = await roomModal.find({ cmp_id });
    if (allroomswithstatus && allroomswithstatus.length) {
      return res.json({ success: true, data: allroomswithstatus });
    }
  } catch (error) {
    console.log("error:", error.message);
    return res.status(500).json({
      success: false,
      message: "Failed fetch rooms",
      error: error.message,
    });
  }
};
export const getallnoncheckoutCheckins = async (req, res) => {
  const { cmp_id } = req.params;
  try {
    const allnocheckoutcheckins = await CheckIn.find({
      cmp_id,
      status: { $ne: "checkOut" },
    });
    if (allnocheckoutcheckins && allnocheckoutcheckins.length) {
      return res.json({ success: true, data: allnocheckoutcheckins });
    }
  } catch (error) {
    console.log("error", error.message);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch rooms",
      error: error.message,
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

    // --- Collect booked room IDs
    const bookedRoomIds = new Set();
    for (const booking of bookings) {
      for (const selRoom of booking.selectedRooms) {
        if (selRoom.roomId) {
          bookedRoomIds.add(selRoom.roomId.toString());
        }
      }
    }

    const occupiedRoomIds = new Set();
    for (const checkin of AllCheckIns) {
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
            { new: true, session },
          );

          if (!updateBookingData) {
            throw new Error(
              "Check In not found for ID: " + bookingData.checkInId,
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

        const bookingNumber = await generateVoucherNumber(
          orgId,
          voucherType,
          series_id,
          session,
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
          { new: true, session },
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

    if (!checkoutData || checkoutData.length === 0) {
      return res.status(400).json({
        success: false,
        message: "No checkout data provided",
      });
    }

    let allAdvanceDetails = [];
    let allKotData = [];

    const paymentGreaterThanZeroQuery = {
      $or: [
        { "paymenttypeDetails.cash": { $gt: "0" } },
        { "paymenttypeDetails.bank": { $gt: "0" } },
        { "paymenttypeDetails.upi": { $gt: "0" } },
        { "paymenttypeDetails.credit": { $gt: "0" } },
        { "paymenttypeDetails.card": { $gt: "0" } },
      ],
    };

    // ✅ CORRECTED: Get roomId and serviceType from ROOT level, not kotDetails
    const docs = await salesModel.aggregate([
      {
        $match: {
          "convertedFrom.id": { $exists: true, $ne: null },
          "convertedFrom.checkInNumber": checkoutData[0].voucherNumber,
          isComplimentary: false,
        },
      },

      // Convert convertedFrom.id (string) → ObjectId
      {
        $addFields: {
          convertedFromObjId: {
            $map: {
              input: "$convertedFrom",
              as: "cf",
              in: { $toObjectId: "$$cf.id" },
            },
          },
        },
      },

      // ✅ UPDATED: Lookup from KOT collection using ROOT level fields
      {
        $lookup: {
          from: "kots",
          let: { cfIds: "$convertedFromObjId" },
          pipeline: [
            {
              $match: {
                $expr: {
                  $in: ["$_id", "$$cfIds"],
                },
              },
            },
            {
              $project: {
                _id: 0,
                roomId: "$roomId", // ✅ From root level
                tableNumber: "$tableNumber", // ✅ From root level
                serviceType: "$serviceType", // ✅ From root level
              },
            },
          ],
          as: "kotDetails",
        },
      },

      // Flatten
      {
        $unwind: {
          path: "$kotDetails",
          preserveNullAndEmptyArrays: true,
        },
      },
    ]);

    console.log("=== KOT DATA WITH SERVICE TYPE ===");
    console.log("Total KOTs found:", docs.length);
    docs.forEach((doc, idx) => {
      console.log(`KOT ${idx + 1}:`, {
        salesNumber: doc.salesNumber,
        roomId: doc.kotDetails?.roomId,
        tableNumber: doc.kotDetails?.tableNumber,
        serviceType: doc.kotDetails?.serviceType,
        amount: doc.finalAmount,
      });
    });

    allKotData.push(...docs);

    const uniqueIds = new Set();
    const advanceMap = new Map(); // prevents duplicates by _id

    if (Array.isArray(checkoutData)) {
      checkoutData.forEach((checkout) => {
        if (Array.isArray(checkout?.allCheckInIds)) {
          checkout.allCheckInIds.forEach((id) => {
            uniqueIds.add(String(id));
          });
        }
      });
    }

    console.log("UNIQUE CHECK-IN IDS:", [...uniqueIds]);
    console.log("=== UNIQUE CHECK-INS ===", uniqueIds.size);

    /* -------------------------------------------------- */
    /* WHEN UNIQUE CHECK-IN IDS EXIST */
    /* -------------------------------------------------- */
    if (uniqueIds.size !== 0) {
      for (const checkInId of uniqueIds) {
        const checkInData = await CheckIn.findById(checkInId).lean();
        if (!checkInData) continue;
        console.log("CHECK-IN DATA:", checkInData.bookingId);
        let bookingSide = [];
        if (checkInData.bookingId) {
          bookingSide = await TallyData.find({
            billId: checkInData.bookingId,
            ...paymentGreaterThanZeroQuery,
          }).lean();
        }

        const checkInSide = await TallyData.find({
          billId: checkInId,
          ...paymentGreaterThanZeroQuery,
        }).lean();

        [...bookingSide, ...checkInSide].forEach((item) => {
          advanceMap.set(String(item._id), item);
        });
      }
    } else {
      /* -------------------------------------------------- */
      /* WHEN NO UNIQUE CHECK-IN IDS (CHECKOUT CASE) */
      /* -------------------------------------------------- */
      for (const checkout of checkoutData) {
        let bookingSide = [];
        if (checkout.bookingId?._id) {
          bookingSide = await TallyData.find({
            billId: checkout.bookingId?._id,
            ...paymentGreaterThanZeroQuery,
          }).lean();
        }

        const checkInSide = await TallyData.find({
          billId: checkout.checkInId._id,
          ...paymentGreaterThanZeroQuery,
        }).lean();

        const salesData = await salesModel
          .findOne({
            salesNumber: checkout.voucherNumber,
          })
          .lean();

        if (!salesData) continue;

        const advanceData = await TallyData.find({
          billId: salesData._id,
          ...paymentGreaterThanZeroQuery,
        }).lean();

        if (advanceData.length) {
          advanceData[0].isCheckOut = true;

          const sum =
            (bookingSide[0]?.bill_amount || 0) +
            (checkInSide[0]?.bill_amount || 0);

          advanceData[0].bill_amount = Math.abs(
            advanceData[0].bill_amount - sum,
          );
        }

        [...bookingSide, ...checkInSide, ...advanceData].forEach((item) => {
          advanceMap.set(String(item._id), item);
        });
      }
    }

    /* -------------------------------------------------- */
    /* FINAL RESULT */
    /* -------------------------------------------------- */
    allAdvanceDetails = [...advanceMap.values()];
    console.log("FINAL ADVANCE COUNT:", allAdvanceDetails.length);

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
    (series) => series.under === "hotel",
  );
  if (!specificVoucherSeries)
    throw new Error("No 'hotel' voucher series found");

  return specificVoucherSeries;
}

export const convertCheckOutToSale = async (req, res) => {
  // console.log("convertchecktouttosale")
  const session = await mongoose.startSession();
  try {
    let isAnyPartial = false;

    await session.withTransaction(async () => {
      const { cmp_id } = req.params;
      console.log("cmpidddd", cmp_id)

      const {
        paymentDetails,
        selectedCheckOut = [],
        restaurantBaseSaleData,
        isPostToRoom = false,
        roomAssignments = null,
        checkoutMode,
        checkinIds,
      } = req.body;

      let tracker = paymentDetails?.paymenttypeDetails;

      if (!paymentDetails) throw new Error("Missing payment details");

      const paymentMode = paymentDetails?.paymentMode;
      const splitDetails = paymentDetails?.splitDetails || [];

      const specificVoucherSeries = await hotelVoucherSeries(cmp_id, session);

      // Process each checkout separately
      let results;
      for (const item of selectedCheckOut) {
console.log("itemdddddd",item)
        const bookingVoucherNumber =
          item?.bookingId?.voucherNumber || item?.bookingId;
        const checkingVoucherNumber = item?.voucherNumber;
        const matchedBooking = await Booking.find({
          voucherNumber: bookingVoucherNumber,
        });
        const matchedCheckin = await CheckIn.find({
          voucherNumber: checkingVoucherNumber,
        });
        //helper:merge advance in booking and checking to checkoutbalance
        const mergePayment = (target, src) => {
          if (!src) return;
          const keys = ["cash", "upi", "bank", "card", "credit"];
          keys.forEach((key) => {
            if (src[key] !== undefined && src[key] !== null) {
              target[key] += Number(src[key]);
            }
          });
        };

        // 1) start from existing paymentDetails.paymenttypeDetails
        const merged = { ...paymentDetails.paymenttypeDetails };

        // 2) if booking has paymenttypeDetails, merge it
        if (matchedBooking[0]?.paymenttypeDetails) {
          mergePayment(merged, matchedBooking[0].paymenttypeDetails);
        }

        // 3) if checkin has paymenttypeDetails, merge it (overrides booking if conflict)
        if (matchedCheckin[0]?.paymenttypeDetails) {
          mergePayment(merged, matchedCheckin[0].paymenttypeDetails);
        }

        // 4) assign back to paymentDetails
        paymentDetails.paymenttypeDetails = merged;
        results = [];
        const selectedPartyId = item?.customerId?._id || item?.customerId;
        if (!selectedPartyId)
          throw new Error("Missing customerId._id in checkout item");

        const itemTotal = (item.selectedRooms || []).reduce(
          (acc, room) => acc + Number(room.amountAfterTax || 0),
          0,
        );

        const partyData = await getSelectedParty(
          selectedPartyId,
          cmp_id,
          session,
        );
        const party = mapPartyData(partyData);

        // ============ DETERMINE PAYMENT FOR THIS SALE ============
        let cashAmt = 0;
        let onlineAmt = 0;
        let paymentMethod = "";
        let paidAmount = 0;
        // let pendingAmount = 0;
        let applicableSplits = [];

        if (paymentMode === "single") {
          cashAmt = Number(paymentDetails?.cashAmount || 0);
          onlineAmt = Number(paymentDetails?.onlineAmount || 0);
          paymentMethod =
            cashAmt > 0 ? "cash" : onlineAmt > 0 ? "bank" : "unknown";
          paidAmount = cashAmt + onlineAmt;
        } else if (paymentMode === "split") {
          applicableSplits = splitDetails.filter(
            (split) => split.customer === selectedPartyId.toString(),
          );

          paidAmount = applicableSplits.reduce(
            (sum, split) => sum + Number(split.amount || 0),
            0,
          );

          cashAmt = applicableSplits
            .filter((s) => s.sourceType === "cash")
            .reduce((sum, s) => sum + Number(s.amount || 0), 0);

          onlineAmt = applicableSplits
            .filter((s) => s.sourceType === "bank")
            .reduce((sum, s) => sum + Number(s.amount || 0), 0);

          paymentMethod =
            cashAmt > 0 && onlineAmt > 0
              ? "mixed"
              : cashAmt > 0
                ? "cash"
                : "bank";
        } else if (isPostToRoom || paymentMode === "credit") {
          paymentMethod = "credit";
          paidAmount = 0;
          // pendingAmount = itemTotal;
        }

        const pendingAmount =
          itemTotal - (paidAmount + Number(item?.Totaladvance));

        const paymentSplittingArray = createPaymentSplittingArray(
          paymentDetails,
          cashAmt,
          onlineAmt,
          applicableSplits,
        );

        const saleNumber = await generateVoucherNumber(
          cmp_id,
          "sales",
          specificVoucherSeries._id.toString(),
          session,
        );

        const checkInId = item?._id;
        // console.log("checkinidddd", checkInId)
        const roomsBeingCheckedOut = item?.selectedRooms || [];
        const originalCheckIn =
          await CheckIn.findById(checkInId).session(session);
        if (!originalCheckIn)
          throw new Error(`Check-in ${checkInId} not found`);

        const isThisPartial =
          item.isPartialCheckout ||
          roomsBeingCheckedOut.length <
          (originalCheckIn.selectedRooms?.length || 0);

        if (isThisPartial) isAnyPartial = true;

        const roomIdsBeingCheckedOut = roomsBeingCheckedOut.map(
          (r) => r._id?.toString() || r.toString(),
        );
        const remainingRooms = (originalCheckIn.selectedRooms || []).filter(
          (room) => !roomIdsBeingCheckedOut.includes(room._id.toString()),
        );

        const roomTotal = itemTotal;

        // Create CheckOut FIRST
        const checkOutDoc = await CheckOut.create(
          [
            {
              ...item,
              _id: undefined,
              cmp_id,
              Primary_user_id: req.owner || req.pUserId,
              voucherNumber: saleNumber?.voucherNumber,
              checkInId,
              bookingId: item?.bookingId?._id || item?.bookingId,
              customerId: selectedPartyId,
              customerName: item?.customerId?.partyName || party?.customerName,
              selectedRooms: roomsBeingCheckedOut,
              totalAmount: roomTotal,
              roomTotal,
              grandTotal: roomTotal,
              balanceToPay: pendingAmount <= 0 ? 0 : pendingAmount,
              isPartialCheckout: isThisPartial,
              originalCheckInId: checkInId,
              paymenttypeDetails: {
                cash: tracker.cash,
                bank: tracker.bank,
                upi: tracker.upi,
                card: tracker.card,
                credit: tracker.credit,
              },

              checkoutType:
                checkoutMode === "single"
                  ? "singleCheckout"
                  : "individualCheckout",
            },
          ],
          { session },
        );

        const amount = [item].reduce((total, el) => {
          const itemTotal = el.selectedRooms.reduce(
            (acc, room) => acc + room.amountAfterTax,
            0,
          );
          return total + itemTotal;
        }, 0);

        // Create Sales Voucher with both checkInId and checkOutId
        const savedVoucherData = await createSalesVoucher(
          cmp_id,
          specificVoucherSeries,
          saleNumber,
          req,
          [item],
          party,
          partyData,
          paymentSplittingArray,
          session,
          checkInId,
          checkOutDoc[0]._id,
          amount,
        );
        if (savedVoucherData) {
          console.log(savedVoucherData.length)
        }
        // console.log("savedsale", savedVoucherData)

        // Create Tally Entry
        const tallyRows = await createTallyEntry(
          cmp_id,
          req,
          selectedPartyId,
          [item],
          savedVoucherData[0],
          amount,
          session,
          paymentMode,
        );

        // ============ HANDLE SETTLEMENTS (NOT RECEIPTS YET) ============

        if (paymentMode === "split") {
          // Create settlements for matching splits only
          for (const split of applicableSplits) {
            const splitAmount = Number(split.amount || 0);
            const splitSourceType = split.sourceType;
            const splitSource = await Party.findOne({
              _id: split.source,
            }).session(session);

            await saveSettlement(
              paymentDetails,
              selectedPartyId,
              splitSource,
              cmp_id,
              savedVoucherData[0],
              splitAmount,
              splitSourceType,
              req,
              session,
            );
          }
        }
        // NOTE: For single payment mode, settlement will be created ONCE after the loop

        // Link room receipts
        await updateReceiptForRooms(
          item?.voucherNumber,
          item?.bookingId?.voucherNumber || item?.bookingId,
          saleNumber?.voucherNumber,
          savedVoucherData[0]?._id,
          session,
        );

        // Update CheckIn and room statuses
        if (isThisPartial && remainingRooms.length > 0) {
          await CheckIn.updateOne(
            { _id: checkInId },
            {
              $set: {
                selectedRooms: remainingRooms,
                status: "checkIn",
                isPartiallyCheckedOut: true,
              },
              $push: {
                partialCheckoutHistory: {
                  date: new Date(),
                  roomsCheckedOut: roomsBeingCheckedOut.map((r) => ({
                    roomId: r._id,
                    roomName: r.roomName,
                  })),
                  saleVoucherNumber: saleNumber?.voucherNumber,
                },
              },
            },
            { session },
          );

          await updateStatus(roomsBeingCheckedOut, "dirty", session);
        } else {
          if (checkoutMode === "single") {
            console.log("its a multiple checkin single checkoutmode");
            await CheckIn.updateMany(
              { _id: { $in: checkinIds } },
              { $set: { status: "checkOut", checkOutDate: new Date() } },
              { session },
            );
          } else {
            await CheckIn.updateOne(
              { _id: checkInId },
              { status: "checkOut", checkOutDate: new Date() },
              { session },
            );
          }

          await updateStatus(roomsBeingCheckedOut, "dirty", session);
        }

        results.push({
          saleNumber,
          salesRecord: savedVoucherData[0],
          tallyId: tallyRows?.[0]?._id,
          checkInId,
          checkOutId: checkOutDoc[0]._id,
          isPartial: isThisPartial,
          paymentMode,
          itemTotal,
          paidAmount,
          pendingAmount,
          applicableSplitsCount: applicableSplits.length,
        });
      }
      // ============ CREATE SINGLE SETTLEMENT FOR SINGLE PAYMENT MODE ============
      if (paymentMode === "single" && !isPostToRoom) {
        const cashAmt = Number(paymentDetails?.cashAmount || 0);
        const onlineAmt = Number(paymentDetails?.onlineAmount || 0);
        const totalPaidAmount = cashAmt + onlineAmt;

        if (totalPaidAmount > 0) {
          // Determine primary source and type
          let primarySource;
          let sourceType;

          if (cashAmt > 0 && onlineAmt > 0) {
            // Both cash and bank - use cash as primary, mark as "mixed"
            primarySource = await Party.findOne({
              _id: paymentDetails?.selectedCash,
            }).session(session);
            sourceType = "mixed";
          } else if (cashAmt > 0) {
            // Cash only
            primarySource = await Party.findOne({
              _id: paymentDetails?.selectedCash,
            }).session(session);
            sourceType = "cash";
          } else {
            console.log("elseconditions");
            // Bank only
            primarySource = await Party.findOne({
              _id: paymentDetails?.selectedBank,
            }).session(session);
            sourceType = "bank";
          }

          // Create ONE settlement for all sales
          await saveSettlement(
            paymentDetails,
            selectedCheckOut[0]?.customerId?._id ||
            selectedCheckOut[0]?.customerId,
            primarySource,
            cmp_id,
            results[0]?.salesRecord, // Use first sale as reference
            totalPaidAmount, // Total amount (cash + bank)
            sourceType,
            req,
            session,
          );
        }
      }

      // ============ CREATE RECEIPTS AFTER ALL SALES ARE CREATED ============

      // For SPLIT mode: Create receipt(s)
      if (paymentMode === "split") {
        const totalPaidAmount = splitDetails.reduce(
          (sum, split) => sum + Number(split.amount || 0),
          0,
        );
        console.log("cmpidbefore createreceptforsale", cmp_id);
        if (totalPaidAmount > 0) {
          await createReceiptForSales(
            cmp_id,
            paymentDetails,
            "mixed", // Since split can have both cash and bank
            selectedCheckOut[0]?.customerId?.partyName || "Customer",
            totalPaidAmount,
            selectedCheckOut[0]?.customerId?._id ||
            selectedCheckOut[0]?.customerId,
            results[0]?.salesRecord,
            results[0]?.tallyId,
            req,
            restaurantBaseSaleData,
            session,
          );
        }
      }

      // For SINGLE mode: Create ONE receipt for all sales
      else if (paymentMode === "single") {
        const totalPaidAmount =
          Number(paymentDetails?.cashAmount || 0) +
          Number(paymentDetails?.onlineAmount || 0);

        if (!isPostToRoom && totalPaidAmount > 0) {
          const cashAmt = Number(paymentDetails?.cashAmount || 0);
          const onlineAmt = Number(paymentDetails?.onlineAmount || 0);
          const paymentMethod =
            cashAmt > 0 && onlineAmt > 0
              ? "mixed"
              : cashAmt > 0
                ? "cash"
                : "bank";

          const agId = results[0]?.salesRecord?.party?.accountGroup_id;

          // console.log(JSON.stringify(results, null, 2));

          // console.log("dddddddddddddddddddddddddddd", results[0]?.salesRecord?.party?.accountGroup_id)
          console.log("ssssssssssssssssssssssssssssssssssssssssssssss")
          await createReceiptForSales(
            cmp_id,
            paymentDetails,
            paymentMethod,
            selectedCheckOut[0]?.customerId?.partyName || "Customer",
            totalPaidAmount,
            selectedCheckOut[0]?.customerId?._id ||
            selectedCheckOut[0]?.customerId,
            results[0]?.salesRecord,
            agId,
            req,
            restaurantBaseSaleData,
            session,
          );
          console.log("endupppppppppp")
        }
      }

      req._multiCheckoutResults = results;
      req._isAnyPartial = isAnyPartial;
    });

    res.status(200).json({
      success: true,
      message: req._isAnyPartial
        ? "Partial checkout(s) completed. Remaining rooms stay checked-in."
        : "Checkout(s) converted to Sales successfully",
      data: {
        results: req._multiCheckoutResults,
      },
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

function createPaymentSplittingArray(
  paymentDetails,
  cashAmt,
  onlineAmt,
  applicableSplits = [],
) {
  const arr = [];
  const paymentMode = paymentDetails?.paymentMode;

  if (paymentMode === "split" && applicableSplits.length > 0) {
    // For split payment: use applicableSplits (customer-matched splits)
    for (const split of applicableSplits) {
      arr.push({
        type: split.sourceType === "cash" ? "cash" : "upi",
        amount: Number(split.amount || 0),
        ref_id: split.source,
      });
    }
  } else {
    // For single payment: use selectedCash/selectedBank
    if (cashAmt > 0) {
      arr.push({
        type: "cash",
        amount: cashAmt,
        ref_id: paymentDetails?.selectedCash,
      });
    }
    if (onlineAmt > 0) {
      arr.push({
        type: "upi",
        amount: onlineAmt,
        ref_id: paymentDetails?.selectedBank,
      });
    }
  }

  return arr;
}

function mapPartyData(selectedParty) {
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
  session,
  checkInId = null,
  checkOutId = null,
  amount = 0,
) {
  const AlreadyExistingItems = selectedCheckOut.flatMap(
    (item) => item.selectedRooms,
  );

  let items = [];

  AlreadyExistingItems.forEach((room) => {
    const newObject = {
      product_name: room.roomName,
      product_code: room.roomName,

      cmp_id: room.cmp_id,
      Primary_user_id: room.primary_user_id,

      brand: room.roomType?._id || null,
      category: null,
      sub_category: null,

      unit: "Nos",

      // 🔥 REQUIRED FOR SUMMARY
      item_mrp: Number(room.priceLevelRate) || 0,
      rate: Number(room.priceLevelRate) || 0,

      // 🔥 AMOUNTS
      taxableAmount: Number(room.amountWithOutTax) || 0,
      total: Number(room.amountWithOutTax) || 0,
      netAmount: Number(room.amountAfterTax) || 0,

      totalCgstAmt: Number(room.totalCgstAmt) || 0,
      totalSgstAmt: Number(room.totalSgstAmt) || 0,
      totalIgstAmt: Number(room.totalIgstAmt) || 0,

      // 🔥 SERVICE FLAG
      GodownList: [],
      batchEnabled: false,
      gdnEnabled: false,

      quantity: room.stayDays,

      hsn_code: room?.hsnDetails?.hsn,
      cgst: Number(room?.taxPercentage) / 2 || 0,
      sgst: Number(room?.taxPercentage) / 2 || 0,
      igst: room?.taxPercentage || 0,

      Priceleveles: room?.priceLevel || [],
      product_master_id: null,
    };

    items.push(newObject);
  });

  // const amount = selectedCheckOut.reduce((total, item) => {
  //   const itemTotal = item.selectedRooms.reduce(
  //     (acc, room) => acc + room.amountAfterTax,
  //     0
  //   );
  //   return total + itemTotal;
  // }, 0);

  let convertedFrom = selectedCheckOut.map((item) => {
    return {
      voucherNumber: item.voucherNumber,
      checkInNumber: item.voucherNumber,
    };
  });

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
        checkInId: checkInId,
        checkOutId: checkOutId,
      },
    ],
    { session },
  );
}

async function createTallyEntry(
  cmp_id,
  req,
  selectedParty,
  selectedCheckOut,
  savedVoucher,
  amount,
  session,
  paymentMode,
) {
  const selectedOne = await Party.findOne({ _id: selectedParty }).session(
    session,
  );
  // console.log("selectedone", selectedOne)

  // console.log("selectedOne",    {
  //       Primary_user_id: req.pUserId || req.owner,
  //       cmp_id,
  //       party_id: selectedOne?._id,
  //       party_name: selectedOne?.partyName,
  //       mobile_no: selectedOne?.mobileNumber,
  //       bill_date: new Date(),
  //       bill_no: savedVoucher?.salesNumber,
  //       billId: savedVoucher?._id,
  //       bill_amount: amount, // CHANGED: Total sale amount
  //       bill_pending_amt: amount, // CHANGED: Actual outstanding amount
  //       accountGroup: selectedOne?.accountGroup.toString(),
  //       user_id: req.sUserId,
  //       advanceAmount: 0,
  //       advanceDate: new Date(),
  //       classification: "Dr",
  //       source: "sales",
  //     },);
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
        bill_amount: amount, // CHANGED: Total sale amount
        bill_pending_amt: paymentMode === "split" ? 0 : amount, // CHANGED: Actual outstanding amount
        accountGroup: selectedOne?.accountGroup.toString(),
        user_id: req.sUserId,
        advanceAmount: 0,
        advanceDate: new Date(),
        classification: "Dr",
        source: "sales",
      },
    ],
    { session },
  );
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
  session,
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
    session,
  );
}

async function getSelectedParty(selected, cmp_id, session) {
  const selectedParty = await Party.findOne({ cmp_id, _id: selected })
    .populate("accountGroup")
    .session(session);
  if (!selectedParty) throw new Error(`Party not found`);

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
      { new: true },
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

    // 🔹 Find the index of old room inside selectedRooms
    const checkInRoomIndex = checkIn.selectedRooms.findIndex((r) => {
      const currentId =
        r.roomId && r.roomId._id
          ? r.roomId._id.toString()
          : r.roomId.toString();
      return currentId === oldRoomId.toString();
    });

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

    // Update roomId
    checkIn.selectedRooms[checkInRoomIndex].roomId = newRoomId;

    // Update room name/number based on schema
    if (checkIn.selectedRooms[checkInRoomIndex].hasOwnProperty("roomName")) {
      checkIn.selectedRooms[checkInRoomIndex].roomName = newRoom.roomName;
    }
    if (checkIn.selectedRooms[checkInRoomIndex].hasOwnProperty("roomNumber")) {
      checkIn.selectedRooms[checkInRoomIndex].roomNumber = newRoom.roomNumber;
    }

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
    const { cmp_id, type } = req.params;
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
      { $unwind: { path: "$partyDetails", preserveNullAndEmptyArrays: true } },

      // Join with Organization
      {
        $lookup: {
          from: "organizations",
          localField: "cmp_id",
          foreignField: "_id",
          as: "organization",
        },
      },
      { $unwind: { path: "$organization", preserveNullAndEmptyArrays: true } },

      // Join with KOT
      {
        $lookup: {
          from: "kots",
          let: {
            salesVoucherNumber: {
              $arrayElemAt: ["$convertedFrom.voucherNumber", 0],
            },
          },
          pipeline: [
            {
              $match: {
                $expr: {
                  $and: [
                    { $ne: ["$$salesVoucherNumber", null] },
                    { $eq: ["$voucherNumber", "$$salesVoucherNumber"] },
                  ],
                },
              },
            },
            { $project: { type: 1, voucherNumber: 1, tableNumber: 1 } },
          ],
          as: "kotDetails",
        },
      },

      // Derived fields
      {
        $addFields: {
          createdHour: { $hour: { date: "$createdAt", timezone: "+05:30" } },
          kotType: {
            $cond: [
              {
                $and: [
                  {
                    $ne: [
                      { $arrayElemAt: ["$convertedFrom.checkInNumber", 0] },
                      null,
                    ],
                  },
                  {
                    $ne: [
                      { $arrayElemAt: ["$convertedFrom.checkInNumber", 0] },
                      "",
                    ],
                  },
                ],
              },
              "Room Service",
              {
                $cond: [
                  {
                    $and: [
                      {
                        $ne: [
                          { $arrayElemAt: ["$convertedFrom.tableNumber", 0] },
                          null,
                        ],
                      },
                      {
                        $ne: [
                          { $arrayElemAt: ["$convertedFrom.tableNumber", 0] },
                          "",
                        ],
                      },
                    ],
                  },
                  "Dine In",
                  {
                    $cond: [
                      {
                        $and: [{ $eq: ["$isTakeaway", true] }],
                      },
                      "Takeaway",
                      {
                        $cond: [
                          {
                            $and: [{ $eq: ["$isDelivery", true] }],
                          },
                          "Home Delivery",
                          "Unknown",
                        ],
                      },
                    ],
                  },
                ],
              },
            ],
          },

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
                          18,
                        ],
                      },
                    ],
                  },
                  then: "Lunch", // Changed from 15 to 18 to include snack time
                },
              ],
              default: "Dinner",
            },
          },

          // Classification (Hotel / Restaurant / Other)
          businessClassification: {
            $let: {
              vars: {
                hasCheckIn: {
                  $and: [
                    { $gt: [{ $size: "$convertedFrom" }, 0] },
                    {
                      $ne: [
                        {
                          $ifNull: [
                            {
                              $arrayElemAt: ["$convertedFrom.checkInNumber", 0],
                            },
                            "",
                          ],
                        },
                        "",
                      ],
                    },
                  ],
                },
                hasTable: {
                  $and: [
                    { $gt: [{ $size: "$convertedFrom" }, 0] },
                    {
                      $ne: [
                        {
                          $ifNull: [
                            { $arrayElemAt: ["$convertedFrom.tableNumber", 0] },
                            "",
                          ],
                        },
                        "",
                      ],
                    },
                  ],
                },
                kotType: {
                  $cond: [
                    { $gt: [{ $size: "$kotDetails" }, 0] },
                    { $arrayElemAt: ["$kotDetails.type", 0] },
                    null,
                  ],
                },
              },
              in: {
                $switch: {
                  branches: [
                    // ✅ Rule 1: Has checkInNumber + KOT type is "Room Service" → Restaurant
                    {
                      case: {
                        $and: [
                          "$$hasCheckIn",
                          { $eq: ["$$kotType", "Room Service"] },
                        ],
                      },
                      then: "Restaurant",
                    },
                    // ✅ Rule 2: Has checkInNumber + KOT type is NOT "Room Service" → Hotel
                    {
                      case: {
                        $and: [
                          "$$hasCheckIn",
                          { $ne: ["$$kotType", "Room Service"] },
                          { $ne: ["$$kotType", null] },
                        ],
                      },
                      then: "Hotel",
                    },
                    // ✅ Rule 3: Has checkInNumber but no KOT (direct checkout) → Hotel
                    {
                      case: {
                        $and: ["$$hasCheckIn", { $eq: ["$$kotType", null] }],
                      },
                      then: "Hotel",
                    },
                    // ✅ Rule 4: Has tableNumber → Restaurant
                    {
                      case: "$$hasTable",
                      then: "Restaurant",
                    },
                    // ✅ Rule 5: Takeaway → Restaurant
                    {
                      case: { $eq: ["$isTakeaway", true] },
                      then: "Restaurant",
                    },
                    // ✅ Rule 6: Delivery → Restaurant
                    {
                      case: { $eq: ["$isDelivery", true] },
                      then: "Restaurant",
                    },
                  ],
                  default: "Restaurant",
                },
              },
            },
          },
        },
      },

      // // Optional filter by classification
      {
        $match:
          businessType === "all"
            ? {}
            : businessType === "hotel"
              ? { businessClassification: "Hotel" }
              : businessType === "restaurant"
                ? { businessClassification: "Restaurant" }
                : { businessClassification: { $in: ["Hotel", "Restaurant"] } },
      },

      // Final projection
      {
        $project: {
          date: 1,
          createdAt: 1,
          createdHour: 1,
          mealPeriod: 1,
          salesNumber: 1,
          serialNumber: 1,
          kotType: 1,
          partyAccount: 1,
          "partyDetails.partyName": 1,
          "partyDetails.businessType": 1,
          "partyDetails.accountGroupName": 1,
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
          party: 1,

          totalCgst: {
            $sum: {
              $map: {
                input: "$items",
                as: "item",
                in: { $toDouble: { $ifNull: ["$$item.totalCgstAmt", 0] } },
              },
            },
          },
          totalSgst: {
            $sum: {
              $map: {
                input: "$items",
                as: "item",
                in: { $toDouble: { $ifNull: ["$$item.totalSgstAmt", 0] } },
              },
            },
          },
          totalIgst: {
            $sum: {
              $map: {
                input: "$items",
                as: "item",
                in: { $toDouble: { $ifNull: ["$$item.totalIgstAmt", 0] } },
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
                      input: { $ifNull: ["$$item.GodownList", []] },
                      as: "godown",
                      in: {
                        $toDouble: { $ifNull: ["$$godown.discountAmount", 0] },
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

    // console.log("salesData", salesData);
    // Transform data for frontend consumption
    const transformedData = salesData.map((sale) => {
      // Extract payment information
      let cashAmount = 0,
        bankAmount = 0,
        creditAmount = 0,
        upiAmount = 0,
        chequeAmount = 0;

      const partyName =
        sale.party?.partyName ||
        sale.partyDetails?.partyName ||
        sale.partyAccount ||
        "Cash";

      const isCreditSale =
        sale.partyAccount === "Sundry Debtors" ||
        sale.partyDetails?.accountGroupName === "Sundry Debtors" ||
        sale.party?.accountGroupName === "Sundry Debtors" ||
        (partyName !== "Cash" &&
          partyName !== "Cash-in-Hand" &&
          partyName !== "CASH" &&
          sale.partyAccount !== "Cash-in-Hand" &&
          sale.partyAccount !== "CASH" &&
          sale.partyAccount !== "Bank Accounts" &&
          sale.partyAccount !== "Gpay" &&
          sale.partyAccount !== "Bank");

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
              if (isCreditSale) {
                creditAmount += amount;
              } else {
                cashAmount += amount;
              }
              break;
          }
        });
      } else {
        // No payment splitting data - determine based on party account and name
        const finalAmount = Number(sale.finalAmount) || 0;

        if (isCreditSale) {
          // It's a credit sale
          creditAmount = finalAmount;
        } else if (
          sale.partyAccount === "Bank Accounts" ||
          sale.partyAccount === "Gpay" ||
          sale.partyAccount === "Bank"
        ) {
          // Bank/UPI payment
          upiAmount = finalAmount;
          bankAmount = finalAmount;
        } else {
          // Default to cash
          cashAmount = finalAmount;
        }
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

      const finalAmount = Number(sale.finalAmount) || 0;
      const subTotal = Number(sale.subTotal) || finalAmount;
      const totalTax = (sale.totalCgst || 0) + (sale.totalSgst || 0);
      const nearestInt = Math.round(finalAmount);
      const roundOff = Number((nearestInt - finalAmount).toFixed(2));

      return {
        billNo: sale.salesNumber || sale.serialNumber?.toString() || "",
        date: sale.date,
        createdAt: sale.createdAt,
        createdHour: sale.createdHour,
        mealPeriod: sale.mealPeriod,
        kotType: sale.kotType || "",
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
        // classificationReason: classificationReason,

        // Restaurant-specific fields
        tableNumber: sale.tableNumber || "",
        waiterName: sale.waiterName || "",
        // foodItems: foodItems,
        // beverageItems: beverageItems,

        // Hotel-specific fields
        roomNumber: sale.roomNumber || "",
        guestName: sale.guestName || partyName,
        // accommodationItems: accommodationItems,

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
      },
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
        {},
      ),
      overallMetrics: {
        averageTicketSize:
          totalTransactions > 0 ? totalSales / totalTransactions : 0,
        totalTransactions: totalTransactions,
        averageItemsPerTransaction:
          totalTransactions > 0
            ? transformedData.reduce(
              (sum, order) => sum + (order.itemCount || 0),
              0,
            ) / totalTransactions
            : 0,
      },
      serviceMetrics: {
        // Restaurant metrics
        tablesServed: [
          ...new Set(
            transformedData
              .filter((s) => s.tableNumber)
              .map((s) => s.tableNumber),
          ),
        ].length,
        waitersActive: [
          ...new Set(
            transformedData
              .filter((s) => s.waiterName)
              .map((s) => s.waiterName),
          ),
        ].length,
        // Hotel metrics
        roomsOccupied: [
          ...new Set(
            transformedData
              .filter((s) => s.roomNumber)
              .map((s) => s.roomNumber),
          ),
        ].length,
        guestsServed: [
          ...new Set(
            transformedData
              .filter((s) => s.guestName && s.guestName !== "Cash")
              .map((s) => s.guestName),
          ),
        ].length,
      },
    };

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
        serviceBreakdown: summary.serviceBreakdown,
        mealPeriodSummary: summary.mealPeriodBreakdown,
        message: `Found ${transformedData.length} ${businessType === "all" ? "combined" : businessType
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

export const getRoomCheckInDetails = async (req, res) => {
  try {
    const { roomId } = req.params;

    if (!roomId) {
      return res.status(400).json({
        success: false,
        message: "Room ID is required",
      });
    }

    // Validate if roomId is a valid ObjectId
    if (!mongoose.Types.ObjectId.isValid(roomId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid Room ID format",
      });
    }

    // Find active check-in for this specific room
    const checkIn = await CheckIn.findOne({
      "selectedRooms.roomId": new mongoose.Types.ObjectId(roomId),
      status: { $ne: "checkOut" }, // Only active check-ins
    })
      .populate("customerId")
      .populate("agentId")
      .populate("selectedRooms.selectedPriceLevel")
      .populate("bookingId")
      .populate("checkInId")
      .lean();

    if (!checkIn) {
      return res.status(404).json({
        success: false,
        message: "No active check-in found for this room",
      });
    }

    // Filter to only include the selected room's details
    const selectedRoom = checkIn.selectedRooms.find(
      (room) => room.roomId.toString() === roomId.toString(),
    );

    if (!selectedRoom) {
      return res.status(404).json({
        success: false,
        message: "Room not found in check-in details",
      });
    }

    // Create a filtered check-in object with only the selected room
    const filteredCheckIn = {
      ...checkIn,
      // selectedRooms: [selectedRoom], // Only the room that was clicked
    };

    return res.status(200).json({
      success: true,
      message: "Check-in details fetched successfully",
      checkIn: filteredCheckIn,
    });
  } catch (error) {
    console.error("Error fetching room check-in details:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch check-in details",
      error: error.message,
    });
  }
};
export const cancelBooking = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    // Find the booking
    const booking = await Booking.findById(id);

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: "Booking not found",
      });
    }

    // Check if booking can be cancelled
    if (booking.status === "checkIn") {
      return res.status(400).json({
        success: false,
        message: "Cannot cancel a booking that has already been checked in",
      });
    }

    if (booking.status === "checkOut") {
      return res.status(400).json({
        success: false,
        message: "Cannot cancel a completed booking",
      });
    }

    if (booking.status === "cancelled") {
      return res.status(400).json({
        success: false,
        message: "This booking is already cancelled",
      });
    }

    // Update the booking status to cancelled
    booking.status = "cancelled";
    booking.cancelledAt = new Date();
    await booking.save();

    // Optional: If rooms were allocated, release them
    if (booking.selectedRooms && booking.selectedRooms.length > 0) {
      // Add logic here to release rooms if needed
      // For example, update room availability
    }

    res.status(200).json({
      success: true,
      message: `Booking ${booking.voucherNumber} has been cancelled successfully`,
      data: booking,
    });
  } catch (error) {
    console.error("Error cancelling booking:", error);
    res.status(500).json({
      success: false,
      message: "Failed to cancel booking",
      error: error.message,
    });
  }
};

// report controller for FO summary
// export const getCheckoutStatementByDate = async (req, res) => {
//   try {
//     const { fromDate, toDate, cmp_id } = req.query;
//     if (!fromDate || !toDate) {
//       return res.status(400).json({
//         success: false,
//         message: "Date parameter is required",
//       });
//     }

//     // Build match criteria
//     const matchCriteria = {
//       cmp_id,
//       checkOutDate: { $gte: fromDate, $lte:toDate },
//     };

//     // Fetch all checkouts and manually process
//     const checkouts = await CheckOut.find(matchCriteria)
//       .lean()
//       .sort({ voucherNumber: 1 });

//     //fetch all advancs with respected dates

//     // Process each checkout - expand rooms
//     const checkoutData = [];
//     checkouts.forEach((checkout) => {
//       if (checkout.selectedRooms && checkout.selectedRooms.length > 0) {
//         const roomNames = checkout.selectedRooms
//           .map((room) => room.roomName)
//           .join(",");
//         const totalRoomamount = checkout.selectedRooms.reduce(
//           (sum, room) => sum + parseFloat(room.roomTotal || 0, 0),
//         );
//         checkoutData.push({
//           billNo: checkout.voucherNumber,
//           date: checkout.checkOutDate,
//           customerName: checkout.customerName,
//           roomName: roomNames,

//           totalAmount: parseFloat(checkout.totalAmount || 0),
//           grandTotal: parseFloat(checkout.grandTotal || 0),
//           advanceAmount: parseFloat(checkout.advanceAmount || 0),
//           balanceToPay: parseFloat(checkout.balanceToPay || 0),
//           paymentMode: checkout.paymentMode || "N/A",
//           checkOutDate: checkout.checkOutDate,
//           checkOutTime: checkout.checkOutTime,
//           roomTotal: totalRoomamount,
//           // Payment details (if you have them in the schema)
//           cash: parseFloat(checkout?.paymenttypeDetails?.cash || 0),
//           card: parseFloat(checkout?.paymenttypeDetails?.card || 0),
//           upi: parseFloat(checkout?.paymenttypeDetails?.upi || 0),
//           bank: parseFloat(checkout?.paymenttypeDetails?.bank || 0),
//           credit: parseFloat(checkout?.paymenttypeDetails?.credit || 0),
//         });
//       }
//     });
//     // Calculate summary based on unique checkouts (not rows)
//     const summaryData = {
//       totalCheckoutAmount: 0,
//       totalAdvanceAmount: 0,
//       totalcheckingAdvance: 0,
//       totalbookingAdvance: 0,
//       totalBalanceToPay: 0,
//       totalreceiptsAmount: 0,
//       totalotherPayments: 0,
//       count: checkouts.length, // Count unique checkouts, not rows
//       cashTotal: 0,
//       cardTotal: 0,
//       upiTotal: 0,
//       bankTotal: 0,
//       creditTotal: 0,
//     };
//     const startDate = new Date(fromDate + "T00:00:00.000Z");
//     const endDate = new Date(toDate + "T23:59:59.999Z");
//     const advquery = {
//       cmp_id,
//       bill_date: { $gte: startDate, $lt: endDate },
//       from: { $in: ["Booking", "CheckIn"] },
//     };
//     const advances = await TallyData.find(advquery).lean();
//     //  console.log("advncesss",advances)
//     advances.forEach((item) => {
//       summaryData.totalAdvanceAmount += item.bill_amount;
//       if (item.from === "Booking") {
//         summaryData.totalbookingAdvance += item.bill_amount;
//       } else if (item.from === "CheckIn") {
//         summaryData.totalcheckingAdvance += item.bill_amount;
//       }
//     });
//     const recptquery = {
//       cmp_id,
//       date: { $gte: startDate, $lt: endDate },
//     };
//     const receipts = await receiptModel.find(recptquery).lean();

//     receipts.forEach(
//       (item) => (summaryData.totalreceiptsAmount += item.enteredAmount),
//     );
//     const paymentquery = {
//       cmp_id,
//       date: { $gte: startDate, $lt: endDate },
//     };
//     const payments = await paymentModel.find(paymentquery).lean();
//     payments.forEach(
//       (item) => (summaryData.totalotherPayments += item.enteredAmount),
//     );

//     // Sum from original checkouts to avoid double counting
//     checkouts.forEach((checkout) => {
//       const grandTotal = parseFloat(checkout.grandTotal || 0);

//       const balanceToPay = parseFloat(checkout.balanceToPay || 0);

//       summaryData.totalCheckoutAmount += grandTotal;

//       summaryData.totalBalanceToPay += balanceToPay;

//       // Group by payment mode
//       const mode = checkout.paymentMode?.toUpperCase();
//       switch (mode) {
//         case "CASH":
//           summaryData.cashTotal += grandTotal;
//           break;
//         case "CARD":
//           summaryData.cardTotal += grandTotal;
//           break;
//         case "UPI":
//           summaryData.upiTotal += grandTotal;
//           break;
//         case "BANK":
//           summaryData.bankTotal += grandTotal;
//           break;
//         case "CREDIT":
//           summaryData.creditTotal += grandTotal;
//           break;
//       }
//     });

//     res.status(200).json({
//       success: true,
//       date: fromDate + " to " + toDate,
//       checkoutBills: checkoutData, // Rows with room details
//       summary: summaryData, // Summary from unique checkouts
//       debug: {
//         uniqueCheckouts: checkouts.length,
//         totalRows: checkoutData.length,
//         difference: checkoutData.length - checkouts.length,
//       },
//     });
//   } catch (error) {
//     console.error("Error fetching checkout statement:", error);
//     res.status(500).json({
//       success: false,
//       message: "Error fetching checkout data",
//       error: error.message,
//     });
//   }
// };

export const getCheckoutStatementByDate = async (req, res) => {
  try {
    const { fromDate, toDate, cmp_id } = req.query;
    if (!fromDate || !toDate) {
      return res.status(400).json({
        success: false,
        message: "Date parameter is required",
      });
    }

    const advanceTrackingExpr = {
      $gt: [
        {
          $size: {
            $filter: {
              input: {
                $objectToArray: {
                  $ifNull: ["$advanceTracking", {}],
                },
              },
              as: "item",
              cond: {
                $and: [
                  { $gte: ["$$item.k", fromDate] },
                  { $lte: ["$$item.k", toDate] },
                ],
              },
            },
          },
        },
        0,
      ],
    };
    const advanceAmountExpr = {
      $gt: [{ $toDouble: "$advanceAmount" }, 0],
    };

    const checkouts = await CheckOut.find({
      cmp_id,
      checkOutDate: { $gte: fromDate, $lte: toDate },
    })
      .lean()
      .sort({ voucherNumber: 1 });

    const bookings = await Booking.find({
      cmp_id,
      $expr: {
        $and: [advanceTrackingExpr, advanceAmountExpr],
      },
    })
      .lean()
      .sort({ voucherNumber: 1 });
    const checkings = await CheckIn.find({
      cmp_id,
      $expr: {
        $and: [advanceTrackingExpr, advanceAmountExpr],
      },
    })
      .lean()
      .sort({ voucherNumber: 1 });

    // Calculate summary based on unique checkouts (not rows)
    const summaryData = {
      totalCheckoutAmount: 0,
      totalAdvanceAmount: 0,
      totalCheckingAdvance: 0,
      totalBookingAdvance: 0,
      checkOutTimePaidAmount: 0,
      totalReceiptsAmount: 0,
      checkOutTimeRefundAmount: 0,
      checkOutTotalAdvanceRefundAmount: 0,
      totalRefundAmount: 0,
      totalotherPayments: 0,
      count: checkouts.length, // Count unique checkouts, not rows
      cashTotal: 0,
      advanceTotal: 0,
      upiTotal: 0,
      bankTotal: 0,
      creditTotal: 0,
    };

    //fetch all advancs with respected dates

    // Process each checkout - expand rooms
    const combinedArray = [...bookings, ...checkings, ...checkouts];
    const checkoutData = [];
    summaryData.totalBookingAdvance = bookings.reduce(
      (total, booking) => total + parseFloat(booking.advanceAmount || 0),
      0,
    ).toFixed(2);
    summaryData.totalCheckingAdvance = checkings.reduce(
      (total, checking) => total + parseFloat(checking.advanceAmount || 0),
      0,
    ).toFixed(2);
    summaryData.totalAdvanceAmount = (Number(summaryData.totalBookingAdvance) + Number(summaryData.totalCheckingAdvance)).toFixed(2);
    combinedArray.forEach((checkout) => {
      if (checkout.selectedRooms && checkout.selectedRooms.length > 0) {
        const roomNames = checkout.selectedRooms
          .map((room) => room.roomName)
          .join(",");
        const totalRoomamount = checkout.selectedRooms.reduce(
          (sum, room) => sum + parseFloat(room.roomTotal || 0, 0),
        );

        summaryData.advanceTotal +=
          Number(checkout?.paymenttypeDetails?.cash || 0) +
          Number(checkout?.paymenttypeDetails?.card || 0) +
          Number(checkout?.paymenttypeDetails?.upi || 0) +
          Number(checkout?.paymenttypeDetails?.bank || 0) +
          Number(checkout?.paymenttypeDetails?.credit || 0);

        summaryData.creditTotal += Number(checkout?.paymenttypeDetails?.credit || 0);
        summaryData.cashTotal += Number(checkout?.paymenttypeDetails?.cash || 0);
        summaryData.upiTotal += Number(checkout?.paymenttypeDetails?.upi || 0);
        summaryData.bankTotal += Number(checkout?.paymenttypeDetails?.bank || 0);
        summaryData.cardTotal += Number(checkout?.paymenttypeDetails?.card || 0);
        checkoutData.push({
          billNo: checkout.voucherNumber,
          date: checkout.bookingDate,
          customerName: checkout.customerName,
          roomName: roomNames,

          totalAmount: parseFloat(checkout.totalAmount || 0),
          grandTotal: parseFloat(checkout.grandTotal || 0),

          advanceAmount: parseFloat(checkout.advanceAmount || 0),
          balanceToPay: parseFloat(checkout.balanceToPay || 0),
          paymentMode: checkout.paymentMode || "N/A",
          checkOutDate: checkout.checkOutDate,
          checkOutTime: checkout.checkOutTime,
          roomTotal: totalRoomamount,
          // Payment details (if you have them in the schema)
          cash: parseFloat(checkout?.paymenttypeDetails?.cash || 0),
          card: parseFloat(checkout?.paymenttypeDetails?.card || 0),
          upi: parseFloat(checkout?.paymenttypeDetails?.upi || 0),
          bank: parseFloat(checkout?.paymenttypeDetails?.bank || 0),
          credit: parseFloat(checkout?.paymenttypeDetails?.credit || 0),
        });
      }
    });

    // Sum from original checkouts to avoid double counting
    checkouts.forEach((checkout) => {
      const grandTotal = parseFloat(checkout.grandTotal || 0);
      summaryData.checkOutTimePaidAmount += Number(checkout?.paymenttypeDetails?.cash || 0) +
        Number(checkout?.paymenttypeDetails?.card || 0) +
        Number(checkout?.paymenttypeDetails?.upi || 0) +
        Number(checkout?.paymenttypeDetails?.bank || 0) +
        Number(checkout?.paymenttypeDetails?.credit || 0);


      // Group by payment mode
      const mode = checkout.paymentMode?.toUpperCase();
      switch (mode) {
        case "CASH":
          summaryData.cashTotal += grandTotal;
          break;
        case "CARD":
          summaryData.cardTotal += grandTotal;
          break;
        case "UPI":
          summaryData.upiTotal += grandTotal;
          break;
        case "BANK":
          summaryData.bankTotal += grandTotal;
          break;
        case "CREDIT":
          summaryData.creditTotal += grandTotal;
          break;
      }
    });

    res.status(200).json({
      success: true,
      date: fromDate + " to " + toDate,
      checkoutBills: checkoutData, // Rows with room details
      summary: summaryData, // Summary from unique checkouts
      debug: {
        uniqueCheckouts: checkouts.length,
        totalRows: checkoutData.length,
        difference: checkoutData.length - checkouts.length,
      },
    });
  } catch (error) {
    console.error("Error fetching checkout statement:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching checkout data",
      error: error.message,
    });
  }
};
