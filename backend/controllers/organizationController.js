// @desc Adding organizations by primary users
// route POST/api/pUsers/addOrganizations

import mongoose from "mongoose";
import Organization from "../models/OragnizationModel.js";
import { createAccountGroupsForOrganization, createDefaultGodownForOrganization, defaultConfigurations } from "../helpers/helper.js";
import secondaryUserModel from "../models/secondaryUserModel.js";
import { accountGroups03 } from "../../frontend/constants/accountGroups.js";


export const addOrganizations = async (req, res) => {
  const {
    name,
    pin,
    state,
    country,
    email,
    mobile,
    gstNum,
    logo,
    flat,
    road,
    landmark,
    senderId,
    website,
    pan,
    financialYear,
    username,
    password,
    type,
    batchEnabled = false,
    industry,
    printTitle,
    currency,
    currencyName,
    symbol,
    subunit,
  } = req.body;

  const owner = req.owner;
  const session = await mongoose.startSession(); // Start a session
  session.startTransaction(); // Start the transaction

  console.log("batchEnabled", batchEnabled);
  

  try {
    // Create the organization
    const organization = await Organization.create(
      [
        {
          name,
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
          gstNum,
          type,
          batchEnabled,
          industry,
          printTitle,
          currency,
          currencyName,
          symbol,
          subunit,
          configurations: defaultConfigurations,
        },
      ],
      { session }
    );

    if (!organization) {
      await session.abortTransaction();
      session.endSession();
      return res
        .status(400)
        .json({ success: false, message: "Adding organization failed" });
    }

    // Update the SecondaryUser's organization array
    const updatedUser = await secondaryUserModel.findByIdAndUpdate(
      req.sUserId,
      { $push: { organization: organization[0]._id } },
      { new: true, session } // Use the session
    );

    if (!updatedUser) {
      await session.abortTransaction();
      session.endSession();
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    // Create account groups using the helper function
    const accountGroupsResult = await createAccountGroupsForOrganization({
      type,
      accountGroups: accountGroups03, // Make sure this variable is defined or imported
      organizationId: organization[0]._id,
      ownerId: owner,
      session,
    });

    // Create default godown using the helper function
    const defaultGodown = await createDefaultGodownForOrganization({
      organizationId: organization[0]._id,
      ownerId: req.pUserId || owner, // Using owner as fallback if pUserId is not available
      session,
    });

    if (!accountGroupsResult || !defaultGodown) {
      await session.abortTransaction();
      session.endSession();
      return res.status(400).json({
        success: false,
        message: "Failed to set up organization resources",
      });
    }

    // Commit the transaction
    await session.commitTransaction();
    session.endSession();

    return res
      .status(200)
      .json({ success: true, message: "Organization added successfully" });
  } catch (error) {
    // Rollback the transaction on error
    await session.abortTransaction();
    session.endSession();
    console.error(error);
    return res
      .status(500)
      .json({ success: false, message: "Internal server error, try again!" });
  }
};

// @desc get Primary user organization list
// route GET/api/pUsers/getOrganizations

export const getOrganizations = async (req, res) => {
  const userId = new mongoose.Types.ObjectId(req.owner);
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
      return res
        .status(404)
        .json({ success: false, message: "Organization not found" });
    }

    return res.status(200).json({
      success: true,
      data: updatedOrg,
      message: "Company updated successfully",
    });
  } catch (error) {
    console.error("Error updating organization:", error);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};