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

// @desc Register Primary user
// route POST/api/pUsers/register

export const registerPrimaryUser = async (req, res) => {
  try {
    const { userName, mobile, email, password, subscription } = req.body;

    const userExists = await PrimaryUser.findOne({ email });
    const mobileExists = await PrimaryUser.findOne({ mobile });

    if (userExists) {
      return res
        .status(400)
        .json({ success: false, message: "Email already exists" });
    }

    if (mobileExists) {
      return res
        .status(400)
        .json({ success: false, message: "Mobile number already exists" });
    }

    const user = new PrimaryUser({
      userName,
      mobile,
      email,
      password,
      subscription,
    });

    const result = await user.save();

    if (result) {
      return res
        .status(200)
        .json({ success: true, message: "User registration is successful" });
    } else {
      return res
        .status(400)
        .json({ success: false, message: "User registration failed" });
    }
  } catch (error) {
    console.error(error);
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

  console.log(email);

  try {
    let primaryUser;
    // Check if the provided email looks like an email address
    if (email.includes('@')) {
      // If it's an email address, find the user by email
      primaryUser = await PrimaryUser.findOne({ email: email });
    } else {
      // If it's not an email address, assume it's a mobile number and find the user by mobile number
      primaryUser = await PrimaryUser.findOne({ mobile: email });
    }

    if (!primaryUser.isApproved) {
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

    const { userName, _id,sms } = primaryUser._doc;
    const token = generatePrimaryUserToken(res, primaryUser._id);

    return res.status(200).json({
      message: "Login successful",
      token,
      data: { email, userName, _id, haveOut,sms},
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

// @desc Adding organizations by primary users
// route POST/api/pUsers/addOrganizations
export const addOrganizations = async (req, res) => {
  const { name,  pin, state, country, email, mobile, gst, logo ,  flat,
    road,
    landmark, senderId, website,
    pan,
    financialYear,
    username,
    password} =
    req.body;
  console.log(req.file);
  console.log(req.body);
  const owner = req.pUserId;
  try {
    const organization = await Organization.create({
      name,
      // place,
      pin,
      state,
      country,
      owner,
      email,
      mobile,
      logo,
      flat,
      road,
      landmark,
      senderId,
      username,
      password,
      website,
      pan,
      financialYear,
      gstNum: gst,
    });

    if (organization) {
      return res
        .status(200)
        .json({ success: true, message: "Organization added successfully" });
    } else {
      return res
        .status(400)
        .json({ success: false, message: "Adding organization failed" });
    }
  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .json({ success: false, message: "Internal server error, try again!" });
  }
};

// @desc get Primary user organization list
// route GET/api/pUsers/getOrganizations

export const getOrganizations = async (req, res) => {
  const userId = new mongoose.Types.ObjectId(req.pUserId);
  console.log(userId);
  try {
    const organizations = await Organization.find({ owner: userId });
    if (organizations) {
      return res.status(200).json({
        organizationData: organizations,
        message: "Organization fetched",
      });
    } else {
      return res
        .status(404)
        .json({ message: "No organization were found for user" });
    }
  } catch (error) {
    console.log(error);
    return res
      .status(500)
      .json({ success: false, message: "Internal server error, try again!" });
  }
};


// @desc get organization detail foe edit
// route GET/api/pUsers/getOrganizations

export const getSingleOrganization = async (req, res) => {
  const OrgId = new mongoose.Types.ObjectId(req.params.id);
  console.log("OrgId",OrgId);
  try {
    const organization = await Organization.findById(OrgId)
    if (organization) {
      return res.status(200).json({
        organizationData: organization,
        message: "Organization fetched",
      });
    } else {
      return res
        .status(404)
        .json({ message: "No organization found " });
    }
  } catch (error) {
    console.log(error);
    return res
      .status(500)
      .json({ success: false, message: "Internal server error, try again!" });
  }
};





// @desc Edit organization
// @route POST /api/pUsers/editOrg/:id

export const editOrg = async (req, res) => {
  const orgId = req.params.id;
  try {
    const updatedOrg = await Organization.findByIdAndUpdate(orgId, req.body, {
      new: true, 
      runValidators: true, 
    });

    if (!updatedOrg) {
      return res.status(404).json({ success: false, message: 'Organization not found' });
    }

    return res.status(200).json({ success: true, data: updatedOrg ,message: 'Company updated successfully'});
  } catch (error) {
    console.error('Error updating organization:', error);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
};









// @desc adding secondary users
// route GET/api/pUsers/addSecUsers
export const addSecUsers = async (req, res) => {
  try {
    const { name, mobile, email, password, selectedOrg } = req.body;
    const pUserId = req.pUserId;

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
  const userId = new mongoose.Types.ObjectId(req.pUserId);
  console.log(userId);
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
  try {
    // const tallyData = await TallyData.find({ Primary_user_id: userId });
    const outstandingData = await TallyData.aggregate([
      { $match: { Primary_user_id: userId } },
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
  console.log("cmp_id", cmp_id);
  console.log("partyId", partyId);
  console.log(userId);
  try {
    const outstandings = await TallyData.find({
      Primary_user_id: userId,
      party_id: partyId,
      cmp_id: cmp_id,
      bill_pending_amt: { $gt: 0 },
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
    mobile_no

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
        mobile_no
      });

      const savedTransaction=await transaction.save();
      console.log("savedTransaction",savedTransaction);

      res.status(200).json({ message: "Your Collection is confirmed" ,id:savedTransaction._id});
      console.log("Documents updated successfully");
    } else {
      console.log("No matching documents found for the given criteria");
    }

  } catch (error) {
    console.error("Error updating documents:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

// @desc for getting transactions
// route GET/api/pUsers/transactions

export const transactions = async (req, res) => {
  const userId = req.pUserId;

  try {
    const transactions = await TransactionModel.aggregate([
      { $match: { agentId: userId } },
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

    console.log("Transactions to update:", transactions);

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
  console.log("jdasjdbakdak");
  const userId = req.pUserId;
  console.log("userId", userId);
  try {
    const bankData = await BankDetails.aggregate([
      {
        $match: {
          Primary_user_id: userId,
        },
      },
      {
        $project: {
          bank_ledname: 1,
          ac_no: 1,
          ifsc: 1,
        },
      },
    ]);

    console.log(bankData);

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
  console.log("email", email);

  try {
    const validEmail = await primaryUserModel.findOne({ email: email });
    if (!validEmail) {
      return res.status(400).json({ message: "Enter the registered email " });
    }

    const otp = generateNumericOTP(6);
    console.log("otp", otp);

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
//  route POST/api/pUsers/submitOtp

export const submitOtp = async (req, res) => {
  const { Otp, otpEmail } = req.body;

  try {
    // Retrieve user data based on the provided email
    const user = await primaryUserModel.findOne({ email: otpEmail });

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
// route POST/api/pUsers/resetPassword

export const resetPassword = async (req, res) => {
  const { password, otpEmail } = req.body;

  try {
    // Retrieve user data based on the provided email
    const user = await primaryUserModel.findOne({ email: otpEmail });

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

// @desc toget the details of transaction or receipt
// route POST/api/pUsers/getTransactionDetails

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




// @desc adding new Party
// route POst/api/pUsers/addParty
export const addParty = async (req, res) => {
  try {
    const { cpm_id,
      Primary_user_id,
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
      openingBalanceAmount } = req.body;

    const party = new PartyModel({
      cpm_id,
      Primary_user_id,
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
      openingBalanceAmount
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




// @desc adding new Hsn
// route POst/api/pUsers/addHsn
export const addHsn = async (req, res) => {
  try {
    const { cpm_id,
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
      rows

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
      rows
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