import mongoose from "mongoose";

const receiptSchema = new mongoose.Schema(
  {
    serialNumber: { type: Number }, // Add this line to include a serial number field
    receiptNumber: { type: String, required: true },
    cmp_id: { type: String, required: true },
    Primary_user_id: { type: String, required: true },
    party_id: { type: String, required: true },
    party_name: { type: String, required: true },
    totalBillAmount: { type: Number, required: true },
    enteredAmount: { type: Number, required: true },
    billData: { type: Array, required: true },
    paymentMethod: { type: String, required: true },
    paymentDetails: { type: Object, required: true },
    secondary_user_id: { type: String, required: true },
    isCancelled: { type: Boolean, default: false },
    mobile_no: { type: String },
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
export default mongoose.model("Receipt", receiptSchema);
