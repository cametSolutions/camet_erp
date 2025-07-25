import Admin from "../models/adminModel.js";
import PrimaryUsers from "../models/primaryUserModel.js";
import generateAdminToken from "../utils/generateAdminToken.js";
import Organization from "../models/OragnizationModel.js";
import SecondaryUser from "../models/secondaryUserModel.js";

import TallyData from "../models/TallyData.js";
import Banks from "../models/bankModel.js";
import BanksOd from "../models/bankOdModel.js";
import Cash from "../models/cashModel.js";
import AccountGroup from "../models/accountGroup.js";
import CreditNote from "../models/creditNoteModel.js";
import DebitNote from "../models/debitNoteModel.js";
import Receipt from "../models/receiptModel.js";
import Payment from "../models/paymentModel.js";
import nodemailer from "nodemailer";
import additionalChargesModel from "../models/additionalChargesModel.js";
import hsnModel from "../models/hsnModel.js";
import invoiceModel from "../models/invoiceModel.js";
import partyModel from "../models/partyModel.js";
import productModel from "../models/productModel.js";
import purchaseModel from "../models/purchaseModel.js";
import salesModel from "../models/salesModel.js";
import stockTransferModel from "../models/stockTransferModel.js";
import OragnizationModel from "../models/OragnizationModel.js";
import {
  Brand,
  Category,
  Godown,
  PriceLevel,
  Subcategory,
} from "../models/subDetails.js";
import vanSaleModel from "../models/vanSaleModel.js";
import TransactionModel from "../models/TransactionModel.js";
import mongoose from "mongoose";

import { ObjectId } from 'mongodb';
// @desc Login Admin
// route POST/api/admin/login
export const adminLogin = async (req, res) => {
  const { email, password } = req.body;

  try {
    // const admin=new Admin();
    const admin = await Admin.findOne({ email });

    if (!admin) {
      return res.status(404).json({ message: "Invalid Admin" });
    }

    //   const isPasswordMatch = await bcrypt.compare(
    //     password,
    //     admin.password
    //   );

    const isPasswordMatch = (await admin.password) === password;
    console.log(isPasswordMatch);

    if (!isPasswordMatch) {
      return res.status(400).json({ message: "Invalid email or password" });
    }

    const token = generateAdminToken(res, admin._id);

    return res.status(200).json({
      message: "Login successful",
      token,
      data: { email },
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ status: false, message: "Failed to login!" });
  }
};

// @desc Log out  Admin
// route POST/api/admin/logout

export const logout = async (req, res) => {
  try {
    res.cookie("jwt_admin", "", {
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

// @desc get admin data for side bar
// route POST/api/admin/getAdminData

export const getAdminData = async (req, res) => {
  const adminId = req.adminId;
  try {
    const adminData = await Admin.findById(adminId);
    if (adminData) {
      return res
        .status(200)
        .json({ message: "AdminData fetched", data: { adminData } });
    } else {
      return res.status(404).json({ message: "primaryUSerData not found" });
    }
  } catch (error) {
    console.log(error);
    return res
      .status(500)
      .json({ status: false, message: "internal sever error" });
  }
};

// @desc get primary user lst
// route POST/api/admin/getPrimaryUsers

export const getPrimaryUsers = async (req, res) => {
  try {
    const primaryUsers = await PrimaryUsers.find({});
    const organizations = await Organization.find({});
    const secUsers = await SecondaryUser.find({});
    if (primaryUsers) {
      return res.status(200).json({
        message: "Primary users fetched",
        priUsers: primaryUsers,
        org: organizations,
        secUsers: secUsers,
      });
    } else {
      return res
        .status(404)
        .json({ message: "Error in fetching primary users" });
    }
  } catch (error) {
    console.log(error);
    return res
      .status(500)
      .json({ message: "Internal server error", error: error.message });
  }
};

// @desc handle approval of primary user
// route POST/api/admin/handlePrimaryApprove

export const handlePrimaryApprove = async (req, res) => {
  const userId = req.params.id;

  try {
    const user = await PrimaryUsers.findById(userId);

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    // Update the user's approval status
    const update = await PrimaryUsers.updateOne(
      { _id: userId },
      { $set: { isApproved: !user.isApproved } }
    );

    console.log("update", update);

    // Check if the update was successful
    if (update.nModified === 0) {
      return res
        .status(400)
        .json({ error: "Failed to update user approval status" });
    }

    res
      .status(200)
      .json({ message: "User approval status updated successfully" });
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// @desc handle deletion of primary user
// route DELETE/api/admin/handlePrimaryDelete

export const handlePrimaryDelete = async (req, res) => {
  const userId = req.params.id;

  try {
    // First, find the organizations owned by this user
    const organizations = await Organization.find({ owner: userId });
    const organizationIds = organizations.map((org) => org._id);

    const deletionResults = await Promise.all([
      PrimaryUsers.findByIdAndDelete(userId),
      SecondaryUser.deleteMany({ primaryUser: userId }),
      Organization.deleteMany({ owner: userId }),
      Banks.deleteMany({ Primary_user_id: userId }),
      TallyData.deleteMany({ Primary_user_id: userId }),
      additionalChargesModel.deleteMany({ Primary_user_id: userId }),
      hsnModel.deleteMany({ Primary_user_id: userId }),
      invoiceModel.deleteMany({ Primary_user_id: userId }),
      partyModel.deleteMany({ Primary_user_id: userId }),
      productModel.deleteMany({ Primary_user_id: userId }),
      purchaseModel.deleteMany({ Primary_user_id: userId }),
      salesModel.deleteMany({ Primary_user_id: userId }),
      stockTransferModel.deleteMany({ Primary_user_id: userId }),
      Brand.deleteMany({ Primary_user_id: userId }),
      Category.deleteMany({ Primary_user_id: userId }),
      Subcategory.deleteMany({ Primary_user_id: userId }),
      Godown.deleteMany({ Primary_user_id: userId }),
      PriceLevel.deleteMany({ Primary_user_id: userId }),
      vanSaleModel.deleteMany({ Primary_user_id: userId }),
      TransactionModel.deleteMany({ cmp_id: { $in: organizationIds } }),
    ]);

    const [
      user,
      secUserResult,
      orgResult,
      banksResult,
      talliesResult,
      additionalChargesResult,
      hsnResult,
      invoiceResult,
      partyResult,
      productResult,
      purchaseResult,
      salesResult,
      stockTransferResult,
      brandResult,
      categoryResult,
      subcategoryResult,
      godownResult,
      priceLevelResult,
      vanSaleResult,
      TransactionResult,
    ] = deletionResults;

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    const deletionCounts = {
      user: user ? 1 : 0,
      secondaryUsers: secUserResult.deletedCount,
      organizations: orgResult.deletedCount,
      banks: banksResult.deletedCount,
      tallies: talliesResult.deletedCount,
      additionalCharges: additionalChargesResult.deletedCount,
      hsn: hsnResult.deletedCount,
      invoices: invoiceResult.deletedCount,
      parties: partyResult.deletedCount,
      products: productResult.deletedCount,
      purchases: purchaseResult.deletedCount,
      sales: salesResult.deletedCount,
      stockTransfers: stockTransferResult.deletedCount,
      brands: brandResult.deletedCount,
      categories: categoryResult.deletedCount,
      subcategories: subcategoryResult.deletedCount,
      godowns: godownResult.deletedCount,
      priceLevels: priceLevelResult.deletedCount,
      vanSales: vanSaleResult.deletedCount,
      Transactions: TransactionResult.deletedCount,
    };

    res.status(200).json({
      message: "User and associated data deleted successfully",
      deletionCounts: deletionCounts,
    });
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// @desc handle block of primary user
// route POST/api/admin/handlePrimaryBlock

export const handlePrimaryBlock = async (req, res) => {
  const userId = req.params.id;

  try {
    const user = await PrimaryUsers.findById(userId);
    console.log("user", user);

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    // Update the user's approval status
    const update = await PrimaryUsers.updateOne(
      { _id: userId },
      { $set: { isBlocked: !user.isBlocked } }
    );

    // Check if the update was successful
    if (update.nModified === 0) {
      return res
        .status(400)
        .json({ error: "Failed to update user block status" });
    }

    res.status(200).json({ message: "User block status updated successfully" });
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// @desc handle block of secondary user
// route POST/api/admin/handleSecondaryBlock
export const handleSecondaryBlock = async (req, res) => {
  const userId = req.params.id;

  try {
    const user = await SecondaryUser.findById(userId);
    console.log("user", user);

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    // Update the user's approval status
    const update = await SecondaryUser.updateOne(
      { _id: userId },
      { $set: { isBlocked: !user.isBlocked } }
    );

    // Check if the update was successful
    if (update.nModified === 0) {
      return res
        .status(400)
        .json({ error: "Failed to update user block status" });
    }

    res.status(200).json({ message: "User block status updated successfully" });
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// @desc handle subscription of primary user
// route POST/api/admin/handleSubscription

export const handleSubscription = async (req, res) => {
  const userId = req.params.id;

  try {
    const user = await PrimaryUsers.findById(userId);
    console.log("user", user);

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    let newSubscription =
      user.subscription === "monthly" ? "yearly" : "monthly";

    // Update the user's approval status
    const update = await PrimaryUsers.updateOne(
      { _id: userId },
      { $set: { subscription: newSubscription } }
    );

    // Check if the update was successful
    if (update.nModified === 0) {
      return res
        .status(400)
        .json({ error: "Failed to update user subscription status" });
    }

    res
      .status(200)
      .json({ message: "User subscription status updated successfully" });
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// @desc handle sms provision of primary user
// route POST/api/admin/handleSms

export const handleSms = async (req, res) => {
  const userId = req.params.id;

  try {
    const user = await PrimaryUsers.findById(userId);
    console.log("user", user);

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    // Update the user's approval status
    const update = await PrimaryUsers.updateOne(
      { _id: userId },
      { $set: { sms: !user.sms } }
    );

    // Check if the update was successful
    if (update.nModified === 0) {
      return res
        .status(400)
        .json({ error: "Failed to update user sms status" });
    }

    res.status(200).json({ message: "User sms status updated successfully" });
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// @desc handle whatsApp provision of primary user
// route POST/api/admin/handleWhatsApp

export const handleWhatsApp = async (req, res) => {
  const userId = req.params.id;

  try {
    const user = await PrimaryUsers.findById(userId);
    console.log("user", user);

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    // Update the user's approval status
    const update = await PrimaryUsers.updateOne(
      { _id: userId },
      { $set: { whatsApp: !user.whatsApp } }
    );

    // Check if the update was successful
    if (update.nModified === 0) {
      return res
        .status(400)
        .json({ error: "Failed to update user whatsApp status" });
    }

    res
      .status(200)
      .json({ message: "User whatsApp status updated successfully" });
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// @desc handle approval of organization
// route POST/api/admin/handleOrganizationApprove

export const handleOrganizationApprove = async (req, res) => {
  const orgId = req.params.id;

  try {
    const organization = await Organization.findById(orgId).populate("owner");

    if (!organization) {
      return res.status(404).json({ error: "organization not found" });
    }

    // Update the user's approval status
    const update = await Organization.updateOne(
      { _id: orgId },
      { $set: { isApproved: !organization.isApproved } }
    );

    // Check if the update was successful
    if (update.modifiedCount === 0) {
      return res.status(400).json({ error: "Approval failed" });
    }

    // Send email only if organization was not approved before (now being approved)
    if (organization.isApproved === false) {
      const transporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
          user: process.env.NODE_MAILER_EMAIL,
          pass: process.env.NODE_MAILER_APP_PASSWORD,
        },
      });

      const mailOptions = {
        from: "solutions@camet.in",
        to: `${organization.email}`,
        subject: "Welcome to Camet IT Solutions - Registration Success",
        text: `Dear ${organization.owner.userName},\n\nGreetings from Camet IT Solutions!\n\nWe are delighted to inform you that your registration with Camet IT Solutions has been successfully completed, and your approval for the company ${organization.name} is now confirmed.\n\nHere are your account details:\n\n- User ID: ${organization.owner._id}\n- Company ID: ${organization._id}\n\nWith these credentials, you now have access to the resources and services provided by Camet IT Solutions. We trust that you will find our offerings beneficial for your professional needs.\n\nShould you have any questions or require assistance, please feel free to reach out to our support team at solutions@camet.in or contact us directly at  9072632602.\n\nThank you for choosing Camet IT Solutions. We look forward to serving you and supporting your success in the future.\n\nBest regards,\n\nCAMET IT SOLUTIONS LLP\n2nd Floor, 5/215 A9, Puliyana Building\nFactory Road, North Kalamassery\nErnakulam Pincode : 683104\nContact No. 9072632602\nEmail ID : solutions@camet.in`,
      };

      // Use Promise-based approach or proper callback handling
      try {
        const info = await transporter.sendMail(mailOptions);
        console.log("Email Sent:" + info.response);
        res.status(200).json({ message: "organization Status changed and email sent" });
      } catch (emailError) {
        console.log("Email error:", emailError);
        res.status(200).json({ 
          message: "organization Status changed but email failed to send",
          emailError: emailError.message 
        });
      }
    } else {
      // Organization was approved before, now being unapproved
      res.status(200).json({ message: "organization Status changed" });
    }

  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// @desc get all organizations
// route POST/api/admin/getOrganizationsAdmin
export const getOrganizationsAdmin = async (req, res) => {
  try {
    const organizations = await Organization.find({})
      .sort({ createdAt: -1 })
      .populate("owner");
    if (organizations) {
      return res.status(200).json({
        data: organizations,
        message: "Organization fetched",
      });
    } else {
      return res.status(404).json({ message: "No organization were found" });
    }
  } catch (error) {
    console.log(error);
    return res
      .status(500)
      .json({ success: false, message: "Internal server error, try again!" });
  }
};

// @desc get Primary user organization list
// route GET/api/admin/getOrganizations
export const getOrganizations = async (req, res) => {
  try {
    const organizations = await Organization.find({});
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

// @desc get secondary users list
// route GET/api/admin/fetchSecondaryUsers

export const fetchSecondaryUsers = async (req, res) => {
  try {
    const secondaryUsers = await SecondaryUser.find({})
      .populate({
        path: "organization",
        select: "name",
      })
      .populate({
        path: "primaryUser",
        select: "userName",
      })
      .select("name email mobile isBlocked")
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

// @desc get secondary users list
// route GET/api/admin/handleCompanyDelete

export const handleCompanyDelete = async (req, res) => {
  const companyId = req.params.cmp_id;

  try {
    // Check if company exists first 
    const company = await OragnizationModel.findById(companyId);
    if (!company) {
      return res.status(404).json({ error: "Company not found" });
    }

    const deletionResults = await Promise.all([
      Banks.deleteMany({ cmp_id: companyId }),
      BanksOd.deleteMany({ cmp_id: companyId }),
      Cash.deleteMany({ cmp_id: companyId }),
      AccountGroup.deleteMany({ cmp_id: companyId }),
      CreditNote.deleteMany({ cmp_id: companyId }),
      DebitNote.deleteMany({ cmp_id: companyId }),
      Receipt.deleteMany({ cmp_id: companyId }),
      Payment.deleteMany({ cmp_id: companyId }),
      TallyData.deleteMany({ cmp_id: companyId }),
      additionalChargesModel.deleteMany({ cmp_id: companyId }),
      hsnModel.deleteMany({ cmp_id: companyId }),
      invoiceModel.deleteMany({ cmp_id: companyId }),
      partyModel.deleteMany({ cmp_id: companyId }),
      productModel.deleteMany({ cmp_id: companyId }),
      purchaseModel.deleteMany({ cmp_id: companyId }),
      salesModel.deleteMany({ cmp_id: companyId }),
      stockTransferModel.deleteMany({ cmp_id: companyId }),
      Brand.deleteMany({ cmp_id: companyId }),
      Category.deleteMany({ cmp_id: companyId }),
      Subcategory.deleteMany({ cmp_id: companyId }),
      Godown.deleteMany({ cmp_id: companyId }),
      PriceLevel.deleteMany({ cmp_id: companyId }),
      vanSaleModel.deleteMany({ cmp_id: companyId }),
      TransactionModel.deleteMany({ cmp_id: companyId }), // Fixed: using companyId instead of organizationIds
    ]);

    const [
      banksResult,
      banksOdResult,
      cashResult,
      accountGroupResult,
      creditNoteResult,
      debitNoteResult,
      receiptResult,
      paymentResult,
      tallyDataResult,
      additionalChargesResult,
      hsnResult,
      invoiceResult,
      partyResult,
      productResult,
      purchaseResult,
      salesResult,
      stockTransferResult,
      brandResult,
      categoryResult,
      subcategoryResult,
      godownResult,
      priceLevelResult,
      vanSaleResult,
      transactionResult,
    ] = deletionResults;

    const deletionCounts = {
      banks: banksResult.deletedCount,
      banksOd: banksOdResult.deletedCount,
      cash: cashResult.deletedCount,
      accountGroups: accountGroupResult.deletedCount,
      creditNotes: creditNoteResult.deletedCount,
      debitNotes: debitNoteResult.deletedCount,
      receipts: receiptResult.deletedCount,
      payments: paymentResult.deletedCount,
      tallyData: tallyDataResult.deletedCount,
      additionalCharges: additionalChargesResult.deletedCount,
      hsn: hsnResult.deletedCount,
      invoices: invoiceResult.deletedCount,
      parties: partyResult.deletedCount,
      products: productResult.deletedCount,
      purchases: purchaseResult.deletedCount,
      sales: salesResult.deletedCount,
      stockTransfers: stockTransferResult.deletedCount,
      brands: brandResult.deletedCount,
      categories: categoryResult.deletedCount,
      subcategories: subcategoryResult.deletedCount,
      godowns: godownResult.deletedCount,
      priceLevels: priceLevelResult.deletedCount,
      vanSales: vanSaleResult.deletedCount,
      transactions: transactionResult.deletedCount,
    };

    res.status(200).json({
      message: "Company and associated data deleted successfully",
      deletionCounts: deletionCounts,
    });
  } catch (error) {
    console.error("Error deleting company:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};


// @desc to sync all indexes
// route POST/api/admin/syncIndexes

export const syncIndexes = async (req, res) => {
  try {
    const modelNames = mongoose.modelNames(); // Gets all registered model names
    console.log(modelNames);
    

    for (const name of modelNames) {
      const model = mongoose.model(name);
      await model.syncIndexes();
      console.log(`Synced indexes for model: ${name}`);
    }

    res.status(200).json({ message: "All indexes synced successfully" });
  } catch (error) {
    console.error("Index sync error:", error);
    res.status(500).json({ message: "Index sync failed", error: error.message });
  }
};

 // Add this import at the top of your admin controller file


// Fixed getPrimaryUserProfileById function
export const getPrimaryUserProfileById = async (req, res) => {
  try {
    const { userId } = req.params;
    console.log("Fetching profile for userId:", userId);

    // Validate user ID
    if (!userId) {
      return res.status(400).json({
        success: false,
        message: 'User ID is required'
      });
    }

    // Fetch primary user details
    const primaryUser = await PrimaryUsers.findById(userId)
      .select('userName email mobile subscription createdAt updatedAt sms whatsApp isBlocked  isApproved role')
      .lean();

    if (!primaryUser) {
      return res.status(404).json({
        success: false,
        message: 'Primary user not found'
      });
    }

    // Fetch organization details for this user
    const organization = await Organization.find({ owner: userId })
      .select('name place type industry isBlocked isApproved createdAt')
      .lean();
      console.log('organization',organization)

    // Fetch secondary users for this primary user
    const secondaryUsers = await SecondaryUser.find({ primaryUser: userId })
      .select('name email mobile isBlocked createdAt')
      .lean();

    // Prepare response data to match frontend expectations
    const responseData = {
      primaryUser: {
        id: primaryUser._id,
        name: primaryUser.userName,
        email: primaryUser.email,
        phoneNumber: primaryUser.mobile,
        subscriptionType: primaryUser.subscription,
        createdAt: primaryUser.createdAt,
        expiredAt: primaryUser.updatedAt,
        sms: primaryUser.sms || false,
        whatsApp: primaryUser.whatsApp || false,
        isBlocked: primaryUser.isBlocked || false,
        isApproved: primaryUser.isApproved || false
      },
      organization: organization.map(org=> ({
        id: org._id,
        name: org.name,
        place: org.place,
        type: org.type,
        industry: org.industry,
        isBlocked: org.isBlocked || false,
        isApproved: org.isApproved || false,
        createdAt: org.createdAt
    })),
      secondaryUsers: secondaryUsers.map(user => ({
        id: user._id,
        name: user.name,
        email: user.email,
        mobile: user.mobile,
      
        isBlocked: user.isBlocked || false,
        createdAt: user.createdAt
      }))
    };

    res.status(200).json(responseData);

  } catch (error) {
    console.error('Error fetching primary user profile by ID:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Add these new mutation endpoints to match frontend expectations

// Update Primary User Status
export const updatePrimaryUserStatus = async (req, res) => {
  try {
    const { userId } = req.params;
    const { field, value } = req.body;

    const allowedFields = ['sms', 'whatsApp', 'isBlocked', 'isApproved', 'subscriptionType'];
    
    if (!allowedFields.includes(field)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid field specified'
      });
    }

    // Validate subscriptionType values
    if (field === 'subscriptionType') {
      if (!['yearly', 'monthly'].includes(value)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid subscription type. Must be "yearly" for yearly or "monthly" for monthly'
        });
      }
    }

    // Validate boolean fields
    if (['sms', 'whatsApp', 'isBlocked', 'isApproved'].includes(field)) {
      if (typeof value !== 'boolean') {
        return res.status(400).json({
          success: false,
          message: `${field} must be a boolean value`
        });
      }
    }

    const update = await PrimaryUsers.updateOne(
      { _id: userId },
      { $set: { [field]: value } }
    );

    if (update.matchedCount === 0) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.status(200).json({
      success: true,
      message: `User ${field} status updated successfully`
    });

  } catch (error) {
    console.error('Error updating primary user status:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};
// Update Organization Status
export const updateOrganizationStatus = async (req, res) => {
  try {
    const  {organizationId } = req.params;
    const { field, value } = req.body;
console.log('organizationId',organizationId)
    const allowedFields = ['isBlocked', 'isApproved'];
    if (!allowedFields.includes(field)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid field specified'
      });
    }

    const update = await Organization.updateOne(
      { _id: organizationId },
      { $set: { [field]: value } }
    );

    if (update.matchedCount === 0) {
      return res.status(404).json({
        success: false,
        message: 'Organization not found'
      });
    }

    res.status(200).json({
      success: true,
      message: `Organization ${field} status updated successfully`
    });

  } catch (error) {
    console.error('Error updating organization status:', error);
    
    // Handle invalid ObjectId error from MongoDB
    if (error.name === 'CastError') {
      return res.status(400).json({
        success: false,
        message: 'Invalid organization ID format'
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// Update Secondary User Status
export const updateSecondaryUserStatus = async (req, res) => {
  try {
    const { secondaryUserId } = req.params;
    const { field, value } = req.body;
console.log('secondaryUserId',secondaryUserId)
    const allowedFields = [ 'isBlocked'];
    if (!allowedFields.includes(field)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid field specified'
      });
    }

    const update = await SecondaryUser.updateOne(
      { _id: secondaryUserId },
      { $set: { [field]: value } }
    );

    if (update.matchedCount === 0) {
      return res.status(404).json({
        success: false,
        message: 'Secondary user not found'
      });
    }

    res.status(200).json({
      success: true,
      message: `Secondary user ${field} status updated successfully`
    });

  } catch (error) {
    console.error('Error updating secondary user status:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// Single controller to update user capacity limits (both organization and secondary user)
export const updateUserCapacity = async (req, res) => {
  try {
    const { userId } = req.params;
    const { field, value } = req.body;

    console.log('Updating capacity:', { userId, field, value });

    // Validate userId
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid user ID format'
      });
    }

    // Validate field - only allow these two fields
    const allowedFields = ['organizationLimit', 'secondaryUserLimit'];
    if (!allowedFields.includes(field)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid field. Allowed fields: organizationLimit, secondaryUserLimit'
      });
    }

    // Validate value
    const numericValue = parseInt(value, 10);
    if (isNaN(numericValue) || numericValue < 1 || numericValue > 100) {
      return res.status(400).json({
        success: false,
        message: 'Value must be a number between 1 and 100'
      });
    }

    // Find and update user
    const user = await PrimaryUsers.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Store old value for logging
    const oldValue = user[field];

    // Update the specific field
    user[field] = numericValue;
    
    // Save the user
    const updatedUser = await user.save();

    // Log the update for audit purposes
    console.log(`Updated ${field} for user ${userId}: ${oldValue} → ${numericValue}`);

    // Determine field name for response
    const fieldDisplayName = field === 'organizationLimit' ? 'Organization' : 'Secondary User';

    // Return success response
    res.status(200).json({
      success: true,
      message: `${fieldDisplayName} limit updated successfully`,
      data: {
        userId: updatedUser._id,
        userName: updatedUser.userName,
        field: field,
        oldValue: oldValue,
        newValue: updatedUser[field],
        organizationLimit: updatedUser.organizationLimit,
        secondaryUserLimit: updatedUser.secondaryUserLimit,
        updatedAt: updatedUser.updatedAt
      }
    });

  } catch (error) {
    console.error('Error updating user capacity:', error);
    
    // Handle mongoose validation errors
    if (error.name === 'ValidationError') {
      const validationErrors = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors: validationErrors
      });
    }

    // Handle other errors
    res.status(500).json({
      success: false,
      message: 'Internal server error while updating capacity',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Something went wrong'
    });
  }
};