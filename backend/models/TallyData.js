import mongoose from "mongoose";

const tallySchema = new mongoose.Schema({
    // serialNo:{type:Number,required:true,unique:true},
    cmp_id: { type: String, required: true },
    Primary_user_id: { type: String, required: true },
    party_name: { type: String, required: true },
    alias: { type: String },
    party_id: { type: Number, required: true },
    mobile_no: { type: String },
    email: { type: String },
    bill_date: { type: Date, required: true },
    bill_no: { type: String, required: true },
    bill_amount: { type: Number, required: true },
    bill_due_date: { type: Date, required: true },
    bill_pending_amt:{ type: Number, required: true },
    group_name: { type: String, required: true },
    user_id:{type:String}
  });
  

  
  // Create a Mongoose model based on the schema
  export default mongoose.model("Tally", tallySchema);
  