import mongoose from "mongoose";
import cashModel from "../models/cashModel.js";
import { addCorrespondingParty, editCorrespondingParty } from "../helpers/helper.js";
import bankModel from "../models/bankModel.js";
import BankOdModel from "../models/bankOdModel.js";
import { startOfDay, endOfDay, parseISO } from "date-fns";


// @desc find source balances
// route get/api/sUsers/findSourceBalance

export const findSourceBalance = async (req, res) => {
    const cmp_id = new mongoose.Types.ObjectId(req.params.cmp_id);
  const { startOfDayParam, endOfDayParam } = req.query;

  // Initialize dateFilter for settlements.created_at
  let dateFilter = {};
  if (startOfDayParam && endOfDayParam) {
    const startDate = parseISO(startOfDayParam);
    const endDate = parseISO(endOfDayParam);
    dateFilter = {
      "settlements.created_at": {
        $gte: startOfDay(startDate),
        $lte: endOfDay(endDate),
      },
    };
  }
  // else if (todayOnly === "true") {
  //   dateFilter = {
  //     "settlements.created_at": {
  //       $gte: startOfDay(new Date()),
  //       $lte: endOfDay(new Date()),
  //     },
  //   };
  // }
  try {
    const bankTotal = await bankModel.aggregate([
      {
        $match: {
          cmp_id: cmp_id,
          settlements: { $exists: true, $ne: [] },
        },
      },
      {
        $unwind: "$settlements",
      },
      {
        $match: dateFilter,
      },
      {
        $group: {
          _id: null,
          totalAmount: { $sum: "$settlements.amount" },
        },
      },
    ]);

    // Aggregation pipeline for cash collection
    const cashTotal = await cashModel.aggregate([
      {
        $match: {
          settlements: { $exists: true, $ne: [] },
          cmp_id: cmp_id,
        },
      },
      {
        $unwind: "$settlements",
      },

      {
        $match: dateFilter,
      },
      {
        $group: {
          _id: null,
          totalAmount: { $sum: "$settlements.amount" },
        },
      },
    ]);

    // console.log("cashTotal", cashTotal);

    // Extract totals or set to 0 if no settlements found
    const bankSettlementTotal =
      bankTotal.length > 0 ? bankTotal[0].totalAmount : 0;
    const cashSettlementTotal =
      cashTotal.length > 0 ? cashTotal[0].totalAmount : 0;
    const grandTotal = bankSettlementTotal + cashSettlementTotal;

    return res.status(200).json({
      message: "Balance found successfully",
      success: true,
      bankSettlementTotal,
      cashSettlementTotal,
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

  const { accountGroup, startOfDayParam, endOfDayParam, todayOnly } = req.query;

  // Initialize dateFilter for settlements.created_at
  let dateFilter = {};
  if (startOfDayParam && endOfDayParam) {
    const startDate = parseISO(startOfDayParam);
    const endDate = parseISO(endOfDayParam);
    dateFilter = {
      $gte: startOfDay(startDate),
      $lte: endOfDay(endDate),
    };
  } else if (todayOnly === "true") {
    dateFilter = {
      $gte: startOfDay(new Date()),
      $lte: endOfDay(new Date()),
    };
  }

  try {
    let model;
    let nameField;

    switch (accountGroup) {
      case "cashInHand":
        model = cashModel;
        nameField = "cash_ledname";
        break;
      case "bankBalance":
        model = bankModel;
        nameField = "bank_ledname";
        break;
      case "bankOd":
        model = BankOdModel;
        nameField = "bank_ledname";
        break;
      default:
        return res.status(400).json({ message: "Invalid account group" });
    }

    const balanceDetails = await model.aggregate([
      {
        $match: {
          cmp_id: cmp_id, // Match by company ID initially
        },
      },
      {
        $project: {
          name: `$${nameField}`,
          settlements: {
            $cond: {
              if: { $isArray: "$settlements" },
              then: "$settlements",
              else: [],
            },
          },
          originalId: "$_id",
        },
      },
      {
        $unwind: {
          path: "$settlements",
          preserveNullAndEmptyArrays: true, // Keep documents even if no settlements
        },
      },
      {
        $project: {
          name: 1,
          originalId: 1,
          settlement: {
            $cond: [
              {
                $and: [
                  { $ifNull: ["$settlements", false] },
                  {
                    $gte: [
                      "$settlements.created_at",
                      dateFilter.$gte || new Date(0),
                    ],
                  },
                  {
                    $lte: [
                      "$settlements.created_at",
                      dateFilter.$lte || new Date(),
                    ],
                  },
                ],
              },
              "$settlements",
              null,
            ],
          },
        },
      },
      {
        $group: {
          _id: "$originalId",
          name: { $first: "$name" },
          settlementTotal: {
            $sum: {
              $cond: [
                { $ifNull: ["$settlement.amount", false] },
                "$settlement.amount",
                0,
              ],
            },
          },
        },
      },
      {
        $sort: { name: 1 }, // Sort by name alphabetically
      },
    ]);

    return res.status(200).json({
      message: "Balance details found successfully",
      success: true,
      accountGroup,
      data: balanceDetails.map((detail) => ({
        _id: detail._id,
        name: detail.name,
        total: detail.settlementTotal || 0, // Ensure zero if no total
      })),
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      error: "Internal Server Error",
      details: error.message,
    });
  }
};

// @desc find source transactions
// route get/api/sUsers/findSourceTransactions

export const findSourceTransactions = async (req, res) => {
  const {  id } = req.params;
  const cmp_id = new mongoose.Types.ObjectId(req.params.cmp_id);

  const { startOfDayParam, endOfDayParam, accGroup } = req.query;

  try {
    let dateFilter = {};
    let openingBalanceFilter = {};
    if (startOfDayParam && endOfDayParam) {
      const startDate = parseISO(startOfDayParam);
      const endDate = parseISO(endOfDayParam);

      dateFilter = {
        "settlements.created_at": {
          $gte: startOfDay(startDate),
          $lte: endOfDay(endDate),
        },
      };

      // Filter for opening balance (before start date)
      openingBalanceFilter = {
        "settlements.created_at": {
          $lt: startOfDay(startDate),
        },
      };
    }

    let model;
    let openingField;
    switch (accGroup) {
      case "cashInHand":
        model = cashModel;
        openingField = "cash_opening";
        break;
      case "bankBalance":
        model = bankModel;
        openingField = "bank_opening";
        break;
      default:
        return res.status(400).json({ message: "Invalid account group" });
    }

    const [openingBalanceResult, transactions] = await Promise.all([
      // First pipeline to calculate opening balance
      model.aggregate([
        {
          $match: {
            _id: new mongoose.Types.ObjectId(id),
            cmp_id: cmp_id,
          },
        },
        {
          $project: {
            [openingField]: 1, // Include opening field
            settlements: {
              $cond: {
                if: { $isArray: "$settlements" },
                then: "$settlements",
                else: [],
              },
            },
          },
        },
        {
          $unwind: {
            path: "$settlements",
            preserveNullAndEmptyArrays: true,
          },
        },
        {
          $match: openingBalanceFilter,
        },
        {
          $group: {
            _id: null,
            calculatedOpeningBalance: { $sum: "$settlements.amount" },
            openingField: { $first: `$${openingField}` }, // Retrieve opening field value
          },
        },
        {
          $project: {
            _id: 0,
            openingBalance: {
              $add: ["$calculatedOpeningBalance", "$openingField"], // Combine calculated and opening field
            },
          },
        },
      ]),

      // Second pipeline to get current period transactions
      model.aggregate([
        {
          $match: {
            _id: new mongoose.Types.ObjectId(id),
            cmp_id: cmp_id,
          },
        },
        {
          $project: {
            settlements: {
              $cond: {
                if: { $isArray: "$settlements" },
                then: "$settlements",
                else: [],
              },
            },
          },
        },
        {
          $unwind: {
            path: "$settlements",
            preserveNullAndEmptyArrays: true,
          },
        },
        {
          $match: dateFilter,
        },
        {
          $group: {
            _id: null,
            settlements: { $push: "$settlements" },
            count: { $sum: 1 },
            total: { $sum: "$settlements.amount" },
          },
        },
        {
          $project: {
            _id: 0,
            settlements: {
              $map: {
                input: "$settlements",
                as: "settlement",
                in: {
                  voucherNumber: "$$settlement.voucherNumber",
                  _id: "$$settlement.voucherId",
                  party_name: "$$settlement.party",
                  enteredAmount: "$$settlement.amount",
                  createdAt: "$$settlement.created_at",
                  payment_mode: "$$settlement.payment_mode",
                  type: {
                    $switch: {
                      branches: [
                        {
                          case: { $eq: ["$$settlement.voucherType", "receipt"] },
                          then: "Receipt",
                        },
                        {
                          case: { $eq: ["$$settlement.voucherType", "payment"] },
                          then: "Payment",
                        },
                        {
                          case: { $eq: ["$$settlement.voucherType", "sale"] },
                          then: "Tax Invoice",
                        },
                        {
                          case: { $eq: ["$$settlement.voucherType", "vanSale"] },
                          then: "Van Sale",
                        },
                        {
                          case: { $eq: ["$$settlement.voucherType", "purchase"] },
                          then: "Purchase",
                        },
                        {
                          case: { $eq: ["$$settlement.voucherType", "creditNote"] },
                          then: "Credit Note",
                        },
                        {
                          case: { $eq: ["$$settlement.voucherType", "debitNote"] },
                          then: "Debit Note",
                        },
                      ],
                      default: "$$settlement.voucherType",
                    },
                  },
                },
              },
            },
            count: 1,
            total: 1,
          },
        },
      ]),
    ]);

    // Handle case when no transactions are found
    if (!transactions.length) {
      return res.status(200).json({
        message: "No transactions found for the specified period",
        success: true,
        data: {
          settlements: [],
          total: 0,
          count: 0,
          openingBalance: 0,
        },
      });
    }

    return res.status(200).json({
      message: "Transactions found successfully",
      success: true,
      data: {
        ...transactions[0],
        openingBalance: openingBalanceResult[0]?.openingBalance || 0,
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
  const { cash_ledname, cash_opening, cmp_id } = req.body;
  const Primary_user_id = req.pUserId || req.owner;
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const cash = await cashModel({
      cash_ledname,
      cash_opening,
      Primary_user_id,
      cmp_id,
    });

    const result = await cash.save({ session });

    result.cash_id = result._id;
    await result.save();

    await addCorrespondingParty(
      cash_ledname,
      Primary_user_id,
      cmp_id,
      "Cash-in-Hand",
      result._id,
      session
    );

    await session.commitTransaction();
    session.endSession();
    return res
      .status(200)
      .json({ success: true, message: "Cash added successfully" });
  } catch (error) {
    session.abortTransaction();
    session.endSession();
    console.error(error);
    return res
      .status(500)
      .json({ success: false, message: "Internal server error, try again!" });
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

    const cashDetails = await cashModel.findById(cashId);

    if (!cashDetails) {
      return res
        .status(404)
        .json({ success: false, message: "Bank details not found" });
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
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    const updatedCash = await cashModel.findOneAndUpdate(
      { _id: cash_id },
      req.body,
      { new: true }
    );

    updatedCash.cash_id = updatedCash._id;
    updatedCash.save({ session });

    //// update corresponding party
    await editCorrespondingParty(
      updatedCash.cash_ledname,
      updatedCash.Primary_user_id,
      updatedCash.cmp_id,
      "Cash-in-Hand",
      updatedCash._id,
      session
    );

    await session.commitTransaction();
    session.endSession();
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



// @desc  Add bank
// route post/api/sUsers/addBank

// export const addBank = async (req, res) => {
//     const {
//       acholder_name,
//       ac_no,
//       ifsc,
//       bank_name,
//       branch,
//       upi_id,
//       cmp_id,
//       bank_opening,
//     } = req.body;
//     const Primary_user_id = req.pUserId || req.owner;
//     const bank_ledname = bank_name;
  
//     try {
//       const session = await mongoose.startSession();
//       session.startTransaction();
//       const bank = await bankModel({
//         acholder_name,
//         ac_no,
//         ifsc,
//         bank_name,
//         branch,
//         upi_id,
//         cmp_id,
//         Primary_user_id,
//         bank_ledname,
//         bank_opening,
//       });
  
//       const result = await bank.save();
  
//       result.bank_id = result._id;
//       await result.save({ session });
  
//       await addCorrespondingParty(
//         bank_name,
//         Primary_user_id,
//         cmp_id,
//         "Bank Accounts",
//         result._id,
//         session
//       );
  
//       await session.commitTransaction();
//       session.endSession();
//       return res.status(200).json({
//         success: true,
//         message: "Bank added successfully",
//         data: result,
//       });
//     } catch (error) {
//       console.error(error);
//       return res
//         .status(500)
//         .json({ success: false, message: "Internal server error, try again!" });
//     }
//   };
//   // @desc Edit bank details
//   // route post/api/sUsers/editBank
  
//   export const editBank = async (req, res) => {
//     const bank_id = req.params.bank_id;
  
//     const session = await mongoose.startSession();
//     session.startTransaction();
  
//     try {
//       const udatedBank = await bankModel.findOneAndUpdate(
//         { _id: bank_id },
//         req.body,
//         { new: true }
//       );
  
//       udatedBank.bank_id = udatedBank._id;
//       udatedBank.bank_ledname = udatedBank.bank_name;
//       udatedBank.save({ session });
  
//       //// update corresponding party
//       await editCorrespondingParty(
//         udatedBank.bank_ledname,
//         udatedBank.Primary_user_id,
//         udatedBank.cmp_id,
//         "Bank Accounts",
//         udatedBank._id,
//         session
//       );
  
//       await session.commitTransaction();
//       session.endSession();
  
//       res.status(200).json({
//         success: true,
//         message: "Bank updated successfully",
//         data: udatedBank,
//       });
//     } catch (error) {
//       await session.abortTransaction();
//       session.endSession();
//       console.error(error);
//       res.status(500).json({ success: false, message: "Internal Server Error" });
//     }
//   };
  
//     // @desc Get bank details
//   // route get/api/sUsers/getBankDetails
//   export const getBankDetails = async (req, res) => {
//     try {
//       const bankId = req?.params?.bank_id;
//       if (!bankId) {
//         return res
//           .status(400)
//           .json({ success: false, message: "Bank ID is required" });
//       }
  
//       const bankDetails = await bankModel.findById(bankId);
  
//       if (!bankDetails) {
//         return res
//           .status(404)
//           .json({ success: false, message: "Bank details not found" });
//       }
  
//       return res.status(200).json({ success: true, data: bankDetails });
//     } catch (error) {
//       console.error(`Error fetching bank details: ${error.message}`);
  
//       return res
//         .status(500)
//         .json({ success: false, message: "Internal server error, try again!" });
//     }
//   };


// Helper function to determine which model to use based on the route
const getModelAndType = (req) => {
  const isOD = req.path.toLowerCase().includes('od');
  return {
    model: isOD ? BankOdModel : bankModel,
    type: isOD ? "Bank OD A/c" : "Bank Accounts",
    name: isOD ? "Bank OD" : "Bank"
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
    // od_limit // Optional, only for OD
  } = req.body;
  
  const Primary_user_id = req.pUserId || req.owner;
  const bank_ledname = bank_name;
  const { model, type, name } = getModelAndType(req);

  try {
    const session = await mongoose.startSession();
    session.startTransaction();
    
    // Create basic bank data object
    const bankData = {
      acholder_name,
      ac_no,
      ifsc,
      bank_name,
      branch,
      upi_id,
      cmp_id,
      Primary_user_id,
      bank_ledname,
      bank_opening
    };
    
    // Add OD specific fields if it's an OD entry
    // if (type === "Bank OD Accounts" && od_limit) {
    //   bankData.od_limit = od_limit;
    // }
    
    const bank = await model(bankData);
    const result = await bank.save({ session });

    result.bank_id = result._id;
    await result.save({ session });

    await addCorrespondingParty(
      bank_name,
      Primary_user_id,
      cmp_id,
      type,
      result._id,
      session
    );

    await session.commitTransaction();
    session.endSession();
    
    return res.status(200).json({
      success: true,
      message: `${name} added successfully`,
      data: result,
    });
  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .json({ success: false, message: "Internal server error, try again!" });
  }
};

// @desc Edit bank or bank OD details
// @route PUT /api/sUsers/editBank/:cmp_id/:bank_id or /api/sUsers/editBankOD/:cmp_id/:bank_id
export const editBankEntry = async (req, res) => {
  const bank_id = req.params.bank_id;
  const { model, type, name } = getModelAndType(req);

  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const updatedEntry = await model.findOneAndUpdate(
      { _id: bank_id },
      req.body,
      { new: true, session }
    );

    if (!updatedEntry) {
      await session.abortTransaction();
      session.endSession();
      return res.status(404).json({ 
        success: false, 
        message: `${name} not found` 
      });
    }

    updatedEntry.bank_id = updatedEntry._id;
    updatedEntry.bank_ledname = updatedEntry.bank_name;
    await updatedEntry.save({ session });

    // Update corresponding party
    await editCorrespondingParty(
      updatedEntry.bank_ledname,
      updatedEntry.Primary_user_id,
      updatedEntry.cmp_id,
      type,
      updatedEntry._id,
      session
    );

    await session.commitTransaction();
    session.endSession();

    res.status(200).json({
      success: true,
      message: `${name} updated successfully`,
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
    const { model, name } = getModelAndType(req);
    
    if (!bankId) {
      return res
        .status(400)
        .json({ success: false, message: `${name} ID is required` });
    }

    const entryDetails = await model.findById(bankId);

    if (!entryDetails) {
      return res
        .status(404)
        .json({ success: false, message: `${name} details not found` });
    }

    return res.status(200).json({ success: true, data: entryDetails });
  } catch (error) {
    console.error(`Error fetching ${getModelAndType(req).name.toLowerCase()} details: ${error.message}`);

    return res
      .status(500)
      .json({ success: false, message: "Internal server error, try again!" });
  }
};

// @desc Get all banks or bank ODs for a company
// @route GET /api/sUsers/getAllBanks/:cmp_id or /api/sUsers/getAllBankODs/:cmp_id
// export const getAllBankEntries = async (req, res) => {
//   try {
//     const cmp_id = req.params.cmp_id;
//     const { model } = getModelAndType(req);
    
//     const entries = await model.find({ cmp_id });
    
//     return res.status(200).json({
//       success: true,
//       data: entries
//     });
//   } catch (error) {
//     console.error(`Error fetching ${getModelAndType(req).name.toLowerCase()} entries: ${error.message}`);
//     return res
//       .status(500)
//       .json({ success: false, message: "Internal server error, try again!" });
//   }
// };
