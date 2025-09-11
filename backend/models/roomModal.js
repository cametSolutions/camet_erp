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
  roomName: {
    type: String,
    required: true,
  },
  roomType: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Brand",
    required: true,
  },
  bedType: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Category",
    required: true,
  },
  roomFloor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Subcategory",
    required: true,
  },
  hsn: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Hsn",
  },
  unit: {
    type: String,
    required: true,
  },
  room_master_id: {
    type: String,
  },
  priceLevel: [
    {
      priceLevel: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "PriceLevel",
      },
      priceRate: {
        type: Number,
      },
    },
  ],
    status: {
  type: String,
  enum: ["vacant", "occupied", "booked", "dirty", "blocked"],
}

});
export default mongoose.model("Room", roomSchema);
