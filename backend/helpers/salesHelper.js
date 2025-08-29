import productModel from "../models/productModel.js";
import salesModel from "../models/salesModel.js";
import TallyData from "../models/TallyData.js";
import vanSaleModel from "../models/vanSaleModel.js";
import OrganizationModel from "../models/OragnizationModel.js";
import { formatToLocalDate, truncateToNDecimals } from "./helper.js";
import cashModel from "../models/cashModel.js";
import bankModel from "../models/bankModel.js";
import partyModel from "../models/partyModel.js";
import mongoose from "mongoose";
import invoiceModel from "../models/invoiceModel.js";
import {
  processAdvancePayments,
  processAdvanceReceipts,
} from "./receiptHelper.js";
import settlementModel from "../models/settlementModel.js";

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
    const selectedVoucherNumberTitle =
      vanSaleQuery === "true" ? "vanSalesNumber" : "salesNumber";

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
          { $inc: { selectedVoucherNumberTitle: 1 } },
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

export const handleSaleStockUpdates = async (items, session) => {
  for (const item of items) {
    const product = await productModel
      .findOne({ _id: item._id })
      .session(session);
    if (!product) {
      throw new Error(`Product not found for item ID: ${item._id}`);
    }

    // Use actualCount if available, otherwise fall back to count
    const itemCount = parseFloat(
      item.totalActualCount !== undefined
        ? item.totalActualCount
        : item.totalCount
    );
    const productBalanceStock = parseFloat(product.balance_stock);
    const newBalanceStock = truncateToNDecimals(
      productBalanceStock - itemCount,
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
        // Use actualCount if available, otherwise fall back to count for each godown
        const godownCount =
          (godown.actualCount !== undefined
            ? godown.actualCount
            : godown.count) || 0;

        ////// handling  batch only updates
        if (item?.batchEnabled && !item?.gdnEnabled) {
          const godownIndex = product.GodownList.findIndex(
            (g) => g.batch === godown.batch
          );

          if (godownIndex !== -1 && godownCount && godownCount > 0) {
            const currentGodownStock =
              product.GodownList[godownIndex].balance_stock || 0;
            const newGodownStock = truncateToNDecimals(
              currentGodownStock - godownCount,
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
        }
        ////// handling  batch and godown updates
        else if (item?.batchEnabled && item?.gdnEnabled) {
          const godownIndex = product.GodownList.findIndex(
            (g) =>
              g.batch === godown.batch &&
              g.godown.toString() == godown.godownMongoDbId
          );

          if (godownIndex !== -1 && godownCount && godownCount > 0) {
            const currentGodownStock =
              product.GodownList[godownIndex].balance_stock || 0;
            const newGodownStock = truncateToNDecimals(
              currentGodownStock - godownCount,
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
                    "elem.godown": new mongoose.Types.ObjectId(
                      godown.godownMongoDbId
                    ),
                    "elem.batch": godown.batch,
                  },
                ],
                session,
              }
            );
          }
        }

        ////// handling  godown only  updates
        else if (!item?.batchEnabled && item?.gdnEnabled) {
          const godownIndex = product.GodownList.findIndex(
            (g) => g.godown.toString() == godown.godownMongoDbId
          );

          if (godownIndex !== -1 && godownCount && godownCount > 0) {
            const currentGodownStock =
              product.GodownList[godownIndex].balance_stock || 0;
            const newGodownStock = truncateToNDecimals(
              currentGodownStock - godownCount,
              3
            );

            await productModel.updateOne(
              {
                _id: product._id,
                "GodownList.godown": new mongoose.Types.ObjectId(
                  godown.godownMongoDbId
                ),
              },
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

        const currentGodown = item?.GodownList[0];

        const godownCount =
          (currentGodown.actualCount !== undefined
            ? currentGodown.actualCount
            : currentGodown.count) || 0;
        const newGodownStock = truncateToNDecimals(
          Number(currentGodownStock) - Number(godownCount),
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
  return items?.map((item) => {
    let totalPrice = item?.GodownList.reduce((acc, curr) => {
      return (acc += Number(curr?.individualTotal));
    }, 0);

    let subTotal;
    let cgstAmt = 0;
    let sgstAmt = 0;
    let igstAmt = 0;
    let cessAmt = 0;
    let addlCessAmt = 0;

    const igstValue = parseFloat(item.igst) || 0;
    const cessValue = parseFloat(item.cess) || 0;
    const addlCessValue = parseFloat(item.addl_cess) || 0;

    if (item?.hasGodownOrBatch) {
      const subTotals = item?.GodownList?.map((godown) => {
        if (!godown?.added) {
          return 0;
        }

        const { selectedPriceRate, count, discount } = godown;

        const totalPrice = selectedPriceRate * count;

        let basePrice;
        let priceAfterDiscount;

        if (item?.isTaxInclusive) {
          basePrice = totalPrice / (1 + igstValue / 100);
        } else {
          basePrice = totalPrice;
        }

        if (discount) {
          priceAfterDiscount = basePrice - (discount || 0);
        } else {
          priceAfterDiscount = basePrice; // Default to basePrice if no discount
        }

        return priceAfterDiscount || 0; // Ensure a value is returned for each iteration
      });

      subTotal = Number(
        subTotals
          .reduce((acc, curr) => {
            return (acc += curr || 0);
          }, 0)
          .toFixed(2)
      );

      // Calculate cess amount
      cessAmt = parseFloat(((subTotal * cessValue) / 100).toFixed(2));

      // Calculate additional cess based on total count
      const totalCount = item?.GodownList.reduce((acc, godown) => {
        return godown?.added ? acc + (godown?.count || 0) : acc;
      }, 0);
      addlCessAmt = Number((totalCount * addlCessValue).toFixed(2));

      cgstAmt = parseFloat(((subTotal * Number(item.cgst)) / 100).toFixed(2));
      sgstAmt = parseFloat(((subTotal * Number(item.sgst)) / 100).toFixed(2));
      igstAmt = parseFloat(((subTotal * igstValue) / 100).toFixed(2));
    } else {
      const { selectedPriceRate = 0 } = item?.GodownList[0];
      const count = item?.count || 0;
      const totalPrice1 = selectedPriceRate * count;

      let basePrice;
      let priceAfterDiscount = 0;

      if (item?.isTaxInclusive) {
        basePrice = totalPrice1 / (1 + igstValue / 100);
      } else {
        basePrice = totalPrice1;
      }

      if (item?.discount) {
        priceAfterDiscount = basePrice - (item?.discount || 0);
      } else {
        priceAfterDiscount = basePrice;
      }

      subTotal = Number(priceAfterDiscount.toFixed(2));

      // Calculate cess amount
      cessAmt = parseFloat(((subTotal * cessValue) / 100).toFixed(2));

      // Calculate additional cess based on count
      addlCessAmt = Number((count * addlCessValue).toFixed(2));

      cgstAmt = parseFloat(((subTotal * Number(item.cgst)) / 100).toFixed(2));
      sgstAmt = parseFloat(((subTotal * Number(item.sgst)) / 100).toFixed(2));
      igstAmt = parseFloat(((subTotal * igstValue) / 100).toFixed(2));
    }

    return {
      ...item,
      cgstAmt,
      sgstAmt,
      igstAmt,
      subTotal,
      cessAmt: cessAmt,
      addl_cessAmt: addlCessAmt,
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
      selectedGodownDetails,
      orgId,
      party,
      despatchDetails,
      finalAmount,
      selectedDate,
      paymentSplittingData,
      convertedFrom = [],
      voucherType,
      series_id,
      usedSeriesNumber,
      note,
      totalAdditionalCharges,
      totalWithAdditionalCharges,
      totalPaymentSplits,
      subTotal,
      finalOutstandingAmount,
    } = req.body;

    const Primary_user_id = req.owner;
    const Secondary_user_id = req.sUserId;

    const model = req.query.vanSale === "true" ? vanSaleModel : salesModel;

    const lastSale = await model.findOne(
      { cmp_id: orgId }, // Filter by cmp_id
      { serialNumber: 1, _id: 0 }, // Project only serialNumber, exclude _id
      { sort: { serialNumber: -1 }, session }
    );

    let newSerialNumber = 1;

    if (lastSale && !isNaN(lastSale.serialNumber)) {
      newSerialNumber = lastSale.serialNumber + 1;
    }

    const lastUserSale = await model.findOne(
      {
        cmp_id: orgId,
        Secondary_user_id: req.sUserId, // Filter by user
      },
      { userLevelSerialNumber: 1, _id: 0 }, // Project only the user-level serial
      { sort: { userLevelSerialNumber: -1 }, session }
    );

    let newUserLevelSerial = 1;

    if (lastUserSale && !isNaN(lastUserSale.userLevelSerialNumber)) {
      newUserLevelSerial = lastUserSale.userLevelSerialNumber + 1;
    }

    const sales = new model({
      selectedGodownDetails,
      serialNumber: newSerialNumber,
      series_id,
      usedSeriesNumber,
      voucherType,
      userLevelSerialNumber: newUserLevelSerial,
      cmp_id: orgId,
      partyAccount: party?.partyName,
      party,
      despatchDetails,
      items: updatedItems,
      selectedPriceLevel: req.body.priceLevelFromRedux,
      additionalCharges: updateAdditionalCharge,
      note,
      finalAmount,
      totalAdditionalCharges,
      totalWithAdditionalCharges,
      totalPaymentSplits,
      finalOutstandingAmount,
      subTotal,
      Primary_user_id,
      Secondary_user_id,
      salesNumber,
      date: await formatToLocalDate(selectedDate, orgId, session),
      createdAt: new Date(),
      paymentSplittingData,
      convertedFrom,
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
  selectedDate,
  voucherType,
  classification,
  voucherModel = "Sales"
) => {
  if (party?.partyType === "party") {
    try {
      const billData = {
        Primary_user_id: Primary_user_id,
        bill_no: salesNumber,
        billId: billId.toString(),
        cmp_id: orgId,
        party_id: party?._id,
        accountGroup: party?.accountGroup_id,
        subGroup: party?.subGroup_id,
        bill_amount: Number(lastAmount),
        bill_date: new Date(selectedDate),
        bill_due_date: new Date(selectedDate),

        bill_pending_amt: Number(valueToUpdateInTally),
        email: party?.emailID,
        mobile_no: party?.mobileNumber,
        party_name: party?.partyName,
        user_id: secondaryMobile || "null",
        source: voucherType,
        classification,
      };

      const tallyUpdate = await TallyData.findOneAndUpdate(
        {
          cmp_id: orgId,
          bill_no: salesNumber,
          billId: billId.toString(),
          Primary_user_id: Primary_user_id,
          party_id: party?._id,
        },
        { $set: billData },
        { upsert: true, new: true, session }
      );
    } catch (error) {
      console.error("Error updateTallyData sale stock updates:", error);
      throw error;
    }
  } else if (party?.partyType === "cash" || party?.partyType === "bank") {
    //// create settlement

    try {
      const settlementData = {
        voucherNumber: salesNumber,
        voucherId: billId,
        voucherModel: voucherModel,
        voucherType: voucherType,
        amount: valueToUpdateInTally,
        partyName: party?.partyName || "",
        partyId: party?._id || null,
        partyType: party?.partyType || null,
        payment_mode: null,
        /// source is also the same party
        sourceId: party?._id || null,
        sourceType: party?.partyType || null,
        cmp_id: orgId,
        Primary_user_id: Primary_user_id,
        settlement_date: selectedDate,
        voucher_date: selectedDate,
      };

      const settlement = new settlementModel(settlementData);

      await settlement.save({ session });
    } catch (error) {
      console.error("Error creating settlement:", error);
    }
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

      // Use actualCount if available, otherwise fall back to count
      const itemCount = parseFloat(
        item.totalActualCount !== undefined
          ? item.totalActualCount
          : item.totalCount
      );

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
          // Use actualCount if available, otherwise fall back to count for each godown
          const godownCount =
            godown.actualCount !== undefined
              ? godown.actualCount
              : godown.count;
          if (item?.batchEnabled && !item?.gdnEnabled) {
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

              await productModel.updateOne(
                { _id: product._id, "GodownList.batch": godown.batch },
                {
                  $set: { "GodownList.$.balance_stock": newGodownStock },
                },
                { session }
              );
            }
          } else if (item?.batchEnabled && item?.gdnEnabled) {
            const godownIndex = product.GodownList.findIndex(
              (g) =>
                g.batch === godown.batch &&
                g.godown.toString() == godown.godownMongoDbId
            );

            if (godownIndex !== -1 && godownCount && godownCount > 0) {
              const currentGodownStock =
                product.GodownList[godownIndex].balance_stock || 0;
              const newGodownStock = truncateToNDecimals(
                currentGodownStock + godownCount,
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
                      "elem.godown": new mongoose.Types.ObjectId(
                        godown.godownMongoDbId
                      ),
                      "elem.batch": godown.batch,
                    },
                  ],
                  session,
                }
              );
            }
          } else if (godown.godown_id && !godown?.batch) {
            const godownIndex = product.GodownList.findIndex(
              (g) => g.godown.toString() == godown.godownMongoDbId
            );

            if (godownIndex !== -1 && godownCount && godownCount > 0) {
              const currentGodownStock =
                product.GodownList[godownIndex].balance_stock || 0;
              const newGodownStock = truncateToNDecimals(
                currentGodownStock + godownCount,
                3
              );

              await productModel.updateOne(
                {
                  _id: product._id,
                  "GodownList.godown": new mongoose.Types.ObjectId(
                    godown.godownMongoDbId
                  ),
                },
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

          const currentGodown = item?.GodownList[0];

          const godownCount =
            (currentGodown.actualCount !== undefined
              ? currentGodown.actualCount
              : currentGodown.count) || 0;
          const newGodownStock = truncateToNDecimals(
            Number(currentGodownStock) + Number(godownCount),
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
  } catch (error) {
    console.error("Error reverting sale stock updates:", error);
    throw error;
  }
};

const getSourceType = (item) => {
  let updatedSourceType;

  if (item?.type === "credit") {
    updatedSourceType = item?.credit_reference_type || null;
  } else if (item?.type === "cash") {
    updatedSourceType = "cash";
  } else if (
    item?.type === "bank" ||
    item?.type === "upi" ||
    item?.type === "cheque"
  ) {
    updatedSourceType = "bank";
  } else {
    updatedSourceType = "party";
  }

  console.log("Updated source type:", updatedSourceType);

  return updatedSourceType;
};

// Helper function to handle credit mode
const handleCreditMode = async (
  item,
  orgId,
  salesNumber,
  saleId,
  Primary_user_id,
  secondaryMobile,
  session,
  selectedDate,
  voucherType,
  party,
  mode
) => {
  const { ref_id, amount, credit_reference_type, reference_name } = item;

  if (!ref_id) return null;

  // Handle credit with cash or bank reference
  if (credit_reference_type === "cash" || credit_reference_type === "bank") {
    const settlementData = {
      voucherNumber: salesNumber,
      voucherId: saleId,
      voucherModel: "Sales",
      voucherType: "sales",
      amount: amount,
      payment_mode: credit_reference_type,
      partyName: party?.partyName || "",
      partyId: party?._id || null,
      partyType: party?.partyType || null,
      sourceId: item?.ref_id || null,
      sourceType: getSourceType(item) || null,
      cmp_id: orgId,
      Primary_user_id: Primary_user_id,
      settlement_date: selectedDate,
      voucher_date: selectedDate,
    };

    const settlement = new settlementModel(settlementData);

    await settlement.save({ session });
    return settlement;
  } else {
    return null;
  }

  // Handle credit with party reference
  // currently we are not considering credit mode outstanding update,we are creating the outstanding for the party tagged in sale
  // else if (credit_reference_type === "party") {
  //   const party = await partyModel.findById(ref_id);

  //   await updateTallyData(
  //     orgId,
  //     salesNumber,
  //     saleId.toString(),
  //     Primary_user_id,
  //     party,
  //     amount,
  //     secondaryMobile,
  //     session,
  //     amount,
  //     selectedDate,
  //     voucherType,
  //     "Dr"
  //   );
  // }

  return null; // No settlement needed for party credit
};

// Helper function to handle non-credit modes
const handleNonCreditMode = async (
  item,
  mode,
  salesNumber,
  saleId,
  party,
  orgId,
  Primary_user_id,
  selectedDate,
  session
) => {
  const validModes = ["cash", "upi", "cheque"];

  if (!validModes.includes(mode)) {
    throw new Error(`Invalid payment mode: ${mode}`);
  }

  const settlementData = {
    voucherNumber: salesNumber,
    voucherId: saleId,
    voucherModel: "Sales",
    voucherType: "sales",
    amount: item.amount,
    payment_mode: mode,
    partyName: party?.partyName || "",
    partyId: party?._id || null,
    partyType: party?.partyType || null,
    sourceId: item?.ref_id || null,
    sourceType: getSourceType(item) || null,
    cmp_id: orgId,
    Primary_user_id: Primary_user_id,
    settlement_date: selectedDate,
    voucher_date: selectedDate,
  };

  const settlement = new settlementModel(settlementData);

  await settlement.save({ session });
  return settlement;
};

export const savePaymentSplittingDataInSources = async (
  paymentSplittingData,
  salesNumber,
  saleId,
  orgId,
  Primary_user_id,
  secondaryMobile,
  type,
  createdAt,
  party,
  session,
  selectedDate,
  voucherType,
  mode = "create"
) => {
  try {
    const updates = await Promise.all(
      paymentSplittingData
        ?.filter((item) => item.ref_id) // Filter out items without ref_id upfront
        .map(async (item) => {
          const { type: mode } = item;

          // Handle credit mode
          if (mode === "credit") {
            // currently we are not considering credit mode outstanding update,we are creating the outstanding for the party tagged in sale
            return null;

            // return await handleCreditMode(
            //   item,
            //   orgId,
            //   salesNumber,
            //   saleId,
            //   Primary_user_id,
            //   secondaryMobile,
            //   session,
            //   selectedDate,
            //   voucherType,
            //   party,
            //   mode
            // );
          } else {
            // Handle non-credit modes (cash, upi, cheque)
            return await handleNonCreditMode(
              item,
              mode,
              salesNumber,
              saleId,
              party,
              orgId,
              Primary_user_id,
              selectedDate,
              session
            );
          }
        })
    );

    // Filter out null values
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

// Main function - updated version
export const updateOutstandingBalance = async ({
  existingVoucher,
  valueToUpdateInOutstanding,
  orgId,
  voucherNumber,
  party,
  session,
  createdBy,
  transactionType,
  secondaryMobile,
  selectedDate,
  classification,
  isCancelled = false,
}) => {
  if (party?.partyType === "party") {
    // Calculate old bill balance
    let oldBillBalance =
      existingVoucher?.finalOutstandingAmount ||
      existingVoucher?.finalAmount ||
      0;
    let newBillBalance = valueToUpdateInOutstanding;

    // Calculate difference in bill value
    const diffBillValue = Number(newBillBalance) - Number(oldBillBalance);

    // Find existing outstanding record
    const matchedOutStanding = await TallyData.findOne({
      party_id: existingVoucher?.party?._id,
      cmp_id: orgId,
      billId: existingVoucher?._id.toString(),
    }).session(session);



    // Calculate sum of applied receipts
    const appliedReceipts = matchedOutStanding?.appliedReceipts || [];
    const sumOfAppliedReceipts = appliedReceipts.reduce((sum, receipt) => {
      return sum + (receipt.settledAmount || 0);
    }, 0);

    console.log(`New bill balance: ${newBillBalance}`);
    console.log(`old bill balance: ${oldBillBalance}`);
    console.log(`Sum of applied receipts: ${sumOfAppliedReceipts}`);
    console.log(
      `Absolute difference: ${Math.abs(newBillBalance - sumOfAppliedReceipts)}`
    );

    let updatedAppliedReceipts = appliedReceipts;
    let updatedAppliedPayments = matchedOutStanding?.appliedPayments || [];

    // Check if we need to create advances
    const absoluteDifference = Math.abs(newBillBalance - sumOfAppliedReceipts);
    const shouldCreateAdvances = absoluteDifference > 0;

    console.log(`Should create advances: ${shouldCreateAdvances}`);

    // If newBillBalance < oldBillBalance AND condition is met => create advance receipts and payments
    if (newBillBalance < oldBillBalance && shouldCreateAdvances) {
      const appliedPayments = matchedOutStanding?.appliedPayments;
      const totalAdvanceAmount = Math.abs(sumOfAppliedReceipts - newBillBalance);

      console.log(`Processing advances for amount: ${totalAdvanceAmount}`);

      // Process advance receipts
      if (appliedReceipts?.length > 0) {
        const receiptsResult = await processAdvanceReceipts(
          appliedReceipts,
          totalAdvanceAmount,
          orgId,
          existingVoucher,
          party,
          secondaryMobile,
          session
        );

        updatedAppliedReceipts = receiptsResult.updatedAppliedReceipts;
        console.log("updatedAppliedReceipts", updatedAppliedReceipts);
        console.log(
          `Remaining after processing receipts: ${receiptsResult.remainingAmount}`
        );
      }

      // Process advance payments
      if (appliedPayments?.length > 0) {
        const paymentsResult = await processAdvancePayments(
          appliedPayments,
          totalAdvanceAmount,
          orgId,
          existingVoucher,
          party,
          secondaryMobile,
          session
        );

        updatedAppliedPayments = paymentsResult.updatedAppliedPayments;
        console.log(
          `Remaining after processing payments: ${paymentsResult.remainingAmount}`
        );
      }

      // Update the matchedOutStanding with updated arrays
      if (matchedOutStanding?._id) {
        await TallyData.findByIdAndUpdate(
          matchedOutStanding._id,
          {
            appliedReceipts: updatedAppliedReceipts,
            appliedPayments: updatedAppliedPayments,
            updatedAt: new Date(),
          },
          { session }
        );
        console.log("Updated appliedReceipts and appliedPayments arrays");
      }
    } else {
      console.log(
        "No updates made to appliedReceipts and appliedPayments arrays"
      );
    }

    // Calculate sum of applied receipts after processing advances
    const finalSumOfAppliedReceipts = updatedAppliedReceipts.reduce(
      (sum, receipt) => {
        return sum + (receipt.settledAmount || 0);
      },
      0
    );

    // Calculate bill_pending_amt as the difference of newBillBalance - sum of appliedReceipts (after creating advance)
    const billPendingAmount = newBillBalance - finalSumOfAppliedReceipts;

    console.log(`Final sum of applied receipts: ${finalSumOfAppliedReceipts}`);
    console.log(`Bill pending amount: ${billPendingAmount}`);

    let updatedTallyData;

    if (matchedOutStanding?._id) {
      // Update existing document to preserve _id
      updatedTallyData = await TallyData.findByIdAndUpdate(
        matchedOutStanding._id,
        {
          party_id: existingVoucher?.party?._id,
          cmp_id: orgId,
          billId: existingVoucher?._id.toString(),
          bill_amount: newBillBalance,
          bill_pending_amt: billPendingAmount, // Updated calculation
          voucherNumber: voucherNumber,
          primaryUserId: existingVoucher.Primary_user_id,
          party: party,
          secondaryMobile: secondaryMobile,
          voucherType: existingVoucher?.voucherType,
          classification: classification,
          createdBy: createdBy,
          transactionType: transactionType,
          updatedAt: new Date(),
          bill_date: new Date(selectedDate),
          bill_due_date: new Date(selectedDate),
          appliedReceipts: updatedAppliedReceipts, // Ensure updated arrays are saved
          appliedPayments: updatedAppliedPayments,
          isCancelled: isCancelled,
        },
        {
          new: true, // Return updated document
          session: session,
        }
      );

      // console.log("updatedTallyData", updatedTallyData);
    }

    return updatedTallyData;
  } else {
    return null;
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
  createdAt,
  partyName,
  session
) => {
  try {
    console.log(party);
    const accountGroup = party?.accountGroup;

    if (!accountGroup) {
      throw new Error("Invalid account group");
    }

    let model;
    if (accountGroup === "Cash-in-Hand") {
      model = cashModel;
    } else if (accountGroup === "Bank Accounts") {
      model = bankModel;
    } else {
      // console.log("Invalid account group so return");
      return;
    }

    if (!model) {
      throw new Error("Invalid model");
    }

    const query = {
      cmp_id: orgId,
      ...(accountGroup === "Cash-in-Hand"
        ? { cash_id: party?.party_master_id }
        : { bank_id: party?.party_master_id }),
    };

    const settlementData = {
      voucherNumber: voucherNumber,
      voucherId: voucherId.toString(),
      party: partyName,
      amount: Number(amount),
      created_at: createdAt,
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
    // const accountGroup = party?.accountGroupName;
    // if (!accountGroup) {
    //   throw new Error("Invalid account group");
    // }
    // let model;
    // if (accountGroup === "Cash-in-Hand") {
    //   model = cashModel;
    // } else if (accountGroup === "Bank Accounts") {
    //   model = bankModel;
    // }
    // if (!model) {
    //   return;
    // }
    // const query = {
    //   cmp_id: orgId,
    //   ...(accountGroup === "Cash-in-Hand"
    //     ? { cash_id: party?.party_master_id }
    //     : { bank_id: party?.party_master_id }),
    // };
    // // First, pull the specified settlements
    // const pullUpdate = {
    //   $pull: {
    //     settlements: {
    //       voucherNumber: voucherNumber,
    //       voucherId: voucherId.toString(),
    //     },
    //   },
    // };
    // const options = {
    //   new: true,
    //   session,
    // };
    // const updatedSource = await model.findOneAndUpdate(
    //   query,
    //   pullUpdate,
    //   options
    // );
  } catch (error) {
    console.error("Error in revertSettlementData:", error);
    throw error;
  }
};

export const changeConversionStatusOfOrder = async (convertedFrom, session) => {
  try {
    const orderIds = convertedFrom.map((item) => item._id); // Extract all order IDs
    await invoiceModel.updateMany(
      { _id: { $in: orderIds } }, // Filter for the orders
      { $set: { isConverted: true } }, // Update `isConverted` field
      { session } // Pass the session for transactional safety
    );
  } catch (error) {
    console.error("Error in changeConversionStatusOfOrder:", {
      error: error.message,
      stack: error.stack,
      input: { convertedFrom },
    });
    throw error;
  }
};

export const reverseConversionStatusOfOrder = async (
  convertedFrom,
  session
) => {
  try {
    const orderIds = convertedFrom.map((item) => item._id); // Extract all order IDs
    await invoiceModel.updateMany(
      { _id: { $in: orderIds } }, // Filter for the orders
      { $set: { isConverted: false } }, // Update `isConverted` field
      { session } // Pass the session for transactional safety
    );
  } catch (error) {
    console.error("Error in changeConversionStatusOfOrder:", {
      error: error.message,
      stack: error.stack,
      input: { convertedFrom },
    });
    throw error;
  }
};
