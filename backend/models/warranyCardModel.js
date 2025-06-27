// models/WarrantyCard.js
import mongoose from "mongoose";

const warrantyCardSchema = new mongoose.Schema(
  {
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
    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
      maxlength: [100, "Name cannot exceed 100 characters"],
    },

    warrantyYears: {
      type: Number,
      required: [true, "Warranty years is required"],
      min: [0, "Warranty years must be 0 or greater"],
      max: [50, "Warranty years cannot exceed 50"],
    },

    warrantyMonths: {
      type: Number,
      required: [true, "Warranty months is required"],
      min: [0, "Warranty months must be 0 or greater"],
      max: [11, "Warranty months cannot exceed 11"],
    },

    displayInput: {
      type: String,
      required: [true, "Display input is required"],
      trim: true,
      maxlength: [200, "Display input cannot exceed 200 characters"],
    },

    termsAndConditions: {
      type: String,
      required: [true, "Terms and conditions are required"],
      trim: true,
      maxlength: [5000, "Terms and conditions cannot exceed 5000 characters"],
    },

    customerCareInfo: {
      type: String,
      required: [true, "Customer care info is required"],
      trim: true,
      maxlength: [2000, "Customer care info cannot exceed 2000 characters"],
    },

    customerCareNo: {
      type: String,
      required: [true, "Customer care number is required"],
      trim: true,
      maxlength: [50, "Customer care number cannot exceed 50 characters"],
    },


    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: false, // Set to true if you have user authentication
    },

  
  },
  {
    timestamps: true, // Automatically adds createdAt and updatedAt
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Virtual for total warranty duration in months
warrantyCardSchema.virtual("totalWarrantyMonths").get(function () {
  return this.warrantyYears * 12 + this.warrantyMonths;
});

// Index for better performance
warrantyCardSchema.index({ name: 1 });
warrantyCardSchema.index({ cmp_id: 1 });
warrantyCardSchema.index({ primary_user_id: 1 });
warrantyCardSchema.index({ cmp_id: 1, name: 1 }, { unique: true });


// Pre-save middleware to ensure data consistency
warrantyCardSchema.pre("save", function (next) {
  // Ensure warranty months is within valid range
  if (this.warrantyMonths > 11) {
    this.warrantyYears += Math.floor(this.warrantyMonths / 12);
    this.warrantyMonths = this.warrantyMonths % 12;
  }
  next();
});

export default mongoose.model("WarrantyCard", warrantyCardSchema);
