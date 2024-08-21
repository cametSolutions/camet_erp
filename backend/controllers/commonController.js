import hsnModel from "../models/hsnModel.js";
import productModel from "../models/productModel.js";
import salesModel from "../models/salesModel.js";
import stockTransferModel from "../models/stockTransferModel.js";

// @desc to  get stock transfer details
// route get/api/sUsers/getStockTransferDetails;
export const getStockTransferDetails = async (req, res) => {
  try {
    const id = req.params.id;

    const details = await stockTransferModel.findById(id);
    if (details) {
      res
        .status(200)
        .json({ message: "Stock Transfer Details fetched", data: details });
    } else {
      res.status(404).json({ error: "Stock Transfer Details not found" });
    }
  } catch (error) {
    console.error("Error in getting StockTransferDetails:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

// @desc adding new Product
// route POst/api/pUsers/addProduct

export const addProduct = async (req, res) => {
  try {
    const {
    
      body: {
        cmp_id,
        product_name,
        product_code,
        balance_stock,
        brand,
        category,
        batchEnabled,
        sub_category,
        unit,
        alt_unit,
        unit_conversion,
        alt_unit_conversion,
        // hsn_code,
        purchase_price,
        purchase_cost,
        Priceleveles,
        GodownList,
      },
    } = req;

    let hsn_code = req.body.hsn_code;

    // Fetch HSN details
    const hsnDetails = await hsnModel.findById(hsn_code);


    // Extract required fields from HSN details
    let cgst, sgst, igst, cess, addl_cess, hsn_id;
    if (hsnDetails) {
      ({
        igstRate: igst,
        cgstRate: cgst,
        sgstUtgstRate: sgst,
        onValue: cess,
        onQuantity: addl_cess,
        hsn: hsn_code,
        _id: hsn_id,
      } = hsnDetails);
    }

    // Prepare data to save
    const dataToSave = {
      cmp_id,

      product_name,
      Primary_user_id :req.pUserId || req.owner,
      product_code,
      balance_stock,
      brand,
      category,
      sub_category,
      batchEnabled,
      unit,
      alt_unit,
      unit_conversion,
      alt_unit_conversion,
      hsn_code,
      purchase_price,
      purchase_cost,
      Priceleveles,
      GodownList,
      cgst,
      sgst,
      igst,
      cess,
      addl_cess,
      hsn_id,
    };


    console.log("data to save in add product ",dataToSave);
    
    // Save the product
    const newProduct = await productModel.create(dataToSave);

    // Return success response
    return res.status(200).json({
      success: true,
      message: "Product added successfully",
    });
  } catch (error) {
    console.error(error);

    // Return error response
    return res.status(500).json({
      success: false,
      message: "Internal server error, try again!",
    });
  }
};


// @desc  edit product details
// route get/api/pUsers/editProduct

export const editProduct = async (req, res) => {
  const productId = req.params.id;

  try {
    const {
   
      body: {
        product_name,
        product_code,
        balance_stock,
        brand,
        category,
        sub_category,
        unit,
        alt_unit,
        unit_conversion,
        alt_unit_conversion,
        // hsn_code,
        purchase_price,
        purchase_cost,
        Priceleveles,
        GodownList,
        batchEnabled
      },
    } = req;

    let hsn_code = req.body.hsn_code;

    // Fetch HSN details
    const hsnDetails = await hsnModel.findById(hsn_code);

    // Extract required fields from HSN details
    let cgst, sgst, igst, cess, addl_cess;
    if (hsnDetails) {
      ({
        igstRate: igst,
        cgstRate: cgst,
        sgstUtgstRate: sgst,
        onValue: cess,
        onQuantity: addl_cess,
        hsn: hsn_code,
      } = hsnDetails);
    }

    // Prepare data to save
    const dataToSave = {
      product_name,
      Primary_user_id: req.pUserId || req.owner,
      product_code,
      balance_stock,
      brand,
      category,
      sub_category,
      unit,
      alt_unit,
      unit_conversion,
      alt_unit_conversion,
      hsn_code,
      purchase_price,
      purchase_cost,
      Priceleveles,
      GodownList,
      cgst,
      sgst,
      igst,
      cess,
      addl_cess,
      batchEnabled
    };


    const updateProduct = await productModel.findOneAndUpdate(
      { _id: productId },
      dataToSave,
      { new: true }
    );
    res.status(200).json({
      success: true,
      message: "Product updated successfully",
      data: updateProduct,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};