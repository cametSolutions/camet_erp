import mongoose from "mongoose";
import TallyData from "../models/TallyData.js";

/**
 * @description
 * Get outstanding summary for a company
 * @route GET /api/outstanding/summary/:cmp_id
 * @param {string} cmp_id - company ID
 * @returns {object} - outstanding summary containing party_id, party_name, accountGroup, group_name, total_bill_amount, total_pending_amount, final_balance, and an array of bills
 */

export const getOutstandingSummary = async (req, res) => {
  try {
    const cmp_id = req.params.cmp_id;

    const summary = await TallyData.aggregate([
      // Match documents by company ID
      { $match: { cmp_id: new mongoose.Types.ObjectId(cmp_id) } },

      // Add computed fields for bill age
      {
        $addFields: {
          current_date: new Date(), // Get current date
          bill_due_date: { $toDate: "$bill_due_date" }, // Ensure date format
        },
      },

      // Compute bill age in days (difference between current date and due date)
      {
        $addFields: {
          age_of_bill: {
            $dateDiff: {
              startDate: "$bill_due_date",
              endDate: "$current_date",
              unit: "day",
            },
          },
        },
      },

      // Group by party_id and accumulate total amounts + bills
      {
        $group: {
          _id: "$party_id",
          party_name: { $first: "$party_name" },
          accountGroup: { $first: "$accountGroup" },
          group_name: { $first: "$group_name" },
          total_bill_amount: { $sum: "$bill_amount" },
          total_pending_amount: { $sum: "$bill_pending_amt" },
          bills: {
            $push: {
              bill_no: "$bill_no",
              bill_date: "$bill_date",
              bill_amount: "$bill_amount",
              bill_due_date: "$bill_due_date",
              bill_pending_amt: "$bill_pending_amt",
              bill_id: "$bill_id",
              age_of_bill: "$age_of_bill", // Age of bill in days
              classification: "$classification",
            },
          },
        },
      },

      // Sort by party_name
      { $sort: { party_name: 1 } },

      // Rename _id field to party_id and round amounts
      {
        $project: {
          party_id: "$_id",
          _id: 0,
          party_name: 1,
          accountGroup: 1,
          group_name: 1,
          total_bill_amount: { $round: ["$total_bill_amount", 2] },
          total_pending_amount: { $round: ["$total_pending_amount", 2] },
          total_final_balance: { $round: ["$total_pending_amount", 2] }, // Final Balance as bill_pending_amt
          bills: 1,
        },
      },
    ]);

    if (!summary.length) {
      return res.status(404).json({ message: "No documents found" });
    }

    res.status(200).json({
      success: true,
      count: summary.length,
      data: summary,
    });
  } catch (error) {
    console.log(error);

    res.status(500).json({
      success: false,
      message: "Error retrieving outstanding summary",
      error: error.message,
    });
  }
};

/**
 * @description
 * Get total outstanding amount for all parties of a company
 * @route GET /api/outstanding/total/:cmp_id
 * @param {string} cmp_id - company ID
 * @returns {object} - outstanding summary containing party_id, party_name, total_bill_amount, and user_id
 */
export const fetchOutstandingTotal = async (req, res) => {
  const { cmp_id } = req.params;
  const { type } = req.query; // "ledger", "group", "payables", "receivables"
  const Primary_user_id = req?.owner;

  try {
    if (type === "ledger") {
      const matchStage = {
        $match: {
          cmp_id: new mongoose.Types.ObjectId(cmp_id),
          Primary_user_id: new mongoose.Types.ObjectId(Primary_user_id),
        },
      };
      // Original ledger-wise data logic
      const ledgerData = await TallyData.aggregate([
        matchStage,
        {
          $group: {
            _id: "$party_id",
            totalDr: {
              $sum: {
                $cond: [
                  { $eq: ["$classification", "Dr"] },
                  "$bill_pending_amt",
                  0,
                ],
              },
            },
            totalCr: {
              $sum: {
                $cond: [
                  { $eq: ["$classification", "Cr"] },
                  "$bill_pending_amt",
                  0,
                ],
              },
            },
            party_name: { $first: "$party_name" },
            cmp_id: { $first: "$cmp_id" },
            user_id: { $first: "$user_id" },
            group_name: { $first: "$group_name" },
            group_name_id: { $first: "$group_name_id" },
            accountGroup: { $first: "$accountGroup" },
          },
        },
        {
          $addFields: {
            totalBillAmount: { $abs: { $subtract: ["$totalDr", "$totalCr"] } },
            classification: {
              $cond: {
                if: { $gt: [{ $subtract: ["$totalDr", "$totalCr"] }, 0] },
                then: "Dr",
                else: "Cr",
              },
            },
          },
        },
        { $sort: { party_name: 1 } },
      ]);

      let totalOutstandingDrCr = 0;
      let totalOutstandingPayable = 0;
      let totalOutstandingReceivable = 0;

      ledgerData.forEach((item) => {
        if (item.classification === "Cr") {
          totalOutstandingPayable += item.totalBillAmount;
        } else {
          totalOutstandingReceivable += item.totalBillAmount;
        }
        totalOutstandingDrCr = Math.abs(
          totalOutstandingReceivable - totalOutstandingPayable
        );
      });

      return res.status(200).json({
        outstandingData: ledgerData,
        totalOutstandingDrCr,
        totalOutstandingPayable,
        totalOutstandingReceivable,
        message: "Ledger-wise tally data fetched",
      });
    }

    if (type === "payables" || type === "receivables") {
      const matchClassification = type === "payables" ? "Cr" : "Dr";

      const outstandingData = await TallyData.aggregate([
        {
          $match: {
            cmp_id: new mongoose.Types.ObjectId(cmp_id),
            Primary_user_id,
            classification: matchClassification,
          },
        },
        {
          $group: {
            _id: "$party_id",
            totalBillAmount: { $sum: "$bill_pending_amt" },
            party_name: { $first: "$party_name" },
            cmp_id: { $first: "$cmp_id" },
            user_id: { $first: "$user_id" },
            group_name: { $first: "$group_name" },
            group_name_id: { $first: "$group_name_id" },
            accountGroup: { $first: "$accountGroup" },
            classification: { $first: "$classification" },
          },
        },
        { $sort: { party_name: 1 } },
      ]);

      const totalOutstanding = outstandingData.reduce(
        (sum, item) => sum + item.totalBillAmount,
        0
      );

      return res.status(200).json({
        outstandingData,
        totalOutstanding,
        message: `${
          type.charAt(0).toUpperCase() + type.slice(1)
        } tally data fetched`,
      });
    }

    if (type === "group") {
      const groupData = await TallyData.aggregate([
        {
          $match: {
            cmp_id,
            Primary_user_id,
            accountGroup_id: { $ne: null }, // Exclude documents with null accountGroup_id
            accountGroup: { $ne: null }, // Exclude documents with null accountGroup
          },
        },
        {
          $group: {
            _id: {
              accountGroup_id: "$accountGroup_id", // Include account group ID
              accountGroup: "$accountGroup", // Include account group name
              subGroup_id: { $ifNull: ["$subGroup_id", null] }, // Handle missing sub-group
              party_id: "$party_id",
            },
            party_name: { $first: "$party_name" },
            subGroup: { $first: "$subGroup" },
            totalDr: {
              $sum: {
                $cond: [
                  { $eq: ["$classification", "Dr"] },
                  "$bill_pending_amt",
                  0,
                ],
              },
            },
            totalCr: {
              $sum: {
                $cond: [
                  { $eq: ["$classification", "Cr"] },
                  "$bill_pending_amt",
                  0,
                ],
              },
            },
            cmp_id: { $first: "$cmp_id" },
            user_id: { $first: "$user_id" },
            classification: { $first: "$classification" },
          },
        },
        {
          $group: {
            _id: {
              accountGroup_id: "$_id.accountGroup_id",
              accountGroup: "$_id.accountGroup",
              subGroup_id: "$_id.subGroup_id",
            },
            subGroup: { $first: "$subGroup" },
            totalDr: { $sum: "$totalDr" },
            totalCr: { $sum: "$totalCr" },
            bills: {
              $push: {
                party_id: "$_id.party_id",
                party_name: "$party_name",
                bill_pending_amt: {
                  $abs: { $sum: { $subtract: ["$totalDr", "$totalCr"] } },
                },
                cmp_id: "$cmp_id",
                user_id: "$user_id",
                classification: {
                  $cond: {
                    if: { $gt: [{ $subtract: ["$totalDr", "$totalCr"] }, 0] },
                    then: "Dr",
                    else: "Cr",
                  },
                },
              },
            },
          },
        },
        {
          $group: {
            _id: {
              accountGroup_id: "$_id.accountGroup_id",
              accountGroup: "$_id.accountGroup",
            },
            totalDr: { $sum: "$totalDr" },
            totalCr: { $sum: "$totalCr" },
            totalAmount: {
              $sum: { $abs: { $subtract: ["$totalDr", "$totalCr"] } },
            },
            subgroups: {
              $push: {
                subGroup_id: "$_id.subGroup_id",
                subGroup: { $ifNull: ["$subGroup", null] }, // Keep null sub-groups separate
                totalAmount: { $abs: { $subtract: ["$totalDr", "$totalCr"] } },
                classification: {
                  $cond: {
                    if: { $gt: [{ $subtract: ["$totalDr", "$totalCr"] }, 0] },
                    then: "Dr",
                    else: "Cr",
                  },
                },
                bills: "$bills",
              },
            },
          },
        },
        { $sort: { "_id.accountGroup": 1 } },
      ]);

      // Separate subgroups and those without a subgroup
      let totalOutstandingPayable = 0;
      let totalOutstandingReceivable = 0;
      let totalOutstandingDrCr = 0;

      const finalGroupData = groupData.map((group) => {
        const subgroupBills = group.subgroups.filter(
          (sg) => sg.subGroup_id !== null
        );
        const directBills = group.subgroups
          .filter((sg) => sg.subGroup_id === null)
          .flatMap((sg) => sg.bills);

        const totalAmount = group.totalAmount;
        // totalOutstandingDrCr += totalAmount;

        if (group.totalDr > group.totalCr) {
          totalOutstandingReceivable += totalAmount;
        } else {
          totalOutstandingPayable += totalAmount;
        }

        return {
          accountGroup_id: group._id.accountGroup_id, // Include account group ID
          accountGroup: group._id.accountGroup, // Include account group name
          totalAmount,
          classification: group.totalDr > group.totalCr ? "Dr" : "Cr",
          subgroups: subgroupBills,
          bills: directBills, // Bills without a sub-group go directly under the account group
        };
      });

      // Ensure totalOutstandingDrCr is the absolute difference
      totalOutstandingDrCr = Math.abs(
        totalOutstandingReceivable - totalOutstandingPayable
      );

      return res.status(200).json({
        outstandingData: finalGroupData,
        totalOutstandingPayable,
        totalOutstandingReceivable,
        totalOutstandingDrCr,
        message: "Group-wise tally data fetched",
      });
    }

    return res.status(400).json({ message: "Invalid type parameter provided" });
  } catch (error) {
    console.log(error);

    return res.status(500).json({
      success: false,
      message: "Internal server error, try again!",
    });
  }
};

/**
 * @desc  get outstanding data from tally
 * @route GET/api/sUsers/fetchOutstandingDetails
 * @access Public
 */

export const fetchOutstandingDetails = async (req, res) => {
  const partyId = req.params.party_id;
  const cmp_id = req.params.cmp_id;
  const voucher = req.query.voucher;

  let sourceMatch = {};
  if (voucher === "receipt") {
    sourceMatch = { classification: "Dr" };
  } else if (voucher === "payment") {
    sourceMatch = { classification: "Cr" };
  }


  
  try {
    const outstandings = await TallyData.find({
      party_id: new mongoose.Types.ObjectId(partyId),
      cmp_id: cmp_id,
      bill_pending_amt: { $gt: 0 },
      isCancelled: false,
      ...sourceMatch,
    })
      .sort({ bill_date: 1 })
      .select(
        "_id bill_no billId bill_date bill_pending_amt source bill_date classification"
      );

    if (outstandings) {
      return res.status(200).json({
        totalOutstandingAmount: outstandings.reduce(
          (total, out) => total + out.bill_pending_amt,
          0
        ),
        outstandings: outstandings,
        message: "outstandings fetched",
      });
    } else {
      return res
        .status(404)
        .json({ message: "No outstandings were found for user" });
    }
  } catch (error) {
    console.log(error);
    return res
      .status(500)
      .json({ success: false, message: "Internal server error, try again!" });
  }
};
