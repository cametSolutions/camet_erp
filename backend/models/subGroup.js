import mongoose from "mongoose";

const subGroupSchema = new mongoose.Schema({
  accountGroup: {
    type: mongoose.Types.ObjectId,
    ref: "AccountGroup",
    required: true,
  },
  subGroup: { type: String, required: true },
  subGroup_id: { type: String, required: true },
  cmp_id: {
    type: mongoose.Types.ObjectId,
    ref: "Organization",
    required: true,
  },
  Primary_user_id: { type: mongoose.Types.ObjectId, required: true },
});

export default mongoose.model("SubGroup", subGroupSchema);
