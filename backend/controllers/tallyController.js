import TallyData from "../models/TallyData.js";
import BankDetailsModel from "../models/bankModel.js";
import CashModel from "../models/cashModel.js";
import partyModel from "../models/partyModel.js";
import productModel from "../models/productModel.js";
import AccountGroup from "../models/accountGroup.js";
import subGroupModel from "../models/subGroup.js";
import AdditionalCharges from "../models/additionalChargesModel.js";
import { fetchData, getApiLogs } from "../helpers/tallyHelper.js";
import { getUserFriendlyMessage } from "../helpers/getUserFreindlyMessage.js";
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
    const { data, partyIds } = await req.body;

    if (!data || !partyIds) {
      return res.status(400).json({
        success: false,
        message: "Invalid json structure",
      });
    }

    const partyIdValues = partyIds.map((p) => p.partyId);

    const { Primary_user_id, cmp_id } = data[0];

    const query = {
      Primary_user_id: {
        $in: [Primary_user_id, new mongoose.Types.ObjectId(Primary_user_id)],
      },
      cmp_id: {
        $in: [cmp_id, new mongoose.Types.ObjectId(cmp_id)],
      },
      party_master_id: { $in: partyIdValues },
    };
    const matchedParties = await partyModel
      .find(
        query,

        { _id: 1, party_master_id: 1 }
      )
      .lean();
    const matchedAccountGrp = await AccountGroup.find({
      Primary_user_id,
      cmp_id,
    });
    const accntgrpMap = Object.fromEntries(
      matchedAccountGrp.map((item) => [item.accountGroup_id, item._id])
    );
    const matchedSubGrp = await subGroupModel.find({ Primary_user_id, cmp_id });
    const subGrpMap = Object.fromEntries(
      matchedSubGrp.map((item) => [item.subGroup_id, item._id])
    );

    const partyIdMap = Object.fromEntries(
      matchedParties.map((item) => [item.party_master_id, item._id])
    );
    const deleted = await TallyData.deleteMany({ Primary_user_id, cmp_id });

    if (deleted.deletedCount > 0) {
      console.log(`Deleted ${deleted.deletedCount} documents`);
    } else {
      console.log("No documents matched the criteria");
    }
    const concurrencyLimit = 100;
    const results = [];

    for (let i = 0; i < data.length; i += concurrencyLimit) {
      const chunk = data.slice(i, i + concurrencyLimit);
      //promise.allsettled used instead of promise.all that this ensures that if any item has an error, only that specific item won't be saved left of the items saved promise.all wont do like this.
      const chunkResults = await Promise.allSettled(
        chunk.map(async (dataItem) => {
          try {
            // if (!dataItem.billId && dataItem.bill_no) {
            //   dataItem.billId = dataItem.bill_no;
            // }
            if (!dataItem.billId) {
              throw new Error(`Missing billId`);
            }
            if (!dataItem.bill_no) {
              throw new Error(`Missing bill_no`);
            }
            if (!dataItem.bill_amount) {
              throw new Error(`Missing bill_amount`);
            }
            if (!dataItem.bill_pending_amt) {
              throw new Error(`Missing bill_pending_amt`);
            }
            if (!dataItem.Primary_user_id) {
              throw new Error("Missing Primary_user_id");
            } else if (
              !mongoose.Types.ObjectId.isValid(dataItem.Primary_user_id)
            ) {
              throw new Error(
                `Invalid Primary_user_id: ${dataItem.Primary_user_id}`
              );
            }
            if (!dataItem.cmp_id) {
              throw new Error("Missing cmp_id");
            } else if (!mongoose.Types.ObjectId.isValid(dataItem.cmp_id)) {
              throw new Error(`Invalid cmp_id: ${dataItem.cmp_id}`);
            }
            if (!dataItem.bill_date) {
              throw new Error(`Missing bill_date`);
            } else if (!/^\d{4}-\d{2}-\d{2}$/.test(dataItem.bill_date)) {
              throw new Error(`Invalid bill_date format:${dataItem.bill_date}`);
            }
            if (!dataItem.bill_due_date) {
              throw new Error(`Missing bill_due_date`);
            } else if (!/^\d{4}-\d{2}-\d{2}$/.test(dataItem.bill_due_date)) {
              throw new Error(
                `Invalid bill_due_date format:${dataItem.bill_due_date}`
              );
            }

            const {
              party_id,
              accountGroup_id,
              subGroup_id = null,
              subGroup = null,
              ...resdata
            } = dataItem;
            if (!party_id) {
              throw new Error(`Missing party_id`);
            }
            if (!partyIdMap[party_id]) {
              throw new Error(`Invalid party_id`);
            }

            if (!accountGroup_id) {
              throw new Error(`Missing accountGroup_id`);
            }
            if (!accntgrpMap[accountGroup_id]) {
              throw new Error(`Invalid accountGroup_id`);
            }

            if (subGroup_id && !subGrpMap[subGroup_id]) {
              throw new Error(`Invalid subGroup_id: ${subGroup_id}`);
            }

            const baseData = {
              ...resdata,
              party_id: partyIdMap[party_id],
              accountGroup: accntgrpMap[accountGroup_id],
            };

            if (subGroup_id && subGrpMap[subGroup_id]) {
              baseData.subGroup = subGrpMap[subGroup_id];
            }

            const doc = new TallyData(baseData);
            return await doc.save();
          } catch (error) {
            throw {
              dataItem,
              error: error.message || error,
              userMessage: getUserFriendlyMessage(error.message, dataItem),
            };
          }
        })
      );

      results.push(...chunkResults);
    }
    // Separate successes and failures
    const successful = results
      .filter((r) => r.status === "fulfilled")
      .map((r) => r.value);

    const failed = results
      .filter((r) => r.status === "rejected")
      .map((r) => r.reason); // { item, error }

    // Final Response
    const response = {
      message:
        failed.length === 0
          ? "All data saved successfully"
          : failed.length === data.length
          ? "All data failed to save"
          : "Partial save completed",
      savedCount: successful.length,
      failedCount: failed.length,
      failedItems: failed, // Includes both the dataItem and the error
    };

    return res.status(failed.length > 0 ? 207 : 201).json(response);
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

//// add bank data
export const addBankData = async (req, res) => {
  try {
    const bankDetailsArray = req.body.bankdetails;

    // Basic validation for bank details array
    if (!bankDetailsArray || !bankDetailsArray.length) {
      return res.status(400).json({
        status: false,
        message: "No bank details provided",
      });
    }

    // Extract and validate required IDs from first item
    const { Primary_user_id, cmp_id } = bankDetailsArray[0] || {};

    if (!Primary_user_id || !cmp_id) {
      return res.status(400).json({
        status: false,
        message: "Primary_user_id and cmp_id are required",
      });
    }

    // Find and log company information
    getApiLogs(cmp_id, "Bank Data");

    // Process each bank detail item
    const validBankDetails = [];
    const skippedItems = [];
    let insertedCount = 0;
    let updatedCount = 0;

    for (let i = 0; i < bankDetailsArray.length; i++) {
      const bankDetail = bankDetailsArray[i];
      const itemIndex = i + 1;

      // Check for required fields
      const missingFields = [];
      if (!bankDetail.Primary_user_id) missingFields.push("Primary_user_id");
      if (!bankDetail.cmp_id) missingFields.push("cmp_id");
      if (!bankDetail.bank_ledname) missingFields.push("bank_ledname");
      if (!bankDetail.bank_id) missingFields.push("bank_id");

      // Skip item if missing required fields
      if (missingFields.length > 0) {
        skippedItems.push({
          item: itemIndex,
          reason: `Missing required fields: ${missingFields.join(", ")}`,
          data: bankDetail,
        });
        continue;
      }

      try {
        // Check if bank detail already exists based on unique combination
        const existingBankDetail = await BankDetailsModel.findOne({
          Primary_user_id: bankDetail.Primary_user_id,
          cmp_id: bankDetail.cmp_id,
          bank_id: bankDetail.bank_id,
        });

        if (existingBankDetail) {
          // Update existing record
          await BankDetailsModel.findByIdAndUpdate(
            existingBankDetail._id,
            bankDetail,
            { new: true }
          );
          updatedCount++;
        } else {
          // Insert new record
          await BankDetailsModel.create(bankDetail);
          insertedCount++;
        }

        validBankDetails.push(bankDetail);
      } catch (itemError) {
        // Handle individual item processing errors
        skippedItems.push({
          item: itemIndex,
          reason: `Processing error: ${itemError.message}`,
          data: bankDetail,
        });
      }
    }

    // Prepare response with detailed summary
    const response = {
      status: true,
      message: "Bank data processing completed",
      summary: {
        totalReceived: bankDetailsArray.length,
        insertedCount: insertedCount,
        updatedCount: updatedCount,
        successCount: insertedCount + updatedCount,
        skippedCount: skippedItems.length,
      },
    };

    // Add skipped items details if any exist
    if (skippedItems.length > 0) {
      response.skippedItems = skippedItems;
      response.skippedReasons = {
        missingRequiredFields: skippedItems.filter((item) =>
          item.reason.includes("Missing required fields")
        ).length,
        processingErrors: skippedItems.filter((item) =>
          item.reason.includes("Processing error")
        ).length,
      };
    }

    // Set appropriate HTTP status code
    const totalSuccess = insertedCount + updatedCount;
    const statusCode =
      totalSuccess > 0
        ? 200
        : skippedItems.length === bankDetailsArray.length
        ? 400
        : 207;

    console.log("response", response?.summary);
    return res.status(statusCode).json(response);
  } catch (error) {
    console.error("Error in addBankData:", error);

    // Handle specific MongoDB validation errors
    if (error.name === "ValidationError") {
      return res.status(400).json({
        status: false,
        message: "Validation error in bank data",
        error: error.message,
      });
    }

    // Handle duplicate key errors
    if (error.code === 11000) {
      return res.status(400).json({
        status: false,
        message: "Duplicate bank data detected",
        error: error.message,
      });
    }

    // Handle general server errors
    return res.status(500).json({
      status: false,
      message: "Internal server error",
      ...(process.env.NODE_ENV === "development" && { error: error.message }),
    });
  }
};

/// add Cash Data

export const addCashData = async (req, res) => {
  try {
    const cashDetailsArray = req.body.cashdetails;

    // Basic validation for cash details array
    if (!cashDetailsArray || !cashDetailsArray.length) {
      return res.status(400).json({
        status: false,
        message: "No cash details provided",
      });
    }

    // Extract and validate required IDs from first item
    const { Primary_user_id, cmp_id } = cashDetailsArray[0] || {};

    if (!Primary_user_id || !cmp_id) {
      return res.status(400).json({
        status: false,
        message: "Primary_user_id and cmp_id are required",
      });
    }

    // Find and log company information
    getApiLogs(cmp_id, "Cash Data");

    // Process each cash detail item
    const validCashDetails = [];
    const skippedItems = [];
    let insertedCount = 0;
    let updatedCount = 0;

    for (let i = 0; i < cashDetailsArray.length; i++) {
      const cashDetail = cashDetailsArray[i];
      const itemIndex = i + 1;

      // Check for required fields
      const missingFields = [];
      if (!cashDetail.Primary_user_id) missingFields.push("Primary_user_id");
      if (!cashDetail.cmp_id) missingFields.push("cmp_id");
      if (!cashDetail.cash_id) missingFields.push("cash_id");
      if (!cashDetail.cash_ledname) missingFields.push("cash_ledname");

      // Skip item if missing required fields
      if (missingFields.length > 0) {
        skippedItems.push({
          item: itemIndex,
          reason: `Missing required fields: ${missingFields.join(", ")}`,
          data: cashDetail,
        });
        continue;
      }

      try {
        // Check if cash detail already exists based on unique combination
        const existingCashDetail = await CashModel.findOne({
          Primary_user_id: cashDetail.Primary_user_id,
          cmp_id: cashDetail.cmp_id,
          cash_id: cashDetail.cash_id,
        });

        if (existingCashDetail) {
          // Update existing record
          await CashModel.findByIdAndUpdate(
            existingCashDetail._id,
            cashDetail,
            { new: true }
          );
          updatedCount++;
        } else {
          // Insert new record
          await CashModel.create(cashDetail);
          insertedCount++;
        }

        validCashDetails.push(cashDetail);
      } catch (itemError) {
        // Handle individual item processing errors
        skippedItems.push({
          item: itemIndex,
          reason: `Processing error: ${itemError.message}`,
          data: cashDetail,
        });
      }
    }

    // Prepare response with detailed summary
    const response = {
      status: true,
      message: "Cash data processing completed",
      summary: {
        totalReceived: cashDetailsArray.length,
        insertedCount: insertedCount,
        updatedCount: updatedCount,
        successCount: insertedCount + updatedCount,
        skippedCount: skippedItems.length,
      },
    };

    // Add skipped items details if any exist
    if (skippedItems.length > 0) {
      response.skippedItems = skippedItems;
      response.skippedReasons = {
        missingRequiredFields: skippedItems.filter((item) =>
          item.reason.includes("Missing required fields")
        ).length,
        processingErrors: skippedItems.filter((item) =>
          item.reason.includes("Processing error")
        ).length,
      };
    }

    // Set appropriate HTTP status code
    const totalSuccess = insertedCount + updatedCount;
    const statusCode =
      totalSuccess > 0
        ? 200
        : skippedItems.length === cashDetailsArray.length
        ? 400
        : 207;

    console.log("response", response?.summary);
    return res.status(statusCode).json(response);
  } catch (error) {
    console.error("Error in addCashData:", error);

    // Handle specific MongoDB validation errors
    if (error.name === "ValidationError") {
      return res.status(400).json({
        status: false,
        message: "Validation error in cash data",
        error: error.message,
      });
    }

    // Handle duplicate key errors
    if (error.code === 11000) {
      return res.status(400).json({
        status: false,
        message: "Duplicate cash data detected",
        error: error.message,
      });
    }

    // Handle general server errors
    return res.status(500).json({
      status: false,
      message: "Internal server error",
      ...(process.env.NODE_ENV === "development" && { error: error.message }),
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
          const existingGodowns = Array.isArray(productData.GodownList)
            ? productData.GodownList
            : [];
          const newGodowns = Array.isArray(data.godowns) ? data.godowns : [];

          // Build lookup map from existing
          const existingMap = new Map();
          existingGodowns.forEach((g, idx) => {
            const key = godownBatchKey(g.godown, g.batch);
            existingMap.set(key, idx);
          });

          // Start with a shallow copy so we keep original objects unless replaced
          const mergedGodowns = [...existingGodowns];

          for (const ng of newGodowns) {
            if (!ng?.godown) continue;

            const key = godownBatchKey(ng.godown, ng.batch);

            // Normalize date strings to Date
            const normalizedGodown = {
              ...ng,
              mfgdt: ng.mfgdt ? new Date(ng.mfgdt) : undefined,
              expdt: ng.expdt ? new Date(ng.expdt) : undefined,
            };

            if (existingMap.has(key)) {
              // replace entry at that index
              const i = existingMap.get(key);
              mergedGodowns[i] = normalizedGodown;
            } else {
              // new unique (godown,batch) combo → push
              existingMap.set(key, mergedGodowns.length);
              mergedGodowns.push(normalizedGodown);
            }
          }

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

const normBatch = (b) => (typeof b === "string" ? b.trim() : b || "");
const godownBatchKey = (g, b) => {
  const gid = g?.toString?.() ?? String(g);
  const batch = normBatch(b);
  return batch ? `${gid}__${batch}` : gid; // fallback: godown-only match if no batch
};

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

    // Basic validation for party array
    if (!partyToSave || partyToSave.length === 0) {
      return res.status(400).json({
        status: false,
        message: "No party data provided",
      });
    }

    // Extract and validate required IDs from first item
    const { Primary_user_id, cmp_id } = partyToSave[0] || {};

    if (!Primary_user_id || !cmp_id) {
      return res.status(400).json({
        status: false,
        message: "Primary_user_id and cmp_id are required",
      });
    }

    // Find and log company information
    getApiLogs(cmp_id, "Party Data");

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

    // Track processed and failed operations
    const processedPartyMasterIds = {};
    const skippedItems = [];
    let insertedCount = 0;
    let updatedCount = 0;

    // Process each party
    for (let i = 0; i < partyToSave.length; i++) {
      const party = partyToSave[i];
      const itemIndex = i + 1;

      // Check for required fields
      const missingFields = [];
      if (!party.Primary_user_id) missingFields.push("Primary_user_id");
      if (!party.cmp_id) missingFields.push("cmp_id");
      if (!party.party_master_id) missingFields.push("party_master_id");

      // Skip item if missing required fields
      if (missingFields.length > 0) {
        skippedItems.push({
          item: itemIndex,
          reason: `Missing required fields: ${missingFields.join(", ")}`,
          data: { party_master_id: party.party_master_id || "N/A" },
        });
        continue;
      }

      // Skip duplicate party_master_id in the request
      if (processedPartyMasterIds[party.party_master_id]) {
        skippedItems.push({
          item: itemIndex,
          reason: "Duplicate party_master_id in request",
          data: { party_master_id: party.party_master_id },
        });
        continue;
      }

      // Skip if required account group mapping is missing
      if (party.accountGroup_id && !accountGroupMap[party.accountGroup_id]) {
        skippedItems.push({
          item: itemIndex,
          reason: `Account group not found with ID: ${party.accountGroup_id}`,
          data: { party_master_id: party.party_master_id },
        });
        continue;
      }

      // Skip if required sub group mapping is missing
      if (party.subGroup_id && !subGroupMap[party.subGroup_id]) {
        skippedItems.push({
          item: itemIndex,
          reason: `Sub group not found with ID: ${party.subGroup_id}`,
          data: { party_master_id: party.party_master_id },
        });
        continue;
      }

      // Mark as processed
      processedPartyMasterIds[party.party_master_id] = true;

      try {
        // Create a new object instead of modifying the original
        const partyToProcess = { ...party };

        // Enhance party with ObjectId references
        if (partyToProcess.accountGroup_id) {
          partyToProcess.accountGroup = accountGroupMap[partyToProcess.accountGroup_id];
        }

        if (partyToProcess.subGroup_id && subGroupMap[partyToProcess.subGroup_id]) {
          partyToProcess.subGroup = subGroupMap[partyToProcess.subGroup_id];
        }

        // Check if party already exists
        const existingParty = await partyModel.findOne({
          party_master_id: party.party_master_id,
          cmp_id: party.cmp_id,
          Primary_user_id: party.Primary_user_id,
        });

        if (existingParty) {
          // Update the existing party
          await partyModel.findByIdAndUpdate(
            existingParty._id,
            partyToProcess,
            {
              new: true,
              runValidators: true,
            }
          );
          updatedCount++;
        } else {
          // Create a new party
          const newParty = new partyModel(partyToProcess);
          await newParty.save();
          insertedCount++;
        }
      } catch (itemError) {
        console.error(
          `Error processing party ${party.party_master_id}:`,
          itemError
        );
        skippedItems.push({
          item: itemIndex,
          reason: `Processing error: ${itemError.message}`,
          data: { party_master_id: party.party_master_id },
        });
      }
    }

    // Prepare response with detailed summary
    const response = {
      status: true,
      message: "Party processing completed",
      summary: {
        totalReceived: partyToSave.length,
        insertedCount: insertedCount,
        updatedCount: updatedCount,
        successCount: insertedCount + updatedCount,
        skippedCount: skippedItems.length,
      },
    };

    // Add skipped items details if any exist
    if (skippedItems.length > 0) {
      response.skippedItems = skippedItems;
      response.skippedReasons = {
        missingRequiredFields: skippedItems.filter((item) =>
          item.reason.includes("Missing required fields")
        ).length,
        duplicateInRequest: skippedItems.filter((item) =>
          item.reason.includes("Duplicate party_master_id in request")
        ).length,
        accountGroupNotFound: skippedItems.filter((item) =>
          item.reason.includes("Account group not found")
        ).length,
        subGroupNotFound: skippedItems.filter((item) =>
          item.reason.includes("Sub group not found")
        ).length,
        processingErrors: skippedItems.filter((item) =>
          item.reason.includes("Processing error")
        ).length,
      };
    }

    // Set appropriate HTTP status code
    const totalSuccess = insertedCount + updatedCount;
    const statusCode =
      totalSuccess > 0
        ? 200
        : skippedItems.length === partyToSave.length
        ? 400
        : 207;

    console.log("Party Response:", response?.summary);
    return res.status(statusCode).json(response);
  } catch (error) {
    console.error("Error in savePartyFromTally:", error);

    // Handle specific MongoDB validation errors
    if (error.name === "ValidationError") {
      return res.status(400).json({
        status: false,
        message: "Validation error in party data",
        error: error.message,
      });
    }

    // Handle duplicate key errors
    if (error.code === 11000) {
      return res.status(400).json({
        status: false,
        message: "Duplicate party data detected",
        error: error.message,
      });
    }

    // Handle general server errors
    return res.status(500).json({
      status: false,
      message: "Internal server error",
      ...(process.env.NODE_ENV === "development" && { error: error.message }),
    });
  }
};

// @desc for saving additionalCharges from tally
// route GET/api/tally/giveTransaction

export const saveAdditionalChargesFromTally = async (req, res) => {
  try {
    const additionalChargesToSave = req?.body?.data;

    // Basic validation for additional charges array
    if (!additionalChargesToSave || additionalChargesToSave.length === 0) {
      return res.status(400).json({
        status: false,
        message: "No additional charges data provided",
      });
    }

    // Extract and validate required IDs from first item
    const { Primary_user_id, cmp_id } = additionalChargesToSave[0] || {};

    if (!Primary_user_id || !cmp_id) {
      return res.status(400).json({
        status: false,
        message: "Primary_user_id and cmp_id are required",
      });
    }

    // Find and log company information
    getApiLogs(cmp_id, "Additional Charges Data");

    // Track processed and failed operations
    const skippedItems = [];
    let insertedCount = 0;
    let updatedCount = 0;

    // Process each additional charge
    for (let i = 0; i < additionalChargesToSave.length; i++) {
      const charge = additionalChargesToSave[i];
      const itemIndex = i + 1;

      // Check for required fields
      const missingFields = [];
      if (!charge.Primary_user_id) missingFields.push("Primary_user_id");
      if (!charge.cmp_id) missingFields.push("cmp_id");
      if (!charge.name) missingFields.push("name");
      if (!charge.master_id) missingFields.push("master_id");

      // Skip item if missing required fields
      if (missingFields.length > 0) {
        skippedItems.push({
          item: itemIndex,
          reason: `Missing required fields: ${missingFields.join(", ")}`,
          data: { name: charge.name || "N/A" },
        });
        continue;
      }

      try {
        // Check if the additional charge already exists
        const existingCharge = await AdditionalCharges.findOne({
          cmp_id: charge.cmp_id,
          Primary_user_id: charge.Primary_user_id,
          master_id: charge.master_id,
        });

        if (existingCharge) {
          // Update the existing additional charge
          await AdditionalCharges.findByIdAndUpdate(
            existingCharge._id,
            charge,
            { new: true, runValidators: true }
          );
          updatedCount++;
        } else {
          // Create a new additional charge
          const newCharge = new AdditionalCharges(charge);
          await newCharge.save();
          insertedCount++;
        }
      } catch (itemError) {
        console.error(
          `Error processing additional charge ${charge.name}:`,
          itemError
        );
        skippedItems.push({
          item: itemIndex,
          reason: `Processing error: ${itemError.message}`,
          data: { name: charge.name || "N/A" },
        });
      }
    }

    // Prepare response with detailed summary
    const response = {
      status: true,
      message: "Additional charges processing completed",
      summary: {
        totalReceived: additionalChargesToSave.length,
        insertedCount: insertedCount,
        updatedCount: updatedCount,
        successCount: insertedCount + updatedCount,
        skippedCount: skippedItems.length,
      },
    };

    // Add skipped items details if any exist
    if (skippedItems.length > 0) {
      response.skippedItems = skippedItems;
      response.skippedReasons = {
        missingRequiredFields: skippedItems.filter((item) =>
          item.reason.includes("Missing required fields")
        ).length,
        processingErrors: skippedItems.filter((item) =>
          item.reason.includes("Processing error")
        ).length,
      };
    }

    // Set appropriate HTTP status code
    const totalSuccess = insertedCount + updatedCount;
    const statusCode =
      totalSuccess > 0
        ? 200
        : skippedItems.length === additionalChargesToSave.length
        ? 400
        : 207;

    console.log("Additional Charges Response:", response?.summary);
    return res.status(statusCode).json(response);
  } catch (error) {
    console.error("Error in saveAdditionalChargesFromTally:", error);

    // Handle specific MongoDB validation errors
    if (error.name === "ValidationError") {
      return res.status(400).json({
        status: false,
        message: "Validation error in additional charges data",
        error: error.message,
      });
    }

    // Handle duplicate key errors
    if (error.code === 11000) {
      return res.status(400).json({
        status: false,
        message: "Duplicate additional charges data detected",
        error: error.message,
      });
    }

    // Handle general server errors
    return res.status(500).json({
      status: false,
      message: "Internal server error",
      ...(process.env.NODE_ENV === "development" && { error: error.message }),
    });
  }
};

// @desc for saving accountGroups from tally
// route GET/api/tally/addAccountGroups

export const addAccountGroups = async (req, res) => {
  try {
    const accountGroupsToSave = req?.body?.data;

    // Basic validation for account groups array
    if (!accountGroupsToSave || accountGroupsToSave.length === 0) {
      return res.status(400).json({
        status: false,
        message: "No account groups data provided",
      });
    }

    // Extract and validate required IDs from first item
    const { Primary_user_id, cmp_id } = accountGroupsToSave[0] || {};

    if (!Primary_user_id || !cmp_id) {
      return res.status(400).json({
        status: false,
        message: "Primary_user_id and cmp_id are required",
      });
    }

    // Find and log company information
    getApiLogs(cmp_id, "Account Groups Data");

    // Track processed and failed operations
    const uniqueGroups = new Map();
    const skippedItems = [];
    let insertedCount = 0;
    let updatedCount = 0;

    // Process each account group
    for (let i = 0; i < accountGroupsToSave.length; i++) {
      const group = accountGroupsToSave[i];
      const itemIndex = i + 1;
      const key = `${group.cmp_id}-${group.accountGroup_id}-${group.Primary_user_id}`;

      // Skip duplicate records in the request
      if (uniqueGroups.has(key)) {
        skippedItems.push({
          item: itemIndex,
          reason: "Duplicate in request",
          data: { accountGroup_id: group.accountGroup_id },
        });
        continue;
      }
      uniqueGroups.set(key, true);

      // Check for required fields
      const missingFields = [];
      if (!group.Primary_user_id) missingFields.push("Primary_user_id");
      if (!group.cmp_id) missingFields.push("cmp_id");
      if (!group.accountGroup_id) missingFields.push("accountGroup_id");

      // Skip item if missing required fields
      if (missingFields.length > 0) {
        skippedItems.push({
          item: itemIndex,
          reason: `Missing required fields: ${missingFields.join(", ")}`,
          data: { accountGroup_id: group.accountGroup_id },
        });
        continue;
      }

      try {
        // Convert Primary_user_id to ObjectId if it's a string
        if (typeof group.Primary_user_id === "string") {
          group.Primary_user_id = new mongoose.Types.ObjectId(
            group.Primary_user_id
          );
        }

        // First check if an account group with this ID already exists
        const existingGroup = await AccountGroup.findOne({
          accountGroup_id: group.accountGroup_id,
          cmp_id: group?.cmp_id,
          Primary_user_id: group?.Primary_user_id,
        });

        if (existingGroup) {
          // Update the existing document
          await AccountGroup.findByIdAndUpdate(existingGroup._id, group, {
            new: true,
            runValidators: true,
          });
          updatedCount++;
        } else {
          // Create a new document
          const newGroup = new AccountGroup(group);
          await newGroup.save();
          insertedCount++;
        }
      } catch (itemError) {
        console.error(
          `Error processing account group ${group.accountGroup_id}:`,
          itemError
        );
        skippedItems.push({
          item: itemIndex,
          reason: `Processing error: ${itemError.message}`,
          data: { accountGroup_id: group.accountGroup_id },
        });
      }
    }

    // Prepare response with detailed summary
    const response = {
      status: true,
      message: "Account groups processing completed",
      summary: {
        totalReceived: accountGroupsToSave.length,
        insertedCount: insertedCount,
        updatedCount: updatedCount,
        successCount: insertedCount + updatedCount,
        skippedCount: skippedItems.length,
      },
    };

    // Add skipped items details if any exist
    if (skippedItems.length > 0) {
      response.skippedItems = skippedItems;
      response.skippedReasons = {
        missingRequiredFields: skippedItems.filter((item) =>
          item.reason.includes("Missing required fields")
        ).length,
        duplicateInRequest: skippedItems.filter((item) =>
          item.reason.includes("Duplicate in request")
        ).length,
        processingErrors: skippedItems.filter((item) =>
          item.reason.includes("Processing error")
        ).length,
      };
    }

    // Set appropriate HTTP status code
    const totalSuccess = insertedCount + updatedCount;
    const statusCode =
      totalSuccess > 0
        ? 200
        : skippedItems.length === accountGroupsToSave.length
        ? 400
        : 207;

    console.log("Account Groups Response:", response?.summary);
    return res.status(statusCode).json(response);
  } catch (error) {
    console.error("Error in addAccountGroups:", error);

    // Handle specific MongoDB validation errors
    if (error.name === "ValidationError") {
      return res.status(400).json({
        status: false,
        message: "Validation error in account groups data",
        error: error.message,
      });
    }

    // Handle duplicate key errors
    if (error.code === 11000) {
      return res.status(400).json({
        status: false,
        message: "Duplicate account groups data detected",
        error: error.message,
      });
    }

    // Handle general server errors
    return res.status(500).json({
      status: false,
      message: "Internal server error",
      ...(process.env.NODE_ENV === "development" && { error: error.message }),
    });
  }
};

// @desc for saving subGroups from tally
// route GET/api/tally/addSubGroups

export const addSubGroups = async (req, res) => {
  try {
    const subGroupsToSave = req?.body?.data;

    // Basic validation for sub groups array
    if (!subGroupsToSave || subGroupsToSave.length === 0) {
      return res.status(400).json({
        status: false,
        message: "No sub groups data provided",
      });
    }

    // Extract and validate required IDs from first item
    const { Primary_user_id, cmp_id } = subGroupsToSave[0] || {};

    if (!Primary_user_id || !cmp_id) {
      return res.status(400).json({
        status: false,
        message: "Primary_user_id and cmp_id are required",
      });
    }

    // Find and log company information
    getApiLogs(cmp_id, "Sub Groups Data");

    // Track processed and failed operations
    const uniqueSubGroups = new Map();
    const skippedItems = [];
    let insertedCount = 0;
    let updatedCount = 0;

    // Process each subgroup
    for (let i = 0; i < subGroupsToSave.length; i++) {
      const subGroup = subGroupsToSave[i];
      const itemIndex = i + 1;
      const key = `${subGroup.cmp_id}-${subGroup.subGroup_id}-${subGroup.Primary_user_id}`;

      // Skip duplicate records in the request
      if (uniqueSubGroups.has(key)) {
        skippedItems.push({
          item: itemIndex,
          reason: "Duplicate in request",
          data: { subGroup_id: subGroup.subGroup_id },
        });
        continue;
      }
      uniqueSubGroups.set(key, true);

      // Check for required fields
      const missingFields = [];
      if (!subGroup.Primary_user_id) missingFields.push("Primary_user_id");
      if (!subGroup.cmp_id) missingFields.push("cmp_id");
      if (!subGroup.subGroup_id) missingFields.push("subGroup_id");
      if (!subGroup.accountGroup_id) missingFields.push("accountGroup_id");

      // Skip item if missing required fields
      if (missingFields.length > 0) {
        skippedItems.push({
          item: itemIndex,
          reason: `Missing required fields: ${missingFields.join(", ")}`,
          data: { subGroup_id: subGroup.subGroup_id },
        });
        continue;
      }

      try {
        // Convert Primary_user_id to ObjectId if it's a string
        if (typeof subGroup.Primary_user_id === "string") {
          subGroup.Primary_user_id = new mongoose.Types.ObjectId(
            subGroup.Primary_user_id
          );
        }

        // Find corresponding accountGroup
        const accountGroup = await AccountGroup.findOne({
          cmp_id: subGroup.cmp_id,
          accountGroup_id: subGroup.accountGroup_id,
          Primary_user_id: subGroup.Primary_user_id,
        });

        if (!accountGroup) {
          skippedItems.push({
            item: itemIndex,
            reason: `Account group not found with ID: ${subGroup.accountGroup_id}`,
            data: { subGroup_id: subGroup.subGroup_id },
          });
          continue;
        }

        subGroup.accountGroup = accountGroup._id;

        // First check if a subgroup with this ID already exists
        const existingSubGroup = await subGroupModel.findOne({
          subGroup_id: subGroup.subGroup_id,
          cmp_id: subGroup?.cmp_id,
          Primary_user_id: subGroup.Primary_user_id,
        });

        if (existingSubGroup) {
          // Update the existing document
          await subGroupModel.findByIdAndUpdate(
            existingSubGroup._id,
            subGroup,
            {
              new: true,
              runValidators: true,
            }
          );
          updatedCount++;
        } else {
          // Create a new document
          const newSubGroup = new subGroupModel(subGroup);
          await newSubGroup.save();
          insertedCount++;
        }
      } catch (itemError) {
        console.error(
          `Error processing subgroup ${subGroup.subGroup_id}:`,
          itemError
        );
        skippedItems.push({
          item: itemIndex,
          reason: `Processing error: ${itemError.message}`,
          data: { subGroup_id: subGroup.subGroup_id },
        });
      }
    }

    // Prepare response with detailed summary
    const response = {
      status: true,
      message: "Sub-groups processing completed",
      summary: {
        totalReceived: subGroupsToSave.length,
        insertedCount: insertedCount,
        updatedCount: updatedCount,
        successCount: insertedCount + updatedCount,
        skippedCount: skippedItems.length,
      },
    };

    // Add skipped items details if any exist
    if (skippedItems.length > 0) {
      response.skippedItems = skippedItems;
      response.skippedReasons = {
        missingRequiredFields: skippedItems.filter((item) =>
          item.reason.includes("Missing required fields")
        ).length,
        duplicateInRequest: skippedItems.filter((item) =>
          item.reason.includes("Duplicate in request")
        ).length,
        accountGroupNotFound: skippedItems.filter((item) =>
          item.reason.includes("Account group not found")
        ).length,
        processingErrors: skippedItems.filter((item) =>
          item.reason.includes("Processing error")
        ).length,
      };
    }

    // Set appropriate HTTP status code
    const totalSuccess = insertedCount + updatedCount;
    const statusCode =
      totalSuccess > 0
        ? 200
        : skippedItems.length === subGroupsToSave.length
        ? 400
        : 207;

    console.log("Sub Groups Response:", response?.summary);
    return res.status(statusCode).json(response);
  } catch (error) {
    console.error("Error in addSubGroups:", error);

    // Handle specific MongoDB validation errors
    if (error.name === "ValidationError") {
      return res.status(400).json({
        status: false,
        message: "Validation error in sub groups data",
        error: error.message,
      });
    }

    // Handle duplicate key errors
    if (error.code === 11000) {
      return res.status(400).json({
        status: false,
        message: "Duplicate sub groups data detected",
        error: error.message,
      });
    }

    // Handle general server errors
    return res.status(500).json({
      status: false,
      message: "Internal server error",
      ...(process.env.NODE_ENV === "development" && { error: error.message }),
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

    const { Primary_user_id, cmp_id } = req?.body?.data[0] || {};

    if (!Primary_user_id || !cmp_id) {
      return res.status(400).json({
        status: false,
        message: "Primary_user_id and cmp_id are required",
      });
    }

    getApiLogs(cmp_id, nameField);

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

    const counts = {
      success: successCount,
      failed: failureCount,
      skipped: skippedCount,
    };

    console.log(`${nameField} response`, counts);

    return res.status(200).json({
      success: true,
      message: `Added/Updated ${successCount} items, Failed ${failureCount} items, Skipped ${skippedCount} items`,
      results,
      skipped: skippedItems,
      counts,
    });
  } catch (error) {
    console.error("Error processing request:", error);
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

    // Extract and validate required IDs from first item
    const { Primary_user_id, cmp_id } = data[0] || {};

    if (!Primary_user_id || !cmp_id) {
      return res.status(400).json({
        status: false,
        message: "Primary_user_id and cmp_id are required",
      });
    }

    getApiLogs(cmp_id, "godown");

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
      (item) => item.defaultGodown === "true"
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

    const counts = {
      success: successCount,
      failed: failureCount,
      skipped: skippedCount,
    };

    console.log("godown response", counts);

    return res.status(200).json({
      success: true,
      message: `Added/Updated ${successCount} items, Failed ${failureCount} items, Skipped ${skippedCount} items`,
      results,
      skipped: skippedItems,
      counts,
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
  const userId = req.query.userId;
  return fetchData("vanSales", cmp_id, serialNumber, res, userId);
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
