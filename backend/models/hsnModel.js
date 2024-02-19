import mongoose from "mongoose";

const hsnSchema = new mongoose.Schema({
  cpm_id: {
    type: String,
    required: true,
  },
  Primary_user_id: {
    type: String,
    required: true,
  },
  hsn: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  tab: {
    type: String,
  },
  taxabilityType: {
    type: String,
  },
  igstRate: {
    type: String,
  },
  cgstRate: {
    type: String,
  },
  sgstUtgstRate: {
    type: String,
  },
  onValue: {
    type: String,
  },
  onQuantity: {
    type: String,
  },
  isRevisedChargeApplicable: {
    type: String,
  },
  rows: {
    type: Array,
    required: true,
  },
});

export default mongoose.model("Hsn", hsnSchema);
