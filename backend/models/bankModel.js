import mongoose from "mongoose";

const BankDetailsSchema = new mongoose.Schema({
  cmp_id: { type: String },
  Primary_user_id: { type: String },
  bank_ledname: { type: String ,required:true},
  acholder_name: { type: String },
  bank_id: { type: Number },
  ac_no: { type: String },
  ifsc: { type: String },
  swift_code: { type: String },
  bank_name: { type: String },
  branch: { type: String },
  upi_id: { type: String },
  bsr_code: { type: String },
  client_code: { type: String, default: null },
});



export default mongoose.model("BankDetails", BankDetailsSchema);
