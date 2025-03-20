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
import { Godown, PriceLevel,Brand,Category,Subcategory } from "../models/subDetails.js";

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

// export const saveProductsFromTally = async (req, res) => {
//   try {
//     const productsToSave = req?.body?.data;

//     if (!productsToSave || !productsToSave.length) {
//       return res.status(400).json({ message: "No products to save" });
//     }

//     const savedProducts = await Promise.all(
//       productsToSave.map(async (productItem) => {
//         const { Primary_user_id, cmp_id, product_master_id } = productItem;
//         let savedProduct;

//         try {
//           if (product_master_id) {
//             const existingProduct = await productModel.findOne({
//               Primary_user_id,
//               cmp_id,
//               product_master_id,
//             });

//             if (existingProduct) {
//               // console.log("existingProduct", existingProduct.product_name)

//               // Update the existing product
//               savedProduct = await productModel.findOneAndUpdate(
//                 {
//                   Primary_user_id,
//                   cmp_id,
//                   product_master_id,
//                 },
//                 productItem,
//                 { new: true }
//               );
//             }
//           }

//           // If no existing product was found or updated, create a new one
//           if (!savedProduct) {
//             const newProduct = new productModel(productItem);
//             savedProduct = await newProduct.save();
//           }

//           return savedProduct;
//         } catch (error) {
//           console.error(
//             `Error saving product with product_master_id ${product_master_id}:`,
//             error
//           );
//           return null; // Return null if there is an error to continue processing other products
//         }
//       })
//     );

//     // Filter out any null values from the savedProducts array
//     const successfulSaves = savedProducts.filter((product) => product !== null);

//     res.status(201).json({
//       message: "Products saved successfully",
//       savedProducts: successfulSaves,
//     });
//   } catch (error) {
//     console.error("Error:", error);
//     res.status(500).json({ error: "Internal server error" });
//   }
// };


export const saveProductsFromTally = async (req, res) => {
  try {
    const productsToSave = req?.body?.data;

    if (!productsToSave || !productsToSave.length) {
      return res.status(400).json({ message: "No products to save" });
    }

    const cmp_id = productsToSave[0]?.cmp_id;
    const Primary_user_id = productsToSave[0]?.Primary_user_id;

    // Extract all unique IDs from the products
    const brandIds = [...new Set(productsToSave.filter(p => p.brand_id).map(p => p.brand_id))];
    const categoryIds = [...new Set(productsToSave.filter(p => p.category_id).map(p => p.category_id))];
    const subcategoryIds = [...new Set(productsToSave.filter(p => p.subcategory_id).map(p => p.subcategory_id))];
    // const godownIds = [...new Set(productsToSave.filter(p => p.godown_id).map(p => p.godown_id))];
    
    // Extract all unique price level IDs from the arrays
    const priceLevelIds = [...new Set(
      productsToSave
        .filter(p => p.Priceleveles && Array.isArray(p.Priceleveles))
        .flatMap(p => p.Priceleveles.filter(pl => pl.pricelevel_id).map(pl => pl.pricelevel_id))
    )];



    // Fetch all references in parallel
    const [brands, categories, subcategories, priceLevels] = await Promise.all([
      brandIds.length > 0 ? Brand.find({ brand_id: { $in: brandIds }, cmp_id }) : [],
      categoryIds.length > 0 ? Category.find({ category_id: { $in: categoryIds }, cmp_id }) : [],
      subcategoryIds.length > 0 ? Subcategory.find({ subcategory_id: { $in: subcategoryIds }, cmp_id }) : [],
      // godownIds.length > 0 ? Godown.find({ godown_id: { $in: godownIds }, cmp_id }) : [],
      priceLevelIds.length > 0 ? PriceLevel.find({ pricelevel_id: { $in: priceLevelIds }, cmp_id }) : []
      
    ]);


    

    // Create lookup maps for faster reference resolution
    const brandMap = new Map(brands.map(b => [b.brand_id, b._id]));
    const categoryMap = new Map(categories.map(c => [c.category_id, c._id]));
    const subcategoryMap = new Map(subcategories.map(s => [s.subcategory_id, s._id]));
    // const godownMap = new Map(godowns.map(g => [g.godown_id, g._id]));
    const priceLevelMap = new Map(priceLevels.map(p => [p.pricelevel_id, p._id]));

    // Get existing products in bulk to avoid multiple queries
    const existingProductIds = productsToSave
      .filter(p => p.product_master_id)
      .map(p => p.product_master_id);

    const existingProducts = existingProductIds.length > 0 
      ? await productModel.find({ 
          product_master_id: { $in: existingProductIds }, 
          cmp_id, 
          Primary_user_id 
        })
      : [];

    const existingProductMap = new Map(
      existingProducts.map(p => [p.product_master_id, p])
    );

    // Process products in batches
    const BATCH_SIZE = 100;
    const results = [];
    
    for (let i = 0; i < productsToSave.length; i += BATCH_SIZE) {
      const batch = productsToSave.slice(i, i + BATCH_SIZE);
      const batchOperations = batch.map(productItem => {
        // Replace string IDs with MongoDB ObjectIds
        const enhancedProduct = { ...productItem };
        
        if (productItem.brand_id && brandMap.has(productItem.brand_id)) {
          enhancedProduct.brand = brandMap.get(productItem.brand_id);
        }
        
        if (productItem.category_id && categoryMap.has(productItem.category_id)) {
          enhancedProduct.category = categoryMap.get(productItem.category_id);
        }
        
        if (productItem.subcategory_id && subcategoryMap.has(productItem.subcategory_id)) {
          enhancedProduct.sub_category = subcategoryMap.get(productItem.subcategory_id);
        }
        
        // if (productItem.godown_id && godownMap.has(productItem.godown_id)) {
        //   enhancedProduct.godown = godownMap.get(productItem.godown_id);
        // }
        
        // Process price levels array
        if (productItem.Priceleveles && Array.isArray(productItem.Priceleveles)) {
          enhancedProduct.Priceleveles = productItem.Priceleveles.map(priceLevel => {
            const newPriceLevel = { ...priceLevel };
            
            if (priceLevel.pricelevel_id && priceLevelMap.has(priceLevel.pricelevel_id)) {
              // Replace pricelevel_id with MongoDB ObjectId reference
              newPriceLevel.pricelevel = priceLevelMap.get(priceLevel.pricelevel_id);
              // Remove the string ID as it's not in our schema
              delete newPriceLevel.pricelevel_id;
            }
            
            return newPriceLevel;
          });
        }
        
        // Process godown list if present
        // if (productItem.GodownList && Array.isArray(productItem.GodownList)) {
        //   enhancedProduct.GodownList = productItem.GodownList.map(godownItem => {
        //     const newGodownItem = { ...godownItem };
            
        //     if (godownItem.godown_id && godownMap.has(godownItem.godown_id)) {
        //       // Replace godown_id with MongoDB ObjectId reference
        //       newGodownItem.godown = godownMap.get(godownItem.godown_id);
        //       // Remove the string ID as it's not in our schema
        //       delete newGodownItem.godown_id;
        //     }
            
        //     return newGodownItem;
        //   });
        // }
        
        // Check if product exists
        if (productItem.product_master_id && existingProductMap.has(productItem.product_master_id)) {
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
        if (result.status === 'fulfilled') {
          results.push(result.value);
        } else {
          console.error(`Error saving product at index ${i + index}:`, result.reason);
        }
      });
    }

    // Count successful saves
    const successfulSaves = results.filter(Boolean);

    res.status(201).json({
      message: "Products saved successfully",
      savedCount: successfulSaves.length,
      totalCount: productsToSave.length
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
      product_name: product.product_name || groupedGodowns[product.product_master_id]?.product_name || "Unknown", // Fallback for missing product_name
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
              Primary_user_id: new mongoose.Types.ObjectId(group.Primary_user_id),
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
              Primary_user_id: new mongoose.Types.ObjectId(subGroup.Primary_user_id),
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
        message: 'Data must be an array' 
      });
    }
    
    // Determine which model to use based on the route
    let Model;
    let idField;
    let nameField;
    
    if (req.path.includes('/addGodowns')) {
      Model = Godown;
      idField = 'godown_id';
      nameField = 'godown';
    } else if (req.path.includes('/addPriceLevels')) {
      Model = PriceLevel;
      idField = 'pricelevel_id';
      nameField = 'pricelevel';
    } else if (req.path.includes('/addBrands')) {
      Model = Brand;
      idField = 'brand_id';
      nameField = 'brand';
    } else if (req.path.includes('/addCategory')) {
      Model = Category;
      idField = 'category_id';
      nameField = 'category';
    } else if (req.path.includes('/addSubCategory')) {
      Model = Subcategory;
      idField = 'subcategory_id';
      nameField = 'subcategory';
    } else {
      return res.status(400).json({ 
        success: false, 
        message: 'Invalid endpoint' 
      });
    }
    
    // Process each item in the data array
    const results = await Promise.all(data.map(async (item) => {
      // Check if all required fields are present
      if (!item[nameField] || !item[idField] || !item.cmp_id || !item.Primary_user_id) {
        return {
          success: false,
          message: `Missing required fields for ${nameField}`,
          data: item
        };
      }
      
      try {
        // Check if item already exists
        const existingItem = await Model.findOne({ 
          [idField]: item[idField],
          cmp_id: item.cmp_id 
        });
        
        if (existingItem) {
          // Update existing item
          await Model.findByIdAndUpdate(existingItem._id, item);
          return {
            success: true,
            message: `${nameField} updated successfully`,
            data: item
          };
        } else {
          // Create new item
          const newItem = new Model(item);
          await newItem.save();
          return {
            success: true,
            message: `${nameField} added successfully`,
            data: newItem
          };
        }
      } catch (error) {
        return {
          success: false,
          message: `Error processing ${nameField}: ${error.message}`,
          data: item
        };
      }
    }));
    
    // Count successes and failures
    const successCount = results.filter(result => result.success).length;
    const failureCount = results.length - successCount;
    
    return res.status(200).json({
      success: true,
      message: `Added/Updated ${successCount} items, Failed ${failureCount} items`,
      results
    });
    
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: `Error processing request: ${error.message}`
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




