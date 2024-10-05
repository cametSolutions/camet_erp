import OragnizationModel from "../models/OragnizationModel.js";
import productModel from "../models/productModel.js";
import stockTransferModel from "../models/stockTransferModel.js";

//////////////////////////balance stock updation asd of stock transfer ///////////////////

export const processStockTransfer = async ({
  selectedDate,
  selectedGodown,
  selectedGodownId,
  items,
  session,
}) => {
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
        const transferCount = sourceGodown.count;

        let sourceGodownInProduct = product.GodownList.find((g) => {
          if (sourceGodown.batch) {
            return (
              g.godown_id === sourceGodown.godown_id &&
              g.batch === sourceGodown.batch
            );
          } else {
            return g.godown_id === sourceGodown.godown_id;
          }
        });

        if (sourceGodownInProduct) {
          sourceGodownInProduct.balance_stock -= transferCount;
        }

        let destGodown = destinationProduct.GodownList.find((g) => {
          if (sourceGodown.batch) {
            return (
              g.godown_id === selectedGodownId && g.batch === sourceGodown.batch
            );
          } else {
            return g.godown_id === selectedGodownId;
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
            newGodown.batch = sourceGodown.batch;
            newGodown.mfgdt = sourceGodown.mfgdt ?? null;
            newGodown.expdt = sourceGodown.expdt ?? null;
          }

          product.GodownList.push(newGodown);
        }
      });

      const update = await productModel
        .findByIdAndUpdate(product._id, product, { new: true })
        .session(session);

      updatedProducts.push(update);
    }

    return updatedProducts;
  } catch (error) {
    console.error("Error in stock transfer helper:", error);
    throw error;
  }
};

//////////////////////////  creation of stock transfer document ///////////////////
export const handleStockTransfer = async ({
  stockTransferNumber,
  selectedDate,
  orgId,
  selectedGodown,
  selectedGodownId,
  items,
  lastAmount,
  serialNumber,
  req,
  session,
}) => {
  try {
    const newStockTransfer = new stockTransferModel({
      serialNumber,
      stockTransferNumber,
      Primary_user_id: req.owner.toString(),
      Secondary_user_id: req.sUserId,
      cmp_id: orgId,
      selectedGodown,
      selectedGodownId,
      items,
      finalAmount: lastAmount,
      createdAt: selectedDate,
    });

    const result = await newStockTransfer.save({ session });
    return result;
  } catch (error) {
    console.error("Error creating stock transfer:", error);
    throw error;
  }
};
////////////////////////// Revert stock levels affected by an existing transfer ///////////////////

export const revertStockTransfer = async (existingTransfer, session) => {
  const { items, selectedGodownId } = existingTransfer;

  try {
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
          if (sourceGodown.batch) {
            return (
              g.godown_id === sourceGodown.godown_id &&
              g.batch === sourceGodown.batch
            );
          } else {
            return g.godown_id === sourceGodown.godown_id;
          }
        });

        if (sourceGodownInProduct) {
          sourceGodownInProduct.balance_stock += revertCount;
        }

        let destGodown = product.GodownList.find((g) => {
          if (sourceGodown.batch) {
            return (
              g.godown_id === selectedGodownId && g.batch === sourceGodown.batch
            );
          } else {
            return g.godown_id === selectedGodownId;
          }
        });

        if (destGodown) {
          destGodown.balance_stock -= revertCount;
        }
      });

      await productModel
        .updateOne({ _id: product._id }, product)
        .session(session);
    }
  } catch (error) {
    console.error("Error in reverting stock transfer:", error);
    throw error;
  }
};

//////////////////////////////// increaseStockTransferNumber /////////////////////////////////////

export const increaseStockTransferNumber = async (secondaryUser, orgId, session) => {
  try {
    let stConfig = false;

    console.log("orgId:", orgId);

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
            const newStockTransferNumber = (config.stockTransferNumber || 0) + 1;
            console.log("Updating stockTransferNumber from", config.stockTransferNumber, "to", newStockTransferNumber);

            return {
              ...config,
              stockTransferNumber: newStockTransferNumber,
            };
          }
          return config;
        }
      );

      // Update the configurations in the secondaryUser object
      secondaryUser.configurations = updatedConfiguration;

      // Save the secondaryUser object with session
      await secondaryUser.save({ session });
    } else {
      await OragnizationModel.findByIdAndUpdate(
        orgId,
        { $inc: { stockTransferNumber: 1 } },
        { new: true, session }
      );
    }
  } catch (error) {
    console.log("Error in increaseStockTransferNumber:", error);
    throw error; // Re-throw the error to be handled by the transaction
  }
};

