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
      { $match: { cmp_id: cmp_id } },

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
  const Primary_user_id = req.owner.toString();

  try {
    if (type === "ledger") {
      // Original ledger-wise data logic
      const ledgerData = await TallyData.aggregate([
        { $match: { cmp_id, Primary_user_id } },
        {
          $group: {
            _id: "$party_id",
            totalDr: { $sum: { $cond: [{ $eq: ["$classification", "Dr"] }, "$bill_pending_amt", 0] } },
            totalCr: { $sum: { $cond: [{ $eq: ["$classification", "Cr"] }, "$bill_pending_amt", 0] } },
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
              $cond: { if: { $gt: [{ $subtract: ["$totalDr", "$totalCr"] }, 0] }, then: "Dr", else: "Cr" },
            },
          },
        },
        { $sort: { party_name: 1 } },
      ]);

      let totalOutstandingDrCr = 0;
      let totalOutstandingPayable = 0;
      let totalOutstandingReceivable = 0;

      ledgerData.forEach((item) => {
        totalOutstandingDrCr += item.totalDr + item.totalCr;
        totalOutstandingPayable += item.totalCr;
        totalOutstandingReceivable += item.totalDr;
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
        { $match: { 
          cmp_id, 
          Primary_user_id,
          classification: matchClassification 
        }},
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
            classification: { $first: "$classification" }
          },
        },
        { $sort: { party_name: 1 } },
      ]);

      const totalOutstanding = outstandingData.reduce((sum, item) => sum + item.totalBillAmount, 0);

      return res.status(200).json({
        outstandingData,
        totalOutstanding,
        message: `${type.charAt(0).toUpperCase() + type.slice(1)} tally data fetched`,
      });
    }

    if (type === "group") {
      // Original group-wise logic remains unchanged
      const groupData = await TallyData.aggregate([
        { $match: { cmp_id, Primary_user_id } },
        {
          $group: {
            _id: { accountGroup: "$accountGroup", group_name_id: "$group_name_id" },
            group_name: { $first: "$group_name" },
            totalDr: { $sum: { $cond: [{ $eq: ["$classification", "Dr"] }, "$bill_pending_amt", 0] } },
            totalCr: { $sum: { $cond: [{ $eq: ["$classification", "Cr"] }, "$bill_pending_amt", 0] } },
            bills: {
              $push: {
                party_id: "$party_id",
                party_name: "$party_name",
                bill_pending_amt: "$bill_pending_amt",
                cmp_id: "$cmp_id",
                user_id: "$user_id",
                classification: "$classification",
              },
            },
          },
        },
        {
          $addFields: {
            totalAmount: { $abs: { $subtract: ["$totalDr", "$totalCr"] } },
            classification: {
              $cond: { if: { $gt: [{ $subtract: ["$totalDr", "$totalCr"] }, 0] }, then: "Dr", else: "Cr" },
            },
          },
        },
        {
          $group: {
            _id: "$_id.accountGroup",
            totalAmount: { $sum: "$totalAmount" },
            subgroups: {
              $push: {
                group_name_id: "$_id.group_name_id",
                group_name: "$group_name",
                totalAmount: "$totalAmount",
                classification: "$classification",
                bills: "$bills",
              },
            },
          },
        },
        { $sort: { _id: 1 } },
      ]);

      let totalOutstandingDrCr = 0;
      let totalOutstandingPayable = 0;
      let totalOutstandingReceivable = 0;

      groupData.forEach((item) => {
        totalOutstandingDrCr += item.totalAmount;
        if (item.totalAmount > 0) {
          totalOutstandingReceivable += item.totalAmount;
        } else {
          totalOutstandingPayable += Math.abs(item.totalAmount);
        }
      });

      return res.status(200).json({
        outstandingData: groupData,
        totalOutstandingDrCr,
        totalOutstandingPayable,
        totalOutstandingReceivable,
        message: "Group-wise tally data fetched",
      });
    }

    return res.status(400).json({ message: "Invalid type parameter provided" });
  } catch (error) {
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
      party_id: partyId,
      cmp_id: cmp_id,
      bill_pending_amt: { $gt: 0 },
      isCancelled: false,
      ...sourceMatch,
    })
      .sort({ bill_date: 1 })
      .select("bill_no billId bill_date bill_pending_amt source bill_date classification");

      
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
    return res
      .status(500)
      .json({ success: false, message: "Internal server error, try again!" });
  }
};
