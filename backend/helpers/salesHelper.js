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

    // console.log(docs.map((el) => el[fieldName]));
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

        // console.log("salesNumber", salesNumber);

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

    // Update product balance stock
    await productModel.updateOne(
      { _id: product._id },
      { $set: { balance_stock: newBalanceStock } },
      { session }
    );

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

            await productModel.updateOne(
              { _id: product._id, "GodownList.batch": godown.batch },
              {
                $set: { "GodownList.$.balance_stock": newGodownStock },
              },
              { session }
            );
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

            await productModel.updateOne(
              { _id: product._id },
              {
                $set: { "GodownList.$[elem].balance_stock": newGodownStock },
              },
              {
                arrayFilters: [
                  {
                    "elem.godown_id": godown.godown_id,
                    "elem.batch": godown.batch,
                  },
                ],
                session,
              }
            );
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

            await productModel.updateOne(
              { _id: product._id, "GodownList.godown_id": godown.godown_id },
              {
                $set: { "GodownList.$.balance_stock": newGodownStock },
              },
              { session }
            );
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

      await productModel.updateOne(
        { _id: product._id },
        { $set: { GodownList: product.GodownList } },
        { session }
      );
    }
  }
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

    // console.log("isTaxInclusive", isTaxInclusive);

    if (!isTaxInclusive) {
      // If price is tax-inclusive, calculate base price
      const totalTaxPercentage = igstNumber / 100;
      basePrice = totalPrice / (1 + totalTaxPercentage); // Reverse calculation to get base price

      // Calculate the tax amounts
      cgstAmt = Number(((basePrice * cgstNumber) / 100).toFixed(2));
      sgstAmt = Number(((basePrice * sgstNumber) / 100).toFixed(2));
      igstAmt = Number(((basePrice * igstNumber) / 100).toFixed(2));

      // console.log(
      //   `  totalPrice:${totalPrice} cgstAmt: ${cgstAmt} sgstAmt: ${sgstAmt} igstAmt: ${igstAmt}`
      // );
    } else {
      // console.log("igstNumber", igstNumber);

      const basePrice = (totalPrice * 100) / (100 + igstNumber);
      // If price is tax-exclusive, calculate taxes based on total price
      cgstAmt = Number(((basePrice * cgstNumber) / 100).toFixed(2));
      sgstAmt = Number(((basePrice * sgstNumber) / 100).toFixed(2));
      igstAmt = Number(((basePrice * igstNumber) / 100).toFixed(2));
      // console.log(
      //   ` totalPrice: ${totalPrice}  cgstAmt: ${cgstAmt} sgstAmt: ${sgstAmt} igstAmt: ${igstAmt}`
      // );
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
  billId,
  Primary_user_id,
  party,
  lastAmount,
  secondaryMobile,
  session,
  valueToUpdateInTally,
  createdBy = ""
) => {
  try {
    const billData = {
      Primary_user_id: Primary_user_id,
      bill_no: salesNumber,
      billId: billId.toString(),
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
      createdBy,
    };

    const tallyUpdate = await TallyData.findOneAndUpdate(
      {
        cmp_id: orgId,
        bill_no: salesNumber,
        billId: billId.toString(),
        Primary_user_id: Primary_user_id,
        party_id: party?.party_master_id,
      },
      { $set: billData },
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
    for (const item of items) {
      const product = await productModel
        .findOne({ _id: item._id })
        .session(session);

      if (!product) {
        throw new Error(`Product not found for item ID: ${item._id}`);
      }

      const itemCount = parseFloat(item.count);
      const productBalanceStock = parseFloat(product.balance_stock);
      const newBalanceStock = truncateToNDecimals(
        productBalanceStock + itemCount,
        3
      );

      // Update product balance stock
      await productModel.updateOne(
        { _id: product._id },
        { $set: { balance_stock: newBalanceStock } },
        { session }
      );

      // Revert godown and batch updates
      if (item.hasGodownOrBatch) {
        for (const godown of item.GodownList) {
          if (godown.batch && !godown?.godown_id) {
            const godownIndex = product.GodownList.findIndex(
              (g) => g.batch === godown.batch
            );

            if (godownIndex !== -1 && godown.count && godown.count > 0) {
              const currentGodownStock =
                product.GodownList[godownIndex].balance_stock || 0;
              const newGodownStock = truncateToNDecimals(
                currentGodownStock + godown.count,
                3
              );

              await productModel.updateOne(
                { _id: product._id, "GodownList.batch": godown.batch },
                {
                  $set: { "GodownList.$.balance_stock": newGodownStock },
                },
                { session }
              );
            }
          } else if (godown.godown_id && godown.batch) {
            const godownIndex = product.GodownList.findIndex(
              (g) =>
                g.batch === godown.batch && g.godown_id === godown.godown_id
            );

            if (godownIndex !== -1 && godown.count && godown.count > 0) {
              const currentGodownStock =
                product.GodownList[godownIndex].balance_stock || 0;
              const newGodownStock = truncateToNDecimals(
                currentGodownStock + godown.count,
                3
              );

              await productModel.updateOne(
                { _id: product._id },
                {
                  $set: { "GodownList.$[elem].balance_stock": newGodownStock },
                },
                {
                  arrayFilters: [
                    {
                      "elem.godown_id": godown.godown_id,
                      "elem.batch": godown.batch,
                    },
                  ],
                  session,
                }
              );
            }
          } else if (godown.godown_id && !godown?.batch) {
            const godownIndex = product.GodownList.findIndex(
              (g) => g.godown_id === godown.godown_id
            );

            if (godownIndex !== -1 && godown.count && godown.count > 0) {
              const currentGodownStock =
                product.GodownList[godownIndex].balance_stock || 0;
              const newGodownStock = truncateToNDecimals(
                currentGodownStock + godown.count,
                3
              );

              await productModel.updateOne(
                { _id: product._id, "GodownList.godown_id": godown.godown_id },
                {
                  $set: { "GodownList.$.balance_stock": newGodownStock },
                },
                { session }
              );
            }
          }
        }
      } else {
        product.GodownList = product.GodownList.map((godown) => {
          const currentGodownStock = Number(godown.balance_stock) || 0;
          const newGodownStock = truncateToNDecimals(
            currentGodownStock + Number(item.count),
            3
          );
          return {
            ...godown,
            balance_stock: newGodownStock,
          };
        });

        await productModel.updateOne(
          { _id: product._id },
          { $set: { GodownList: product.GodownList } },
          { session }
        );
      }
    }
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
  type,
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
          const party = await partyModel.findOne({
            party_master_id: item.sourceId,
            cmp_id: orgId,
          });

          // console.log("party", party);

          if (!party) {
            throw new Error("Invalid party");
          }

          await updateTallyData(
            orgId,
            salesNumber,
            saleId.toString(),
            Primary_user_id,
            party,
            item.amount,
            secondaryMobile,
            session,
            item.amount,
            "paymentSplitting"
          );

          // Return early for credit mode
          return null;
        }

        // Only proceed with settlement update for non-credit modes
        if (!selectedModel) {
          throw new Error(`Invalid payment mode: ${mode}`);
        }

        const settlementData = {
          voucherNumber: salesNumber,
          voucherId: saleId.toString(),
          amount: item.amount,
          created_at: new Date(),
          payment_mode: mode,
          type: type,
        };

        const query = {
          cmp_id: orgId,
          _id: item.sourceId,
          // ...(mode === "cash"
          //   ? { _id: item.sourceId }
          //   : { _id: item.sourceId }),
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
  paymentSplittingData = {},
  salesNumber,
  saleId,
  orgId,
  session
) => {
  try {
    if (!paymentSplittingData?.splittingData?.length) {
      return;
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

        if (mode === "credit") {
          // console.log("cmp_id", orgId);
          // console.log("bill_no", salesNumber);
          // console.log("party_id", item?.sourceId);

          // Delete tally data for credit mode
          // Find the specific record first
          const tallyRecord = await TallyData.findOne({
            cmp_id: orgId,
            bill_no: salesNumber,
            party_id: item?.sourceId,
            createdBy: "paymentSplitting",
          }).session(session);

          // console.log("tallyRecord", tallyRecord);

          if (tallyRecord) {
            await TallyData.deleteOne(
              { _id: new mongoose.Types.ObjectId(tallyRecord._id) },
              { session }
            );
          }
          return null;
        }

        if (!selectedModel) {
          return null;
        }

        const query = {
          cmp_id: orgId,
          _id: item.sourceId,
          // ...(mode === "cash"
          //   ? { cash_id: item.sourceId }
          //   : { bank_id: item.sourceId }),
        };

        // First, pull the specified settlements
        const pullUpdate = {
          $pull: {
            settlements: {
              voucherNumber: salesNumber,
              voucherId: saleId,
            },
          },
        };

        const options = {
          new: true,
          session,
        };

        const updatedSource = await selectedModel.findOneAndUpdate(
          query,
          pullUpdate,
          options
        );

        // If settlements array is empty after pulling, remove it completely
        if (
          updatedSource &&
          (!updatedSource.settlements || updatedSource.settlements.length === 0)
        ) {
          await selectedModel.findOneAndUpdate(
            query,
            { $unset: { settlements: "" } },
            options
          );

          // Fetch the final state after removing the empty array
          return await selectedModel.findOne(query).session(session);
        }

        return updatedSource;
      })
    );

    return updates.filter(Boolean);
  } catch (error) {
    console.error("Error in revertPaymentSplittingDataInSources:", error);
    throw error;
  }
};

export const updateOutstandingBalance = async ({
  existingVoucher,
  newVoucherData,
  orgId,
  voucherNumber,
  party,
  session,
  createdBy,
  transactionType,
  secondaryMobile,
}) => {
  // Calculate old bill balance
  let oldBillBalance;
  if (
    existingVoucher?.paymentSplittingData &&
    Object.keys(existingVoucher?.paymentSplittingData).length > 0
  ) {
    oldBillBalance = existingVoucher?.paymentSplittingData?.balanceAmount;
  } else {
    oldBillBalance = existingVoucher?.finalAmount || 0;
  }

  // Calculate new bill balance

  let newBillBalance;
  if (
    newVoucherData?.paymentSplittingData &&
    Object.keys(newVoucherData?.paymentSplittingData).length > 0
  ) {
    newBillBalance = newVoucherData?.paymentSplittingData?.balanceAmount;
  } else {
    newBillBalance = newVoucherData?.lastAmount || 0;
  }

  // Calculate difference in bill value
  const diffBillValue = Number(newBillBalance) - Number(oldBillBalance);

  // Find existing outstanding record
  const matchedOutStanding = await TallyData.findOne({
    party_id: existingVoucher?.party?.party_master_id,
    cmp_id: orgId,
    bill_no: voucherNumber,
    billId: existingVoucher?._id.toString(),
  }).session(session);

  // Calculate value to update in tally
  const valueToUpdateInTally =
    Number(
      matchedOutStanding?.bill_pending_amt ||
        Number(newVoucherData?.lastAmount || 0)
    ) + diffBillValue || 0;

  // Delete existing outstanding record
  if (matchedOutStanding?._id) {
    await TallyData.findByIdAndDelete(matchedOutStanding._id).session(session);
  }

  // Create new outstanding record if applicable
  let updatedTallyData = null;
  if (
    party.accountGroup === "Sundry Debtors" ||
    party.accountGroup === "Sundry Creditors"
  ) {
    updatedTallyData = await updateTallyData(
      orgId,
      voucherNumber,
      existingVoucher._id,
      createdBy,
      party,
      newVoucherData?.lastAmount,
      secondaryMobile,
      session,
      valueToUpdateInTally,
      transactionType
    );
  }
};

export const saveSettlementData = async (
  party,
  orgId,
  paymentMethod,
  type,
  voucherNumber,
  voucherId,
  amount,
  session
) => {
  try {
    const accountGroup = party?.accountGroup;

    if (!accountGroup) {
      throw new Error("Invalid account group");
    }

    let model;
    if (accountGroup === "Cash-in-Hand") {
      model = cashModel;
    } else if (accountGroup === "Bank Accounts") {
      model = bankModel;
    }else{

      // console.log("Invalid account group so return");
      return
    }

    if (!model) {
      throw new Error("Invalid model");
    }

    const query = {
      cmp_id: orgId,
      ...(accountGroup === "Cash-in-Hand"
        ? { cash_id: Number(party?.party_master_id) }
        : { bank_id: Number(party?.party_master_id) }),
    };

    const settlementData = {
      voucherNumber: voucherNumber,
      voucherId: voucherId.toString(),
      amount: Number(amount),
      created_at: new Date(),
      payment_mode: paymentMethod,
      type: type,
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

    const updatedSource = await model.findOneAndUpdate(query, update, options);
  } catch (error) {
    console.error("Error in saveSettlementData:", error);
    throw error;
  }
};

export const revertSettlementData = async (
  party,
  orgId,
  voucherNumber,
  voucherId,
  session
) => {
  try {
    const accountGroup = party?.accountGroup;

    if (!accountGroup) {
      throw new Error("Invalid account group");
    }

    let model;
    if (accountGroup === "Cash-in-Hand") {
      model = cashModel;
    } else if (accountGroup === "Bank Accounts") {
      model = bankModel;
    }

    if (!model) {
      throw new Error("Invalid model");
    }

    const query = {
      cmp_id: orgId,
      ...(accountGroup === "Cash-in-Hand"
        ? { cash_id: Number(party?.party_master_id) }
        : { bank_id: Number(party?.party_master_id) }),
    };


    // First, pull the specified settlements
    const pullUpdate = {
      $pull: {
        settlements: {
          voucherNumber: voucherNumber,
          voucherId: voucherId.toString(),
        },
      },
    };

    const options = {
      new: true,
      session,
    };

    const updatedSource = await model.findOneAndUpdate(
      query,
      pullUpdate,
      options
    );
  } catch (error) {
    console.error("Error in revertSettlementData:", error);
    throw error;
  }
};
