import PrimaryUser from "../models/primaryUserModel.js";
import Organization from "../models/OragnizationModel.js";
import SecondaryUser from "../models/secondaryUserModel.js";
import generatePrimaryUserToken from "../utils/generatePrimaryToken.js";
import TallyData from "../models/TallyData.js";
import TransactionModel from "../models/TransactionModel.js";
import BankDetails from "../models/bankModel.js";
import bcrypt from "bcryptjs";
import mongoose from "mongoose";
import nodemailer from "nodemailer";
import primaryUserModel from "../models/primaryUserModel.js";
import generateNumericOTP from "../utils/generateOtp.js";
import OragnizationModel from "../models/OragnizationModel.js";
import PartyModel from "../models/partyModel.js";
import HsnModel from "../models/hsnModel.js";
import productModel from "../models/productModel.js";
import invoiceModel from "../models/invoiceModel.js";
import bankModel from "../models/bankModel.js";
import salesModel from "../models/salesModel.js";
import AdditionalChargesModel from "../models/additionalChargesModel.js";
import {
  truncateToNDecimals,
} from "../helpers/helper.js";
import purchaseModel from "../models/purchaseModel.js";
import { Brand } from "../models/subDetails.js";
import { Category } from "../models/subDetails.js";
import { Subcategory } from "../models/subDetails.js";
import { Godown } from "../models/subDetails.js";
import { PriceLevel } from "../models/subDetails.js";
import vanSaleModel from "../models/vanSaleModel.js";
import stockTransferModel from "../models/stockTransferModel.js";
import creditNoteModel from "../models/creditNoteModel.js";
import debitNoteModel from "../models/debitNoteModel.js";
import paymentModel from "../models/paymentModel.js";
import ReceiptModel from "../models/receiptModel.js";
import partyModel from "../models/partyModel.js";

// @desc Register Primary user
// route POST/api/pUsers/register

export const registerPrimaryUser = async (req, res) => {
  const session = await mongoose.startSession();

  try {
    const { userName, mobile, email, password, subscription } = req.body;

    // Start a transaction
    session.startTransaction();

    // Check if email or mobile already exists
    const userExists = await PrimaryUser.findOne({ email }).session(session);
    const mobileExists = await PrimaryUser.findOne({ mobile }).session(session);

    if (userExists) {
      await session.abortTransaction();
      session.endSession();
      return res
        .status(400)
        .json({ success: false, message: "Email already exists" });
    }

    if (mobileExists) {
      await session.abortTransaction();
      session.endSession();
      return res
        .status(400)
        .json({ success: false, message: "Mobile number already exists" });
    }

    // Create Primary User
    const primaryUser = new PrimaryUser({
      userName,
      mobile,
      email,
      password,
      subscription,
    });

    const primaryUserResult = await primaryUser.save({ session });

    if (!primaryUserResult) {
      await session.abortTransaction();
      session.endSession();
      return res
        .status(400)
        .json({ success: false, message: "Primary user registration failed" });
    }

    // Create Secondary User with role "admin"
    const secondaryUser = new SecondaryUser({
      name: userName,
      email,
      mobile,
      password: password, // Reuse the hashed password
      role: "admin",
      primaryUser: primaryUserResult._id, // Link to the primary user
      organization: [], // Leave organization empty
    });

    const secondaryUserResult = await secondaryUser.save({ session });

    if (!secondaryUserResult) {
      await session.abortTransaction();
      session.endSession();
      return res
        .status(400)
        .json({ success: false, message: "Secondary user creation failed" });
    }

    // Commit the transaction
    await session.commitTransaction();
    session.endSession();

    // Successful response
    return res.status(200).json({
      success: true,
      message: "User registration is successful",
    });
  } catch (error) {
    console.error(error);
    // Rollback in case of any error
    await session.abortTransaction();
    session.endSession();
    return res
      .status(500)
      .json({ success: false, message: "Internal server error, try again!" });
  }
};

// @desc Login Primary user
// route POST/api/pUsers/login

export const login = async (req, res) => {
  //email === email or mobile
  const { email, password } = req.body;

  try {
    let primaryUser;
    // Check if the provided email looks like an email address
    if (email.includes("@")) {
      // If it's an email address, find the user by email
      primaryUser = await PrimaryUser.findOne({ email: email });
    } else {
      // If it's not an email address, assume it's a mobile number and find the user by mobile number
      primaryUser = await PrimaryUser.findOne({ mobile: email });
    }

    if (primaryUser.isApproved === false) {
      return res.status(401).json({ message: "User approval is pending" });
    }

    if (primaryUser.isBlocked) {
      return res.status(401).json({ message: "User is blocked" });
    }

    const isPasswordMatch = await bcrypt.compare(
      password,
      primaryUser.password
    );

    if (!isPasswordMatch) {
      return res.status(400).json({ message: "Invalid email or password" });
    }

    let haveOut;

    const haveOutstanding = await TallyData.find({
      Primary_user_id: primaryUser._id,
    });

    haveOutstanding.length > 0 ? (haveOut = true) : (haveOut = false);

    const { userName, _id, sms } = primaryUser._doc;
    const token = generatePrimaryUserToken(res, primaryUser._id);

    return res.status(200).json({
      message: "Login successful",
      token,
      data: { email, userName, _id, haveOut, sms },
    });
  } catch (error) {
    console.log(error);

    return res.status(500).json({ status: false, message: "Failed to login!" });
  }
};

// @desc Logout Primary user
// route POST/api/pUsers/logout

export const primaryUserLogout = async (req, res) => {
  try {
    res.cookie("jwt_primary", "", {
      httpOnly: true,
      expires: new Date(0),
    });

    return res.status(200).json({
      message: "Logged out",
    });
  } catch (error) {
    console.log(error);

    return res.status(500).json({ status: false, message: "Failed to login!" });
  }
};

// @desc get Primary user data for sidebar
// route GET/api/pUsers/getPrimaryUserData

export const getPrimaryUserData = async (req, res) => {
  const userId = req.pUserId;
  try {
    const userData = await PrimaryUser.findById(userId);
    if (userData) {
      return res
        .status(200)
        .json({ message: "primaryUSerData fetched", data: { userData } });
    } else {
      return res
        .status(404)
        .json({ message: "primaryUSerData not found", data: { userData } });
    }
  } catch (error) {
    console.log(error);

    return res
      .status(500)
      .json({ status: false, message: "internal sever error" });
  }
};



// @desc adding secondary users
// route GET/api/pUsers/addSecUsers
export const addSecUsers = async (req, res) => {
  try {
    const { name, mobile, email, password, selectedOrg } = req.body;
    const pUserId = req.owner;

    const userExists = await SecondaryUser.findOne({ email });

    if (userExists) {
      return res
        .status(400)
        .json({ success: false, message: "Email already exists" });
    }

    const user = new SecondaryUser({
      name,
      mobile,
      email,
      password,
      organization: selectedOrg,
      primaryUser: pUserId,
    });

    const result = await user.save();

    if (result) {
      return res.status(200).json({
        success: true,
        message: "Secondary user registration is successful",
      });
    } else {
      return res.status(400).json({
        success: false,
        message: "Secondary user registration failed",
      });
    }
  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .json({ success: false, message: "Internal server error, try again!" });
  }
};

// @desc get secondary users list
// route GET/api/pUsers/fetchSecondaryUsers

export const fetchSecondaryUsers = async (req, res) => {
  const userId = new mongoose.Types.ObjectId(req.owner);
  try {
    const secondaryUsers = await SecondaryUser.find({ primaryUser: userId })
      .populate("organization")
      .exec();
    if (secondaryUsers) {
      return res.status(200).json({
        secondaryUsers: secondaryUsers,
        message: "secondaryUsers fetched",
      });
    } else {
      return res
        .status(404)
        .json({ message: "No secondaryUsers were found for user" });
    }
  } catch (error) {
    console.log(error);

    return res
      .status(500)
      .json({ success: false, message: "Internal server error, try again!" });
  }
};

// @desc get outstanding data from tally
// route GET/api/pUsers/fetchOutstanding

export const fetchOutstandingTotal = async (req, res) => {
  const userId = req.pUserId;
  const cmp_id = req.params.cmp_id;
  try {
    // const tallyData = await TallyData.find({ Primary_user_id: userId });
    const outstandingData = await TallyData.aggregate([
      { $match: { Primary_user_id: userId, cmp_id: cmp_id } },
      {
        $group: {
          _id: "$party_id",
          totalBillAmount: { $sum: "$bill_pending_amt" },
          party_name: { $first: "$party_name" },
          cmp_id: { $first: "$cmp_id" },
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
    console.log(error);

    return res
      .status(500)
      .json({ success: false, message: "Internal server error, try again!" });
  }
};

// @desc get outstanding data from tally
// route GET/api/pUsers/fetchOutstandingDetails

export const fetchOutstandingDetails = async (req, res) => {
  const userId = new mongoose.Types.ObjectId(req.pUserId);
  const partyId = req.params.id;
  const cmp_id = req.params.cmp_id;

  try {
    const outstandings = await TallyData.find({
      Primary_user_id: userId,
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
    console.log(error);

    return res
      .status(500)
      .json({ success: false, message: "Internal server error, try again!" });
  }
};

// @desc confirm collection and alter db
// route GET/api/pUsers/confirmCollection

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
    mobile_no,
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
        mobile_no,
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

// @desc for cancelling transactions
// route GET/api/pUsers/cancelTransaction

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
      console.log(`Updated bill_pending_amt for ${billNo}`);
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
// route GET/api/pUsers/fetchBanks/:cmp_id

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
    console.log(error);

    return res
      .status(500)
      .json({ status: false, message: "Internal server error" });
  }
};

// @desc fetch banks for showing added bank list
// route GET/api/sUsers/fetchBanks/:cmp_id

export const bankList = async (req, res) => {
  const userId = req.pUserId;
  const cmp_id = req.params.cmp_id;

  try {
    const bankData = await BankDetails.aggregate([
      {
        $match: {
          Primary_user_id: userId,
          cmp_id: cmp_id,
        },
      },
      {
        $project: {
          bank_name: 1,
          ac_no: 1,
          ifsc: 1,
        },
      },
    ]);

    // console.log(bankData);

    if (bankData.length > 0) {
      return res
        .status(200)
        .json({ message: "bankData fetched", data: bankData });
    } else {
      return res.status(404).json({ message: "Bank data not found" });
    }
  } catch (error) {
    console.log(error);

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
    const validEmail = await primaryUserModel.findOne({ email: email });
    if (!validEmail) {
      return res.status(400).json({ message: "Enter the registered email " });
    }

    const otp = generateNumericOTP(6);

    // Save OTP in the database
    const saveOtp = await primaryUserModel.updateOne(
      { email },
      { $set: { otp } }
    );

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
        console.log(error);

        return res.status(500).json({ error: "Error sending email" });
      } else {
        // console.log("Email Sent:" + info.response);

        return res
          .status(200)
          .json({ message: "OTP sent successfully", data: otp });
      }
    });
  } catch (error) {
    console.log(error);

    return res.status(500).json({ error: "Internal server error" });
  }
};

// @desc check otp
//  route POST/api/pUsers/submitOtp

export const submitOtp = async (req, res) => {
  const { Otp, otpEmail } = req.body;

  try {
    // Retrieve user data based on the provided email
    const user = await primaryUserModel.findOne({ email: otpEmail });

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
// route POST/api/pUsers/resetPassword

export const resetPassword = async (req, res) => {
  const { password, otpEmail } = req.body;

  try {
    // Retrieve user data based on the provided email
    const user = await primaryUserModel.findOne({ email: otpEmail });

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

// @desc toget the details of transaction or receipt
// route POST/api/pUsers/getTransactionDetails

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



// @desc adding new Hsn
// route POst/api/pUsers/addHsn
export const addHsn = async (req, res) => {
  try {
    const {
      cpm_id,
      Primary_user_id,
      hsn,
      description,
      tab,
      taxabilityType,
      igstRate,
      cgstRate,
      sgstUtgstRate,
      onValue,
      onQuantity,
      isRevisedChargeApplicable,
      rows,
    } = req.body;

    const hsnCreation = new HsnModel({
      cpm_id,
      Primary_user_id,
      hsn,
      description,
      tab,
      taxabilityType,
      igstRate,
      cgstRate,
      sgstUtgstRate,
      onValue,
      onQuantity,
      isRevisedChargeApplicable,
      rows,
    });

    const result = await hsnCreation.save();

    if (result) {
      return res.status(200).json({
        success: true,
        message: "Hsn added successfully",
      });
    } else {
      return res.status(400).json({
        success: false,
        message: "Hsn adding failed",
      });
    }
  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .json({ success: false, message: "Internal server error, try again!" });
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

// @desc fetch hsn of the companies
// route get/api/pUsers/fetchHsn

export const fetchHsn = async (req, res) => {
  const cmp_id = req.params.cmp_id;
  const userId = req.pUserId;

  try {
    const hsn = await HsnModel.find({
      cpm_id: cmp_id,
      Primary_user_id: userId,
    });

    if (hsn) {
      return res.status(200).json({ message: "hsn fetched", data: hsn });
    } else {
      return res.status(404).json({ message: "hsn data not found" });
    }
  } catch (error) {
    console.log(error);

    return res
      .status(500)
      .json({ status: false, message: "Internal server error" });
  }
};

// @desc fetch filters like category sub category etc
// route get/api/pUsers/fetchHsn

export const fetchFilters = async (req, res) => {

  console.log("primary");
  
  const cmp_id = req.params.cmp_id;
  const userId = req.pUserId;
  try {
    const filers = await OragnizationModel.findById(cmp_id);

    const data = {
      brands: filers.brands,
      categories: filers.categories,
      subcategories: filers.subcategories,
      priceLevels: filers?.levelNames.sort((a, b) =>
        a.toLowerCase().localeCompare(b.toLowerCase())
      ),
    };

    if (filers) {
      return res.status(200).json({ message: "filers fetched", data: data });
    } else {
      return res.status(404).json({ message: "filers  not found" });
    }
  } catch (error) {
    console.log(error);

    return res
      .status(500)
      .json({ status: false, message: "Internal server error" });
  }
};

// @desc getting product list
// route get/api/pUsers/getProducts

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

// @desc  getting a single product detail for edit
// route get/api/pUsers/productDetails

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

// @desc  edit product details
// route get/api/pUsers/editProduct

export const editProduct = async (req, res) => {
  const productId = req.params.id;

  try {
    const {
      pUserId: Primary_user_id,
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








// @desc create in voice
// route POST /api/pUsers/createInvoice

export const createInvoice = async (req, res) => {
  const Primary_user_id = req.pUserId;
  try {
    const {
      orgId,
      party,
      items,
      priceLevelFromRedux,
      additionalChargesFromRedux,
      lastAmount,
      orderNumber,
    } = req.body;

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

    const updatedItems = items.map((item) => {
      const selectedPriceLevel = item.Priceleveles.find(
        (priceLevel) => priceLevel.pricelevel === priceLevelFromRedux
      );
      const selectedPrice = selectedPriceLevel
        ? selectedPriceLevel.pricerate
        : null;

      let totalPrice = selectedPrice * (item.count || 1) || 0;
      if (item.discount) {
        totalPrice -= item.discount;
      } else if (item.discountPercentage) {
        const discountAmount = (totalPrice * item.discountPercentage) / 100;
        totalPrice -= discountAmount;
      }

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
        subTotal: totalPrice,
      };
    });

    let updateAdditionalCharge;
    if (additionalChargesFromRedux.length > 0) {
      updateAdditionalCharge = additionalChargesFromRedux.map((charge) => {
        const { value, taxPercentage } = charge;

        const taxAmt = (parseFloat(value) * parseFloat(taxPercentage)) / 100;
        // console.log(taxAmt);

        return {
          ...charge,
          taxAmt: taxAmt,
        };
      });
    }

    const invoice = new invoiceModel({
      serialNumber: newSerialNumber,
      cmp_id: orgId,
      partyAccount: party?.partyName,
      party,
      items: updatedItems, // Use updated items array
      priceLevel: priceLevelFromRedux,
      additionalCharges: updateAdditionalCharge,
      finalAmount: lastAmount,
      Primary_user_id,
      orderNumber,
    });

    const result = await invoice.save();

    const increaseOrderNumber = await OragnizationModel.findByIdAndUpdate(
      orgId,
      { $inc: { orderNumber: 1 } },
      { new: true }
    );

    return res.status(200).json({
      success: true,
      message: "Invoice created successfully",
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

export const addBulkProducts = async (req, res) => {
  try {
    // Assuming `data` is an array of product objects
    const products = await Promise.all(
      req.body.data.map(async (product) => {
        const newProduct = new productModel(product);
        await newProduct.save();
        return newProduct;
      })
    );

    // Send a success response with the added products
    res.status(201).json({
      message: "Bulk products added successfully",
      products: products,
    });
  } catch (error) {
    console.error("Error adding bulk products:", error);
    // Send an error response
    res.status(500).json({
      message: "Error adding bulk products",
      error: error.message,
    });
  }
};
// export const addBulkParties = async (req, res) => {
//   try {
//      // Assuming `data` is an array of product objects
//      const products = await Promise.all(req.body.data.map(async (product) => {
//        const newProduct = new productModel(product);
//        await newProduct.save();
//        return newProduct;
//      }));

//      // Send a success response with the added products
//      res.status(201).json({
//        message: 'Bulk products added successfully',
//        products: products,
//      });
//   } catch (error) {
//      console.error('Error adding bulk products:', error);
//      // Send an error response
//      res.status(500).json({
//        message: 'Error adding bulk products',
//        error: error.message,
//      });
//   }
//  };

// @desc get invoiceList
// route get/api/pUsers/invoiceList;

export const invoiceList = async (req, res) => {
  const userId = req.pUserId;
  const cmp_id = req.params.cmp_id;
  try {
    const invoiceList = await invoiceModel.find({
      Primary_user_id: userId,
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

// @desc  editHsn details
// route get/api/pUsers/addBank

// export const addBank = async (req, res) => {
//   const { acholder_name, ac_no, ifsc, bank_name, branch, upi_id, cmp_id } =
//     req.body;
//   const Primary_user_id = req.pUserId;

//   try {
//     const bank = await bankModel.create({
//       acholder_name,
//       ac_no,
//       ifsc,
//       bank_name,
//       branch,
//       upi_id,
//       cmp_id,
//       Primary_user_id,
//     });

//     if (bank) {
//       return res
//         .status(200)
//         .json({ success: true, message: "Bank added successfully" });
//     } else {
//       return res
//         .status(400)
//         .json({ success: false, message: "Adding bank failed" });
//     }
//   } catch (error) {
//     console.error(error);
//     return res
//       .status(500)
//       .json({ success: false, message: "Internal server error, try again!" });
//   }
// };

// @desc Get bank details by ID
// @route GET /api/pUsers/getBankDetails/:id
export const getBankDetails = async (req, res) => {
  try {
    const bankId = req.params.id;
    if (!bankId) {
      return res
        .status(400)
        .json({ success: false, message: "Bank ID is required" });
    }

    const bankDetails = await bankModel.findById(bankId);

    if (!bankDetails) {
      return res
        .status(404)
        .json({ success: false, message: "Bank details not found" });
    }

    return res.status(200).json({ success: true, data: bankDetails });
  } catch (error) {
    console.error(`Error fetching bank details: ${error.message}`);

    return res
      .status(500)
      .json({ success: false, message: "Internal server error, try again!" });
  }
};

// // @desc  edit edit bank details
// // route get/api/pUsers/editBank

// export const editBank = async (req, res) => {
//   const bank_id = req.params.id;

//   try {
//     const updateParty = await bankModel.findOneAndUpdate(
//       { _id: bank_id },
//       req.body,
//       { new: true }
//     );
//     res.status(200).json({
//       success: true,
//       message: "Bank updated successfully",
//       data: updateParty,
//     });
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ success: false, message: "Internal Server Error" });
//   }
// };

// @desc Get secuser details by ID
// @route GET /api/pUsers/getSecUserDetails/:id
export const getSecUserDetails = async (req, res) => {
  try {
    const secId = req.params.id;

    const secUserDetails = await SecondaryUser.findById(secId);

    if (!secUserDetails) {
      return res
        .status(404)
        .json({ success: false, message: "User details not found" });
    }

    return res.status(200).json({ success: true, data: secUserDetails });
  } catch (error) {
    console.error(`Error fetching bank details: ${error.message}`);

    return res
      .status(500)
      .json({ success: false, message: "Internal server error, try again!" });
  }
};

// @desc   edit editSecUSer details
// route get/api/pUsers/editSecUSer/id

export const editSecUSer = async (req, res) => {
  const secUserId = req.params.id;
  const { name, mobile, email, organization, password } = req.body;

  try {
    if (password !== "") {
      // If password is not empty, hash and update it
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);
      req.body.password = hashedPassword;
    } else {
      // If password is empty, remove it from req.body to prevent updating
      delete req.body.password;
    }

    const updateParty = await SecondaryUser.findOneAndUpdate(
      { _id: secUserId },
      req.body,
      { new: true }
    );

    res.status(200).json({
      success: true,
      message: "User updated successfully",
      data: updateParty,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Internal Server Error" });
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
// route get/api/pUsers/getTransactionDetails

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
// route POST /api/pUsers/createInvoice
export const editInvoice = async (req, res) => {
  const Primary_user_id = req.pUserId;
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
    } = req.body;

    // Calculate updated items
    const updatedItems = items.map((item) => {
      const selectedPriceLevel = item.Priceleveles.find(
        (priceLevel) => priceLevel.pricelevel === priceLevelFromRedux
      );
      const selectedPrice = selectedPriceLevel
        ? selectedPriceLevel.pricerate
        : null;

      let totalPrice = selectedPrice * (item.count || 1) || 0;
      if (item.discount) {
        totalPrice -= item.discount;
      } else if (item.discountPercentage) {
        const discountAmount = (totalPrice * item.discountPercentage) / 100;
        totalPrice -= discountAmount;
      }

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
        subTotal: totalPrice,
      };
    });

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

    // Update the invoice document
    const result = await invoiceModel.findByIdAndUpdate(
      invoiceId,
      {
        cmp_id: orgId,
        party,
        items: updatedItems,
        priceLevel: priceLevelFromRedux,
        additionalCharges: updateAdditionalCharge,
        finalAmount: lastAmount,
        Primary_user_id,
        orderNumber,
      },
      { new: true }
    );

    return res.status(200).json({
      success: true,
      message: "Invoice Updated successfully",
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

// @desc adding additional charges in orgData
// route POST /api/pUsers/addAdditionalCharge

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

// @desc delete AdditionalCharge
// route get/api/pUsers/deleteAdditionalCharge

export const deleteAdditionalCharge = async (req, res) => {
  try {
    const id = req.params.id;
    const addlId = new mongoose.Types.ObjectId(id);

    // console.log(addlId);

    const cmp_id = req.params.cmp_id;
    const org = await OragnizationModel.findById(cmp_id);
    // console.log("org", org);

    const indexToDelete = org.additionalCharges.findIndex((item) =>
      item._id.equals(addlId)
    );
    // console.log("indexToDelete", indexToDelete);

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

// @desc update AdditionalCharge
// route get/api/pUsers/EditAditionalCharge

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
// route get/api/pUsers/addTermsAndConditions

export const addconfigurations = async (req, res) => {
  const cmp_id = req.params.cmp_id;
  try {
    const org = await OragnizationModel.findById(cmp_id);
    if (!org) {
      return res.status(404).json({ message: "Organization not found" });
    }

    const {
      selectedBank,
      termsList,
      enableBillToShipTo,
      despatchDetails,
      taxInclusive,
    } = req.body;

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
      taxInclusive,
      printConfiguration: org.configurations[0].printConfiguration,
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

// @desc   saveSalesNumber
// route post/api/pUsers/saveSalesNumber/cmp_id

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

// route POST /api/pUsers/createSale

export const createSale = async (req, res) => {
  const changedGodowns = [];
  const Primary_user_id = req.pUserId;
  try {
    const {
      orgId,
      party,
      items,
      priceLevelFromRedux,
      additionalChargesFromRedux,
      lastAmount,
      salesNumber,
    } = req.body;

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

      // Calculate the new balance stock
      const productBalanceStock = truncateToNDecimals(product.balance_stock, 3);

      const itemCount = truncateToNDecimals(item.count, 3);
      const newBalanceStock = truncateToNDecimals(
        productBalanceStock - itemCount,
        3
      );
      // console.log("newBalanceStock",newBalanceStock);

      // Prepare product update operation
      productUpdates.push({
        updateOne: {
          filter: { _id: product._id },
          update: { $set: { balance_stock: newBalanceStock } },
        },
      });

      // Update the godown stock for each specified godown
      for (const godown of item.GodownList) {
        // Find the corresponding godown in the product's GodownList
        const godownIndex = product.GodownList.findIndex(
          (g) => g.godown_id === godown.godown_id
        );
        if (godownIndex !== -1) {
          // Calculate the new godown stock
          const newGodownStock = truncateToNDecimals(
            product.GodownList[godownIndex].balance_stock - godown.count,
            3
          );

          // Prepare godown update operation
          godownUpdates.push({
            updateOne: {
              filter: { _id: product._id, "GodownList.godown": godown.godown },
              update: {
                $set: { "GodownList.$.balance_stock": godown.balance_stock },
              },
            },
          });

          // If a godown was updated and the stock has actually changed, add it to the changedGodowns array
          if (
            godownIndex !== -1 &&
            newGodownStock !==
              parseInt(product.GodownList[godownIndex].balance_stock)
          ) {
            changedGodowns.push({
              godown_id: godown.godown_id,
              newBalanceStock: newGodownStock,
            });
          }
        }
      }
    }

    // Execute bulk operations
    await productModel.bulkWrite(productUpdates);
    await productModel.bulkWrite(godownUpdates);

    const lastSale = await salesModel.findOne(
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
      const selectedPriceLevel = item.Priceleveles.find(
        (priceLevel) => priceLevel.pricelevel === priceLevelFromRedux
      );
      const selectedPrice = selectedPriceLevel
        ? selectedPriceLevel.pricerate
        : null;

      let totalPrice = selectedPrice * (item.count || 1) || 0; // Default count to 1 if not provided
      if (item.discount) {
        totalPrice -= item.discount;
      } else if (item.discountPercentage) {
        const discountAmount = (totalPrice * item.discountPercentage) / 100;
        totalPrice -= discountAmount;
      }

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

    // Continue with the rest of your function...
    const sales = new salesModel({
      serialNumber: newSerialNumber,
      partyAccount: party?.partyName,
      cmp_id: orgId,
      party,
      items: updatedItems,
      priceLevel: priceLevelFromRedux,
      additionalCharges: updateAdditionalCharge,
      finalAmount: lastAmount,
      Primary_user_id,
      salesNumber,
    });

    const result = await sales.save();

    const increaseSalesNumber = await OragnizationModel.findByIdAndUpdate(
      orgId,
      { $inc: { salesNumber: 1 } },
      { new: true }
    );

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
    };

    const updatedDocument = await TallyData.findOneAndUpdate(
      {
        cmp_id: orgId,
        bill_no: salesNumber,
        Primary_user_id: Primary_user_id,
        party_id: party?.party_master_id,
      },
      billData,
      { upsert: true, new: true }
    );

    return res.status(200).json({
      success: true,
      message: "Sale created successfully",
      data: result,
      // billData: addedInBillData,
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

// @desc toget the godown list
// route get/api/pUsers/fetchGodowns

export const fetchGodownsAndPriceLevels = async (req, res) => {
  const Primary_user_id = req.owner;
  const cmp_id = req.params.cmp_id;

  try {
    // Fetch unique price levels from products
    const priceLevelsResult = await productModel.aggregate([
      {
        $match: {
          Primary_user_id: new mongoose.Types.ObjectId(Primary_user_id),
          cmp_id: cmp_id,
        },
      },
      { $unwind: "$Priceleveles" },
      {
        $match: {
          "Priceleveles.pricelevel": { $exists: true, $ne: null, $ne: "" },
        },
      },
      {
        $group: {
          _id: "$Priceleveles.pricelevel",
          priceRate: { $first: "$Priceleveles.pricerate" },
        },
      },
    ]);

    // Fetch unique godowns from products
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
          godown: { $addToSet: "$GodownList.godown" },
        },
      },
      { $match: { _id: { $ne: null } } },
    ]);

    console.log("Primary_user_id", Primary_user_id);
    

    // Fetch unique subgroups from parties
    const subGroupsResult = await partyModel.aggregate([
      {
        $match: {
          Primary_user_id: Primary_user_id.toString(),
          cmp_id: cmp_id,
          subGroup_id: { $exists: true, $ne: null, $ne: "" },
        },
      },
      {
        $group: {
          _id: "$subGroup_id",
          subGroup: { $first: "$subGroup" }, // Taking the first occurrence
        },
      },
    ]);


    console.log("subGroupsResult", subGroupsResult);
    

    // Formatting results
    const godownsWithPriceLevels = godownsResult.map((item) => ({
      id: item._id,
      godown: item.godown,
    }));

    const uniquePriceLevels = priceLevelsResult.map((item) => ({
      priceLevel: item._id,
      priceRate: item.priceRate,
    }));

    const uniqueSubGroups = subGroupsResult.map((item) => ({
      subGroup_id: item._id,
      subGroup: item.subGroup,
    }));

    res.status(200).json({
      message: "Godowns, Unique Price Levels, and Sub Groups fetched",
      data: {
        godowns: godownsWithPriceLevels,
        priceLevels: uniquePriceLevels,
        subGroups: uniqueSubGroups,
      },
    });
  } catch (error) {
    console.error(
      "Error fetching godowns, price levels, and sub groups:",
      error
    );
    res.status(500).json({ error: "Internal Server Error" });
  }
};

// @desc  fetchAdditionalDetails
// route get/api/pUsers/fetchAdditionalDetails

export const fetchAdditionalDetails = async (req, res) => {
  const cmp_id = req.params.cmp_id;
  const Primary_user_id = req.pUserId;

  try {
    const priceLevelsResult = await productModel.aggregate([
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
      priceLevels: priceLevelsResult[0]?.pricelevels || [],
      brands: brandResults[0]?.brands || [],
      categories: categoryResults[0]?.categories || [],
      subcategories: subCategoryResults[0]?.subcategories || [],
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

// @desc  adding configurations for secondary
// route post/api/pUsers/addSecondaryConfigurations

export const addSecondaryConfigurations = async (req, res) => {
  const cmp_id = req.params.cmp_id;
  const Primary_user_id = req.owner;
  const secondary_user_id = req.params.userId;

  try {
    const {
      selectedPriceLevels,
      salesConfiguration,
      salesOrderConfiguration,
      receiptConfiguration,
      paymentConfiguration,
      vanSaleConfiguration,
      stockTransferConfiguration,
      creditNoteConfiguration,
      debitNoteConfiguration,
      purchaseConfiguration,
      selectedVanSaleGodowns,
      selectedVanSaleSubGroups,
      vanSale,
    } = req.body;
    let { selectedGodowns } = req.body;

    if (selectedGodowns.every((godown) => godown === null)) {
      selectedGodowns = [];
    }

    const NeworderNumber = salesOrderConfiguration.currentNumber || 0;
    const NewsalesNumber = salesConfiguration.currentNumber || 0;
    const NewreceiptNumber = receiptConfiguration.currentNumber || 0;
    const NewvanSalesNumber = vanSaleConfiguration.currentNumber || 0;
    const NewpurchaseNumber = purchaseConfiguration.currentNumber || 0;
    const NewstockTransferNumber =
      stockTransferConfiguration.currentNumber || 0;
    const NewcreditNoteNumber = creditNoteConfiguration.currentNumber || 0;
    const NewdebitNoteNumber = debitNoteConfiguration.currentNumber || 0;
    const NewPaymentNumber = paymentConfiguration.currentNumber || 0;

    const dataToAdd = {
      organization: cmp_id,
      selectedGodowns,
      selectedPriceLevels,
      salesConfiguration,
      salesOrderConfiguration,
      receiptConfiguration,
      paymentConfiguration,
      purchaseConfiguration,
      stockTransferConfiguration,
      creditNoteConfiguration,
      debitNoteConfiguration,
      vanSaleConfiguration,
      selectedVanSaleGodowns,
      selectedVanSaleSubGroups,
      vanSale,
    };

    const secUser = await SecondaryUser.findById(secondary_user_id);

    if (!secUser) {
      return res.status(404).json({ error: "Secondary user not found" });
    }

    const newCmpId = new mongoose.Types.ObjectId(cmp_id);

    const existingConfigIndex = secUser.configurations.findIndex((config) => {
      return config.organization.equals(newCmpId);
    });

    let existingConfig;

    if (existingConfigIndex == -1) {
      const company = await OragnizationModel.findById(newCmpId);

      if (!company) {
        return res.status(404).json({ error: "Company not found" });
      }
      existingConfig = {
        orderNumber: company.orderNumber,
        salesNumber: company.salesNumber,
        purchaseNumber: company.purchaseNumber,
        receiptNumber: company.receiptNumber,
        paymentNumber: company.paymentNumber,
        vanSalesNumber: company.vanSalesNumber,
        stockTransferNumber: company.stockTransferNumber,
        creditNoteNumber: company.creditNoteNumber,
        debitNoteNumber: company.debitNoteNumber,
      };
    } else {
      const existingConfiguration = secUser.configurations[existingConfigIndex];

      existingConfig = {
        orderNumber: existingConfiguration.orderNumber,
        salesNumber: existingConfiguration.salesNumber,
        purchaseNumber: existingConfiguration.purchaseNumber,
        receiptNumber: existingConfiguration.receiptNumber,
        paymentNumber: existingConfiguration.paymentNumber,
        vanSalesNumber: existingConfiguration.vanSalesNumber,
        stockTransferNumber: existingConfiguration.stockTransferNumber,
        creditNoteNumber: existingConfiguration.creditNoteNumber,
        debitNoteNumber: existingConfiguration.debitNoteNumber,
      };
    }

    const changes = {
      orderNumber: existingConfig.orderNumber !== NeworderNumber,
      salesNumber: existingConfig.salesNumber !== NewsalesNumber,
      purchaseNumber: existingConfig.purchaseNumber !== NewpurchaseNumber,
      receiptNumber: existingConfig.receiptNumber !== NewreceiptNumber,
      paymentNumber: existingConfig.paymentNumber !== NewPaymentNumber,
      vanSalesNumber: existingConfig.vanSalesNumber !== NewvanSalesNumber,
      stockTransferNumber:
        existingConfig.stockTransferNumber !== NewstockTransferNumber,
      creditNoteNumber: existingConfig.creditNoteNumber !== NewcreditNoteNumber,
      debitNoteNumber: existingConfig.debitNoteNumber !== NewdebitNoteNumber,
    };

    const checkForNumberExistence = async (
      model,
      fieldName,
      newValue,
      cmp_id
    ) => {
      const centralNumber = parseInt(newValue, 10);
      const regex = new RegExp(
        `^(${centralNumber}|.*-(0*${centralNumber})-.*)$`
      );
      const docs = await model.find({
        [fieldName]: { $regex: regex },
        cmp_id: cmp_id,
      });

      return docs.length > 0;
    };

    if (changes.salesNumber) {
      const salesExists = await checkForNumberExistence(
        salesModel,
        "salesNumber",
        NewsalesNumber,
        cmp_id
      );

      if (salesExists) {
        return res.status(400).json({
          message: `Sales is added with this number ${NewsalesNumber}`,
        });
      }
    }

    if (changes.orderNumber) {
      const orderExists = await checkForNumberExistence(
        invoiceModel,
        "orderNumber",
        NeworderNumber,
        cmp_id
      );

      if (orderExists) {
        return res.status(400).json({
          message: `Order is added with this number ${NeworderNumber}`,
        });
      }
    }

    if (changes.purchaseNumber) {
      const purchaseExists = await checkForNumberExistence(
        purchaseModel,
        "purchaseNumber",
        NewpurchaseNumber,
        cmp_id
      );
      if (purchaseExists) {
        return res.status(400).json({
          message: `Purchase is added with this number ${NewpurchaseNumber}`,
        });
      }
    }

    if (changes.receiptNumber) {
      const receiptExists = await checkForNumberExistence(
        ReceiptModel,
        "receiptNumber",
        NewreceiptNumber
      );
      if (receiptExists) {
        return res.status(400).json({
          message: `Receipt is added with this number ${NewreceiptNumber}`,
        });
      }
    }

    if (changes.paymentNumber) {
      const paymentExists = await checkForNumberExistence(
        paymentModel,
        "paymentNumber",
        NewPaymentNumber,
        cmp_id
      );
      if (paymentExists) {
        return res.status(400).json({
          message: `Payment is added with this number ${NewPaymentNumber}`,
        });
      }
    }

    if (changes.vanSalesNumber) {
      const vanSalesExists = await checkForNumberExistence(
        vanSaleModel,
        "salesNumber",
        NewvanSalesNumber,
        cmp_id
      );
      if (vanSalesExists) {
        return res.status(400).json({
          message: `Van Sales is added with this number ${NewvanSalesNumber}`,
        });
      }
    }
    if (changes.stockTransferNumber) {
      const stockTransferExists = await checkForNumberExistence(
        stockTransferModel,
        "stockTransferNumber",
        NewstockTransferNumber,
        cmp_id
      );
      if (stockTransferExists) {
        return res.status(400).json({
          message: `Stock Transfer is added with this number ${NewstockTransferNumber}`,
        });
      }
    }

    if (changes.creditNoteNumber) {
      const creditNoteExists = await checkForNumberExistence(
        creditNoteModel,
        "creditNoteNumber",
        NewcreditNoteNumber,
        cmp_id
      );
      if (creditNoteExists) {
        return res.status(400).json({
          message: `Credit Note is added with this number ${NewcreditNoteNumber}`,
        });
      }
    }

    if (changes.debitNoteNumber) {
      const debitNoteExists = await checkForNumberExistence(
        debitNoteModel,
        "debitNoteNumber",
        NewdebitNoteNumber,
        cmp_id
      );
      if (debitNoteExists) {
        return res.status(400).json({
          message: `Debit Note is added with this number ${NewdebitNoteNumber}`,
        });
      }
    }

    if (existingConfigIndex !== -1) {
      // Configuration already exists
      const existingConfig = secUser.configurations[existingConfigIndex];

      // Preserve existing counts while updating other fields
      secUser.configurations[existingConfigIndex] = {
        ...existingConfig.toObject(),
        ...dataToAdd,
        orderNumber: NeworderNumber,
        salesNumber: NewsalesNumber,
        purchaseNumber: NewpurchaseNumber,
        receiptNumber: NewreceiptNumber,
        paymentNumber: NewPaymentNumber,
        vanSalesNumber: NewvanSalesNumber,
        stockTransferNumber: NewstockTransferNumber,
        creditNoteNumber: NewcreditNoteNumber,
        debitNoteNumber: NewdebitNoteNumber,
      };
    } else {
      // Configuration does not exist, create new
      const newConfiguration = {
        ...dataToAdd,
        orderNumber: NeworderNumber,
        salesNumber: NewsalesNumber,
        purchaseNumber: NewpurchaseNumber,
        receiptNumber: NewreceiptNumber,
        paymentNumber: NewPaymentNumber,
        vanSalesNumber: NewvanSalesNumber,
        stockTransferNumber: NewstockTransferNumber,
        creditNoteNumber: NewcreditNoteNumber,
        debitNoteNumber: NewdebitNoteNumber,
      };
      secUser.configurations.push(newConfiguration);
    }

    // console.log("secUser.configurations", secUser.configurations);

    const result = await secUser.save();

    if (result) {
      return res
        .status(200)
        .json({ success: true, message: "User configuration is successful" });
    } else {
      return res
        .status(400)
        .json({ success: false, message: "User configuration failed" });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

export const findPrimaryUserGodowns = async (req, res) => {
  const cmp_id = req.params.cmp_id;
  const Primary_user_id = req.pUserId;
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

    if (godownsResult) {
      res.json({
        message: "additional details fetched",
        godowndata: godownsResult,
      });
    }
  } catch (error) {
    res.status(500).json({ error: "Internal Server Error" });
  }
};
export const findPrimaryUserGodownsSelf = async (req, res) => {
  const cmp_id = req.params.cmp_id;
  const pUser = req.pUserId;

  try {
    const godowns = await Organization.find({ _id: cmp_id, owner: pUser });

    if (godowns) {
      res.json({
        message: "additional details fetched",
        godowndata: godowns[0],
      });
    }
  } catch (error) {
    res.status(500).json({ error: "Internal Server Error" });
  }
};
export const godownwiseProducts = async (req, res) => {
  try {
    const cmp_id = req.params.cmp_id;
    const godown_id = req.params.godown_id;

    const puser_id = req.pUserId; // Assuming req.pUserId contains the user ID

    const products = await productModel.aggregate([
      // Match products based on cmp_id, puser_id, and godown_id
      {
        $match: {
          cmp_id: cmp_id,
          Primary_user_id: new mongoose.Types.ObjectId(puser_id), // Assuming puser_id is a MongoDB ObjectId
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
    // console.log(products)

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

    const puser_id = req.pUserId; // Assuming req.pUserId contains the user ID

    const products = await productModel.aggregate([
      // Match products based on cmp_id, puser_id, and godown_id
      {
        $match: {
          cmp_id: cmp_id,
          Primary_user_id: new mongoose.Types.ObjectId(puser_id), // Assuming puser_id is a MongoDB ObjectId
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
    // console.log(products)

    res.json(products);
  } catch (error) {
    console.error("Error fetching godownwise products:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

// @desc get ** all ** subDetails of product such as brand category subcategory etc
// route get/api/pUsers/getProductSubDetails

export const getAllSubDetails = async (req, res) => {
  try {
    const cmp_id = req.params.orgId;
    const Primary_user_id = req.pUserId;

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
        Godown.find({ cmp_id, Primary_user_id }).select(
          "_id godown  defaultGodown"
        ),
        PriceLevel.find({ cmp_id, Primary_user_id }).select("_id pricelevel"),
      ]);

    const result = {
      brands: brands.map((b) => ({ _id: b._id, name: b.brand })),
      categories: categories.map((c) => ({ _id: c._id, name: c.category })),
      subcategories: subcategories.map((s) => ({
        _id: s._id,
        name: s.subcategory,
      })),
      godowns: godowns.map((g) => ({
        _id: g._id,
        name: g.godown,
        defaultGodown: g.defaultGodown,
      })),
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

// @desc get ** all ** current numbers of sales sale orders etc
// route get/api/pUsers/fetchConfigurationCurrentNumber
export const fetchConfigurationCurrentNumber = async (req, res) => {
  const cmp_id = req.params.orgId;
  const secondary_user_id = req.params._id;

  if (!cmp_id || !secondary_user_id) {
    console.log(
      "cmp_id and secondary_user_id are required in fetchConfigurationCurrentNumber "
    );
    return res
      .status(400)
      .json({ message: "cmp_id and secondary_user_id are required" });
  }

  try {
    const secUser = await SecondaryUser.findById(secondary_user_id);
    const company = await OragnizationModel.findById(cmp_id);
    if (!secUser) {
      return res.status(404).json({ message: "User not found" });
    }

    let configuration = secUser.configurations.find(
      (item) => item.organization.toString() === cmp_id
    );

    if (!configuration) {
      configuration = company;
    }

    // console.log("configuration", configuration);

    const {
      orderNumber,
      salesNumber,
      purchaseNumber,
      receiptNumber,
      paymentNumber,
      vanSalesNumber,
      stockTransferNumber,
      creditNoteNumber,
      debitNoteNumber,
    } = configuration;

    // console.log("creditNoteNumber", creditNoteNumber);

    return res.status(200).json({
      message: "Configuration numbers retrieved successfully",
      salesOrderNumber: orderNumber,
      salesNumber,
      purchaseNumber,
      receiptNumber,
      paymentNumber,
      vanSaleNumber: vanSalesNumber,
      stockTransferNumber,
      creditNoteNumber,
      debitNoteNumber,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};
