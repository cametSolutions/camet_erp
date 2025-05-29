import mongoose from "mongoose";

const Schema = mongoose.Schema;

const paymentSchema = new mongoose.Schema(
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
    voucherType: { type: String, default: "payment", required: true },
    serialNumber: { type: Number }, // Add this line to include a serial number field
    paymentNumber: { type: String, required: true }, // Changed from receiptNumber to match req.body
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
        settledAmount: { type: Number, required: true },
        remainingAmount: { type: Number, required: true },
      },
    ],

    totalBillAmount: { type: Number, required: true },
    enteredAmount: { type: Number, required: true },
    advanceAmount: { type: Number, required: true },
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

// Add indexes for better query performance
paymentSchema.index({ cmp_id: 1, date: -1 });
paymentSchema.index({ "party._id": 1 });
paymentSchema.index({ voucherNumber: 1, cmp_id: 1 }, { unique: true });
paymentSchema.index({ createdAt: -1 });

export default mongoose.model("Payment", paymentSchema);
