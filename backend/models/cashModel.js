


import mongoose from "mongoose";

const cashSchema = new mongoose.Schema({
  cash_ledname: { type: String, required: true },
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
  cash_id: { type: String , required: true},
  cash_grpname: { type: String },
  cash_childgrpname: { type: String },
  cash_opening: { type: Number, default: 0 },
  
  settlements: [{
    voucherNumber: { type: String, required: true },
    voucherId: { 
      type: mongoose.Schema.Types.ObjectId, 
      required: true,
      refPath: 'settlements.voucherModel' // Dynamic reference based on voucherModel
    },
    voucherModel: {
      type: String,
      required: true,
      enum: ['Receipt', 'Payment'] // Model names (capitalized)
    },
    voucherType: { 
      type: String, 
      required: true, 
      enum: ['receipt', 'payment'] // For business logic/filtering
    },
    amount: { type: Number, required: true },
    created_at: { type: Date, required: true, index: true },
    payment_mode: { 
      type: String, 
      required: true,
      enum: ['cash', 'bank', 'cheque', 'upi', 'card', 'online_transfer']
    },
    party: { type: String, required: true },
    partyId: { type: mongoose.Schema.Types.ObjectId, ref: 'Party' }
  }]
}, {
  timestamps: true
});

// Indexes for efficient queries
cashSchema.index({ "settlements.created_at": 1, "settlements.voucherType": 1 });
cashSchema.index({ cmp_id: 1, "settlements.created_at": 1 });

export default mongoose.model("Cash", cashSchema);

