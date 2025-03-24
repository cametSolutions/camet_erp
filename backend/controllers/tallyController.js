import TallyData from "../models/TallyData.js";
import BankDetailsModel from "../models/bankModel.js";
import CashModel from "../models/cashModel.js";

import partyModel from "../models/partyModel.js";
import productModel from "../models/productModel.js";
import AdditionalCharges from "../models/additionalChargesModel.js";
import AccountGroup from "../models/accountGroup.js";
import SubGroup from "../models/subGroup.js";
import { fetchData } from "../helpers/tallyHelper.js";
import mongoose from "mongoose";
import {
  Godown,
  PriceLevel,
  Brand,
  Category,
  Subcategory,
} from "../models/subDetails.js";

export const saveDataFromTally = async (req, res) => {
  try {
    const dataToSave = await req.body.data;

    // console.log("dataToSave", dataToSave);
    const { Primary_user_id, cmp_id } = dataToSave[0];

    await TallyData.deleteMany({ Primary_user_id, cmp_id });

    // Use Promise.all to parallelize document creation or update
    const savedData = await Promise.all(
      dataToSave.map(async (dataItem) => {
        // Add bill_no as billId if billId is not present
        if (!dataItem.billId && dataItem.bill_no) {
          dataItem.billId = dataItem.bill_no;
        }

        // Use findOne to check if the document already exists
        const existingDocument = await TallyData.findOne({
          cmp_id: dataItem.cmp_id,
          bill_no: dataItem.bill_no,
          Primary_user_id: dataItem.Primary_user_id,
          party_id: dataItem.party_id,
        });

        // Use findOneAndUpdate to find an existing document based on some unique identifier
        const updatedDocument = await TallyData.findOneAndUpdate(
          {
            cmp_id: dataItem.cmp_id,
            bill_no: dataItem.bill_no,
            Primary_user_id: dataItem.Primary_user_id,
            party_id: dataItem.party_id,
          },
          dataItem,
          { upsert: true, new: true }
        );

        return updatedDocument;
      })
    );

    res.status(201).json({ message: "data saved successfully", savedData });
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const addBankData = async (req, res) => {
  try {
    const bankDetailsArray = req.body.bankdetails;

    const { Primary_user_id, cmp_id } = bankDetailsArray[0];

    await BankDetailsModel.deleteMany({ Primary_user_id, cmp_id });

    // Loop through each bank detail in the array
    for (const bankDetail of bankDetailsArray) {
      const {
        cmp_id,
        Primary_user_id,
        bank_ledname,
        acholder_name,
        bank_id,
        ac_no,
        ifsc,
        swift_code,
        bank_name,
        branch,
        upi_id,
        bsr_code,
        client_code,
      } = bankDetail;

      // Check if the same data already exists
      const existingData = await BankDetailsModel.findOne({
        cmp_id,
        Primary_user_id,
        bank_ledname,
        acholder_name,
        bank_id,
        ac_no,
        ifsc,
        swift_code,
        bank_name,
        branch,
        upi_id,
        bsr_code,
        client_code,
      });

      if (existingData) {
        // If data exists, update the existing document
        const updatedData = await BankDetailsModel.findOneAndUpdate(
          {
            cmp_id,
            Primary_user_id,
            bank_ledname,
            acholder_name,
            bank_id,
            ac_no,
            ifsc,
            swift_code,
            bank_name,
            branch,
            upi_id,
            bsr_code,
            client_code,
          },
          bankDetail,
          { new: true }
        );

        // console.log('Bank data updated:', updatedData);
      } else {
        // If data doesn't exist, create a new document
        const newBankData = await BankDetailsModel.create(bankDetail);

        // console.log('Bank data added:', newBankData);
      }
    }

    return res.status(200).json({
      message: "Bank data added/updated successfully",
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      status: false,
      message: "Internal server error",
    });
  }
};

export const addCashData = async (req, res) => {
  try {
    const cashDetailsArray = req.body.cashdetails;

    const { Primary_user_id, cmp_id } = cashDetailsArray[0];

    await CashModel.deleteMany({ Primary_user_id, cmp_id });

    // Loop through each bank detail in the array
    for (const cashDetails of cashDetailsArray) {
      const { cmp_id, Primary_user_id, cash_ledname, cash_id, cash_grpname } =
        cashDetails;

      // Check if the same data already exists
      const existingData = await CashModel.findOne({
        cmp_id,
        Primary_user_id,
        cash_id,
      });

      if (existingData) {
        // If data exists, update the existing document
        const updatedData = await CashModel.findOneAndUpdate(
          {
            cmp_id,
            Primary_user_id,
            cash_id,
          },
          cashDetails,
          { new: true }
        );

        // console.log('Bank data updated:', updatedData);
      } else {
        // If data doesn't exist, create a new document
        const newCashData = await CashModel.create(cashDetails);
      }
    }

    return res.status(200).json({
      message: "Cash data added/updated successfully",
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      status: false,
      message: "Internal server error",
    });
  }
};

// @desc for saving products to tally
// route GET/api/tally/giveTransaction



export const saveProductsFromTally = async (req, res) => {
  try {
    const productsToSave = req?.body?.data;

    if (!productsToSave || !productsToSave.length) {
      return res.status(400).json({ message: "No products to save" });
    }

    const cmp_id = productsToSave[0]?.cmp_id;
    const Primary_user_id = productsToSave[0]?.Primary_user_id;

    // Find default godown first
    const defaultGodown = await Godown.findOne({ cmp_id, defaultGodown: true });
    
    // Return early if no default godown is found
    if (!defaultGodown) {
      return res.status(400).json({ 
        message: "Default godown not found. Please set up a default godown before saving products." 
      });
    }

    // Extract all unique IDs from the products
    const brandIds = [
      ...new Set(
        productsToSave.filter((p) => p.brand_id).map((p) => p.brand_id)
      ),
    ];
    const categoryIds = [
      ...new Set(
        productsToSave.filter((p) => p.category_id).map((p) => p.category_id)
      ),
    ];
    const subcategoryIds = [
      ...new Set(
        productsToSave
          .filter((p) => p.subcategory_id)
          .map((p) => p.subcategory_id)
      ),
    ];
    
    // Fetch all references in parallel
    const [brands, categories, subcategories] = await Promise.all([
      brandIds.length > 0
        ? Brand.find({ brand_id: { $in: brandIds }, cmp_id })
        : [],
      categoryIds.length > 0
        ? Category.find({ category_id: { $in: categoryIds }, cmp_id })
        : [],
      subcategoryIds.length > 0
        ? Subcategory.find({ subcategory_id: { $in: subcategoryIds }, cmp_id })
        : [],
    ]);

    // Create lookup maps for faster reference resolution
    const brandMap = new Map(brands.map((b) => [b.brand_id, b._id]));
    const categoryMap = new Map(categories.map((c) => [c.category_id, c._id]));
    const subcategoryMap = new Map(
      subcategories.map((s) => [s.subcategory_id, s._id])
    );

    // Get existing products in bulk to avoid multiple queries
    const existingProductIds = productsToSave
      .filter((p) => p.product_master_id)
      .map((p) => p.product_master_id);

    const existingProducts =
      existingProductIds.length > 0
        ? await productModel.find({
            product_master_id: { $in: existingProductIds },
            cmp_id,
            Primary_user_id,
          })
        : [];

    const existingProductMap = new Map(
      existingProducts.map((p) => [p.product_master_id, p])
    );

    // Process products in batches
    const BATCH_SIZE = 100;
    const results = [];

    for (let i = 0; i < productsToSave.length; i += BATCH_SIZE) {
      const batch = productsToSave.slice(i, i + BATCH_SIZE);
      const batchOperations = batch.map((productItem) => {
        // Replace string IDs with MongoDB ObjectIds
        const enhancedProduct = { ...productItem };

        // Set brand, category, and subcategory explicitly (either with a valid reference or null)
        enhancedProduct.brand = productItem.brand_id && brandMap.has(productItem.brand_id) 
          ? brandMap.get(productItem.brand_id) 
          : null;

        enhancedProduct.category = productItem.category_id && categoryMap.has(productItem.category_id) 
          ? categoryMap.get(productItem.category_id) 
          : null;

        enhancedProduct.sub_category = productItem.subcategory_id && subcategoryMap.has(productItem.subcategory_id) 
          ? subcategoryMap.get(productItem.subcategory_id) 
          : null;

        // Add default GodownList with Primary Batch
        enhancedProduct.GodownList = [
          {
            godown: defaultGodown._id,
            batch: "Primary Batch",
            balance_stock: 0
          }
        ];

        // Check if product exists
        if (
          productItem.product_master_id &&
          existingProductMap.has(productItem.product_master_id)
        ) {
          // Update existing product
          return productModel.findByIdAndUpdate(
            existingProductMap.get(productItem.product_master_id)._id,
            enhancedProduct,
            { new: true }
          );
        } else {
          // Create new product
          return new productModel(enhancedProduct).save();
        }
      });

      // Execute batch operations
      const batchResults = await Promise.allSettled(batchOperations);

      // Process results
      batchResults.forEach((result, index) => {
        if (result.status === "fulfilled") {
          results.push(result.value);
        } else {
          console.error(
            `Error saving product at index ${i + index}:`,
            result.reason
          );
        }
      });
    }

    // Count successful saves
    const successfulSaves = results.filter(Boolean);

    res.status(201).json({
      message: "Products saved successfully",
      savedCount: successfulSaves.length,
      totalCount: productsToSave.length,
    });
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// @desc for updating stocks of product
// route GET/api/tally/master/item/updateStock

export const updateStock = async (req, res) => {
  try {
    // Validate request body
    if (
      !req.body?.data?.ItemGodowndetails ||
      !Array.isArray(req.body.data.ItemGodowndetails)
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid request format. ItemGodowndetails array is required",
      });
    }

    if (req.body.data.ItemGodowndetails.length === 0) {
      return res.status(400).json({
        success: false,
        message: "ItemGodowndetails array is empty",
      });
    }

    // Extract common company and user IDs
    const { cmp_id, Primary_user_id } = req.body.data.ItemGodowndetails[0];

    if (!cmp_id || !Primary_user_id) {
      return res.status(400).json({
        success: false,
        message: "Company ID and Primary user ID are required",
      });
    }

    // Extract all unique godown_ids from the request
    const godownIdsSet = new Set();
    for (const item of req.body.data.ItemGodowndetails) {
      if (item.godown_id) {
        godownIdsSet.add(item.godown_id.toString());
      }
    }

    const godownIds = Array.from(godownIdsSet);

    // Fetch all required godowns in a single query to create a mapping
    const godowns = await Godown.find(
      { godown_id: { $in: godownIds } },
      { _id: 1, godown_id: 1 }
    );

    // Create a mapping of godown_id to MongoDB _id
    const godownMapping = {};
    godowns.forEach((godown) => {
      godownMapping[godown.godown_id.toString()] = godown._id;
    });

    // Check if any godown_ids couldn't be found
    const missingGodownIds = godownIds.filter((id) => !godownMapping[id]);
    if (missingGodownIds.length > 0) {
      console.warn(
        `Warning: Could not find godowns with ids: ${missingGodownIds.join(
          ", "
        )}`
      );
    }

    // Group items by product_master_id with improved validation
    const groupedGodowns = {};

    for (const item of req.body.data.ItemGodowndetails) {
      if (!item.product_master_id) {
        return res.status(400).json({
          success: false,
          message: "product_master_id is required for each item",
        });
      }

      const productId = item.product_master_id.toString();

      if (!groupedGodowns[productId]) {
        groupedGodowns[productId] = {
          godowns: [],
          product_name: item.product_name,
          // total_balance: 0,
        };
      }

      // Get MongoDB _id for this godown or skip if not found
      const godownObjectId = item.godown_id
        ? godownMapping[item.godown_id.toString()]
        : null;

      // Skip entries with invalid godown_id that couldn't be mapped to an actual godown
      if (item.godown_id && !godownObjectId) {
        console.warn(
          `Skipping entry with invalid godown_id: ${
            item.godown_id
          } for product: ${item.product_name || productId}`
        );
        continue;
      }

      // Format godown data according to schema
      const godownEntry = {
        godown: godownObjectId, // Use the mapped MongoDB ObjectId
        balance_stock: parseFloat(item.balance_stock) || 0,
        
      };

      // Add batch, manufacturing and expiry dates if available
      if (item.batch) godownEntry.batch = item.batch;
      if (item.mfgdt) godownEntry.mfgdt = item.mfgdt;
      if (item.expdt) godownEntry.expdt = item.expdt;

      groupedGodowns[productId].godowns.push(godownEntry);
      // groupedGodowns[productId].total_balance += godownEntry.balance_stock;
    }

    if (Object.keys(groupedGodowns).length === 0) {
      return res.status(400).json({
        success: false,
        message: "No valid products found to update",
      });
    }

    // Prepare bulk operations with chunking for large datasets
    const chunkSize = 500; // Adjust based on MongoDB performance
    const productIds = Object.keys(groupedGodowns);
    let bulkResults = [];

    // Process in chunks to avoid overwhelming MongoDB
    for (let i = 0; i < productIds.length; i += chunkSize) {
      const chunk = productIds.slice(i, i + chunkSize);

      const bulkOps = chunk.map((productMasterId) => {
        const data = groupedGodowns[productMasterId];

        return {
          updateOne: {
            filter: {
              product_master_id: productMasterId,
              cmp_id: new mongoose.Types.ObjectId(cmp_id),
              Primary_user_id: new mongoose.Types.ObjectId(Primary_user_id),
            },
            update: {
              $set: {
                GodownList: data.godowns,
                // godownCount: data.total_balance,
                balance_stock: data.total_balance, // Update overall balance stock
              },
            },
            upsert: true,
          },
        };
      });

      // Execute chunk's bulk write operation
      const result = await productModel.bulkWrite(bulkOps, { ordered: false });
      bulkResults.push(result);
    }

    // Calculate overall stats
    const totalStats = bulkResults.reduce(
      (acc, result) => {
        acc.matchedCount += result.matchedCount || 0;
        acc.modifiedCount += result.modifiedCount || 0;
        acc.upsertedCount += result.upsertedCount || 0;
        return acc;
      },
      { matchedCount: 0, modifiedCount: 0, upsertedCount: 0 }
    );

    // Get summary of modified products (limited to avoid large response)
    const modificationSummary = Object.entries(groupedGodowns)
      .slice(0, 50) // Limit to first 50 products for response
      .map(([productId, data]) => ({
        product_id: productId,
        product_name: data.product_name || "Unknown",
        updated_godown_count: data.godowns.length,
        // total_stock: data.total_balance,
      }));

    return res.status(200).json({
      success: true,
      message: `Successfully processed ${productIds.length} products. Updated: ${totalStats.modifiedCount}, Added: ${totalStats.upsertedCount}`,
      modifiedProducts: modificationSummary,
      totalRecordsProcessed: productIds.length,
      godownsMapped: Object.keys(godownMapping).length,
      godownsNotFound: missingGodownIds.length > 0 ? missingGodownIds : [],
      ...(modificationSummary.length < productIds.length && {
        note: `Showing summary for first ${modificationSummary.length} of ${productIds.length} products.`,
      }),
    });
  } catch (error) {
    console.error("Error in updateStock:", error);

    if (error.name === "ValidationError") {
      return res.status(400).json({
        success: false,
        message: "Validation error",
        error: error.message,
      });
    }

    if (error.name === "MongoError" || error.name === "MongoServerError") {
      return res.status(503).json({
        success: false,
        message: "Database error",
        error: error.message,
      });
    }

    return res.status(500).json({
      success: false,
      message: "An error occurred while updating stock",
      error: error.message,
    });
  }
};

// @desc for updating priceLevels of product
// route GET/api/tally/master/item/updatePriceLevels

export const updatePriceLevels = async (req, res) => {
  try {
    // Validate request body
    if (
      !req.body?.data?.Priceleveles ||
      !Array.isArray(req.body.data.Priceleveles)
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid request format. Priceleveles array is required",
      });
    }

    if (req.body.data.Priceleveles.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Priceleveles array is empty",
      });
    }

    // Extract common company and user IDs
    const { cmp_id, Primary_user_id } = req.body.data.Priceleveles[0];

    if (!cmp_id || !Primary_user_id) {
      return res.status(400).json({
        success: false,
        message: "Company ID and Primary user ID are required",
      });
    }

    // Extract all unique pricelevel_ids from the request
    const priceLevelIdsSet = new Set();

    for (const item of req.body.data.Priceleveles) {
      if (item.pricelevel) {
        priceLevelIdsSet.add(item.pricelevel.toString());
      }
    }

    const priceLevelIds = Array.from(priceLevelIdsSet);

    console.log("priceLevelIds", priceLevelIds);

    // Fetch all price levels in a single query to create a mapping
    let priceLevelMapping = {};

    try {
      // Note: Make sure this query matches your schema fields
      // If your PriceLevel model has pricelevel_id field:
      const priceLevels = await PriceLevel.find({
        pricelevel_id: { $in: priceLevelIds },
      });

      console.log("priceLevels", priceLevels);

      // Create a mapping of pricelevel_id to MongoDB _id
      // Make sure to use the correct field name from your schema
      priceLevelMapping = priceLevels.reduce((mapping, level) => {
        // If your schema uses pricelevel_id as the field name:
        mapping[level.pricelevel_id.toString()] = level._id;
        return mapping;
      }, {});

      console.log("priceLevelMapping", priceLevelMapping);

      // Check if any pricelevel_ids couldn't be found
      const missingPriceLevelIds = priceLevelIds.filter(
        (id) => !priceLevelMapping[id]
      );
      if (missingPriceLevelIds.length > 0) {
        console.warn(
          `Warning: Could not find price levels with ids: ${missingPriceLevelIds.join(
            ", "
          )}`
        );
      }
    } catch (error) {
      console.log(
        "Error fetching price levels, will use direct IDs:",
        error.message
      );

      // Create direct mapping if fetching fails
      priceLevelMapping = priceLevelIds.reduce((mapping, id) => {
        try {
          mapping[id] = new mongoose.Types.ObjectId(id);
        } catch (err) {
          console.warn(`Invalid ObjectId format for price level: ${id}`);
        }
        return mapping;
      }, {});
    }

    // Group items by product_master_id with improved validation
    const groupedProducts = {};

    for (const item of req.body.data.Priceleveles) {
      if (!item.product_master_id) {
        return res.status(400).json({
          success: false,
          message: "product_master_id is required for each item",
        });
      }

      const productId = item.product_master_id.toString();

      if (!groupedProducts[productId]) {
        groupedProducts[productId] = {
          priceLevels: [],
          product_name: item.product_name || "Unknown",
        };
      }

      // Skip items without pricelevel
      if (!item.pricelevel) {
        console.warn(
          `Skipping entry without pricelevel for product: ${
            item.product_name || productId
          }`
        );
        continue;
      }

      // Get MongoDB _id for this price level using the mapping or create new ObjectId
      let priceLevelObjectId;
      const priceLevelKey = item.pricelevel.toString();

      if (priceLevelMapping[priceLevelKey]) {
        priceLevelObjectId = priceLevelMapping[priceLevelKey];
      } else {
        try {
          // Try to convert the pricelevel to ObjectId directly
          priceLevelObjectId = new mongoose.Types.ObjectId(priceLevelKey);
        } catch (err) {
          console.warn(
            `Skipping entry with invalid pricelevel format: ${priceLevelKey}`
          );
          continue;
        }
      }

      console.log(
        "priceLevelObjectId for",
        priceLevelKey,
        ":",
        priceLevelObjectId
      );

      // Format price level data according to schema
      const priceLevelEntry = {
        pricelevel: priceLevelObjectId,
        pricerate: parseFloat(item.pricerate) || 0,
        priceDisc: parseFloat(item.priceDisc) || 0,
      };

      // Add applicable date if available
      if (item.applicabledt) priceLevelEntry.applicabledt = item.applicabledt;

      groupedProducts[productId].priceLevels.push(priceLevelEntry);
    }

    if (Object.keys(groupedProducts).length === 0) {
      return res.status(400).json({
        success: false,
        message: "No valid products found to update",
      });
    }

    // Prepare bulk operations with chunking for large datasets
    const chunkSize = 500; // Adjust based on MongoDB performance
    const productIds = Object.keys(groupedProducts);
    let bulkResults = [];

    // Process in chunks to avoid overwhelming MongoDB
    for (let i = 0; i < productIds.length; i += chunkSize) {
      const chunk = productIds.slice(i, i + chunkSize);

      const bulkOps = chunk.map((productMasterId) => {
        const data = groupedProducts[productMasterId];

        // Ensure we have valid ObjectIds for the filter
        let cmpObjectId, userObjectId;

        try {
          cmpObjectId = new mongoose.Types.ObjectId(cmp_id);
        } catch (err) {
          console.error(`Invalid company ID format: ${cmp_id}`);
          cmpObjectId = cmp_id; // Use as-is if conversion fails
        }

        try {
          userObjectId = new mongoose.Types.ObjectId(Primary_user_id);
        } catch (err) {
          console.error(`Invalid user ID format: ${Primary_user_id}`);
          userObjectId = Primary_user_id; // Use as-is if conversion fails
        }

        return {
          updateOne: {
            filter: {
              product_master_id: productMasterId,
              cmp_id: cmpObjectId,
              Primary_user_id: userObjectId,
            },
            update: {
              $set: {
                Priceleveles: data.priceLevels,
                // pricelevelcount: data.priceLevels.length,
              },
            },
            upsert: true,
          },
        };
      });

      // Execute chunk's bulk write operation
      const result = await productModel.bulkWrite(bulkOps, { ordered: false });
      bulkResults.push(result);
    }

    // Calculate overall stats
    const totalStats = bulkResults.reduce(
      (acc, result) => {
        acc.matchedCount += result.matchedCount || 0;
        acc.modifiedCount += result.modifiedCount || 0;
        acc.upsertedCount += result.upsertedCount || 0;
        return acc;
      },
      { matchedCount: 0, modifiedCount: 0, upsertedCount: 0 }
    );

    // Get summary of modified products (limited to avoid large response)
    const modificationSummary = Object.entries(groupedProducts)
      .slice(0, 50) // Limit to first 50 products for response
      .map(([productId, data]) => ({
        product_id: productId,
        product_name: data.product_name || "Unknown",
        updated_pricelevel_count: data.priceLevels.length,
      }));

    return res.status(200).json({
      success: true,
      message: `Successfully processed ${productIds.length} products. Updated: ${totalStats.modifiedCount}, Added: ${totalStats.upsertedCount}`,
      modifiedProducts: modificationSummary,
      totalRecordsProcessed: productIds.length,
      priceLevelsMapped: Object.keys(priceLevelMapping).length,
      ...(modificationSummary.length < productIds.length && {
        note: `Showing summary for first ${modificationSummary.length} of ${productIds.length} products.`,
      }),
    });
  } catch (error) {
    console.error("Error in updatePriceLevels:", error);

    if (error.name === "ValidationError") {
      return res.status(400).json({
        success: false,
        message: "Validation error",
        error: error.message,
      });
    }

    if (error.name === "MongoError" || error.name === "MongoServerError") {
      return res.status(503).json({
        success: false,
        message: "Database error",
        error: error.message,
      });
    }

    return res.status(500).json({
      success: false,
      message: "An error occurred while updating price levels",
      error: error.message,
    });
  }
};

// @desc for saving parties/costumers from tally
// route GET/api/tally/giveTransaction

export const savePartyFromTally = async (req, res) => {
  try {
    // console.log("body", req.body);
    const partyToSave = req?.body?.data;

    // Check if partyToSave is defined and has elements
    if (!partyToSave || partyToSave.length === 0) {
      return res.status(400).json({ error: "No data provided" });
    }

    // Extract primary user id and company id from the first product
    const { Primary_user_id, cmp_id } = partyToSave[0];

    // Delete existing documents with the same primary user id and company id
    await partyModel.deleteMany({ Primary_user_id, cmp_id });

    // Loop through each product to save
    const savedParty = await Promise.all(
      partyToSave.map(async (party) => {
        // Check if the product already exists
        const existingParty = await partyModel.findOne({
          cmp_id: party.cmp_id,
          partyName: party.partyName,
          Primary_user_id: party.Primary_user_id,
        });

        // console.log("existingParty", existingParty);

        // If the product doesn't exist, create a new one; otherwise, update it
        if (!existingParty) {
          const newParty = new partyModel(party);
          return await newParty.save();
        } else {
          // Update the existing product
          return await partyModel.findOneAndUpdate(
            {
              cmp_id: party.cmp_id,
              partyName: party.partyName,
              Primary_user_id: party.Primary_user_id,
            },
            party,
            { new: true }
          );
        }
      })
    );

    res.status(201).json({ message: "Party saved successfully", savedParty });
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// @desc for saving additionalCharges from tally
// route GET/api/tally/giveTransaction

export const saveAdditionalChargesFromTally = async (req, res) => {
  try {
    const additionalChargesToSave = req?.body?.data;

    // Check if additionalChargesToSave is defined and has elements
    if (!additionalChargesToSave || additionalChargesToSave.length === 0) {
      return res.status(400).json({ error: "No data provided" });
    }

    // Extract primary user id and company id from the first additional charge
    const { Primary_user_id, cmp_id } = additionalChargesToSave[0];

    // Delete existing documents with the same primary user id and company id
    await AdditionalCharges.deleteMany({ Primary_user_id, cmp_id });

    // Loop through each additional charge to save
    const savedAdditionalCharges = await Promise.all(
      additionalChargesToSave.map(async (charge) => {
        // Check if the additional charge already exists
        const existingCharge = await AdditionalCharges.findOne({
          cmp_id: charge.cmp_id,
          name: charge.name,
          Primary_user_id: charge.Primary_user_id,
        });

        // If the additional charge doesn't exist, create a new one; otherwise, update it
        if (!existingCharge) {
          const newCharge = new AdditionalCharges(charge);
          return await newCharge.save();
        } else {
          // Update the existing additional charge
          return await AdditionalCharges.findOneAndUpdate(
            {
              cmp_id: charge.cmp_id,
              name: charge.name,
              Primary_user_id: charge.Primary_user_id,
            },
            charge,
            { new: true }
          );
        }
      })
    );

    res.status(201).json({
      message: "Additional charges saved successfully",
      savedAdditionalCharges,
    });
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// @desc for saving accountGroups from tally
// route GET/api/tally/addAccountGroups

export const addAccountGroups = async (req, res) => {
  try {
    const accountGroupsToSave = req?.body?.data;

    // Validate data
    if (!accountGroupsToSave || accountGroupsToSave.length === 0) {
      return res.status(400).json({ error: "No data provided" });
    }

    // Extract user ID and company ID
    const { Primary_user_id, cmp_id } = accountGroupsToSave[0];
    const primaryUserId = new mongoose.Types.ObjectId(Primary_user_id);

    // Delete previous records
    await AccountGroup.deleteMany({ Primary_user_id: primaryUserId, cmp_id });

    // Track inserted accountGroup_id to avoid duplicate inserts
    const uniqueGroups = new Map();

    const savedAccountGroups = await Promise.all(
      accountGroupsToSave.map(async (group) => {
        const key = `${group.cmp_id}-${group.accountGroup_id}-${group.Primary_user_id}`;

        // Skip duplicate records in the request
        if (uniqueGroups.has(key)) return null;
        uniqueGroups.set(key, true);

        try {
          return await AccountGroup.findOneAndUpdate(
            {
              cmp_id: group.cmp_id,
              accountGroup_id: group.accountGroup_id,
              Primary_user_id: new mongoose.Types.ObjectId(
                group.Primary_user_id
              ),
            },
            group,
            { new: true, upsert: true } // Insert if not found, update if exists
          );
        } catch (error) {
          console.error("Error saving account group:", error);
          return null; // Skip if there's an issue
        }
      })
    );

    res.status(201).json({
      message: "Account groups saved successfully",
      savedAccountGroups: savedAccountGroups.filter(Boolean), // Remove null values
    });
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// @desc for saving subGroups from tally
// route GET/api/tally/addSubGroups

export const addSubGroups = async (req, res) => {
  try {
    const subGroupsToSave = req?.body?.data;

    // Validate data
    if (!subGroupsToSave || subGroupsToSave.length === 0) {
      return res.status(400).json({ error: "No data provided" });
    }

    // Extract user ID and company ID
    const { Primary_user_id, cmp_id } = subGroupsToSave[0];
    const primaryUserId = new mongoose.Types.ObjectId(Primary_user_id);

    // Delete previous records
    await SubGroup.deleteMany({ Primary_user_id: primaryUserId, cmp_id });

    // Track inserted subGroup_id to avoid duplicate inserts
    const uniqueSubGroups = new Map();

    const savedSubGroups = await Promise.all(
      subGroupsToSave.map(async (subGroup) => {
        const key = `${subGroup.cmp_id}-${subGroup.subGroup_id}-${subGroup.Primary_user_id}`;

        // Skip duplicate records in the request
        if (uniqueSubGroups.has(key)) return null;
        uniqueSubGroups.set(key, true);

        try {
          return await SubGroup.findOneAndUpdate(
            {
              cmp_id: subGroup.cmp_id,
              subGroup_id: subGroup.subGroup_id,
              Primary_user_id: new mongoose.Types.ObjectId(
                subGroup.Primary_user_id
              ),
            },
            subGroup,
            { new: true, upsert: true } // Insert if not found, update if exists
          );
        } catch (error) {
          console.error("Error saving sub-group:", error);
          return null; // Skip if there's an issue
        }
      })
    );

    res.status(201).json({
      message: "Sub-groups saved successfully",
      savedSubGroups: savedSubGroups.filter(Boolean), // Remove null values
    });
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// @desc for saving subDetails of products from tally
// route GET/api/tally/addSubDetails

export const addSubDetails = async (req, res) => {
  try {
    const { data } = req.body;

    if (!Array.isArray(data)) {
      return res.status(400).json({
        success: false,
        message: "Data must be an array",
      });
    }

    // Determine which model to use based on the route
    let Model;
    let idField;
    let nameField;

    if (req.path.includes("/addGodowns")) {
      Model = Godown;
      idField = "godown_id";
      nameField = "godown";
    } else if (req.path.includes("/addPriceLevels")) {
      Model = PriceLevel;
      idField = "pricelevel_id";
      nameField = "pricelevel";
    } else if (req.path.includes("/addBrands")) {
      Model = Brand;
      idField = "brand_id";
      nameField = "brand";
    } else if (req.path.includes("/addCategory")) {
      Model = Category;
      idField = "category_id";
      nameField = "category";
    } else if (req.path.includes("/addSubCategory")) {
      Model = Subcategory;
      idField = "subcategory_id";
      nameField = "subcategory";
    } else {
      return res.status(400).json({
        success: false,
        message: "Invalid endpoint",
      });
    }

    // Process each item in the data array
    const results = await Promise.all(
      data.map(async (item) => {
        // Check if all required fields are present
        if (
          !item[nameField] ||
          !item[idField] ||
          !item.cmp_id ||
          !item.Primary_user_id
        ) {
          return {
            success: false,
            message: `Missing required fields for ${nameField}`,
            data: item,
          };
        }

        try {
          // Check if item already exists
          const existingItem = await Model.findOne({
            [idField]: item[idField],
            cmp_id: item.cmp_id,
          });

          if (existingItem) {
            // Update existing item
            await Model.findByIdAndUpdate(existingItem._id, item);
            return {
              success: true,
              message: `${nameField} updated successfully`,
              data: item,
            };
          } else {
            // Create new item
            const newItem = new Model(item);
            await newItem.save();
            return {
              success: true,
              message: `${nameField} added successfully`,
              data: newItem,
            };
          }
        } catch (error) {
          return {
            success: false,
            message: `Error processing ${nameField}: ${error.message}`,
            data: item,
          };
        }
      })
    );

    // Count successes and failures
    const successCount = results.filter((result) => result.success).length;
    const failureCount = results.length - successCount;

    return res.status(200).json({
      success: true,
      message: `Added/Updated ${successCount} items, Failed ${failureCount} items`,
      results,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: `Error processing request: ${error.message}`,
    });
  }
};

// // @desc for giving invoices to tally
// // route GET/api/tally/giveInvoice
export const giveInvoice = async (req, res) => {
  const cmp_id = req.params.cmp_id;
  const serialNumber = req.params.SNo;
  return fetchData("invoices", cmp_id, serialNumber, res);
};

// // @desc for giving sales to tally
// // route GET/api/tally/giveSales

export const giveSales = async (req, res) => {
  const cmp_id = req.params.cmp_id;
  const serialNumber = req.params.SNo;
  return fetchData("sales", cmp_id, serialNumber, res);
};

// // @desc for giving van sales to tally
// // route GET/api/tally/giveVanSales

export const giveVanSales = async (req, res) => {
  const cmp_id = req.params.cmp_id;
  const serialNumber = req.params.SNo;
  return fetchData("vanSales", cmp_id, serialNumber, res);
};

// @desc for giving transactions to tally
// route GET/api/tally/giveTransaction
export const giveTransaction = async (req, res) => {
  const cmp_id = req.params.cmp_id;
  const serialNumber = req.params.SNo;
  return fetchData("transactions", cmp_id, serialNumber, res);
};
// @desc for giving stock transactions to tally
// route GET/api/tally/getStockTransfers
export const getStockTransfers = async (req, res) => {
  const cmp_id = req.params.cmp_id;
  const serialNumber = req.params.SNo;
  return fetchData("stockTransfers", cmp_id, serialNumber, res);
};

export const giveReceipts = async (req, res) => {
  const cmp_id = req.params.cmp_id;
  const serialNumber = req.params.SNo;
  return fetchData("receipt", cmp_id, serialNumber, res);
};

export const givePayments = async (req, res) => {
  const cmp_id = req.params.cmp_id;
  const serialNumber = req.params.SNo;
  return fetchData("payment", cmp_id, serialNumber, res);
};

// // @desc for giving sales to tally
// // route GET/api/tally/giveSales

export const givePurchase = async (req, res) => {
  const cmp_id = req.params.cmp_id;
  const serialNumber = req.params.SNo;
  return fetchData("purchase", cmp_id, serialNumber, res);
};
