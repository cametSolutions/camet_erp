import OragnizationModel from "../models/OragnizationModel.js";
import productModel from "../models/productModel.js";
import purchaseModel from "../models/purchaseModel.js";
import { truncateToNDecimals } from "./helper.js";

export const handlePurchaseStockUpdates = async (items) => {
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

        if (godown.newBatch) {
          console.log("newBatch object: ", godown);

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
       

            const existingGodown=product.GodownList[existingBatchIndex];
            const updatedStock=truncateToNDecimals(existingGodown.balance_stock+newBatchStock,3);
            product.GodownList[existingBatchIndex]={
              ...existingGodown,
              ...newGodownEntry,
              balance_stock:updatedStock
            }
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
        } else if (godown.batch && !godown.godown_id) {
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

export const createPurchaseRecord = async (
  req,
  PurchaseNumber,
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

    const model = purchaseModel;

    const lastPurchase = await model.findOne(
      {},
      {},
      { sort: { serialNumber: -1 } }
    );
    let newSerialNumber = 1;

    if (lastPurchase && !isNaN(lastPurchase.serialNumber)) {
      newSerialNumber = lastPurchase.serialNumber + 1;
    }

    console.log("PurchaseNumber: ", PurchaseNumber);
    

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
      priceLevel: req.body.priceLevelFromRedux,
      additionalCharges: updateAdditionalCharge,
      finalAmount: lastAmount,
      Primary_user_id,
      Secondary_user_id,
      PurchaseNumber,
      createdAt: new Date(selectedDate) ? new Date(selectedDate) : new Date(),
    });

    const result = await purchase.save();

    return result;
  } catch (error) {
    console.error("Error in  createSaleRecord :", error);
    throw error;
  }
};

export const updatePurchaseNumber = async (orgId, secondaryUser) => {
  try {
    let purchaseConfig = false;

    const configuration = secondaryUser.configurations.find(
      (config) => config.organization.toString() === orgId
    );

    // if (configuration) {
    //   if (
    //     configuration.purchaseConfiguration &&
    //     Object.entries(configuration.purchaseConfiguration)
    //       .filter(([key]) => key !== "startingNumber")
    //       .every(([_, value]) => value !== "")
    //   ) {
    //     purchaseConfig = true;
    //   }
    // }
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
      await secondaryUser.save();
    } else {
      await OragnizationModel.findByIdAndUpdate(
        orgId,
        { $inc: { purchaseNumber: 1 } },
        { new: true }
      );
    }
  } catch (error) {

      console.error("Error in  updatePurchaseNumber :", error);
      throw error;
  }
};



