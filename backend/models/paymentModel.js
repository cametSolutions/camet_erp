import mongoose from "mongoose";

const paymentSchema = new mongoose.Schema(
  {
    serialNumber: { type: Number }, // Add this line to include a serial number field
    paymentNumber: { type: String, required: true },
    Primary_user_id: { type: String, required: true },
    Secondary_user_id: { type: String },
    cmp_id: { type: String, required: true },
    party: { type: Object, required: true },
    billData: { type: Array },
    totalBillAmount: { type: Number, required: true },
    enteredAmount: { type: Number, required: true },
    advanceAmount: { type: Number, required: true },
    remainingAmount: { type: Number, required: true },
    paymentMethod: { type: String, required: true },
    paymentDetails: { type: Object, required: true },
    note: { type: String },
    isCancelled: { type: Boolean, default: false },
    createdAt: {
      type: Date,
      default: Date.now,
      immutable: false, // This allows the field to be updated
    },
  },
  {
    timestamps: true,
  }
);
export default mongoose.model("Payment", paymentSchema);
