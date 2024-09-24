import TallyData from "../models/TallyData.js";

/**
 * @desc  get outstanding data from tally
 * @route GET/api/sUsers/fetchOutstandingDetails
 * @access Public
 */

export const fetchOutstandingDetails = async (req, res) => {
  const partyId = req.params.party_id;
  const cmp_id = req.params.cmp_id;
  const voucher=req.query.voucher;

  let sourceMatch={};
  if(voucher==="receipt"){
    sourceMatch = { source: {$in :["sale","debitNote"]} };
      
  }else if(voucher==="payment"){
    sourceMatch = { source: {$in:["purchase", "creditNote"]} };
  }
  try {
    const outstandings = await TallyData.find({
      party_id: partyId,
      cmp_id: cmp_id,
      bill_pending_amt: { $gt: 0 },
      ...sourceMatch
    }).sort({ bill_date: 1 });
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
