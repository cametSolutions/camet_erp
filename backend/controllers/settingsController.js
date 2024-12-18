import barcodeModel from "../models/barcodeModel.js";
import OragnizationModel from "../models/OragnizationModel.js";

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




