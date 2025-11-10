import mongoose from "mongoose";
import Sales from "../models/salesModel.js";
import SaleOrder from "../models/invoiceModel.js";
import Party from "../models/partyModel.js";
import Purchases from "../models/purchaseModel.js";
import Invoices from "../models/invoiceModel.js";
import CreditNotes from "../models/creditNoteModel.js";
import Settlement from "../models/settlementModel.js";
import DebitNotes from "../models/debitNoteModel.js";
import VanSales from "../models/vanSaleModel.js";
import Receipts from "../models/receiptModel.js";
import Payments from "../models/paymentModel.js";
import ProductModel from "../models/productModel.js";
import purchaseModel from "../models/purchaseModel.js";
import primaryUserModel from "../models/primaryUserModel.js";
import OragnizationModel from "../models/OragnizationModel.js";
import secondaryUserModel from "../models/secondaryUserModel.js";
import AccountGroup from "../models/accountGroup.js";
import PartyModel from "../models/partyModel.js";
import { accountGroups03 } from "../../frontend/constants/accountGroups.js";
import TallyData from "../models/TallyData.js";

/**
 * @description Updates the `date` field in documents where it is missing
 * by using the `createdAt` field as the value. This is useful for
 * backfilling the `date` field in legacy data.
 */
export const updateDateFields = async (req, res) => {
  try {
    // List of collections to process
    const collections = [
      "sales",
      "purchases",
      "invoices",
      "creditnotes",
      "debitnotes",
      "vansales",
      "receipts",
      "payments",
    ];

    const results = [];
    const failedDocuments = [];

    for (const collectionName of collections) {
      const collection = mongoose.connection.collection(collectionName);

      // Find documents missing the `date` field
      const documents = await collection
        .find({ date: { $exists: false } })
        .toArray();

      console.log(
        `Processing ${documents.length} documents in ${collectionName}`
      );

      let successCount = 0;

      for (const doc of documents) {
        try {
          if (doc.createdAt) {
            // Convert `createdAt` to local date with time set to midnight
            const createdAtDate = new Date(doc.createdAt);
            createdAtDate.setHours(0, 0, 0, 0);

            // Update the document with the new `date` field
            await collection.updateOne(
              { _id: doc._id },
              { $set: { date: createdAtDate } }
            );
            successCount++;
          } else {
            failedDocuments.push({ id: doc._id, collection: collectionName });
          }
        } catch (error) {
          console.error(`Failed to update document ${doc._id}:`, error.message);
          failedDocuments.push({ id: doc._id, collection: collectionName });
        }
      }

      results.push({
        collection: collectionName,
        totalDocuments: documents.length,
        successCount,
        failureCount: documents.length - successCount,
      });
    }

    return res.status(200).json({
      message: "Date fields updated with results.",
      results,
      failedDocuments,
    });
  } catch (error) {
    console.error("Error updating date fields:", error);
    return res.status(500).json({
      message: "Failed to update date fields.",
      error: error.message,
    });
  }
};

/**
 * @desc Updates `date` fields of sales, purchases, invoices, creditnotes, debitnotes, vansales, receipts, and payments
 *        by taking the `createdAt` field and setting the time to midnight.
 * @route PUT /api/testing/updateDateFields/:cmp_id
 * @access Private
 */
export const updateDateFieldsByCompany = async (req, res) => {
  try {
    const { cmp_id } = req.params;
    if (!cmp_id) {
      return res.status(400).json({
        message: "Missing cmp_id parameter.",
      });
    }

    const models = {
      sales: Sales,
      purchases: Purchases,
      invoices: Invoices,
      creditnotes: CreditNotes,
      debitnotes: DebitNotes,
      vansales: VanSales,
      receipts: Receipts,
      payments: Payments,
    };

    const results = [];
    const failedDocuments = [];

    for (const [collectionName, model] of Object.entries(models)) {
      // console.log("model", model);
      // console.log("cmp_id", cmp_id);
      const documents = await model.find({});
      console.log(
        `Processing ${documents.length} documents in ${collectionName} for cmp_id: ${cmp_id}`
      );

      let successCount = 0;
      for (const doc of documents) {
        try {
          if (doc.createdAt) {
            // Simply create new date and set time to midnight
            const dateObj = new Date(doc.createdAt);
            dateObj.setUTCHours(0, 0, 0, 0); // Using setUTCHours to ensure consistency

            await model.updateOne(
              { _id: doc._id },
              { $set: { date: dateObj } }
            );
            successCount++;
          } else {
            failedDocuments.push({ id: doc._id, collection: collectionName });
          }
        } catch (error) {
          console.error(`Failed to update document ${doc._id}:`, error.message);
          failedDocuments.push({ id: doc._id, collection: collectionName });
        }
      }

      results.push({
        collection: collectionName,
        totalDocuments: documents.length,
        successCount,
        failureCount: documents.length - successCount,
      });
    }

    return res.status(200).json({
      message: "Date fields updated with results.",
      cmp_id,
      results,
      failedDocuments,
    });
  } catch (error) {
    console.error("Error updating date fields:", error);
    return res.status(500).json({
      message: "Failed to update date fields.",
      error: error.message,
    });
  }
};

/**
 * @desc Updates unit fields of a product by removing any '-' (hyphen) from the unit and alt_unit fields.
 * @route PUT /api/testing/updateUnitFields/:cmp_id
 * @access Private
 */
export const updateUnitFields = async (req, res) => {
  try {
    // Find all products and update the unit and alt_unit fields
    const result = await ProductModel.updateMany(
      {}, // Empty filter to match all documents
      [
        {
          $set: {
            unit: {
              $arrayElemAt: [
                { $split: ["$unit", "-"] }, // Split 'unit' on '-' and get the first part
                0,
              ],
            },
            alt_unit: {
              $arrayElemAt: [
                { $split: ["$alt_unit", "-"] }, // Split 'alt_unit' on '-' and get the first part
                0,
              ],
            },
          },
        },
      ]
    );

    return res.status(200).json({
      message: "Unit fields updated for all products.",
      modifiedCount: result.modifiedCount,
    });
  } catch (error) {
    console.error("Error updating all unit fields:", error);
    return res.status(500).json({
      message: "An error occurred while updating unit fields for all products.",
      error: error.message,
    });
  }
};

export const updateSalesItemUnitFields = async (req, res) => {
  try {
    // Find all sales documents and update the unit and alt_unit fields in items array
    // const result = await salesModel.updateMany(
    const result = await purchaseModel.updateMany(
      {}, // Empty filter to match all documents
      [
        {
          $set: {
            items: {
              $map: {
                input: "$items",
                as: "item",
                in: {
                  $mergeObjects: [
                    "$$item",
                    {
                      unit: {
                        $arrayElemAt: [{ $split: ["$$item.unit", "-"] }, 0],
                      },
                      alt_unit: {
                        $cond: {
                          if: { $eq: ["$$item.alt_unit", ""] },
                          then: "",
                          else: {
                            $arrayElemAt: [
                              { $split: ["$$item.alt_unit", "-"] },
                              0,
                            ],
                          },
                        },
                      },
                    },
                  ],
                },
              },
            },
          },
        },
      ]
    );

    return res.status(200).json({
      message: "Unit fields updated for all sales items.",
      modifiedCount: result.modifiedCount,
    });
  } catch (error) {
    console.error("Error updating sales items unit fields:", error);
    return res.status(500).json({
      message: "An error occurred while updating unit fields for sales items.",
      error: error.message,
    });
  }
};

export const convertPrimaryToSecondary = async (req, res) => {
  try {
    const primaryUsers = await primaryUserModel.find({});
    if (!primaryUsers || primaryUsers.length === 0) {
      return res.status(404).json({ message: "No primary users found" });
    }

    for (const user of primaryUsers) {
      const existingSecondary = await secondaryUserModel.findOne({
        // email: user.email,
        mobile: user.mobile,
      });

      if (existingSecondary) {
        console.log(
          `User with email ${user.email} and mobile ${user.mobile} already exists as a secondary user.`
        );
        // continue; // Skip conversion if already exists
      }

      const organizations = await OragnizationModel.find({ owner: user._id });

      const secondaryUser = new secondaryUserModel({
        name: user.userName,
        email: user.email,
        mobile: user.mobile,
        password: user.password,
        organization: organizations.map((org) => org._id),
        primaryUser: user._id,
        role: "admin",
      });

      await secondaryUser.save();
      console.log("Converted primary user to secondary:", secondaryUser);
    }

    return res.status(200).json({
      message:
        "Primary users successfully converted to secondary users where applicable.",
    });
  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .json({ message: "Error in converting primary to secondary" });
  }
};

// creating account groups for companies which are self
export const createAccountGroups = async (req, res) => {
  try {
    const selfCompanies = await OragnizationModel.find({ type: "self" }).select(
      "_id owner"
    );

    for (const company of selfCompanies) {
      // Fetch existing account groups for the company
      const existingGroups = await AccountGroup.find({
        cmp_id: company._id,
      }).select("accountGroup");

      // Extract existing group names
      const existingGroupNames = new Set(
        existingGroups.map((group) => group.accountGroup)
      );

      // Filter out groups that don't exist
      const newGroups = accountGroups03.filter(
        (group) => !existingGroupNames.has(group)
      );

      if (newGroups.length > 0) {
        const accountGroupsToInsert = newGroups.map((group) => {
          const generatedId = new mongoose.Types.ObjectId(); // Generate unique _id
          return {
            _id: generatedId, // Ensure _id is set
            cmp_id: company._id.toString(),
            Primary_user_id: company.owner,
            accountGroup: group,
            accountGroup_id: generatedId.toString(), // Ensure accountGroup_id matches _id
          };
        });

        await AccountGroup.insertMany(accountGroupsToInsert); // Bulk insert
      }
    }

    res.status(200).json({
      message: "Account groups created successfully (if not existing)",
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error in creating account groups" });
  }
};

/// adding account groups id to all parties
export const addAccountGroupIdToParties = async (req, res) => {
  try {
    const selfCompanies = await OragnizationModel.find({ type: "self" }).select(
      "_id"
    );

    // console.log("selfCompanies", selfCompanies.map(item => item._id.toString()));

    for (const company of selfCompanies) {
      const sundryDebtor = await AccountGroup.findOne({
        cmp_id: company._id,
        accountGroup: "Sundry Debtors",
      })
        .select("_id")
        .lean();

      const sundryCreditor = await AccountGroup.findOne({
        cmp_id: company._id,
        accountGroup: "Sundry Creditors",
      })
        .select("_id")
        .lean();

      console.log("sundryDebtor:", sundryDebtor);
      console.log("sundryCreditor:", sundryCreditor);

      if (!sundryDebtor || !sundryCreditor) {
        console.warn(`Missing account groups for company ${company._id}`);
        continue; // Skip this company if either group is missing
      }

      const parties = await PartyModel.find({ cmp_id: company._id }).select(
        "_id accountGroup"
      );

      // console.log(parties);

      for (const party of parties) {
        let accountGroupId = null;

        if (party.accountGroup === "Sundry Debtors") {
          accountGroupId = sundryDebtor._id;
        } else if (party.accountGroup === "Sundry Creditors") {
          accountGroupId = sundryCreditor._id;
        }

        if (accountGroupId) {
          const updatedParty = await PartyModel.findByIdAndUpdate(
            party._id,
            { $set: { accountGroup_id: accountGroupId } },
            { new: true }
          );
          // console.log("Updated Party:", updatedParty);
        }
      }
    }

    res
      .status(200)
      .json({ message: "Account group IDs added to parties successfully" });
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ message: "Error in updating parties with account group IDs" });
  }
};

/// adding account groups id to outstanding
export const addAccountGroupIdToOutstanding = async (req, res) => {
  try {
    const selfCompanies = await OragnizationModel.find({ type: "self" }).select(
      "_id owner"
    );

    for (const company of selfCompanies) {
      const outstanding = await TallyData.find({ cmp_id: company._id });

      const partyIds = outstanding.map((item) => item.party_id).filter(Boolean);
      const parties = await PartyModel.find({
        party_master_id: { $in: partyIds },
        accountGroup: { $in: ["Sundry Debtors", "Sundry Creditors"] },
      }).select("party_master_id accountGroup accountGroup_id");

      const partyMap = new Map(
        parties.map((party) => [party.party_master_id.toString(), party])
      );

      for (const item of outstanding) {
        const party = partyMap.get(item.party_id?.toString());

        if (
          party &&
          party.accountGroup &&
          party.accountGroup_id &&
          (!item.accountGroup || !item.accountGroup_id)
        ) {
          await TallyData.updateOne(
            { _id: item._id },
            {
              $set: {
                accountGroup: party.accountGroup,
                accountGroup_id: party.accountGroup_id,
              },
            }
          );
        }
      }
    }

    res.status(200).json({
      message: "Account groups added to outstanding records successfully",
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error in updating outstanding records" });
  }
};

export const deleteDuplicateParties = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  const cmp_id = "688328045d8692c9405bee91";

  try {
    // Step 1: Find all duplicate parties for specific company
    const duplicates = await Party.aggregate([
      {
        $match: { cmp_id: new mongoose.Types.ObjectId(cmp_id) },
      },
      {
        $group: {
          _id: "$partyName",
          count: { $sum: 1 },
          ids: { $push: "$_id" },
          docs: { $push: "$$ROOT" },
        },
      },
      {
        $match: {
          count: { $gt: 1 },
        },
      },
      {
        $sort: { _id: 1 },
      },
    ]);

    let deletedCount = 0;
    let updatedReferences = {
      sales: 0,
      saleOrders: 0,
      receipts: 0,
      outstandings: 0,
      settlements: 0, // Add settlement counter
    };

    // Step 2: Process each duplicate group
    for (const duplicate of duplicates) {
      const partyName = duplicate._id;
      const allIds = duplicate.ids;

      // Keep the first party
      const keepId = allIds[0];
      const deleteIds = allIds.slice(1);

      console.log(`Processing: ${partyName}`);
      console.log(`Keeping: ${keepId}`);
      console.log(`Deleting: ${deleteIds.join(", ")}`);

      // Step 3: Update references in Sale collection
      const saleUpdateResult = await Sales.updateMany(
        {
          "party._id": { $in: deleteIds },
          cmp_id: new mongoose.Types.ObjectId(cmp_id),
        },
        { $set: { "party._id": keepId } },
        { session }
      );
      updatedReferences.sales += saleUpdateResult.modifiedCount;

      // Step 4: Update references in SaleOrder collection
      const saleOrderUpdateResult = await SaleOrder.updateMany(
        {
          "party._id": { $in: deleteIds },
          cmp_id: new mongoose.Types.ObjectId(cmp_id),
        },
        { $set: { "party._id": keepId } },
        { session }
      );
      updatedReferences.saleOrders += saleOrderUpdateResult.modifiedCount;

      // Step 5: Update references in Receipt collection
      const receiptUpdateResult = await Receipts.updateMany(
        {
          "party._id": { $in: deleteIds },
          cmp_id: new mongoose.Types.ObjectId(cmp_id),
        },
        { $set: { "party._id": keepId } },
        { session }
      );
      updatedReferences.receipts += receiptUpdateResult.modifiedCount;

      // Step 6: Update references in Outstanding collection (party_id field)
      const outstandingUpdateResult = await TallyData.updateMany(
        {
          party_id: { $in: deleteIds },
          cmp_id: new mongoose.Types.ObjectId(cmp_id),
        },
        { $set: { party_id: keepId } },
        { session }
      );
      updatedReferences.outstandings += outstandingUpdateResult.modifiedCount;

      // Step 7: Update references in Settlement collection (party_id field)
      const settlementUpdateResult = await Settlement.updateMany(
        {
          partyId: { $in: deleteIds },
          cmp_id: new mongoose.Types.ObjectId(cmp_id),
        },
        { $set: { partyId: keepId } },
        { session }
      );
      updatedReferences.settlements += settlementUpdateResult.modifiedCount;

      // Step 8: Delete duplicate parties (only from this company)
      const deleteResult = await Party.deleteMany(
        {
          _id: { $in: deleteIds },
          cmp_id: new mongoose.Types.ObjectId(cmp_id),
        },
        { session }
      );
      deletedCount += deleteResult.deletedCount;
    }

    // Commit the transaction
    await session.commitTransaction();

    res.status(200).json({
      success: true,
      message: "Duplicate parties processed successfully",
      data: {
        companyId: cmp_id,
        duplicateGroupsProcessed: duplicates.length,
        partiesDeleted: deletedCount,
        referencesUpdated: updatedReferences,
        details: duplicates.map((d) => ({
          partyName: d._id,
          duplicateCount: d.count,
        })),
      },
    });
  } catch (error) {
    // Rollback transaction on error
    await session.abortTransaction();
    console.error("Error processing duplicates:", error);

    res.status(500).json({
      success: false,
      message: "Failed to process duplicate parties",
      error: error.message,
    });
  } finally {
    session.endSession();
  }
};

// Preview function with cmp_id filter
export const previewDuplicateParties = async (req, res) => {
  const cmp_id = "688328045d8692c9405bee91";

  try {
    const duplicates = await Party.aggregate([
      {
        $match: { cmp_id: new mongoose.Types.ObjectId(cmp_id) },
      },
      {
        $group: {
          _id: "$partyName",
          count: { $sum: 1 },
          ids: { $push: "$_id" },
        },
      },
      {
        $match: {
          count: { $gt: 1 },
        },
      },
      {
        $sort: { _id: 1 },
      },
    ]);

    const preview = [];

    for (const duplicate of duplicates) {
      const deleteIds = duplicate.ids.slice(1);

      // Check references with cmp_id filter
      const salesCount = await Sales.countDocuments({
        "party._id": { $in: deleteIds },
        cmp_id: new mongoose.Types.ObjectId(cmp_id),
      });

      const saleOrdersCount = await SaleOrder.countDocuments({
        "party._id": { $in: deleteIds },
        cmp_id: new mongoose.Types.ObjectId(cmp_id),
      });

      const receiptsCount = await Receipts.countDocuments({
        "party._id": { $in: deleteIds },
        cmp_id: new mongoose.Types.ObjectId(cmp_id),
      });

      // Check outstanding references (party_id field)
      const outstandingsCount = await TallyData.countDocuments({
        party_id: { $in: deleteIds },
        cmp_id: new mongoose.Types.ObjectId(cmp_id),
      });

      // Check settlement references (party_id field)
      const settlementsCount = await Settlement.countDocuments({
        partyId: { $in: deleteIds },
        cmp_id: new mongoose.Types.ObjectId(cmp_id),
      });

      preview.push({
        partyName: duplicate._id,
        totalDuplicates: duplicate.count,
        keepId: duplicate.ids[0],
        deleteIds: deleteIds,
        affectedRecords: {
          sales: salesCount,
          saleOrders: saleOrdersCount,
          receipts: receiptsCount,
          outstandings: outstandingsCount,
          settlements: settlementsCount,
        },
      });
    }

    res.status(200).json({
      success: true,
      companyId: cmp_id,
      totalDuplicateGroups: duplicates.length,
      preview: preview,
    });
  } catch (error) {
    console.error("Error previewing duplicates:", error);
    res.status(500).json({
      success: false,
      message: "Failed to preview duplicates",
      error: error.message,
    });
  }
};

//// creating outstanding form a sale
export const createOutstandingFromSales = async (req, res) => {
  try {
    const { saleId } = req.params;
    const sale = await Sales.findById(saleId);

    if (!sale) {
      return res.status(404).json({ message: "Sale not found" });
    }

    const outstanding = new TallyData({
      cmp_id: sale.cmp_id,
      Primary_user_id: sale.Primary_user_id,
      accountGroup: sale.party.accountGroup_id,
      subGroup: sale.party.subGroup,
      party_id: sale.party._id,
      party_name: sale.party.partyName,
      mobile_no: sale.party?.mobileNumber,
      bill_date: sale.date,
      bill_due_date: sale.date,
      bill_no: sale.salesNumber,
      source: "sale",
      classification: "Dr",
      bill_amount: sale.finalOutstandingAmount,
      bill_pending_amt: sale.finalOutstandingAmount,
    });

    await outstanding.save();
    res.status(201).json({
      message: "Outstanding created from sale successfully",
      outstanding,
    });
  } catch (error) {
    console.error("Error creating outstanding from sale:", error);
    res.status(500).json({
      message: "Failed to create outstanding from sale",
      error: error.message,
    });
  }
};
