import mongoose from "mongoose";

const BankDetailsSchema = new mongoose.Schema({
  cmp_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Organization",
    required: true,
  },
  Primary_user_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "PrimaryUser",
    required: true,
  },
  bank_ledname: { type: String, required: true },
  bank_grpname: { type: String },
  bank_childgrpname: { type: String },
  acholder_name: { type: String },
  bank_id: { type: String },
  ac_no: { type: String },
  ifsc: { type: String },
  swift_code: { type: String },
  bank_name: { type: String },
  branch: { type: String },
  bank_opening: { type: Number, default: 0 },
  upi_id: { type: String },
  bsr_code: { type: String },
  client_code: { type: String, default: null },
  settlements: [
    {
      voucherNumber: { type: String, required: true },
      voucherId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        refPath: "settlements.voucherModel", // Dynamic reference based on voucherModel
      },
      voucherModel: {
        type: String,
        required: true,
        enum: ["Receipt", "Payment"], // Model names (capitalized)
      },
      voucherType: {
        type: String,
        required: true,
        enum: ["receipt", "payment"], // For business logic/filtering
      },
      amount: { type: Number, required: true },
      created_at: { type: Date, required: true, index: true },
      payment_mode: {
        type: String,
        required: true,
        enum: ["cash", "bank", "cheque", "upi", "card", "online_transfer"],
      },
      party: { type: String, required: true },
      partyId: { type: mongoose.Schema.Types.ObjectId, ref: "Party" },
    },
  ],
});

// 1. Compound index for main queries (most important)
BankDetailsSchema.index({ 
  cmp_id: 1, 
  Primary_user_id: 1 
}, { 
  name: "main_query_index",
  background: true 
});

// 2. Unique constraint to prevent duplicates
BankDetailsSchema.index({ 
  cmp_id: 1, 
  Primary_user_id: 1, 
  bank_ledname: 1 ,
  bank_id: 1
}, { 
  unique: true,
  name: "unique_bank_per_company_user",
  background: true 
});

// / === SEARCH & LOOKUP INDEXES ===

// 3. Text search index for bank names and details
BankDetailsSchema.index({
  bank_ledname: "text",
  bank_name: "text",
  acholder_name: "text",
  ac_no: "text"
}, {
  name: "bank_search_index",
  background: true
});

export default mongoose.model("BankDetails", BankDetailsSchema);
