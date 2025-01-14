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
    paymentNumber: { type: Number, default: 1 },
    creditNoteNumber: { type: Number, default: 1 },
    debitNoteNumber: { type: Number, default: 1 },
    salesNumberDetails: { type: Object },
    currency: { type: String },
    currencyName: { type: String },
    subunit: { type: String },
    symbol: { type: String },
    additionalCharges: [
      {
        name: { type: String, required: true },
        hsn: { type: String },
        taxPercentage: { type: String },
      },
    ],
    printTitle: { type: String },

    configurations: [
      {
        bank: { type: mongoose.Schema.Types.ObjectId, ref: "BankDetails" },
        terms: { type: Array },
        enableBillToShipTo: { type: Boolean, default: true },
        despatchDetails: { type: Object },
        taxInclusive: { type: Boolean, default: false },
        emailConfiguration: {
          email: { type: String },
          appPassword: { type: String },
        },
        addRateWithTax: {
          type: Object,
          default: {
            sale: false,
            saleOrder: false,
          
          }
        },

        despatchTitles: [
          {
            voucher: { type: String, default: "saleOrder" },
            challanNo: { type: String, default: "Challan No" },
            containerNo: { type: String, default: "Container No" },
            despatchThrough: { type: String, default: "Despatch Through" },
            destination: { type: String, default: "Destination" },
            vehicleNo: { type: String, default: "Vehicle No" },
            orderNo: { type: String, default: "Order No" },
            termsOfPay: { type: String, default: "Terms Of Pay" },
            termsOfDelivery: { type: String, default: "Terms Of Delivery" },
          },
        ],

        printConfiguration: [
          {
            voucher: { type: String, default: "saleOrder" }, // Define the type for clarity
            printTitle: { type: String },
            showCompanyDetails: { type: Boolean, default: true },
            showDiscount: { type: Boolean, default: false },
            showDiscountAmount: { type: Boolean, default: true },
            showHsn: { type: Boolean, default: false },
            showTaxPercentage: { type: Boolean, default: false },
            showInclTaxRate: { type: Boolean, default: false },
            showTaxAnalysis: { type: Boolean, default: false },
            showTeamsAndConditions: { type: Boolean, default: false },
            showBankDetails: { type: Boolean, default: false },
            showTaxAmount: { type: Boolean, default: true },
            showStockWiseTaxAmount: { type: Boolean, default: true },
          },
        ],

        termsAndConditions: [
          {
            voucher: { type: String, default: "saleOrder" }, // Define the type for clarity
            terms: { type: Array },
          },
        ],
      },
    ],
  },
  {
    timestamps: true,
  }
);

export default mongoose.model("Organization", organizationSchema);
