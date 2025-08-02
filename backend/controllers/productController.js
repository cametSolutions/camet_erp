import mongoose from "mongoose";
import productModel from "../models/productModel.js";
import SecondaryUser from "../models/secondaryUserModel.js";
import {
  Brand,
  Category,
  Godown,
  PriceLevel,
  Subcategory,
} from "../models/subDetails.js";
import OragnizationModel from "../models/OragnizationModel.js";

// controllers/productController.js
import {
  extractRequestParams,
  buildDatabaseFilter,
  getSelectedGodowns,
  transformProducts,
  validateExcludeGodownId,
  fetchProductsFromDatabase,
  sendProductResponse,
} from "../helpers/productHelper.js";

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

    if (existingProductByName) {
      return res.status(400).json({
        success: false,
        message: "Product with this name already exists for this company.",
      });
    }

    // Check for existing product by code and cmp_id
    if (product_code) {
      const existingProductByCode = await productModel.findOne({
        product_code: { $regex: new RegExp(`^${product_code}$`, "i") },
        cmp_id,
      });

      if (existingProductByCode) {
        return res.status(400).json({
          success: false,
          message:
            "Product with this product code already exists for this company.",
        });
      }
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
        gdnEnabled,
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
      gdnEnabled,
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

/**
 * @desc  adding subDetails of product such as brand category subcategory etc
 * @route POST/api/pUsers/addProductSubDetails
 * @access public
 */

export const addProductSubDetails = async (req, res) => {
  try {
    const subDetails = req.body;
    const key = Object.keys(subDetails)[0];
    const orgId = req.params.orgId;

    let Model;
    let dataToSave;
    /// add godownEnabled tag to company
    const company = await OragnizationModel.findOne({ _id: orgId });
    const generatedId = new mongoose.Types.ObjectId();
    switch (key) {
      case "brand":
      case "roomType":
        Model = Brand;
        dataToSave = {
          _id: generatedId,
          brand: subDetails[key],
          brand_id: generatedId,
          cmp_id: orgId,
          Primary_user_id: req.pUserId || req.owner,
          ...(Number(subDetails.price) > 0 && {
            roomRent: Number(subDetails.price),
          }),
        };
        break;
      case "Regional Food Category":
        Model = Category;
        dataToSave = {
          _id: generatedId,
          category: subDetails[key],
          category_id: generatedId,
          cmp_id: orgId,
          Primary_user_id: req.pUserId || req.owner,
          under: "restaurant",
        };
        break;
      case "bedType":
      case "category":
        Model = Category;
        dataToSave = {
          _id: generatedId,
          category: subDetails[key],
          category_id: generatedId,
          cmp_id: orgId,
          Primary_user_id: req.pUserId || req.owner,
        };
        break;
      case "roomFloor":
      case "subcategory":
        Model = Subcategory;
        dataToSave = {
          _id: generatedId,
          subcategory: subDetails[key],
          subcategory_id: generatedId,
          cmp_id: orgId,
          Primary_user_id: req.pUserId || req.owner,
        };
        break;

      case "foodItems":
        Model = Subcategory;
        dataToSave = {
          _id: generatedId,
          subcategory: subDetails[key],
          category_id: subDetails.category_id,
          subcategory_id: generatedId,
          cmp_id: orgId,
          Primary_user_id: req.pUserId || req.owner,
          under: "restaurant",
        };
        break;
      case "godown":
        Model = Godown;
        dataToSave = {
          _id: generatedId,
          godown: subDetails[key],
          godown_id: generatedId,
          address: subDetails.address,
          cmp_id: orgId,
          Primary_user_id: req.pUserId || req.owner,
          defaultGodown: false,
        };

        break;
      case "pricelevel":
        Model = PriceLevel;
        dataToSave = {
          _id: generatedId,
          pricelevel: subDetails[key],
          // pricelevel_id: generatedId,
          cmp_id: orgId,
          Primary_user_id: req.pUserId || req.owner,
        };
        break;
      default:
        return res.status(400).json({ message: "Invalid sub-detail type" });
    }

    const newSubDetail = new Model(dataToSave);
    await newSubDetail.save();

    const companyUpdate = key === "godown" ? company : null;

    res
      .status(201)
      .json({ message: `${key} added successfully`, companyUpdate });
  } catch (error) {
    console.error("Error in addProductSubDetails:", error);
    res
      .status(500)
      .json({ message: "An error occurred while adding the sub-detail" });
  }
};

/**
 * @desc  get subDetails of product such as brand category subcategory etc
 * @route GET/api/pUsers/getProductSubDetails
 * @access Public
 */

export const getProductSubDetails = async (req, res) => {
  try {
    const { orgId } = req.params;
    const { type } = req.query; // 'type' can be 'brand', 'category', 'subcategory', 'godown', or 'pricelevel'
    const restrict = req.query.restrict === "true" ? true : false;
    const Primary_user_id = req.pUserId || req.owner;
    const secondaryUser = await SecondaryUser.findById(req.sUserId);
    const configuration = secondaryUser.configurations.find(
      (config) => config?.organization?.toString() === orgId
    );

    let data;

    switch (type) {
      case "roomType":
      case "brand":
        data = await Brand.find({
          cmp_id: orgId,
          Primary_user_id: Primary_user_id,
        });
        break;
      case "bedType":
      case "category":
        data = await Category.find({
          cmp_id: orgId,
          Primary_user_id: Primary_user_id,
        });
        break;
      case "Regional Food Category":
        data = await Category.find({
          cmp_id: orgId,
          Primary_user_id: Primary_user_id,
          under: "restaurant",
        });
        break;
      case "foodItems":
        data = await Subcategory.find({
          cmp_id: orgId,
          Primary_user_id: Primary_user_id,
          under: "restaurant",
        });
        break;
      case "roomFloor":
      case "group":
      case "subcategory":
        data = await Subcategory.find({
          cmp_id: orgId,
          Primary_user_id: Primary_user_id,
        });
        break;
      case "godown":
        data = await Godown.find({
          cmp_id: orgId,
          Primary_user_id: Primary_user_id,
        });

        if (configuration?.selectedGodowns.length > 0 && restrict) {
          console.log(data);
          data = data.filter((godown) =>
            configuration.selectedGodowns.includes(godown._id)
          );
        }

        break;
      case "pricelevel":
        data = await PriceLevel.find({
          cmp_id: orgId,
          Primary_user_id: Primary_user_id,
        });
        break;
      default:
        return res.status(400).json({ message: "Invalid sub-detail type" });
    }

    res.status(200).json({
      message: `${type} details retrieved successfully`,
      data: data,
    });
  } catch (error) {
    console.error("Error in getProductSubDetails:", error);
    res
      .status(500)
      .json({ message: "An error occurred while fetching the sub-details" });
  }
};

/**
 * @desc  delete subDetails of product such as brand category subcategory etc
 * @route DELETE/api/pUsers/deleteProductSubDetails
 * @access Public
 */
export const deleteProductSubDetails = async (req, res) => {
  try {
    const { orgId, id } = req.params;
    const { type } = req.query;

    let Model;
    switch (type) {
      case "roomType":
      case "brand":
        Model = Brand;
        break;
      case "bedType":
      case "category":
      case "Regional Food Category":
        Model = Category;
        break;
      case "roomFloor":
      case "subcategory":
      case "foodItems":
        Model = Subcategory;
        break;
      case "godown":
        Model = Godown;
        break;
      case "pricelevel":
        Model = PriceLevel;
        break;
      default:
        return res.status(400).json({ message: "Invalid sub-detail type" });
    }

    const deletedItem = await Model.findOneAndDelete({
      _id: id,
      cmp_id: orgId,
    });

    if (!deletedItem) {
      return res.status(404).json({ message: "Item not found" });
    }

    res.status(200).json({ message: `${type} deleted successfully` });
  } catch (error) {
    console.error("Error in deleteProductSubDetails:", error);
    res
      .status(500)
      .json({ message: "An error occurred while deleting the sub-detail" });
  }
};

/**
 * @desc  edit subDetails of product such as brand category subcategory etc
 * @route PUT/api/pUsers/editProductSubDetails
 * @access Public
 */
export const editProductSubDetails = async (req, res) => {
  try {
    const { orgId, id } = req.params;
    const { type } = req.query;
    const updateData = req.body[type];
    console.log(req.body);

    let Model;
    switch (type) {
      case "roomType":
      case "brand":
        Model = Brand;
        break;
      case "bedType":
      case "Regional Food Category":
      case "category":
        Model = Category;
        break;
      case "roomFloor":
      case "foodItems":
      case "subcategory":
        Model = Subcategory;
        break;
      case "godown":
        Model = Godown;
        break;
      case "pricelevel":
        Model = PriceLevel;
        break;
      default:
        return res.status(400).json({ message: "Invalid sub-detail type" });
    }

    const queryConditions = { _id: id, cmp_id: orgId };
    const updateOperation = { [type]: updateData };
    let result;
    if (type === "roomType") {
      result = await Model.updateOne(queryConditions, {
        brand: req.body.roomType,
        roomRent: req.body.price,
      });
    } else if (type === "roomFloor") {
      result = await Model.updateOne(queryConditions, {
        subcategory: req.body.roomFloor,
      });
    } else if (type === "bedType") {
      result = await Model.updateOne(queryConditions, {
        category: req.body.bedType,
      });
    } else if (type === "Regional Food Category") {
      result = await Model.updateOne(queryConditions, {
        category: req.body["Regional Food Category"],
      });
    } else if (type === "foodItems"){
      result = await Model.updateOne(queryConditions, {
        subcategory: req.body["foodItems"],
        category_id: req.body["category_id"],
      });
    } else {
      result = await Model.updateOne(queryConditions, updateOperation);
    }

    if (result.modifiedCount === 0) {
      return res
        .status(404)
        .json({ message: "Item not found or not modified" });
    }

    const updatedItem = await Model.findOne(queryConditions);

    res.status(200).json({
      message: `${type} updated successfully`,
      data: updatedItem,
    });
  } catch (error) {
    console.error("Error in editProductSubDetails:", error);
    res
      .status(500)
      .json({ message: "An error occurred while updating the sub-detail" });
  }
};

/**
 * Get products with filtering, pagination, and transformation
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
export const getProducts = async (req, res) => {
  try {
    // Extract and validate request parameters
    const params = extractRequestParams(req);

    // Validate secondary user exists
    const secUser = await SecondaryUser.findById(params.Secondary_user_id);
    if (!secUser) {
      return res.status(404).json({ message: "Secondary user not found" });
    }

    // Get user configuration for the specified organization
    const configuration = secUser.configurations.find(
      (item) => item.organization == params.cmp_id
    );

    /// to find if tax inclusive is enabled
    const company = await OragnizationModel.findById(params.cmp_id).lean();
    const isTaxInclusive =
      company?.configurations?.[0]?.addRateWithTax[params?.voucherType] ??
      false;

    // Validate exclude godown ID if provided
    if (
      params.excludeGodownId &&
      !validateExcludeGodownId(params.excludeGodownId)
    ) {
      return res.status(400).json({
        message: "Invalid excludeGodownId format",
      });
    }

    // Build database filter with name or product code search
    const filter = buildDatabaseFilter(params);

    // Get selected godowns based on configuration
    const selectedGodowns = getSelectedGodowns(configuration, params.isVanSale);

    // Apply godown filter to database query if we have selected godowns
    if (selectedGodowns.length > 0) {
      filter["GodownList.godown"] = { $in: selectedGodowns };
    }

    // Enable godown filtering for exclude functionality
    /// if excludeGodownId is provided, we only want products with godown functionality enabled,means excludeGodownId is used with stock transfer,so a godown is need in stock transfer
    // This ensures we only fetch products that can be filtered by godown

    if (params.excludeGodownId || params.isVanSale) {
      filter.gdnEnabled = true;
    }

    // Execute database operations
    const { products, totalProducts } = await fetchProductsFromDatabase(
      filter,
      params
    );

    // Transform products according to business rules
    const transformedProducts = transformProducts(products, {
      selectedGodowns,
      excludeGodownId: params.excludeGodownId,
      isSaleOrder: params.isSaleOrder,
      isTaxInclusive,
    });

    // Send response
    return sendProductResponse(res, transformedProducts, totalProducts, params);
  } catch (error) {
    console.error("Error in getProducts:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error, try again!",
    });
  }
};

// // @desc getting product list
// // route get/api/pUsers/

// export const getProducts = async (req, res) => {
//   // Extract request parameters
//   const Secondary_user_id = req.sUserId;
//   const cmp_id = req.params.cmp_id;
//   const vanSaleQuery = req.query.vanSale;
//   const isVanSale = vanSaleQuery === "true";
//   const excludeGodownId = req.query.excludeGodownId;
//   const searchTerm = req.query.search || "";
//   const isSaleOrder = req.query.saleOrder === "true";

//   // Pagination parameters
//   const page = parseInt(req.query.page) || 1;
//   const limit = parseInt(req.query.limit) || 0;
//   const skip = limit > 0 ? (page - 1) * limit : 0;

//   const Primary_user_id = req.owner;

//   try {
//     // Check if secondary user exists
//     const secUser = await SecondaryUser.findById(Secondary_user_id);
//     if (!secUser) {
//       return res.status(404).json({ message: "Secondary user not found" });
//     }

//     // Get user configurations for the specified organization
//     const configuration = secUser.configurations.find(
//       (item) => item.organization == cmp_id
//     );

//     // Build filter object for MongoDB query
//     const filter = {
//       cmp_id: cmp_id,
//       Primary_user_id: Primary_user_id,
//     };

//     // Add search functionality if search term is provided
//     if (searchTerm) {
//       filter.$or = [
//         { product_name: { $regex: searchTerm, $options: "i" } }, // Case-insensitive regex search
//         { product_code: searchTerm }, // Exact match for product code
//       ];
//     }

//     /**
//      * Helper function to validate and normalize godown IDs
//      * Handles both string and array inputs, validates ObjectId format
//      * @param {string|Array} godowns - Godown IDs to validate
//      * @returns {Array} Array of valid ObjectId strings
//      */
//     const validateAndNormalizeGodowns = (godowns) => {
//       if (!godowns) return [];

//       // Convert to array if it's a string
//       let godownArray;
//       if (typeof godowns === "string") {
//         // Handle comma-separated string or single string
//         godownArray = godowns.includes(",") ? godowns.split(",") : [godowns];
//       } else if (Array.isArray(godowns)) {
//         godownArray = godowns;
//       } else {
//         return [];
//       }

//       // Filter and validate ObjectIds
//       return godownArray
//         .map((id) => (typeof id === "string" ? id.trim() : id)) // Trim whitespace
//         .filter((id) => {
//           // Check if id is not empty, null, or undefined
//           if (!id || id === "" || id === null || id === undefined) {
//             return false;
//           }

//           // Check if it's a valid ObjectId format
//           return mongoose.Types.ObjectId.isValid(id);
//         });
//     };

//     // Determine which godowns to select based on configuration and validate them
//     let selectedGodowns = [];
//     if (isVanSale && configuration?.selectedVanSaleGodowns) {
//       selectedGodowns = validateAndNormalizeGodowns(
//         configuration.selectedVanSaleGodowns
//       );

//       // Only add filter if we have valid ObjectIds
//       if (selectedGodowns.length > 0) {
//         filter["GodownList.godown"] = { $in: selectedGodowns };
//       }
//     } else if (!isVanSale && configuration?.selectedGodowns) {
//       selectedGodowns = validateAndNormalizeGodowns(
//         configuration.selectedGodowns
//       );

//       // Only add filter if we have valid ObjectIds
//       if (selectedGodowns.length > 0) {
//         filter["GodownList.godown"] = { $in: selectedGodowns };
//       }
//     }

//     // Handle godown exclusion functionality
//     if (excludeGodownId) {
//       // Validate the excludeGodownId format
//       if (!mongoose.Types.ObjectId.isValid(excludeGodownId)) {
//         return res.status(400).json({
//           message: "Invalid excludeGodownId format",
//         });
//       }

//       // Only get products with godown functionality enabled
//       filter.gdnEnabled = true;
//     }

//     // Count total products matching the filter for pagination
//     const totalProducts = await productModel.countDocuments(filter);

//     // Create basic MongoDB query
//     let query = productModel.find(filter);

//     // Apply pagination if limit is specified
//     if (limit > 0) {
//       query = query.skip(skip).limit(limit);
//     }

//     // Sort products alphabetically by name
//     query = query.sort({ product_name: 1 });

//     // Execute query and populate related collections
//     let products = await query
//       .populate({
//         path: "GodownList.godown",
//         model: "Godown",
//       })
//       .populate({
//         path: "Priceleveles.pricelevel",
//         model: "PriceLevel",
//       });

//     // Post-query filtering for godown exclusion (done after DB query due to populated fields)
//     /// this is for stock transfer voucher
//     if (excludeGodownId) {
//       products = products.filter((product) => {
//         // Skip products that don't have godown list or godown is not enabled
//         if (
//           !product.gdnEnabled ||
//           !product.GodownList ||
//           product.GodownList.length === 0
//         ) {
//           return false;
//         }

//         // Filter out the excluded godown from the GodownList
//         const filteredGodownList = product.GodownList.filter((godownItem) => {
//           console.log("godownItem", godownItem);

//           // Handle both populated and non-populated godown references
//           const godownId = godownItem.godown?._id || godownItem.godown;
//           const isExcluded =
//             godownId && godownId.toString() === excludeGodownId.toString();

//           // Keep godowns that are NOT excluded
//           return !isExcluded;
//         });

//         console.log("filteredGodownList length", filteredGodownList.length);

//         // If no godowns remain after filtering, exclude the entire product
//         if (filteredGodownList.length === 0) {
//           return false;
//         }

//         // Update the product's GodownList with the filtered list
//         product.GodownList = filteredGodownList;

//         // Keep the product since it has remaining godowns
//         return true;
//       });
//     }
//     // Transform products to flatten nested structures and apply business logic
//     const transformedProducts = products
//       .map((product) => {
//         // Convert Mongoose document to plain JavaScript object
//         const productObject = product.toObject();

//         // Determine if product has batch or godown functionality enabled
//         const batchEnabled = productObject.batchEnabled === true;
//         const gdnEnabled = productObject.gdnEnabled === true;

//         // Set hasGodownOrBatch flag based on context
//         if (isSaleOrder) {
//           // In sale orders, we don't show godown/batch details
//           productObject.hasGodownOrBatch = false;
//         } else {
//           // For other contexts, flag is true if either batch or godown is enabled
//           productObject.hasGodownOrBatch = batchEnabled || gdnEnabled;
//         }

//         // Process and filter GodownList items
//         if (productObject.GodownList && productObject.GodownList.length > 0) {
//           let filteredGodownList = productObject.GodownList;

//           // Filter godowns based on selected godowns from configuration
//           if (selectedGodowns.length > 0) {
//             filteredGodownList = productObject.GodownList.filter(
//               (godownItem) => {
//                 if (!godownItem.godown) return false;

//                 const godownId = godownItem.godown._id || godownItem.godown;
//                 return selectedGodowns.some(
//                   (id) => id.toString() === godownId.toString()
//                 );
//               }
//             );
//           }

//           // Additional filtering for excluded godown
//           if (excludeGodownId) {
//             filteredGodownList = filteredGodownList.filter((godownItem) => {
//               if (!godownItem.godown) return true;

//               const godownId = godownItem.godown._id || godownItem.godown;
//               return godownId.toString() !== excludeGodownId.toString();
//             });
//           }

//           // Check if product should be removed after exclusion
//           if (filteredGodownList.length === 0) {
//             return null; // Mark product for removal
//           }

//           // Business logic: Filter out Primary Batch items with zero balance when multiple godowns exist
//           // This prevents showing empty primary batches when there are other godown options available
//           if (productObject.GodownList.length > 1) {
//             filteredGodownList = filteredGodownList.filter((godownItem) => {
//               // Remove Primary Batch entries with exactly zero balance stock
//               if (
//                 godownItem.batch === "Primary Batch" &&
//                 godownItem.balance_stock === 0
//               ) {
//                 return false;
//               }
//               // Keep all other items (including Primary Batch with positive/negative balance)
//               return true;
//             });
//           }

//           // Flatten the nested godown structure for easier frontend consumption
//           productObject.GodownList = filteredGodownList.map((godownItem) => {
//             // Skip flattening if no godown reference exists
//             if (!godownItem.godown) return godownItem;

//             // Create flattened structure with godown properties at top level
//             const flattenedGodownItem = {
//               ...godownItem,
//               // Extract godown properties to top level
//               godownMongoDbId: godownItem.godown._id,
//               godown: godownItem.godown.godown,
//               godown_id: godownItem.godown.godown_id,
//               defaultGodown: godownItem.godown.defaultGodown,
//             };

//             return flattenedGodownItem;
//           });
//         }

//         // Flatten PriceLevels structure for easier frontend consumption
//         if (
//           productObject.Priceleveles &&
//           productObject.Priceleveles.length > 0
//         ) {
//           productObject.Priceleveles = productObject.Priceleveles.map(
//             (priceLevel) => {
//               // Skip flattening if no pricelevel reference exists
//               if (!priceLevel.pricelevel) return priceLevel;

//               // Create flattened price level structure
//               const flattenedPriceLevel = {
//                 // Include original price level properties
//                 ...priceLevel,
//                 // Extract nested pricelevel properties to top level
//                 _id: priceLevel.pricelevel._id,
//                 pricelevel: priceLevel?.pricelevel?.pricelevel,
//               };

//               return flattenedPriceLevel;
//             }
//           );
//         }

//         return productObject;
//       })
//       .filter((product) => product?.GodownList?.length > 0); // Remove null products (those with empty GodownList after exclusion);

//     // Return successful response with products and pagination info
//     if (transformedProducts && transformedProducts.length > 0) {
//       return res.status(200).json({
//         productData: transformedProducts,
//         pagination: {
//           total: totalProducts,
//           page,
//           limit,
//           hasMore: skip + transformedProducts.length < totalProducts,
//         },
//         message: "Products fetched",
//       });
//     } else {
//       // Return 404 if no products found matching the criteria
//       return res.status(404).json({ message: "No products were found" });
//     }
//   } catch (error) {
//     // Log error for debugging and return generic error response
//     console.error(error);
//     return res.status(500).json({
//       success: false,
//       message: "Internal server error, try again!",
//     });
//   }
// };
