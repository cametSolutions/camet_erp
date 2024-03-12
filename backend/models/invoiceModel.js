import mongoose from "mongoose";

const invoiceSchema = new mongoose.Schema(
  {
    Primary_user_id: { type: String, required: true },
    cmp_id:{ type: String, required: true },
    party: { type: Object, required: true },
    priceLevel: { type: String, required: true },
    items: { type: Array, required: true },
    additionalCharges: { type: Array, required: true },
    finalAmount: { type: String, required: true },
  },
  {
    timestamps: true,
  }
);
export default mongoose.model("Invoice", invoiceSchema);
