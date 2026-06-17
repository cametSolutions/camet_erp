import mongoose from "mongoose";

const nightAuditSchema = new mongoose.Schema(
  {
    cmp_id: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      index: true,
    },

    auditDate: {
      type: String,
      required: true,
    },

    auditedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    status: {
      type: String,
      enum: ["completed", "reopened"],
      default: "completed",
    },

    reopenedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },

    reopenedAt: {
      type: Date,
      default: null,
    },

    reopenReason: {
      type: String,
      trim: true,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

nightAuditSchema.index(
  {
    cmp_id: 1,
    auditDate: 1,
  },
  {
    unique: true,
  }
);

const NightAudit = mongoose.model("NightAudit", nightAuditSchema, "nightAudits");

export default NightAudit;
