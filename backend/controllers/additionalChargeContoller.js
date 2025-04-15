// @desc adding additional charges in orgData
// route POST /api/sUsers/addAdditionalCharge

import mongoose from "mongoose";
import additionalChargesModel from "../models/additionalChargesModel.js";

export const addAditionalCharge = async (req, res) => {
  const cmp_id = req.params.cmp_id;
  try {
    /// existing charge
    const existingCharge = await additionalChargesModel.findOne({
      cmp_id: cmp_id,
      name: req.body.name,
    });

    if (existingCharge) {
      return res.status(400).json({
        success: false,
        message: "Additional charge already exists.",
      });
    }

    const result = await new additionalChargesModel({
      ...req.body,
      cmp_id: cmp_id,
      Primary_user_id: req.owner,
    }).save();

    return res.status(200).json({
      success: true,
      message: "Additional charge added successfully",
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
    const cmp_id = req.params.cmp_id;

    const result = await additionalChargesModel.findOneAndUpdate(
      { _id: id, cmp_id: cmp_id },
      req.body,
      { new: true }
    );

    return res.status(200).json({
      success: true,
      message: "Additional charge updated successfully",
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: "Internal server error, try again!",
    });
  }
};

// @desc delete AdditionalCharge
// route get/api/sUsers/deleteAdditionalCharge

export const deleteAdditionalCharge = async (req, res) => {
  try {
    const id = req.params.id;

    const result = await additionalChargesModel.findOneAndDelete({
      _id: id,
    });

    return res.status(200).json({
      success: true,
      message: "Additional charge deleted successfully",
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: "Internal server error, try again!",
    });
  }
};

// @desc to  get additional charges
// route get/api/sUsers/additionalCharges

export const fetchAdditionalCharges = async (req, res) => {
  try {
    const cmp_id = req.params.cmp_id;
    const pUser = req.owner;

    const additionalCharges = await additionalChargesModel.find({
      cmp_id: cmp_id,
      Primary_user_id: pUser,
    });

    if (additionalCharges) {
      res.status(200).json({
        message: "additional details fetched",
        additionalCharges: additionalCharges,
      });
    }
  } catch (error) {
    console.error("Error fetching godownwise products:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

// @desc to  get single additional charges
// route get/api/sUsers/getSingleAdditionalCharge/:id

export const fetchSingleAdditionalCharge = async (req, res) => {
  try {
    const id = req.params.id;
    const cmp_id = req.params.cmp_id;
    const pUser = req.owner;

    const additionalCharge = await additionalChargesModel.findOne({
      _id: id,
      cmp_id: cmp_id,
      Primary_user_id: pUser,
    });

    if (additionalCharge) {
      res.status(200).json({
        message: "additional details fetched",
        additionalCharge: additionalCharge,
      });
    }
  } catch (error) {
    console.error("Error fetching godownwise products:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};
