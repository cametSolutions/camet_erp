import mongoose from "mongoose";

const cashSchema = new mongoose.Schema({
  cash_ledname: { type: String, required: true },
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
  cash_id: { type: Number, required: true },
  cash_grpname: { type: String, required: true },
});

export default mongoose.model("Cash", cashSchema);
