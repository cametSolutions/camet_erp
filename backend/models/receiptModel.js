import mongoose from "mongoose";

const Schema = mongoose.Schema;

const receiptSchema = new mongoose.Schema(
  {
    date: {
      type: Date,
      required: true,
      set: function (value) {
        // Set the time to 00:00:00.000
        const date = new Date(value);
        date.setUTCHours(0, 0, 0, 0); // Ensure the time is zeroed out
        return date;
      },
    },
    voucherType: { type: String, default: "receipt", required: true },
    serialNumber: { type: Number },
    receiptNumber: { type: String, required: true },
    series_id: {
      type: Schema.Types.ObjectId,
      ref: "VoucherSeries",
      required: true,
    },
    usedSeriesNumber: { type: Number, required: true },
    Primary_user_id: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    cmp_id: { type: Schema.Types.ObjectId, ref: "Company", required: true },
    Secondary_user_id: { type: Schema.Types.ObjectId, ref: "User" },

    // Party reference and embedded data
    party: {
      _id: { type: Schema.Types.ObjectId, ref: "Party" },
      partyName: { type: String },
      accountGroupName: { type: String },
      accountGroup_id: {
        type: mongoose.Types.ObjectId,
        ref: "AccountGroup",
        required: true,
      },
      subGroupName: { type: String },
      subGroup_id: { type: mongoose.Schema.Types.ObjectId, ref: "SubGroup" },
      mobileNumber: { type: String },
      country: { type: String },
      state: { type: String },
      pin: { type: String },
      emailID: { type: String },
      gstNo: { type: String },
      party_master_id: { type: String },
      billingAddress: { type: String },
      shippingAddress: { type: String },
      accountGroup: { type: String },
      newAddress: { type: Object },
    },

    // Bill data with references
    billData: [
      {
        billNo: { type: String, required: true },
        billId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Tally",
          required: true,
        },
        billDate: { type: String, required: true },
        billPending_amt: { type: Number, required: true },
        source: { type: String, required: true },
        settledAmount: { type: Number, required: true },
        remainingAmount: { type: Number, required: true },
      },
    ],

    totalBillAmount: { type: Number, required: true },
    enteredAmount: { type: Number, required: true },
    advanceAmount: { type: Number, default: 0 },
    remainingAmount: { type: Number, required: true },
    paymentMethod: {
      type: String,
      required: true,
      enum: ["Online", "Cash", "Cheque"],
    },

    // Payment details with references
    paymentDetails: {
      _id: { type: mongoose.Schema.Types.ObjectId },
      cash_ledname: { type: String },
      cash_name: { type: String },
      cash_id: { type: mongoose.Schema.Types.ObjectId, ref: "Cash" }, // Added ref for cash
      bank_ledname: { type: String },
      bank_name: { type: String },
      bank_id: { type: mongoose.Schema.Types.ObjectId, ref: "BankDetails" }, // Added ref for bank
      chequeNumber: { type: String },
      chequeDate: { type: Date },
    },

    note: { type: String },

    isCancelled: { type: Boolean, default: false },
  },
  {
    timestamps: true,
  }
);

// 1. Primary unique identifier (receiptNumber per company)
receiptSchema.index({ cmp_id: 1, receiptNumber: -1 }, { unique: true });

// 2. Secondary unique sequence (series-based numbering)
receiptSchema.index({ cmp_id: 1, series_id: 1, series_id: -1 }, { unique: true });

// 3. Most common query pattern (company + date sorting)
receiptSchema.index({ cmp_id: 1, date: -1 });

// 4. Party reference queries
receiptSchema.index({ cmp_id: 1, "party._id": 1 });

// 5. User-specific workflows
receiptSchema.index({ cmp_id: 1, Secondary_user_id: 1 });

// 6. Sequential document access
receiptSchema.index({ cmp_id: 1, serialNumber: -1 });

// 7. User-level document sequences (alternative to index #2 if needed)
receiptSchema.index({ 
  cmp_id: 1, 
  Secondary_user_id: 1, 
  userLevelSerialNumber: -1 
});

// NEW INDEX: For fast validation of usedSeriesNumber existence
receiptSchema.index({ 
  cmp_id: 1, 
  series_id: 1, 
  usedSeriesNumber: 1 
}, { 
  name: "series_number_validation_idx",
  background: true 
});

export default mongoose.model("Receipt", receiptSchema);
