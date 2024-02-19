import mongoose from "mongoose";

const TransactionModelSchema = new mongoose.Schema({
  serialNumber: { type: Number },
  party_id: { type: String, required: true },
  party_name: { type: String, required: true },
  totalBillAmount: { type: Number, required: true },
  enteredAmount: { type: Number, required: true },
  cmp_id: { type: String, required: true },
  billData: { type: Array, required: true },
  paymentMethod: { type: String, required: true },
  paymentDetails: { type: Object, required: true },
  agentName: { type: String, required: true },
  agentId: { type: String, required: true },
  isCancelled:{type:Boolean,default:false},
  mobile_no:{type:String}
},
{
  timestamps: true,
});

// Pre-save hook to generate serial number
TransactionModelSchema.pre('save', async function (next) {
  try {
    if (!this.serialNumber) {
      const lastTransaction = await TransactionModel.findOne({}, {}, { sort: { 'serialNumber': -1 } });
      this.serialNumber = lastTransaction ? lastTransaction.serialNumber + 1 : 1;
    }
    next();
  } catch (error) {
    next(error);
  }
});

// Create a Mongoose model based on the schema
const TransactionModel = mongoose.model("Transaction", TransactionModelSchema);

export default TransactionModel;

