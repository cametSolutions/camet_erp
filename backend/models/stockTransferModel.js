import mongoose from "mongoose";

const StockTransferSchema = new mongoose.Schema(
  {
    cmp_id: { type: String, required: true },
    selectedGodown: { type: String, required: true },
    selectedGodownId: { type: String, required: true },
    items: { type: Array, required: true },
    finalAmount: { type: String, required: true },

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
export default mongoose.model("StockTransfer", StockTransferSchema);
