import mongoose from "mongoose";
import barcodeModel from "../models/barcodeModel.js";
import OragnizationModel from "../models/OragnizationModel.js";
import productModel from "../models/productModel.js";
import WarrantyCard from "../models/warranyCardModel.js";
import { Godown } from "../models/subDetails.js";
import { v2 as cloudinary } from "cloudinary";
import { deleteImageFromCloudinary } from "../utils/cloudinary.js";

/**
 * @desc  add email configuration for a company
 * @route POST/api/settings/addEmailConfiguration/:cmp_id
 * @access Private
 */
export const addEmailConfiguration = async (req, res) => {
  const cmp_id = req.params.cmp_id;
  try {
    const company = await OragnizationModel.findById(cmp_id);
    if (!company) {
      return res.status(404).json({ message: "Company not found" });
    }

    const emailConfiguration = req.body;
    company.configurations[0].emailConfiguration = emailConfiguration;
    const save = await company.save();
    return res.status(200).json({
      success: true,
      message: "Email configuration saved successfully",
    });
  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .json({ success: false, message: "Internal server error, try again!" });
  }
};

/**
 * @desc get configuration of a company
 * @route GET/api/settings/getConfiguration/:cmp_id?selectedConfiguration=
 * @access Private
 */
export const getConfiguration = async (req, res) => {
  const selectedConfiguration = req.query.selectedConfiguration;
  const cmp_id = req.params.cmp_id;
  try {
    const company = await OragnizationModel.findById(cmp_id);
    if (!company) {
      return res.status(404).json({ message: "Company not found" });
    }
    const configuration = company.configurations[0];
    if (!configuration) {
      return res.status(404).json({ message: "Configuration not found" });
    }

    const dataToSend = configuration[selectedConfiguration];

    return res
      .status(200)
      .json({ message: "Configuration fetched", data: dataToSend });
  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .json({ success: false, message: "Internal server error, try again!" });
  }
};

/// @desc  get barcode list
/// @route GET/api/sUsers/getBarcodeList/:cmp_id
/// @access Public

export const getBarcodeList = async (req, res) => {
  try {
    const cmp_id = req.params.cmp_id;

    const barcodeList = await barcodeModel.find({ cmp_id: cmp_id });
    if (barcodeList.length === 0) {
      return res
        .status(404)
        .json({ success: false, message: "No barcodes found" });
    } else {
      res.status(200).json({ success: true, data: barcodeList });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

/// @desc  add barcode list
/// @route POST/api/sUsers/addBarcodeList/:cmp_id
/// @access Public

export const addBarcodeData = async (req, res) => {
  const cmp_id = req.params.cmp_id;
  const primary_user_id = req.pUserId || req.owner;
  const { stickerName, printOn, format1, format2, printOff } = req.body;
  try {
    const newBarcode = new barcodeModel({
      cmp_id,
      stickerName: stickerName || "",
      printOn: printOn || "",
      format1: format1 || "",
      format2: format2 || "",
      printOff: printOff || "",
      primary_user_id,
    });

    const existingBarcode = await barcodeModel.findOne({
      cmp_id,
      primary_user_id,
      stickerName,
    });

    if (existingBarcode) {
      return res
        .status(400)
        .json({ success: false, message: "Barcode already exists" });
    }

    const save = await newBarcode.save();
    return res.status(201).json({
      success: true,
      message: "Barcode added successfully",
      data: save,
    });
  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .json({ success: false, message: "Internal server error" });
  }
};

/// @desc  edit barcode data
/// @route PUT/api/sUsers/editBarcodeData/:id
/// @access Public

export const editBarcodeData = async (req, res) => {
  const { id } = req.params;
  const { stickerName, printOn, format1, format2, printOff } = req.body;

  try {
    const updatedBarcode = await barcodeModel.findByIdAndUpdate(
      id,
      {
        stickerName,
        printOn,
        format1,
        format2,
        printOff,
      },
      { new: true }
    );

    if (!updatedBarcode) {
      return res
        .status(404)
        .json({ success: false, message: "Barcode not found" });
    }

    return res.status(200).json({
      success: true,
      message: "Barcode updated successfully",
      data: updatedBarcode,
    });
  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .json({ success: false, message: "Internal server error" });
  }
};

/// @desc  delete barcode
/// @route DELETE/api/sUsers/deleteBarcode/:id
/// @access Public

export const deleteBarcode = async (req, res) => {
  const { id } = req.params;

  try {
    const deletedBarcode = await barcodeModel.findByIdAndDelete(id);

    if (!deletedBarcode) {
      return res
        .status(404)
        .json({ success: false, message: "Barcode not found" });
    }

    return res.status(200).json({
      success: true,
      message: "Barcode deleted successfully",
    });
  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .json({ success: false, message: "Internal server error" });
  }
};

/// @desc  get single barcode data
/// @route GET/api/sUsers/getSingleBarcode/:id
/// @access Public

export const getSingleBarcodeData = async (req, res) => {
  const { id } = req.params;

  try {
    const barcode = await barcodeModel.findById(id);

    if (!barcode) {
      return res
        .status(404)
        .json({ success: false, message: "Barcode not found" });
    }

    return res.status(200).json({ success: true, data: barcode });
  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .json({ success: false, message: "Internal server error" });
  }
};

/// @desc  get printing configuration
/// @route GET/api/sUsers/getPrintingConfiguration/:cmp_id
/// @access Public

export const getPrintingConfiguration = async (req, res) => {
  const cmp_id = req.params.cmp_id;
  const voucher = req.query.voucher || "all";

  try {
    const company = await OragnizationModel.findById(cmp_id).lean();
    if (!company) {
      return res.status(404).json({ message: "Company not found" });
    }

    // console.log("printingConfiguration", company.configurations[0].printConfiguration);

    const printingConfig = company.configurations[0].printConfiguration.find(
      (config) => config.voucher === voucher
    );
    if (!printingConfig) {
      return res
        .status(404)
        .json({ message: "Printing configuration not found" });
    }

    res.status(200).json({ success: true, data: printingConfig });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

/**
 * @desc update configuration of a company
 * @route PUT/api/settings/updateConfiguration/:cmp_id
 * @access Private
 */
export const updateConfiguration = async (req, res) => {
  const cmp_id = req?.params?.cmp_id;
  const { title, type, checked, voucher, input, value } = req?.body;

  try {
    const company = await OragnizationModel.findById(cmp_id).lean();
    if (!company) {
      return res.status(404).json({ message: "Company not found" });
    }

    const configuration = company.configurations[0];
    if (!configuration) {
      return res.status(404).json({ message: "Configuration not found" });
    }

    const selectedConfiguration = configuration[type];
    if (!selectedConfiguration) {
      return res
        .status(404)
        .json({ message: "Specific configuration not found" });
    }

    // Handle `input` and `value` case
    if (input && value !== undefined) {
      const updatedCompany = await OragnizationModel.findByIdAndUpdate(
        cmp_id,
        {
          $set: {
            [`configurations.0.${type}.$[voucher].${input}`]: value,
          },
        },
        {
          new: true,
          arrayFilters: [{ "voucher.voucher": voucher }],
        }
      );

      if (!updatedCompany) {
        return res.status(500).json({
          success: false,
          message: "Failed to update field",
        });
      }

      return res.status(200).json({
        success: true,
        message: "Field updated successfully",
        data: updatedCompany,
      });
    }

    // Prepare update object for the main field
    let updateObject = {
      [`configurations.0.${type}.$[voucher].${title}`]: checked,
    };

    // Handle mutual exclusivity for showCompanyDetails and showLetterHead
    if (
      voucher === "sale" &&
      type === "printConfiguration" &&
      (title === "showCompanyDetails" || title === "showLetterHead") &&
      checked === true
    ) {
      // If setting showCompanyDetails to true, set showLetterHead to false
      if (title === "showCompanyDetails") {
        updateObject[
          `configurations.0.${type}.$[voucher].showLetterHead`
        ] = false;
      }
      // If setting showLetterHead to true, set showCompanyDetails to false
      else if (title === "showLetterHead") {
        updateObject[
          `configurations.0.${type}.$[voucher].showCompanyDetails`
        ] = false;
      }
    }

    // Existing functionality for updating based on `title` and `checked`
    const updatedCompany = await OragnizationModel.findByIdAndUpdate(
      cmp_id,
      {
        $set: updateObject,
      },
      {
        new: true,
        arrayFilters: [{ "voucher.voucher": voucher }],
      }
    );

    if (!updatedCompany) {
      return res.status(500).json({
        success: false,
        message: "Failed to update configuration",
      });
    }

    res.status(200).json({
      success: true,
      message: "Configuration updated successfully",
      data: updatedCompany,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

/// @desc  get despatch titles
/// @route GET/api/sUsers/getDespatchTitles/:cmp_id
/// @access Public

export const getDespatchTitles = async (req, res) => {
  const cmp_id = req.params.cmp_id;
  const voucher = req.query.voucher || "all";

  try {
    const company = await OragnizationModel.findById(cmp_id).lean();
    if (!company) {
      return res.status(404).json({ message: "Company not found" });
    }

    // console.log("printingConfiguration", company.configurations[0].printConfiguration);

    const despatchTitles = company.configurations[0].despatchTitles.find(
      (config) => config.voucher === voucher
    );
    if (!despatchTitles) {
      return res.status(404).json({ message: "Despatch titles not found" });
    }

    res.status(200).json({ success: true, data: despatchTitles });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

/// @desc  update despatch titles
/// @route PUT/api/sUsers/updateDespatchTitles/:cmp_id
/// @access Public

export const updateDespatchTitles = async (req, res) => {
  const cmp_id = req?.params?.cmp_id;
  const voucher = req.query.voucher || "all";

  const {
    challanNo,
    containerNo,
    despatchThrough,
    destination,
    orderNo,
    termsOfDelivery,
    termsOfPay,
    vehicleNo,
  } = req.body;

  // Define default values
  const defaultValues = {
    ChallanNo: "Challan No",
    ContainerNo: "Container No",
    DespatchThrough: "Despatch Through",
    Destination: "Destination",
    VehicleNo: "Vehicle No",
    OrderNo: "Order No",
    TermsOfPay: "Terms Of Pay",
    TermsOfDelivery: "Terms Of Delivery",
  };

  try {
    const company = await OragnizationModel.findById(cmp_id).lean();
    if (!company) {
      return res.status(404).json({ message: "Company not found" });
    }

    const configuration = company.configurations[0];
    if (!configuration) {
      return res.status(404).json({ message: "Configuration not found" });
    }

    const despatchTitles = company.configurations[0].despatchTitles.find(
      (config) => config.voucher === voucher
    );
    if (!despatchTitles) {
      return res.status(404).json({ message: "Despatch titles not found" });
    }

    const updatedCompany = await OragnizationModel.findOneAndUpdate(
      {
        _id: cmp_id,
        "configurations.0.despatchTitles": {
          $elemMatch: { voucher: voucher },
        },
      },
      {
        $set: {
          "configurations.0.despatchTitles.$": {
            voucher: voucher,
            challanNo: challanNo || defaultValues.ChallanNo,
            containerNo: containerNo || defaultValues.ContainerNo,
            despatchThrough: despatchThrough || defaultValues.DespatchThrough,
            destination: destination || defaultValues.Destination,
            vehicleNo: vehicleNo || defaultValues.VehicleNo,
            orderNo: orderNo || defaultValues.OrderNo,
            termsOfPay: termsOfPay || defaultValues.TermsOfPay,
            termsOfDelivery: termsOfDelivery || defaultValues.TermsOfDelivery,
          },
        },
      },
      { new: true }
    );

    if (!updatedCompany) {
      return res.status(404).json({
        success: false,
        message: "Failed to update despatch titles",
      });
    }

    res.status(200).json({
      success: true,
      message: "Despatch titles updated successfully",
      data: updatedCompany,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

/// @desc  get terms and conditions
/// @route GET/api/sUsers/getTermsAndConditions/:cmp_id
/// @access Public

export const getTermsAndConditions = async (req, res) => {
  const cmp_id = req.params.cmp_id;
  const voucher = req.query.voucher || "all";

  try {
    const company = await OragnizationModel.findById(cmp_id).lean();
    if (!company) {
      return res.status(404).json({ message: "Company not found" });
    }

    // console.log("printingConfiguration", company.configurations[0].printConfiguration);

    const termsAndConditions =
      company.configurations[0].termsAndConditions?.find(
        (config) => config.voucher === voucher
      );
    if (!termsAndConditions) {
      return res
        .status(404)
        .json({ message: "Terms and conditions not found" });
    }

    res.status(200).json({ success: true, data: termsAndConditions });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

/// @desc  update terms and conditions
/// @route PUT/api/sUsers/updateTermsAndConditions/:cmp_id
/// @access Public

export const updateTermsAndConditions = async (req, res) => {
  const cmp_id = req?.params?.cmp_id;
  const voucher = req.query.voucher || "all";

  const termsAndConditions = req.body;

  try {
    // Fetch the company and its configurations
    const company = await OragnizationModel.findById(cmp_id).lean();
    if (!company) {
      return res.status(404).json({ message: "Company not found" });
    }

    const configuration = company.configurations[0];
    if (!configuration) {
      return res.status(404).json({ message: "Configuration not found" });
    }

    // Check if the terms for the specified voucher exist
    const termsIndex = configuration.termsAndConditions?.findIndex(
      (term) => term.voucher === voucher
    );

    let updatedCompany;

    if (termsIndex > -1) {
      // If terms exist, update them
      updatedCompany = await OragnizationModel.findOneAndUpdate(
        {
          _id: cmp_id,
          "configurations.0.termsAndConditions": {
            $elemMatch: { voucher: voucher },
          },
        },
        {
          $set: {
            "configurations.0.termsAndConditions.$": {
              voucher: voucher,
              terms: termsAndConditions,
            },
          },
        },
        { new: true }
      );
    } else {
      // If terms don't exist, push new terms
      updatedCompany = await OragnizationModel.findOneAndUpdate(
        { _id: cmp_id },
        {
          $push: {
            "configurations.0.termsAndConditions": {
              voucher: voucher,
              terms: termsAndConditions,
            },
          },
        },
        { new: true }
      );
    }

    if (!updatedCompany) {
      return res.status(404).json({
        success: false,
        message: "Failed to update terms and conditions",
      });
    }

    res.status(200).json({
      success: true,
      message: "Terms and conditions updated successfully",
      data: updatedCompany,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

/**
 * @description Update bank account details of a company
 * @route PUT /api/settings/updateBankAccount/:cmp_id
 * @access Private
 */
export const updateBankAccount = async (req, res) => {
  const cmp_id = req?.params?.cmp_id;

  const { bankAccount } = req.body;

  try {
    const updatedCompany = await OragnizationModel.findOneAndUpdate(
      { _id: cmp_id },
      {
        $set: {
          "configurations.0.bank": bankAccount,
        },
      },
      { new: true }
    );
    if (!updatedCompany) {
      return res.status(404).json({
        success: false,
        message: "Failed to update bank account",
      });
    }
    res.status(200).json({
      success: true,
      message: "Bank account updated successfully",
      data: updatedCompany,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

/**
 * @description Generic function to update any configuration field of a company
 * @param {string} cmp_id Company ID
 * @param {string} voucher Voucher type (sale or saleOrder)
 * @param {string} configField The configuration field to update (e.g., 'addRateWithTax', 'otherField')
 * @param {any} value New value for the configuration field
 * @param {object} defaultValue Default structure for the field if it doesn't exist
 * @returns {object} Updated company configuration
 * @route PUT /api/settings/updateConfiguration/:cmp_id?voucher={sale|saleOrder}&field={configField}
 * @access Private
 */
export const updateCommonToggleConfiguration = async (req, res) => {
  try {
    const cmp_id = req?.params?.cmp_id;
    const { value, voucher, configField } = req.body;

    // Validate inputs
    if (!cmp_id || !voucher || !configField) {
      return res.status(400).json({
        message:
          "Company ID, voucher type, and configuration field are required",
      });
    }

    // Find company
    const company = await OragnizationModel.findById(cmp_id);
    if (!company) {
      return res.status(404).json({ message: "Company not found" });
    }

    // Ensure configurations array exists and has at least one element
    if (!company.configurations || company.configurations.length === 0) {
      company.configurations = [{}];
    }

    // Get default structure for the field (you can customize this based on your needs)
    const defaultStructures = {
      sale: false,
      saleOrder: false,
    };

    // Initialize field if it doesn't exist
    if (!company.configurations[0][configField]) {
      company.configurations[0][configField] = defaultStructures;
    }

    // Update the specific voucher type for the field
    company.configurations[0][configField] = {
      ...company.configurations[0][configField],
      [voucher]: value,
    };

    // Save the updated company
    await company.save();

    return res.status(200).json({
      message: `${configField} configuration updated successfully`,
      updatedConfig: company,
    });
  } catch (error) {
    console.error("Error updating configuration:", error);
    return res.status(500).json({
      message: "Internal server error",
      error: error.message,
    });
  }
};

/**
 * @description Update ship to configuration for a company
 * @route PUT /api/settings/updateShipToConfiguration/:cmp_id?voucher=
 * @access Private
 */
export const updateShipToConfiguration = async (req, res) => {
  try {
    const cmp_id = req?.params?.cmp_id;
    const voucher = req.query.voucher || "";
    const { enableShipTo: value } = req.body; // Expecting a boolean value

    // Validate inputs
    if (!cmp_id || !voucher) {
      return res.status(400).json({
        message: "Company ID and voucher type are required",
      });
    }

    if (typeof value !== "boolean") {
      return res.status(400).json({
        message: "Value must be a boolean (true/false)",
      });
    }

    // Find company and update configuration
    const company = await OragnizationModel.findById(cmp_id);
    if (!company) {
      return res.status(404).json({ message: "Company not found" });
    }

    // Ensure configurations array exists and has at least one element
    if (!company.configurations || company.configurations.length === 0) {
      company.configurations = [{}];
    }

    // Initialize enableShipTo if it doesn't exist
    if (!company.configurations[0].enableShipTo) {
      company.configurations[0].enableShipTo = {
        sale: false,
        saleOrder: false,
      };
    }

    company.configurations[0].enableShipTo = {
      ...company.configurations[0].enableShipTo,
      [voucher]: value,
    };

    // Save the updated company
    await company.save();

    return res.status(200).json({
      message: "Address  configuration updated successfully",
      updatedConfig: company,
    });
  } catch (error) {
    console.error("Error updating address configuration:", error);
    return res.status(500).json({
      message: "Internal server error",
      error: error.message,
    });
  }
};

/**
 * @description Update a field in the first layer of a company's configuration
 * @param {string} cmp_id Company ID
 * @param {string} fieldToUpdate Name of the field to update
 * @param {any} value New value for the field
 * @returns {object} Updated company configuration
 * @route PUT /api/settings/updateFirstLayerConfiguration/:cmp_id
 * @access Private
 */
export const updateFirstLayerConfiguration = async (req, res) => {
  const cmp_id = req?.params?.cmp_id;
  const { fieldToUpdate, value } = req.body;

  const session = await mongoose.startSession();

  try {
    // Validate inputs
    if (!cmp_id || !fieldToUpdate || value === undefined) {
      return res.status(400).json({
        message: "Company ID, fieldToUpdate, and value are required",
      });
    }

    // Start a transaction
    await session.startTransaction();

    // Find company and update configuration
    const company = await OragnizationModel.findById(cmp_id).session(session);
    if (!company) {
      await session.abortTransaction();
      session.endSession();
      return res.status(404).json({ message: "Company not found" });
    }

    // Ensure configurations array exists and has at least one element
    if (!company.configurations || company.configurations.length === 0) {
      company.configurations = [{}];
    }

    const companyConfig = company.configurations[0];

    // Update only the first element
    companyConfig[fieldToUpdate] = value;

    /// if the fieldToUpdate is batchEnabled ,adjust  Manufacturing Date and Expiry Date accordingly
    if (fieldToUpdate === "batchEnabled") {
      if (value === false) {
        companyConfig.enableManufacturingDate = false;
        companyConfig.enableExpiryDate = false;
      }
    }

    // Special handling for gdnEnabled
    if (fieldToUpdate === "gdnEnabled" && value === true) {
      const defaultGodown = await Godown.findOne({
        cmp_id: cmp_id,
        defaultGodown: true,
      }).session(session);

      console.log("defaultGodown", defaultGodown);

      if (!defaultGodown) {
        throw new Error("Default godown not found");
      }

      // Update all products: set gdnEnabled and update GodownList
      const result = await productModel.updateMany(
        { cmp_id: cmp_id },
        [
          {
            $set: {
              gdnEnabled: true,
              GodownList: {
                $map: {
                  input: "$GodownList",
                  as: "item",
                  in: {
                    $mergeObjects: ["$$item", { godown: defaultGodown._id }],
                  },
                },
              },
            },
          },
        ],
        { session }
      );
    }

    // Save the updated company
    await company.save({ session });

    // Commit the transaction
    await session.commitTransaction();
    session.endSession();

    return res.status(200).json({
      message: "Configuration updated successfully",
      data: company,
    });
  } catch (error) {
    // Abort transaction if it's still active
    if (session.inTransaction()) {
      await session.abortTransaction();
      session.endSession();
    }

    console.error("Error updating configuration:", error);
    return res.status(500).json({
      message: "Internal server error",
      error: error.message,
    });
  }
};

// @desc    Create warranty card
// @route   POST /api/warranty-cards
// @access  Private
export const createWarrantyCard = async (req, res) => {
  try {
    const {
      name,
      warrantyYears = 0,
      warrantyMonths = 0,
      displayInput,
      termsAndConditions,
      customerCareInfo,
      customerCareNo,
      imageUrl,
      imagePublicId,
    } = req.body;


    if (warrantyYears === null) body.warrantyYears = 0;
    if (warrantyMonths === null) body.warrantyMonths = 0;

    const Primary_user_id = req.owner;
    const cmp_id = req.params.cmp_id;

    //// check if any warranty card added with this name
    const existingWarrantyCard = await WarrantyCard.findOne({
      name: new RegExp(`^${name}$`, "i"),
      cmp_id,
    });

    if (existingWarrantyCard) {
      return res
        .status(400)
        .json({ success: false, message: "Warranty card already exists" });
    }

    const warrantyCard = await WarrantyCard.create({
      name,
      warrantyYears: parseInt(warrantyYears),
      warrantyMonths: parseInt(warrantyMonths),
      displayInput,
      termsAndConditions,
      customerCareInfo,
      customerCareNo,
      cmp_id,
      Primary_user_id,
      imageUrl,
      imagePublicId,
    });

    res.status(201).json({
      success: true,
      data: warrantyCard,
      message: "Warranty card created successfully",
    });
  } catch (error) {
    const { imagePublicId } = req.body;
    console.error("Error creating warranty card:", error);
    if (imagePublicId) {
      await deleteImageFromCloudinary(imagePublicId);
    }

    res.status(400).json({
      success: false,
      message: "Bad Request",
      error: error.message,
    });
  }
};

// @desc    Get all warranty cards
// @route   GET /api/warranty-cards
// @access  Public
export const getWarrantyCards = async (req, res) => {
  try {
    const cmp_id = req.params.cmp_id;

    if (!cmp_id) {
      console.error("Company ID is required for getting warranty cards.");
    }

    const warrantyCards = await WarrantyCard.find({ cmp_id: cmp_id });
    res.status(200).json({
      success: true,
      data: warrantyCards,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server Error",
      error: error.message,
    });
  }
};

// @desc    Update warranty card
// @route   PUT /api/warranty-cards/:id
// @access  Private
export const updateWarrantyCard = async (req, res) => {
  try {
    const warrantyCard = await WarrantyCard.findById(req.params.id);

    if (!warrantyCard) {
      return res.status(404).json({
        success: false,
        message: "Warranty card not found",
      });
    }

    const {
      name,
      warrantyYears,
      warrantyMonths,
      displayInput,
      termsAndConditions,
      customerCareInfo,
      customerCareNo,
      imageUrl,
      imagePublicId,
    } = req.body;

    if (
      warrantyCard?.imagePublicId &&
      warrantyCard?.imagePublicId !== imagePublicId
    ) {
      await deleteImageFromCloudinary(warrantyCard?.imagePublicId);
    }

    // Update fields
    warrantyCard.name = name || warrantyCard.name;
    warrantyCard.warrantyYears = warrantyYears
      ? parseInt(warrantyYears)
      : warrantyCard.warrantyYears;
    warrantyCard.warrantyMonths = warrantyMonths
      ? parseInt(warrantyMonths)
      : warrantyCard.warrantyMonths;
    warrantyCard.displayInput = displayInput || warrantyCard.displayInput;
    warrantyCard.termsAndConditions =
      termsAndConditions || warrantyCard.termsAndConditions;
    warrantyCard.customerCareInfo =
      customerCareInfo || warrantyCard.customerCareInfo;
    warrantyCard.customerCareNo = customerCareNo || warrantyCard.customerCareNo;
    warrantyCard.updatedBy = req.user?.id; // Set if you have authentication
    warrantyCard.imageUrl = imageUrl || warrantyCard.imageUrl;
    warrantyCard.imagePublicId = imagePublicId || warrantyCard.imagePublicId;

    const updatedWarrantyCard = await warrantyCard.save();

    res.status(200).json({
      success: true,
      data: updatedWarrantyCard,
      message: "Warranty card updated successfully",
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: "Bad Request",
      error: error.message,
    });
  }
};

// @desc    Delete warranty card
// @route   DELETE /api/warranty-cards/:id
// @access  Private
export const deleteWarrantyCard = async (req, res) => {
  try {
    const warrantyCard = await WarrantyCard.findById(req.params.id);

    if (!warrantyCard) {
      return res.status(404).json({
        success: false,
        message: "Warranty card not found",
      });
    }

    //// Delete image from cloudinary

    if (warrantyCard?.imagePublicId) {
      await deleteImageFromCloudinary(warrantyCard?.imagePublicId);
    }

    await WarrantyCard.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      message: "Warranty card deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server Error",
      error: error.message,
    });
  }
};

/// @desc  Upload letter head image for a company
/// @route POST /api/settings/uploadLetterHead/:cmp_id

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export const uploadLetterHead = async (req, res) => {
  const cmp_id = req?.params?.cmp_id;
  const { type, voucher, letterHeadUrl, cloudinaryPublicId } = req?.body;

  try {
    // Validate required fields
    if (!type || !voucher) {
      return res.status(400).json({
        success: false,
        message: "Type and voucher are required fields",
      });
    }

    // Check if letterHeadUrl URL and cloudinaryPublicId are provided
    if (!letterHeadUrl || !cloudinaryPublicId) {
      return res.status(400).json({
        success: false,
        message: "Letter head file URL and Cloudinary public ID are required",
      });
    }

    // Find the company
    const company = await OragnizationModel.findById(cmp_id).lean();
    if (!company) {
      return res.status(404).json({
        success: false,
        message: "Company not found",
      });
    }

    // Check if configuration exists
    const configuration = company.configurations[0];
    if (!configuration) {
      return res.status(404).json({
        success: false,
        message: "Configuration not found",
      });
    }

    const selectedConfiguration = configuration[type];
    if (!selectedConfiguration) {
      return res.status(404).json({
        success: false,
        message: "Print configuration not found",
      });
    }

    // Find the specific voucher to check for existing letterHeadPublicId
    const existingVoucher = selectedConfiguration.find(
      (v) => v.voucher === voucher
    );
    let oldPublicId = null;

    if (existingVoucher && existingVoucher.letterHeadPublicId) {
      oldPublicId = existingVoucher.letterHeadPublicId;
      console.log(`Found existing letterhead to delete: ${oldPublicId}`);
    }

    // Delete old letterhead from Cloudinary if it exists
    if (oldPublicId && oldPublicId !== cloudinaryPublicId) {
      try {
        await cloudinary.uploader.destroy(oldPublicId, {
          cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
          api_key: process.env.CLOUDINARY_API_KEY,
          api_secret: process.env.CLOUDINARY_API_SECRET,
        });
        console.log(
          `Successfully deleted old letterhead from Cloudinary: ${oldPublicId}`
        );
      } catch (deleteError) {
        console.error(
          "Error deleting old letterhead from Cloudinary:",
          deleteError
        );
        // Continue with the update even if deletion fails
        // The old image will remain in Cloudinary but won't be referenced
      }
    }

    // Update the organization with the new letter head URL
    const updatedCompany = await OragnizationModel.findByIdAndUpdate(
      cmp_id,
      {
        $set: {
          [`configurations.0.${type}.$[voucher].letterHeadUrl`]: letterHeadUrl,
          [`configurations.0.${type}.$[voucher].letterHeadPublicId`]:
            cloudinaryPublicId,
          [`configurations.0.${type}.$[voucher].letterHeadUploadedAt`]:
            new Date(),
        },
      },
      {
        new: true,
        arrayFilters: [{ "voucher.voucher": voucher }],
      }
    );

    // Check if the update was successful
    if (!updatedCompany) {
      // If database update failed, delete the newly uploaded file from Cloudinary
      try {
        await cloudinary.uploader.destroy(cloudinaryPublicId);
        console.log(
          `Deleted new file from Cloudinary due to DB update failure: ${cloudinaryPublicId}`
        );
      } catch (deleteError) {
        console.error("Error deleting new file from Cloudinary:", deleteError);
      }

      return res.status(500).json({
        success: false,
        message: "Failed to update company configuration",
      });
    }

    res.status(200).json({
      success: true,
      message: "Letter head uploaded successfully",
      data: updatedCompany,
    });
  } catch (error) {
    console.error("Letter head upload error:", error);

    // If any error occurs, delete the newly uploaded file from Cloudinary
    if (cloudinaryPublicId) {
      try {
        await cloudinary.uploader.destroy(cloudinaryPublicId);
        console.log(
          `Deleted new file from Cloudinary due to error: ${cloudinaryPublicId}`
        );
      } catch (deleteError) {
        console.error("Error deleting new file from Cloudinary:", deleteError);
      }
    }

    // Handle specific MongoDB errors
    if (error.name === "ValidationError") {
      return res.status(400).json({
        success: false,
        message: `Validation error: ${error.message}`,
      });
    }

    if (error.name === "CastError") {
      return res.status(400).json({
        success: false,
        message: "Invalid company ID format",
      });
    }

    res.status(500).json({
      success: false,
      message: "Internal server error while uploading letter head",
    });
  }
};
