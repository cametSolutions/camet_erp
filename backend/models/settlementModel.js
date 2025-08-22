import mongoose from "mongoose";

// Settlement Collection Schema
const settlementSchema = new mongoose.Schema(
  {
    // Core Settlement Information
    voucherNumber: {
      type: String,
      required: true,
      index: true, // For faster voucher lookups
    },
    voucherId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      refPath: "voucherModel", // Dynamic reference
    },
    voucherModel: {
      type: String,
      required: true,
      enum: ["Receipt", "Payment", "Sales"], // Model names (capitalized)
    },
    voucherType: {
      type: String,
      required: true,
      enum: ["receipt", "payment", "sales"], // For business logic/filtering
    },

    // Amount and Financial Details
    amount: {
      type: Number,
      required: true,
      min: 0, // Ensure positive amounts
    },
    payment_mode: {
      type: String,
      required: true,
      default:null,
      enum: ["cash", "bank", "cheque", "upi", "card", "online_transfer"],
    },

    // Party Information (who paid/received from)
    partyId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Party",
      required: true,
      index: true, // Individual index for party lookups
    },
    partyName: {
      type: String,
      required: true, // Denormalized for faster queries
    },

    // Settlements is only for cash or bank, outstanding is created for rest parties
    partyType: {
      type: String,
      required: true,
     enum: ["cash", "bank", "party"], // Define the types of parties
      index: true, // Individual index for filtering by party type
    },

    // source information like cash or bank account or credit
    sourceId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Party",
      required: true,
      index: true, // Individual index for party lookups
    },
    // Settlements is only for cash or bank, outstanding is created for rest parties
    sourceType: {
      type: String,
      required: true,
      enum: ["cash", "bank", "party"], // Define the types of parties
      index: true, // Individual index for filtering by party type
    },

    // Company and User Context
    cmp_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Organization",
      required: true,
      index: true, // For company-wise data segregation
    },
    Primary_user_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "PrimaryUser",
      required: true,
    },

    // Date Information
    settlement_date: {
      type: Date,
      required: true,
      index: true, // For date range queries
    },
    voucher_date: {
      type: Date,
      required: true,
    },
  },
  {
    timestamps: true, // created_at and updated_at
  }
);

// ============= OPTIMIZED COMPOUND INDEXES =============

// 1. Primary business query: Company-wise settlements with date sorting
settlementSchema.index({ cmp_id: 1, settlement_date: -1 });

// 2. Party statements: Get all settlements for a specific party (cash/bank) with date sorting
settlementSchema.index({ cmp_id: 1, partyId: 1, settlement_date: -1 });

// 3. Party type filtering: Get all cash or bank settlements for a company
settlementSchema.index({ cmp_id: 1, partyType: 1, settlement_date: -1 });

// 4. Voucher type reports: Receipt/Payment/Sales reports by company
settlementSchema.index({ cmp_id: 1, voucherType: 1, settlement_date: -1 });

// 5. Payment mode analysis: Track different payment methods
settlementSchema.index({ cmp_id: 1, payment_mode: 1, settlement_date: -1 });

// 6. Voucher number lookups: Fast voucher search within company
settlementSchema.index({ cmp_id: 1, voucherNumber: 1 });

// 7. User-specific queries: Settlements created by specific primary user
settlementSchema.index({ cmp_id: 1, Primary_user_id: 1, settlement_date: -1 });

// 8. Combined party and voucher type: Specific party's receipts/payments/sales
settlementSchema.index({ cmp_id: 1, partyId: 1, voucherType: 1, settlement_date: -1 });

// 9. Date range with party type: Monthly/yearly reports for cash vs bank
settlementSchema.index({ cmp_id: 1, partyType: 1, voucher_date: -1 });

// 10. Voucher reference lookup: Find settlements by voucher ID
settlementSchema.index({ cmp_id: 1, voucherId: 1 });

// ============= TEXT INDEX FOR SEARCH =============
// Optional: If you need to search by party names or voucher numbers
settlementSchema.index({ 
  partyName: "text", 
  voucherNumber: "text" 
}, {
  name: "settlement_text_search"
});

export default mongoose.model("Settlement", settlementSchema);