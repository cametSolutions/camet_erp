import mongoose from "mongoose";

const accountGroupSchema = new mongoose.Schema({
  accountGroup: { type: String, required: true },
  accountGroup_id: { type: String, required: true, unique: true },
  cmp_id: { type: String, required: true },
  Primary_user_id: { type: mongoose.Types.ObjectId, required: true },
});

export default mongoose.model("AccountGroup", accountGroupSchema);

