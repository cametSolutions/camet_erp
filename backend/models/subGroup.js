import mongoose from "mongoose";

const { Schema } = mongoose;

const subGroupSchema = new Schema({
  accountGroup: {
    type: Schema.Types.ObjectId,
    ref: "AccountGroup",
    required: true,
  },
  subGroup: { type: String, required: true },
  subGroup_id: { type: String, required: true },
  cmp_id: {
    type: Schema.Types.ObjectId,
    ref: "Organization",
    required: true,
  },
  Primary_user_id: { type: Schema.Types.ObjectId, required: true },
});

// 2. SubGroup Collection Indexes
subGroupSchema.index(
  { Primary_user_id: 1, cmp_id: 1 },
  { name: "subgroup_user_company_idx", background: true }
);

subGroupSchema.index(
  { subGroup_id: 1, Primary_user_id: 1, cmp_id: 1 },
  { name: "subgroup_lookup_idx", background: true }
);

export default mongoose.model("SubGroup", subGroupSchema);
