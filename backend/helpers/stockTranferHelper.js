import OragnizationModel from "../models/OragnizationModel.js";
import productModel from "../models/productModel.js";
import stockTransferModel from "../models/stockTransferModel.js";

//////////////////////////balance stock updation asd of stock transfer ///////////////////

export const processStockTransfer = async ({
  selectedDate,
  selectedGodown,
  selectedGodownId,
  items,
}) => {
  try {
    const updatedProducts = [];

    for (const item of items) {
      const product = await productModel.findById(item._id);
      const destinationProduct = product;
      if (!product) {
        throw new Error(`Product not found: ${item._id}`);
      }

      const sourceGodowns = item.GodownList.filter((g) => g.added === true);
      if (sourceGodowns.length === 0) {
        throw new Error(`No source godowns found for product: ${item._id}`);
      }

      // let totalTransferCount = 0;

      sourceGodowns.forEach((sourceGodown) => {
        const transferCount = sourceGodown.count;
        // totalTransferCount += transferCount;

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
          // console.log(
          //   `Reduced stock from ${sourceGodown.godown_id} and batch ${sourceGodown.batch} and count ${transferCount}: new balance is ${sourceGodownInProduct.balance_stock}`
          // );
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

        // console.log("destGodown", destGodown);

        if (destGodown) {
          destGodown.balance_stock += transferCount;
          // console.log(
          //   `Increased stock to ${selectedGodownId}: new balance is ${destGodown.balance_stock}`
          // );
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
          // console.log(
          //   `Created new godown ${selectedGodownId} with balance ${newGodown.balance_stock}`
          // );
        }
      });

      // product.balance_stock -= totalTransferCount;
      // console.log(
      //   `Final balance stock for product ${product._id}: ${product.balance_stock}`
      // );

      const update = await productModel.findByIdAndUpdate(product._id, product);

      // console.log("productsssssssssss", product);
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
  selectedGodown,
  selectedGodownId,
  items,
  lastAmount,
  serialNumber,
  req,
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

    const result = await newStockTransfer.save();
    return result;
  } catch (error) {
    console.error("Error creating stock transfer:", error);
    throw error; // Re-throw the error or handle it as needed
  }
};

////////////////////////// Revert stock levels affected by an existing transfer ///////////////////

export const revertStockTransfer = async (existingTransfer) => {
  const { items, selectedGodownId } = existingTransfer;

  for (const item of items) {
    const product = await productModel.findById(item._id);
    if (!product) {
      throw new Error(`Product not found: ${item._id}`);
    }

    const sourceGodowns = item.GodownList.filter((g) => g.added === true);
    if (sourceGodowns.length === 0) {
      throw new Error(`No source godowns found for product: ${item._id}`);
    }

    // let totalRevertCount = 0;

    sourceGodowns.forEach((sourceGodown) => {
      const revertCount = sourceGodown.count;
      // totalRevertCount += revertCount;

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

    // product.balance_stock += totalRevertCount;

    // console.log("final product", product);
    await productModel.updateOne({ _id: product._id }, product);
  }
};

//////////////////////////////// increaseStockTransferNumber /////////////////////////////////////

export const increaseStockTransferNumber = async (secondaryUser, orgId) => {
  try {
    let stConfig = false;

    console.log("orgId:", orgId);

    const configuration = secondaryUser.configurations.find(
      (config) => config.organization.toString() === orgId
    );

    if (!configuration) {
      console.log("Configuration not found for orgId:", orgId);
    } else {
      // console.log("Configuration found:", configuration);

      if (
        configuration.stockTransferConfiguration &&
        Object.entries(configuration.stockTransferConfiguration)
          .filter(([key]) => key !== "startingNumber")
          .every(([_, value]) => value !== "")
      ) {
        stConfig = true;
      }
      // console.log("stConfig:", stConfig);
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

      // console.log("Updated Configuration:", updatedConfiguration[0]._doc);

      // Update the configurations in the secondaryUser object
      secondaryUser.configurations = updatedConfiguration;

      // // Save the secondaryUser object
      await secondaryUser.save();
      // console.log("secondaryUser saved with updated configuration");
    } else {
      const updatedOrganization = await OragnizationModel.findByIdAndUpdate(
        orgId,
        { $inc: { stockTransferNumber: 1 } },
        { new: true }
      );

      // console.log("Updated Organization stockTransferNumber:", updatedOrganization.stockTransferNumber);
    }
  } catch (error) {
    console.log("Error in increaseStockTransferNumber:", error);
  }
};

