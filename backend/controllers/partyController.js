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
    voucher,
    page = 1,
    limit = 20,
    search = "",
    isAgent = false,
  } = req.query;
  console.log(isAgent);
  try {
    const pageNum = parseInt(page);
    const pageSize = parseInt(limit);
    const skip = (pageNum - 1) * pageSize;

    // Get secondary user configuration
    const secUser = await secondaryUserModel.findById(secUserId);
    if (!secUser) {
      return res.status(404).json({ message: "Secondary user not found" });
    }

    const configuration = secUser.configurations.find(
      (config) => config.organization == cmp_id
    );
    const vanSaleConfig = configuration?.vanSale || false;

    // Build optimized base query
    let baseQuery = {
      cmp_id: new mongoose.Types.ObjectId(cmp_id),
      Primary_user_id,
    };

    // Add subgroup filter early to reduce document set
    if (voucher === "sale" && configuration?.selectedSubGroups?.length > 0) {
      const subGroupObjectIds = configuration.selectedSubGroups.map((id) =>
        typeof id === "string" ? new mongoose.Types.ObjectId(id) : id
      );
      baseQuery.subGroup = { $in: subGroupObjectIds };
    }

    if (isAgent === "true" || isAgent === true) {
      console.log("Filtering by Hotel Agent");
      baseQuery.isHotelAgent = true;
    }

    // Build search query
    if (search) {
      const regex = new RegExp(search, "i");
      baseQuery.$or = [{ partyName: regex }, { mobileNumber: regex }];
    }

    // OPTIMIZATION 1: Use facet for count and data in single aggregation
    const facetPipeline = [
      { $match: baseQuery },
      {
        $facet: {
          // Get total count
          // totalCount: [{ $count: "count" }],

          // Get paginated data with lookups
          paginatedResults: [
            { $skip: skip },
            { $limit: pageSize },

            // OPTIMIZATION 2: Lookup only after pagination
            {
              $lookup: {
                from: "accountgroups",
                localField: "accountGroup",
                foreignField: "_id",
                as: "accountGroupData",
                pipeline: [
                  { $project: { accountGroup: 1, _id: 1 } }, // Only select needed fields
                ],
              },
            },
            {
              $lookup: {
                from: "subgroups",
                localField: "subGroup",
                foreignField: "_id",
                as: "subGroupData",
                pipeline: [
                  { $project: { subGroup: 1, _id: 1, subGroup_id: 1 } },
                ],
              },
            },

            // OPTIMIZATION 3: Simplified projection
            {
              $project: {
                _id: 1,
                partyName: 1,
                party_master_id: 1,
                billingAddress: 1,
                shippingAddress: 1,
                mobileNumber: 1,
                gstNo: 1,
                emailID: 1,
                pin: 1,
                country: 1,
                state: 1,
                accountGroup: 1,
                subGroup: 1,
                accountGroupName: {
                  $arrayElemAt: ["$accountGroupData.accountGroup", 0],
                },
                accountGroup_id: { $arrayElemAt: ["$accountGroupData._id", 0] },
                subGroupName: { $arrayElemAt: ["$subGroupData.subGroup", 0] },
                subGroup_id: { $arrayElemAt: ["$subGroupData._id", 0] },
                subGroup_tally_id: {
                  $arrayElemAt: ["$subGroupData.subGroup_id", 0],
                },
              },
            },
          ],
        },
      },
    ];

    const [facetResult] = await partyModel.aggregate(facetPipeline);
    // const totalCount = facetResult.totalCount[0]?.count || 0;
    const partyList = facetResult.paginatedResults;

    // OPTIMIZATION 4: Batch outstanding data query with better indexing
    let partyListWithOutstanding = partyList;

    if (partyList.length > 0) {
      // Determine source match criteria
      let sourceMatch = {};
      if (voucher === "receipt") {
        sourceMatch = { classification: "Dr" };
      } else if (voucher === "payment") {
        sourceMatch = { classification: "Cr" };
      } else if (voucher === "opening") {
        sourceMatch = { source: "opening" };
      }

      const partyIds = partyList.map((party) => party._id);

      // OPTIMIZATION 5: Optimized outstanding data aggregation
      const partyOutstandingData = await TallyData.aggregate([
        {
          $match: {
            cmp_id: new mongoose.Types.ObjectId(cmp_id),
            Primary_user_id: Primary_user_id,
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
      ]);

      // OPTIMIZATION 6: Use Map for O(1) lookup instead of find()
      const outstandingMap = new Map();
      partyOutstandingData.forEach((item) => {
        outstandingMap.set(String(item._id), {
          totalOutstanding: item.totalOutstanding,
          latestBillDate: item.latestBillDate,
        });
      });

      partyListWithOutstanding = partyList.map((party) => {
        const outstandingData = outstandingMap.get(String(party._id));
        return {
          ...party,
          totalOutstanding: outstandingData?.totalOutstanding || 0,
          latestBillDate: outstandingData?.latestBillDate || null,
        };
      });
    }

    res.status(200).json({
      message: "Parties fetched",
      partyList: partyListWithOutstanding,
      vanSale: vanSaleConfig,
      pagination: {
        // total: totalCount,
        page: pageNum,
        limit: pageSize,
        // totalPages: Math.ceil(totalCount / pageSize),
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
    const cleanSubGroup = subGroup === "" ? undefined : subGroup;

    const party = new partyModel({
      _id: generatedId,
      cmp_id,
      Primary_user_id: req.owner,
      Secondary_user_id: req.sUserId,
      accountGroup,
      subGroup: cleanSubGroup,
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

    // Get the newly created party with lookups (same as PartyList,because we are also creating party directly form voucher)
    if (result) {
      const aggregationPipeline = [
        {
          $match: {
            _id: new mongoose.Types.ObjectId(result._id),
          },
        },

        // Lookup for accountGroup
        {
          $lookup: {
            from: "accountgroups",
            localField: "accountGroup",
            foreignField: "_id",
            as: "accountGroupData",
          },
        },
        {
          $unwind: {
            path: "$accountGroupData",
            preserveNullAndEmptyArrays: true,
          },
        },

        // Lookup for subGroup
        {
          $lookup: {
            from: "subgroups",
            localField: "subGroup",
            foreignField: "_id",
            as: "subGroupData",
          },
        },
        {
          $unwind: {
            path: "$subGroupData",
            preserveNullAndEmptyArrays: true,
          },
        },

        // Project to match PartyList format
        {
          $project: {
            _id: 1,
            partyName: 1,
            party_master_id: 1,
            billingAddress: 1,
            shippingAddress: 1,
            mobileNumber: 1,
            gstNo: 1,
            emailID: 1,
            panNo: 1,
            creditPeriod: 1,
            creditLimit: 1,
            openingBalanceType: 1,
            openingBalanceAmount: 1,
            pin: 1,
            country: 1,
            state: 1,
            accountGroupName: "$accountGroupData.accountGroup",
            accountGroup_id: "$accountGroupData._id",
            subGroupName: "$subGroupData.subGroup",
            subGroup_id: "$subGroupData._id",
            subGroup_tally_id: "$subGroupData.subGroup_id",
          },
        },
      ];

      // Execute the aggregation to get party with lookups
      const partyWithLookups = await partyModel.aggregate(aggregationPipeline);

      const newParty = partyWithLookups[0] || result;

      return res.status(200).json({
        success: true,
        message: "Party added successfully",
        result: newParty,
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

// @desc  getting a single party detail for edit
// route get/api/sUsers/getSinglePartyDetails

export const getSinglePartyDetails = async (req, res) => {
  const partyId = req.params.id;
  try {
    const getSinglePartyDetails = await partyModel
      .findById(partyId)
      .populate("accountGroup");
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
    const updateParty = await partyModel.findOneAndUpdate(
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
    const deletePartyFromList = await partyModel.findByIdAndDelete(partyId);
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
