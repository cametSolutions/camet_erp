import mongoose from "mongoose";
import barcodeModel from "../models/barcodeModel.js";
import OragnizationModel from "../models/OragnizationModel.js";
import productModel from "../models/productModel.js";

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

    // Existing functionality for updating based on `title` and `checked`
    const updatedCompany = await OragnizationModel.findByIdAndUpdate(
      cmp_id,
      {
        $set: {
          [`configurations.0.${type}.$[voucher].${title}`]: checked,
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
      data: updatedCompany
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
      data: updatedCompany.configurations[0].termsAndConditions.find(
        (config) => config.voucher === voucher
      ),
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
 * @description Update tax configuration of a company
 * @param {string} cmp_id Company ID
 * @param {string} voucher Voucher type (sale or saleOrder)
 * @param {boolean} value New value for addRateWithTax
 * @returns {object} Updated company configuration
 * @route PUT /api/settings/updateTaxConfiguration/:cmp_id?voucher={sale|saleOrder}
 * @access Private
 */
export const updateTaxConfiguration = async (req, res) => {
  try {
    const cmp_id = req?.params?.cmp_id;
    const voucher = req.query.voucher || "";
    const { addRateWithTax: value } = req.body; // Expecting a boolean value

    console.log("value", value);

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

    // Initialize addRateWithTax if it doesn't exist
    if (!company.configurations[0].addRateWithTax) {
      company.configurations[0].addRateWithTax = {
        sale: false,
        saleOrder: false,
      };
    }

    company.configurations[0].addRateWithTax = {
      ...company.configurations[0].addRateWithTax,
      [voucher]: value,
    };

    // console.log("company.configurations[0].addRateWithTax", company.configurations[0].addRateWithTax);

    // Save the updated company
    await company.save();

    return res.status(200).json({
      message: "Tax configuration updated successfully",
      updatedConfig: company,
    });
  } catch (error) {
    console.error("Error updating tax configuration:", error);
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

    // Update only the first element
    company.configurations[0][fieldToUpdate] = value;

    // Special handling for gdnEnabled
    if (fieldToUpdate === 'gdnEnabled' && value === true) {

      console.log("here");
      
      // Update all products for this company to enable godown
      const result = await productModel.updateMany(
        { cmp_id: cmp_id }, 
        { $set: { gdnEnabled: true } },
        { session }
      );
      console.log("result", result);


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
