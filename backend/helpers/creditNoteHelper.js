import productModel from "../models/productModel.js";
import creditNoteModel from "../models/creditNoteModel.js";
import { truncateToNDecimals } from "./helper.js";

///////////////////////// for stock update ////////////////////////////////
export const handleCreditNoteStockUpdates = async (items) => {
  const productUpdates = [];
  const godownUpdates = [];

  for (const item of items) {
    const product = await productModel.findOne({ _id: item._id });
    if (!product) {
      throw new Error(`Product not found for item ID: ${item._id}`);
    }

    const itemCount = parseFloat(item.count);
    const productBalanceStock = parseFloat(product.balance_stock);
    const newBalanceStock = truncateToNDecimals(
      productBalanceStock + (itemCount || 0),
      3
    );

    console.log("itemCount: ", itemCount);
    console.log("productBalanceStock: ", productBalanceStock);
    console.log("newBalanceStock: ", newBalanceStock);

    productUpdates.push({
      updateOne: {
        filter: { _id: product._id },
        update: { $set: { balance_stock: newBalanceStock } },
      },
    });

    if (item.hasGodownOrBatch) {
      console.log("item.hasGodownOrBatch: ");

      for (const godown of item.GodownList) {
        const godownCount = parseFloat(godown.count);

      if (godown.batch && !godown.godown_id) {
          console.log("batch only ");
          const godownIndex = product.GodownList.findIndex(
            (g) => g.batch === godown.batch
          );

          if (godownIndex !== -1 && godown.count && godown.count > 0) {
            const currentGodownStock =
              product.GodownList[godownIndex].balance_stock || 0;
            const newGodownStock = truncateToNDecimals(
              currentGodownStock + godownCount,
              3
            );

            console.log("newGodownStock: ", newGodownStock);

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
          console.log("godown_id and batch ");
          const godownIndex = product.GodownList.findIndex(
            (g) => g.batch === godown.batch && g.godown_id === godown.godown_id
          );

          if (godownIndex !== -1 && godown.count && godown.count > 0) {
            const currentGodownStock =
              product.GodownList[godownIndex].balance_stock || 0;
            const newGodownStock = truncateToNDecimals(
              currentGodownStock + godownCount,
              3
            );

            console.log("currentGodownStock: ", currentGodownStock);
            console.log("newGodownStock: ", newGodownStock);

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
          console.log("godown_id only ");
          const godownIndex = product.GodownList.findIndex(
            (g) => g.godown_id === godown.godown_id
          );

          if (godownIndex !== -1 && godown.count && godown.count > 0) {
            const currentGodownStock =
              product.GodownList[godownIndex].balance_stock || 0;
            const newGodownStock = truncateToNDecimals(
              currentGodownStock + godownCount,
              3
            );

            console.log("newGodownStock: ", newGodownStock);

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

  //   console.log("godownUpdates", godownUpdates);
  //   console.log("productUpdates", productUpdates);

  await productModel.bulkWrite(productUpdates);
  await productModel.bulkWrite(godownUpdates);
};
// Helper function to create purchase record
export const createCreditNoteRecord = async (
  req,
  creditNoteNumber,
  updatedItems,
  updateAdditionalCharge
) => {
  try {
    const {
      selectedGodownId,
      selectedGodownName,
      orgId,
      party,
      despatchDetails,
      lastAmount,
    } = req.body;

    let selectedDate = req.body.selectedDate;

    if (!selectedDate) {
      selectedDate = new Date();
    }

    console.log("selectedDate: ", selectedDate);

    const Primary_user_id = req.owner;
    const Secondary_user_id = req.sUserId;

    const model = creditNoteModel;

    const lastPurchase = await model.findOne(
      {},
      {},
      { sort: { serialNumber: -1 } }
    );
    let newSerialNumber = 1;

    if (lastPurchase && !isNaN(lastPurchase.serialNumber)) {
      newSerialNumber = lastPurchase.serialNumber + 1;
    }

    console.log("creditNoteNumber: ", creditNoteNumber);

    const purchase = new model({
      selectedGodownId: selectedGodownId ?? "",
      selectedGodownName: selectedGodownName ? selectedGodownName[0] : "",
      serialNumber: newSerialNumber,
      creditNoteNumber: creditNoteNumber,
      cmp_id: orgId,
      partyAccount: party?.partyName,
      party,
      despatchDetails,
      items: updatedItems,
      additionalCharges: updateAdditionalCharge,
      finalAmount: lastAmount,
      Primary_user_id,
      Secondary_user_id,
      creditNoteNumber,
      createdAt: new Date(selectedDate) ? new Date(selectedDate) : new Date(),
    });

    const result = await purchase.save();

    return result;
  } catch (error) {
    console.error("Error in  createSaleRecord :", error);
    throw error;
  }
};

// update purchase number

export const updateCreditNoteNumber = async (orgId, secondaryUser) => {
  try {
    let creditNoteConfig = false;

    const configuration = secondaryUser.configurations.find(
      (config) => config.organization.toString() === orgId
    );

    if (configuration) {
      if (
        configuration.creditNoteConfiguration &&
        Object.entries(configuration.creditNoteConfiguration)
          .filter(([key]) => key !== "startingNumber")
          .every(([_, value]) => value !== "")
      ) {
        creditNoteConfig = true;
      }
    }

    if (creditNoteConfig === true) {
      const updatedConfiguration = secondaryUser.configurations.map(
        (config) => {
          if (config.organization.toString() === orgId) {
            return {
              ...config,
              creditNoteNumber: (config.creditNoteNumber || 0) + 1,
            };
          }
          return config;
        }
      );
      secondaryUser.configurations = updatedConfiguration;
      await secondaryUser.save();
    } else {
      await OragnizationModel.findByIdAndUpdate(
        orgId,
        { $inc: { creditNoteNumber: 1 } },
        { new: true }
      );
    }
  } catch (error) {
    console.error("Error in  updatedCreditNoteNumber :", error);
    throw error;
  }
};

// Helper function to revert stock changes
// export const revertPurchaseStockUpdates = async (items) => {
//   const productUpdates = [];
//   const godownUpdates = [];

//   for (const item of items) {
//     const product = await productModel.findOne({ _id: item._id });
//     if (!product) {
//       throw new Error(`Product not found for item ID: ${item._id}`);
//     }

//     const itemCount = parseFloat(item.count);
//     const productBalanceStock = parseFloat(product.balance_stock);
//     const newBalanceStock = truncateToNDecimals(productBalanceStock - itemCount, 3);

//     console.log("productBalanceStock", productBalanceStock);
//     console.log("newBalanceStock", newBalanceStock);

//     productUpdates.push({
//       updateOne: {
//         filter: { _id: product._id },
//         update: { $set: { balance_stock: newBalanceStock } },
//       },
//     });

//     if (item.hasGodownOrBatch) {
//       // Process godown and batch updates
//       console.log("has godown or batch");

//       for (const godown of item.GodownList) {
//         const godownCount = parseFloat(godown.count);

//         if (godown.batch && !godown.godown_id) {
//           console.log("only have batch");
//           const godownIndex = product.GodownList.findIndex(
//             (g) => g.batch === godown.batch
//           );

//           if (godownIndex !== -1) {
//             const currentGodownStock = product.GodownList[godownIndex].balance_stock || 0;
//             const newGodownStock = truncateToNDecimals(currentGodownStock - godownCount, 3);

//             console.log("currentGodownStock", currentGodownStock);
//             console.log("newGodownStock", newGodownStock);

//             godownUpdates.push({
//               updateOne: {
//                 filter: { _id: product._id, "GodownList.batch": godown.batch },
//                 update: {
//                   $set: { "GodownList.$.balance_stock": newGodownStock },
//                 },
//               },
//             });
//           }
//         } else if (godown.godown_id && godown.batch) {
//           console.log("have both godown and batch");

//           console.log("godown count",godown.godown, godownCount);

//           godownUpdates.push({
//             updateOne: {
//               filter: { _id: product._id },
//               update: {
//                 $inc: { "GodownList.$[elem].balance_stock": -godownCount },
//               },
//               arrayFilters: [
//                 {
//                   "elem.godown_id": godown.godown_id,
//                   "elem.batch": godown.batch,
//                 },
//               ],
//             },
//           });
//         } else if (godown.godown_id && !godown?.batch) {
//           console.log("only have godown");
//           godownUpdates.push({
//             updateOne: {
//               filter: {
//                 _id: product._id,
//                 "GodownList.godown_id": godown.godown_id,
//               },
//               update: {
//                 $inc: { "GodownList.$.balance_stock": -godownCount },
//               },
//             },
//           });
//         }
//       }
//     } else {

//       godownUpdates.push({
//         updateOne: {
//           filter: { _id: product._id },
//           update: { $inc: { "GodownList.$[].balance_stock": -itemCount } },
//         },
//       });
//     }
//   }

//   // await productModel.bulkWrite(productUpdates);
//   // await productModel.bulkWrite(godownUpdates);
// };

export const revertPurchaseStockUpdates = async (items) => {
  try {
    const productUpdates = [];
    const godownUpdates = [];

    for (const item of items) {
      const product = await productModel.findOne({ _id: item._id });
      if (!product) {
        throw new Error(`Product not found for item ID: ${item._id}`);
      }

      const itemCount = parseFloat(item.count);
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
            // Case: Batch only or Godown with Batch
            const godownIndex = product.GodownList.findIndex(
              (g) => g.batch === godown.batch
            );

            if (godownIndex !== -1) {
              if (godown.count && godown.count > 0) {
                const currentGodownStock =
                  product.GodownList[godownIndex].balance_stock || 0;
                const newGodownStock = truncateToNDecimals(
                  currentGodownStock - godown.count, // Revert stock by adding back
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
              if (godown.count && godown.count > 0) {
                const currentGodownStock =
                  product.GodownList[godownIndex].balance_stock || 0;
                const newGodownStock = truncateToNDecimals(
                  currentGodownStock - godown.count, // Revert stock by adding back
                  3
                );

                console.log("newGodownStock", newGodownStock);

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

            if (godownIndex !== -1) {
              if (godown.count && godown.count > 0) {
                const currentGodownStock =
                  product.GodownList[godownIndex].balance_stock || 0;
                const newGodownStock = truncateToNDecimals(
                  currentGodownStock - godown.count, // Revert stock by adding back
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
            currentGodownStock - Number(item.count), // Revert stock by adding back
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
    await productModel.bulkWrite(productUpdates);
    await productModel.bulkWrite(godownUpdates);
  } catch (error) {
    console.error("Error reverting sale stock updates:", error);
    throw error;
  }
};
