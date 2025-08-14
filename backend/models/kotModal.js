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

  paymentMethod: {
    type: String,
  },
  paymentCompleted: {
    type: Boolean,
    default: false,
  },
});

export default mongoose.model("Kot", kotSchema);
