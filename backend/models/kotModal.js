import mongoose from "mongoose";

const kotSchema = new mongoose.Schema({
  primary_user_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "PrimaryUser",
    required: true,
  },
  secondary_user_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "SecondaryUser",
  },
  cmp_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Organization",
    required: true,
  },

  items: [],

  voucherNumber: {
    type: String,
    required: true,
  },

  type: {
    type: String,
    required: true,
  },

  customer: {
    name: {
      type: String,
      trim: true,
    },
    phone: {
      type: String,
      trim: true,
    },
    address: {
      type: String,
      trim: true,
    },
    tableNumber: {
      type: String,
      trim: true,
    },
    status:{
      type:String,
      trim:true,
    },
  },
  tableNumber: {
    type: String,
    trim: true,
  },

   serviceType: {
    type: String,
    enum: ['Restaurant', 'Room Service', 'Dine-in'],
    default: 'Restaurant'
  },

  total: {
    type: Number,
    required: true,
  },

  createdAt: {
    type: Date,
    default: Date.now,
  },

  status: {
    type: String,
    default: "pending",
  },

   cancelReason: {
    type: String,
    trim: true,
  },

  cancelledAt: {
    type: Date,
  },
  paymentMethod: {
    type: String,
  },
  paymentCompleted: {
    type: Boolean,
    default: false,
  },
  roomId:{
    type:mongoose.Schema.Types.ObjectId,
    ref:"Room"
  },
  checkInNumber: {
    type: String,
    trim: true,
  },
  discount: { type: Number, default: 0 },
discountChargeId: { type: mongoose.Schema.Types.ObjectId, ref: 'AdditionalCharges' },
note: { type: String },
 foodPlanId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "FoodPlan",
    default: null
  },
  
  
  foodPlanDetails: {
    planName: { type: String, default: null },
    amount: { type: Number, default: 0 },
    isComplimentary: { type: Boolean, default: false }
  },
  
  
  isManuallyComplimentary: {
    type: Boolean,
    default: false
  }
});

export default mongoose.model("Kot", kotSchema);
