import mongoose from "mongoose";

const foodPlanSchema = new mongoose.Schema({
  foodPlanId: { type: mongoose.Schema.Types.ObjectId, ref: "FoodPlan" },
  foodPlan: String,
  rate: Number,
  roomId: { type: mongoose.Schema.Types.ObjectId, ref: "Room" },
});

const paxDetailSchema = new mongoose.Schema({
  paxID: { type: mongoose.Schema.Types.ObjectId, ref: "Pax" },
  paxName: String,
  rate: Number,
  roomId: { type: mongoose.Schema.Types.ObjectId, ref: "Room" },
});

const hsnDetailsSchema = new mongoose.Schema({
  hsn: String,
  description: String,
  tab: String,
  isRevisedChargeApplicable: String,
  rows: [
    {
      greaterThan: String,
      upto: String,
      taxabilityType: String,
      igstRate: String,
      cgstRate: String,
      sgstUtgstRate: String,
      basedOnValue: String,
      basedOnQuantity: String,
    },
  ],
});

const selectedRoomSchema = new mongoose.Schema({
  roomId: { type: mongoose.Schema.Types.ObjectId, ref: "Room" },
  roomName: String,
  priceLevel: [String],
  selectedPriceLevel: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "PriceLevel",
  },
  roomType: {
    _id: mongoose.Schema.Types.ObjectId,
    brand: String,
    brand_id: mongoose.Schema.Types.ObjectId,
    cmp_id: mongoose.Schema.Types.ObjectId,
    Primary_user_id: mongoose.Schema.Types.ObjectId,
  },
  pax: Number,
  priceLevelRate: String,
  stayDays: Number,
  hsnDetails: hsnDetailsSchema,
  totalAmount: Number,
  amountAfterTax: Number,
  amountWithOutTax: Number,
  taxPercentage: Number,
  foodPlanTaxRate: Number,
  additionalPaxAmount: Number,
  foodPlanAmount: Number,
  taxAmount: Number,
  additionalPaxAmountWithTax: Number,
  additionalPaxAmountWithOutTax: Number,
  foodPlanAmountWithTax: Number,
  foodPlanAmountWithOutTax: Number,
  baseAmount: Number,
  baseAmountWithTax: Number,
});

const bookingSchema = new mongoose.Schema(
  {
    Primary_user_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "PrimaryUser",
      required: true,
    },
    Secondary_user_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "SecondaryUser",
    },
    cmp_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Organization",
      required: true,
    },
    bookingDate: String,
    voucherNumber: String,
    voucherId: mongoose.Schema.Types.ObjectId,
    bookingNumber: String,
    arrivalDate: String,
    arrivalTime: String,
    checkOutDate: String,
    checkOutTime: String,
    stayDays: Number,
    bookingType: String,
    selectedRoomId: mongoose.Schema.Types.ObjectId,
    selectedRoomPrice: String,
    bedType: String,
    roomFloor: String,
    unit: String,
    hsn: String,
    country: String,
    state: String,
    pinCode: String,
    detailedAddress: String,
    priceLevelRate: String,
    priceLevelId: String,
    discountPercentage: String,
    discountAmount: String,
    advanceAmount: String,
    totalAmount: String,
    balanceToPay: String,
    grandTotal: String,
    customerId: { type: mongoose.Schema.Types.ObjectId, ref: "Party" },
    customerName:String,
    mobileNumber: String,
    roomType: { type: mongoose.Schema.Types.ObjectId, ref: "RoomType" },
    visitOfPurpose:{ type: mongoose.Schema.Types.ObjectId,ref: "VisitOfPurpose"},
    selectedRooms: [selectedRoomSchema],
    foodPlan: [foodPlanSchema],
    additionalPaxDetails: [paxDetailSchema],
    roomTotal: Number,
    foodPlanTotal: Number,
    paxTotal: Number,
    agentId: { type: mongoose.Schema.Types.ObjectId, ref: "Party" },
    bookingId: { type: mongoose.Schema.Types.ObjectId, ref: "Booking" },
    checkInId: { type: mongoose.Schema.Types.ObjectId, ref: "CheckIn" },
    status: String,

  },
  { timestamps: true }
);

export const Booking = mongoose.model("Booking", bookingSchema, "bookings"); 
export const CheckIn = mongoose.model("CheckIn", bookingSchema, "checkins");  
export const CheckOut = mongoose.model("CheckOut", bookingSchema, "checkouts"); 

