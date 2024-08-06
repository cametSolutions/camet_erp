import mongoose from "mongoose";

const vanSaleSchema = new mongoose.Schema(
  {
    serialNumber: { type: Number },
    salesNumber: { type: String, required: true },
    Primary_user_id: { type: String, required: true },
    Secondary_user_id: { type: String },
    selectedGodownName:{ type: String, required: true },
    selectedGodownId:{ type: String, required: true },
    cmp_id: { type: String, required: true },
    partyAccount: { type: String, required: true },
    party: { type: Object, required: true },
    priceLevel: { type: String },
    items: { type: Array, required: true },
    despatchDetails: { type: Object },
    additionalCharges: { type: Array, required: true },
    finalAmount: { type: String, required: true },
    isCancelled: { type: Boolean, default: false },
    batchHeights: { type: Object },
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
export default mongoose.model("vanSale", vanSaleSchema);
