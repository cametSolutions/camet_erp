import mongoose from 'mongoose';
import Item from '../models/restaurantModels.js'; // Adjust path as needed
import hsnModel from '../models/hsnModel.js'; // Adjust path as needed
const { ObjectId } = mongoose.Types;
// Helper functions (you may need to create these or adjust based on your existing ones)
import {buildDatabaseFilterForRoom , sendRoomResponse ,fetchRoomsFromDatabase} from "../helpers/restaurantHelper.js"
import {extractRequestParams} from "../helpers/productHelper.js"
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
    
    // Step 4: Create Item document
    const newItem = new Item({
      primary_user_id: req.pUserId || req.owner,
      secondary_user_id: req.sUserId,
      cmp_id: req.params.cmp_id,
      itemName: formData.itemName,
      foodCategory: formData.foodCategory,
      foodType: formData.foodType,
      unit: formData.unit,
      hsn: formData.hsn,
      hsnCode: correspondingHsn.hsn, // Store HSN code for easier access
      priceLevel: tableData,
    });
    
    // Step 5: Save using session
    await newItem.save({ session });
    
    // Step 6: Commit the transaction
    await session.commitTransaction();
    
    res.status(201).json({ 
      success: true,
      message: "Item Added Successfully", 
      data: newItem 
    });
  } catch (error) {
    console.log("Error saving item details:", error);
    
    // Rollback on error
    await session.abortTransaction();
    
    res
      .status(500)
      .json({ 
        success: false,
        message: "Internal Server Error", 
        error: error.message 
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
    
    const sendItemResponseData = sendRoomResponse(res, items, totalItems, params);
  } catch (error) {
    console.error("Error in getItems:", error);
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
    
    const item = await Item
      .findOne({ 
        _id: id,
        cmp_id: req.params.cmp_id,
        primary_user_id: req.pUserId || req.owner
      })
      .populate('foodCategory', 'name')
      .populate('foodType', 'name')
      .populate('hsn', 'hsn')
      .populate('priceLevel.priceLevel', 'name')
      .lean();
    
    if (!item) {
      return res.status(404).json({
        success: false,
        message: "Item not found"
      });
    }
    
    res.status(200).json({
      success: true,
      message: "Item fetched successfully",
      data: item
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
    const updatedItem = await Item
      .findOneAndUpdate(
        { 
          _id: id,
          cmp_id: req.params.cmp_id,
          primary_user_id: req.pUserId || req.owner
        },
        {
          itemName: formData.itemName,
          foodCategory: formData.foodCategory,  
          foodType: formData.foodType,
          unit: formData.unit,
          hsn: formData.hsn,
          hsnCode: correspondingHsn.hsn,
          priceLevel: tableData,
          updatedAt: new Date()
        },
        { 
          new: true, 
          session,
          runValidators: true 
        }
      );
    
    if (!updatedItem) {
      await session.abortTransaction();
      return res.status(404).json({
        success: false,
        message: "Item not found"
      });
    }
    
    await session.commitTransaction();
    
    res.status(200).json({
      success: true,
      message: "Item updated successfully",
      data: updatedItem
    });
  } catch (error) {
    console.log("Error updating item:", error);
    await session.abortTransaction();
    
    res.status(500).json({
      success: false,
      message: "Internal Server Error",
      error: error.message
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
      primary_user_id: req.pUserId || req.owner
    });
    
    if (!deletedItem) {
      return res.status(404).json({
        success: false,
        message: "Item not found"
      });
    }
    
    res.status(200).json({
      success: true,
      message: "Item deleted successfully",
      data: deletedItem
    });
  } catch (error) {
    console.error("Error in deleteItem:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error, try again!",
    });
  }
};