import partyModel from "../models/partyModel.js";
import OragnizationModel from "../models/OragnizationModel.js";
import { countries } from "../../frontend/constants/countries.js";
import mongoose from "mongoose";

/// truncate to n decimals

export const truncateToNDecimals = (num, n) => {
  const parts = num.toString().split(".");
  if (parts.length === 1) return num; // No decimal part
  parts[1] = parts[1].substring(0, n); // Truncate the decimal part
  return parseFloat(parts.join("."));
};

///// formatting  date to local date


export const formatToLocalDate = async (date, cmp_id, session) => {
  try {
    // Fetch the organization details using the company ID and session
    const company = await OragnizationModel.findById(cmp_id).session(session);
    if (!company) {
      throw new Error("Company not found");
    }

    // Get the country associated with the company
    const countryName = company.country;

    // Find the timezone for the given country
    const countryData = countries.find((country) => country.countryName === countryName);
    if (!countryData) {
      throw new Error("Country not found in the list");
    }

    const timezone = countryData.timeZone;

    // Convert to the local date based on the timezone
    const localDate = new Date(date).toLocaleString("en-US", { timeZone: timezone });

    // Convert back to a Date object
    const dateObj = new Date(localDate);

    // Set the time to 00:00:00.000 in local timezone
    dateObj.setHours(0, 0, 0, 0);

    // Convert to UTC by creating a new Date with the same date and resetting timezone
    const utcDate = new Date(Date.UTC(dateObj.getFullYear(), dateObj.getMonth(), dateObj.getDate()));
    // console.log("utcDate:", utcDate);
    

    return utcDate; // This is now in UTC with time set to 00:00:00.000
  } catch (error) {
    console.error("Error formatting date:", error.message);
    throw error;
  }
};




///formatting amount with comma

export const formatAmount = (amount) => {
  return amount.toLocaleString("en-IN", { maximumFractionDigits: 2 });
};

/////helper for transactions

export const aggregateTransactions = (
  model,
  matchCriteria,
  type,
  voucherNumber
) => {
  return model.aggregate([
    { $match: matchCriteria },
    {
      $addFields: {
        Secondary_user_idObj: { $toObjectId: "$Secondary_user_id" },
      },
    },
    {
      $lookup: {
        from: "secondaryusers",
        localField: "Secondary_user_idObj",
        foreignField: "_id",
        as: "secondaryUser",
        pipeline: [{ $project: { name: 1, _id: 0 } }],
      },
    },
    { $unwind: { path: "$secondaryUser", preserveNullAndEmptyArrays: true } },
    {
      $project: {
        voucherNumber: `$${voucherNumber}`,
        party_name: "$party.partyName",
        accountGroup: "$party.accountGroup",
        type: type,
        enteredAmount:
          type === "Receipt" || type === "Payment"
            ? "$enteredAmount"
            : "$finalAmount",
        createdAt: 1,
        isCancelled: 1,
        paymentMethod: 1,
        secondaryUserName: "$secondaryUser.name",
        balanceAmount: {
          $toString: {
            $ifNull: [
              "$paymentSplittingData.balanceAmount",
              type === "Receipt" || type === "Payment"
                ? "$enteredAmount"
                : "$finalAmount",
            ],
          },
        },
        // cashTotal: {
        //   $toString: {
        //     $ifNull: [
        //       '$paymentSplittingData.cashTotal',
        //       "0"
        //     ]
        //   }
        // },
        cashTotal: {
          $toString: {
            $cond: {
              if: { $ifNull: ["$paymentSplittingData.cashTotal", false] },
              then: "$paymentSplittingData.cashTotal",
              else: {
                $cond: {
                  if: { $eq: ["$party.accountGroup", "Cash-in-Hand"] },
                  then: {
                    $cond: {
                      if: {
                        $or: [
                          { $eq: [type, "Receipt"] },
                          { $eq: [type, "Payment"] },
                        ],
                      },
                      then: "$enteredAmount",
                      else: "$finalAmount",
                    },
                  },
                  else: "0",
                },
              },
            },
          },
        },
      },
    },
  ]);
};

// Function to aggregate opening balance with proper string-to-number conversion
export const aggregateOpeningBalance = async (
  model,
  matchCriteria,
  transactionType
) => {
  try {
    const amountField =
      transactionType === "Receipt" || transactionType === "Payment"
        ? "enteredAmount"
        : "finalAmount";

    const result = await model.aggregate([
      { $match: matchCriteria },
      {
        $addFields: {
          numericAmount: {
            $toDouble: { $ifNull: [`$${amountField}`, 0] },
          },
        },
      },
      {
        $group: {
          _id: null,
          total: { $sum: "$numericAmount" },
        },
      },
    ]);

    return result.length > 0 ? result[0].total : 0;
  } catch (error) {
    console.error(
      `Error calculating opening balance for ${transactionType}:`,
      error
    );
    return 0;
  }
};

/// corresponding party creation while creating cash and bank

export const addCorrespondingParty = async (
  ledname,
  Primary_user_id,
  cmp_id,
  accountGroup,
  masterId,
  session
) => {
  try {
    const newParty = new partyModel({
      partyName: ledname,
      accountGroup: accountGroup,
      cmp_id: cmp_id,
      Primary_user_id: Primary_user_id,
      party_master_id: masterId, // Set this directly during creation
    });

    await newParty.save({ session }); // Save within the session
  } catch (error) {
    console.error("Error adding corresponding party:", error);
    throw error; // Propagate the error
  }
};

/// edit corresponding party

export const editCorrespondingParty = async (
  ledname,
  Primary_user_id,
  cmp_id,
  accountGroup,
  masterId,
  session
) => {
  try {
    // Find the existing party to update
    const existingParty = await partyModel.findOne({
      party_master_id: masterId,
      cmp_id: cmp_id,
      Primary_user_id: Primary_user_id,
    });

    if (!existingParty) {
      return;
    }

    // Update the existing party details
    existingParty.partyName = ledname;
    // existingParty.accountGroup = accountGroup;

    // Save the updated party within the session
    await existingParty.save({ session });

    return existingParty;
  } catch (error) {
    console.error("Error editing corresponding party:", error);
    throw error; // Propagate the error
  }
};

//// get email service

export const getEmailService = (email) => {
  const domain = email.split("@")[1].toLowerCase();
  if (domain.includes("gmail")) return "gmail";
  if (domain.includes("hotmail")) return "hotmail";
  if (domain.includes("yahoo")) return "yahoo";
  if (domain.includes("outlook")) return "outlook";
  return "smtp"; // Default to SMTP if no known domain
};
