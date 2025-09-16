import mongoose from "mongoose";
import Item from "../models/restaurantModels.js"; // Adjust path as needed
import hsnModel from "../models/hsnModel.js";
import productModel from "../models/productModel.js";
import { Category } from "../models/subDetails.js"; // Adjust path as needed
import kotModal from "../models/kotModal.js";
import { generateVoucherNumber } from "../helpers/voucherHelper.js";
import salesModel from "../models/salesModel.js";
import TallyData from "../models/TallyData.js";
import Receipt from "../models/receiptModel.js";

import bankModel from "../models/bankModel.js";
import cashModel from "../models/cashModel.js";
import Party from "../models/partyModel.js";
import { saveSettlementData } from "../helpers/salesHelper.js";
import Organization from "../models/OragnizationModel.js";
import Table from "../models/TableModel.js";
import { Godown } from "../models/subDetails.js";
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
import receiptModel from "../models/receiptModel.js";
// Add Item Controller
export const addItem = async (req, res) => {
  const session = await mongoose.startSession(); // Step 1: Start session

  try {
    const { formData, tableData } = req.body;

    session.startTransaction(); // Step 2: Start transaction

    // Step 3: Fetch HSN data inside the session
    const correspondingHsn = await hsnModel
      .findOne({ hsn: formData.hsn })
      .session(session);
    if (!correspondingHsn) {
      await session.abortTransaction();
      return res.status(400).json({ message: "HSN data missing" });
    }

    let godown = await Godown.findOne({ cmp_id: req.params.cmp_id }).session(
      session
    );

    if (!godown) {
      await session.abortTransaction();
      return res.status(400).json({ message: "godown data missing" });
    }

    let godownObject = {
      godown: godown._id,
      balance_stock: 0,
      batch: "Primary Batch",
    };

    // Step 4: Create Item document
    const newItem = new productModel({
      Primary_user_id: req.pUserId || req.owner,
      Secondary_user_id: req.sUserId,
      cmp_id: req.params.cmp_id,
      product_name: formData.itemName,
      product_image: formData.imageUrl?.secure_url || "", // Add image URL
      category: formData.foodCategory,
      sub_category: formData.foodType,
      unit: formData.unit,
      hsn_code: formData.hsn,
      cgst: formData.cgst,
      sgst: formData.sgst,
      igst: formData.igst,
      // hsnCode: correspondingHsn.hsn, // Store HSN code for easier access
      Priceleveles: tableData,
      GodownList: godownObject,
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

    const { items, totalItems } = await fetchRoomsFromDatabase(filter, params);

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
    const products = await productModel.find(filter);

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
      .findOne({ hsn: formData.hsn })
      .session(session);
    if (!correspondingHsn) {
      await session.abortTransaction();
      return res.status(400).json({ message: "HSN data missing" });
    }

    // Update item
    const updatedItem = await productModel.findByIdAndUpdate(
      req.params.id,
      {
        $set: {
          product_image: formData.imageUrl?.secure_url,
          product_name: formData.itemName,
          category: formData.foodCategory,
          sub_category: formData.foodType,
          unit: formData.unit,
          hsn_code: formData.hsn,
          cgst: formData.cgst,
          sgst: formData.sgst,
          igst: formData.igst,
          Priceleveles: tableData,
        },
      },
      {
        // new: true,
        session,
        // runValidators: true,
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
    const { id } = req.params; // or const itemId = req.params.id;

    const deletedItem = await productModel.findByIdAndDelete(id);

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
    const organizationData = await Organization.findOne(
      { _id: cmp_id }, // filter
      null, // projection (null = all fields)
      { session } // options (session here)
    );

    console.log(organizationData);
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

      status: organizationData.configurations[0].kotAutoApproval
        ? "completed"
        : req.body.status || "pending",

      paymentMethod: req.body.paymentMethod,
      roomId: req.body.customer?.roomId,
      checkInNumber: req.body.customer?.checkInNumber,
    };

    // // Create the KOT document inside the transaction
    const kot = await kotModal.create([kotData], { session });

    if (kotData.tableNumber && kotData.type === "dine-in") {
      const tableUpdate = await Table.findOneAndUpdate(
        { cmp_id, tableNumber: kotData.tableNumber },
        { $set: { status: "occupied" } },
        { new: true, session }
      );

      if (!tableUpdate) {
        throw new Error(
          `Table ${kotData.tableNumber} not found for company ${cmp_id}`
        );
      }
    }
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

export const editKot = async (req, res) => {
  const session = await mongoose.startSession();

  try {
    session.startTransaction();

    const cmp_id = req.params.cmp_id;

    // Get the previous KOT
    const previousKot = await kotModal.findOne(
      { _id: req.params.kotId, cmp_id },
      null,
      { session }
    );

    if (!previousKot) {
      throw new Error(
        `KOT ${req.params.kotId} not found for company ${cmp_id}`
      );
    }

    // Update the KOT
    const updatedKot = await kotModal.findOneAndUpdate(
      { _id: req.params.kotId, cmp_id },
      {
        items: req.body.items,
        type: req.body.type,
        customer: req.body.customer,
        tableNumber: req.body.customer?.tableNumber,
        total: req.body.total,
        status: req.body.status || "pending",
        paymentMethod: req.body.paymentMethod,
        roomId: req.body.customer?.roomId,
        checkInNumber: req.body.customer?.checkInNumber,
      },
      { new: true, session }
    );

    // If previous KOT was dine-in, free up the old table
    if (previousKot.tableNumber && previousKot.type === "dine-in") {
      const tableUpdate = await Table.findOneAndUpdate(
        { cmp_id, tableNumber: previousKot.tableNumber },
        { $set: { status: "available" } },
        { new: true, session }
      );

      if (!tableUpdate) {
        throw new Error(
          `Table ${previousKot.tableNumber} not found for company ${cmp_id}`
        );
      }
    }

    // If new KOT is dine-in, occupy the new table
    if (updatedKot.tableNumber && updatedKot.type === "dine-in") {
      const tableUpdate = await Table.findOneAndUpdate(
        { cmp_id, tableNumber: updatedKot.tableNumber },
        { $set: { status: "occupied" } },
        { new: true, session }
      );

      if (!tableUpdate) {
        throw new Error(
          `Table ${updatedKot.tableNumber} not found for company ${cmp_id}`
        );
      }
    }

    // Commit the transaction
    await session.commitTransaction();
    session.endSession();

    res.status(200).json({
      success: true,
      data: updatedKot,
    });
  } catch (error) {
    await session.abortTransaction();
    session.endSession();

    console.error("Error editing KOT:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error while editing KOT",
      error: error.message,
    });
  }
};

// get all kot
export const getKot = async (req, res) => {
  try {
    const { cmp_id } = req.params;
    let { date } = req.query;
    // If no date is passed, use today's date
    if (!date) {
      date = new Date().toISOString().slice(0, 10); // Format: YYYY-MM-DD
    }
    // Get date range for filtering (00:00 to 23:59 of that day)
    const start = new Date(date + "T00:00:00.000Z");
    const end = new Date(date + "T23:59:59.999Z");

    const kot = await kotModal
      .find({
        cmp_id,
        createdAt: { $gte: start, $lte: end },
      })
      .populate("roomId");

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
    // Today's date only (strip time)
    const today = new Date();
    today.setHours(0, 0, 0, 0); // reset time to midnight

    // Get all records for cmp_id
    const allData = await CheckIn.find({
      cmp_id: req.params.cmp_id,
      status: { $ne: "checkOut" },
    });

    // Filter only those where today's date falls between arrivalDate & checkOutDate
    const filtered = allData.filter((doc) => {
      // arrivalDate/checkOutDate are stored as "YYYY-MM-DD" strings
      const arrivalDate = new Date(doc.arrivalDate);
      arrivalDate.setHours(0, 0, 0, 0);

      const checkOutDate = new Date(doc.checkOutDate);
      checkOutDate.setHours(0, 0, 0, 0);

      return arrivalDate <= today && today <= checkOutDate;
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

// export const updateKotPayment = async (req, res) => {
//   const session = await mongoose.startSession();

//   try {
//     await session.withTransaction(async () => {
//       const kotId = req.params.id;
//       const cmp_id = req.params.cmp_id;
//       let paymentMethod = req.body.paymentMethod;
//       const paymentDetails = req.body?.paymentDetails;
//       const kotData = req.body?.selectedKotData;
//       let paymentCompleted = false;

//       if (paymentDetails?.cashAmount > 0 && paymentDetails?.onlineAmount > 0) {
//         paymentMethod = "mixed";
//       }

//       console.log(paymentMethod, paymentDetails, kotId, cmp_id);

//       // 1) Get the sales voucher
//       const SaleVoucher = await VoucherSeriesModel.findOne({
//         cmp_id: cmp_id,
//         voucherType: "sales",
//       }).session(session);

//       if (!SaleVoucher) {
//         throw new Error("Sale voucher not found");
//       }

//       // 2) Find the specific series
//       const specificVoucherSeries = SaleVoucher.series.find(
//         (series) => series.under === "restaurant"
//       );

//       if (!specificVoucherSeries) {
//         throw new Error("No 'restaurant' voucher series found");
//       }

//       // 3) Generate voucher number (make sure this function uses session internally)
//       const saleNumber = await generateVoucherNumber(
//         cmp_id,
//         "sales",
//         specificVoucherSeries._id.toString(),
//         session
//       );

//       let selectedParty;
//       if (paymentDetails?.paymentMode == "single") {
//         paymentCompleted = true;
//         if (Number(paymentDetails?.cashAmount) > 0) {
//           selectedParty = await Party.findOne({
//             cmp_id: cmp_id,
//             partyName: paymentDetails?.selectedCash?.cash_ledname,
//           }).session(session);
//         }
//         if (Number(paymentDetails?.onlineAmount) > 0) {
//           selectedParty = await Party.findOne({
//             cmp_id: cmp_id,
//             partyName: paymentDetails?.selectedBank?.bank_ledname,
//           }).session(session);
//         }
//       } else {
//         if (
//           Number(paymentDetails?.cashAmount) +
//             Number(paymentDetails?.onlineAmount) >=
//           kotData?.total
//         ) {
//           paymentCompleted = true;
//         }
//       }

//       console.log("Generated Sale Number:", saleNumber);
//       console.log("party", selectedParty);

//       // 4) Example of saving sales
//       const savedVoucherData = await salesModel.create(
//         {
//           date: new Date(),
//           selectedDate: new Date().toLocaleDateString(),
//           voucherType: "sales",
//           serialNumber: saleNumber?.usedSeriesNumber,
//           userLevelSerialNumber: saleNumber?.usedSeriesNumber,
//           salesNumber: saleNumber?.voucherNumber,
//           series_id: specificVoucherSeries._id.toString(),
//           usedSeriesNumber: saleNumber?.currentNumber,
//           Primary_user_id: req.pUserId || req.owner,
//           kotId: kotData?._id,
//           cmp_id: cmp_id,
//           secondary_user_id: req.sUserId,
//           party: selectedParty,
//           items: kotData?.items,
//           address: kotData?.customer,
//           finalAmount: kotData?.total,
//           paymentSplittingData: {},
//         },
//         { session }
//       );
//       let paidAmount =
//         Number(paymentDetails?.cashAmount || 0) +
//         Number(paymentDetails?.onlineAmount || 0);
//       let pendingAmount =
//         Number(kotData?.total || 0) - Number(paymentDetails?.paidAmount || 0);
// if(pendingAmount > 0){
//       let createOutStanding = await TallyData.create(
//         {
//           Primary_user_id: req.pUserId || req.owner,
//           cmp_id: cmp_id,
//           party_id: selectedParty?._id,
//           party_name: selectedParty?.partyName,
//           mobile_no: selectedParty?.mobileNumber,
//           bill_date: new Date(),
//           bill_no: savedVoucherData?.salesNumber,
//           billId: savedVoucherData._id,
//           bill_amount: Number(kotData?.total || 0),
//           bill_pending_amt: pendingAmount,
//           accountGroup: selectedParty.accountGroup,
//           user_id: req.sUserId,
//           advanceAmount: paidAmount,
//           advanceDate: new Date(),
//           classification: "Cr",
//           source: "sales",
//         },
//         { session }
//       );
//     }
//       if (paymentDetails?.paymentMode == "single") {
//         ///save settlement data
//         await saveSettlementData(
//           selectedParty,
//           cmp_id,
//           "normal sale",
//           "sale",
//           savedVoucherData?.salesNumber,
//           savedVoucherData._id,
//           paidAmount,
//           updateData?.date,
//           selectedParty?.partyName,
//           session
//         );
//       } else {
//         await saveSettlementData(
//           selectedParty,
//           cmp_id,
//           "normal sale",
//           "sale",
//           savedVoucherData?.salesNumber,
//           savedVoucherData._id,
//           Number(paymentDetails?.cashAmount || 0),
//           updateData?.date,
//           selectedParty?.partyName,
//           session
//         );
//         ///save settlement data
//         await saveSettlementData(
//           selectedParty,
//           cmp_id,
//           "normal sale",
//           "sale",
//           savedVoucherData?.salesNumber,
//           savedVoucherData._id,
//           Number(paymentDetails?.onlineAmount || 0),
//           updateData?.date,
//           selectedParty?.partyName,
//           session
//         );
//       }

//       // 5) Update KOT payment status
//       const kot = await kotModal.updateOne(
//         { _id: kotId },
//         { paymentMethod: paymentMethod, paymentCompleted: paymentCompleted },
//         { session }
//       );

//       console.log("KOT updated:", kot);

//       // res.status(200).json({
//       //   success: true,
//       //   data: {
//       //     saleNumber,
//       //     salesRecord: saveSales,
//       //     kotUpdate: kot,
//       //   },
//       // });
//     });
//   } catch (error) {
//     console.error("Error updating KOT:", error);
//     res.status(500).json({
//       success: false,
//       message: error.message || "Internal server error while updating KOT",
//     });
//   } finally {
//     await session.endSession();
//   }
// };

export const updateKotPayment = async (req, res) => {
  const session = await mongoose.startSession();

  try {
    await session.withTransaction(async () => {
      const { cmp_id } = req.params;
      let {
        paymentMethod,
        paymentDetails,
        selectedKotData: kotData,
        isPostToRoom,
      } = req.body;

      console.log("table", kotData);

      if (!paymentDetails || !kotData) {
        throw new Error("Missing payment details or KOT data");
      }

      let paymentCompleted = false;

      // Determine payment method
      const cashAmt = Number(paymentDetails?.cashAmount || 0);
      const onlineAmt = Number(paymentDetails?.onlineAmount || 0);

      if (cashAmt > 0 && onlineAmt > 0) {
        paymentMethod = "mixed";
      }

      // Voucher series
      const specificVoucherSeries = await getRestaurantVoucherSeries(
        cmp_id,
        session
      );

      // Voucher number
      const saleNumber = await generateVoucherNumber(
        cmp_id,
        "sales",
        specificVoucherSeries._id.toString(),
        session
      );

      // Selected party
      const selectedParty = await getSelectedParty(
        cmp_id,
        paymentDetails,
        cashAmt,
        onlineAmt,
        kotData,
        isPostToRoom,
        session
      );

      // Payment splitting
      const paymentSplittingArray = createPaymentSplittingArray(
        paymentDetails,
        cashAmt,
        onlineAmt
      );

      const party = mapPartyData(selectedParty);

      // Save voucher
      const savedVoucherData = await createSalesVoucher(
        cmp_id,
        specificVoucherSeries,
        saleNumber,
        req,
        kotData,
        party,
        selectedParty,
        paymentSplittingArray,
        session
      );

      // Outstanding balance
      const paidAmount = isPostToRoom ? 0 : cashAmt + onlineAmt;
      const pendingAmount = Number(kotData?.total || 0) - paidAmount;

      if (pendingAmount > 0 && party?.paymentType == "party") {
        await createTallyEntry(
          cmp_id,
          req,
          selectedParty,
          kotData,
          savedVoucherData[0],
          paidAmount,
          pendingAmount,
          session
        );

      if (party?.paymentType != "party") {
        await saveSettlement(
          paymentDetails,
          selectedParty,
          cmp_id,
          savedVoucherData[0],
          paidAmount,
          cashAmt,
          onlineAmt,
          req,
          session
        );
      }
    }
      // Update KOTs
      paymentCompleted = true;
      let selectedTableNumber = [];

      await Promise.all(
        kotData?.voucherNumber.map(async (item) => {
          // Find the KOT first
          const kot = await kotModal.findById(item.id).lean();

          if (!selectedTableNumber.includes(kot?.tableNumber)) {
            selectedTableNumber.push(kot.tableNumber);
          }

          // Then update it
          return kotModal.updateOne(
            { _id: item.id },
            { paymentMethod, paymentCompleted },
            { session }
          );
        })
      );

      console.log("Selected Table Numbers:", selectedTableNumber);

      // Check pending
      for (const tableNumber of selectedTableNumber) {
        const pendingCount = await kotModal
          .countDocuments({
            "customer.tableNumber": tableNumber,
            paymentCompleted: false,
          })
          .session(session);

        console.log("pendingCount", pendingCount);
        console.log("kotData.tableNumber", kotData);

        if (pendingCount < 1) {
          const updateTableStatus = await Table.findOneAndUpdate(
            { cmp_id, tableNumber },
            { status: "available" },
            { new: true, session }
          );

          console.log("updated table", updateTableStatus);
        }
      }

      // ✅ No manual commit here
      res.status(200).json({
        success: true,
        message: "KOT payment updated successfully",
        data: { saleNumber, salesRecord: savedVoucherData[0] },
      });
    });
  } catch (error) {
    console.error("Error updating KOT:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Internal server error while updating KOT",
    });
  } finally {
    await session.endSession();
  }
};

async function getRestaurantVoucherSeries(cmp_id, session) {
  const SaleVoucher = await VoucherSeriesModel.findOne({
    cmp_id,
    voucherType: "sales",
  }).session(session);
  if (!SaleVoucher) throw new Error("Sale voucher not found");

  const specificVoucherSeries = SaleVoucher.series.find(
    (series) => series.under === "restaurant"
  );
  if (!specificVoucherSeries)
    throw new Error("No 'restaurant' voucher series found");

  return specificVoucherSeries;
}

async function getSelectedParty(
  cmp_id,
  paymentDetails,
  cashAmt,
  onlineAmt,
  kotData,
  isPostToRoom,
  session
) {
  let partyId;

  if (isPostToRoom) {
    console.log("koptData", kotData?.voucherNumber[0]?.checkInNumber);
    let checkInData = await CheckIn.findOne({
      voucherNumber: kotData?.voucherNumber[0]?.checkInNumber,
    }).session(session);
    console.log("checkInData", checkInData);
    partyId = checkInData?.customerId.toString();
    console.log("partyId", partyId);
  } else {
    if (paymentDetails?.paymentMode === "single") {
      if (cashAmt > 0) {
        partyId = paymentDetails?.selectedCash;
      } else if (onlineAmt > 0) {
        partyId = paymentDetails?.selectedBank;
      }
    } else {
      partyId = paymentDetails?.selectedCash;
    }
  }

  const selectedParty = await Party.findOne({ cmp_id, _id: partyId })
    .populate("accountGroup")
    .session(session);
  if (!selectedParty) throw new Error(`Party not found: ${partyName}`);

  return selectedParty;
}

function createPaymentSplittingArray(paymentDetails, cashAmt, onlineAmt) {
  const arr = [];
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
  kotData,
  party,
  selectedParty,
  paymentSplittingArray,
  session
) {
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
        items: kotData?.items,
        address: kotData?.customer,
        subTotal: kotData?.total,
        finalAmount: kotData?.total,
        paymentSplittingData: paymentSplittingArray,
        convertedFrom: kotData?.voucherNumber,
      },
    ],
    { session }
  );
}

async function createTallyEntry(
  cmp_id,
  req,
  selectedParty,
  kotData,
  savedVoucher,
  paidAmount,
  pendingAmount,
  session
) {
  await TallyData.create(
    [
      {
        Primary_user_id: req.pUserId || req.owner,
        cmp_id,
        party_id: selectedParty?._id,
        party_name: selectedParty?.partyName,
        mobile_no: selectedParty?.mobileNumber,
        bill_date: new Date(),
        bill_no: savedVoucher?.salesNumber,
        billId: savedVoucher?._id,
        bill_amount: kotData?.total || 0,
        bill_pending_amt: pendingAmount,
        accountGroup: selectedParty?.accountGroup,
        user_id: req.sUserId,
        advanceAmount: paidAmount,
        advanceDate: new Date(),
        classification: "Cr",
        source: "sales",
      },
    ],
    { session }
  );
}

async function saveSettlement(

  paymentDetails,
  selectedParty,
  cmp_id,
  savedVoucher,
  paidAmount,
  cashAmt,
  onlineAmt,
  req,
  session
) {
  console.log
  if (paymentDetails?.paymentMode === "single") {
    await saveSettlementData(
      selectedParty,
      cmp_id,
      "cash",
      "sale",
      savedVoucher?.salesNumber,
      savedVoucher?._id,
      paidAmount,
      new Date(),
      selectedParty?.partyName,
      req,
      session
    );
  } else {
    if (cashAmt > 0) {
      await saveSettlementData(
        selectedParty,
        cmp_id,
        "cash",
        "sale",
        savedVoucher?.salesNumber,
        savedVoucher?._id,
        cashAmt,
        new Date(),
        selectedParty?.partyName,
        req,
        session
      );
    }
    if (onlineAmt > 0) {
      await saveSettlementData(
        selectedParty,
        cmp_id,
        "bank",
        "sale",
        savedVoucher?.salesNumber,
        savedVoucher?._id,
        onlineAmt,
        new Date(),
        selectedParty?.partyName,
        req,
        session
      );
    }
  }
}

// function used to fetch bank and cash online details
export const getPaymentType = async (req, res) => {
  try {
    const bankDetails = await Party.find({
      cmp_id: req.params.cmp_id,
      partyType: "bank",
    });
    const cashDetails = await Party.find({
      cmp_id: req.params.cmp_id,
      partyType: "cash",
    });
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

// function used to fetch sale data for print
export const getSalePrintData = async (req, res) => {
  try {
    const salesData = await salesModel.findOne({
      cmp_id: req.params.cmp_id,
      convertedFrom: {
        $elemMatch: { id: req.params.kotId },
      },
    });

    if (!salesData) {
      return res.status(404).json({
        success: false,
        message: "No sales record found",
      });
    }

    res.status(200).json({
      success: true,
      data: salesData,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Internal server error while fetching sales details",
      error: error.message,
    });
  }
};
// controllers/tableController.js

export const saveTableNumber = async (req, res) => {
  try {
    const { cmp_id } = req.params;
    const { tableNumber, status, description } = req.body;

    if (!tableNumber) {
      return res.status(400).json({ message: "Table number is required" });
    }

    const newTable = new Table({
      cmp_id,
      tableNumber,
      description,
      status: status || "available",
    });

    await newTable.save();

    res.status(201).json({
      message: "Table number saved successfully",
      table: newTable,
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
      return res
        .status(400)
        .json({ success: false, message: "Company ID is required" });
    }

    // Fetch tables filtered by company ID from database
    const tables = await Table.find({ cmp_id: cmp_id });
    res.status(200).json({
      success: true,
      tables, // array of table documents with fields like _id, tableNumber etc.
    });
  } catch (error) {
    console.error("Error fetching tables:", error);
    res
      .status(500)
      .json({ success: false, message: "Server error getting tables" });
  }
};

export const updateTable = async (req, res) => {
  try {
    const { id } = req.params;
    const { tableNumber, description } = req.body;

    if (!id) {
      return res
        .status(400)
        .json({ success: false, message: "Table ID is required" });
    }

    if (!tableNumber) {
      return res
        .status(400)
        .json({ success: false, message: "Table number is required" });
    }

    // Check if table exists
    const existingTable = await Table.findById(id);
    if (!existingTable) {
      return res
        .status(404)
        .json({ success: false, message: "Table not found" });
    }

    // Check if the new table number already exists for this company (excluding current table)
    const duplicateTable = await Table.findOne({
      companyId: existingTable.companyId,
      tableNumber: tableNumber.trim(),
      _id: { $ne: id },
    });

    if (duplicateTable) {
      return res.status(409).json({
        success: false,
        message: "Table number already exists",
      });
    }

    // Update table
    const updatedTable = await Table.findByIdAndUpdate(
      id,
      {
        tableNumber: tableNumber.trim(),
        description: description.trim(),
        updatedAt: new Date(),
      },
      { new: true, runValidators: true }
    );

    res.status(200).json({
      success: true,
      message: "Table updated successfully",
      table: updatedTable,
    });
  } catch (error) {
    console.error("Error updating table:", error);

    if (error.name === "ValidationError") {
      return res.status(400).json({
        success: false,
        message: "Validation error",
        errors: error.errors,
      });
    }

    if (error.name === "CastError") {
      return res.status(400).json({
        success: false,
        message: "Invalid table ID format",
      });
    }

    res
      .status(500)
      .json({ success: false, message: "Server error updating table" });
  }
};

// DELETE - Delete a table
export const deleteTable = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res
        .status(400)
        .json({ success: false, message: "Table ID is required" });
    }

    // Check if table exists
    const existingTable = await Table.findById(id);
    if (!existingTable) {
      return res
        .status(404)
        .json({ success: false, message: "Table not found" });
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
      message: "Table deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting table:", error);

    if (error.name === "CastError") {
      return res.status(400).json({
        success: false,
        message: "Invalid table ID format",
      });
    }

    res
      .status(500)
      .json({ success: false, message: "Server error deleting table" });
  }
};
export const updateTableStatus = async (req, res) => {
  try {
    const { cmp_id } = req.params;
    const { tableNumber, status } = req.body;

    if (!tableNumber || !status) {
      return res
        .status(400)
        .json({ message: "Table number and status are required" });
    }

    const table = await Table.findOneAndUpdate(
      { cmp_id, tableNumber },
      { $set: { status } },
      { new: true }
    );

    if (!table) {
      return res.status(404).json({ message: "Table not found" });
    }

    res.json({ message: "Table status updated", table });
  } catch (error) {
    console.error("Error updating table status:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

export const getKotDataByTable = async (req, res) => {
  try {
    const { cmp_id } = req.params;
    const { tableNumber, status } = req.query;

    const filter = { cmp_id };
    if (tableNumber) {
      filter.tableNumber = tableNumber;
    }
    if (status) {
      filter.status = status;
    }

    console.log("filter", filter);

    const kots = await kotModal.find(filter).sort({ createdAt: -1 });
    res.json({ success: true, data: kots });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const updateConfigurationForKotApproval = async (req, res) => {
  try {
    const { cmp_id } = req.params;
    const data = req.body;

    // update object
    const updateData = {
      $set: {
        [`configurations.0.kotAutoApproval`]: data?.checked,
      },
    };

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

