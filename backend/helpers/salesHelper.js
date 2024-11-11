import productModel from "../models/productModel.js";
import salesModel from "../models/salesModel.js";
import TallyData from "../models/TallyData.js";
import vanSaleModel from "../models/vanSaleModel.js";
import OrganizationModel from "../models/OragnizationModel.js";
import { truncateToNDecimals } from "./helper.js";
import { login } from "../controllers/secondaryUserController.js";
import cashModel from "../models/cashModel.js";
import bankModel from "../models/bankModel.js";
import partyModel from "../models/partyModel.js";
import mongoose from "mongoose";

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
    const docs = await model
      .find({
        [fieldName]: newValue,
        cmp_id: cmp_id,
      })
      .session(session);

    console.log(docs.map((el) => el[fieldName]));
    return docs.length > 0;
  } catch (error) {
    console.log("Error checking for number existence:", error);
    throw error;
  }
};

export const updateSalesNumber = async (
  orgId,
  vanSaleQuery,
  secondaryUser,
  configuration,
  session
) => {
  try {
    let salesNumber = 1;

    if (vanSaleQuery === "true") {
      // Increment vanSalesNumber for secondaryUser
      const updatedConfiguration = secondaryUser.configurations.map(
        (config) => {
          if (config.organization.toString() === orgId) {
            return {
              ...config,
              vanSalesNumber: (config.vanSalesNumber || 0) + 1,
            };
          }
          return config;
        }
      );
      secondaryUser.configurations = updatedConfiguration;
      await secondaryUser.save({ session });
    } else {
      if (configuration && configuration.salesConfiguration) {
        // const allFieldsFilled = Object.entries(configuration.salesConfiguration)
        //   .filter(([key]) => key !== "startingNumber")
        //   .every(([_, value]) => value !== "");

        // if (allFieldsFilled) {
        salesNumber = (configuration.salesNumber || 0) + 1;

        console.log("salesNumber", salesNumber);

        const updatedConfiguration = secondaryUser.configurations.map(
          (config) => {
            if (config.organization.toString() === orgId) {
              return {
                ...config,
                salesNumber: salesNumber,
              };
            }
            return config;
          }
        );
        secondaryUser.configurations = updatedConfiguration;
        await secondaryUser.save({ session });
        // }

        // else {
        //   await OrganizationModel.findByIdAndUpdate(
        //     orgId,
        //     { $inc: { salesNumber: 1 } },
        //     { new: true }
        //   );
        // }
      } else {
        await OrganizationModel.findByIdAndUpdate(
          orgId,
          { $inc: { salesNumber: 1 } },
          { new: true, session } // Use session here
        );
      }
    }

    return salesNumber;
  } catch (error) {
    console.error("Error updateSalesNumber sale stock updates:", error);
    throw error;
  }
};

export const handleSaleStockUpdates = async (
  items,
  revert = false,
  session
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

    const itemCount = parseFloat(item.count);
    const productBalanceStock = parseFloat(product.balance_stock);
    const adjustment = revert ? itemCount : -itemCount;
    const newBalanceStock = truncateToNDecimals(
      productBalanceStock + adjustment,
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
        const godownAdjustment = revert ? godown.count : -godown.count;

        if (godown.batch && !godown?.godown_id) {
          const godownIndex = product.GodownList.findIndex(
            (g) => g.batch === godown.batch
          );

          if (godownIndex !== -1 && godown.count && godown.count > 0) {
            const currentGodownStock =
              product.GodownList[godownIndex].balance_stock || 0;
            const newGodownStock = truncateToNDecimals(
              currentGodownStock + godownAdjustment,
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

          if (godownIndex !== -1 && godown.count && godown.count > 0) {
            const currentGodownStock =
              product.GodownList[godownIndex].balance_stock || 0;
            const newGodownStock = truncateToNDecimals(
              currentGodownStock + godownAdjustment,
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

          if (godownIndex !== -1 && godown.count && godown.count > 0) {
            const currentGodownStock =
              product.GodownList[godownIndex].balance_stock || 0;
            const newGodownStock = truncateToNDecimals(
              currentGodownStock + godownAdjustment,
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
          Number(currentGodownStock) + Number(adjustment),
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

export const processSaleItems = (items) => {
  return items.map((item) => {
    let totalPrice = item?.GodownList.reduce((acc, curr) => {
      return (acc += Number(curr?.individualTotal));
    }, 0);

    if (item.discount) {
      totalPrice -= item.discount;
    } else if (item.discountPercentage) {
      const discountAmount = (totalPrice * item.discountPercentage) / 100;
      totalPrice -= discountAmount;
    }

    const { cgst = 0, sgst = 0, igst = 0, isTaxInclusive = false } = item; // Default tax rates to 0 if not provided
    const cgstNumber = Number(cgst);
    const sgstNumber = Number(sgst);
    const igstNumber = Number(igst);
    let basePrice = 0;
    let cgstAmt = 0,
      sgstAmt = 0,
      igstAmt = 0;

    console.log("isTaxInclusive", isTaxInclusive);

    if (!isTaxInclusive) {
      // If price is tax-inclusive, calculate base price
      const totalTaxPercentage = igstNumber / 100;
      basePrice = totalPrice / (1 + totalTaxPercentage); // Reverse calculation to get base price

      // Calculate the tax amounts
      cgstAmt = Number(((basePrice * cgstNumber) / 100).toFixed(2));
      sgstAmt = Number(((basePrice * sgstNumber) / 100).toFixed(2));
      igstAmt = Number(((basePrice * igstNumber) / 100).toFixed(2));

      console.log(
        `  totalPrice:${totalPrice} cgstAmt: ${cgstAmt} sgstAmt: ${sgstAmt} igstAmt: ${igstAmt}`
      );
    } else {
      // console.log("igstNumber", igstNumber);

      const basePrice = (totalPrice * 100) / (100 + igstNumber);
      // If price is tax-exclusive, calculate taxes based on total price
      cgstAmt = Number(((basePrice * cgstNumber) / 100).toFixed(2));
      sgstAmt = Number(((basePrice * sgstNumber) / 100).toFixed(2));
      igstAmt = Number(((basePrice * igstNumber) / 100).toFixed(2));
      console.log(
        ` totalPrice: ${totalPrice}  cgstAmt: ${cgstAmt} sgstAmt: ${sgstAmt} igstAmt: ${igstAmt}`
      );
    }

    return {
      ...item,
      cgstAmt,
      sgstAmt,
      igstAmt,
      subTotal: totalPrice - (Number(igstAmt) || 0),
    };
  });
};

export const createSaleRecord = async (
  req,
  salesNumber,
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
      paymentSplittingData,
    } = req.body;

    const Primary_user_id = req.owner;
    const Secondary_user_id = req.sUserId;

    const model = req.query.vanSale === "true" ? vanSaleModel : salesModel;

    const lastSale = await model.findOne(
      {},
      {},
      { sort: { serialNumber: -1 }, session }
    );
    let newSerialNumber = 1;

    if (lastSale && !isNaN(lastSale.serialNumber)) {
      newSerialNumber = lastSale.serialNumber + 1;
    }

    const sales = new model({
      selectedGodownId: selectedGodownId ?? "",
      selectedGodownName: selectedGodownName ? selectedGodownName[0] : "",
      serialNumber: newSerialNumber,
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
      salesNumber,
      createdAt: new Date(selectedDate),
      paymentSplittingData,
    });

    const result = await sales.save({ session });

    return result;
  } catch (error) {
    console.error("Error in  createSaleRecord :", error);
    throw error;
  }
};

export const updateTallyData = async (
  orgId,
  salesNumber,
  Primary_user_id,
  party,
  lastAmount,
  secondaryMobile,
  session,
  valueToUpdateInTally
) => {
  console.log(lastAmount, "lastAmount");

  try {
    const billData = {
      Primary_user_id,
      bill_no: salesNumber,
      cmp_id: orgId,
      party_id: party?.party_master_id,
      bill_amount: Number(lastAmount),
      bill_date: new Date(),
      bill_pending_amt: Number(valueToUpdateInTally),
      email: party?.emailID,
      mobile_no: party?.mobileNumber,
      party_name: party?.partyName,
      user_id: secondaryMobile || "null",
      source: "sale",
      classification: "Dr",
    };

    const tallyUpdate = await TallyData.findOneAndUpdate(
      {
        cmp_id: orgId,
        bill_no: salesNumber,
        Primary_user_id: Primary_user_id,
        party_id: party?.party_master_id,
      },
      billData,
      { upsert: true, new: true, session }
    );

    // console.log("tallyUpdate",tallyUpdate);
  } catch (error) {
    console.error("Error updateTallyData sale stock updates:", error);
    throw error;
  }
};

export const revertSaleStockUpdates = async (items, session) => {
  try {
    const productUpdates = [];
    const godownUpdates = [];

    for (const item of items) {
      const product = await productModel
        .findOne({ _id: item._id })
        .session(session); // Use the session passed as parameter
      if (!product) {
        throw new Error(`Product not found for item ID: ${item._id}`);
      }

      const itemCount = parseFloat(item.count);
      const productBalanceStock = parseFloat(product.balance_stock);
      const newBalanceStock = truncateToNDecimals(
        productBalanceStock + itemCount, // Revert stock by adding back
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
            const godownIndex = product.GodownList.findIndex(
              (g) => g.batch === godown.batch
            );

            if (godownIndex !== -1) {
              if (godown.count && godown.count > 0) {
                const currentGodownStock =
                  product.GodownList[godownIndex].balance_stock || 0;
                const newGodownStock = truncateToNDecimals(
                  currentGodownStock + godown.count, // Revert stock by adding back
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
            const godownIndex = product.GodownList.findIndex(
              (g) =>
                g.batch === godown.batch && g.godown_id === godown.godown_id
            );

            if (godownIndex !== -1) {
              if (godown.count && godown.count > 0) {
                const currentGodownStock =
                  product.GodownList[godownIndex].balance_stock || 0;
                const newGodownStock = truncateToNDecimals(
                  currentGodownStock + godown.count, // Revert stock by adding back
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
            const godownIndex = product.GodownList.findIndex(
              (g) => g.godown_id === godown.godown_id
            );

            if (godownIndex !== -1) {
              if (godown.count && godown.count > 0) {
                const currentGodownStock =
                  product.GodownList[godownIndex].balance_stock || 0;
                const newGodownStock = truncateToNDecimals(
                  currentGodownStock + godown.count, // Revert stock by adding back
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
        product.GodownList = product.GodownList.map((godown) => {
          const currentGodownStock = Number(godown.balance_stock) || 0;
          const newGodownStock = truncateToNDecimals(
            currentGodownStock + Number(item.count), // Revert stock by adding back
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

    // Execute bulk operations to revert stock changes using the session
    await productModel.bulkWrite(productUpdates, { session });
    await productModel.bulkWrite(godownUpdates, { session });
  } catch (error) {
    console.error("Error reverting sale stock updates:", error);
    throw error;
  }
};

export const savePaymentSplittingDataInSources = async (
  paymentSplittingData,
  salesNumber,
  saleId,
  orgId,
  Primary_user_id,
  secondaryMobile,
  session
) => {
  try {
    if (!paymentSplittingData?.splittingData?.length) {
      throw new Error("Invalid payment splitting data");
    }

    const updates = await Promise.all(
      paymentSplittingData.splittingData.map(async (item) => {
        const mode = item.mode;
        let selectedModel =
          mode === "cash"
            ? cashModel
            : mode === "online" || mode === "cheque"
            ? bankModel
            : null;

        // Handle credit mode
        if (mode === "credit") {
          const party = await partyModel.findById(
            new mongoose.Types.ObjectId(item.sourceId)
          );

          if (!party) {
            throw new Error("Invalid party");
          }

          await updateTallyData(
            orgId,
            salesNumber,
            Primary_user_id,
            party,
            item.amount,
            secondaryMobile,
            session,
            item.amount
          );

          // Return early for credit mode
          return null;
        }

        // Only proceed with settlement update for non-credit modes
        if (!selectedModel) {
          throw new Error(`Invalid payment mode: ${mode}`);
        }

        const settlementData = {
          sales_number: salesNumber,
          sale_id: saleId,
          amount: item.amount,
          created_at: new Date(),
          payment_mode: mode,
        };

        const query = {
          cmp_id: orgId,
          ...(mode === "cash"
            ? { cash_id: item.sourceId }
            : { bank_id: item.sourceId }),
        };

        const update = {
          $push: {
            settlements: settlementData,
          },
        };

        const options = {
          upsert: true,
          new: true,
          session,
        };

        const updatedSource = await selectedModel.findOneAndUpdate(
          query,
          update,
          options
        );
        console.log(updatedSource);
        return updatedSource;

        
      })
    );

    // Filter out null values (from credit mode) from updates array
    return updates.filter(Boolean);

  } catch (error) {
    console.error("Error in savePaymentSplittingDataInSources:", error);
    throw error;
  }
};


export const revertPaymentSplittingDataInSources = async (
  paymentSplittingData,
  salesNumber,
  saleId,
  orgId,
  session
) => {
  try {
    if (!paymentSplittingData?.splittingData?.length) {
      throw new Error("Invalid payment splitting data");
    }

    const updates = await Promise.all(
      paymentSplittingData.splittingData.map(async (item) => {
        const mode = item.mode;
        let selectedModel =
          mode === "cash"
            ? cashModel
            : mode === "online" || mode === "cheque"
            ? bankModel
            : null;

        // If it's credit or invalid mode, skip this iteration
        if (!selectedModel) {
          return null;
        }

        const query = {
          cmp_id: orgId,
          ...(mode === "cash"
            ? { cash_id: item.sourceId }
            : { bank_id: item.sourceId }),
          "settlements.sales_number": salesNumber,
          "settlements.sale_id": saleId
        };

        const update = {
          $pull: {
            settlements: {
              sales_number: salesNumber,
              sale_id: saleId
            }
          }
        };

        const options = {
          new: true,
          session
        };

        const updatedSource = await selectedModel.findOneAndUpdate(
          query,
          update,
          options
        );
        return updatedSource;
      })
    );

    return updates.filter(Boolean);

  } catch (error) {
    console.error("Error in revertPaymentSplittingDataInSources:", error);
    throw error;
  }
};
