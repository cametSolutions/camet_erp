import mongoose from "mongoose";

const tallySchema = new mongoose.Schema(
  {
    // serialNo:{type:Number,required:true,unique:true},
    Primary_user_id: {
      type: mongoose.Types.ObjectId,
      ref: "User",
      required: true,
    },
    cmp_id: { type: mongoose.Types.ObjectId, ref: "Company", required: true },
    accountGroup: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "AccountGroup",
      required: true,
    },
    subGroup: { type: mongoose.Schema.Types.ObjectId, ref: "SubGroup" },
    party_name: { type: String, required: true },
    alias: { type: String },
    party_id: { type: mongoose.Types.ObjectId, ref: "Party", required: true },
    mobile_no: { type: Number },
    email: { type: String },
    bill_date: { type: Date, required: true },
    bill_no: { type: String, required: true },
    billId: { type: String }, ///// id of the bill or voucher // not assigning object id because outstanding form tally does not have an object id
    bill_amount: { type: Number, required: true },
    bill_due_date: { type: Date },
    bill_pending_amt: { type: Number, required: true },
    user_id: { type: String },
    source: { type: String },
    classification: { type: String },
    appliedReceipts: { type: Array, default: [] },
    appliedPayments: { type: Array, default: [] },
    createdBy: { type: String, default: "" }, ///if an outstanding is createdBy any vouchers are tagged here
    isCancelled: { type: Boolean, default: false },
  },
  {
    timestamps: true,
  }
);

// Create a Mongoose model based on the schema
export default mongoose.model("Tally", tallySchema);
