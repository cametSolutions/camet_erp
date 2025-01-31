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
  const cmp_id = req.params.cmp_id;
  const Primary_user_id = req.owner.toString();

  try {
    // const tallyData = await TallyData.find({ Primary_user_id: userId });
    const outstandingData = await TallyData.aggregate([
      { $match: { cmp_id: cmp_id, Primary_user_id: Primary_user_id } },
      {
        $group: {
          _id: "$party_id",
          totalBillAmount: { $sum: "$bill_pending_amt" },
          party_name: { $first: "$party_name" },
          cmp_id: { $first: "$cmp_id" },
          user_id: { $first: "$user_id" },
        },
      },
    ]);

    outstandingData.sort((a, b) => a.party_name.localeCompare(b.party_name));

    if (outstandingData) {
      return res.status(200).json({
        outstandingData: outstandingData,
        message: "tallyData fetched",
      });
    } else {
      return res
        .status(404)
        .json({ message: "No outstandingData were found for user" });
    }
  } catch (error) {
    return res
      .status(500)
      .json({ success: false, message: "Internal server error, try again!" });
  }
};
