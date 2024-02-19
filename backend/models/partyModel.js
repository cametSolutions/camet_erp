import mongoose from "mongoose";

const partySchema = new mongoose.Schema({
  Primary_user_id:{ type: String, required: true },
  cpm_id:{ type: String, required: true },
  accountGroup: { type: String, required: true },
  partyName: { type: String, required: true },
  mobileNumber: { type: String, required: true },
  emailID: { type: String, required: true },
  gstNo: { type: String },
  panNo: { type: String },
  billingAddress: { type: String },
  shippingAddress: { type: String },
  creditPeriod:{ type: String },
  creditLimit:{ type: String },
  openingBalanceType:{ type: String },
  openingBalanceAmount: { type: String },
});


export default mongoose.model("Party", partySchema);
