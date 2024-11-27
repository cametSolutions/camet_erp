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
  cash_id: { type: String },
  cash_grpname: { type: String },
  cash_opening: { type: Number,default:0 },
  settlements:{type:Array,default:[]},

});

export default mongoose.model("Cash", cashSchema);
