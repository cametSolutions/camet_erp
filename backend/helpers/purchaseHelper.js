import OragnizationModel from "../models/OragnizationModel.js";
import productModel from "../models/productModel.js";
import purchaseModel from "../models/purchaseModel.js";
import TallyData from "../models/TallyData.js";
import { formatToLocalDate, truncateToNDecimals } from "./helper.js";

///////////////////////// for stock update ////////////////////////////////
export const handlePurchaseStockUpdates = async (items, session) => {
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
      item.actualCount !== undefined ? item.actualCount : item.count
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
              batch: godown.batch,
              balance_stock: newBatchStock,
              mfgdt: godown.mfgdt,
              expdt: godown.expdt,
            };

            if (godown.godown_id) {
              newGodownEntry.godown_id = godown.godown_id;
              newGodownEntry.godown = godown.godown;
            }

            const existingBatchIndex = product.GodownList.findIndex(
              (g) =>
                g.batch === godown.batch &&
                (!godown.godown_id || g.godown_id === godown.godown_id)
            );

            if (existingBatchIndex !== -1) {
              // Overwrite existing batch, add the balance_stock instead of replacing it

              const existingGodown = product.GodownList[existingBatchIndex];
              const updatedStock = truncateToNDecimals(
                existingGodown.balance_stock + newBatchStock,
                3
              );
              product.GodownList[existingBatchIndex] = {
                ...existingGodown,
                ...newGodownEntry,
                balance_stock: updatedStock,
              };
            } else {
              // Add new batch
              product.GodownList.push(newGodownEntry);
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
        } else if (godown.batch && !godown.godown_id) {
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
        } else if (godown.godown_id && godown.batch) {
          const godownIndex = product.GodownList.findIndex(
            (g) => g.batch === godown.batch && g.godown_id === godown.godown_id
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
                    "elem.godown_id": godown.godown_id,
                    "elem.batch": godown.batch,
                  },
                ],
              },
            });
          }
        } else if (godown.godown_id && !godown?.batch) {
          const godownIndex = product.GodownList.findIndex(
            (g) => g.godown_id === godown.godown_id
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
                  "GodownList.godown_id": godown.godown_id,
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
        const newGodownStock = truncateToNDecimals(
          currentGodownStock + itemCount,
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
  session
) => {
  try {
    const {
      selectedGodownId,
      selectedGodownName,
      orgId,
      party,
      despatchDetails,
      lastAmount,
      selectedDate,
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
      finalAmount: lastAmount,
      Primary_user_id,
      Secondary_user_id,
      PurchaseNumber,
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
        item.actualCount !== undefined ? item.actualCount : item.count
      );

      const productBalanceStock = parseFloat(product.balance_stock);
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
          if (godown.batch && !godown?.godown_id) {
            // Use actualCount if available, otherwise fall back to count for each godown
            const godownCount =
              godown.actualCount !== undefined
                ? godown.actualCount
                : godown.count;
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
          } else if (godown.godown_id && godown.batch) {
            // Case: Godown with Batch
            const godownIndex = product.GodownList.findIndex(
              (g) =>
                g.batch === godown.batch && g.godown_id === godown.godown_id
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
                        "elem.godown_id": godown.godown_id,
                        "elem.batch": godown.batch,
                      },
                    ],
                  },
                });
              }
            }
          } else if (godown.godown_id && !godown?.batch) {
            // Case: Godown only
            const godownIndex = product.GodownList.findIndex(
              (g) => g.godown_id === godown.godown_id
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
                      _id: product._id,
                      "GodownList.godown_id": godown.godown_id,
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
          const newGodownStock = truncateToNDecimals(
            currentGodownStock - Number(itemCount), // Revert stock by adding back
            3
          );
          return {
            ...godown,
            balance_stock: newGodownStock,
          };
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
