// Modified helper functions to support MongoDB transactions

import OragnizationModel from "../models/OragnizationModel.js";
import productModel from "../models/productModel.js";
import stockTransferModel from "../models/stockTransferModel.js";
import { formatToLocalDate } from "./stockTransferHelper.js";

//////////////////////////balance stock updation as of stock transfer ///////////////////

export const processStockTransfer = async (transferData) => {
  const {
    stockTransferNumber,
    stockTransferToGodown,
    items,
    session, // Pass session to all database operations
  } = transferData;

  const selectedGodown = stockTransferToGodown?.godown;
  const selectedGodownId = stockTransferToGodown?._id;

  try {
    const updatedProducts = [];

    for (const item of items) {
      const product = await productModel.findById(item._id).session(session);
      const destinationProduct = product;
      if (!product) {
        throw new Error(`Product not found: ${item._id}`);
      }

      const sourceGodowns = item.GodownList.filter((g) => g.added === true);
      if (sourceGodowns.length === 0) {
        throw new Error(`No source godowns found for product: ${item._id}`);
      }

      sourceGodowns.forEach((sourceGodown) => {
        const transferCount = sourceGodown.actualCount ?? sourceGodown.count;

        let sourceGodownInProduct = product.GodownList.find((g) => {
          if (item?.batchEnabled) {
            return (
              g.godown.toString() === sourceGodown.godownMongoDbId &&
              g.batch === sourceGodown.batch
            );
          } else {
            return g.godown.toString() === sourceGodown.godownMongoDbId;
          }
        });

        if (sourceGodownInProduct) {
          sourceGodownInProduct.balance_stock -= transferCount;
        }

        // console.log( "destinationProduct",destinationProduct);

        let destGodown = destinationProduct.GodownList.find((g) => {
          if (sourceGodown.batch) {
            return (
              g?.godown?.toString() === selectedGodownId &&
              g?.batch === sourceGodown?.batch
            );
          } else {
            return g?.godown?.toString() === selectedGodownId;
          }
        });

        if (destGodown) {
          destGodown.balance_stock += transferCount;
        } else {
          const newGodown = {
            balance_stock: transferCount,
            godown: selectedGodown,
            godown_id: selectedGodownId,
          };

          if (sourceGodown.batch) {
            newGodown.godown = selectedGodownId;
            newGodown.batch = sourceGodown.batch;
            newGodown.mfgdt = sourceGodown.mfgdt ?? null;
            newGodown.expdt = sourceGodown.expdt ?? null;
          }

          product.GodownList.push(newGodown);
        }
      });

      // Use the session for the database update
      const update = await productModel.findByIdAndUpdate(
        product._id,
        product,
        { session }
      );

      updatedProducts.push(product);
    }

    return updatedProducts;
  } catch (error) {
    console.error("Error in stock transfer helper:", error);
    throw error; // Re-throw the error to be handled by the controller
  }
};

//////////////////////////  creation of stock transfer document ///////////////////
export const handleStockTransfer = async ({
  stockTransferNumber,
  selectedDate,
  orgId,
  stockTransferToGodown,
  items,
  lastAmount,
  serialNumber,
  req,
  session,
}) => {
  try {
    const newStockTransfer = new stockTransferModel({
      serialNumber,
      date: await formatToLocalDate(selectedDate, orgId),
      stockTransferNumber,
      Primary_user_id: req.owner.toString(),
      Secondary_user_id: req.sUserId,
      cmp_id: orgId,
      stockTransferToGodown,
      items,
      finalAmount: lastAmount,
      createdAt: new Date(),
    });

    // Use the session for saving
    const result = await newStockTransfer.save({ session });
    return result;
  } catch (error) {
    console.error("Error creating stock transfer:", error);
    throw error;
  }
};

////////////////////////// Revert stock levels affected by an existing transfer ///////////////////

export const revertStockTransfer = async (existingTransfer, session) => {
  const {
    items,
    stockTransferToGodown: { _id: selectedGodownId },
  } = existingTransfer;

  for (const item of items) {
    const product = await productModel.findById(item._id).session(session);
    if (!product) {
      throw new Error(`Product not found: ${item._id}`);
    }

    const sourceGodowns = item.GodownList.filter((g) => g.added === true);
    if (sourceGodowns.length === 0) {
      throw new Error(`No source godowns found for product: ${item._id}`);
    }

    sourceGodowns.forEach((sourceGodown) => {
      const revertCount = sourceGodown.count;

      let sourceGodownInProduct = product.GodownList.find((g) => {
        if (item?.batchEnabled) {
          return (
            g.godown.toString() === sourceGodown.godownMongoDbId.toString() &&
            g.batch === sourceGodown.batch
          );
        } else {
          return (
            g.godown.toString() === sourceGodown.godownMongoDbId.toString()
          );
        }
      });

      if (sourceGodownInProduct) {
        sourceGodownInProduct.balance_stock += revertCount;
      }

      let destGodown = product.GodownList.find((g) => {
        if (sourceGodown.batch) {
          return (
            g.godown.toString() === selectedGodownId.toString() &&
            g.batch === sourceGodown.batch
          );
        } else {
          return g.godown.toString() === selectedGodownId.toString();
        }
      });

      if (destGodown) {
        destGodown.balance_stock -= revertCount;
      }
    });

    // Use session for the update
    await productModel.updateOne({ _id: product._id }, product, { session });
  }
};

//////////////////////////////// increaseStockTransferNumber /////////////////////////////////////

export const increaseStockTransferNumber = async (
  secondaryUser,
  orgId,
  session
) => {
  try {
    let stConfig = false;

    const configuration = secondaryUser.configurations.find(
      (config) => config.organization.toString() === orgId
    );

    if (!configuration) {
      console.log("Configuration not found for orgId:", orgId);
    } else {
      if (configuration.stockTransferConfiguration) {
        stConfig = true;
      }
    }

    if (stConfig) {
      const updatedConfiguration = secondaryUser.configurations.map(
        (config) => {
          if (config.organization.toString() === orgId) {
            const newStockTransferNumber =
              (config.stockTransferNumber || 0) + 1;
            console.log(
              "Updating stockTransferNumber from",
              config.stockTransferNumber,
              "to",
              newStockTransferNumber
            );

            return {
              ...config,
              stockTransferNumber: newStockTransferNumber,
            };
          }
          return config;
        }
      );

      secondaryUser.configurations = updatedConfiguration;
      await secondaryUser.save({ session });
    } else {
      // Use session for organization update
      const updatedOrganization = await OragnizationModel.findByIdAndUpdate(
        orgId,
        { $inc: { stockTransferNumber: 1 } },
        { new: true, session }
      );
    }
  } catch (error) {
    console.log("Error in increaseStockTransferNumber:", error);
    throw error; // Re-throw to ensure transaction is aborted
  }
};

// Helper functions that need to be modified to support transactions

export const checkForNumberExistence = async (
  model,
  field,
  value,
  orgId,
  session
) => {
  const query = { [field]: value, cmp_id: orgId };
  const result = await model.findOne(query).session(session);
  return result !== null;
};

export const getNewSerialNumber = async (model, field, session) => {
  const lastRecord = await model
    .findOne()
    .sort({ [field]: -1 })
    .session(session);

  return lastRecord ? lastRecord[field] + 1 : 1;
};
