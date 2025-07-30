import mongoose from "mongoose";

const roomSchema = new mongoose.Schema({
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
  booking_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Booking",
    required: true,
  },
  advanceVoucherNumber: {
    type: String,
    required: true,
  },
  advanceAmount: {
    type: Number,
    required: true,
  },
  advanceDate: {
    type: Date,
    required: true,
  },
  
});
export default mongoose.model("advanceModal", roomSchema);
