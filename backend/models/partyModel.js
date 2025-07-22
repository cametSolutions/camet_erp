import mongoose, { set } from "mongoose";

const partySchema = new mongoose.Schema({
  Primary_user_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "PrimaryUser",
    required: true,
  },
  Secondary_user_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "SecondaryUser",
  },
  cmp_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Organization",
    required: true,
  },
  accountGroup: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "AccountGroup",
    required: true,
  },
  subGroup: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "SubGroup",
    set: (v) => (v === "" || v === null ? null : v), // Allow subGroup to be optional
  },
  partyName: { type: String, required: true },
  mobileNumber: { type: String },
  country: { type: String },
  state: { type: String },
  pin: { type: String },
  emailID: { type: String },
  gstNo: { type: String },
  pricelevel: { type: String },
  state_reference: { type: String },
  pincode: { type: String },
  party_master_id: { type: String, required: true },
  panNo: { type: String },
  billingAddress: { type: String },
  shippingAddress: { type: String },
  creditPeriod: { type: String },
  creditLimit: { type: String },
  openingBalanceType: { type: String },
  openingBalanceAmount: { type: Number },
});

// / ============= CRITICAL PARTY INDEXES =============

// 1. **PRIMARY INDEX** - Most important for your PartyList query
// Covers: cmp_id + Primary_user_id + subGroup filtering + pagination
partySchema.index(
  {
    cmp_id: 1,
    Primary_user_id: 1,
    subGroup: 1,
  },
  {
    name: "party_main_query_idx",
    background: true,
  }
);

// 2. **SEARCH INDEX** - For partyName and mobileNumber search
partySchema.index(
  {
    cmp_id: 1,
    Primary_user_id: 1,
    partyName: 1,
  },
  {
    name: "party_name_search_idx",
    background: true,
  }
);

partySchema.index(
  {
    cmp_id: 1,
    Primary_user_id: 1,
    mobileNumber: 1,
  },
  {
    name: "party_mobile_search_idx",
    background: true,
    sparse: true, // Since mobileNumber can be null
  }
);

// 3. **TEXT SEARCH INDEX** - For efficient $text searches
partySchema.index(
  {
    partyName: "text",
    mobileNumber: "text",
  },
  {
    name: "party_text_search_idx",
    background: true,
    weights: { partyName: 2, mobileNumber: 1 }, // Give more weight to party name
  }
);

// 4. **LOOKUP OPTIMIZATION** - For accountGroup and subGroup lookups
partySchema.index(
  {
    cmp_id: 1,
    accountGroup: 1,
  },
  {
    name: "party_account_group_idx",
    background: true,
  }
);

// 5. **PARTY MASTER ID INDEX** - For external system integration
partySchema.index(
  {
    cmp_id: 1,
    party_master_id: 1,
  },
  {
    name: "party_master_id_idx",
    background: true,
    unique: true, // Assuming party_master_id should be unique per company
  }
);

export default mongoose.model("Party", partySchema);
