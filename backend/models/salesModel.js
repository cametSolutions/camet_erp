import mongoose from "mongoose";

const salesSchema = new mongoose.Schema(
  {
    serialNumber: { type: Number }, // Add this line to include a serial number field
    salesNumber: { type: String, required: true },
    Primary_user_id: { type: String, required: true },
    Secondary_user_id: { type: String },
    cmp_id:{ type: String, required: true },
    partyAccount:{ type: String, required: true },
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
export default mongoose.model("Sales", salesSchema);
