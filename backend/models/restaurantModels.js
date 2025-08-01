import mongoose from "mongoose";

const itemSchema = new mongoose.Schema({
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
  itemName: {
    type: String,
    required: true,
    trim: true,
  },
  foodCategory: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Category",
    required: true,
  },
  foodType: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Subcategory",
    required: true,
  },
  unit: {
    type: String,
    required: true,
   
  },
  hsn: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Hsn",
    required: true,
  },
  hsnCode: {
    type: String,
    // Stored for easier access and search functionality
  },
  item_master_id: {
    type: String,
    // If you need a custom ID like room_master_id
  },
  priceLevel: [
    {
      priceLevel: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "PriceLevel",
        required: true,
      },
      priceRate: {
        type: Number,
        required: true,
        min: 0,
      },
    },
  ],
  // Additional fields that might be useful
  isActive: {
    type: Boolean,
    default: true,
  },
  description: {
    type: String,
    trim: true,
  },
}, {
  timestamps: true, // Adds createdAt and updatedAt automatically
});

// Indexes for better query performance


export default mongoose.model("Item", itemSchema);