import mongoose from "mongoose";

const partySchema = new mongoose.Schema({
  Primary_user_id: { type: String, required: true },
  Secondary_user_id: { type: String },
  cmp_id: { type: String, required: true },
  accountGroup: { type: String, required: true },
  partyName: { type: String, required: true },
  mobileNumber: { type: String},
  country: { type: String },
  state: { type: String },
  pin: { type: String },
  emailID: { type: String },
  gstNo: { type: String },
  pricelevel: { type: String },
  state_reference: { type: String },
  pincode: { type: String },
  party_master_id: { type: String },
  panNo: { type: String },
  billingAddress: { type: String },
  shippingAddress: { type: String },
  creditPeriod: { type: String },
  creditLimit: { type: String },
  openingBalanceType: { type: String },
  openingBalanceAmount: { type: String },
});

export default mongoose.model("Party", partySchema);
