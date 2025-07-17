import mongoose from "mongoose";

const { Schema } = mongoose;

const accountGroupSchema = new Schema(
  {
    accountGroup: { type: String, required: true },         // display name
    accountGroup_id: { type: String, required: true },      // your external/code ID
    cmp_id: { type: Schema.Types.ObjectId, ref: "Organization", required: true },
    Primary_user_id: { type: Schema.Types.ObjectId, ref: "User", required: true },
  },
  { timestamps: true } // optional; you said you prefer Mongoose timestamps
);

// Index: queries scoped by user + company
accountGroupSchema.index(
  { Primary_user_id: 1, cmp_id: 1 },
  { name: "accountgroup_user_company_idx", background: true }
);

// Lookup index: find by accountGroup_id within user + company
accountGroupSchema.index(
  { accountGroup_id: 1, Primary_user_id: 1, cmp_id: 1 },
  { name: "accountgroup_lookup_idx", background: true }
);

export default mongoose.model("AccountGroup", accountGroupSchema);
