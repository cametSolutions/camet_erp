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

import {
  buildDatabaseFilterForRoom,
  sendRoomResponse,
  fetchRoomsFromDatabase,
  buildDatabaseFilterForBooking,
  fetchBookingsFromDatabase,
  sendBookingsResponse,
  extractRequestParamsForBookings,
} from "../helpers/hotelHelper.js";
import { extractRequestParams } from "../helpers/productHelper.js";
import { generateVoucherNumber } from "../helpers/voucherHelper.js";
import mongoose from "mongoose";
import VoucherSeriesModel from "../models/VoucherSeriesModel.js";
import { addItem } from "./restaurantController.js";
import kotModal from "../models/kotModal.js";
const { ObjectId } = mongoose.Types;

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

    console.log("Checking availability for date (checkOutDate logic only):", { endDate });
    console.log("companyId", req.params.cmp_id);

    // Find rooms that are currently booked for the specified checkout date (ignore arrivalDate)
    const overlappingBookings = await Booking.find({
      cmp_id: req.params.cmp_id,
      checkOutDate: { $gt: startDate }, // Only consider checkOutDate
      status: { $nin: ['CheckIn'] }
    });

    console.log("Overlapping bookings found:", overlappingBookings.length);

    // Find rooms that are currently checked-in for the specified checkout date
    const overlappingCheckIns = await CheckIn.find({
      cmp_id: req.params.cmp_id,
      checkOutDate: { $gt: startDate },
    }).select('roomDetails');

    console.log("Overlapping check-ins found:", overlappingCheckIns.length);

    // Collect all occupied room IDs
    const occupiedRoomId = new Set();

    // Add booked room IDs
    overlappingBookings.forEach(booking => {
      if (booking.selectedRooms && Array.isArray(booking.selectedRooms)) {
        booking.selectedRooms.forEach(room => {
          const roomId = room.roomId || room._id || room;
          if (roomId) {
            occupiedRoomId.add(roomId.toString());
          }
        });
      }
    });

    // Add checked-in room IDs
    overlappingCheckIns.forEach(checkIn => {
      if (checkIn.selectedRooms && Array.isArray(checkIn.selectedRooms)) {
        checkIn.selectedRooms.forEach(room => {
          const roomId = room.roomId || room._id || room;
          if (roomId) {
            occupiedRoomId.add(roomId.toString());
          }
        });
      }
    });

    // Filter out occupied **and dirty/blocked** rooms
    const vacantRooms = rooms.filter(room => {
      const roomId = room._id.toString();
      const isOccupied = occupiedRoomId.has(roomId);

      // exclude rooms with status 'dirty' or 'blocked'
      const isCleanAndOpen =
        room.status !== 'dirty' &&
        room.status !== 'blocked';

      return !isOccupied && isCleanAndOpen;
    });

    // Add availability status
    const roomsWithStatus = vacantRooms.map(room => ({
      ...room.toObject(),
      status: 'vacant',
      checkedAt: now
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
    const orgId = req.params.cmp_id;

    if (!bookingData.arrivalDate) {
      return res.status(400).json({ message: "Missing required fields" });
    }
    let selectedModal;
    let voucherType;
    let under;
    if (isFor === "bookingPage") {
      selectedModal = Booking;
      voucherType = "saleOrder";
      under = "hotel";
    } else if (isFor === "checkIn") {
      if (bookingData?.bookingId) {
        let updateBookingData = await Booking.findByIdAndUpdate(
          bookingData.bookingId,
          { status: "checkIn" },
          { new: true }
        ).session(session);

        if (!updateBookingData) {
          return res
            .status(400)
            .json({ success: false, message: "Booking not found" });
        }
      }

      selectedModal = CheckIn;
      voucherType = "deliveryNote";
      under = "hotel";
    } else {
      console.log("bookingData", bookingData);
      if (bookingData?.checkInId) {
        let updateBookingData = await CheckIn.findByIdAndUpdate(
          bookingData.checkInId,
          { status: "checkOut" },
          { new: true }
        ).session(session);

        if (!updateBookingData) {
          return res
            .status(400)
            .json({ success: false, message: "Check In not found" });
        }
      }
      selectedModal = CheckOut;
      voucherType = "sales";
      under = "hotel";
    }

    const series_id = bookingData.voucherId || null;
    let savedBooking;

    // Start the transaction
    await session.withTransaction(async () => {
      // Generate voucher number with session
      const bookingNumber = await generateVoucherNumber(
        orgId,
        voucherType,
        series_id,
        session
      );

      // Attach generated voucher details
      bookingData.voucherNumber = bookingNumber?.voucherNumber;
      bookingData.voucherId = series_id;

      // Save booking
      const newBooking = new selectedModal({
        cmp_id: orgId,
        Primary_user_id: req.pUserId || req.owner,
        Secondary_user_id: req.sUserId,
        ...bookingData,
      });

      savedBooking = await newBooking.save({ session });

      // If there's an advance, save it too
      if (bookingData.advanceAmount && bookingData.advanceAmount > 0) {
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
          bill_pending_amt: bookingData.advanceAmount,
          accountGroup: bookingData.accountGroup,
          user_id: req.sUserId,
          advanceAmount: bookingData.advanceAmount,
          advanceDate: new Date(),
          classification: "Cr",
          source: under,
        });

        await advanceObject.save({ session });
      }
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
              bill_pending_amt: bookingData.advanceAmount,
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
      if (item) {
        if (item?.selectedRooms) {
          for (const room of item?.selectedRooms) {
            let startDateTime = new Date(`${item?.arrivalDate} ${item?.arrivalTime}`);
            let endDateTime = new Date(`${item?.checkOutDate} ${item?.checkOutTime}`);

            let kotData = await kotModal.find({
              roomId: room.roomId,
              createdAt: {
                $gte: startDateTime,
                $lte: endDateTime,
              },
            });
            allKotData.push(...kotData);
          }
        }
        const checkInData = await CheckIn.findOne({ _id: item.checkInId });

        if (!checkInData) continue;

        const bookingSideAdvanceDetails = await TallyData.find({
          billId: checkInData.bookingId,
        });

        const checkInSideAdvanceDetails = await TallyData.find({
          billId: checkInData._id,
        });

        const checkOutSideAdvanceDetails = await TallyData.find({
          billId: item._id,
        });
        allAdvanceDetails.push(
          ...bookingSideAdvanceDetails,
          ...checkInSideAdvanceDetails,
          ...checkOutSideAdvanceDetails
        );
      }
    }

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
