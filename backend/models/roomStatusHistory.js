import mongoose from "mongoose";

const roomStatusHistorySchema = new mongoose.Schema(
  {
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
      ref: "company",
      required: true,
      index: true,
    },

    roomId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Room",
      required: true,
      index: true,
    },

    roomNumber: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },

    oldStatus: {
      type: String,
      required: true,
      trim: true,
      enum: [
        "vacant",
        "occupied",
        "dirty",
        "clean",
        "maintenance",
        "reserved",
        "blocked",
        "out_of_order",
      ],
    },

    newStatus: {
      type: String,
      required: true,
      trim: true,
      enum: [
        "vacant",
        "occupied",
        "dirty",
        "clean",
        "maintenance",
        "reserved",
        "blocked",
        "out_of_order",
      ],
    },

    reason: {
      type: String,
      trim: true,
      default: "",
    },

    source: {
      type: String,
      trim: true,
      enum: [
        "manual",
        "checkin",
        "checkout",
        "housekeeping",
        "maintenance",
        "system",
      ],
      default: "manual",
    },

    referenceId: {
      type: mongoose.Schema.Types.ObjectId,
      default: null,
    },

    referenceModel: {
      type: String,
      default: "",
      trim: true,
    },

    changedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "primaryUser",
      default: null,
      index: true,
    },

    changedByName: {
      type: String,
      trim: true,
      default: "",
    },

    notes: {
      type: String,
      trim: true,
      default: "",
    },
  },
  {
    timestamps: true,
    versionKey: false,
  },
);

// Useful indexes
roomStatusHistorySchema.index({ cmp_id: 1, roomId: 1, createdAt: -1 });
roomStatusHistorySchema.index({ cmp_id: 1, roomNumber: 1, createdAt: -1 });

const RoomStatusHistory = mongoose.model(
  "RoomStatusHistory",
  roomStatusHistorySchema,
);

export default RoomStatusHistory;
