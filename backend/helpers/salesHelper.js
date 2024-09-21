import productModel from "../models/productModel.js";
import salesModel from "../models/salesModel.js";
import TallyData from "../models/TallyData.js";
import vanSaleModel from "../models/vanSaleModel.js";
import OrganizationModel from "../models/OragnizationModel.js";
import { truncateToNDecimals } from "./helper.js";
import { login } from "../controllers/secondaryUserController.js";


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
    }).session(session)

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

          console.log("salesNumber",salesNumber);
          
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

export const handleSaleStockUpdates = async (items, revert = false,session) => {
  const productUpdates = [];
  const godownUpdates = [];

  for (const item of items) {
    const product = await productModel.findOne({ _id: item._id }).session(session);
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

  await productModel.bulkWrite(productUpdates,{session});
  await productModel.bulkWrite(godownUpdates,{session});
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

    const { cgst, sgst, igst } = item;
    const cgstAmt = parseFloat(((totalPrice * cgst) / 100).toFixed(2));
    const sgstAmt = parseFloat(((totalPrice * sgst) / 100).toFixed(2));
    const igstAmt = parseFloat(((totalPrice * igst) / 100).toFixed(2));

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
  session
) => {
  try {
    const billData = {
        Primary_user_id,
        bill_no: salesNumber,
        cmp_id: orgId,
        party_id: party?.party_master_id,
        bill_amount: lastAmount,
        bill_date: new Date(),
        bill_pending_amt: lastAmount,
        email: party?.emailID,
        mobile_no: party?.mobileNumber,
        party_name: party?.partyName,
        user_id: secondaryMobile || "null",
        source: "sale",
      };

    const tallyUpdate=await TallyData.findOneAndUpdate(
      {
        cmp_id: orgId,
        bill_no: salesNumber,
        Primary_user_id: Primary_user_id,
        party_id: party?.party_master_id,
      },
      billData,
      { upsert: true, new: true,session }
    );

    console.log("tallyUpdate",tallyUpdate);
    
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
      const product = await productModel.findOne({ _id: item._id }).session(session); // Use the session passed as parameter
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

