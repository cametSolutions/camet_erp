import mongoose from "mongoose";

const purchaseSchema = new mongoose.Schema(
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
    purchaseNumber: { type: String},
    Primary_user_id: { type: String, required: true },
    Secondary_user_id: { type: String },
    cmp_id:{ type: String, required: true },
    partyAccount:{ type: String, required: true },
    party: { type: Object, required: true },
    items: { type: Array, required: true },
    despatchDetails: {
      type: Object,
      set: function (value) {
        // Ensure the title is always included
        return { title: "Despatch Details", ...value };
      },
    },
    isCancelled: { type: Boolean, default: false },
    createdAt: {
      type: Date,
      default: Date.now,
      immutable: false // This allows the field to be updated
    },

    additionalCharges: { type: Array, required: true },
    finalAmount: { type: String, required: true },
  },
  {
    timestamps: true,
  }
);
export default mongoose.model("Purchase", purchaseSchema);
