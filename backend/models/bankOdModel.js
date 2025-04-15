import mongoose from "mongoose";

const BankODSchema = new mongoose.Schema({
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
  bank_ledname: { type: String , required: true },
  bank_grpname: { type: String },
  bank_childgrpname: { type: String },
  acholder_name: { type: String },
  bank_id: { type: String },
  ac_no: { type: String },
  ifsc: { type: String },
  swift_code: { type: String },
  bank_name: { type: String, required: true },
  branch: { type: String },
  bank_opening:{type:Number,default:0}, 
  upi_id: { type: String },
  bsr_code: { type: String },
  client_code: { type: String, default: null },
  settlements:{type:Array,default:[]},
});



export default mongoose.model("BankOD", BankODSchema);