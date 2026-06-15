import mongoose from "mongoose";
import { ROOM_STATUS_VALUES } from "./roomModal.js";

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

    status: {
      type: String,
      required: true,
      trim: true,
      enum: ROOM_STATUS_VALUES,
    },

    fromDate: {
      type: Date,
      required: true,
      index: true,
    },

    toDate: {
      type: Date,
      default: null,
    },

    isCurrent: {
      type: Boolean,
      default: true,
      index: true,
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
roomStatusHistorySchema.index({ cmp_id: 1, roomId: 1, isCurrent: 1 });

const RoomStatusHistory = mongoose.model(
  "RoomStatusHistory",
  roomStatusHistorySchema,
);

export default RoomStatusHistory;
