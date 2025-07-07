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
      min: [0, "Warranty years must be 0 or greater"],
      max: [50, "Warranty years cannot exceed 50"],
      default: 0, // optional with default
    },

    warrantyMonths: {
      type: Number,
      min: [0, "Warranty months must be 0 or greater"],
      max: [11, "Warranty months cannot exceed 11"],
      default: 0, // optional with default
    },

    displayInput: {
      type: String,
      trim: true,
      maxlength: [200, "Display input cannot exceed 200 characters"],
      default: "",
    },

    termsAndConditions: {
      type: String,
      trim: true,
      maxlength: [5000, "Terms and conditions cannot exceed 5000 characters"],
      default: "",
    },

    customerCareInfo: {
      type: String,
      trim: true,
      maxlength: [2000, "Customer care info cannot exceed 2000 characters"],
      default: "",
    },

    customerCareNo: {
      type: String,
      trim: true,
      maxlength: [50, "Customer care number cannot exceed 50 characters"],
      default: "",
    },

    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: false,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Virtual for total warranty duration in months
warrantyCardSchema.virtual("totalWarrantyMonths").get(function () {
  return (this.warrantyYears || 0) * 12 + (this.warrantyMonths || 0);
});

// Indexes
warrantyCardSchema.index({ name: 1 });
warrantyCardSchema.index({ cmp_id: 1 });
warrantyCardSchema.index({ primary_user_id: 1 });
warrantyCardSchema.index({ cmp_id: 1, name: 1 }, { unique: true });

// Pre-save to normalize months
warrantyCardSchema.pre("save", function (next) {
  if (this.warrantyMonths > 11) {
    this.warrantyYears += Math.floor(this.warrantyMonths / 12);
    this.warrantyMonths = this.warrantyMonths % 12;
  }
  next();
});

export default mongoose.model("WarrantyCard", warrantyCardSchema);
