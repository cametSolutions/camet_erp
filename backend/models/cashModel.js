import mongoose from "mongoose";

const cashSchema = new mongoose.Schema({
  cash_ledname: { type: String, required: true },
  cmp_id: {
    type:String,
    ref: "Organization",
    required: true,
  },
  Primary_user_id: {
    type:String,
    ref: "PrimaryUser",
    required: true,
  },
  cash_id: { type: Number, required: true },
  cash_grpname: { type: String },
});

export default mongoose.model("Cash", cashSchema);
