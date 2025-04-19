import mongoose from "mongoose";

const AdditionalChargesSchema = new mongoose.Schema({
  cmp_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Organization",
    required: true,
  },
  Primary_user_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "PrimaryUser",
    required: true,
  },
  name: { type: String },
  hsn: { type: String },
  taxPercentage: { type: Number },
  master_id: { type: String },
  exp_grpname: { type: String },
  exp_childgrpname: { type: String },
});

export default mongoose.model("AdditionalCharges", AdditionalChargesSchema);
