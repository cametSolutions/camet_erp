import mongoose from "mongoose";

const tallySchema = new mongoose.Schema(
  {
    Primary_user_id: {
      type: mongoose.Types.ObjectId,
      ref: "User",
      required: true,
    },
    cmp_id: { type: mongoose.Types.ObjectId, ref: "Company", required: true },
    accountGroup: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "AccountGroup",
      required: true,
    },
    subGroup: { type: mongoose.Schema.Types.ObjectId, ref: "SubGroup" },
    party_name: { type: String, required: true },
    alias: { type: String },
    party_id: { type: mongoose.Types.ObjectId, ref: "Party", required: true },
    mobile_no: {
      type: Number,
      set: (v) => {
        if (v === "" || v === "null" || v === null) return null;
        const num = Number(v);
        return isNaN(num) ? null : num;
      },
    },
    email: { type: String },
    bill_date: { type: Date, required: true },
    bill_no: { type: String, required: true },
    billId: { type: String }, ///// id of the bill or voucher // not assigning object id because outstanding form tally does not have an object id
    bill_amount: { type: Number, required: true },
    bill_due_date: { type: Date },
    bill_pending_amt: { type: Number, required: true },
    user_id: { type: String },
    source: { type: String },
    classification: { type: String },
    appliedReceipts: [
      {
        _id: { type: mongoose.Schema.Types.ObjectId, ref: "Receipt" },
        receiptNumber: { type: String },
        settledAmount: { type: Number },
        date: { type: Date },
      },
    ],

    appliedPayments: [
      {
        _id: { type: mongoose.Schema.Types.ObjectId, ref: "Payment" },
        paymentNumber: { type: String },
        settledAmount: { type: Number },
        date: { type: Date },
      },
    ],

    createdBy: { type: String, default: "" }, ///if an outstanding is createdBy any vouchers are tagged here
    isCancelled: { type: Boolean, default: false },
  },
  {
    timestamps: true,
  }
);

/// **PRIMARY INDEXES** - Most important for query performance 

// 1. Compound index for tenant-based queries (most common pattern)
tallySchema.index({ Primary_user_id: 1, cmp_id: 1 });

// 2. Party-specific queries within company context
tallySchema.index({ cmp_id: 1, party_id: 1 });

// 3. Account group filtering within company
tallySchema.index({ cmp_id: 1, accountGroup: 1 });

// **SECONDARY INDEXES** - For specific lookup scenarios

// 4. Unique bill identification (sparse index since billId can be null)
tallySchema.index({ cmp_id: 1, billId: 1 }, { sparse: true });

// 5. Bill number lookup within company
tallySchema.index({ cmp_id: 1, bill_no: 1 });

// 6. SubGroup filtering (sparse since subGroup is optional)
tallySchema.index({ cmp_id: 1, subGroup: 1 }, { sparse: true });

// **ADDITIONAL USEFUL INDEXES** - Based on common query patterns

// 7. Date-based queries for reporting
tallySchema.index({ cmp_id: 1, bill_date: -1 });

// 8. Due date queries for pending bills
tallySchema.index({ cmp_id: 1, bill_due_date: 1 });

// 9. Outstanding amounts filtering
tallySchema.index({ cmp_id: 1, bill_pending_amt: 1 });

// 10. Active bills (not cancelled)
tallySchema.index({ cmp_id: 1, isCancelled: 1 });

// 11. Text search on party names (if needed)
// tallySchema.index({ party_name: "text" });

// **PERFORMANCE OPTIMIZATION INDEXES**

// 12. Comprehensive query index for dashboard-type queries
tallySchema.index({
  Primary_user_id: 1,
  cmp_id: 1,
  accountGroup: 1,
  isCancelled: 1,
  bill_date: -1,
});

// 13. Party outstanding summary queries
tallySchema.index({
  cmp_id: 1,
  party_id: 1,
  isCancelled: 1,
  bill_pending_amt: 1,
});

// Create a Mongoose model based on the schema
export default mongoose.model("Tally", tallySchema);
