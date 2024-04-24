import mongoose from "mongoose";

const AdditionalChargesSchema = new mongoose.Schema({
  cmp_id: { type: String, required: true },
  Primary_user_id: { type: String, required: true },
  name: { type: String },
  hsn: { type: String },
  taxPercentage: { type: String },
  master_id: { type: String },
});

export default mongoose.model("AdditionalCharges", AdditionalChargesSchema);
