import mongoose from "mongoose";
import Item from "../models/restaurantModels.js"; // Adjust path as needed
import hsnModel from "../models/hsnModel.js";
import product from "../models/productModel.js";
import { Category } from "../models/subDetails.js"; // Adjust path as needed

// Helper functions (you may need to create these or adjust based on your existing ones)
import {
  buildDatabaseFilterForRoom,
  sendRoomResponse,
  fetchRoomsFromDatabase,
} from "../helpers/restaurantHelper.js";
import { extractRequestParams } from "../helpers/productHelper.js";
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
    const { id } = req.params;
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
    const updatedItem = await Item.findOneAndUpdate(
      {
        _id: id,
        cmp_id: req.params.cmp_id,
        primary_user_id: req.pUserId || req.owner,
      },
      {
        itemName: formData.itemName,
        foodCategory: formData.foodCategory,
        foodType: formData.foodType,
        unit: formData.unit,
        hsn: formData.hsn,
        hsnCode: correspondingHsn.hsn,
        priceLevel: tableData,
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
    const { id } = req.params;

    const deletedItem = await Item.findOneAndDelete({
      _id: id,
      cmp_id: req.params.cmp_id,
      primary_user_id: req.pUserId || req.owner,
    });

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

    // Build filter conditionally
    const filter = {};
    if (under) filter.under = under;

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
