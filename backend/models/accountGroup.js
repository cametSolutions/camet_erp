import mongoose from "mongoose";

const accountGroupSchema = new mongoose.Schema({
  accountGroup: { type: String, required: true },
  accountGroup_id: { type: String, required: true },
  cmp_id: { type: mongoose.Schema.Types.ObjectId, ref: "Organization", required: true },
  Primary_user_id: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true }, 
});

export default mongoose.model("AccountGroup", accountGroupSchema);
