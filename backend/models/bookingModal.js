import mongoose from "mongoose";
const { Schema } = mongoose;

const bookingSchema = new Schema({
  bookingDate: { type: Date },
  bookingNumber: { type: String },
  arrivalDate: { type: String },
  arrivalTime: { type: String },
  checkOutDate: { type: String },
  checkOutTime: { type: String },
  stayDays: { type: Number },
  bookingType: { type: String },
  country: { type: String },
  state: { type: String },
  pinCode: { type: String },
  detailedAddress: { type: String },
  priceLevelRate: { type: Number },
  discountPercentage: { type: Number },
  discountAmount: { type: Number },
  grandTotal: { type: Number },
  totalAmount: { type: Number },
  customerId: { type: Schema.Types.ObjectId, ref: 'Party' },
  selectedRooms: [
    {
      roomId: { type: Schema.Types.ObjectId, ref: 'Room' },
      roomName: { type: String },
      priceLevel: [],
      selectedPriceLevel: { type: Schema.Types.ObjectId, ref: 'PriceLevel' },
      priceLevelRate: { type: Number },
      stayDays: { type: Number },
      totalAmount: { type: Number },
    }
  ],

  roomTotal: { type: Number },

  additionalPaxDetails: [
    {
      paxID: { type: Schema.Types.ObjectId, ref: 'Pax' },
      paxName: { type: String },
      rate: { type: Number },
      roomId: { type: Schema.Types.ObjectId, ref: 'Room' },
    }
  ],

  paxTotal: { type: Number },

  foodPlan: [
    {
      foodPlanId: { type: Schema.Types.ObjectId, ref: 'FoodPlan' },
      foodPlan: { type: String },
      rate: { type: Number },
      roomId: { type: Schema.Types.ObjectId, ref: 'Room' },
    }
  ],

  foodPlanTotal: { type: Number }
});

export default mongoose.model("Booking", bookingSchema);
