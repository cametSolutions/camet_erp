import mongoose from "mongoose";
import Item from "../models/restaurantModels.js"; // Adjust path as needed
import hsnModel from "../models/hsnModel.js";
import product from "../models/productModel.js";
import { Category } from "../models/subDetails.js"; // Adjust path as needed
import kotModal from "../models/kotModal.js";
import { generateVoucherNumber } from "../helpers/voucherHelper.js";
import salesModel from "../models/salesModel.js";
import TallyData from "../models/TallyData.js";
import receiptModel from "../models/receiptModel.js";
import bankModel from "../models/bankModel.js";
import cashModel from "../models/cashModel.js";
import Table from "../models/TableModel.js";
// Helper functions (you may need to create these or adjust based on your existing ones)
import {
  buildDatabaseFilterForRoom,
  sendRoomResponse,
  fetchRoomsFromDatabase,
} from "../helpers/restaurantHelper.js";
import { extractRequestParams } from "../helpers/productHelper.js";
import VoucherSeriesModel from "../models/VoucherSeriesModel.js";
import { CheckIn } from "../models/bookingModal.js";
import { response } from "express";
// Add Item Controller
export const addItem = async (req, res) => {
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

    const updatedTable = tableData.map((item) => {
      const { priceRate, ...rest } = item;
      return {
        ...rest,
        pricerate: priceRate,
      };
    });

    console.log(updatedTable);
    // Step 4: Create Item document
    const newItem = new product({
      Primary_user_id: req.pUserId || req.owner,
      Secondary_user_id: req.sUserId,
      cmp_id: req.params.cmp_id,
      product_name: formData.itemName,
      product_image: formData.imageUrl?.secure_url || "", // Add image URL
      category: formData.foodCategory,
      sub_category: formData.foodType,
      unit: formData.unit,
      hsn_code: formData.hsn,
      // hsnCode: correspondingHsn.hsn, // Store HSN code for easier access
      Priceleveles: updatedTable,
    });

    // Step 5: Save using session
    await newItem.save({ session });

    // Step 6: Commit the transaction
    await session.commitTransaction();

    res.status(201).json({
      success: true,
      message: "Item Added Successfully",
      data: newItem,
    });
  } catch (error) {
    console.log("Error saving item details:", error);

    // Rollback on error
    await session.abortTransaction();

    res.status(500).json({
      success: false,
      message: "Internal Server Error",
      error: error.message,
    });
  } finally {
    // Step 7: Always end session
    session.endSession();
  }
};

// Get Items Controller
export const getItems = async (req, res) => {
  try {
    const params = extractRequestParams(req);
    const filter = buildDatabaseFilterForRoom(params);
    console.log("filter", filter);

    const { items, totalItems } = await fetchRoomsFromDatabase(filter, params);
    console.log("items", items);

    const sendItemResponseData = sendRoomResponse(
      res,
      items,
      totalItems,
      params
    );
  } catch (error) {
    console.error("Error in getItems:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error, try again!",
    });
  }
};
// Assuming you have ProductModel imported correctly
// import ProductModel from '../models/ProductModel'; (adjust path as needed)

export const getAllItems = async (req, res) => {
  try {
    // Extract filters from req.query or req.params as needed
    const params = extractRequestParams(req); // custom function or just use req.query directly
    const filter = buildDatabaseFilterForRoom(params); // build your filter based on request

    // Fetch all products matching the filter (NO pagination)
    const products = await product.find(filter);

    // Optionally: return count too
    // const totalItems = await ProductModel.countDocuments(filter);

    return res.status(200).json({
      success: true,
      items: products,
      // totalItems, // include if you want to return count
    });
  } catch (error) {
    console.error("Error in getAllProducts:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error, try again!",
    });
  }
};

// Get Single Item Controller (for editing)
export const getItemById = async (req, res) => {
  try {
    const { id } = req.params;

    const item = await Item.findOne({
      _id: id,
      cmp_id: req.params.cmp_id,
      primary_user_id: req.pUserId || req.owner,
    })
      .populate("foodCategory", "name")
      .populate("foodType", "name")
      .populate("hsn", "hsn")
      .populate("priceLevel.priceLevel", "name")
      .lean();

    if (!item) {
      return res.status(404).json({
        success: false,
        message: "Item not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Item fetched successfully",
      data: item,
    });
  } catch (error) {
    console.error("Error in getItemById:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error, try again!",
    });
  }
};

// Update Item Controller
export const updateItem = async (req, res) => {
  const session = await mongoose.startSession();

  try {
    const { formData, tableData } = req.body;

    session.startTransaction();

    // Verify HSN exists
    const correspondingHsn = await hsnModel
      .findOne({ _id: formData.hsn })
      .session(session);
    if (!correspondingHsn) {
      await session.abortTransaction();
      return res.status(400).json({ message: "HSN data missing" });
    }

    // Update item
    const updatedItem = await product.findOneAndUpdate(
      { _id: req.params.id, cmp_id: req.params.cmp_id },
      {
        itemName: formData.itemName,
        foodCategory: formData.foodCategory,
        foodType: formData.foodType,
        unit: formData.unit,
        hsn: formData.hsn,
        hsnCode: correspondingHsn.hsn,
        Priceleveles: tableData,
        updatedAt: new Date(),
      },
      {
        new: true,
        session,
        runValidators: true,
      }
    );

    if (!updatedItem) {
      await session.abortTransaction();
      return res.status(404).json({
        success: false,
        message: "Item not found",
      });
    }

    await session.commitTransaction();

    res.status(200).json({
      success: true,
      message: "Item updated successfully",
      data: updatedItem,
    });
  } catch (error) {
    console.log("Error updating item:", error);
    await session.abortTransaction();

    res.status(500).json({
      success: false,
      message: "Internal Server Error",
      error: error.message,
    });
  } finally {
    session.endSession();
  }
};

// Delete Item Controller
export const deleteItem = async (req, res) => {
  try {
    const { itemId } = req.params.id;

    const deletedItem = await product.findOneAndDelete(itemId);
    if (!deletedItem) {
      return res.status(404).json({
        success: false,
        message: "Item not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Item deleted successfully",
      data: deletedItem,
    });
  } catch (error) {
    console.error("Error in deleteItem:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error, try again!",
    });
  }
};

// controllers/categoryController.js

export const getCategories = async (req, res) => {
  try {
    const { under } = req.query;
    const cpm_id = req.params.cpm_id;
    // Build filter conditionally
    const filter = {};
    if (under) filter.under = under;
    if (cpm_id) filter.cmp_id = cpm_id;

    const categories = await Category.find(filter).select("-__v"); // omit __v if you want

    res.status(200).json({
      success: true,
      data: categories,
    });
  } catch (error) {
    console.error("Error fetching categories:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error while fetching categories",
    });
  }
};

// function used to generate kot
export const generateKot = async (req, res) => {
  const session = await mongoose.startSession();

  try {
    session.startTransaction();

    const cmp_id = req.params.cmp_id;

    // Find voucher series inside the session
    const voucherData = await VoucherSeriesModel.findOne(
      { voucherType: "memoRandom", cmp_id: cmp_id },
      null,
      { session }
    );

    if (!voucherData) {
      throw new Error("Voucher series not found for memoRandom");
    }

    // Generate voucher number using the session
    const kotNumber = await generateVoucherNumber(
      cmp_id,
      "memoRandom",
      voucherData.series[0]._id.toString(),
      session
    );

    // Prepare the KOT data
    const kotData = {
      voucherNumber: kotNumber?.voucherNumber,
      primary_user_id: req.pUserId || req.owner,
      secondary_user_id: req.sUserId,
      cmp_id: cmp_id,
      items: req.body.items,
      type: req.body.type,
      customer: req.body.customer,
      tableNumber: req.body.customer?.tableNumber,
      total: req.body.total,
      createdAt: new Date(),
      status: req.body.status || "pending",
      paymentMethod: req.body.paymentMethod,
    };

    // // Create the KOT document inside the transaction
    const kot = await kotModal.create([kotData], { session });

    // Commit the transaction
    await session.commitTransaction();
    session.endSession();

    res.status(200).json({
      success: true,
      data: kot[0], // create with array returns an array
    });
  } catch (error) {
    await session.abortTransaction();
    session.endSession();

    console.error("Error generating KOT:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error while generating KOT",
      error: error.message,
    });
  }
};

// get all kot
export const getKot = async (req, res) => {
  try {
    const kot = await kotModal.find({ cmp_id: req.params.cmp_id });
    res.status(200).json({
      success: true,
      data: kot,
    });
  } catch (error) {
    console.error("Error fetching KOT:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error while fetching KOT",
    });
  }
};

// function used to update kot
export const updateKotStatus = async (req, res) => {
  try {
    const kot = await kotModal.updateOne({ _id: req.params.cmp_id }, req.body);
    res.status(200).json({
      success: true,
      data: kot,
    });
  } catch (error) {
    console.error("Error updating KOT:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error while updating KOT",
    });
  }
};

// function used to fetch room data based on room booking
export const getRoomDataForRestaurant = async (req, res) => {
  try {
    const now = new Date();

    // Get all records for that cmp_id
    const allData = await CheckIn.find({ cmp_id: req.params.cmp_id });

    // Filter in JS
    const filtered = allData.filter((doc) => {
      const arrivalDateTime = new Date(`${doc.arrivalDate} ${doc.arrivalTime}`);
      const checkOutDateTime = new Date(
        `${doc.checkOutDate} ${doc.checkOutTime}`
      );

      return arrivalDateTime <= now && now <= checkOutDateTime;
    });

    res.status(200).json({
      success: true,
      data: filtered,
    });
  } catch (error) {
    console.error("Error fetching room data:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error while fetching room data",
    });
  }
};

// function used to update kot data

export const updateKotPayment = async (req, res) => {
  try {
    let kotId = req.params.id;
    let cmp_id = req.params.cmp_id;
    let paymentMethod = req.body.paymentMethod;
    let paymentDetails = req.body?.paymentDetails;
    if (paymentDetails?.cashAmount > 0 && paymentDetails?.onlineAmount > 0) {
      paymentMethod = "mixed";
    }
    console.log(paymentMethod);
    console.log(paymentDetails);
    console.log(kotId);
    console.log(cmp_id);
    const SaleVoucher = await VoucherSeriesModel.findOne({
      cmp_id: cmp_id,
      voucherType: "sales",
    })

    console.log(SaleVoucher);
    let specificVoucherSeries = SaleVoucher?.series.find(
      (series) => series.under === "restaurant"
    );

    console.log(specificVoucherSeries);

    // const saveSales = await salesModel.create({
    //   date : new Date(),
    //   cmp_id : cmp_id,
    //   selectedDate : new Date().toLocaleDateString(),
    //   voucherType:{}
    // });
    // const kot = await kotModal.updateOne(
    //   { _id: kotId },
    //   { paymentMethod: paymentMethod, paymentCompleted: true }
    // );
    // console.log(kotId);
    // console.log(paymentMethod);
    // res.status(200).json({
    //   success: true,
    //   data: kot,
    // });
  } catch (error) {
    console.error("Error updating KOT:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error while updating KOT",
    });
  }
};
// function used to fetch bank and cash online details
export const getPaymentType = async (req, res) => {
  try {
    const bankDetails = await bankModel.find({ cmp_id: req.params.cmp_id });
    const cashDetails = await cashModel.find({ cmp_id: req.params.cmp_id });
    const paymentBelongsTo = { bankDetails, cashDetails };
    res.status(200).json({
      success: true,
      data: paymentBelongsTo,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Internal server error while fetching bank and cash details",
    });
  }
};
// controllers/tableController.js


export const saveTableNumber = async (req, res) => {
  try {
    const { cmp_id } = req.params;
    const { tableNumber } = req.body;

    if (!tableNumber) {
      return res.status(400).json({ message: "Table number is required" });
    }

 
    const newTable = new Table({
   
      cmp_id,
      tableNumber,
    });

    await newTable.save();

    res.status(201).json({
      message: "Table number saved successfully",
      table: newTable
    });
  } catch (error) {
    console.error("Error saving table number:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};
 

export const getTables = async (req, res) => {
  try {
    const { cmp_id } = req.params;

    if (!cmp_id) {
      return res.status(400).json({ success: false, message: "Company ID is required" });
    }

    // Fetch tables filtered by company ID from database
    const tables = await Table.find({ cmp_id: cmp_id }).sort({ tableNumber: 1 });
console.log("table",tables)
    res.status(200).json({
      success: true,
      tables, // array of table documents with fields like _id, tableNumber etc.
    });
  } catch (error) {
    console.error('Error fetching tables:', error);
    res.status(500).json({ success: false, message: 'Server error getting tables' });
  }
};

export const updateTable = async (req, res) => {
  try {
    const { id } = req.params;
    const { tableNumber } = req.body;

    if (!id) {
      return res.status(400).json({ success: false, message: "Table ID is required" });
    }

    if (!tableNumber) {
      return res.status(400).json({ success: false, message: "Table number is required" });
    }

    // Check if table exists
    const existingTable = await Table.findById(id);
    if (!existingTable) {
      return res.status(404).json({ success: false, message: "Table not found" });
    }

    // Check if the new table number already exists for this company (excluding current table)
    const duplicateTable = await Table.findOne({
      companyId: existingTable.companyId,
      tableNumber: tableNumber.trim(),
      _id: { $ne: id }
    });

    if (duplicateTable) {
      return res.status(409).json({ 
        success: false, 
        message: "Table number already exists" 
      });
    }

    // Update table
    const updatedTable = await Table.findByIdAndUpdate(
      id,
      { 
        tableNumber: tableNumber.trim(),
        updatedAt: new Date()
      },
      { new: true, runValidators: true }
    );

    res.status(200).json({
      success: true,
      message: "Table updated successfully",
      table: updatedTable
    });
  } catch (error) {
    console.error('Error updating table:', error);
    
    if (error.name === 'ValidationError') {
      return res.status(400).json({ 
        success: false, 
        message: 'Validation error',
        errors: error.errors 
      });
    }
    
    if (error.name === 'CastError') {
      return res.status(400).json({ 
        success: false, 
        message: 'Invalid table ID format' 
      });
    }

    res.status(500).json({ success: false, message: 'Server error updating table' });
  }
};

// DELETE - Delete a table
export const deleteTable = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({ success: false, message: "Table ID is required" });
    }

    // Check if table exists
    const existingTable = await Table.findById(id);
    if (!existingTable) {
      return res.status(404).json({ success: false, message: "Table not found" });
    }

    // Optional: Check if table is currently in use (has active orders, reservations, etc.)
    // const hasActiveOrders = await Order.findOne({ tableId: id, status: 'active' });
    // if (hasActiveOrders) {
    //   return res.status(409).json({ 
    //     success: false, 
    //     message: "Cannot delete table with active orders" 
    //   });
    // }

    // Delete table
    await Table.findByIdAndDelete(id);

    res.status(200).json({
      success: true,
      message: "Table deleted successfully"
    });
  } catch (error) {
    console.error('Error deleting table:', error);
    
    if (error.name === 'CastError') {
      return res.status(400).json({ 
        success: false, 
        message: 'Invalid table ID format' 
      });
    }

    res.status(500).json({ success: false, message: 'Server error deleting table' });
  }
};