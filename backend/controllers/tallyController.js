import TallyData from "../models/TallyData.js";
import BankDetailsModel from "../models/bankModel.js";
import CashModel from "../models/cashModel.js";
import partyModel from "../models/partyModel.js";
import productModel from "../models/productModel.js";
import AccountGroup from "../models/accountGroup.js";
import subGroupModel from "../models/subGroup.js";
import AdditionalCharges from "../models/additionalChargesModel.js";
import { fetchData } from "../helpers/tallyHelper.js";
import mongoose from "mongoose";
import {
  Godown,
  PriceLevel,
  Brand,
  Category,
  Subcategory,
} from "../models/subDetails.js";
import accountGroupModel from "../models/accountGroup.js";

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

    if (!bankDetailsArray || !bankDetailsArray.length) {
      return res.status(400).json({
        status: false,
        message: "No bank details provided",
      });
    }

    const { Primary_user_id, cmp_id } = bankDetailsArray[0];

    // Delete all existing banks for this user and company
    await BankDetailsModel.deleteMany({ Primary_user_id, cmp_id });

    // Check for duplicate bank_id within the incoming data
    const uniqueBankDetails = [];
    const seenBankIds = new Set();

    for (const bankDetail of bankDetailsArray) {
      if (!seenBankIds.has(bankDetail.bank_id)) {
        seenBankIds.add(bankDetail.bank_id);
        uniqueBankDetails.push(bankDetail);
      }
    }

    // Insert all unique bank details at once
    await BankDetailsModel.insertMany(uniqueBankDetails);

    return res.status(200).json({
      status: true,
      message: "Bank data added successfully",
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

    if (!cashDetailsArray || !cashDetailsArray.length) {
      return res.status(400).json({
        status: false,
        message: "No cash details provided",
      });
    }

    const { Primary_user_id, cmp_id } = cashDetailsArray[0];

    // Delete all existing cash entries for this user and company
    await CashModel.deleteMany({ Primary_user_id, cmp_id });

    // Check for duplicate cash_id within the incoming data
    const uniqueCashDetails = [];
    const seenCashIds = new Set();

    for (const cashDetail of cashDetailsArray) {
      if (!seenCashIds.has(cashDetail.cash_id)) {
        seenCashIds.add(cashDetail.cash_id);
        uniqueCashDetails.push(cashDetail);
      }
    }

    // Insert all unique cash details at once
    await CashModel.insertMany(uniqueCashDetails);

    return res.status(200).json({
      status: true,
      message: "Cash data added successfully",
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

    // Track results efficiently with counters instead of large arrays
    const results = {
      success: [],
      failure: [],
      skipped: [],
    };

    // Single-pass check for required fields and create valid products array
    const validProducts = [];

    for (const product of productsToSave) {
      // Check for missing required fields
      if (
        !product.product_master_id ||
        !product.cmp_id ||
        !product.Primary_user_id ||
        !product.product_name
      ) {
        results.skipped.push({
          id: product.product_master_id || "unknown",
          name: product.product_name || "unnamed",
          reason: !product.cmp_id
            ? "Missing cmp_id"
            : !product.Primary_user_id
            ? "Missing Primary_user_id"
            : !product.product_master_id
            ? "Missing product_master_id"
            : "Missing product_name",
        });
        continue;
      }

      validProducts.push(product);
    }

    // If there are no valid products after filtering, return early
    if (validProducts.length === 0) {
      return res.status(200).json({
        message: "No valid products to process",
        counts: {
          success: 0,
          failure: 0,
          skipped: results.skipped.length,
          total: productsToSave.length,
        },
        skipped: results.skipped,
      });
    }

    const cmp_id = validProducts[0].cmp_id;
    const Primary_user_id = validProducts[0].Primary_user_id;

    // Find default godown - critical operation
    const defaultGodown = await Godown.findOne({ cmp_id, defaultGodown: true });

    if (!defaultGodown) {
      return res.status(400).json({
        message:
          "Default godown not found. Please set up a default godown before saving products.",
      });
    }

    // Extract unique IDs efficiently using object hash instead of Set
    const brandIdMap = {};
    const categoryIdMap = {};
    const subcategoryIdMap = {};
    const existingProductIds = [];

    // Single pass to collect all IDs
    for (const product of validProducts) {
      if (product.brand_id) brandIdMap[product.brand_id] = true;
      if (product.category_id) categoryIdMap[product.category_id] = true;
      if (product.subcategory_id)
        subcategoryIdMap[product.subcategory_id] = true;
      existingProductIds.push(product.product_master_id);
    }

    // Convert to arrays
    const brandIds = Object.keys(brandIdMap);
    const categoryIds = Object.keys(categoryIdMap);
    const subcategoryIds = Object.keys(subcategoryIdMap);

    // Parallel fetch all reference data
    const [brands, categories, subcategories, existingProducts] =
      await Promise.all([
        brandIds.length > 0
          ? Brand.find({ brand_id: { $in: brandIds }, cmp_id })
          : [],
        categoryIds.length > 0
          ? Category.find({ category_id: { $in: categoryIds }, cmp_id })
          : [],
        subcategoryIds.length > 0
          ? Subcategory.find({
              subcategory_id: { $in: subcategoryIds },
              cmp_id,
            })
          : [],
        productModel.find({
          product_master_id: { $in: existingProductIds },
          cmp_id,
          Primary_user_id,
        }),
      ]);

    // Create lookup maps - use plain objects for better performance with large datasets
    const brandMap = {};
    const categoryMap = {};
    const subcategoryMap = {};
    const existingProductMap = {};

    brands.forEach((b) => (brandMap[b.brand_id] = b._id));
    categories.forEach((c) => (categoryMap[c.category_id] = c._id));
    subcategories.forEach((s) => (subcategoryMap[s.subcategory_id] = s._id));
    existingProducts.forEach(
      (p) => (existingProductMap[p.product_master_id] = p)
    );

    // Process in larger batches for better throughput
    const BATCH_SIZE = 200; // Increased batch size
    const operations = [];

    // Pre-process all products and build operations array
    for (const product of validProducts) {
      const enhancedProduct = { ...product };

      // Set references
      enhancedProduct.brand =
        product.brand_id && brandMap[product.brand_id]
          ? brandMap[product.brand_id]
          : null;
      enhancedProduct.category =
        product.category_id && categoryMap[product.category_id]
          ? categoryMap[product.category_id]
          : null;
      enhancedProduct.sub_category =
        product.subcategory_id && subcategoryMap[product.subcategory_id]
          ? subcategoryMap[product.subcategory_id]
          : null;

      // Add default GodownList
      enhancedProduct.GodownList = [
        {
          godown: defaultGodown._id,
          batch: "Primary Batch",
          balance_stock: 0,
        },
      ];

      const existingProduct = existingProductMap[product.product_master_id];

      if (existingProduct) {
        operations.push({
          type: "update",
          product: enhancedProduct,
          id: existingProduct._id,
        });
      } else {
        operations.push({
          type: "create",
          product: enhancedProduct,
        });
      }
    }

    // Execute batches
    let processedCount = 0;

    for (let i = 0; i < operations.length; i += BATCH_SIZE) {
      const batchOps = operations.slice(i, i + BATCH_SIZE);
      const batchPromises = [];

      for (const op of batchOps) {
        if (op.type === "update") {
          batchPromises.push(
            productModel
              .findByIdAndUpdate(op.id, op.product, { new: true })
              .then((result) => ({
                success: true,
                result,
                operation: "updated",
              }))
              .catch((error) => ({
                success: false,
                error: error.message,
                productId: op.product.product_master_id,
              }))
          );
        } else {
          batchPromises.push(
            new productModel(op.product)
              .save()
              .then((result) => ({
                success: true,
                result,
                operation: "created",
              }))
              .catch((error) => ({
                success: false,
                error: error.message,
                productId: op.product.product_master_id,
              }))
          );
        }
      }

      const batchResults = await Promise.all(batchPromises);

      // Process results
      for (const result of batchResults) {
        if (result.success) {
          // For very large datasets, just count successes instead of storing all data
          processedCount++;
          // Only store minimal information for success cases
          results.success.push({
            id: result.result.product_master_id,
            operation: result.operation,
          });
        } else {
          results.failure.push({
            id: result.productId,
            error: result.error,
          });
        }
      }
    }

    res.status(201).json({
      message: "Products processing completed",
      counts: {
        success: results.success.length,
        failure: results.failure.length,
        skipped: results.skipped.length,
        total: productsToSave.length,
      },
      skipped: results.skipped,
    });
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({
      error: "Internal server error",
      message: error.message,
    });
  }
};

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

    // Check if pushStock option is provided
    const pushStock = req.body.data.pushStock === "true";

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
    const groupedProducts = {};
    const skippedItems = [];

    for (const item of req.body.data.ItemGodowndetails) {
      if (!item.product_master_id) {
        return res.status(400).json({
          success: false,
          message: "product_master_id is required for each item",
        });
      }

      const productId = item.product_master_id.toString();

      if (!groupedProducts[productId]) {
        groupedProducts[productId] = {
          godowns: [],
          product_name: item.product_name || "Unknown",
        };
      }

      // Get MongoDB _id for this godown or skip if not found
      const godownObjectId = item.godown_id
        ? godownMapping[item.godown_id.toString()]
        : null;

      // Skip entries with invalid godown_id that couldn't be mapped to an actual godown
      if (item.godown_id && !godownObjectId) {
        const skippedItem = {
          product_id: productId,
          product_name: item.product_name || "Unknown",
          godown_id: item.godown_id,
          reason: "Invalid godown_id - godown not found",
        };
        skippedItems.push(skippedItem);
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

      groupedProducts[productId].godowns.push(godownEntry);
    }

    if (Object.keys(groupedProducts).length === 0) {
      return res.status(400).json({
        success: false,
        message: "No valid products found to update",
        skippedItems: skippedItems,
      });
    }

    // Create MongoDB ObjectIds for company and user
    const companyId = new mongoose.Types.ObjectId(cmp_id);
    const userId = new mongoose.Types.ObjectId(Primary_user_id);

    // Prepare bulk operations with chunking for large datasets
    const chunkSize = 500; // Adjust based on MongoDB performance
    const productIds = Object.keys(groupedProducts);
    let bulkResults = [];

    if (pushStock) {
      console.log("Push stock is true, merging godowns");

      // If pushStock is true, we need to fetch existing data and merge
      // Process products one by one to merge godowns
      for (const productId of productIds) {
        const data = groupedProducts[productId];
        const productData = await productModel.findOne({
          product_master_id: productId,
          cmp_id: companyId,
          Primary_user_id: userId,
        });

        if (productData) {
          // If product exists, we need to merge godowns
          const existingGodowns = productData.GodownList || [];
          const newGodowns = data.godowns;

          // Create a map of existing godowns by their ID for faster lookup
          const existingGodownMap = {};
          existingGodowns.forEach((g) => {
            if (g.godown) {
              existingGodownMap[g.godown.toString()] = true;
            }
          });

          // Create array with all godowns
          let mergedGodowns = [...existingGodowns];

          // Add new godowns, replacing any that have the same godown ID
          for (const newGodown of newGodowns) {
            if (newGodown.godown) {
              const godownId = newGodown.godown.toString();

              // Check if this godown exists
              if (existingGodownMap[godownId]) {
                // Replace existing godown with the same ID
                const index = mergedGodowns.findIndex(
                  (g) => g.godown && g.godown.toString() === godownId
                );
                if (index !== -1) {
                  mergedGodowns[index] = newGodown;
                }
              } else {
                // Add new godown
                mergedGodowns.push(newGodown);
              }
            }
          }

          // Update product with merged godowns
          await productModel.updateOne(
            {
              product_master_id: productId,
              cmp_id: companyId,
              Primary_user_id: userId,
            },
            {
              $set: {
                GodownList: mergedGodowns,
                product_name: data.product_name,
              },
            }
          );
        } else {
          // If product doesn't exist yet, create it with new godowns
          await productModel.create({
            product_master_id: productId,
            cmp_id: companyId,
            Primary_user_id: userId,
            GodownList: data.godowns,
            product_name: data.product_name,
          });
        }
      }

      // For pushStock=true, we're not using bulkWrite so set a simple result
      bulkResults = [
        {
          matchedCount: productIds.length,
          modifiedCount: productIds.length,
          upsertedCount: 0,
        },
      ];
    } else {
      // For pushStock=false, use the original bulk operation logic
      // Process in chunks to avoid overwhelming MongoDB
      for (let i = 0; i < productIds.length; i += chunkSize) {
        const chunk = productIds.slice(i, i + chunkSize);

        const bulkOps = chunk.map((productMasterId) => {
          const data = groupedProducts[productMasterId];

          return {
            updateOne: {
              filter: {
                product_master_id: productMasterId,
                cmp_id: companyId,
                Primary_user_id: userId,
              },
              update: {
                $set: {
                  GodownList: data.godowns,
                  // product_name: data.product_name
                },
              },
              upsert: true,
            },
          };
        });

        // Execute chunk's bulk write operation
        const result = await productModel.bulkWrite(bulkOps, {
          ordered: false,
        });
        bulkResults.push(result);
      }
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
        product_name: data.product_name,
        updated_godown_count: data.godowns.length,
      }));

    return res.status(200).json({
      success: true,
      message: `Successfully processed ${productIds.length} products with pushStock=${pushStock}. Updated: ${totalStats.modifiedCount}, Added: ${totalStats.upsertedCount}`,
      modifiedProducts: modificationSummary,
      totalRecordsProcessed: productIds.length,
      godownsMapped: Object.keys(godownMapping).length,
      godownsNotFound: missingGodownIds.length > 0 ? missingGodownIds : [],
      skippedItems: skippedItems.length > 0 ? skippedItems : undefined,
      mode: pushStock ? "merge" : "replace",
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
    const pricelevels = req.body?.data?.Priceleveles;

    // Basic validation
    if (!Array.isArray(pricelevels) || pricelevels.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Valid Priceleveles array is required",
      });
    }

    const { cmp_id, Primary_user_id } = pricelevels[0];

    if (!cmp_id || !Primary_user_id) {
      return res.status(400).json({
        success: false,
        message: "Company ID and Primary user ID are required",
      });
    }

    // Convert IDs to ObjectIds
    const cmpObjectId = new mongoose.Types.ObjectId(cmp_id);
    const userObjectId = new mongoose.Types.ObjectId(Primary_user_id);

    // Get unique price level names
    const priceLevelNames = [
      ...new Set(
        pricelevels
          .filter((item) => item.pricelevel)
          .map((item) => item.pricelevel.toString())
      ),
    ];

    // Fetch price levels by name
    const priceLevelDocs = await PriceLevel.find({
      pricelevel: { $in: priceLevelNames },
      cmp_id: cmpObjectId,
      Primary_user_id: userObjectId,
    });

    // Create name to ID mapping
    const priceLevelMap = {};
    priceLevelDocs.forEach((level) => {
      priceLevelMap[level.pricelevel] = level._id;
    });

    // Track unmapped price levels
    const unmappedPriceLevels = priceLevelNames.filter(
      (name) => !priceLevelMap[name]
    );

    // Process products with valid price levels
    const productsToUpdate = {};
    const skippedItems = [];

    pricelevels.forEach((item) => {
      if (!item.product_master_id || !item.pricelevel) {
        skippedItems.push({
          product_id: item.product_master_id || "Unknown",
          product_name: item.product_name || "Unknown",
          reason: !item.product_master_id
            ? "Missing product ID"
            : "Missing price level",
        });
        return;
      }

      const productId = item.product_master_id.toString();
      const priceLevelName = item.pricelevel.toString();

      // Skip if price level name not found
      if (!priceLevelMap[priceLevelName]) {
        skippedItems.push({
          product_id: productId,
          product_name: item.product_name || "Unknown",
          pricelevel: priceLevelName,
          reason: "Price level name not found",
        });
        return;
      }

      // Initialize product entry if needed
      if (!productsToUpdate[productId]) {
        productsToUpdate[productId] = {
          product_name: item.product_name || "Unknown",
          priceLevels: [],
        };
      }

      // Add price level entry
      productsToUpdate[productId].priceLevels.push({
        pricelevel: priceLevelMap[priceLevelName],
        pricerate: parseFloat(item.pricerate) || 0,
        priceDisc: parseFloat(item.priceDisc) || 0,
        ...(item.applicabledt && { applicabledt: item.applicabledt }),
      });
    });

    // Check if we have any valid products
    if (Object.keys(productsToUpdate).length === 0) {
      return res.status(400).json({
        success: false,
        message: "No valid products found to update",
        skippedItems,
        unmappedPriceLevels,
      });
    }

    // Build bulk operations
    const bulkOps = Object.entries(productsToUpdate).map(
      ([productId, data]) => ({
        updateOne: {
          filter: {
            product_master_id: productId,
            cmp_id: cmpObjectId,
            Primary_user_id: userObjectId,
          },
          update: {
            $set: {
              Priceleveles: data.priceLevels,
            },
          },
        },
      })
    );

    // Execute bulk write
    const result = await productModel.bulkWrite(bulkOps, { ordered: false });

    // Prepare summary (limited to first 50)
    const modificationSummary = Object.entries(productsToUpdate).map(
      ([productId, data]) => ({
        product_id: productId,
        product_name: data.product_name,
        updated_pricelevel_count: data.priceLevels.length,
      })
    );

    return res.status(200).json({
      success: true,
      message: `Processed ${
        Object.keys(productsToUpdate).length
      } products. Updated: ${result.modifiedCount}`,

      modifiedProducts: modificationSummary,
      totalRecordsProcessed: Object.keys(productsToUpdate).length,
      ...(skippedItems.length > 0 && { skippedItems }),
      ...(modificationSummary.length < Object.keys(productsToUpdate).length && {
        note: `Showing summary for first ${modificationSummary.length} of ${
          Object.keys(productsToUpdate).length
        } products.`,
      }),
    });
  } catch (error) {
    console.error("Error in updatePriceLevels:", error);

    const status =
      error.name === "ValidationError"
        ? 400
        : error.name === "MongoError" || error.name === "MongoServerError"
        ? 503
        : 500;

    return res.status(status).json({
      success: false,
      message:
        status === 400
          ? "Validation error"
          : status === 503
          ? "Database error"
          : "An error occurred while updating price levels",
      error: error.message,
    });
  }
};

// @desc for saving parties/costumers from tally
// route GET/api/tally/giveTransaction

export const savePartyFromTally = async (req, res) => {
  try {
    const partyToSave = req?.body?.data;

    // Check if partyToSave is defined and has elements
    if (!partyToSave || partyToSave.length === 0) {
      return res.status(400).json({ error: "No data provided" });
    }

    // Extract primary user id and company id from the first product
    const { Primary_user_id, cmp_id } = partyToSave[0];

    // Fetch account groups and sub-groups in parallel
    const [accountGroups, subGroups] = await Promise.all([
      accountGroupModel
        .find({ Primary_user_id, cmp_id }, { accountGroup_id: 1, _id: 1 })
        .lean(),
      subGroupModel
        .find({ Primary_user_id, cmp_id }, { subGroup_id: 1, _id: 1 })
        .lean(),
    ]);

    // Create efficient maps using object literals
    const accountGroupMap = Object.fromEntries(
      accountGroups.map((group) => [group.accountGroup_id, group._id])
    );

    const subGroupMap = Object.fromEntries(
      subGroups.map((group) => [group.subGroup_id, group._id])
    );

    // Process parties in memory for efficiency
    // Use object instead of Set for faster lookups with potentially large datasets
    const processedPartyMasterIds = {};

    const validParties = [];
    for (const party of partyToSave) {
      // Skip entries without party_master_id or already processed entries
      if (
        !party.party_master_id ||
        processedPartyMasterIds[party.party_master_id]
      ) {
        continue;
      }

      // Skip if required account mappings are missing
      if (party.accountGroup_id && !accountGroupMap[party.accountGroup_id]) {
        continue;
      }

      // Mark as processed
      processedPartyMasterIds[party.party_master_id] = true;

      // Create a new object instead of modifying the original to avoid reference issues
      const partyToInsert = { ...party };

      // Enhance party with ObjectId references
      if (partyToInsert.accountGroup_id) {
        partyToInsert.accountGroup =
          accountGroupMap[partyToInsert.accountGroup_id];
      }

      if (partyToInsert.subGroup_id && subGroupMap[partyToInsert.subGroup_id]) {
        partyToInsert.subGroup = subGroupMap[partyToInsert.subGroup_id];
      }

      validParties.push(partyToInsert);
    }

    // Batch operations for better performance
    // Use sessions to ensure atomicity
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      // Delete all existing parties in one operation
      await partyModel.deleteMany({ Primary_user_id, cmp_id }, { session });

      // Batch insert all valid parties
      let savedParty = [];
      if (validParties.length > 0) {
        // Insert in batches of 500 to avoid overwhelming the database
        const batchSize = 500;
        for (let i = 0; i < validParties.length; i += batchSize) {
          const batch = validParties.slice(i, i + batchSize);
          const result = await partyModel.insertMany(batch, { session });
          savedParty = savedParty.concat(result);
        }
      }

      await session.commitTransaction();

      res.status(201).json({
        message: "Party saved successfully",
        processedCount: validParties.length,
        skippedCount: partyToSave.length - validParties.length,
      });
    } catch (error) {
      // If an error occurs, abort the transaction
      await session.abortTransaction();
      throw error;
    } finally {
      session.endSession();
    }
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

    // Track processed and failed operations
    const uniqueGroups = new Map();
    const results = {
      successful: [],
      failed: [],
      skipped: []
    };

    // Process each account group
    await Promise.all(
      accountGroupsToSave.map(async (group) => {
        const key = `${group.cmp_id}-${group.accountGroup_id}-${group.Primary_user_id}`;

        // Skip duplicate records in the request
        if (uniqueGroups.has(key)) {
          results.skipped.push({
            accountGroup_id: group.accountGroup_id,
            reason: "Duplicate in request"
          });
          return;
        }
        uniqueGroups.set(key, true);

        try {
          // Convert Primary_user_id to ObjectId if it's a string
          if (typeof group.Primary_user_id === 'string') {
            group.Primary_user_id = new mongoose.Types.ObjectId(group.Primary_user_id);
          }

          // First check if an account group with this ID already exists
          const existingGroup = await AccountGroup.findOne({
            accountGroup_id: group.accountGroup_id
          });

          if (existingGroup) {
            // Update the existing document
            const updatedGroup = await AccountGroup.findByIdAndUpdate(
              existingGroup._id,
              group,
              { 
                new: true, 
                runValidators: true
              }
            );

            results.successful.push({
              accountGroup_id: group.accountGroup_id,
              _id: updatedGroup._id,
              isNew: false
            });
          } else {
            // Create a new document
            const newGroup = new AccountGroup(group);
            await newGroup.save();

            results.successful.push({
              accountGroup_id: group.accountGroup_id,
              _id: newGroup._id,
              isNew: true
            });
          }
        } catch (error) {
          console.error(`Error processing account group ${group.accountGroup_id}:`, error);
          results.failed.push({
            accountGroup_id: group.accountGroup_id,
            error: error.message || "Unknown error"
          });
        }
      })
    );

    // Return detailed response
    res.status(201).json({
      message: "Account groups processing completed",
      summary: {
        total: accountGroupsToSave.length,
        successful: results.successful.length,
        failed: results.failed.length,
        skipped: results.skipped.length
      },
      results
    });
  } catch (error) {
    console.error("Error in addAccountGroups:", error);
    res.status(500).json({ 
      error: "Internal server error", 
      message: error.message 
    });
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

    // Track processed and failed operations
    const uniqueSubGroups = new Map();
    const results = {
      successful: [],
      failed: [],
      skipped: []
    };

    // Process each subgroup
    await Promise.all(
      subGroupsToSave.map(async (subGroup) => {
        const key = `${subGroup.cmp_id}-${subGroup.subGroup_id}-${subGroup.Primary_user_id}`;

        // Skip duplicate records in the request
        if (uniqueSubGroups.has(key)) {
          results.skipped.push({
            subGroup_id: subGroup.subGroup_id,
            reason: "Duplicate in request"
          });
          return;
        }
        uniqueSubGroups.set(key, true);

        try {
          // Convert Primary_user_id to ObjectId if it's a string
          if (typeof subGroup.Primary_user_id === 'string') {
            subGroup.Primary_user_id = new mongoose.Types.ObjectId(subGroup.Primary_user_id);
          }

          // Find corresponding accountGroup
          const accountGroup = await AccountGroup.findOne({
            cmp_id: subGroup.cmp_id,
            accountGroup_id: subGroup.accountGroup_id,
            Primary_user_id: subGroup.Primary_user_id,
          });

          if (!accountGroup) {
            results.failed.push({
              subGroup_id: subGroup.subGroup_id,
              error: `Account group not found with ID: ${subGroup.accountGroup_id}`
            });
            return;
          }

          subGroup.accountGroup = accountGroup._id;

          // First check if a subgroup with this ID already exists
          const existingSubGroup = await subGroupModel.findOne({
            subGroup_id: subGroup.subGroup_id
          });

          let savedSubGroup;
          
          if (existingSubGroup) {
            // Update the existing document
            savedSubGroup = await subGroupModel.findByIdAndUpdate(
              existingSubGroup._id,
              subGroup,
              { 
                new: true, 
                runValidators: true
              }
            );

            results.successful.push({
              subGroup_id: subGroup.subGroup_id,
              _id: savedSubGroup._id,
              isNew: false
            });
          } else {
            // Create a new document
            const newSubGroup = new subGroupModel(subGroup);
            savedSubGroup = await newSubGroup.save();

            results.successful.push({
              subGroup_id: subGroup.subGroup_id,
              _id: savedSubGroup._id,
              isNew: true
            });
          }
        } catch (error) {
          console.error(`Error processing subgroup ${subGroup.subGroup_id}:`, error);
          results.failed.push({
            subGroup_id: subGroup.subGroup_id,
            error: error.message || "Unknown error"
          });
        }
      })
    );

    // Return detailed response
    res.status(201).json({
      message: "Sub-groups processing completed",
      summary: {
        total: subGroupsToSave.length,
        successful: results.successful.length,
        failed: results.failed.length,
        skipped: results.skipped.length
      },
      results
    });
  } catch (error) {
    console.error("Error in addSubGroups:", error);
    res.status(500).json({ 
      error: "Internal server error", 
      message: error.message 
    });
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

    if (req.path.includes("/addPriceLevels")) {
      Model = PriceLevel;
      idField = "pricelevel_id"; // This will be optional for price levels
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

    // Arrays to track items
    const results = [];
    const skippedItems = [];

    // Process each item in the data array
    for (const item of data) {
      // Special handling for price levels where ID is optional
      const isPriceLevel = req.path.includes("/addPriceLevels");

      // Check if required ID field is missing (except for price levels)
      if (!isPriceLevel && !item[idField]) {
        skippedItems.push({
          data: item,
          reason: `Missing ${idField}`,
        });
        continue;
      }

      if (!item.Primary_user_id) {
        skippedItems.push({
          data: item,
          reason: "Missing Primary_user_id",
        });
        continue;
      }

      if (!item.cmp_id) {
        skippedItems.push({
          data: item,
          reason: "Missing cmp_id",
        });
        continue;
      }

      if (!item[nameField]) {
        skippedItems.push({
          data: item,
          reason: `Missing ${nameField}`,
        });
        continue;
      }

      try {
        let existingItem = null;
        
        // For price levels, check if item exists by ID (if provided) or by name
        if (isPriceLevel) {
          if (item[idField]) {
            // If ID is provided, check by ID first
            existingItem = await Model.findOne({
              [idField]: item[idField],
              cmp_id: item.cmp_id,
            });
          }
          
          // If no ID or no item found by ID, check by name
          if (!existingItem) {
            existingItem = await Model.findOne({
              [nameField]: item[nameField],
              cmp_id: item.cmp_id,
            });
          }
        } else {
          // For other models, check by ID only
          existingItem = await Model.findOne({
            [idField]: item[idField],
            cmp_id: item.cmp_id,
          });
        }

        if (existingItem) {
          // Update existing item
          await Model.findByIdAndUpdate(existingItem._id, item);
          results.push({
            success: true,
            message: `${nameField} updated successfully`,
            data: item,
          });
        } else {
          // Create new item
          const newItem = new Model(item);
          await newItem.save();
          results.push({
            success: true,
            message: `${nameField} added successfully`,
            data: newItem,
          });
        }
      } catch (error) {
        results.push({
          success: false,
          message: `Error processing ${nameField}: ${error.message}`,
          data: item,
        });
      }
    }

    // Count successes, failures, and skipped items
    const successCount = results.filter((result) => result.success).length;
    const failureCount = results.length - successCount;
    const skippedCount = skippedItems.length;

    return res.status(200).json({
      success: true,
      message: `Added/Updated ${successCount} items, Failed ${failureCount} items, Skipped ${skippedCount} items`,
      results,
      skipped: skippedItems,
      counts: {
        success: successCount,
        failed: failureCount,
        skipped: skippedCount,
      },
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: `Error processing request: ${error.message}`,
    });
  }
};

export const addGodowns = async (req, res) => {
  try {
    const { data } = req.body;

    if (!Array.isArray(data)) {
      return res.status(400).json({
        success: false,
        message: "Data must be an array",
      });
    }

    // Arrays to track items
    const results = [];
    const skippedItems = [];

    // Check if any default godown already exists in the collection
    const existingDefaultGodown = await Godown.findOne({
      cmp_id: data[0]?.cmp_id,
      defaultGodown: true,
    });

    // If no default godown exists, check if one is provided in the request
    const hasDefaultGodownInRequest = data.some(
      (item) => item.defaultGodown === true
    );

    // If no default godown exists in DB and none provided in request, return error
    if (!existingDefaultGodown && !hasDefaultGodownInRequest) {
      return res.status(400).json({
        success: false,
        message:
          "At least one godown must be set as default (defaultGodown: true)",
      });
    }

    // Process each item in the data array
    for (const item of data) {
      if (!item.Primary_user_id) {
        skippedItems.push({
          data: item,
          reason: "Missing Primary_user_id",
        });
        continue;
      }

      if (!item.cmp_id) {
        skippedItems.push({
          data: item,
          reason: "Missing cmp_id",
        });
        continue;
      }

      if (!item?.godown) {
        skippedItems.push({
          data: item,
          reason: "Missing godown name",
        });
        continue;
      }
      if (!item?.godown_id) {
        skippedItems.push({
          data: item,
          reason: "Missing godown_id",
        });
        continue;
      }

      try {
        // Check if this item is trying to be a default godown
        const isRequestingDefault = item.defaultGodown === true;

        // If an existing default godown exists and this item is trying to be default
        if (existingDefaultGodown && isRequestingDefault) {
          // Override the incoming item to make it non-default
          item.defaultGodown = false;
        }

        // For other models or price levels with ID, check if item exists by ID
        const existingItem = await Godown.findOne({
          godown_id: item?.godown_id,
          cmp_id: item.cmp_id,
        });

        if (existingItem) {
          // If this is the existing default godown, ensure we don't change its default status
          if (
            existingDefaultGodown &&
            existingItem._id.toString() === existingDefaultGodown._id.toString()
          ) {
            item.defaultGodown = true; // Force keep it as default
          }

          // Update existing item
          await Godown.findByIdAndUpdate(existingItem._id, item);
          results.push({
            success: true,
            message: `Godown updated successfully${
              item.defaultGodown ? " (maintained as default)" : ""
            }`,
            data: item,
          });
        } else {
          // If this is the first godown being added and no default exists
          if (!existingDefaultGodown && !hasDefaultGodownInRequest) {
            // Make this the default
            item.defaultGodown = true;
          }

          // Create new item
          const newItem = new Godown(item);
          await newItem.save();
          results.push({
            success: true,
            message: `Godown added successfully${
              item.defaultGodown ? " (set as default)" : ""
            }`,
            data: newItem,
          });
        }
      } catch (error) {
        results.push({
          success: false,
          message: `Error processing godown: ${error.message}`,
          data: item,
        });
      }
    }

    // Count successes, failures, and skipped items
    const successCount = results.filter((result) => result.success).length;
    const failureCount = results.length - successCount;
    const skippedCount = skippedItems.length;

    return res.status(200).json({
      success: true,
      message: `Added/Updated ${successCount} items, Failed ${failureCount} items, Skipped ${skippedCount} items`,
      results,
      skipped: skippedItems,
      counts: {
        success: successCount,
        failed: failureCount,
        skipped: skippedCount,
      },
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
  const userId=req.query.userId
  return fetchData("vanSales", cmp_id, serialNumber, res,userId);
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
