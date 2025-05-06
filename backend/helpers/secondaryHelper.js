import productModel from "../models/productModel.js";
import { truncateToNDecimals } from "../helpers/helper.js";
// import TallyData from "../models/TallyData.js";

/////////////////////// for deleting whole items in edit sale ////////////////////////////////////

export const deleteItemsInSaleEdit = async (deletedItems) => {
  try {
    for (const deletedItem of deletedItems) {
      console.log("for deleting item in edit sale", deletedItem);

      const product = await productModel.findOne({ _id: deletedItem._id });
      /////////to remove the godowns which are added false or deleted
      deletedItem.GodownList = deletedItem.GodownList.filter(
        (item) => item.added == true
      );

      if (!product) {
        console.log("editSale: product not found");
        throw new Error(`Product not found for item ID: ${deletedItem._id}`);
      }

      // Update product balance stock common
      const itemBalanceStock = Number(product.balance_stock || 0);
      const itemCount = deletedItem.count || 0;
      const itemUpdatedStock =
        Number(itemBalanceStock || 0) + Number(itemCount || 0);

      await productModel.updateOne(
        { _id: product._id },
        { $set: { balance_stock: itemUpdatedStock } }
      );

      // Update godown and batch stock if applicable

      if (deletedItem.hasGodownOrBatch) {
        for (const godown of deletedItem.GodownList) {
          if (godown.batch && !godown.godown_id) {
            const godownFound = product.GodownList.find(
              (sGodown) => sGodown.batch === godown.batch
            );
            if (godownFound) {
              const balance_stock = Number(godownFound.balance_stock || 0);
              const updatedStock =
                Number(balance_stock || 0) + Number(godown.count || 0);

              await productModel.updateOne(
                {
                  _id: product._id,
                  "GodownList.batch": godown.batch || null,
                },
                { $set: { "GodownList.$.balance_stock": updatedStock } }
              );
            } else {
              console.error("Godown not found for batch:", godown.batch);
              // Handle not found error
            }
          } else if (godown.godown_id && !godown.batch) {
            const godownFound = product.GodownList.find(
              (sGodown) => sGodown.godown_id === godown.godown_id
            );
            if (godownFound) {
              const balance_stock = Number(godownFound.balance_stock || 0);
              const updatedStock =
                Number(balance_stock || 0) + Number(godown.count || 0);

              await productModel.updateOne(
                {
                  _id: product._id,
                  "GodownList.godown_id": godown.godown_id || null,
                },
                { $set: { "GodownList.$.balance_stock": updatedStock } }
              );
            } else {
              console.error(
                "Godown not found for godown_id:",
                godown.godown_id
              );
              // Handle not found error
            }
          } else if (godown.godown_id && godown.batch) {
            const godownFound = product.GodownList.find(
              (sGodown) =>
                sGodown.godown_id === godown.godown_id &&
                sGodown.batch === godown.batch
            );
            if (godownFound) {
              const balance_stock = Number(godownFound.balance_stock || 0);
              const updatedStock =
                Number(balance_stock || 0) + Number(godown.count || 0);

              await productModel.updateOne(
                {
                  _id: product._id,
                  "GodownList.godown_id": godown.godown_id || null,
                  "GodownList.batch": godown.batch || null,
                },
                { $set: { "GodownList.$.balance_stock": updatedStock } }
              );
            } else {
              console.error(
                "Godown not found for godown_id:",
                godown.godown_id
              );
              // Handle not found error
            }
          } else {
            const balance_stock = Number(product.GodownList[0].balance_stock);
            const updatedStock = balance_stock + Number(product.count || 0);
            await productModel.updateOne(
              {
                _id: product._id,
              },
              {
                $set: {
                  "GodownList.0.balance_stock": updatedStock,
                },
              }
            );
          }
        }
      } else {
        const product_godown_balance_stock = Number(
          product.GodownList[0].balance_stock
        );

        const updatedGodownStock =
          product_godown_balance_stock + Number(itemCount || 0);

        await productModel.updateOne(
          { _id: product._id },
          {
            $set: {
              "GodownList.0.balance_stock": updatedGodownStock,
            },
          }
        );
      }
    }
  } catch (error) {
    console.error("Error in deleteItemsInSaleEdit:", error);
    // Handle general error
  }
};

/////////////////////// for deleting batches or godowns in edit sale ////////////////////////////////////

export const deleteGodownsOrBatchesInSaleEdit = async (
  deletedGodowns,
  productDetails
) => {
  try {
    for (const deletedGodown of deletedGodowns) {
      const product = await productModel.findOne({ _id: productDetails._id });

      // console.log(
      //   "for deleting godown in edit sale",
      //   deletedGodown.batch || deletedGodown.godown_id
      // );
      // // Update product balance stock common
      // const itemBalanceStock = Number(product.balance_stock || 0);
      // const itemCount = deletedGodown.count || 0;

      // console.log("itemCount",itemCount);
      // console.log("itemBalanceStock",itemBalanceStock);
      // const itemUpdatedStock =
      //   Number(itemBalanceStock || 0) + Number(itemCount || 0);
      // await productModel.updateOne(
      //   { _id: product._id },
      //   { $set: { balance_stock: itemUpdatedStock } }
      // );

      // console.log("itemUpdatedStock",itemUpdatedStock);

      if (deletedGodown.batch && !deletedGodown.godown_id) {
        const godown = product.GodownList.find(
          (sGodown) => sGodown.batch === deletedGodown.batch
        );
        if (godown) {
          const balance_stock = godown.balance_stock || 0;
          const updatedStock = balance_stock + deletedGodown.count;
          const filter = {
            _id: product._id,
            "GodownList.batch": deletedGodown.batch,
          };
          const update = {
            $set: { "GodownList.$.balance_stock": updatedStock },
          };

          try {
            const result = await productModel.updateOne(filter, update);
            // console.log("result", result);
          } catch (updateError) {
            console.error("Error updating product:", updateError);
            // Handle update error
          }
        } else {
          console.error("Godown not found for batch:", deletedGodown.batch);
          // Handle not found error
        }
      } else if (deletedGodown.godown_id && !deletedGodown.batch) {
        const godown = product.GodownList.find(
          (sGodown) => sGodown.godown_id === deletedGodown.godown_id
        );
        if (godown) {
          const balance_stock = godown.balance_stock || 0;
          const updatedStock = balance_stock + deletedGodown.count;
          const filter = {
            _id: product._id,
            "GodownList.godown_id": deletedGodown.godown_id,
          };
          const update = {
            $set: { "GodownList.$.balance_stock": updatedStock },
          };

          try {
            const result = await productModel.updateOne(filter, update);
            // console.log("result", result);
          } catch (updateError) {
            console.error("Error updating product:", updateError);
            // Handle update error
          }
        } else {
          console.error(
            "Godown not found for godown_id:",
            deletedGodown.godown_id
          );
          // Handle not found error
        }
      } else if (deletedGodown.godown_id && deletedGodown.batch) {
        const godown = product.GodownList.find(
          (sGodown) =>
            sGodown.godown_id === deletedGodown.godown_id &&
            sGodown.batch === deletedGodown.batch
        );
        if (godown) {
          const balance_stock = godown.balance_stock || 0;
          const updatedStock = balance_stock + deletedGodown.count;
          const filter = {
            _id: product._id,
            "GodownList.godown_id": deletedGodown.godown_id,
            "GodownList.batch": deletedGodown.batch,
          };
          const update = {
            $set: { "GodownList.$.balance_stock": updatedStock },
          };
          try {
            const result = await productModel.updateOne(filter, update);
            // console.log("result", result);
          } catch (updateError) {
            console.error("Error updating product:", updateError);
            // Handle update error
          }
        } else {
          console.error(
            "Godown not found for godown_id:",
            deletedGodown.godown_id
          );
          // Handle not found error
        }
      }
    }
  } catch (error) {
    console.error("Error in deleteGodownsOrBatchesInSaleEdit:", error);
    // Handle general error
  }
};

//////////////////////////////// Update salable stock (common) ////////////////////////////////////

export const updateSaleableStock = async (
  product,
  itemCount,
  existingItemCount
) => {
  try {
    const itemBalanceStock = Number(product.balance_stock || 0);
    const itemCountDiff = parseFloat(itemCount) - (existingItemCount || 0);

    console.log("itemCountDiff", itemCountDiff);
    console.log("itemBalanceStock", itemBalanceStock);

    let itemUpdatedStock;

    if (itemCountDiff > 0) {
      const absoluteCount = Math.abs(itemCountDiff);
      itemUpdatedStock = itemBalanceStock - absoluteCount;
    } else {
      const absoluteCount = Math.abs(itemCountDiff);
      itemUpdatedStock = itemBalanceStock + absoluteCount;
    }

    await productModel.updateOne(
      { _id: product._id },
      { $set: { balance_stock: itemUpdatedStock } }
    );
  } catch (error) {
    console.error("Error updating saleable stock:", error);
    // Handle error as needed
  }
};

/////////////////////////////////////for  adding a ,new  item in sale  ////////////////////////////////////

export const addingAnItemInSale = async (items) => {
  try {
    const productUpdates = [];
    const godownUpdates = [];

    for (const item of items) {
      console.log("addingAnItemInSale", item?.product_name);

      const product = await productModel.findOne({ _id: item._id });
      if (!product) {
        throw new Error(`Product not found for item ID: ${item._id}`);
      }

      const itemCount = parseFloat(item.count);
      // console.log("itemCount", itemCount);
      const productBalanceStock = parseFloat(product.balance_stock);
      const newBalanceStock = truncateToNDecimals(
        productBalanceStock - itemCount,
        3
      );
      // console.log("productBalanceStock", productBalanceStock);
      // console.log("newBalanceStock", newBalanceStock);

      productUpdates.push({
        updateOne: {
          filter: { _id: product._id },
          update: { $set: { balance_stock: newBalanceStock } },
        },
      });

      if (item.hasGodownOrBatch) {
        for (const godown of item.GodownList) {
          if (godown.batch && !godown.godown_id) {
            const godownIndex = product.GodownList.findIndex(
              (g) => g.batch === godown.batch
            );
            if (godownIndex !== -1 && godown.count && godown.count > 0) {
              const currentGodownStock =
                product.GodownList[godownIndex].balance_stock || 0;
              const newGodownStock = truncateToNDecimals(
                currentGodownStock - godown.count,
                3
              );
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
          } else if (godown.godown_id && !godown.batch) {
            const godownIndex = product.GodownList.findIndex(
              (g) => g.godown_id === godown.godown_id
            );
            if (godownIndex !== -1 && godown.count && godown.count > 0) {
              const currentGodownStock =
                product.GodownList[godownIndex].balance_stock || 0;
              const newGodownStock = truncateToNDecimals(
                currentGodownStock - godown.count,
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
          } else if (godown.godown_id && godown.batch) {
            const godownIndex = product.GodownList.findIndex(
              (g) =>
                g.godown_id === godown.godown_id && g.batch === godown.batch
            );
            if (godownIndex !== -1 && godown.count && godown.count > 0) {
              const currentGodownStock =
                product.GodownList[godownIndex].balance_stock || 0;
              const newGodownStock = truncateToNDecimals(
                currentGodownStock - godown.count,
                3
              );
              godownUpdates.push({
                updateOne: {
                  filter: { _id: product._id },
                  update: {
                    $set: { "GodownList.$[elem].balance_stock": newGodownStock },
                  },
                  arrayFilters: [
                    { "elem.godown_id": godown.godown_id, "elem.batch": godown.batch }
                  ],
                },
              });
              
            }
          }
        }
      } else {
        product.GodownList = product.GodownList.map((godown) => {
          const currentGodownStock = godown.balance_stock || 0;
          const newGodownStock = truncateToNDecimals(
            currentGodownStock - item.count,
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

    await productModel.bulkWrite(productUpdates);
    await productModel.bulkWrite(godownUpdates);
  } catch (error) {
    console.error("Error updating product and godown stock:", error);
    // Handle error as needed
  }
};

///////////////////////////////////// for  adding an new  godownorbatch in sale  ////////////////////////////////////

export const addingNewBatchesOrGodownsInSale = async (
  newBatchesOrGodowns,
  product
) => {
  try {
    for (const newBatchOrGodown of newBatchesOrGodowns) {
      if (newBatchOrGodown.batch) {
        const balance_stock =
          product.GodownList.find(
            (sGodown) => sGodown.batch === newBatchOrGodown.batch
          ).balance_stock || 0;

        const updatedStock = balance_stock - (newBatchOrGodown.count || 0);
        await productModel.updateOne(
          {
            _id: product._id,
            "GodownList.batch": newBatchOrGodown.batch || null,
          },
          { $set: { "GodownList.$.balance_stock": updatedStock } }
        );
      } else if (newBatchOrGodown.godown_id) {
        const balance_stock =
          product.GodownList.find(
            (sGodown) => sGodown.godown_id === newBatchOrGodown.godown_id
          ).balance_stock || 0;

        const updatedStock = balance_stock - (newBatchOrGodown.count || 0);
        await productModel.updateOne(
          {
            _id: product._id,
            "GodownList.godown_id": newBatchOrGodown.godown_id || null,
          },
          { $set: { "GodownList.$.balance_stock": updatedStock } }
        );
      }
    }
    console.log(
      "updateProductWithNewBatches: Product updated with new batches"
    );
  } catch (error) {
    console.error("updateProductWithNewBatches: Error updating product", error);
    throw error; // rethrowing the error for handling it in the calling function
  }
};

///////////////////////////////////// for calculating values like igst amount and updated items  ////////////////////////////////////

export const calculateUpdatedItemValues = async (
  items,
  priceLevelFromRedux
) => {
  try {
    return items.map((item) => {
      let totalPrice = item?.GodownList.reduce((acc, curr) => {
        console.log("curr?.individualTotal", curr?.individualTotal);

        return (acc = acc + Number(curr?.individualTotal));
      }, 0);
      if (item.discount) {
        // If discount is present (amount), subtract it from the total price
        totalPrice -= item.discount;
      } else if (item.discountPercentage) {
        // If discount is present (percentage), calculate the discount amount and subtract it from the total price
        const discountAmount = (totalPrice * item.discountPercentage) / 100;
        totalPrice -= discountAmount;
      }

      // Calculate tax amounts
      const { cgst, sgst, igst } = item;
      const cgstAmt = parseFloat(((totalPrice * cgst) / 100).toFixed(2));
      const sgstAmt = parseFloat(((totalPrice * sgst) / 100).toFixed(2));
      const igstAmt = parseFloat(((totalPrice * igst) / 100).toFixed(2));

      return {
        ...item,
        cgstAmt: cgstAmt,
        sgstAmt: sgstAmt,
        igstAmt: igstAmt,
        subTotal: totalPrice - (Number(igstAmt) || 0), // Optional: Include total price in the item object
      };
    });
  } catch (error) {
    console.error(
      "calculateUpdatedItems: Error calculating updated items",
      error
    );
    throw error; // rethrowing the error for handling it in the calling function
  }
};

///////////////////////////////////// for calculating values like igst amount and updated items  ////////////////////////////////////
export const updateAdditionalChargeInSale = async (
  additionalChargesFromRedux
) => {
  try {
    return additionalChargesFromRedux.map((charge) => {
      const { value, taxPercentage } = charge;

      const taxAmt = parseFloat(
        ((parseFloat(value) * parseFloat(taxPercentage)) / 100).toFixed(2)
      );

      return {
        ...charge,
        taxAmt: taxAmt,
      };
    });
  } catch (error) {
    console.error(
      "updateAdditionalChargeInSale: Error calculating additional charges",
      error
    );
    throw error; // rethrowing the error for handling it in the calling function
  }
};

export const deleteItemsInSaleOrderEdit = async (
  deletedItems,
  productUpdates
) => {
  try {
    for (const deletedItem of deletedItems) {
      console.log("for deleting item in edit saleOrder", deletedItem);

      const product = await productModel.findOne({ _id: deletedItem._id });

      if (!product) {
        console.log("editSale: product not found");
        throw new Error(`Product not found for item ID: ${deletedItem._id}`);
      }

      // Update product balance stock common
      const itemBalanceStock = Number(product.balance_stock || 0);
      const itemCount = deletedItem.count || 0;
      const itemUpdatedStock =
        Number(itemBalanceStock || 0) + Number(itemCount || 0);

      const updateOperation = {
        updateOne: {
          filter: { _id: product._id },
          update: { $set: { balance_stock: itemUpdatedStock } },
        },
      };
      // Push the update operation to the productUpdates array
      productUpdates.push(updateOperation);
    }

    return productUpdates;
  } catch (error) {
    console.error("Error in deleteItemsInSaleOrder Edit:", error);
    throw error;
  }
};

export const addingAnItemInSaleOrderEdit = async (items, productUpdates) => {
  try {
    for (const item of items) {
      console.log("addingAnItemInSaleOrder", item?.product_name);

      const product = await productModel.findOne({ _id: item._id });
      if (!product) {
        throw new Error(`Product not found for item ID: ${item._id}`);
      }

      const itemCount = parseFloat(item.count);
      // console.log("itemCount", itemCount);
      const productBalanceStock = parseFloat(product.balance_stock);
      const newBalanceStock = truncateToNDecimals(
        productBalanceStock - itemCount,
        3
      );
      // console.log("productBalanceStock", productBalanceStock);
      // console.log("newBalanceStock", newBalanceStock);

      productUpdates.push({
        updateOne: {
          filter: { _id: product._id },
          update: { $set: { balance_stock: newBalanceStock } },
        },
      });
    }

    return productUpdates;
  } catch (error) {
    console.error("Error in addingAnItemInSaleOrderEdit :", error);
    // Handle error as needed
  }
};

//////////////////////////////for extracting central number ///////////////////////////////////////////

export const extractCentralNumber = (number) => {
  try {
    const match = number.match(/^[^-]+-(\d+)-[^-]+$/);

    if (match) {
      // Remove leading zeros from the captured group
      const centralNumber = match[1].replace(/^0+/, "");
      return centralNumber;
    }

    // If the number doesn't match the pattern, return it as is
    return number;
  } catch (error) {
    console.error("Error extracting central number:", error);
    throw error;
  }
};

////////////////////////////// checkForNumberExistence ///////////////////////////////////////////

export const checkForNumberExistence = async (
  model,
  fieldName,
  newValue,
  cmp_id,
  session

) => {
  try {
    // const centralNumber = parseInt(newValue, 10);
    // const regex = new RegExp(`^(${centralNumber}|.*-(0*${centralNumber})-.*)$`);
    const docs = await model.find({
      [fieldName]: newValue,
      cmp_id: cmp_id,
    }).session(session);

    console.log(docs.map((el) => el[fieldName]));
    return docs.length > 0;
  } catch (error) {
    console.log("Error checking for number existence:", error);
    throw error;
  }
};

export const getNewSerialNumber = async (model, serialNumber, session) => {
  try {
    const lastDocument = await model.findOne(
      {},
      {},
      {
        sort: { [serialNumber]: -1 },
        session: session  // Adding session to the query
      }
    );

    let newSerialNumber = 1;

    if (lastDocument && !isNaN(lastDocument[serialNumber])) {
      newSerialNumber = lastDocument[serialNumber] + 1;
    }

    return newSerialNumber;
  } catch (error) {
    console.error(
      `Error in getNewSerialNumber for model ${model.modelName}:`,
      error
    );
    throw new Error("Error calculating new serial number");
  }
};


////////////////////////////// revertBalanceStockOfSalesOrder ///////////////////////////////////////////

export const revertBalanceStockOfSalesOrder = async (items) => {
  try {
    const revertStock = items?.map(async (item) => {
      let product = await productModel.findById(item?._id);
      if (!product) {
        throw new Error(`Product not found for item ID: ${item?._id}`);
      }

      let itemCount = parseFloat(item?.count || 0);

      let productBalanceStock = parseFloat(product?.balance_stock || 0);
      let newBalanceStock = truncateToNDecimals(
        productBalanceStock + itemCount,
        3
      );


      await productModel.updateOne(
        { _id: item?._id },
        { $set: { balance_stock: newBalanceStock } }
      );

      return product;
    });

    await Promise.all(revertStock);
  } catch (error) {
    console.error("Error in reverting stock levels:", error);
    throw error;
  }
};

////////////////////////////// revertStockUpdatesSales ///////////////////////////////////////////


export const revertStockUpdatesSales = async (items) => {
  try {
    const productUpdates = [];
    const godownUpdates = [];

    for (const item of items) {
      const product = await productModel.findById(item._id);
      if (!product) {
        throw new Error(`Product not found for item ID: ${item._id}`);
      }

      const itemCount = parseFloat(item.count);
      const productBalanceStock = parseFloat(product.balance_stock);
      const newBalanceStock = truncateToNDecimals(productBalanceStock + itemCount, 3);

      // Prepare product update operation
      productUpdates.push({
        updateOne: {
          filter: { _id: product._id },
          update: { $set: { balance_stock: newBalanceStock } },
        },
      });

      // Process godown and batch updates
      if (item.hasGodownOrBatch) {
        for (const godown of item.GodownList) {
          if (item?.batchEnabled && !item?.gdnEnabled) {
            // Batch only
            const godownIndex = product.GodownList.findIndex(
              (g) => g.batch === godown.batch
            );

            if (godownIndex !== -1) {
              if (godown.count && godown.count > 0) {
                const currentGodownStock = product.GodownList[godownIndex].balance_stock || 0;
                const newGodownStock = truncateToNDecimals(currentGodownStock + godown.count, 3);

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
            // Godown with Batch
            const godownIndex = product.GodownList.findIndex(
              (g) => g.batch === godown.batch && g.godown_id === godown.godown_id
            );

            if (godownIndex !== -1) {
              if (godown.count && godown.count > 0) {
                const currentGodownStock = product.GodownList[godownIndex].balance_stock || 0;
                const newGodownStock = truncateToNDecimals(currentGodownStock + godown.count, 3);

                // Prepare godown update operation
                godownUpdates.push({
                  updateOne: {
                    filter: {
                      _id: product._id,
                      "GodownList.batch": godown.batch,
                      "GodownList.godown_id": godown.godown_id,
                    },
                    update: {
                      $set: { "GodownList.$.balance_stock": newGodownStock },
                    },
                  },
                });
              }
            }
          } else if (godown.godown_id && !godown?.batch) {
            // Godown only
            const godownIndex = product.GodownList.findIndex(
              (g) => g.godown_id === godown.godown_id
            );

            if (godownIndex !== -1) {
              if (godown.count && godown.count > 0) {
                const currentGodownStock = product.GodownList[godownIndex].balance_stock || 0;
                const newGodownStock = truncateToNDecimals(currentGodownStock + godown.count, 3);

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
        // No Godown
        product.GodownList = product.GodownList.map((godown) => {
          const currentGodownStock = godown.balance_stock || 0;
          const newGodownStock = truncateToNDecimals(currentGodownStock + item.count, 3);
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

    await productModel.bulkWrite(productUpdates);
    await productModel.bulkWrite(godownUpdates);
  } catch (error) {
    console.error("Error in reverting stock updates:", error);
    throw error;
  }
};