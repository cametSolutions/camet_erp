import mongoose from "mongoose";

const receiptSchema = new mongoose.Schema(
  {

    date: { 
      type: Date, 
      required: true,
      set: function(value) {
        // Set the time to 00:00:00.000
        const date = new Date(value);
        date.setUTCHours(0, 0, 0, 0); // Ensure the time is zeroed out
        return date;
      }
    },
    serialNumber: { type: Number }, // Add this line to include a serial number field
    receiptNumber: { type: String, required: true },
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
    outstandings: { type: Array, required: true },
    isCancelled: { type: Boolean, default: false },
    // createdAt: {
    //   type: Date,
    //   default: Date.now,
    //   immutable: false, // This allows the field to be updated
    // },
  },
  {
    timestamps: true,
  }
);
export default mongoose.model("Receipt", receiptSchema);
