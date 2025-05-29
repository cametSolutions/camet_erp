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
  bank_name: { type: String, required: true },
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

// Indexes for efficient queries
BankDetailsSchema.index({
  "settlements.created_at": 1,
  "settlements.voucherType": 1,
});
BankDetailsSchema.index({ cmp_id: 1, "settlements.created_at": 1 });

export default mongoose.model("BankDetails", BankDetailsSchema);
