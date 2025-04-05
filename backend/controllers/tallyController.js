import TallyData from "../models/TallyData.js";
import TransactionModel from "../models/TransactionModel.js";
import BankDetailsModel from "../models/bankModel.js";
import CashModel from "../models/cashModel.js";

import partyModel from "../models/partyModel.js";
import productModel from "../models/productModel.js";
import AdditionalCharges from "../models/additionalChargesModel.js";
import AccountGroup from "../models/accountGroup.js";
import SubGroup from "../models/subGroup.js";
import { fetchData } from "../helpers/tallyHelper.js";
import mongoose from "mongoose";
import accountGroup from "../models/accountGroup.js";

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

    const savedProducts = await Promise.all(
      productsToSave.map(async (productItem) => {
        const { Primary_user_id, cmp_id, product_master_id } = productItem;
        let savedProduct;

        try {
          if (product_master_id) {
            const existingProduct = await productModel.findOne({
              Primary_user_id,
              cmp_id,
              product_master_id,
            });

            if (existingProduct) {
              // console.log("existingProduct", existingProduct.product_name)

              // Update the existing product
              savedProduct = await productModel.findOneAndUpdate(
                {
                  Primary_user_id,
                  cmp_id,
                  product_master_id,
                },
                productItem,
                { new: true }
              );
            }
          }

          // If no existing product was found or updated, create a new one
          if (!savedProduct) {
            const newProduct = new productModel(productItem);
            savedProduct = await newProduct.save();
          }

          return savedProduct;
        } catch (error) {
          console.error(
            `Error saving product with product_master_id ${product_master_id}:`,
            error
          );
          return null; // Return null if there is an error to continue processing other products
        }
      })
    );

    // Filter out any null values from the savedProducts array
    const successfulSaves = savedProducts.filter((product) => product !== null);

    res.status(201).json({
      message: "Products saved successfully",
      savedProducts: successfulSaves,
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

    const groupedGodowns = req.body.data.ItemGodowndetails.reduce(
      (acc, item) => {
        if (!item.product_master_id) {
          throw new Error("product_master_id is required for each item");
        }

        const productId = item.product_master_id.toString();

        if (!acc[productId]) {
          acc[productId] = {
            godowns: [],
            product_name: item.product_name, // Store product name
          };
        }

        acc[productId].godowns.push({
          godown: item.godown,
          godown_id: item.godown_id,
          batch: item.batch,
          mfgdt: item.mfgdt,
          expdt: item.expdt,
          balance_stock: item.balance_stock,
          batchEnabled: item.batchEnabled,
        });

        return acc;
      },
      {}
    );

    // console.log("groupedGodowns", groupedGodowns);

    if (Object.keys(groupedGodowns).length === 0) {
      return res.status(400).json({
        success: false,
        message: "No valid products found to update",
      });
    }

    // Create bulk write operations (overwrite always)
    const bulkOps = Object.entries(groupedGodowns).map(
      ([productMasterId, data]) => ({
        updateOne: {
          filter: {
            product_master_id: productMasterId.toString(),
            cmp_id: req.body.data.ItemGodowndetails[0].cmp_id,
            Primary_user_id: new mongoose.Types.ObjectId(
              req.body.data.ItemGodowndetails[0].Primary_user_id
            ),
          },
          update: {
            $set: {
              GodownList: data.godowns,
              // godownCount: data.godowns.reduce(
              //   (sum, g) => sum + (parseInt(g.balance_stock) || 0),
              //   0
              // ),
            },
          },
          upsert: true, // Ensure the record is created if it doesn't exist
        },
      })
    );

    // Execute bulk write operation
    const result = await productModel.bulkWrite(bulkOps);

    // console.log(result);
    // console.log("groupedGodowns", Object.keys(groupedGodowns).length);

    // Fetch updated products details
    const updatedProducts = await productModel.find(
      {
        product_master_id: {
          $in: Object.keys(groupedGodowns),
        },
      },
      {
        product_name: 1,
        product_master_id: 1,
        // godownCount: 1
      }
    );

    // console.log("updatedProducts", updatedProducts);

    // Create a summary of modifications
    const modificationSummary = updatedProducts.map((product) => ({
      product_id: product.product_master_id,
      product_name:
        product.product_name ||
        groupedGodowns[product.product_master_id]?.product_name ||
        "Unknown", // Fallback for missing product_name
      // updated_godown_count: product.godownCount,
      // godowns: groupedGodowns[product.product_master_id.toString()]?.godowns || []
    }));

    return res.status(200).json({
      success: true,
      message: `Successfully processed ${result.matchedCount} products.`,
      modifiedProducts: modificationSummary,
      bulkWriteResult: result,
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

    // Group Priceleveles by product_master_id
    const groupedPriceLevels = req.body.data.Priceleveles.reduce(
      (acc, item) => {
        if (!item.product_master_id) {
          throw new Error("product_master_id is required for each price level");
        }

        const productId = item.product_master_id.toString();

        if (!acc[productId]) {
          acc[productId] = [];
        }

        acc[productId].push({
          pricelevel: item.pricelevel,
          pricerate: item.pricerate,
          priceDisc: item.priceDisc,
          applicabledt: item.applicabledt,
        });

        return acc;
      },
      {}
    );

    // Validate if there are products to update
    if (Object.keys(groupedPriceLevels).length === 0) {
      return res.status(400).json({
        success: false,
        message: "No valid price levels found to update",
      });
    }

    // Create bulk write operations (overwrite always)
    const bulkOps = Object.entries(groupedPriceLevels).map(
      ([productMasterId, priceLevels]) => ({
        updateOne: {
          filter: {
            product_master_id: productMasterId,
            cmp_id: req.body.data.Priceleveles[0].cmp_id,
            Primary_user_id: new mongoose.Types.ObjectId(
              req.body.data.Priceleveles[0].Primary_user_id
            ),
          },
          update: {
            $set: {
              Priceleveles: priceLevels,
            },
          },
          upsert: true, // Create the document if it doesn't exist
        },
      })
    );

    // Execute bulk write operation
    const result = await productModel.bulkWrite(bulkOps);

    // Fetch updated products for response
    const updatedProducts = await productModel.find(
      {
        product_master_id: {
          $in: Object.keys(groupedPriceLevels),
        },
      },
      {
        product_name: 1,
        product_master_id: 1,
        // Priceleveles: 1,
      }
    );

    // Log updated products
    // console.log("Updated Products:", updatedProducts);

    // Create a summary of modifications
    const modificationSummary = updatedProducts.map((product) => ({
      product_id: product.product_master_id,
      product_name: product.product_name || "Unknown",
      // priceLevels: product.Priceleveles || [],
    }));

    return res.status(200).json({
      success: true,
      message: `Successfully processed ${result.matchedCount} products.`,
      modifiedProducts: modificationSummary,
      bulkWriteResult: result,
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



/**
 * Clear stock for all products in the given company
 * @param {string} cmp_id Company ID
 */
export const clearStock = async (req, res) => {
  const cmp_id = req.params.cmp_id;

  try {
    const products = await productModel.find({
      cmp_id: cmp_id,
      "GodownList.balance_stock": { $ne: 0 },
    });

    const bulkOps = [];

    for (const product of products) {
      let updated = false;

      const updatedGodownList = product.GodownList.map((item) => {
        if (item.balance_stock !== 0) {
          updated = true;
          return { ...item, balance_stock: 0 };
        }
        return item;
      });

      if (updated) {
        bulkOps.push({
          updateOne: {
            filter: { _id: product._id },
            update: { $set: { GodownList: updatedGodownList } },
          },
        });
      }
    }

    if (bulkOps.length > 0) {
      await productModel.bulkWrite(bulkOps);
    }

    res.status(200).json({
      message: `Stock cleared for ${bulkOps.length} products successfully`,
    });
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ error: "Internal server error" });
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
