import mongoose from "mongoose";

const AdditionalPaxSchema = new mongoose.Schema({
  additionalPaxName: { type: String, required: true },
  amount: { type: Number },
  additionalPaxId: { type: String, required: true, index: true }, // Add index: true here
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
});

const VisitOfPurposeSchema = new mongoose.Schema({
  visitOfPurpose: { type: String, required: true },
  visitOfPurposeId: { type: String, required: true, index: true }, // Add index: true here
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
});

const IdProofSchema = new mongoose.Schema({
  idProof:{type: String, required: true },
  idProofId: { type: String, required: true, index: true }, // Add index: true here
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
})

const FoodPlanSchema = new mongoose.Schema({
  foodPlan: { type: String, required: true },
  amount: { type: Number },
  foodPlanId: { type: String, required: true, index: true }, // Add index: true here
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
});



export const AdditionalPax = mongoose.model("AdditionalPax", AdditionalPaxSchema);
export const VisitOfPurpose = mongoose.model("VisitOfPurpose", VisitOfPurposeSchema);
export const IdProof = mongoose.model("IdProof", IdProofSchema);
export const FoodPlan = mongoose.model("FoodPlan", FoodPlanSchema);

