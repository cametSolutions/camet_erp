import mongoose from "mongoose";

const organizationSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    flat: { type: String },
    road: { type: String },
    landmark: { type: String },
    email: { type: String },
    mobile: { type: Number },
    senderId: { type: String },
    username: { type: String },
    password: { type: String },
    pin: { type: String },
    gstNum: { type: String },
    website: { type: String },
    pan: { type: String },
    industry: { type: Number },
    financialYear: { type: String },
    country: { type: String },
    currency: { type: String },
    currencyName: { type: String },
    logo: { type: String },
    state: { type: String },
    isBlocked: { type: Boolean, default: false },
    isApproved: { type: Boolean, default: false },
    owner: { type: mongoose.Schema.Types.ObjectId, ref: "PrimaryUser" },
    brands: { type: Array },
    categories: { type: Array },
    subcategories: { type: Array },
    levelNames: { type: Array },
    locations: { type: Array },
    type: { type: String, default: "self" },
    batchEnabled: { type: Boolean, default: false },
    orderNumber: { type: Number, default: 1 },
    OrderNumberValue: { type: String },
    OrderNumberDetails: { type: Object },
    salesNumber: { type: Number, default: 1 },
    purchaseNumber: { type: Number, default: 1 },
    vanSalesNumber: { type: Number, default: 1 },
    stockTransferNumber: { type: Number, default: 1 },
    receiptNumber: { type: Number, default: 1 },
    salesNumberDetails: { type: Object },
    currency: { type: String },
    currencyName: { type: String },
    additionalCharges: [
      {
        name: { type: String, required: true },
        hsn: { type: String },
        taxPercentage: { type: String },
      },
    ],

    configurations: [
      {
        bank: { type: mongoose.Schema.Types.ObjectId, ref: "BankDetails" },
        terms: { type: Array },
        enableBillToShipTo: { type: Boolean, default: true   },
        despatchDetails:{type:Object}
      },
    ],
  },
  {
    timestamps: true,
  }
);

export default mongoose.model("Organization", organizationSchema);
