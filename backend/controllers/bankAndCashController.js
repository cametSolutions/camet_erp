import mongoose from "mongoose";
import cashModel from "../models/cashModel.js";
import { editCorrespondingParty } from "../helpers/helper.js";
import bankModel from "../models/bankModel.js";
import BankOdModel from "../models/bankOdModel.js";
import { startOfDay, endOfDay, parseISO } from "date-fns";
import partyModel from "../models/partyModel.js";
import accountGroup from "../models/accountGroup.js";
import settlementModel from "../models/settlementModel.js";

// @desc find source balances
// route get/api/sUsers/findSourceBalance

export const findSourceBalance = async (req, res) => {
  const cmp_id = new mongoose.Types.ObjectId(req.params.cmp_id);
  const { startOfDayParam, endOfDayParam } = req.query;

  // Initialize dateFilter for settlement_date
  let dateFilter = {};
  if (startOfDayParam && endOfDayParam) {
    const startDate = parseISO(startOfDayParam);
    const endDate = parseISO(endOfDayParam);
    dateFilter = {
      settlement_date: {
        $gte: startOfDay(startDate),
        $lte: endOfDay(endDate),
      },
    };
  }

  try {
    const sourceBalances = await settlementModel.aggregate([
      {
        $match: {
          cmp_id: cmp_id,
          ...dateFilter,
        },
      },
      {
        $lookup: {
          from: "parties", // Collection name for partyModel
          localField: "sourceId",
          foreignField: "_id",
          as: "sourceAccount",
        },
      },
      {
        $unwind: "$sourceAccount",
      },
      {
        $group: {
          _id: "$sourceType", // Group by sourceType (cash, bank)
          settlementTotal: { $sum: "$amount" },
          openingTotal: { $sum: "$sourceAccount.openingBalanceAmount" },
        },
      },
    ]);


    // Extract totals for each source type
    let bankSettlementTotal = 0;
    let cashSettlementTotal = 0;
    let bankOpeningTotal = 0;
    let cashOpeningTotal = 0;

    sourceBalances.forEach((balance) => {
      if (balance._id === "bank") {
        bankSettlementTotal = balance.settlementTotal;
        bankOpeningTotal = balance.openingTotal;
      } else if (balance._id === "cash") {
        cashSettlementTotal = balance.settlementTotal;
        cashOpeningTotal = balance.openingTotal;
      }
    });

    // Calculate current balances (opening + settlements)
    const bankCurrentBalance = bankOpeningTotal + bankSettlementTotal;
    const cashCurrentBalance = cashOpeningTotal + cashSettlementTotal;
    const grandTotal = bankCurrentBalance + cashCurrentBalance;

    return res.status(200).json({
      message: "Balance found successfully",
      success: true,
      cashOpeningTotal,
      cashSettlementTotal,
      cashCurrentBalance,
      bankOpeningTotal,
      bankSettlementTotal,
      bankCurrentBalance,
      grandTotal,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
};

// @desc find source transactions Details
// route get/api/sUsers/findSourceDetails

export const findSourceDetails = async (req, res) => {
  const cmp_id = new mongoose.Types.ObjectId(req.params.cmp_id);
  const { accountGroup } = req.query;

  try {
    // Determine partyType based on accountGroup
    let partyTypeFilter;
    switch (accountGroup) {
      case "cashInHand":
        partyTypeFilter = "cash";
        break;
      case "bankBalance":
      case "bankOd":
        partyTypeFilter = "bank";
        break;
      default:
        return res.status(400).json({ message: "Invalid account group" });
    }

    // Get all Bank/Cash accounts for the company
    const accounts = await partyModel
      .find({
        cmp_id: cmp_id,
        partyType: partyTypeFilter,
      })
      .select("_id partyName openingBalanceAmount")
      .sort({ partyName: 1 });

    // Get settlement totals for each account from Settlement collection
    const settlementTotals = await settlementModel.aggregate([
      {
        $match: {
          cmp_id: cmp_id,
          sourceType: partyTypeFilter, // Filter by sourceType (cash/bank)
        },
      },
      {
        $group: {
          _id: "$sourceId", // Group by sourceId (the account ID)
          settlementTotal: { $sum: "$amount" },
        },
      },
    ]);

    // Create a map for quick lookup of settlement totals
    const settlementMap = {};
    settlementTotals.forEach((settlement) => {
      settlementMap[settlement._id.toString()] = settlement.settlementTotal;
    });

    // Map accounts to required format with settlement data
    const balanceDetails = accounts.map((account) => {
      const accountId = account._id.toString();
      const openingBalance = account.openingBalanceAmount || 0;
      const settlementTotal = settlementMap[accountId] || 0;
      const currentBalance = openingBalance + settlementTotal;

      return {
        _id: account._id,
        name: account.partyName,
        openingBalance: openingBalance,
        settlementTotal: settlementTotal,
        currentBalance: currentBalance,
        total: currentBalance, // For backward compatibility
      };
    });

    return res.status(200).json({
      message: "Balance details found successfully",
      success: true,
      accountGroup,
      data: balanceDetails,
    });
  } catch (error) {
    console.error("findSourceDetails error:", error);
    return res.status(500).json({
      error: "Internal Server Error",
      details: error.message,
    });
  }
};

// @desc find source transactions
// route get/api/sUsers/findSourceTransactions


export const findSourceTransactions = async (req, res) => {
  const { id } = req.params;
  const cmp_id = new mongoose.Types.ObjectId(req.params.cmp_id);
  const { startOfDayParam, endOfDayParam, accGroup } = req.query;

  try {
    // Determine partyType based on accountGroup
    let partyTypeFilter;
    switch (accGroup) {
      case "cashInHand":
        partyTypeFilter = "cash";
        break;
      case "bankBalance":
      case "bankOd":
        partyTypeFilter = "bank";
        break;
      default:
        return res.status(400).json({ message: "Invalid account group" });
    }

    // Date filters
    let dateFilter = {};
    let openingDateFilter = {};
    
    if (startOfDayParam && endOfDayParam) {
      const startDate = parseISO(startOfDayParam);
      const endDate = parseISO(endOfDayParam);

      dateFilter = {
        settlement_date: {
          $gte: startOfDay(startDate),
          $lte: endOfDay(endDate),
        },
      };

      openingDateFilter = {
        settlement_date: {
          $lt: startOfDay(startDate),
        },
      };
    }

    const result = await settlementModel.aggregate([
      {
        $facet: {
          // Get opening balance
          openingBalance: [
            {
              $match: {
                cmp_id: cmp_id,
                sourceId: new mongoose.Types.ObjectId(id),
                sourceType: partyTypeFilter,
                ...openingDateFilter,
              },
            },
            {
              $group: {
                _id: null,
                settlementOpening: { $sum: "$amount" },
              },
            },
            {
              $lookup: {
                from: "parties",
                let: { sourceId: new mongoose.Types.ObjectId(id) },
                pipeline: [
                  {
                    $match: {
                      $expr: { $eq: ["$_id", "$$sourceId"] }
                    }
                  },
                  {
                    $project: {
                      openingBalanceAmount: 1
                    }
                  }
                ],
                as: "account"
              }
            },
            {
              $project: {
                openingBalance: {
                  $add: [
                    { $ifNull: ["$settlementOpening", 0] },
                    { $ifNull: [{ $arrayElemAt: ["$account.openingBalanceAmount", 0] }, 0] }
                  ]
                }
              }
            }
          ],
          
          // Get current period transactions
          transactions: [
            {
              $match: {
                cmp_id: cmp_id,
                sourceId: new mongoose.Types.ObjectId(id),
                sourceType: partyTypeFilter,
                ...dateFilter,
              },
            },
            {
              $project: {
                voucherNumber: 1,
                _id: "$voucherId",
                party_name: "$partyName",
                enteredAmount: "$amount",
                createdAt: "$settlement_date",
                payment_mode: 1,
                type: {
                  $switch: {
                    branches: [
                      { case: { $eq: ["$voucherType", "receipt"] }, then: "Receipt" },
                      { case: { $eq: ["$voucherType", "payment"] }, then: "Payment" },
                      { case: { $eq: ["$voucherType", "sales"] }, then: "Tax Invoice" },
                    ],
                    default: "$voucherType",
                  },
                },
              },
            },
            {
              $sort: { createdAt: -1 }
            }
          ],
          
          // Get summary stats
          summary: [
            {
              $match: {
                cmp_id: cmp_id,
                sourceId: new mongoose.Types.ObjectId(id),
                sourceType: partyTypeFilter,
                ...dateFilter,
              },
            },
            {
              $group: {
                _id: null,
                count: { $sum: 1 },
                total: { $sum: "$amount" },
              },
            },
          ],
        },
      },
    ]);

    const openingBalance = result[0].openingBalance[0]?.openingBalance || 0;
    const transactions = result[0].transactions || [];
    const summary = result[0].summary[0] || { count: 0, total: 0 };

    return res.status(200).json({
      message: "Transactions found successfully",
      success: true,
      data: {
        settlements: transactions,
        count: summary.count,
        total: summary.total,
        openingBalance: openingBalance,
      },
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      error: "Internal Server Error",
      details: error.message,
    });
  }
};

// @desc  add cash
// route get/api/sUsers/addCash

export const addCash = async (req, res) => {
  const { cash_ledname, cash_opening = 0, cmp_id } = req.body;

  const Primary_user_id = req.owner;
  const Secondary_user_id = req.sUserId;

  try {
    const session = await mongoose.startSession();
    session.startTransaction();

    const accountGroupData = await accountGroup
      .findOne({
        cmp_id: cmp_id,
        accountGroup: "Cash-in-Hand",
      })
      .session(session);

    // Create cash entry as Party with partyType = 'Cash'
    const cashData = {
      // Common fields
      Primary_user_id,
      Secondary_user_id,
      cmp_id,
      partyType: "cash",
      // Account classification
      accountGroup: accountGroupData?._id,
      // Basic info
      partyName: cash_ledname, // Cash ledger name as party name
      party_master_id: "temp_" + Date.now(),
      // Opening balance
      openingBalanceAmount: cash_opening,
    };

    // Create and save cash party
    const cashParty = new partyModel(cashData);
    const result = await cashParty.save({ session });

    // Update party_master_id with the MongoDB _id
    result.party_master_id = result._id.toString();
    await result.save({ session });

    await session.commitTransaction();
    session.endSession();

    return res.status(200).json({
      success: true,
      message: "Cash account added successfully",
    });
  } catch (error) {
    console.error("Cash entry error:", error);

    // Handle duplicate party_master_id error
    if (error.code === 11000 && error.keyPattern?.party_master_id) {
      return res.status(400).json({
        success: false,
        message: "Cash account ID already exists, please try again",
      });
    }

    return res.status(500).json({
      success: false,
      message: "Failed to add cash account, please try again!",
    });
  }
};

// @desc  get cash details
// route get/api/sUsers/getCashDetails

export const getCashDetails = async (req, res) => {
  try {
    const cashId = req?.params?.cash_id;
    if (!cashId) {
      return res
        .status(400)
        .json({ success: false, message: "Cash is required" });
    }

    const cashDetails = await partyModel.findById(cashId);

    if (!cashDetails) {
      return res
        .status(404)
        .json({ success: false, message: "Cash details not found" });
    }

    return res.status(200).json({ success: true, data: cashDetails });
  } catch (error) {
    console.error(`Error fetching cash details: ${error.message}`);

    return res
      .status(500)
      .json({ success: false, message: "Internal server error, try again!" });
  }
};

// @desc  edit edit bank details
// route get/api/sUsers/editBank

export const editCash = async (req, res) => {
  const cash_id = req.params.cash_id;
  const { cash_ledname, cash_opening = 0, cmp_id } = req.body;
  try {
    // Create cash entry as Party with partyType = 'Cash'
    const cashData = {
      partyName: cash_ledname,
      // Opening balance
      openingBalanceAmount: cash_opening,
    };

    const updatedCash = await partyModel.findOneAndUpdate(
      { _id: cash_id },
      cashData,
      { new: true }
    );

    updatedCash.save();
    res.status(200).json({
      success: true,
      message: "Cash updated successfully",
      data: updatedCash,
    });
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    console.error(error);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};

// Helper function to determine which model to use based on the route
const getModelAndType = (req) => {
  const isOD = req.path.toLowerCase().includes("od");
  return {
    model: isOD ? BankOdModel : bankModel,
    type: isOD ? "Bank OD A/c" : "Bank Accounts",
    name: isOD ? "Bank OD" : "Bank",
  };
};

// @desc Add a new bank or bank OD
// @route POST /api/sUsers/addBank/:cmp_id or /api/sUsers/addBankOD/:cmp_id

export const addBankEntry = async (req, res) => {
  const {
    acholder_name,
    ac_no,
    ifsc,
    bank_name,
    branch,
    upi_id,
    cmp_id,
    bank_opening,
  } = req.body;

  const Primary_user_id = req.pUserId || req.owner;
  const Secondary_user_id = req.sUserId;

  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    // Generate placeholder party_master_id (will be updated with _id after save)
    const party_master_id = "temp_" + Date.now();
    const accountGroupData = await accountGroup
      .findOne({
        cmp_id: cmp_id,
        accountGroup: "Bank Accounts",
      })
      .session(session);

    // Create bank entry as Party with partyType = 'Bank'
    const bankData = {
      // Common fields
      Primary_user_id,
      Secondary_user_id,
      cmp_id,
      partyType: "bank",

      // Account classification
      accountGroup: accountGroupData?._id,

      // Basic info
      partyName: bank_name, // Bank name as party name
      party_master_id,
      // Opening balance
      openingBalanceAmount: bank_opening || 0,

      // Bank-specific fields
      acholder_name,
      ac_no,
      ifsc,
      bank_name,
      branch,
      upi_id,
    };

    // Create and save bank party
    const bankParty = new partyModel(bankData);
    const result = await bankParty.save({ session });

    // Update party_master_id with the MongoDB _id
    result.party_master_id = result._id.toString();
    await result.save({ session });

    await session.commitTransaction();
    session.endSession();

    return res.status(200).json({
      success: true,
      message: "Bank account added successfully",
    });
  } catch (error) {
    // Rollback transaction on error
    if (session) {
      await session.abortTransaction();
      session.endSession();
    }

    console.error("Bank entry error:", error);

    // Handle duplicate party_master_id error
    if (error.code === 11000 && error.keyPattern?.party_master_id) {
      return res.status(400).json({
        success: false,
        message: "Bank ID already exists, please try again",
      });
    }

    return res.status(500).json({
      success: false,
      message: "Failed to add bank account, please try again!",
    });
  }
};

// @desc Edit bank or bank OD details
// @route PUT /api/sUsers/editBank/:cmp_id/:bank_id or /api/sUsers/editBankOD/:cmp_id/:bank_id
export const editBankEntry = async (req, res) => {
  const bank_id = req.params.bank_id;

  const {
    acholder_name,
    ac_no,
    ifsc,
    bank_name,
    branch,
    upi_id,
    cmp_id,
    bank_opening,
  } = req.body;

  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    // Create bank entry as Party with partyType = 'Bank'
    const bankData = {
      // Common fields
      Primary_user_id: req?.owner,
      Secondary_user_id: req?.sUserId,
      cmp_id,
      partyType: "bank",

      // Basic info
      partyName: bank_name,
      party_master_id: bank_id,
      // Opening balance
      openingBalanceAmount: bank_opening || 0,

      // Bank-specific fields
      acholder_name,
      ac_no,
      ifsc,
      bank_name,
      branch,
      upi_id,
    };
    const updatedEntry = await partyModel.findOneAndUpdate(
      { _id: bank_id },
      bankData,
      { new: true, session }
    );

    if (!updatedEntry) {
      await session.abortTransaction();
      session.endSession();
      return res.status(404).json({
        success: false,
        message: `Bank account not found`,
      });
    }

    await updatedEntry.save({ session });

    await session.commitTransaction();
    session.endSession();

    res.status(200).json({
      success: true,
      message: `Bank account updated successfully`,
      data: updatedEntry,
    });
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    console.error(error);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};

// @desc Get bank or bank OD details
// @route GET /api/sUsers/getBankDetails/:cmp_id/:bank_id or /api/sUsers/getBankODDetails/:cmp_id/:bank_id
export const getBankEntryDetails = async (req, res) => {
  try {
    const bankId = req?.params?.bank_id;

    if (!bankId) {
      return res
        .status(400)
        .json({ success: false, message: `Bank ID is required` });
    }

    const entryDetails = await partyModel.findById(bankId);

    if (!entryDetails) {
      return res
        .status(404)
        .json({ success: false, message: `Bank details not found` });
    }

    return res.status(200).json({ success: true, data: entryDetails });
  } catch (error) {
    console.error(
      `Error fetching ${getModelAndType(req).name.toLowerCase()} details: ${
        error.message
      }`
    );

    return res
      .status(500)
      .json({ success: false, message: "Internal server error, try again!" });
  }
};
