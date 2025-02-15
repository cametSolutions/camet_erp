import mongoose from "mongoose";

const subGroupSchema = new mongoose.Schema({
  accountGroup_id: {
    type: mongoose.Types.ObjectId,
    ref: "AccountGroup",
    required: true,
  },
  subGroup: { type: String, required: true },   
  cmp_id: { type: String, required: true },
  Primary_user_id: { type: mongoose.Types.ObjectId, required: true },
});

export default mongoose.model("SubGroup", subGroupSchema);
