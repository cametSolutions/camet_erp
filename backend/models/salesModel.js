import mongoose from "mongoose";

const salesSchema = new mongoose.Schema(
  {
    serialNumber: { type: Number }, // Add this line to include a serial number field
    salesNumber: { type: String, required: true },
    Primary_user_id: { type: String, required: true },
    Secondary_user_id: { type: String },
    selectedGodownName:{ type: String,default:"" },
    selectedGodownId:{ type: String,default:""},  
    cmp_id:{ type: String, required: true },
    partyAccount:{ type: String, required: true },
    party: { type: Object, required: true },
    priceLevel: { type: String },
    items: { type: Array, required: true },
    despatchDetails: {
      type: Object,
      set: function (value) {
        // Ensure the title is always included
        return { title: "Despatch Details", ...value };
      },
    },
    additionalCharges: { type: Array, required: true },
    finalAmount: { type: String, required: true },
    paymentSplittingData: { type: Object },
    isCancelled: { type: Boolean, default: false },

    batchHeights: { type: Object },
    createdAt: {
      type: Date,
      default: Date.now,
      immutable: false // This allows the field to be updated
    }
  },
  {
    timestamps: true,
  }
);
export default mongoose.model("Sales", salesSchema);
