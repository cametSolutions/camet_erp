import mongoose from "mongoose";
import Item from "../models/restaurantModels.js"; // Adjust path as needed
import hsnModel from "../models/hsnModel.js";
import product from "../models/productModel.js";
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
      .findOne({ hsn: formData.hsn })
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
        hsn_code: formData.hsn,
        cgst: formData.cgst,
        sgst: formData.sgst,
        igst: formData.igst,
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
      const { id: kotId, cmp_id } = req.params;
      let {
        paymentMethod,
        paymentDetails,
        selectedKotData: kotData,
      } = req.body;
      let paymentCompleted = false;

      // Determine payment method
      if (paymentDetails?.cashAmount > 0 && paymentDetails?.onlineAmount > 0) {
        paymentMethod = "mixed";
      }

      // 1) Fetch sales voucher series
      const SaleVoucher = await VoucherSeriesModel.findOne({
        cmp_id,
        voucherType: "sales",
      }).session(session);

      if (!SaleVoucher) throw new Error("Sale voucher not found");

      // 2) Get 'restaurant' voucher series
      const specificVoucherSeries = SaleVoucher.series.find(
        (series) => series.under === "restaurant"
      );
      if (!specificVoucherSeries)
        throw new Error("No 'restaurant' voucher series found");

      // 3) Generate voucher number
      const saleNumber = await generateVoucherNumber(
        cmp_id,
        "sales",
        specificVoucherSeries._id.toString(),
        session
      );

      // 4) Determine selected party and payment completion
      let selectedParty;
      const cashAmt = Number(paymentDetails?.cashAmount || 0);
      const onlineAmt = Number(paymentDetails?.onlineAmount || 0);

      if (paymentDetails?.paymentMode === "single") {
        paymentCompleted = true;
        if (cashAmt > 0) {
          selectedParty = await Party.findOne({
            cmp_id,
            partyName: paymentDetails?.selectedCash?.cash_ledname,
          })
            .populate("accountGroup")
            .session(session);
        } else if (onlineAmt > 0) {
          selectedParty = await Party.findOne({
            cmp_id,
            partyName: paymentDetails?.selectedBank?.bank_ledname,
          })
            .populate("accountGroup")
            .session(session);
        }
      } else {
        selectedParty = await Party.findOne({
          cmp_id,
          partyName: paymentDetails?.selectedCash?.cash_ledname,
        })
          .populate("accountGroup")
          .session(session);
        if (cashAmt + onlineAmt >= kotData?.total) {
          paymentCompleted = true;
        }
      }

      console.log("selectedParty", selectedParty);

      let paymentSplittingData = {
        cashAmount: cashAmt,
        onlineAmount: onlineAmt,
        selectedCash: paymentDetails?.selectedCash,
        selectedBank: paymentDetails?.selectedBank,
        paymentMode: paymentDetails?.paymentMode,
      };

      let party = {
        _id: selectedParty._id,
        partyName: selectedParty.partyName,
        accountGroup_id: selectedParty.accountGroup?._id, // already ObjectId
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
      // 5) Save sales voucher
      const savedVoucherData = await salesModel.create(
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
            kotId: kotData?._id,
            cmp_id,
            secondary_user_id: req.sUserId,
            party,
            partyAccount: selectedParty.accountGroup?.accountGroup,

            items: kotData?.items,
            address: kotData?.customer,
            finalAmount: kotData?.total,
            paymentSplittingData: paymentSplittingData,
          },
        ],
        { session }
      );

      // 6) Handle outstanding balance
      const paidAmount = cashAmt + onlineAmt;
      const pendingAmount = Number(kotData?.total || 0) - paidAmount;

      if (pendingAmount > 0) {
        await TallyData.create(
          [
            {
              Primary_user_id: req.pUserId || req.owner,
              cmp_id,
              party_id: selectedParty?._id,
              party_name: selectedParty?.partyName,
              mobile_no: selectedParty?.mobileNumber,
              bill_date: new Date(),
              bill_no: savedVoucherData[0]?.salesNumber,
              billId: savedVoucherData[0]?._id,
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

      // 7) Save settlement data
      if (paymentDetails?.paymentMode === "single") {
        await saveSettlementData(
          party,
          cmp_id,
          "normal sale",
          "sale",
          savedVoucherData[0]?.salesNumber,
          savedVoucherData[0]?._id,
          paidAmount,
          new Date(),
          selectedParty?.partyName,
          session
        );
      } else {
        // Cash part
        if (cashAmt > 0) {
          await saveSettlementData(
            selectedParty,
            cmp_id,
            "normal sale",
            "sale",
            savedVoucherData[0]?.salesNumber,
            savedVoucherData[0]?._id,
            cashAmt,
            new Date(),
            selectedParty?.partyName,
            session
          );
        }
        // Online part
        if (onlineAmt > 0) {
          await saveSettlementData(
            selectedParty,
            cmp_id,
            "normal sale",
            "sale",
            savedVoucherData[0]?.salesNumber,
            savedVoucherData[0]?._id,
            onlineAmt,
            new Date(),
            selectedParty?.partyName,
            session
          );
        }
      }

      // 8) Update KOT payment status
      await kotModal.updateOne(
        { _id: kotId },
        { paymentMethod, paymentCompleted },
        { session }
      );

      res.status(200).json({
        success: true,
        message: "KOT payment updated successfully",
        data: {
          saleNumber,
          salesRecord: savedVoucherData[0],
        },
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

// function used to fetch sale data for print
export const getSalePrintData = async (req, res) => {
  try {
    const salesData = await salesModel.findOne({
      cmp_id: req.params.cmp_id,
      kotId: req.params.kotId,
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
    const tables = await Table.find({ companyId: cmp_id }).sort({
      tableNumber: 1,
    });

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
