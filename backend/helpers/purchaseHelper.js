import mongoose from "mongoose";
import OragnizationModel from "../models/OragnizationModel.js";
import productModel from "../models/productModel.js";
import purchaseModel from "../models/purchaseModel.js";
import TallyData from "../models/TallyData.js";
import { formatToLocalDate, truncateToNDecimals } from "./helper.js";

///////////////////////// for stock update ////////////////////////////////
export const handlePurchaseStockUpdates = async (
  items,
  session,
  purchaseNumber,
  purchase_id
) => {
  const productUpdates = [];
  const godownUpdates = [];

  for (const item of items) {
    const product = await productModel
      .findOne({ _id: item._id })
      .session(session);
    if (!product) {
      throw new Error(`Product not found for item ID: ${item._id}`);
    }

    // Use actualCount if available, otherwise fall back to count
    const itemCount = parseFloat(
      item.actualCount !== undefined ? item.totalActualCount : item.totalCount
    );
    const productBalanceStock = parseFloat(product.balance_stock);
    const newBalanceStock = truncateToNDecimals(
      productBalanceStock + (itemCount || 0),
      3
    );

    productUpdates.push({
      updateOne: {
        filter: { _id: product._id },
        update: { $set: { balance_stock: newBalanceStock } },
      },
    });

    if (item.hasGodownOrBatch) {
      for (const godown of item.GodownList) {
        // Use actualCount if available, otherwise fall back to count for each godown
        const godownCount =
          godown.actualCount !== undefined ? godown.actualCount : godown.count;

        if (godown.newBatch) {

          if (godownCount > 0) {
            // Handle new batch logic
            const newBatchStock = truncateToNDecimals(godownCount, 3);
            const newGodownEntry = {
              batch: godown?.batch,
              balance_stock: godownCount || 0,
              mfgdt: godown?.mfgdt,
              expdt: godown?.expdt,
              warrantyCardNo: godown?.warrantyCardNo,
              supplierName: godown?.supplierName,
              voucherNumber: godown?.voucherNumber,
              purchase_price: godown?.purchase_price,
              purchase_cost: godown?.purchase_cost,
              hsn_code: godown?.hsn_code,
              mrp: godown?.mrp,
              newBatch: true,
              created_by: {
                voucherType: "purchase",
                voucherNumber: purchaseNumber,
                voucher_id: purchase_id,
              },
            };

            if (godown.godownMongoDbId) {
              newGodownEntry.godown = godown?.godownMongoDbId;
            }

            console.log("newGodownEntry", newGodownEntry);

            const existingBatchIndex = product.GodownList.findIndex((g) => {
              if (godown.godownMongoDbId) {
                return (
                  g.batch === godown.batch &&
                  g.godown.toString() === godown.godownMongoDbId.toString()
                );
              } else {
                return g.batch === godown.batch;
              }
            });

            if (existingBatchIndex === -1) {
              product.GodownList.push(newGodownEntry);
            } else {
              throw new Error(
                `Batch already exists for product: ${product._id}`
              );
            }

            godownUpdates.push({
              updateOne: {
                filter: { _id: product._id },
                update: { $set: { GodownList: product.GodownList } },
              },
            });
          } else {
            console.log(
              `Skipping new batch for godown as count is not greater than zero: ${godownCount}`
            );
          }
        } else if (item?.batchEnabled && !item?.gdnEnabled) {
          const godownIndex = product.GodownList.findIndex(
            (g) => g.batch === godown.batch
          );

          if (godownIndex !== -1 && godownCount && godownCount > 0) {
            const currentGodownStock =
              product.GodownList[godownIndex].balance_stock || 0;
            const newGodownStock = truncateToNDecimals(
              currentGodownStock + godownCount,
              3
            );

            godownUpdates.push({
              updateOne: {
                filter: { _id: product._id, "GodownList.batch": godown.batch },
                update: {
                  $set: { "GodownList.$.balance_stock": newGodownStock },
                },
              },
            });
          }
        } else if (item?.batchEnabled && item?.gdnEnabled) {
          const godownIndex = product.GodownList.findIndex(
            (g) =>
              g.batch === godown.batch &&
              g?.godown?.toString() === godown?.godownMongoDbId?.toString()
          );

          if (godownIndex !== -1 && godownCount && godownCount > 0) {
            const currentGodownStock =
              product.GodownList[godownIndex].balance_stock || 0;
            const newGodownStock = truncateToNDecimals(
              currentGodownStock + godownCount,
              3
            );

            godownUpdates.push({
              updateOne: {
                filter: { _id: product._id },
                update: {
                  $set: { "GodownList.$[elem].balance_stock": newGodownStock },
                },
                arrayFilters: [
                  {
                    "elem.godown": new mongoose.Types.ObjectId(
                      godown.godownMongoDbId
                    ),
                    "elem.batch": godown.batch,
                  },
                ],
              },
            });
          }
        } else if (!item?.batchEnabled && item?.gdnEnabled) {
          const godownIndex = product.GodownList.findIndex(
            (g) => g.godown.toString() == godown.godownMongoDbId
          );

          if (godownIndex !== -1 && godownCount && godownCount > 0) {
            const currentGodownStock =
              product.GodownList[godownIndex].balance_stock || 0;
            const newGodownStock = truncateToNDecimals(
              currentGodownStock + godownCount,
              3
            );

            godownUpdates.push({
              updateOne: {
                filter: {
                  _id: product._id,
                  "GodownList.godown": new mongoose.Types.ObjectId(
                    godown.godownMongoDbId
                  ),
                },
                update: {
                  $set: { "GodownList.$.balance_stock": newGodownStock },
                },
              },
            });
          }
        }
      }
    } else {
      product.GodownList = product.GodownList.map((godown) => {
        const currentGodownStock = Number(godown.balance_stock) || 0;
        const currentGodown = item?.GodownList[0];

        const godownCount =
          (currentGodown.actualCount !== undefined
            ? currentGodown.actualCount
            : currentGodown.count) || 0;
        const newGodownStock = truncateToNDecimals(
          Number(currentGodownStock) + Number(godownCount),
          3
        );

        return { ...godown, balance_stock: newGodownStock };
      });

      godownUpdates.push({
        updateOne: {
          filter: { _id: product._id },
          update: { $set: { GodownList: product.GodownList } },
        },
      });
    }
  }

  await productModel.bulkWrite(productUpdates, { session });
  await productModel.bulkWrite(godownUpdates, { session });
};
// Helper function to create purchase record
export const createPurchaseRecord = async (
  req,
  PurchaseNumber,
  updatedItems,
  updateAdditionalCharge,
  session,
  purchase_id
) => {
  try {
    const {
      selectedGodownId,
      selectedGodownName,
      orgId,
      party,
      despatchDetails,
      finalAmount: lastAmount,
      selectedDate,
      series_id,
      usedSeriesNumber,
      note
    } = req.body;

    const Primary_user_id = req.owner;
    const Secondary_user_id = req.sUserId;

    const model = purchaseModel;

    const lastPurchase = await model.findOne(
      {},
      {},
      { sort: { serialNumber: -1 }, session }
    );
    let newSerialNumber = 1;

    if (lastPurchase && !isNaN(lastPurchase.serialNumber)) {
      newSerialNumber = lastPurchase.serialNumber + 1;
    }

    const purchase = new model({
      _id: new mongoose.Types.ObjectId(purchase_id),
      selectedGodownId: selectedGodownId ?? "",
      selectedGodownName: selectedGodownName ? selectedGodownName[0] : "",
      serialNumber: newSerialNumber,
      purchaseNumber: PurchaseNumber,
      cmp_id: orgId,
      partyAccount: party?.partyName,
      party,
      despatchDetails,
      items: updatedItems,
      additionalCharges: updateAdditionalCharge,
      note,
      finalAmount: lastAmount,
      Primary_user_id,
      Secondary_user_id,
      PurchaseNumber,
      series_id,
      usedSeriesNumber,
      date: await formatToLocalDate(selectedDate, orgId, session),
      createdAt: new Date(),
    });

    const result = await purchase.save({ session });

    return result;
  } catch (error) {
    console.error("Error in  createSaleRecord :", error);
    throw error;
  }
};

// update purchase number

export const updatePurchaseNumber = async (orgId, secondaryUser, session) => {
  try {
    let purchaseConfig = false;

    const configuration = secondaryUser.configurations.find(
      (config) => config.organization.toString() === orgId
    );

    if (configuration) {
      purchaseConfig = true;
    }
    if (purchaseConfig === true) {
      const updatedConfiguration = secondaryUser.configurations.map(
        (config) => {
          if (config.organization.toString() === orgId) {
            return {
              ...config,
              purchaseNumber: (config.purchaseNumber || 0) + 1,
            };
          }
          return config;
        }
      );
      secondaryUser.configurations = updatedConfiguration;
      await secondaryUser.save({ session });
    } else {
      await OragnizationModel.findByIdAndUpdate(
        orgId,
        { $inc: { purchaseNumber: 1 } },
        { new: true, session }
      );
    }
  } catch (error) {
    console.error("Error in  updatePurchaseNumber :", error);
    throw error;
  }
};

// Revert purchase stock updates
export const revertPurchaseStockUpdates = async (items, session) => {
  try {
    const productUpdates = [];
    const godownUpdates = [];

    for (const item of items) {
      const product = await productModel
        .findOne({ _id: item._id })
        .session(session);
      if (!product) {
        throw new Error(`Product not found for item ID: ${item._id}`);
      }

      // Use actualCount if available, otherwise fall back to count
      const itemCount = parseFloat(
        item.actualCount !== undefined ? item.totalActualCount : item.totalCount
      );

      const productBalanceStock = parseFloat(product?.balance_stock);
      const newBalanceStock = truncateToNDecimals(
        productBalanceStock - itemCount, // Revert stock by adding back
        3
      );

      // Prepare product update operation
      productUpdates.push({
        updateOne: {
          filter: { _id: product._id },
          update: { $set: { balance_stock: newBalanceStock } },
        },
      });

      // Revert godown and batch updates
      if (item.hasGodownOrBatch) {
        for (const godown of item.GodownList) {
          // Use actualCount if available, otherwise fall back to count for each godown
          const godownCount =
            godown.actualCount !== undefined
              ? godown.actualCount
              : godown.count;
          if (item?.batchEnabled && !item?.gdnEnabled) {
            // Case: Batch only or Godown with Batch
            const godownIndex = product.GodownList.findIndex(
              (g) => g.batch === godown.batch
            );

            if (godownIndex !== -1) {
              if (godownCount && godownCount > 0) {
                const currentGodownStock =
                  product.GodownList[godownIndex].balance_stock || 0;
                const newGodownStock = truncateToNDecimals(
                  currentGodownStock - godownCount, // Revert stock by adding back
                  3
                );

                // Prepare godown update operation
                godownUpdates.push({
                  updateOne: {
                    filter: {
                      _id: product._id,
                      "GodownList.batch": godown.batch,
                    },
                    update: {
                      $set: { "GodownList.$.balance_stock": newGodownStock },
                    },
                  },
                });
              }
            }
          } else if (item?.batchEnabled && item?.gdnEnabled) {
            // Case: Godown with Batch
            const godownIndex = product.GodownList.findIndex(
              (g) =>
                g.batch === godown.batch &&
                g?.godown?.toString() === godown?.godownMongoDbId?.toString()
            );
            if (godownIndex !== -1) {
              if (godownCount && godownCount > 0) {
                const currentGodownStock =
                  product.GodownList[godownIndex].balance_stock || 0;
                const newGodownStock = truncateToNDecimals(
                  currentGodownStock - godownCount, // Revert stock by adding back
                  3
                );

                // Prepare godown update operation
                godownUpdates.push({
                  updateOne: {
                    filter: { _id: product._id },
                    update: {
                      $set: {
                        "GodownList.$[elem].balance_stock": newGodownStock,
                      },
                    },
                    arrayFilters: [
                      {
                        "elem.godown": new mongoose.Types.ObjectId(
                          godown.godownMongoDbId
                        ),
                        "elem.batch": godown.batch,
                      },
                    ],
                  },
                });
              }
            }
          } else if (!item?.batchEnabled && item?.gdnEnabled) {
            // Case: Godown only
            const godownIndex = product.GodownList.findIndex(
              (g) => g.godown.toString() == godown.godownMongoDbId
            );

            // Use actualCount if available, otherwise fall back to count for each godown
            const godownCount =
              godown.actualCount !== undefined
                ? godown.actualCount
                : godown.count;

            if (godownIndex !== -1) {
              if (godownCount && godownCount > 0) {
                const currentGodownStock =
                  product.GodownList[godownIndex].balance_stock || 0;
                const newGodownStock = truncateToNDecimals(
                  currentGodownStock - godownCount, // Revert stock by adding back
                  3
                );

                // Prepare godown update operation
                godownUpdates.push({
                  updateOne: {
                    filter: {
                      "GodownList.godown": new mongoose.Types.ObjectId(
                        godown.godownMongoDbId
                      ),
                    },
                    update: {
                      $set: { "GodownList.$.balance_stock": newGodownStock },
                    },
                  },
                });
              }
            }
          }
        }
      } else {
        // Case: No Godown
        product.GodownList = product.GodownList.map((godown) => {
          const currentGodownStock = Number(godown.balance_stock) || 0;
          const currentGodown = item?.GodownList[0];

          const godownCount =
            (currentGodown.actualCount !== undefined
              ? currentGodown.actualCount
              : currentGodown.count) || 0;
          const newGodownStock = truncateToNDecimals(
            Number(currentGodownStock) - Number(godownCount),
            3
          );

          return { ...godown, balance_stock: newGodownStock };
        });
        // Prepare godown update operation
        godownUpdates.push({
          updateOne: {
            filter: { _id: product._id },
            update: { $set: { GodownList: product.GodownList } },
          },
        });
      }
    }

    // Execute bulk operations to revert stock changes
    await productModel.bulkWrite(productUpdates, { session });
    await productModel.bulkWrite(godownUpdates, { session });
  } catch (error) {
    console.error("Error reverting sale stock updates:", error);
    throw error;
  }
};

/// Update Tally Data
export const updateTallyData = async (
  orgId,
  purchaseNumber,
  billId,
  Primary_user_id,
  party,
  lastAmount,
  secondaryMobile,
  session
) => {
  try {
    const billData = {
      Primary_user_id,
      bill_no: purchaseNumber,
      billId: billId.toString(),
      cmp_id: orgId,
      party_id: party?.party_master_id,
      accountGroup: party?.accountGroup,
      accountGroup_id: party?.accountGroup_id,
      subGroup: party?.subGroup,
      subGroup_id: party?.subGroup_id,
      bill_amount: lastAmount,
      bill_date: new Date(),
      bill_pending_amt: lastAmount,
      email: party?.emailID,
      mobile_no: party?.mobileNumber,
      party_name: party?.partyName,
      user_id: secondaryMobile || "null",
      source: "purchase",
      classification: "Cr",
    };

    const tallyUpdate = await TallyData.findOneAndUpdate(
      {
        cmp_id: orgId,
        bill_no: purchaseNumber,
        billId: billId.toString(),
        Primary_user_id: Primary_user_id,
        party_id: party?.party_master_id,
      },
      billData,
      { upsert: true, new: true, session }
    );
  } catch (error) {
    console.error("Error updateTallyData sale stock updates:", error);
    throw error;
  }
};

/// remove new batch which are added during creating purchase

export const removeNewBatchCreatedByThisPurchase = async (
  existingPurchase,
  session
) => {
  const purchase_id = existingPurchase._id;
  const items = existingPurchase.items;

  const productUpdates = [];

  // First find the items with new batch
  const newBatchProductIds = [];

  for (const item of items) {
    for (const godown of item?.GodownList || []) {
      if (godown.newBatch && godown.newBatch === true) {
        newBatchProductIds.push(item._id);
        break; // Once we find a new batch for this item, we can add its ID and move on
      }
    }
  }

  if (newBatchProductIds.length === 0) {
    console.log("No new batches found for this purchase");
    return; // Early return if no new batches
  }

  // Then find the products with new batch
  const products = await productModel
    .find({ _id: { $in: newBatchProductIds } })
    .session(session);

  console.log(`Found ${products.length} products with new batches to update`);

  // For each product, remove ALL godown entries that match this purchase_id
  for (const product of products) {
    const originalLength = product.GodownList?.length || 0;

    // Filter out all batches created by this purchase
    product.GodownList = product.GodownList.filter((godown) => {
      return (
        godown?.created_by?.voucher_id?.toString() !== purchase_id.toString()
      );
    });

    // console.log( product.GodownList);

    const removedCount = originalLength - product.GodownList.length;

    // console.log("removedCount",removedCount);

    if (removedCount > 0) {
      console.log(
        `Removed ${removedCount} batches from product ${product._id}`
      );

      productUpdates.push({
        updateOne: {
          filter: { _id: product._id },
          update: { $set: { GodownList: product.GodownList } },
        },
      });
    }
  }

  // Then update the products
  if (productUpdates.length > 0) {
    const result = await productModel.bulkWrite(productUpdates, { session });
    console.log(`Updated ${result.modifiedCount} products`);
  } else {
    console.log("No products needed updating");
  }
};
