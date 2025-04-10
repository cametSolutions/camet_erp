// @desc get party list
// route get/api/pUsers/PartyList;

import mongoose from "mongoose";
import partyModel from "../models/partyModel.js";
import secondaryUserModel from "../models/secondaryUserModel.js";
import SubGroup from "../models/subGroup.js";
import TallyData from "../models/TallyData.js";

export const PartyList = async (req, res) => {
  const { cmp_id } = req.params;
  const { owner: Primary_user_id, sUserId: secUserId } = req;

  const {
    outstanding,
    voucher,
    page = 1,
    limit = 20,
    search = "",
    isSale,
  } = req.query;

  try {
    // Pagination setup
    const pageNum = parseInt(page);
    const pageSize = parseInt(limit);
    const skip = (pageNum - 1) * pageSize;

    // Build search query
    let searchQuery = {};
    if (search) {
      const regex = new RegExp(search, "i");
    
      searchQuery = {
        $or: [
          { partyName: regex },
          { mobileNumber: typeof search === 'string' ? regex : undefined },
          // { accountGroup: regex },
        ].filter(Boolean), // removes undefined if any
      };
    }

    // Combined query
    const query = {
      cmp_id: new mongoose.Types.ObjectId(cmp_id),
      Primary_user_id,
      ...searchQuery,
    };

    // Fetch parties and secondary user concurrently
    const [partyList, secUser, totalCount] = await Promise.all([
      partyModel
        .find(query)
        .select(
          "_id partyName party_master_id billingAddress shippingAddress mobileNumber gstNo emailID pin country state accountGroup accountGroup_id subGroup subGroup_id"
        )
        .skip(skip)
        .limit(pageSize)
        .lean(),
      secondaryUserModel.findById(secUserId),
      partyModel.countDocuments(query),
    ]);

    if (!secUser) {
      return res.status(404).json({ message: "Secondary user not found" });
    }

    const configuration = secUser.configurations.find(
      (config) => config.organization == cmp_id
    );
    const vanSaleConfig = configuration?.vanSale || false;

    let filteredPartyList = partyList;

    // Filter parties by selectedVanSaleSubGroups if isSale is true

    if (
      isSale === "true" &&
      configuration &&
      configuration.selectedVanSaleSubGroups?.length > 0
    ) {
      filteredPartyList = partyList.filter((party) =>
        configuration.selectedVanSaleSubGroups.includes(party.subGroup_id)
      );
    }

    // Determine the source values to match based on the voucher type
    let sourceMatch = {};
    if (voucher === "receipt") {
      sourceMatch = { classification: "Dr" };
    } else if (voucher === "payment") {
      sourceMatch = { classification: "Cr" };
    } else if (voucher === "opening") {
      sourceMatch = { source: "opening" };
    }

    // Get outstanding data for these specific parties
    const partyIds = filteredPartyList.map((party) => party.party_master_id);

    const partyOutstandingData = await TallyData.aggregate([
      {
        $match: {
          cmp_id,
          Primary_user_id: String(Primary_user_id),
          isCancelled: false,
          party_id: { $in: partyIds },
          ...sourceMatch,
        },
      },
      {
        $group: {
          _id: "$party_id",
          totalOutstanding: { $sum: "$bill_pending_amt" },
          latestBillDate: { $max: "$bill_date" },
        },
      },
      {
        $project: {
          _id: 0,
          party_id: "$_id",
          totalOutstanding: 1,
          latestBillDate: 1,
        },
      },
    ]);

    const partyListWithOutstanding = filteredPartyList.map((party) => {
      const outstandingData = partyOutstandingData.find(
        (item) => item.party_id === party.party_master_id
      );
      return {
        ...party,
        totalOutstanding: outstandingData?.totalOutstanding || 0,
        latestBillDate: outstandingData?.latestBillDate || null,
      };
    });

    res.status(200).json({
      message: "Parties fetched",
      partyList: partyListWithOutstanding,
      vanSale: vanSaleConfig,
      pagination: {
        total: totalCount,
        page: pageNum,
        limit: pageSize,
        totalPages: Math.ceil(totalCount / pageSize),
      },
    });
  } catch (error) {
    console.error("Error in PartyList:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

// @desc adding new Party
// route POst/api/pUsers/addParty
export const addParty = async (req, res) => {
  try {
    const {
      cpm_id: cmp_id,
      accountGroup,
      subGroup,
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
      country,
      state,
      pin,
      party_master_id, // Check if provided
    } = req.body;

    const generatedId = new mongoose.Types.ObjectId();

    const party = new partyModel({
      _id: generatedId,
      cmp_id,
      Primary_user_id: req.owner,
      Secondary_user_id: req.sUserId,
      accountGroup,
      subGroup,
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
      country,
      state,
      pin,
      party_master_id: generatedId, 
    });

    const result = await party.save();

    // If party_master_id is not provided, use the MongoDB generated _id
    if (!party_master_id) {
      result.party_master_id = result._id.toString();
      await result.save(); // Save the updated party with party_master_id set to _id
    }

    if (result) {
      return res.status(200).json({
        success: true,
        message: "Party added successfully",
        result: result,
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

/**
 * @desc   To get sub groups
 * @route  Get /api/sUsers/getSubGroup/:cmp_id
 * @access Public
 */

export const getSubGroup = async (req, res) => {
  const cmp_id = req.params.cmp_id;
  try {
    const subGroups = await SubGroup.find({
      cmp_id: cmp_id,
      Primary_user_id: req.owner,
    }).populate("accountGroup");
    if (subGroups) {
      res.status(200).json({
        message: "Sub Groups fetched",
        data: subGroups,
      });
    } else {
      res.status(200).json({
        message: "Sub Groups not found",
        data: [],
      });
    }
  } catch (error) {
    console.log("Error in getting sub groups:", error);
    res.status(500).json({
      error: "Internal Server Error",
      details: error.message,
    });
  }
};

/**
 * @desc   To add sub groups
 * @route  Get /api/sUsers/addSubGroup/:cmp_id
 * @access Public
 */

export const addSubGroup = async (req, res) => {
  const cmp_id = req.params.cmp_id;
  try {
    const { accountGroup, subGroup } = req?.body;

    const generatedId = new mongoose.Types.ObjectId();

    const newSubGroup = new SubGroup({
      accountGroup: accountGroup,
      subGroup: subGroup,
      cmp_id: cmp_id,
      Primary_user_id: req.owner,
      subGroup_id: generatedId,
      _id: generatedId,
    });

    await newSubGroup.save();
    res.status(200).json({
      message: "Sub Group added",
      data: newSubGroup,
    });
  } catch (error) {
    console.log(error);

    res.status(500).json({
      error: "Internal Server Error",
      details: error.message,
    });
  }
};

/**
 * @desc   Delete sub group
 * @route  DELETE /api/sUsers/deleteSubGroup/:subGroupId
 * @access Public
 */
export const deleteSubGroup = async (req, res) => {
  try {
    const subGroupId = req.params.subGroupId;
    await subGroup.findByIdAndDelete(subGroupId);
    res.status(200).json({
      message: "Sub Group deleted",
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      error: "Internal Server Error",
      details: error.message,
    });
  }
};

/**
 * @desc   Edit sub group
 * @route  PUT /api/sUsers/editSubGroup/:subGroupId
 * @access Public
 */
export const editSubGroup = async (req, res) => {
  try {
    const subGroupId = req.params.subGroupId;

    const updateData = req.body;

    const existingSubGroup = await SubGroup.findById(
      new mongoose.Types.ObjectId(subGroupId)
    );

    if (!existingSubGroup) {
      return res.status(404).json({
        message: "Sub Group not found",
      });
    }

    // Update the sub-group
    existingSubGroup.accountGroup = updateData.accountGroup;
    existingSubGroup.subGroup = updateData.subGroup;

    await existingSubGroup.save();

    // Send success response
    res.status(200).json({
      message: "Sub Group updated successfully",
      data: existingSubGroup, // Use the updated document
    });
  } catch (error) {
    console.log("Error in editing sub group:", error);
    res.status(500).json({
      error: "Internal Server Error",
      details: error.message,
    });
  }
};
