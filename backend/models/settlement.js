// Settlement Collection Schema
const settlementSchema = new mongoose.Schema({
  // Core Settlement Information
  voucherNumber: { 
    type: String, 
    required: true,
    index: true // For faster voucher lookups
  },
  voucherId: { 
    type: mongoose.Schema.Types.ObjectId, 
    required: true,
    refPath: 'voucherModel' // Dynamic reference
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
  
  // Amount and Financial Details
  amount: { 
    type: Number, 
    required: true,
    min: 0 // Ensure positive amounts
  },
  payment_mode: { 
    type: String, 
    required: true,
    enum: ['cash', 'bank', 'cheque', 'upi', 'card', 'online_transfer']
  },
  
  // Account References (Cash/Bank that received/paid the money)
  accountId: { 
    type: mongoose.Schema.Types.ObjectId, 
    required: true,
    refPath: 'accountModel' // Dynamic reference to Cash or Bank
  },
  accountModel: {
    type: String,
    required: true,
    enum: ['Cash', 'Bank'] // Which collection the account belongs to
  },
  accountName: { 
    type: String, 
    required: true // Denormalized for faster queries
  },
  
  // Party Information (who paid/received from)
  partyId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Party',
    required: true
  },
  partyName: { 
    type: String, 
    required: true // Denormalized for faster queries
  },
  
  // Company and User Context
  cmp_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Organization",
    required: true,
    index: true // For company-wise data segregation
  },
  Primary_user_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "PrimaryUser",
    required: true
  },
  
  // Additional Details
  description: { 
    type: String,
    trim: true 
  },
  reference: { 
    type: String,
    trim: true // For cheque numbers, transaction IDs, etc.
  },
  
  // Date Information
  settlement_date: { 
    type: Date, 
    required: true,
    index: true // For date range queries
  },
  voucher_date: { 
    type: Date, 
    required: true 
  }
}, {
  timestamps: true // created_at and updated_at
});

// Compound Indexes for Performance
settlementSchema.index({ cmp_id: 1, settlement_date: -1 }); // Company + date queries
settlementSchema.index({ accountId: 1, settlement_date: -1 }); // Account statement queries
settlementSchema.index({ partyId: 1, settlement_date: -1 }); // Party statement queries
settlementSchema.index({ cmp_id: 1, voucherType: 1, settlement_date: -1 }); // Receipt/Payment reports

const Settlement = mongoose.model('Settlement', settlementSchema);
module.exports = Settlement;