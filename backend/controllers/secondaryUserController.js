import SecondaryUser from "../models/secondaryUserModel.js";
import generateSecToken from "../utils/generateSecondaryToken.js";
import TallyData from "../models/TallyData.js";
import TransactionModel from "../models/TransactionModel.js";
import  BankDetails from '../models/bankModel.js'
import generateNumericOTP from "../utils/generateOtp.js";
import nodemailer from 'nodemailer'

import bcrypt from "bcryptjs";
import mongoose from "mongoose";

// @desc Login secondary user
// route POST/api/sUsers/login

export const login = async (req, res) => {
  const { email, password } = req.body;

  try {
    let secUser;
    // Check if the provided email looks like an email address
    if (email.includes('@')) {
      // If it's an email address, find the user by email
      secUser = await SecondaryUser.findOne({ email: email });
    } else {
      // If it's not an email address, assume it's a mobile number and find the user by mobile number
      secUser = await SecondaryUser.findOne({ mobile: email });
    }

    if (!secUser) {
      return res.status(404).json({ message: "Invalid User" });
    }

    if (!secUser.isApproved) {
      return res.status(401).json({ message: "User approval is pending" });
    }

    if (secUser.isBlocked) {
      return res.status(401).json({ message: "User is blocked" });
    }

    const isPasswordMatch = await bcrypt.compare(password, secUser.password);

    if (!isPasswordMatch) {
      return res.status(400).json({ message: "Invalid email or password" });
    }

    const { name, _id,mobile } = secUser._doc;
    console.log("mobile",mobile);
    const token = generateSecToken(res, secUser._id);

    return res.status(200).json({
      message: "Login successful",
      token,
      data: { email, name, _id,mobile },
    });

    
  } catch (error) {
    console.log(error);
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
      select: "_id name",
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
    console.log(error);
    return res
      .status(500)
      .json({ status: false, message: "internal sever error" });
  }
};

// @desc get outstanding data from tally
// route GET/api/sUsers/fetchOutstanding

export const fetchOutstandingTotal = async (req, res) => {
  const cmp_id = req.params.cmp_id;
  console.log("cmp_id", cmp_id);
  try {
    // const tallyData = await TallyData.find({ Primary_user_id: userId });
    const outstandingData = await TallyData.aggregate([
      { $match: { cmp_id: cmp_id } },
      {
        $group: {
          _id: "$party_id",
          totalBillAmount: { $sum: "$bill_pending_amt" },
          party_name: { $first: "$party_name" },
          cmp_id: { $first: "$cmp_id" },
          user_id:{ $first: "$user_id"}
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
// route GET/api/sUsers/fetchOutstandingDetails

export const fetchOutstandingDetails = async (req, res) => {
  const partyId = req.params.party_id;
  const cmp_id = req.params.cmp_id;
  console.log("cmp_id", cmp_id);
  console.log("partyId", partyId);
  try {
    const outstandings = await TallyData.find({
      party_id: partyId,
      cmp_id: cmp_id,
      bill_pending_amt: { $gt: 0 } 
    }).sort({bill_date:1});
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

  console.log("PaymentMethod", PaymentMethod);
  console.log("paymentDetails", paymentDetails);
  console.log("agentName", agentName);
  console.log("agentId", agentId);

  const {
    party_id,
    party_name,
    totalBillAmount,
    cmp_id,
    billData,
    enteredAmount,
  } = collectionDetails;

  console.log("collectionDetails", collectionDetails);

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

      const savedTransaction=await transaction.save();

      res.status(200).json({ message: "Your Collection is confirmed",id:savedTransaction._id });
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

  try {
    const transactions = await TransactionModel.aggregate([
      { $match: { agentId: userId } },
      // { $unwind: "$billData" }, // Unwind the billData array
      {
        $project: {
          _id: 1,
          party_id: 1,
          party_name: 1,
          enteredAmount: 1,
          isCancelled:1,
          createdAt:1,
          // totalBillAmount: 1,
          cmp_id: 1,
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

    if (transactions.length > 0) {
      return res.status(200).json({
        message: "Transactions fetched",
        data: { transactions },
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
          currentAmount: { $sum: ["$billData.settledAmount", "$billData.remainingAmount"] }
        }
      },
    ]);

    console.log("Transactions to update:", transactions);

    for (const { billNo, currentAmount } of transactions) {
      await TallyData.updateOne({ bill_no: billNo }, { $set: { bill_pending_amt: currentAmount } });
      console.log(`Updated bill_pending_amt for ${billNo}`);
    }

    await TransactionModel.updateOne({ _id: transactionId }, { $set: { isCancelled: true } });


    

    res.status(200).json({ success: true, message: "Transaction canceled successfully" });
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
          bank_ledname: 1,
        },
      },
    ]);

    if (bankData.length > 0) {
      return res.status(200).json({ message: "bankData fetched", data: bankData });
    } else {
      return res.status(404).json({ message: "Bank data not found" });
    }
  } catch (error) {
    console.log(error);
    return res.status(500).json({ status: false, message: "Internal server error" });
  }
};


// @desc send otp for forgot password
// route GET/api/sUsers/fetchBanks/:cmp_id

export const sendOtp = async (req, res) => {
  const { email } = req.body;
  console.log("email", email);

  try {
    const validEmail = await SecondaryUser.findOne({ email: email });
    if (!validEmail) {
      return res.status(400).json({ message: "Enter the registered email " });
    }

    const otp = generateNumericOTP(6);
    console.log("otp", otp);

    // Save OTP in the database
    const saveOtp = await SecondaryUser.updateOne(
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
        console.log("Email Sent:" + info.response);
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
//  route POST/api/sUsers/submitOtp

export const submitOtp = async (req, res) => {
  const { Otp, otpEmailSec } = req.body;
  console.log("otpEmailSec",otpEmailSec);

  try {
    // Retrieve user data based on the provided email
    const user = await SecondaryUser.findOne({ email: otpEmailSec });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Check if the user has an OTP and if it matches the submitted OTP
    if (user.otp !== parseInt(Otp)) {
      return res.status(400).json({ message: 'Invalid OTP' });
    }

    // // Check if the OTP has expired
    // if (user.otpExpiration && user.otpExpiration < Date.now()) {
    //   return res.status(400).json({ message: 'OTP has expired' });
    // }

    // If all checks pass, you can consider the OTP valid
    return res.status(200).json({ message: 'OTP is valid' });

  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Internal server error' });
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
      return res.status(404).json({ message: 'User not found' });
    }

    // Update the user's password
    user.password = password;

    // Save the updated user data
    await user.save();

    return res.status(200).json({ message: 'Password reset successful' });

  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};


// @desc to get the details of transaction or receipt
// route GET/api/sUsers/getTransactionDetails

export const getTransactionDetails = async (req, res) => {
  const receiptId = req.params.id;
  
  try {
    const receiptDetails = await TransactionModel.findById(receiptId);
    
    if (receiptDetails) {
      res.status(200).json({message:"reception details fetched",data:receiptDetails });
    } else {
      res.status(404).json({ error: "Receipt not found" });
    }
  } catch (error) {
    console.error("Error fetching receipt details:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
}




