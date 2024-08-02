import SecondaryUser from "../models/secondaryUserModel.js";
import generateSecToken from "../utils/generateSecondaryToken.js";
import TallyData from "../models/TallyData.js";
import TransactionModel from "../models/TransactionModel.js";
import BankDetails from "../models/bankModel.js";
import generateNumericOTP from "../utils/generateOtp.js";
import nodemailer from "nodemailer";
import PartyModel from "../models/partyModel.js";
import productModel from "../models/productModel.js";
import invoiceModel from "../models/invoiceModel.js";
import HsnModel from "../models/hsnModel.js";
import OragnizationModel from "../models/OragnizationModel.js";
import Organization from "../models/OragnizationModel.js";
import AdditionalChargesModel from "../models/additionalChargesModel.js";
import { truncateToNDecimals } from "../helpers/helper.js";
import { Brand } from "../models/subDetails.js";
import { Category } from "../models/subDetails.js";
import { Subcategory } from "../models/subDetails.js";
import { Godown } from "../models/subDetails.js";
import { PriceLevel } from "../models/subDetails.js";

import bcrypt from "bcryptjs";
import mongoose from "mongoose";
import salesModel from "../models/salesModel.js";
import vanSaleModel from "../models/vanSaleModel.js";
import purchaseModel from "../models/purchaseModel.js";
import {
  deleteItemsInSaleEdit,
  deleteGodownsOrBatchesInSaleEdit,
  updateSaleableStock,
  addingAnItemInSale,
  addingNewBatchesOrGodownsInSale,
  calculateUpdatedItemValues,
  updateAdditionalChargeInSale,
  deleteItemsInSaleOrderEdit,
  addingAnItemInSaleOrderEdit,
  extractCentralNumber,
  checkForNumberExistence,
} from "../helpers/secondaryHelper.js";

import {
  processStockTransfer,
  handleStockTransfer,
  revertStockTransfer,
  increaseStockTransferNumber,
} from "../helpers/stockTranferHelper.js";
import stockTransferModel from "../models/stockTransferModel.js";

// @desc Login secondary user
// route POST/api/sUsers/login

export const login = async (req, res) => {
  const { email, password } = req.body;

  try {
    let secUser;
    // Check if the provided email looks like an email address
    if (email.includes("@")) {
      // If it's an email address, find the user by email
      secUser = await SecondaryUser.findOne({ email: email });
    } else {
      // If it's not an email address, assume it's a mobile number and find the user by mobile number
      secUser = await SecondaryUser.findOne({ mobile: email });
    }

    if (!secUser) {
      return res.status(404).json({ message: "Invalid User" });
    }
    const Blocked = secUser.get("isBlocked");
    console.log(Blocked);
    if (Blocked == true) {
      return res.status(401).json({ message: "User is blocked" });
    }

    if (secUser.isApproved === false) {
      return res.status(401).json({ message: "User approval is pending" });
    }

    if (secUser.isBlocked) {
      return res.status(401).json({ message: "User is blocked" });
    }

    const isPasswordMatch = await bcrypt.compare(password, secUser.password);

    if (!isPasswordMatch) {
      return res.status(400).json({ message: "Invalid email or password" });
    }

    const { name, _id, mobile } = secUser._doc;

    const token = generateSecToken(res, secUser._id);

    return res.status(200).json({
      message: "Login successful",
      token,
      data: { email, name, _id, mobile },
    });
  } catch (error) {
    return res.status(500).json({ status: false, message: "Failed to login!" });
  }
};

// @desc get secuser user data for sidebar
// route GET/api/sUsers/getSecUserData

export const getSecUserData = async (req, res) => {
  const userId = req.sUserId;
  try {
    const userData = await SecondaryUser.findById(userId).populate({
      path: "organization",
      // select: "_id name",
    });
    if (userData) {
      return res
        .status(200)
        .json({ message: "secondaryUSerData fetched", data: { userData } });
    } else {
      return res
        .status(404)
        .json({ message: "secondaryUSerData not found", data: { userData } });
    }
  } catch (error) {
    return res
      .status(500)
      .json({ status: false, message: "internal sever error" });
  }
};

// @desc get outstanding data from tally
// route GET/api/sUsers/fetchOutstanding

export const fetchOutstandingTotal = async (req, res) => {
  const cmp_id = req.params.cmp_id;
  const Primary_user_id = req.owner.toString();

  try {
    // const tallyData = await TallyData.find({ Primary_user_id: userId });
    const outstandingData = await TallyData.aggregate([
      { $match: { cmp_id: cmp_id, Primary_user_id: Primary_user_id } },
      {
        $group: {
          _id: "$party_id",
          totalBillAmount: { $sum: "$bill_pending_amt" },
          party_name: { $first: "$party_name" },
          cmp_id: { $first: "$cmp_id" },
          user_id: { $first: "$user_id" },
        },
      },
    ]);

    outstandingData.sort((a, b) => a.party_name.localeCompare(b.party_name));

    if (outstandingData) {
      return res.status(200).json({
        outstandingData: outstandingData,
        message: "tallyData fetched",
      });
    } else {
      return res
        .status(404)
        .json({ message: "No outstandingData were found for user" });
    }
  } catch (error) {
    return res
      .status(500)
      .json({ success: false, message: "Internal server error, try again!" });
  }
};

// @desc get outstanding data from tally
// route GET/api/sUsers/fetchOutstandingDetails

export const fetchOutstandingDetails = async (req, res) => {
  const partyId = req.params.party_id;
  const cmp_id = req.params.cmp_id;
  try {
    const outstandings = await TallyData.find({
      party_id: partyId,
      cmp_id: cmp_id,
      bill_pending_amt: { $gt: 0 },
    }).sort({ bill_date: 1 });
    if (outstandings) {
      return res.status(200).json({
        outstandings: outstandings,
        message: "outstandings fetched",
      });
    } else {
      return res
        .status(404)
        .json({ message: "No outstandings were found for user" });
    }
  } catch (error) {
    return res
      .status(500)
      .json({ success: false, message: "Internal server error, try again!" });
  }
};

// @desc confirm collection and alter db
// route GET/api/sUsers/confirmCollection

export const confirmCollection = async (req, res) => {
  const {
    collectionDetails,
    PaymentMethod,
    paymentDetails,
    agentName,
    agentId,
  } = req.body;
  const paymentMethod = PaymentMethod;

  const {
    party_id,
    party_name,
    totalBillAmount,
    cmp_id,
    billData,
    enteredAmount,
  } = collectionDetails;

  try {
    const outstandingData = await TallyData.find({
      cmp_id: collectionDetails.cmp_id,
      bill_no: { $in: collectionDetails.billData.map((bill) => bill.billNo) },
    });

    if (outstandingData.length > 0) {
      const bulkUpdateOperations = outstandingData.map((doc, index) => ({
        updateOne: {
          filter: {
            _id: doc._id,
          },
          update: {
            $set: {
              bill_pending_amt:
                collectionDetails.billData[index].remainingAmount,
            },
          },
        },
      }));

      await TallyData.bulkWrite(bulkUpdateOperations);

      const transaction = new TransactionModel({
        party_id,
        party_name,
        totalBillAmount,
        cmp_id,
        billData,
        paymentMethod,
        enteredAmount,
        paymentDetails,
        agentName,
        agentId,
      });

      const savedTransaction = await transaction.save();

      res.status(200).json({
        message: "Your Collection is confirmed",
        id: savedTransaction._id,
      });
    } else {
      console.log("No matching documents found for the given criteria");
    }
  } catch (error) {
    console.error("Error updating documents:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

// @desc logout
// route GET/api/sUsers/logout

export const logout = async (req, res) => {
  try {
    // Clear the JWT cookie
    res.cookie("jwt_secondary", "", {
      httpOnly: true,
      expires: new Date(0),
    });

    // Send a response indicating successful logout
    res.status(200).json({ message: "Logout successful" });
  } catch (error) {
    // Handle errors
    console.error("Error during logout:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

// @desc get transactions
// route GET/api/sUsers/transactions

export const transactions = async (req, res) => {
  const userId = req.sUserId;
  const cmp_id = req.params.cmp_id;

  try {
    const transactions = await TransactionModel.aggregate([
      { $match: { agentId: userId, cmp_id: cmp_id } },
      {
        $project: {
          _id: 1,
          party_id: 1,
          party_name: 1,
          enteredAmount: 1,
          isCancelled: 1,
          createdAt: 1,
          // totalBillAmount: 1,
          cmp_id: 1,
          type: "Receipt",

          // billNo: "$billData.billNo",
          // settledAmount: "$billData.settledAmount",
          // remainingAmount: "$billData.remainingAmount",
          // paymentMethod: 1,
          // paymentDetails: 1,
          // agentName: 1,
          // agentId: 1,
        },
      },
      { $sort: { createdAt: -1 } },
    ]);

    const invoices = await invoiceModel.aggregate([
      { $match: { Secondary_user_id: userId, cmp_id: cmp_id } },
      {
        $project: {
          party_name: "$party.partyName",
          // mobileNumber:"$party.mobileNumber",
          type: "Sale Order",
          enteredAmount: "$finalAmount",
          createdAt: 1,
          itemsLength: { $size: "$items" },
        },
      },
    ]);

    const sales = await salesModel.aggregate([
      { $match: { Secondary_user_id: userId, cmp_id: cmp_id } },
      {
        $project: {
          party_name: "$party.partyName",
          // mobileNumber:"$party.mobileNumber",
          type: "Tax Invoice",
          enteredAmount: "$finalAmount",
          createdAt: 1,
          itemsLength: { $size: "$items" },
        },
      },
    ]);

    const vanSales = await vanSaleModel.aggregate([
      { $match: { Secondary_user_id: userId, cmp_id: cmp_id } },
      {
        $project: {
          party_name: "$party.partyName",
          // mobileNumber:"$party.mobileNumber",
          type: "Van Sale",
          enteredAmount: "$finalAmount",
          createdAt: 1,
          itemsLength: { $size: "$items" },
        },
      },
    ]);

    const purchases = await purchaseModel.aggregate([
      { $match: { Secondary_user_id: userId, cmp_id: cmp_id } },
      {
        $project: {
          party_name: "$party.partyName",
          // mobileNumber:"$party.mobileNumber",
          type: "Purchase",
          enteredAmount: "$finalAmount",
          createdAt: 1,
          itemsLength: { $size: "$items" },
        },
      },
    ]);
    const stockTransfer = await stockTransferModel.aggregate([
      { $match: { Secondary_user_id: userId, cmp_id: cmp_id } },
      {
        $project: {
          party_name: "$selectedGodown",
          // mobileNumber:"$party.mobileNumber",
          type: "Stock Transfer",
          enteredAmount: "$finalAmount",
          createdAt: 1,
          itemsLength: { $size: "$items" },
        },
      },
    ]);

    const combined = [
      ...transactions,
      ...invoices,
      ...sales,
      ...purchases,
      ...vanSales,
      ...stockTransfer,
    ];
    combined.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    if (combined.length > 0) {
      return res.status(200).json({
        message: "Transactions fetched",
        data: { combined },
      });
    } else {
      return res.status(404).json({ message: "Transactions not found" });
    }
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      status: false,
      message: "Internal server error",
    });
  }
};

// @desc for cancelling transactions
// route GET/api/sUsers/cancelTransaction

export const cancelTransaction = async (req, res) => {
  try {
    const transactionId = new mongoose.Types.ObjectId(req.params.id);

    const transactions = await TransactionModel.aggregate([
      { $match: { _id: transactionId } },
      { $unwind: "$billData" },
      {
        $project: {
          _id: 0,
          billNo: "$billData.billNo",
          currentAmount: {
            $sum: ["$billData.settledAmount", "$billData.remainingAmount"],
          },
        },
      },
    ]);

    for (const { billNo, currentAmount } of transactions) {
      await TallyData.updateOne(
        { bill_no: billNo },
        { $set: { bill_pending_amt: currentAmount } }
      );
    }

    await TransactionModel.updateOne(
      { _id: transactionId },
      { $set: { isCancelled: true } }
    );

    res
      .status(200)
      .json({ success: true, message: "Transaction canceled successfully" });
  } catch (error) {
    console.error("Error canceling transaction:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

// @desc fetch banks for payment page
// route GET/api/sUsers/fetchBanks/:cmp_id

export const fetchBanks = async (req, res) => {
  const bankId = req.params.cmp_id;
  try {
    const bankData = await BankDetails.aggregate([
      { $match: { cmp_id: bankId } },
      {
        $project: {
          bank_name: 1,
          bank_ledname: 1,
        },
      },
    ]);

    if (bankData.length > 0) {
      return res
        .status(200)
        .json({ message: "bankData fetched", data: bankData });
    } else {
      return res.status(404).json({ message: "Bank data not found" });
    }
  } catch (error) {
    return res
      .status(500)
      .json({ status: false, message: "Internal server error" });
  }
};

// @desc send otp for forgot password
// route GET/api/sUsers/fetchBanks/:cmp_id

export const sendOtp = async (req, res) => {
  const { email } = req.body;

  try {
    const validEmail = await SecondaryUser.findOne({ email: email });
    if (!validEmail) {
      return res.status(400).json({ message: "Enter the registered email " });
    }

    const otp = generateNumericOTP(6);

    // Save OTP in the database
    const saveOtp = await SecondaryUser.updateOne({ email }, { $set: { otp } });

    // Create Nodemailer transporter
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: "solutions@camet.in",
        pass: "gerjssfiitsgidaq",
      },
    });

    // Email message for password reset
    const mailOptions = {
      from: "solutions@camet.in",
      to: email,
      subject: "Password Reset OTP - Camet IT Solutions",
      text: `Dear User,\n\nYou have requested to reset your password for Camet IT Solutions account.\n\nYour OTP for password reset is: ${otp}\n\nIf you didn't request this, please ignore this email.\n\nThank you,\nCamet IT Solutions`,
    };

    // Send the email
    transporter.sendMail(mailOptions, function (error, info) {
      if (error) {
        return res.status(500).json({ error: "Error sending email" });
      } else {
        return res
          .status(200)
          .json({ message: "OTP sent successfully", data: otp });
      }
    });
  } catch (error) {
    return res.status(500).json({ error: "Internal server error" });
  }
};

// @desc check otp
//  route POST/api/sUsers/submitOtp

export const submitOtp = async (req, res) => {
  const { Otp, otpEmailSec } = req.body;

  try {
    // Retrieve user data based on the provided email
    const user = await SecondaryUser.findOne({ email: otpEmailSec });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Check if the user has an OTP and if it matches the submitted OTP
    if (user.otp !== parseInt(Otp)) {
      return res.status(400).json({ message: "Invalid OTP" });
    }

    // // Check if the OTP has expired
    // if (user.otpExpiration && user.otpExpiration < Date.now()) {
    //   return res.status(400).json({ message: 'OTP has expired' });
    // }

    // If all checks pass, you can consider the OTP valid
    return res.status(200).json({ message: "OTP is valid" });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Internal server error" });
  }
};

// @desc reset password
// route POST/api/sUsers/resetPassword

export const resetPassword = async (req, res) => {
  const { password, otpEmailSec } = req.body;

  try {
    // Retrieve user data based on the provided email
    const user = await SecondaryUser.findOne({ email: otpEmailSec });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Update the user's password
    user.password = password;

    // Save the updated user data
    await user.save();

    return res.status(200).json({ message: "Password reset successful" });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Internal server error" });
  }
};

// @desc to get the details of transaction or receipt
// route GET/api/sUsers/getTransactionDetails

export const getTransactionDetails = async (req, res) => {
  const receiptId = req.params.id;

  try {
    const receiptDetails = await TransactionModel.findById(receiptId);

    if (receiptDetails) {
      res
        .status(200)
        .json({ message: "reception details fetched", data: receiptDetails });
    } else {
      res.status(404).json({ error: "Receipt not found" });
    }
  } catch (error) {
    console.error("Error fetching receipt details:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

// @desc get party list
// route get/api/pUsers/PartyList;

export const PartyList = async (req, res) => {
  const cmp_id = req.params.cmp_id;
  const Primary_user_id = req.owner;
  const secUserId = req.sUserId;
  try {
    const partyList = await PartyModel.find({
      cmp_id: cmp_id,
      Primary_user_id: Primary_user_id,
    });

    const secUser = await SecondaryUser.findById(secUserId);
    if (!secUser) {
      return res.status(404).json({ message: "Secondary user not found" });
    }

    const configuration = secUser.configurations.find(
      (item) => item.organization == cmp_id
    );

    let vanSaleConfig = false;
    if (configuration) {
      const { vanSale } = configuration;
      vanSaleConfig = vanSale;
    }

    if (partyList) {
      res.status(200).json({
        message: "parties fetched",
        partyList: partyList,
        vanSale: vanSaleConfig,
      });
    } else {
      res.status(404).json({ message: "No parties found" });
    }
  } catch (error) {
    res
      .status(500)
      .json({ success: false, message: "Internal server error, try again!" });
  }
};

// @desc adding new Party
// route POst/api/pUsers/addParty
export const addParty = async (req, res) => {
  try {
    const {
      cpm_id: cmp_id,
      // Secondary_user_id,
      accountGroup,
      partyName,
      mobileNumber,
      emailID,
      gstNo,
      panNo,
      billingAddress,
      shippingAddress,
      creditPeriod,
      creditLimit,
      openingBalanceType,
      openingBalanceAmount,
    } = req.body;

    const Secondary_user_id = req?.sUserId;

    const Primary_user = await SecondaryUser.findById(Secondary_user_id);
    const Primary_user_id = await Primary_user.primaryUser;

    const party = new PartyModel({
      cmp_id,
      Primary_user_id: req.owner,
      Secondary_user_id: req.sUserId,
      accountGroup,
      partyName,
      mobileNumber,
      emailID,
      gstNo,
      panNo,
      billingAddress,
      shippingAddress,
      creditPeriod,
      creditLimit,
      openingBalanceType,
      openingBalanceAmount,
    });

    const result = await party.save();

    if (result) {
      return res.status(200).json({
        success: true,
        message: "Party added successfully",
      });
    } else {
      return res.status(400).json({
        success: false,
        message: "Party adding failed",
      });
    }
  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .json({ success: false, message: "Internal server error, try again!" });
  }
};

// @desc getting product list
// route get/api/pUsers/

export const getProducts = async (req, res) => {
  const Secondary_user_id = req.sUserId;
  const cmp_id = req.params.cmp_id;

  const vanSaleQuery = req.query.vanSale;
  const isVanSale = vanSaleQuery === "true";

  const excludeGodownId = req.query.excludeGodownId;

  console.log("isVanSale", isVanSale);
  console.log("excludeGodownId", excludeGodownId);
  const Primary_user_id = new mongoose.Types.ObjectId(req.owner);

  try {
    const secUser = await SecondaryUser.findById(Secondary_user_id);

    if (!secUser) {
      return res.status(404).json({ message: "Secondary user not found" });
    }

    const configuration = secUser.configurations.find(
      (item) => item.organization == cmp_id
    );

    let matchStage = {
      $match: {
        cmp_id: cmp_id,
        Primary_user_id: Primary_user_id,
      },
    };

    let selectedGodowns;
    if (isVanSale && configuration?.selectedVanSaleGodowns.length > 0) {
      selectedGodowns = configuration.selectedVanSaleGodowns;
    } else if (!isVanSale && configuration && configuration.selectedGodowns) {
      selectedGodowns = configuration.selectedGodowns;
    }

    console.log("selectedGodowns", selectedGodowns);

    let projectStage = {
      $project: {
        product_name: 1,
        cmp_id: 1,
        product_code: 1,
        balance_stock: 1,
        Primary_user_id: 1,
        brand: 1,
        category: 1,
        sub_category: 1,
        unit: 1,
        alt_unit: 1,
        unit_conversion: 1,
        alt_unit_conversion: 1,
        hsn_code: 1,
        purchase_price: 1,
        purchase_cost: 1,
        Priceleveles: 1,
        cgst: 1,
        sgst: 1,
        igst: 1,
        cess: 1,
        addl_cess: 1,
        state_cess: 1,
        product_master_id: 1,
        __v: 1,
        GodownList: 1,
      },
    };

    if (selectedGodowns && selectedGodowns.length > 0) {
      console.log("selectedGodowns", selectedGodowns);

      matchStage.$match["GodownList.godown_id"] = { $in: selectedGodowns };

      projectStage.$project.GodownList = {
        $filter: {
          input: "$GodownList",
          as: "godown",
          cond: { $in: ["$$godown.godown_id", selectedGodowns] },
        },
      };
    }

    if (excludeGodownId) {
      projectStage.$project.GodownList = {
        $filter: {
          input: "$GodownList",
          as: "godown",
          cond: { $ne: ["$$godown.godown_id", excludeGodownId] },
        },
      };
    }

    const addFieldsStage = {
      $addFields: {
        hasGodownOrBatch: {
          $anyElementTrue: {
            $map: {
              input: "$GodownList",
              as: "godown",
              in: {
                $or: [
                  { $ifNull: ["$$godown.godown", false] },
                  { $ifNull: ["$$godown.batch", false] },
                ],
              },
            },
          },
        },
      },
    };

    // Add a new stage to filter out products with empty GodownList
    const filterEmptyGodownListStage = {
      $match: {
        $expr: {
          $cond: {
            if: { $eq: [excludeGodownId, null] },
            then: { $gt: [{ $size: "$GodownList" }, 0] },
            else: {
              $and: [
                { $gt: [{ $size: "$GodownList" }, 0] },
                {
                  $anyElementTrue: {
                    $map: {
                      input: "$GodownList",
                      as: "godown",
                      in: {
                        $and: [
                          { $ifNull: ["$$godown.godown", false] },
                          { $ifNull: ["$$godown.godown_id", false] },
                        ],
                      },
                    },
                  },
                },
              ],
            },
          },
        },
      },
    };

    const aggregationPipeline = [
      matchStage,
      projectStage,
      addFieldsStage,
      filterEmptyGodownListStage,
    ];

    const products = await productModel.aggregate(aggregationPipeline);

    if (products && products.length > 0) {
      return res.status(200).json({
        productData: products,
        message: "Products fetched",
      });
    } else {
      return res.status(404).json({ message: "No products were found" });
    }
  } catch (error) {
    console.log(error);
    return res
      .status(500)
      .json({ success: false, message: "Internal server error, try again!" });
  }
};

// route POST /api/pUsers/createInvoice
export const createInvoice = async (req, res) => {
  const Secondary_user_id = req.sUserId;
  const owner = req.owner.toString();

  try {
    const {
      orgId,
      party,
      items,
      priceLevelFromRedux,
      additionalChargesFromRedux,
      lastAmount,
      orderNumber,
      despatchDetails,
      selectedDate,
    } = req.body;

    const NumberExistence = await checkForNumberExistence(
      invoiceModel,
      "orderNumber",
      orderNumber,
      orgId
    );

    if (NumberExistence) {
      return res.status(400).json({
        message: "SaleOrder with the same number already exists",
      });
    }

    // Manually fetch the last invoice to get the serial number
    const lastInvoice = await invoiceModel.findOne(
      {},
      {},
      { sort: { serialNumber: -1 } }
    );

    let newSerialNumber = 1;

    // Check if there's a last invoice and calculate the new serial number
    if (lastInvoice && !isNaN(lastInvoice.serialNumber)) {
      newSerialNumber = lastInvoice.serialNumber + 1;
    }

    const updatedItems = items.map(async (item) => {
      // Find the corresponding price rate for the selected price level
      const selectedPriceLevel = item.Priceleveles.find(
        (priceLevel) => priceLevel.pricelevel === priceLevelFromRedux
      );
      // If a corresponding price rate is found, assign it to selectedPrice, otherwise assign null
      const selectedPrice = item?.selectedPriceRate || 0;
      // Calculate total price after applying discount
      let totalPrice = selectedPrice * (item.count || 1) || 0;
      if (
        item.discount !== 0 &&
        item.discount !== undefined &&
        item.discount !== ""
      ) {
        // If discount is present (amount), subtract it from the total price
        totalPrice -= item.discount;
      } else if (
        item.discountPercentage !== 0 &&
        item.discountPercentage !== undefined &&
        item.discountPercentage !== ""
      ) {
        // If discount is present (percentage), calculate the discount amount and subtract it from the total price
        const discountAmount = (totalPrice * item.discountPercentage) / 100;
        totalPrice -= discountAmount;
      }

      const itemCount = parseFloat(item.count);
      let product = await productModel.findById(item._id); // Assuming you have a productId in the item object
      if (!product) {
        throw new Error(`Product with ID ${item._id} not found`);
      }
      const productBalanceStock = parseFloat(product.balance_stock) || 0; // Consider balance_stock as zero if null
      const newBalanceStock = truncateToNDecimals(
        productBalanceStock - itemCount,
        3
      );

      await productModel.updateOne(
        { _id: product._id },
        { $set: { balance_stock: newBalanceStock } }
      );

      // Calculate tax amounts
      const { cgst, sgst, igst } = item;
      const cgstAmt = (totalPrice * cgst) / 100;
      const sgstAmt = (totalPrice * sgst) / 100;
      const igstAmt = (totalPrice * igst) / 100;

      return {
        ...item,
        selectedPrice: selectedPrice,
        cgstAmt: parseFloat(cgstAmt.toFixed(2)),
        sgstAmt: parseFloat(sgstAmt.toFixed(2)),
        igstAmt: parseFloat(igstAmt.toFixed(2)),
        subTotal: totalPrice, // Optional: Include total price in the item object
      };
    });

    const updatedItemsResults = await Promise.all(updatedItems);

    let updateAdditionalCharge;
    if (additionalChargesFromRedux.length > 0) {
      updateAdditionalCharge = additionalChargesFromRedux.map((charge) => {
        const { value, taxPercentage } = charge;

        const taxAmt = (parseFloat(value) * parseFloat(taxPercentage)) / 100;

        return {
          ...charge,
          taxAmt: taxAmt,
        };
      });
    }

    const invoice = new invoiceModel({
      serialNumber: newSerialNumber,
      cmp_id: orgId, // Corrected typo and used correct assignment operator
      partyAccount: party?.partyName,
      party,
      items: updatedItemsResults,
      priceLevel: priceLevelFromRedux, // Corrected typo and used correct assignment operator
      additionalCharges: updateAdditionalCharge, // Corrected typo and used correct assignment operator
      finalAmount: lastAmount, // Corrected typo and used correct assignment operator
      Primary_user_id: owner,
      Secondary_user_id,
      orderNumber,
      despatchDetails,
      createdAt: selectedDate,
    });

    const result = await invoice.save();

    const secondaryUser = await SecondaryUser.findById(Secondary_user_id);

    if (!secondaryUser) {
      return res
        .status(404)
        .json({ success: false, message: "Secondary user not found" });
    }

    let orderConfig = false;

    const configuration = secondaryUser.configurations.find(
      (config) => config.organization.toString() === orgId
    );

    if (configuration) {
      if (
        configuration.salesOrderConfiguration &&
        Object.entries(configuration.salesOrderConfiguration)
          .filter(([key]) => key !== "startingNumber")
          .every(([_, value]) => value !== "")
      ) {
        orderConfig = true;
      }
    }

    if (orderConfig === true) {
      const updatedConfiguration = secondaryUser.configurations.map(
        (config) => {
          if (config.organization.toString() === orgId) {
            return {
              ...config,
              orderNumber: (config.orderNumber || 0) + 1,
            };
          }
          return config;
        }
      );
      secondaryUser.configurations = updatedConfiguration;
      await secondaryUser.save();
    } else {
      await OragnizationModel.findByIdAndUpdate(
        orgId,
        { $inc: { orderNumber: 1 } },
        { new: true }
      );
    }

    return res.status(200).json({
      success: true,
      message: "Sale order created successfully",
      data: result,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: "Internal server error, try again!",
      error: error.message, // Include error message for debugging
    });
  }
};

// @desc get invoiceList
// route get/api/pUsers/invoiceList;

export const invoiceList = async (req, res) => {
  const userId = req.sUserId;
  const cmp_id = req.params.cmp_id;

  try {
    const invoiceList = await invoiceModel.find({
      Secondary_user_id: userId,
      cmp_id: cmp_id,
    });

    if (invoiceList) {
      res
        .status(200)
        .json({ message: "invoiceList fetched", invoiceList: invoiceList });
    } else {
      res.status(404).json({ message: "No parties found" });
    }
  } catch (error) {
    res
      .status(500)
      .json({ success: false, message: "Internal server error, try again!" });
  }
};

// @desc  getting a single party detail for edit
// route get/api/sUsers/getSinglePartyDetails

export const getSinglePartyDetails = async (req, res) => {
  const partyId = req.params.id;
  try {
    const getSinglePartyDetails = await PartyModel.findById(partyId);
    res.status(200).json({ success: true, data: getSinglePartyDetails });
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ success: false, message: "Internal server error, try again!" });
  }
};

// @desc  edit editParty details
// route get/api/pUsers/editParty

export const editParty = async (req, res) => {
  const party_id = req.params.id;

  try {
    const updateParty = await PartyModel.findOneAndUpdate(
      { _id: party_id },
      req.body,
      { new: true }
    );
    res.status(200).json({
      success: true,
      message: "Party updated successfully",
      data: updateParty,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};

// @desc delete party
// route delete/api/sUsers/deleteParty;

export const deleteParty = async (req, res) => {
  const partyId = req.params.id;
  try {
    const deletePartyFromList = await PartyModel.findByIdAndDelete(partyId);
    if (deletePartyFromList) {
      return res
        .status(200)
        .json({ success: true, message: "Party deleted successfully" });
    } else {
      return res
        .status(400)
        .json({ success: false, message: "Party deletion failed" });
    }
  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .json({ success: false, message: "Internal server error, try again!" });
  }
};

// @desc get organization detail foe edit
// route GET/api/pUsers/getOrganizations

export const getSingleOrganization = async (req, res) => {
  const OrgId = new mongoose.Types.ObjectId(req.params.id);

  try {
    const organization = await Organization.findById(OrgId).populate({
      path: "configurations.bank",
    });

    if (organization) {
      return res.status(200).json({
        organizationData: organization,
        message: "Organization fetched",
      });
    } else {
      return res.status(404).json({ message: "No organization found " });
    }
  } catch (error) {
    return res
      .status(500)
      .json({ success: false, message: "Internal server error, try again!" });
  }
};

// @desc fetch hsn of the companies
// route get/api/pUsers/fetchHsn

export const fetchHsn = async (req, res) => {
  const cmp_id = req.params.cmp_id;

  try {
    const hsn = await HsnModel.find({
      cpm_id: cmp_id,
    });

    if (hsn) {
      return res.status(200).json({ message: "hsn fetched", data: hsn });
    } else {
      return res.status(404).json({ message: "hsn data not found" });
    }
  } catch (error) {
    return res
      .status(500)
      .json({ status: false, message: "Internal server error" });
  }
};

// @desc adding new brands /categories /subcategories
// route POst/api/pUsers/addDataToOrg
export const addDataToOrg = async (req, res) => {
  try {
    const orgId = req.params.cmp_id;

    const org = await OragnizationModel.findById(orgId);

    if (org) {
      const fieldToUpdate = Object.keys(req.body)[0];
      const newData = req.body[fieldToUpdate];
      if (org[fieldToUpdate].includes(newData)) {
        return res.status(400).json({
          success: false,
          message: `${newData} already exists in ${fieldToUpdate}`,
        });
      }
      org[fieldToUpdate].push(newData);
      await org.save();
      return res.status(200).json({
        success: true,
        message: "Data added successfully",
      });
    } else {
      return res.status(404).json({
        success: false,
        message: "Organization not found",
      });
    }
  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .json({ success: false, message: "Internal server error, try again!" });
  }
};

// @desc edit brands /categories /subcategories
// route POst/api/pUsers/editDataInOrg
export const editDataInOrg = async (req, res) => {
  try {
    const orgId = req.params.cmp_id;
    const fieldToUpdate = Object.keys(req.body)[0];
    const newData = req.body[fieldToUpdate];
    const index = parseInt(req.body.index);

    const org = await OragnizationModel.findById(orgId);
    if (!org) {
      return res
        .status(404)
        .json({ success: false, message: "Organization not found" });
    }

    org[fieldToUpdate][index] = newData;
    await org.save();

    return res
      .status(200)
      .json({ success: true, message: "Data updated successfully" });
  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .json({ success: false, message: "Internal server error, try again!" });
  }
};

// @desc delete brands /categories /subcategories
// route POst/api/pUsers/deleteDataInOrg
export const deleteDataInOrg = async (req, res) => {
  try {
    const orgId = req.params.cmp_id;

    const fieldToDelete = Object.keys(req.body)[0];
    const indexToDelete = req.body[fieldToDelete];

    const org = await OragnizationModel.findById(orgId);

    if (!org) {
      return res
        .status(404)
        .json({ success: false, message: "Organization not found" });
    }

    const neededField = org[fieldToDelete];

    neededField.splice(indexToDelete, 1);
    await org.save(); // Save the organization after deletion
    return res
      .status(200)
      .json({ success: true, message: "Data deleted successfully" });

    // return res.status(200).json({ success: true, message: "Data deleted successfully" });
  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .json({ success: false, message: "Internal server error, try again!" });
  }
};

// @desc adding new Product
// route POst/api/pUsers/addProduct

export const addProduct = async (req, res) => {
  try {
    const Secondary_user_id = req.sUserId.toString();
    const Primary_user_id = req.owner.toString();
    const {
      body: {
        cmp_id,
        product_name,
        product_code,
        balance_stock,
        brand,
        category,
        sub_category,
        unit,
        alt_unit,
        unit_conversion,
        alt_unit_conversion,
        // hsn_code,
        purchase_price,
        purchase_cost,
        Priceleveles,
        GodownList,
      },
    } = req;

    let hsn_code = req.body.hsn_code;

    // Fetch HSN details
    const hsnDetails = await HsnModel.findById(hsn_code);

    // Extract required fields from HSN details
    let cgst, sgst, igst, cess, addl_cess, hsn_id;
    if (hsnDetails) {
      ({
        igstRate: igst,
        cgstRate: cgst,
        sgstUtgstRate: sgst,
        onValue: cess,
        onQuantity: addl_cess,
        hsn: hsn_code,
        _id: hsn_id,
      } = hsnDetails);
    }

    // Prepare data to save
    const dataToSave = {
      cmp_id,

      product_name,
      Primary_user_id,
      Secondary_user_id,
      product_code,
      balance_stock,
      brand,
      category,
      sub_category,
      unit,
      alt_unit,
      unit_conversion,
      alt_unit_conversion,
      hsn_code,
      purchase_price,
      purchase_cost,
      Priceleveles,
      GodownList,
      cgst,
      sgst,
      igst,
      cess,
      addl_cess,
      hsn_id,
    };

    // Save the product
    const newProduct = await productModel.create(dataToSave);

    // Return success response
    return res.status(200).json({
      success: true,
      message: "Product added successfully",
    });
  } catch (error) {
    console.error(error);

    // Return error response
    return res.status(500).json({
      success: false,
      message: "Internal server error, try again!",
    });
  }
};

// @desc  getting a single product detail for edit
// route get/api/sUsers/productDetails

export const productDetails = async (req, res) => {
  const productId = req.params.id;
  try {
    const productDetails = await productModel.findById(productId);
    res.status(200).json({ success: true, data: productDetails });
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ success: false, message: "Internal server error, try again!" });
  }
};

export const editProduct = async (req, res) => {
  const productId = req.params.id;

  try {
    const Secondary_user_id = req.sUserId.toString();
    const Primary_user_id = req.owner.toString();
    const {
      body: {
        product_name,
        product_code,
        balance_stock,
        brand,
        category,
        sub_category,
        unit,
        alt_unit,
        unit_conversion,
        alt_unit_conversion,
        // hsn_code,
        purchase_price,
        purchase_cost,
        Priceleveles,
        GodownList,
      },
    } = req;

    let hsn_code = req.body.hsn_code;

    // Fetch HSN details
    const hsnDetails = await HsnModel.findById(hsn_code);

    // Extract required fields from HSN details
    let cgst, sgst, igst, cess, addl_cess;
    if (hsnDetails) {
      ({
        igstRate: igst,
        cgstRate: cgst,
        sgstUtgstRate: sgst,
        onValue: cess,
        onQuantity: addl_cess,
        hsn: hsn_code,
      } = hsnDetails);
    }

    // Prepare data to save
    const dataToSave = {
      product_name,
      Primary_user_id,
      Secondary_user_id,
      product_code,
      balance_stock,
      brand,
      category,
      sub_category,
      unit,
      alt_unit,
      unit_conversion,
      alt_unit_conversion,
      hsn_code,
      purchase_price,
      purchase_cost,
      Priceleveles,
      GodownList,
      cgst,
      sgst,
      igst,
      cess,
      addl_cess,
    };

    const updateProduct = await productModel.findOneAndUpdate(
      { _id: productId },
      dataToSave,
      { new: true }
    );
    res.status(200).json({
      success: true,
      message: "Product updated successfully",
      data: updateProduct,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};

// @desc delete product from  product list
// route delete/api/pUsers/deleteProduct

export const deleteProduct = async (req, res) => {
  const productId = req.params.id;

  try {
    const deletedProduct = await productModel.findByIdAndDelete(productId);
    if (deletedProduct) {
      return res.status(200).json({
        success: true,
        message: "Product deleted successfully",
      });
    } else {
      return res.status(404).json({
        success: false,
        message: "Product not found",
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

// @desc   saveOrderNumber
// route post/api/pUsers/saveOrderNumber/cmp_id

export const saveOrderNumber = async (req, res) => {
  const cmp_id = req.params.cmp_id;
  try {
    const company = await OragnizationModel.findById(cmp_id);
    company.OrderNumberDetails = req.body;

    const save = await company.save();
    return res.status(200).json({
      success: true,
      message: "Order number saved successfully",
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: "Internal server error, try again!",
    });
  }
};

// @desc toget the details of transaction or receipt
// route get/api/sUsers/getTransactionDetails

export const getInvoiceDetails = async (req, res) => {
  const invoiceId = req.params.id;

  try {
    const invoiceDetails = await invoiceModel.findById(invoiceId);

    if (invoiceDetails) {
      res
        .status(200)
        .json({ message: "Invoice details fetched", data: invoiceDetails });
    } else {
      res.status(404).json({ error: "Invoice not found" });
    }
  } catch (error) {
    console.error("Error fetching receipt details:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

// @desc edit in voice
// route POST /api/sUsers/createInvoice
export const editInvoice = async (req, res) => {
  const Secondary_user_id = req.sUserId;
  const Primary_user_id = req.owner;
  const invoiceId = req.params.id;

  try {
    const {
      orgId,
      party,
      items,
      priceLevelFromRedux,
      additionalChargesFromRedux,
      lastAmount,
      orderNumber,
      despatchDetails,
      selectedDate,
    } = req.body;

    let productUpdates = [];

    const existingInvoice = await invoiceModel.findById(invoiceId);
    if (!existingInvoice) {
      console.log("editSaleOrder: existingInvoice not found");
      return res
        .status(404)
        .json({ success: false, message: "Sale Order not found" });
    }

    //////////////////////////// To handle the deletion and updating of products   starts //////////////////////////////////////////
    const updatedItemIds = items.map((item) => item._id);
    const deletedItems = existingInvoice.items.filter(
      (item) => !updatedItemIds.includes(item._id)
    );

    if (deletedItems.length > 0) {
      productUpdates = await deleteItemsInSaleOrderEdit(
        deletedItems,
        productUpdates
      );
      existingInvoice.items = existingInvoice.items.filter(
        (item) => !deletedItems.includes(item)
      );
    }

    //////////////////////////// To handle the addition of a new item in sale order starts  //////////////////////////////////////////
    const newItems = items.filter(
      (item) => !existingInvoice?.items?.some((sItem) => sItem._id === item._id)
    );

    const oldItems = items.filter((item) =>
      existingInvoice?.items?.some((sItem) => sItem._id === item._id)
    );

    if (newItems.length > 0) {
      productUpdates = await addingAnItemInSaleOrderEdit(
        newItems,
        productUpdates
      );
    }
    await productModel.bulkWrite(productUpdates);

    for (const item of oldItems) {
      console.log("editSaleOrder: item", item);
      const product = await productModel.findOne({ _id: item._id });
      if (!product) {
        console.log("editSaleOrder: product not found");
        throw new Error(`Product not found for item ID: ${item._id}`);
      }

      const existingItem = existingInvoice.items.find(
        (sItem) => sItem._id === item._id
      );

      await updateSaleableStock(
        product,
        item.count || 0,
        existingItem?.count || 0
      );
    }

    let updatedItems = items;
    if (items.length > 0) {
      updatedItems = await calculateUpdatedItemValues(
        items,
        priceLevelFromRedux
      );
    }

    console.log("selected date ", selectedDate);

    const result = await invoiceModel.findByIdAndUpdate(
      invoiceId,
      {
        $set: {
          cmp_id: orgId,
          party,
          items: updatedItems,
          priceLevel: priceLevelFromRedux,
          additionalCharges: additionalChargesFromRedux,
          finalAmount: lastAmount,
          Primary_user_id,
          Secondary_user_id,
          orderNumber,
          despatchDetails,
          createdAt: new Date(selectedDate),
        },
      },
      { new: true, timestamps: false }
    );

    return res.status(200).json({
      success: true,
      message: "Sale order Updated successfully",
      data: result,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: "Internal server error, try again!",
      error: error.message, // Include error message for debugging
    });
  }
};

export const fetchFilters = async (req, res) => {
  const cmp_id = req.params.cmp_id;
  try {
    const filers = await OragnizationModel.findById(cmp_id);

    const data = {
      brands: filers?.brands,
      categories: filers?.categories,
      subcategories: filers?.subcategories,
      priceLevels: filers?.levelNames,
    };

    if (filers) {
      return res.status(200).json({ message: "filers fetched", data: data });
    } else {
      return res.status(404).json({ message: "filers  not found" });
    }
  } catch (error) {
    return res
      .status(500)
      .json({ status: false, message: "Internal server error" });
  }
};

// @desc delete AdditionalCharge
// route get/api/pUsers/deleteAdditionalCharge

export const deleteAdditionalCharge = async (req, res) => {
  try {
    const id = req.params.id;
    const addlId = new mongoose.Types.ObjectId(id);

    const cmp_id = req.params.cmp_id;
    const org = await OragnizationModel.findById(cmp_id);

    const indexToDelete = org.additionalCharges.findIndex((item) =>
      item._id.equals(addlId)
    );

    if (indexToDelete !== -1) {
      org.additionalCharges.splice(indexToDelete, 1);
      // Save the updated document
      await org.save();

      return res.status(200).json({
        success: true,
        message: "Additional charge deleted successfully.",
      });
    } else {
      return res.status(404).json({
        success: false,
        message: "Additional charge not found.",
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

// @desc adding additional charges in orgData
// route POST /api/sUsers/addAdditionalCharge

export const addAditionalCharge = async (req, res) => {
  const cmp_id = req.params.cmp_id;
  try {
    const org = await OragnizationModel.findById(cmp_id);
    if (!org) {
      res.status(404).json({ message: "Organization not found" });
    }

    const chargeExist = org.additionalCharges.some(
      (charge) => charge.name === req.body.name
    );
    if (chargeExist) {
      return res.status(400).json({
        success: false,
        message: "Additional charge with the same name already exists",
      });
    }

    org.additionalCharges.push(req.body);
    await org.save();
    return res.status(200).json({
      success: true,
      message: "Additional charge added successfully",
      data: org,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: "Internal server error, try again!",
      error: error.message, // Include error message for debugging
    });
  }
};

// @desc update AdditionalCharge
// route get/api/sUsers/EditAditionalCharge

export const EditAditionalCharge = async (req, res) => {
  try {
    const id = req.params.id;
    const addlId = new mongoose.Types.ObjectId(id);

    const cmp_id = req.params.cmp_id;
    const org = await OragnizationModel.findById(cmp_id);

    const indexToUpdate = org.additionalCharges.findIndex((item) =>
      item._id.equals(addlId)
    );

    if (indexToUpdate !== -1) {
      // Assuming req.body contains the updated fields for the additional charge
      const updatedFields = req.body;

      // Update the additional charge with the new values
      org.additionalCharges[indexToUpdate] = {
        ...org.additionalCharges[indexToUpdate],
        ...updatedFields,
      };

      // Save the updated document
      await org.save();

      return res.status(200).json({
        success: true,
        message: "Additional charge updated successfully.",
      });
    } else {
      return res.status(404).json({
        success: false,
        message: "Additional charge not found.",
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

// @desc update AdditionalCharge
// route get/api/sUsers/addconfigurations

export const addconfigurations = async (req, res) => {
  const cmp_id = req.params.cmp_id;
  try {
    const org = await OragnizationModel.findById(cmp_id);
    if (!org) {
      return res.status(404).json({ message: "Organization not found" });
    }

    const { selectedBank, termsList, enableBillToShipTo, despatchDetails } =
      req.body;

    // Check if selectedBank is provided
    let bankId = null; // Default to null if not provided
    if (selectedBank) {
      // Validate selectedBank as an ObjectId if needed
      if (mongoose.Types.ObjectId.isValid(selectedBank)) {
        bankId = selectedBank;
      }
    }

    const newConfigurations = {
      bank: bankId, // Use the validated bankId or null
      terms: termsList,
      enableBillToShipTo,
      despatchDetails,
    };
    org.configurations = [newConfigurations];

    await org.save();
    return res.status(200).json({
      success: true,
      message: "Terms and conditions added successfully",
      data: org,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: "Internal server error, try again!",
      error: error.message, // Include error message for debugging
    });
  }
};

// route POST /api/pUsers/createSale

export const createSale = async (req, res) => {
  const Primary_user_id = req.owner;
  const Secondary_user_id = req.sUserId;

  try {
    const {
      selectedGodownId,
      selectedGodownName,
      orgId,
      party,
      items,
      despatchDetails,
      priceLevelFromRedux,
      additionalChargesFromRedux,
      lastAmount,
      salesNumber,
      selectedDate,
    } = req.body;
    const vanSaleQuery = req.query.vanSale;
    console.log("vanSaleQuery", vanSaleQuery);
    console.log("vanSaleQuery type", typeof vanSaleQuery);

    let model;

    if (vanSaleQuery === "true") {
      model = vanSaleModel;
    } else {
      model = salesModel;
    }

    console.log("model", model);

    const NumberExistence = await checkForNumberExistence(
      model,
      "salesNumber",
      salesNumber,
      orgId
    );

    if (NumberExistence) {
      return res.status(400).json({
        message: "Sales with the same number already exists",
      });
    }

    const secondaryUser = await SecondaryUser.findById(Secondary_user_id);
    const secondaryMobile = secondaryUser?.mobile;

    if (!secondaryUser) {
      return res
        .status(404)
        .json({ success: false, message: "Secondary user not found" });
    }
    const configuration = secondaryUser.configurations.find(
      (config) => config.organization.toString() === orgId
    );

    const vanSaleConfig = configuration?.vanSale;

    // Prepare bulk operations for product and godown updates
    const productUpdates = [];
    const godownUpdates = [];

    // Process each item to update product stock and godown stock
    for (const item of items) {
      // Find the product in the product model
      const product = await productModel.findOne({ _id: item._id });
      if (!product) {
        throw new Error(`Product not found for item ID: ${item._id}`);
      }

      const itemCount = parseFloat(item.count);
      const productBalanceStock = parseFloat(product.balance_stock);
      const newBalanceStock = truncateToNDecimals(
        productBalanceStock - itemCount,
        3
      );

      console.log("newBalanceStock", newBalanceStock);

      // Prepare product update operation
      productUpdates.push({
        updateOne: {
          filter: { _id: product._id },
          update: { $set: { balance_stock: newBalanceStock } },
        },
      });

      // Process godown and batch updates
      if (item.hasGodownOrBatch) {
        for (const godown of item.GodownList) {
          if (godown.batch && !godown?.godown_id) {
            // Case: Batch only or Godown with Batch
            const godownIndex = product.GodownList.findIndex(
              (g) => g.batch === godown.batch
            );

            console.log("gggg", product.GodownList[godownIndex]);

            if (godownIndex !== -1) {
              if (godown.count && godown.count > 0) {
                const currentGodownStock =
                  product.GodownList[godownIndex].balance_stock || 0;
                const newGodownStock = truncateToNDecimals(
                  currentGodownStock - godown.count,
                  3
                );

                console.log("newGodownStock", newGodownStock);

                // Prepare godown update operation
                godownUpdates.push({
                  updateOne: {
                    filter: {
                      _id: product._id,
                      "GodownList.batch": godown.batch,
                    },
                    update: {
                      $set: { "GodownList.$.balance_stock": newGodownStock },
                    },
                  },
                });
              }
            }
          } else if (godown.godown_id && godown.batch) {
            console.log("have batch and godown_id");
            const godownIndex = product.GodownList.findIndex(
              (g) =>
                g.batch === godown.batch && g.godown_id === godown.godown_id
            );

            console.log("gggg", product.GodownList[godownIndex]);

            if (godownIndex !== -1) {
              if (godown.count && godown.count > 0) {
                const currentGodownStock =
                  product.GodownList[godownIndex].balance_stock || 0;
                const newGodownStock = truncateToNDecimals(
                  currentGodownStock - godown.count,
                  3
                );

                console.log("newGodownStock", newGodownStock);

                // Prepare godown update operation
                godownUpdates.push({
                  updateOne: {
                    filter: {
                      _id: product._id,
                      "GodownList.batch": godown.batch,
                      "GodownList.godown_id": godown.godown_id,
                    },
                    update: {
                      $set: { "GodownList.$.balance_stock": newGodownStock },
                    },
                  },
                });
              }
            }
          } else if (godown.godown_id && !godown?.batch) {
            // Case: Godown only
            const godownIndex = product.GodownList.findIndex(
              (g) => g.godown_id === godown.godown_id
            );

            if (godownIndex !== -1) {
              if (godown.count && godown.count > 0) {
                const currentGodownStock =
                  product.GodownList[godownIndex].balance_stock || 0;
                const newGodownStock = truncateToNDecimals(
                  currentGodownStock - godown.count,
                  3
                );

                // Prepare godown update operation
                godownUpdates.push({
                  updateOne: {
                    filter: {
                      _id: product._id,
                      "GodownList.godown_id": godown.godown_id,
                    },
                    update: {
                      $set: { "GodownList.$.balance_stock": newGodownStock },
                    },
                  },
                });
              }
            }
          }
        }
      } else {
        // Case: No Godown
        product.GodownList = product.GodownList.map((godown) => {
          const currentGodownStock = godown.balance_stock || 0;
          const newGodownStock = truncateToNDecimals(
            currentGodownStock - item.count,
            3
          );
          return {
            ...godown,
            balance_stock: newGodownStock,
          };
        });

        // Prepare godown update operation
        godownUpdates.push({
          updateOne: {
            filter: { _id: product._id },
            update: { $set: { GodownList: product.GodownList } },
          },
        });
      }
    }

    // Execute bulk operations
    // await productModel.bulkWrite(productUpdates);
    await productModel.bulkWrite(productUpdates);
    await productModel.bulkWrite(godownUpdates);

    const lastSale = await model.findOne(
      {},
      {},
      { sort: { serialNumber: -1 } }
    );
    let newSerialNumber = 1;

    // Check if there's a last invoice and calculate the new serial number
    if (lastSale && !isNaN(lastSale.serialNumber)) {
      newSerialNumber = lastSale.serialNumber + 1;
    }

    const updatedItems = items.map((item) => {
      // Find the corresponding price rate for the selected price level
      // const selectedPriceLevel = item.Priceleveles.find(
      //   (priceLevel) => priceLevel.pricelevel === priceLevelFromRedux
      // );
      // If a corresponding price rate is found, assign it to selectedPrice, otherwise assign null
      // const selectedPrice = selectedPriceLevel
      //   ? selectedPriceLevel.pricerate
      //   : 0;

      // Calculate total price after applying discount
      // let totalPrice = selectedPrice * (item.count || 1) || 0; // Default count to 1 if not provided
      let totalPrice = item?.GodownList.reduce((acc, curr) => {
        console.log("curr?.individualTotal", curr?.individualTotal);

        return (acc = acc + Number(curr?.individualTotal));
      }, 0);
      if (item.discount) {
        // If discount is present (amount), subtract it from the total price
        totalPrice -= item.discount;
      } else if (item.discountPercentage) {
        // If discount is present (percentage), calculate the discount amount and subtract it from the total price
        const discountAmount = (totalPrice * item.discountPercentage) / 100;
        totalPrice -= discountAmount;
      }

      console.log("totalPrice", totalPrice);

      // Calculate tax amounts
      const { cgst, sgst, igst } = item;
      const cgstAmt = parseFloat(((totalPrice * cgst) / 100).toFixed(2));
      const sgstAmt = parseFloat(((totalPrice * sgst) / 100).toFixed(2));
      const igstAmt = parseFloat(((totalPrice * igst) / 100).toFixed(2));

      return {
        ...item,
        // selectedPrice: selectedPrice,
        cgstAmt: cgstAmt,
        sgstAmt: sgstAmt,
        igstAmt: igstAmt,
        subTotal: totalPrice - (Number(igstAmt) || 0),
      };
    });

    let updateAdditionalCharge;

    if (additionalChargesFromRedux.length > 0) {
      updateAdditionalCharge = additionalChargesFromRedux.map((charge) => {
        const { value, taxPercentage } = charge;

        const taxAmt = parseFloat(
          ((parseFloat(value) * parseFloat(taxPercentage)) / 100).toFixed(2)
        );

        return {
          ...charge,
          taxAmt: taxAmt,
        };
      });
    }

    // Continue with the rest of your function...
    const sales = new model({
      selectedGodownId: selectedGodownId ?? "",
      selectedGodownName: selectedGodownName ? selectedGodownName[0] : "",
      serialNumber: newSerialNumber,
      cmp_id: orgId,
      partyAccount: party?.partyName,
      party,
      despatchDetails,
      items: updatedItems,
      priceLevel: priceLevelFromRedux,
      additionalCharges: updateAdditionalCharge,
      finalAmount: lastAmount,
      Primary_user_id,
      Secondary_user_id,
      salesNumber,
      createdAt: new Date(selectedDate),
    });

    const result = await sales.save();

    let salesConfig = false;

    if (configuration) {
      if (
        configuration.salesConfiguration &&
        Object.entries(configuration.salesConfiguration)
          .filter(([key]) => key !== "startingNumber")
          .every(([_, value]) => value !== "")
      ) {
        salesConfig = true;
      }
    }

    if (vanSaleQuery === "true") {
      // await SecondaryUser.findByIdAndUpdate(
      //   Secondary_user_id,
      //   { $inc: { vanSalesNumber: 1 } },
      //   { new: true }
      // );
      const updatedConfiguration = secondaryUser.configurations.map(
        (config) => {
          if (config.organization.toString() === orgId) {
            return {
              ...config,
              vanSalesNumber: (config.vanSalesNumber || 0) + 1,
            };
          }
          return config;
        }
      );
      secondaryUser.configurations = updatedConfiguration;
      await secondaryUser.save();
    } else if (salesConfig && vanSaleQuery === "false") {
      const updatedConfiguration = secondaryUser.configurations.map(
        (config) => {
          if (config.organization.toString() === orgId) {
            return {
              ...config,
              salesNumber: (config.salesNumber || 0) + 1,
            };
          }
          return config;
        }
      );
      secondaryUser.configurations = updatedConfiguration;
      await secondaryUser.save();
    } else {
      await OragnizationModel.findByIdAndUpdate(
        orgId,
        { $inc: { salesNumber: 1 } },
        { new: true }
      );
    }

    const billData = {
      Primary_user_id,
      bill_no: salesNumber,
      cmp_id: orgId,
      party_id: party?.party_master_id,
      bill_amount: lastAmount,
      bill_date: new Date(),
      bill_pending_amt: lastAmount,
      email: party?.emailID,
      mobile_no: party?.mobileNumber,
      party_name: party?.partyName,
      user_id: secondaryMobile || "null",
    };

    await TallyData.findOneAndUpdate(
      {
        cmp_id: orgId,
        bill_no: salesNumber,
        Primary_user_id: Primary_user_id,
        party_id: party?.party_master_id,
      },
      billData,
      { upsert: true, new: true }
    );

    res.status(201).json({
      success: true,
      data: result,
      message: "Sale created successfully",
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "An error occurred while creating the sale.",
      error: error.message,
    });
  }
};

// @desc toget the details of transaction or sale
// route get/api/sUsers/getSalesDetails

export const getSalesDetails = async (req, res) => {
  const saleId = req.params.id;
  const vanSaleQuery = req.query.vanSale;

  const isVanSale = vanSaleQuery === "true";

  console.log("isVanSale", isVanSale);

  let model;
  if (isVanSale) {
    model = vanSaleModel;
  } else {
    model = salesModel;
  }

  try {
    const saleDetails = await model.findById(saleId);

    if (saleDetails) {
      res
        .status(200)
        .json({ message: "Sales details fetched", data: saleDetails });
    } else {
      res.status(404).json({ error: "Sale not found" });
    }
  } catch (error) {
    console.error("Error fetching sale details:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

// @desc   saveSalesNumber
// route post/api/sUsers/saveSalesNumber/cmp_id

export const saveSalesNumber = async (req, res) => {
  const cmp_id = req.params.cmp_id;
  try {
    const company = await OragnizationModel.findById(cmp_id);
    company.salesNumberDetails = req.body;

    const save = await company.save();
    return res.status(200).json({
      success: true,
      message: "Order number saved successfully",
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: "Internal server error, try again!",
    });
  }
};

// @desc  fetchAdditionalDetails
// route get/api/sUsers/fetchAdditionalDetails

export const fetchAdditionalDetails = async (req, res) => {
  const cmp_id = req.params.cmp_id;
  const Primary_user_id = req.owner;
  const secondary_user_id = req.sUserId;

  try {
    const secUser = await SecondaryUser.findById(secondary_user_id);

    let selectedPriceLevels;

    const configuration = secUser.configurations.find(
      (item) => item.organization.toString() === cmp_id
    );

    if (configuration) {
      selectedPriceLevels = configuration.selectedPriceLevels;
    }

    let priceLevelsResult = [];
    console.log("selectedPriceLevels", priceLevelsResult);

    if (selectedPriceLevels && selectedPriceLevels.length == 0) {
      priceLevelsResult = await productModel.aggregate([
        {
          $match: {
            Primary_user_id: new mongoose.Types.ObjectId(Primary_user_id),
            cmp_id: cmp_id,
          },
        },
        { $unwind: "$Priceleveles" },
        {
          $match: {
            "Priceleveles.pricelevel": { $ne: null },
            "Priceleveles.pricelevel": { $ne: "" },
          },
        },
        {
          $group: {
            _id: null,
            pricelevels: { $addToSet: "$Priceleveles.pricelevel" },
          },
        },
        { $project: { _id: 0, pricelevels: 1 } },
      ]);
    }

    const brandResults = await productModel.aggregate([
      {
        $match: {
          Primary_user_id: new mongoose.Types.ObjectId(Primary_user_id),
          cmp_id: cmp_id,
        },
      },
      { $group: { _id: null, brands: { $addToSet: "$brand" } } },
      { $project: { _id: 0, brands: 1 } },
    ]);

    const categoryResults = await productModel.aggregate([
      {
        $match: {
          Primary_user_id: new mongoose.Types.ObjectId(Primary_user_id),
          cmp_id: cmp_id,
        },
      },
      { $group: { _id: null, categories: { $addToSet: "$category" } } },
      { $project: { _id: 0, categories: 1 } },
    ]);

    const subCategoryResults = await productModel.aggregate([
      {
        $match: {
          Primary_user_id: new mongoose.Types.ObjectId(Primary_user_id),
          cmp_id: cmp_id,
        },
      },
      { $group: { _id: null, subcategories: { $addToSet: "$sub_category" } } },
      { $project: { _id: 0, subcategories: 1 } },
    ]);

    // Send the aggregated results back to the client
    res.json({
      message: "additional details fetched",
      priceLevels:
        selectedPriceLevels && selectedPriceLevels.length > 0
          ? selectedPriceLevels
          : priceLevelsResult.length > 0
          ? priceLevelsResult[0].pricelevels
          : [],
      brands: brandResults[0]?.brands || [],
      categories: categoryResults[0]?.categories || [],
      subcategories: subCategoryResults[0]?.subcategories || [],
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

// @desc  fetchConfigurationNumber
// route get/api/sUsers/fetchConfigurationNumber

export const fetchConfigurationNumber = async (req, res) => {
  const { cmp_id, title } = req.params;

  console.log("title", title);
  const secUserId = req.sUserId;

  try {
    const [secUser, company] = await Promise.all([
      SecondaryUser.findById(secUserId),
      OragnizationModel.findById(cmp_id),
    ]);

    if (!secUser) {
      return res.status(404).json({ message: "User not found" });
    }

    if (!company) {
      return res.status(404).json({ message: "Company not found" });
    }

    const configuration = secUser.configurations.find(
      (item) => item.organization.toString() === cmp_id
    );

    const getConfigDetails = () => {
      if (!configuration) return null;

      const configs = {
        sales: configuration.salesConfiguration,
        salesOrder: configuration.salesOrderConfiguration,
        purchase: configuration.purchaseConfiguration,
        receipt: configuration.receiptConfiguration,
        vanSale: configuration.vanSaleConfiguration,
        stockTransfer: configuration.stockTransferConfiguration,
      };

      return configs[title] || null;
    };


    const getConfigNumber = () => {
      if (configuration) {
        const numbers = {
          sales: configuration.salesNumber,
          salesOrder: configuration.orderNumber,
          purchase: configuration.purchaseNumber,
          vanSale: configuration.vanSalesNumber,
          stockTransfer: configuration.stockTransferNumber,
          receipt: null, // Add if there's a specific receipt number for user config
        };
        return numbers[title] || null;
      }

      const companyNumbers = {
        sales: company.salesNumber,
        salesOrder: company.orderNumber,
        purchase: company.purchaseNumber,
        vanSale: company.vanSalesNumber,
        stockTransfer: company.stockTransferNumber,
        // receipt: company.receiptNumberDetails
      };


      // console.log("companyNumbers", companyNumbers);
      return companyNumbers[title] || null;
    };

    let configDetails = getConfigDetails();
    let configurationNumber = getConfigNumber();


    console.log(getConfigNumber());

    // If configDetails is empty or all values except startingNumber are empty, use company defaults
    if (
      !configDetails ||
      Object.entries(configDetails)
        .filter(([key]) => key !== "startingNumber")
        .every(([_, value]) => value === "")
    ) {
      configDetails = "";
      configurationNumber = getConfigNumber(); // Ensure we're using the company default
    }

    if (configDetails) {
      res.json({
        message: "Configuration details fetched",
        configDetails,
        configurationNumber,
      });
    } else {
      res.json({ message: "default", configurationNumber });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

export const findSecondaryUserGodowns = async (req, res) => {
  const cmp_id = req.params.cmp_id;
  const secondary_user_id = req.sUserId;
  const primaryUser = req.owner;

  try {
    const godownsResult = await productModel.aggregate([
      {
        $match: {
          Primary_user_id: new mongoose.Types.ObjectId(primaryUser),
          cmp_id: cmp_id,
        },
      },
      { $unwind: "$GodownList" },
      {
        $match: {
          "GodownList.godown_id": { $ne: null },
          "GodownList.godown_id": { $ne: "" },
        },
      },
      {
        $group: {
          _id: "$GodownList.godown_id",
          godown: { $addToSet: "$GodownList.godown" }, // Collect unique cmp_id values for each godown
        },
      },
      { $match: { _id: { $ne: null } } },
    ]);
    const secondaryUserGodown = await SecondaryUser.findOne(
      {
        _id: secondary_user_id, // User ID
        "configurations.organization": cmp_id, // Organization ID
      },
      { "configurations.$": 1 } // Projection to get only the matched organization's configuration
    ).exec();
    const secondaryUserGodownsId =
      secondaryUserGodown.configurations[0].selectedGodowns;
    if (secondaryUserGodownsId && secondaryUserGodownsId.length > 0) {
      const result = godownsResult.filter((item) =>
        secondaryUserGodownsId.includes(item._id)
      );
      if (result) {
        res.json({
          message: "additional details fetched",
          godowndata: result,
        });
      }
    } else {
      if (godownsResult) {
        res.json({
          message: "additional details fetched",
          godowndata: godownsResult,
        });
      }
    }
  } catch (error) {
    res.status(500).json({ error: "Internal Server Error" });
  }
};

export const findPrimaryUserGodownsSelf = async (req, res) => {
  const cmp_id = req.params.cmp_id;
  const sUser = req.sUserId;
  const pUserid = await SecondaryUser.find(
    { _id: sUser },
    { primaryUser: 1, _id: 0 }
  );
  const pUser = pUserid[0].primaryUser;

  try {
    const godowns = await Organization.find({ _id: cmp_id, owner: pUser });
    const Allgodowns = godowns[0].locations;

    const secondaryUserGodown = await SecondaryUser.findOne(
      { _id: sUser, "configurations.organization": cmp_id },
      { "configurations.$": 1 }
    ).exec();

    const secondaryUserGodownsId =
      secondaryUserGodown.configurations[0].selectedGodowns;

    const result = Allgodowns.filter((item) =>
      secondaryUserGodownsId.includes(item._id)
    );
    if (!result && result.length > 0) {
      if (result) {
        res.json({
          message: "additional details fetched",
          godowndata: result,
        });
      }
    } else {
      if (Allgodowns) {
        res.json({
          message: "additional details fetched",
          godowndata: Allgodowns,
        });
      }
    }
  } catch (error) {
    res.status(500).json({ error: "Internal Server Error" });
  }
};
export const godownwiseProducts = async (req, res) => {
  try {
    const cmp_id = req.params.cmp_id;
    const godown_id = req.params.godown_id;

    const products = await productModel.aggregate([
      // Match products based on cmp_id, puser_id, and godown_id
      {
        $match: {
          cmp_id: cmp_id,
          Primary_user_id: new mongoose.Types.ObjectId(req.owner),
          "GodownList.godown_id": godown_id,
        },
      },
      // Unwind the GodownList array to denormalize the data
      { $unwind: "$GodownList" },
      // Match again to filter based on godown_id
      {
        $match: {
          "GodownList.godown_id": godown_id,
        },
      },
      // Project to include necessary fields and add balance_stock
      {
        $project: {
          _id: 1,
          product_name: 1,
          cmp_id: 1,
          balance_stock: "$GodownList.balance_stock",
          hsn_code: 1,
          igst: 1,
        },
      },
    ]);

    res.json(products);
  } catch (error) {
    console.error("Error fetching godownwise products:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

export const godownwiseProductsSelf = async (req, res) => {
  try {
    const cmp_id = req.params.cmp_id;
    const godown = req.params.godown_name;
    const products = await productModel.aggregate([
      // Match products based on cmp_id, puser_id, and godown_id
      {
        $match: {
          cmp_id: cmp_id,
          Primary_user_id: new mongoose.Types.ObjectId(req.owner),
          "GodownList.godown": godown,
        },
      },
      // Unwind the GodownList array to denormalize the data
      { $unwind: "$GodownList" },
      // Match again to filter based on godown_id
      {
        $match: {
          "GodownList.godown": godown,
        },
      },
      // Project to include necessary fields and add balance_stock
      {
        $project: {
          _id: 1,
          product_name: 1,
          cmp_id: 1,
          balance_stock: "$GodownList.balance_stock",
          hsn_code: 1,
          igst: 1,
        },
      },
    ]);

    res.json(products);
  } catch (error) {
    console.error("Error fetching godownwise products:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};
export const fetchAdditionalCharges = async (req, res) => {
  try {
    const cmp_id = req.params.cmp_id;
    const pUser = req.owner.toString();
    console.log(pUser);

    const aditionalDetails = await AdditionalChargesModel.find({
      cmp_id: cmp_id,
      Primary_user_id: pUser,
    });

    res.json(aditionalDetails);
  } catch (error) {
    console.error("Error fetching godownwise products:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};
export const findGodownsNames = async (req, res) => {
  const cmp_id = req.params.cmp_id;
  const selectedUser = req.sUserId;
  try {
    const secUser = await SecondaryUser.findById(selectedUser);
    if (!secUser) {
      return res.status(404).json({ message: "Secondary user not found" });
    }

    const configuration = secUser.configurations.find(
      (item) => item.organization == cmp_id
    );
    if (configuration) {
      const { vanSaleConfiguration } = configuration;
      const godownName = vanSaleConfiguration.vanSaleGodownName;
      const godownId = configuration.selectedVanSaleGodowns[0];

      const data = {
        godownName,
        godownId,
      };
      res.status(200).json({ message: "godown details fetched", data: data });
    }
  } catch (error) {
    res.status(500).json({ message: "internal server error" });
  }
};

// route POST /api/pUsers/createSale

export const createPurchase = async (req, res) => {
  const Primary_user_id = req.owner;
  const Secondary_user_id = req.sUserId;

  try {
    const {
      orgId,
      party,
      items,
      priceLevelFromRedux,
      additionalChargesFromRedux,
      lastAmount,
      purchaseNumber,
    } = req.body;

    const secondaryUser = await SecondaryUser.findById(Secondary_user_id);
    const secondaryMobile = secondaryUser.mobile;

    console.log("secondaryMobile", secondaryMobile);
    if (!secondaryUser) {
      return res
        .status(404)
        .json({ success: false, message: "Secondary user not found" });
    }
    const configuration = secondaryUser.configurations.find(
      (config) => config.organization.toString() === orgId
    );

    // Prepare bulk operations for product and godown updates
    let productUpdates = [];
    let godownUpdates = [];

    // Process each item to update product stock and godown stock
    for (const item of items) {
      // Find the product in the product model
      const product = await productModel.findOne({ _id: item._id });
      if (!product) {
        throw new Error(`Product not found for item ID: ${item._id}`);
      }

      // Calculate the new balance stock
      // Calculate the new balance stock
      const productBalanceStock = truncateToNDecimals(product.balance_stock, 3);
      console.log("productBalanceStock", productBalanceStock);
      const itemCount = truncateToNDecimals(item.count, 3);
      const newBalanceStock = truncateToNDecimals(
        productBalanceStock + itemCount,
        3
      );

      console.log("productBalanceStock", productBalanceStock);
      console.log("newBalanceStock", newBalanceStock);

      // Prepare product update operation
      productUpdates.push({
        updateOne: {
          filter: { _id: product._id },
          update: { $set: { balance_stock: newBalanceStock } },
        },
      });

      console.log("godown", item.GodownList);

      // Update the godown stock for each specified godown
      for (const godown of item.GodownList) {
        // Find the corresponding godown in the product's GodownList
        const godownIndex = product.GodownList.findIndex(
          (g) => g.godown_id === godown.godown_id
        );
        if (godownIndex !== -1) {
          // Calculate the new godown stock
          const newGodownStock = truncateToNDecimals(
            product.GodownList[godownIndex].balance_stock + godown.count,
            3
          );

          // Prepare godown update operation
          godownUpdates.push({
            updateOne: {
              filter: {
                _id: product._id,
                "GodownList.godown": godown.godown,
              },
              update: {
                $set: { "GodownList.$.balance_stock": newGodownStock },
              },
            },
          });
        }
      }
    }

    // Execute bulk operations
    await productModel.bulkWrite(productUpdates);
    await productModel.bulkWrite(godownUpdates);

    const lastPurchse = await purchaseModel.findOne(
      {},
      {},
      { sort: { serialNumber: -1 } }
    );
    let newSerialNumber = 1;

    // Check if there's a last invoice and calculate the new serial number
    if (lastPurchse && !isNaN(lastPurchse.serialNumber)) {
      newSerialNumber = lastPurchse.serialNumber + 1;
    }

    const updatedItems = items.map((item) => {
      // Find the corresponding price rate for the selected price level
      const selectedPriceLevel = item.Priceleveles.find(
        (priceLevel) => priceLevel.pricelevel === priceLevelFromRedux
      );
      // If a corresponding price rate is found, assign it to selectedPrice, otherwise assign null
      const selectedPrice = selectedPriceLevel
        ? selectedPriceLevel.pricerate
        : 0;

      // Calculate total price after applying discount
      let totalPrice = selectedPrice * (item.count || 1) || 0; // Default count to 1 if not provided
      if (item.discount) {
        // If discount is present (amount), subtract it from the total price
        totalPrice -= item.discount;
      } else if (item.discountPercentage) {
        // If discount is present (percentage), calculate the discount amount and subtract it from the total price
        const discountAmount = (totalPrice * item.discountPercentage) / 100;
        totalPrice -= discountAmount;
      }

      // Calculate tax amounts
      const { cgst, sgst, igst } = item;
      const cgstAmt = (totalPrice * cgst) / 100;
      const sgstAmt = (totalPrice * sgst) / 100;
      const igstAmt = (totalPrice * igst) / 100;

      // console.log("haii",typeof(parseFloat(sgstAmt.toFixed(2))),);

      return {
        ...item,
        selectedPrice: selectedPrice,
        cgstAmt: parseFloat(cgstAmt.toFixed(2)),
        sgstAmt: parseFloat(sgstAmt.toFixed(2)),
        igstAmt: parseFloat(igstAmt.toFixed(2)),
        subTotal: totalPrice, // Optional: Include total price in the item object
      };
    });

    let updateAdditionalCharge;

    if (additionalChargesFromRedux.length > 0) {
      updateAdditionalCharge = additionalChargesFromRedux.map((charge) => {
        const { value, taxPercentage } = charge;

        const taxAmt = (parseFloat(value) * parseFloat(taxPercentage)) / 100;
        console.log(taxAmt);

        return {
          ...charge,
          taxAmt: taxAmt,
        };
      });
    }

    // Continue with the rest of your function...
    const purchase = new purchaseModel({
      serialNumber: newSerialNumber,

      cmp_id: orgId,
      partyAccount: party?.partyName,

      party,
      items: updatedItems,
      priceLevel: priceLevelFromRedux,
      additionalCharges: updateAdditionalCharge,
      finalAmount: lastAmount,
      Primary_user_id,
      Secondary_user_id,
      purchaseNumber,
    });

    const result = await purchase.save();

    let purchaseConfig = false;

    if (configuration) {
      if (
        configuration?.purchaseConfiguration &&
        Object.entries(configuration?.purchaseConfiguration)
          .filter(([key]) => key !== "startingNumber")
          .every(([, value]) => value !== "")
      ) {
        purchaseConfig = true;
      }
    }

    // // const vanSaleConfig = configuration?.vanSale;

    // if (vanSaleConfig) {
    //   const increaseSalesNumber = await SecondaryUser.findByIdAndUpdate(
    //     Secondary_user_id,
    //     { $inc: { vanSalesNumber: 1 } },
    //     { new: true }
    //   );
    if (purchaseConfig) {
      const increasPurchaseNumber = await SecondaryUser.findByIdAndUpdate(
        Secondary_user_id,
        { $inc: { purchaseNumber: 1 } },
        { new: true }
      );
    } else {
      const increasPurchaseNumber = await OragnizationModel.findByIdAndUpdate(
        orgId,
        { $inc: { purchaseNumber: 1 } },
        { new: true }
      );
    }

    const billData = {
      Primary_user_id,
      bill_no: purchaseNumber,
      cmp_id: orgId,
      party_id: party?.party_master_id,
      bill_amount: lastAmount,
      bill_date: new Date(),
      bill_pending_amt: lastAmount,
      email: party?.emailID,
      mobile_no: party?.mobileNumber,
      party_name: party?.partyName,
      user_id: secondaryMobile || "null",
    };

    const updatedDocument = await TallyData.findOneAndUpdate(
      {
        cmp_id: orgId,
        bill_no: purchaseNumber,
        Primary_user_id: Primary_user_id,
        party_id: party?.party_master_id,
      },
      billData,
      { upsert: true, new: true }
    );

    return res.status(200).json({
      success: true,
      message: "Purchase created successfully",
      data: result,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: "Internal server error, try again!",
      error: error.message,
    });
  }
};

// @desc toget the details of transaction or purchase
// route get/api/sUsers/getPurchaseDetails

export const getPurchaseDetails = async (req, res) => {
  const purchaseId = req.params.id;

  try {
    const purchaseDetails = await purchaseModel.findById(purchaseId);

    if (purchaseDetails) {
      res
        .status(200)
        .json({ message: "purchaseDetails  fetched", data: purchaseDetails });
    } else {
      res.status(404).json({ error: "Purchase not found" });
    }
  } catch (error) {
    console.error("Error fetching purchase details:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

// @desc to edit sale
// route get/api/sUsers/editSaleSale

export const editSale = async (req, res) => {
  const saleId = req.params.id;

  const vanSaleQuery = req.query.vanSale;

  const isVanSale = vanSaleQuery === "true";

  let model;
  if (isVanSale) {
    model = vanSaleModel;
  } else {
    model = salesModel;
  }

  try {
    const {
      orgId,
      party,
      items,
      priceLevelFromRedux,
      additionalChargesFromRedux,
      lastAmount,
      salesNumber,
      despatchDetails,
      selectedDate,
    } = req.body;

    console.log("selectedDate", selectedDate);

    let productUpdates = [];

    // Fetch the existing sale

    const existingSale = await model.findById(saleId);
    if (!existingSale) {
      console.log("editSale: existingSale not found");
      return res
        .status(404)
        .json({ success: false, message: "Sale not found" });
    }

    const oldBillValue = existingSale.finalAmount;

    //////////////////////////// To handle the deletion and updating of products   starts //////////////////////////////////////////

    const updatedItemIds = items.map((item) => item._id);
    const deletedItems = existingSale.items.filter(
      (item) => !updatedItemIds.includes(item._id)
    );
    // Process each deleted item to update product stock and godown stock
    if (deletedItems.length > 0) {
      await deleteItemsInSaleEdit(deletedItems, productUpdates);
      existingSale.items = existingSale.items.filter(
        (item) => !deletedItems.includes(item)
      );
    }

    ////////////////////////////// To handle the deletion and updating of products ends //////////////////////////////////////////

    //////////////////////////// To handle the addition of a new item in sale starts  //////////////////////////////////////////
    const newItems = items.filter(
      (item) => !existingSale?.items?.some((sItem) => sItem._id === item._id)
    );

    const oldItems = items.filter((item) =>
      existingSale?.items?.some((sItem) => sItem._id === item._id)
    );

    if (newItems.length > 0) {
      await addingAnItemInSale(newItems);
    }
    //////////////////////////// To handle the addition of a new item in sale ends  //////////////////////////////////////////

    ////////////////////////////// Process each item to update product stock and godown stock /////////////////////////////////////////////////
    for (const item of oldItems) {
      // Find the product in the product model
      const product = await productModel.findOne({ _id: item._id });
      if (!product) {
        console.log("editSale: product not found");
        throw new Error(`Product not found for item ID: ${item._id}`);
      }

      const existingItem = existingSale.items.find(
        (sItem) => sItem._id === item._id
      );

      /////////////////////////////// for updating salable stock ///////////////////////////

      await updateSaleableStock(
        product,
        item.count || 0,
        existingItem?.count || 0
      );

      /////////////////////////////// for updating salable stock  end  ///////////////////////////

      /////////////////////////////// Process godown and batch updates ///////////////////////////
      if (item.hasGodownOrBatch) {
        ///////////////////////////////for handle deletion of godown or batch start///////////////////////////////

        const updatedGodowns = item.GodownList.filter(
          (godown) => godown.added == true
        );
        // console.log("updatedGodowns", updatedGodowns);
        const existingGodownList =
          existingItem?.GodownList.filter((godown) => {
            return godown.added == true;
          }) || [];
        // console.log("existingGodownList", existingGodownList);

        let deletedGodowns = [];
        for (const godown of existingGodownList) {
          if (godown.batch && !godown.godown_id) {
            // Check if the object with the same batch exists in updatedGodownList
            const foundInUpdated = updatedGodowns.some(
              (updated) => updated.batch === godown.batch
            );
            if (!foundInUpdated) {
              deletedGodowns.push(godown); // Add to deletedGodowns if not found
            }
          } else if (godown.godown_id && !godown.batch) {
            // Check if the object with the same godown_id exists in updatedGodowns
            const foundInUpdated = updatedGodowns.some(
              (updated) => updated.godown_id === godown.godown_id
            );
            if (!foundInUpdated) {
              deletedGodowns.push(godown); // Add to deletedGodown if not found
            }
          } else if (godown.batch && godown.godown_id) {
            // Check if the object with the same batch and godown_id exists in updatedGodowns
            const foundInUpdated = updatedGodowns.some(
              (updated) =>
                updated.batch === godown.batch &&
                updated.godown_id === godown.godown_id
            );
            if (!foundInUpdated) {
              deletedGodowns.push(godown); // Add to deletedGodown if not found
            }
          }
        }

        // console.log("deletedGodowns", deletedGodowns);

        let newGodowns = [];

        for (const updatedGodown of updatedGodowns) {
          if (updatedGodown.batch && !updatedGodown.godown_id) {
            // Check if the object with the same batch exists in existingGodownList
            const foundInExisting = existingGodownList.some(
              (existing) => existing.batch === updatedGodown.batch
            );
            if (!foundInExisting) {
              newGodowns.push(updatedGodown); // Add to newGodowns if not found
            }
          } else if (updatedGodown.godown_id && !updatedGodown.batch) {
            // Check if the object with the same godown_id exists in existingGodownList
            const foundInExisting = existingGodownList.some(
              (existing) => existing.godown_id === updatedGodown.godown_id
            );
            if (!foundInExisting) {
              newGodowns.push(updatedGodown); // Add to newGodowns if not found
            }
          } else if (updatedGodown.batch && updatedGodown.godown_id) {
            // Check if the object with the same batch and godown_id exists in existingGodownList
            const foundInExisting = existingGodownList.some(
              (existing) =>
                existing.batch === updatedGodown.batch &&
                existing.godown_id === updatedGodown.godown_id
            );
            if (!foundInExisting) {
              newGodowns.push(updatedGodown); // Add to newGodowns if not found
            }
          }

          // console.log("newGodowns", newGodowns);
          if (newGodowns.length > 0) {
            await addingNewBatchesOrGodownsInSale(newGodowns, product);
          }

          // Process deleted godowns or batches

          if (deletedGodowns.length > 0) {
            await deleteGodownsOrBatchesInSaleEdit(deletedGodowns, product);
          }
          ///////////////////////////////for handle deletion of godown or batch start///////////////////////////////

          /////////////////////////////////////for  updating balance stock of godowns  ////////////////////////////////////

          for (const godown of item.GodownList) {
            if (godown.batch && !godown.godown_id) {
              const existingGodown = existingItem?.GodownList.find(
                (sGodown) => sGodown.batch === godown.batch
              );
              const godownCountDiff =
                parseFloat(godown.count) - (existingGodown?.count || 0) || 0;

              // console.log("godownCountDiff", godownCountDiff);

              let productItem = productModel.findOne({
                _id: product._id,
              });

              const balance_stock =
                product.GodownList.find(
                  (sGodown) => sGodown.batch === godown.batch
                ).balance_stock || 0;
              // console.log("balance_stock", balance_stock);

              let updatedStock;

              if (godownCountDiff > 0) {
                const absoluteCount = Math.abs(godownCountDiff);
                // console.log("greater than 0");

                updatedStock = balance_stock - absoluteCount;
              } else {
                const absoluteCount = Math.abs(godownCountDiff);

                updatedStock = balance_stock + absoluteCount;
              }

              // console.log("updatedStock", updatedStock);

              if (godownCountDiff !== 0) {
                await productModel.updateOne(
                  {
                    _id: product._id,
                    "GodownList.batch": godown.batch || null,
                  },
                  { $set: { "GodownList.$.balance_stock": updatedStock } }
                );
              }
            } else if (godown.godown_id && !godown.batch) {
              const existingGodown = existingItem?.GodownList.find(
                (sGodown) => sGodown?.godown_id === godown?.godown_id
              );

              const godownCountDiff =
                parseFloat(godown?.count) - (existingGodown?.count || 0) || 0;

              // console.log("godownCountDiff", godownCountDiff);

              let productItem = productModel?.findOne({
                _id: product._id,
              });

              const balance_stock =
                product.GodownList.find(
                  (sGodown) => sGodown?.godown_id === godown?.godown_id
                )?.balance_stock || 0;

              // console.log("balance_stock", balance_stock);
              let updatedStock;

              if (godownCountDiff > 0) {
                const absoluteCount = Math.abs(godownCountDiff);
                // console.log("greater than 0");

                updatedStock = balance_stock - absoluteCount;
                // console.log("updatedStock", updatedStock);
              } else {
                const absoluteCount = Math.abs(godownCountDiff);

                // console.log("less than 0");

                updatedStock = balance_stock + absoluteCount;
                // console.log("updatedStock", updatedStock);
              }

              if (godownCountDiff !== 0) {
                await productModel.updateOne(
                  {
                    _id: product._id,
                    "GodownList.godown_id": godown.godown_id || null,
                  },
                  { $set: { "GodownList.$.balance_stock": updatedStock } }
                );
              }
            } else if (godown?.godown_id && godown?.batch) {
              const existingGodown = existingItem?.GodownList?.find(
                (sGodown) =>
                  sGodown?.godown_id === godown?.godown_id &&
                  sGodown?.batch === godown?.batch
              );
              const godownCountDiff =
                parseFloat(godown?.count) - (existingGodown?.count || 0) || 0;
              // console.log("godownCountDiff", godownCountDiff);
              let productItem = productModel.findOne({
                _id: product?._id,
              });
              const balance_stock =
                product.GodownList.find(
                  (sGodown) =>
                    sGodown?.godown_id === godown?.godown_id &&
                    sGodown?.batch === godown?.batch
                )?.balance_stock || 0;

              // console.log("balance_stock", balance_stock);

              let updatedStock;

              if (godownCountDiff > 0) {
                const absoluteCount = Math.abs(godownCountDiff);
                // console.log("greater than 0");
                updatedStock = balance_stock - absoluteCount;
                // console.log("updatedStock", updatedStock);
              } else {
                const absoluteCount = Math.abs(godownCountDiff);

                // console.log("less than 0");
                updatedStock = balance_stock + absoluteCount;
                // console.log("updatedStock", updatedStock);
              }

              if (godownCountDiff !== 0) {
                await productModel.updateOne(
                  {
                    _id: product._id,
                    "GodownList.godown_id": godown?.godown_id || null,
                    "GodownList.batch": godown?.batch || null,
                  },
                  { $set: { "GodownList.$.balance_stock": updatedStock } }
                );
              }
            }
          }
        }
      } else {
        ////// no godown or batch//////////

        // console.log("nohasGodownOrBatch ");

        const product_godown_balance_stock = Number(
          product.GodownList[0].balance_stock
        );

        const itemCountDiff =
          parseFloat(item.count) - (existingItem?.count || 0) || 0;
        let updatedStock;
        let updatedGodownStock;

        if (itemCountDiff > 0) {
          const absoluteCount = Math.abs(itemCountDiff);
          // console.log("greater than 0");

          updatedGodownStock = product_godown_balance_stock - absoluteCount;
          // console.log("updatedStock", updatedStock);
        } else {
          const absoluteCount = Math.abs(itemCountDiff);

          // console.log("less than 0");

          updatedGodownStock = product_godown_balance_stock + absoluteCount;

          // console.log("updatedStock", updatedStock);
        }

        if (itemCountDiff !== 0) {
          await productModel.updateOne(
            { _id: product._id },
            {
              $set: {
                "GodownList.0.balance_stock": updatedGodownStock,
              },
            }
          );
        }
      }
    }

    ///////////////////////////////////// for calculating values like igst amount and updated items  ////////////////////////////////////

    let updatedItems = items;
    if (items.length > 0) {
      updatedItems = await calculateUpdatedItemValues(
        items,
        priceLevelFromRedux
      );
    }
    let updateAdditionalCharge = additionalChargesFromRedux;
    if (additionalChargesFromRedux.length > 0) {
      updateAdditionalCharge = await updateAdditionalChargeInSale(
        additionalChargesFromRedux
      );
    }

    // console.log("updatedItems", updatedItems);

    // Update the existing sale
    existingSale.partyAccount = party?.partyName;
    existingSale.party = party;
    existingSale.items = updatedItems;
    existingSale.priceLevel = priceLevelFromRedux;
    existingSale.additionalCharges = additionalChargesFromRedux;
    existingSale.finalAmount = lastAmount;
    existingSale.salesNumber = salesNumber;
    existingSale.despatchDetails = despatchDetails;
    existingSale.createdAt = new Date(selectedDate);

    console.log("existingSale", existingSale);

    const result = await existingSale.save();

    ///////////////////////////////////// for reflecting the rate change in outstanding  ////////////////////////////////////

    const newBillValue = Number(lastAmount);
    // const oldBillValue = Number(existingSale.finalAmount);
    const diffBillValue = newBillValue - oldBillValue;

    const matchedOutStanding = await TallyData.findOne({
      party_id: party?.party_master_id,
      cmp_id: orgId,
      bill_no: salesNumber,
    });

    if (matchedOutStanding) {
      console.log("editSale: matched outstanding found");
      const newOutstanding =
        Number(matchedOutStanding?.bill_pending_amt) + diffBillValue;

      console.log("editSale: new outstanding calculated", newOutstanding);
      await TallyData.updateOne(
        {
          party_id: party?.party_master_id,
          cmp_id: orgId,
          bill_no: salesNumber,
        },
        { $set: { bill_pending_amt: newOutstanding } }
      );

      console.log("editSale: outstanding updated");
    } else {
      console.log("editSale: matched outstanding not found");
    }

    res
      .status(200)
      .json({ success: true, message: "Sale updated", data: result });
  } catch (error) {
    console.error("editSale: error", error);
    res.status(500).json({
      success: false,
      message: "An error occurred while editing the sale.",
      error: error.message,
    });
  }
};

// @desc get brands, categories, subcategories, godowns, priceLevels
// route get/api/sUsers/getAllSubDetails

export const getAllSubDetails = async (req, res) => {
  try {
    const cmp_id = req.params.orgId;
    const Primary_user_id = req.owner;
    console.log(cmp_id, Primary_user_id);
    if (!cmp_id || !Primary_user_id) {
      console.log(
        "cmp_id and Primary_user_id are required in getAllSubDetails "
      );
      return;
    }

    const [brands, categories, subcategories, godowns, priceLevels] =
      await Promise.all([
        Brand.find({ cmp_id, Primary_user_id }).select("_id brand"),
        Category.find({ cmp_id, Primary_user_id }).select("_id category"),
        Subcategory.find({ cmp_id, Primary_user_id }).select("_id subcategory"),
        Godown.find({ cmp_id, Primary_user_id }).select("_id godown"),
        PriceLevel.find({ cmp_id, Primary_user_id }).select("_id pricelevel"),
      ]);

    const result = {
      brands: brands.map((b) => ({ _id: b._id, name: b.brand })),
      categories: categories.map((c) => ({ _id: c._id, name: c.category })),
      subcategories: subcategories.map((s) => ({
        _id: s._id,
        name: s.subcategory,
      })),
      godowns: godowns.map((g) => ({ _id: g._id, name: g.godown })),
      priceLevels: priceLevels.map((p) => ({ _id: p._id, name: p.pricelevel })),
    };

    res.status(200).json({
      message: "All subdetails retrieved successfully",
      data: result,
    });
  } catch (error) {
    console.error("Error in getAllSubDetails:", error);
    res
      .status(500)
      .json({ message: "An error occurred while fetching the subdetails" });
  }
};

// @desc to fetch godowns
// route get/api/sUsers/fetchGodowns

export const fetchGodowns = async (req, res) => {
  const Primary_user_id = req.owner;
  const cmp_id = req.params.cmp_id;

  try {
    const godownsResult = await productModel.aggregate([
      {
        $match: {
          Primary_user_id: new mongoose.Types.ObjectId(Primary_user_id),
          cmp_id: cmp_id,
        },
      },
      { $unwind: "$GodownList" },
      {
        $match: {
          "GodownList.godown_id": { $exists: true, $ne: null, $ne: "" },
        },
      },
      {
        $group: {
          _id: "$GodownList.godown_id",
          godown: { $addToSet: "$GodownList.godown" }, // Collect unique cmp_id values for each godown
        },
      },
      { $match: { _id: { $ne: null } } },
    ]);

    const result = godownsResult.map((item) => ({
      id: item._id || "",
      godown: item.godown[0] || "",
    }));

    res.status(200).json({
      message: "Godowns  fetched",
      data: {
        godowns: result,
      },
    });
  } catch (error) {
    console.error("Error fetching godowns and pricelevel:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

// @desc to create stock transfer
// route post/api/sUsers/createStockTransfer;

export const createStockTransfer = async (req, res) => {
  try {
    const {
      selectedDate,
      orgId,
      selectedGodown,
      selectedGodownId,
      items,
      lastAmount,
      stockTransferNumber
    } = req.body;

    const transferData = {
      stockTransferNumber,
      selectedDate,
      orgId,
      selectedGodown,
      selectedGodownId,
      items,
      lastAmount,
      req,
    };

    const id = req.sUserId;
    const secondaryUser = await SecondaryUser.findById(id);

    if (!secondaryUser) {
      return res.status(404).json({
        error: "Secondary user not found",
      });
    }

    // const NumberExistence = await checkForNumberExistence(
    //   stockTransferModel,
    //   "stockTransferNumber",
    //   stockTransferNumber,
    //   orgId
    // );

    // if (NumberExistence) {
    //   return res.status(400).json({
    //     message: "Stock Transfer with the same number already exists",
    //   });
    // }


    const updatedProducts = await processStockTransfer(transferData);
    const createNewStockTransfer = await handleStockTransfer(transferData);
    const increaseSTNumber = await increaseStockTransferNumber(secondaryUser,orgId);


    res.status(200).json({
      message: "Stock transfer completed successfully",
      data: createNewStockTransfer,
    });
  } catch (error) {
    console.error("Error in stock transfer:", error);
    res.status(500).json({
      error: "Internal Server Error",
      details: error.message,
    });
  }
};

// @desc to edit stock transfer
// route post/api/sUsers/editStockTransfer;

export const editStockTransfer = async (req, res) => {
  try {
    const transferId = req.params.id;
    const {
      // ID of the stock transfer to be edited
      selectedDate,
      orgId,
      selectedGodown,
      selectedGodownId,
      items,
      lastAmount,
    } = req.body;

    // Find the existing stock transfer document by ID
    const existingTransfer = await stockTransferModel.findById(transferId);
    if (!existingTransfer) {
      return res.status(404).json({
        error: "Stock transfer not found",
      });
    }

    // Revert the stock levels affected by the existing transfer
    await revertStockTransfer(existingTransfer);
    // Process the stock transfer with the new data
    const transferData = {
      selectedDate,
      orgId,
      selectedGodown,
      selectedGodownId,
      items,
      lastAmount,
      req,
    };

    const updatedProducts = await processStockTransfer(transferData);

    // Update the existing stock transfer document with new data
    existingTransfer.selectedDate = selectedDate;
    existingTransfer.orgId = orgId;
    existingTransfer.selectedGodown = selectedGodown;
    existingTransfer.selectedGodownId = selectedGodownId;
    existingTransfer.items = items;
    existingTransfer.lastAmount = lastAmount;
    existingTransfer.updatedAt = new Date();

    await stockTransferModel.findByIdAndUpdate(
      existingTransfer._id,
      existingTransfer
    );

    res.status(200).json({
      message: "Stock transfer updated successfully",
      data: existingTransfer,
      updatedProducts,
    });
  } catch (error) {
    console.error("Error in editing stock transfer:", error);
    res.status(500).json({
      error: "Internal Server Error",
      details: error.message,
    });
  }
};
