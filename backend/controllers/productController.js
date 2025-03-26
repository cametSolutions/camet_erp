import mongoose from "mongoose";
import productModel from "../models/productModel.js";
import secondaryUserModel from "../models/secondaryUserModel.js";

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
        gdnEnabled,
        sub_category,
        unit,
        alt_unit,
        unit_conversion,
        alt_unit_conversion,
        hsn_code,
        cgst,
        sgst,
        igst,
        cess,
        addl_cess,
        purchase_price,
        item_mrp,
        purchase_cost,
        Priceleveles,
        GodownList,
      },
    } = req;

    // Check for existing product by name and cmp_id
    const existingProductByName = await productModel.findOne({
      product_name: { $regex: new RegExp(`^${product_name}$`, "i") },
      cmp_id,
    });

    // Check for existing product by code and cmp_id
    const existingProductByCode = await productModel.findOne({
      product_code: { $regex: new RegExp(`^${product_code}$`, "i") },
      cmp_id,
    });

    if (existingProductByName) {
      return res.status(400).json({
        success: false,
        message: "Product with this name already exists for this company.",
      });
    }

    if (existingProductByCode) {
      return res.status(400).json({
        success: false,
        message:
          "Product with this product code already exists for this company.",
      });
    }
    // Prepare data to save
    const dataToSave = {
      cmp_id,

      product_name,
      Primary_user_id: req.pUserId || req.owner,
      product_code,
      balance_stock,
      brand,
      category,
      sub_category,
      batchEnabled,
      gdnEnabled,
      unit,
      alt_unit,
      unit_conversion,
      alt_unit_conversion,
      hsn_code,
      purchase_price,
      purchase_cost,
      item_mrp,
      Priceleveles,
      GodownList,
      cgst,
      sgst,
      igst,
      cess,
      addl_cess,
    };

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
        cmp_id,
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
        hsn_code,
        cgst,
        sgst,
        igst,
        cess,
        addl_cess,
        purchase_price,
        item_mrp,
        purchase_cost,
        Priceleveles,
        GodownList,
        batchEnabled,
        gdnEnabled
      },
    } = req;

    // Check for existing product by name and cmp_id
    const existingProductByName = await productModel.findOne({
      _id: { $ne: productId }, // Exclude the current product
      product_name: { $regex: new RegExp(`^${product_name}$`, "i") },
      cmp_id,
    });

    // Check for existing product by code and cmp_id
    const existingProductByCode = await productModel.findOne({
      _id: { $ne: productId }, // Exclude the current product
      product_code: { $regex: new RegExp(`^${product_code}$`, "i") },
      cmp_id,
    });

    if (existingProductByName) {
      return res.status(400).json({
        success: false,
        message: "Product with this name already exists for this company.",
      });
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
      item_mrp,
      Priceleveles,
      GodownList,
      cgst,
      sgst,
      igst,
      cess,
      addl_cess,
      batchEnabled,
      gdnEnabled
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

// @desc  getting a single product detail for edit
// route get/api/sUsers/productDetails

export const productDetails = async (req, res) => {
  const productId = req.params.id;
  try {
    const productDetails = await productModel.findById(productId);
    res.status(200).json({ success: true, data: productDetails });
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ success: false, message: "Internal server error, try again!" });
  }
};

// @desc delete product from  product list
// route delete/api/pUsers/deleteProduct

export const deleteProduct = async (req, res) => {
  const productId = req.params.id;

  try {
    const deletedProduct = await productModel.findByIdAndDelete(productId);
    if (deletedProduct) {
      return res.status(200).json({
        success: true,
        message: "Product deleted successfully",
      });
    } else {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: "Internal server error, try again!",
    });
  }
};

// @desc getting product list
// route get/api/pUsers/

export const getProducts = async (req, res) => {
  const Secondary_user_id = req.sUserId;
  const cmp_id = req.params.cmp_id;
  const taxInclusive = req.query.taxInclusive === "true";
  const vanSaleQuery = req.query.vanSale;
  const isVanSale = vanSaleQuery === "true";

  const excludeGodownId = req.query.excludeGodownId;
  const stockTransfer = req.query.stockTransfer;

  const Primary_user_id = new mongoose.Types.ObjectId(req.owner);

  try {
    const secUser = await secondaryUserModel.findById(Secondary_user_id);

    if (!secUser) {
      return res.status(404).json({ message: "Secondary user not found" });
    }

    const configuration = secUser.configurations.find(
      (item) => item.organization == cmp_id
    );

    let matchStage = {
      $match: {
        Primary_user_id: new mongoose.Types.ObjectId(Primary_user_id),
        cmp_id: new mongoose.Types.ObjectId(cmp_id), // without 'new'
      },
    };

    let selectedGodowns;
    if (isVanSale && configuration?.selectedVanSaleGodowns.length > 0) {
      selectedGodowns = configuration.selectedVanSaleGodowns;
    } else if (!isVanSale && configuration && configuration.selectedGodowns) {
      selectedGodowns = configuration.selectedGodowns;
    }

    let projectStage = {
      $project: {
        product_name: 1,
        cmp_id: 1,
        product_code: 1,
        balance_stock: 1,
        Primary_user_id: 1,
        brand: 1,
        category: 1,
        sub_category: 1,
        unit: 1,
        alt_unit: 1,
        unit_conversion: 1,
        alt_unit_conversion: 1,
        hsn_code: 1,
        purchase_price: 1,
        purchase_cost: 1,
        Priceleveles: 1,
        cgst: 1,
        sgst: 1,
        igst: 1,
        cess: 1,
        addl_cess: 1,
        state_cess: 1,
        product_master_id: 1,
        __v: 1,
        GodownList: 1,
        batchEnabled: 1,
        item_mrp: 1,
      },
    };

    if (
      selectedGodowns &&
      selectedGodowns.length > 0 &&
      stockTransfer !== "true"
    ) {
      matchStage.$match["GodownList.godown_id"] = { $in: selectedGodowns };

      projectStage.$project.GodownList = {
        $filter: {
          input: "$GodownList",
          as: "godown",
          cond: { $in: ["$$godown.godown_id", selectedGodowns] },
        },
      };
    }

    if (excludeGodownId) {
      projectStage.$project.GodownList = {
        $filter: {
          input: "$GodownList",
          as: "godown",
          cond: { $ne: ["$$godown.godown_id", excludeGodownId] },
        },
      };
    }

    const addFieldsStage = {
      $addFields: {
        hasGodownOrBatch: {
          $anyElementTrue: {
            $map: {
              input: "$GodownList",
              as: "godown",
              in: {
                $or: [
                  { $ifNull: ["$$godown.godown", false] },
                  { $ifNull: ["$$godown.batch", false] },
                ],
              },
            },
          },
        },
      },
    };

    // New stage to filter out products with empty GodownList
    const filterEmptyGodownListStage = {
      $match: {
        $expr: {
          $cond: {
            if: { $eq: [excludeGodownId, null] },
            then: { $gt: [{ $size: "$GodownList" }, 0] },
            else: {
              $and: [
                { $gt: [{ $size: "$GodownList" }, 0] },
                {
                  $anyElementTrue: {
                    $map: {
                      input: "$GodownList",
                      as: "godown",
                      in: {
                        $and: [
                          { $ifNull: ["$$godown.godown", false] },
                          { $ifNull: ["$$godown.godown_id", false] },
                        ],
                      },
                    },
                  },
                },
              ],
            },
          },
        },
      },
    };

    const aggregationPipeline = [
      matchStage,
      projectStage,
      addFieldsStage,
      filterEmptyGodownListStage,
    ];

    // Conditionally add taxInclusive stage
    if (taxInclusive) {
      const addTaxInclusiveStage = {
        $addFields: {
          isTaxInclusive: true,
        },
      };
      aggregationPipeline.push(addTaxInclusiveStage);
    }

    const products = await productModel.aggregate(aggregationPipeline);

    if (products && products.length > 0) {
      return res.status(200).json({
        productData: products,
        message: "Products fetched",
      });
    } else {
      return res.status(404).json({ message: "No products were found" });
    }
  } catch (error) {
    console.log(error);
    return res
      .status(500)
      .json({ success: false, message: "Internal server error, try again!" });
  }
};
