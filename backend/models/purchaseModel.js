// import mongoose from "mongoose";

// const purchaseSchema = new mongoose.Schema(
//   {

//     date: {
//       type: Date,
//       required: true,
//       set: function(value) {
//         // Set the time to 00:00:00.000
//         const date = new Date(value);
//         date.setUTCHours(0, 0, 0, 0); // Ensure the time is zeroed out
//         return date;
//       }
//     },
//     serialNumber: { type: Number }, // Add this line to include a serial number field
//     purchaseNumber: { type: String},
//     Primary_user_id: { type: String, required: true },
//     Secondary_user_id: { type: String },
//     cmp_id:{ type: String, required: true },
//     partyAccount:{ type: String, required: true },

//     party: { type: Object, required: true },
//     items: { type: Array, required: true },
//     despatchDetails: {
//       type: Object,
//       set: function (value) {
//         // Ensure the title is always included
//         return { title: "Despatch Details", ...value };
//       },
//     },
//     isCancelled: { type: Boolean, default: false },
//     createdAt: {
//       type: Date,
//       default: Date.now,
//       immutable: false // This allows the field to be updated
//     },

//     additionalCharges: { type: Array, required: true },
//     finalAmount: { type: String, required: true },
//   },
//   {
//     timestamps: true,
//   }
// );
// export default mongoose.model("Purchase", purchaseSchema);

import mongoose from "mongoose";
const { Schema } = mongoose;

const purchaseSchema = new Schema(
  {
    date: {
      type: Date,
      required: true,
      set: function (value) {
        // Set the time to 00:00:00.000
        const date = new Date(value);
        date.setUTCHours(0, 0, 0, 0); // Ensure the time is zeroed out
        return date;
      },
    },
    selectedDate: { type: String },
    voucherType: { type: String, default: "purchase" },
    voucherNumber: { type: Number },
    convertedFrom: { type: Array, default: [] },
    serialNumber: { type: Number },
    userLevelSerialNumber: { type: Number },
    purchaseNumber: { type: String, required: true },
    Primary_user_id: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    cmp_id: { type: Schema.Types.ObjectId, ref: "Company", required: true },
    Secondary_user_id: { type: Schema.Types.ObjectId, ref: "User" },
    selectedGodownDetails: {
      godownName: { type: String, default: null },
      godownId: { type: Schema.Types.ObjectId, ref: "Godown", default: null },
    },

    partyAccount: { type: String, required: true },

    // Party with embedded details and reference ID
    party: {
      _id: { type: Schema.Types.ObjectId, ref: "Party" },
      partyName: { type: String },
      accountGroupName: { type: String },
      accountGroup_id: {
        type: mongoose.Types.ObjectId,
        ref: "AccountGroup",
        required: true,
      },
      subGroupName: { type: String },
      subGroup_id: { type: mongoose.Schema.Types.ObjectId, ref: "SubGroup" },
      mobileNumber: { type: String },
      country: { type: String },
      state: { type: String },
      pin: { type: String },
      emailID: { type: String },
      gstNo: { type: String },
      party_master_id: { type: String },
      billingAddress: { type: String },
      shippingAddress: { type: String },
      accountGroup: { type: String },
      totalOutstanding: { type: Number },
      latestBillDate: { type: Date, default: null },
      newAddress: { type: Object },

    },

    // priceLevel: { type: Schema.Types.ObjectId, ref: 'PriceLevel' },

    selectedPriceLevel: {
      _id: { type: Schema.Types.ObjectId, ref: "PriceLevel" },
      name: { type: String },
    },

    items: [
      {
        _id: { type: Schema.Types.ObjectId, ref: "Product" },
        product_name: { type: String },
        cmp_id: { type: Schema.Types.ObjectId, ref: "Company" },
        product_code: { type: String },
        balance_stock: { type: Number },
        Primary_user_id: { type: Schema.Types.ObjectId, ref: "User" },
        brand: { type: Schema.Types.ObjectId, ref: "Brand" },
        category: { type: Schema.Types.ObjectId, ref: "Category" },
        sub_category: { type: Schema.Types.ObjectId, ref: "SubCategory" },
        unit: { type: String },
        purchase_price: { type: Number },
        purchase_cost: { type: Number },
        item_mrp: { type: Number },

        GodownList: [
          {
            godownMongoDbId: { type: Schema.Types.ObjectId, ref: "Godown" },
            godown: { type: String },
            balance_stock: { type: Number },
            godown_id: { type: String },
            defaultGodown: { type: Boolean },
            batch: {
              type: String,
            },
            mfgdt: {
              type: String,
            },
            expdt: {
              type: String,
            },
            mrp: { type: Number },
            newBatch: { type: Boolean, default: false },
            supplierName: { type: String },
            voucherNumber: { type: Number },
            purchase_price: { type: Number },
            purchase_cost: { type: Number },
            hsn_code: { type: String },
            selectedPriceRate: { type: Number },
            added: { type: Boolean },
            count: { type: Number },
            actualCount: { type: Number },
            basePrice: { type: Number },
            discountAmount: { type: Number },
            discountPercentage: { type: Number },
            discountType: { type: String },
            taxableAmount: { type: Number },
            cgstValue: { type: Number },
            sgstValue: { type: Number },
            igstValue: { type: Number },
            cessValue: { type: Number },
            addlCessValue: { type: Number },
            cgstAmt: { type: Number },
            sgstAmt: { type: Number },
            igstAmt: { type: Number },
            cessAmt: { type: Number },
            addlCessAmt: { type: Number },
            individualTotal: { type: Number },
            isTaxInclusive: { type: Boolean },
            igstAmount: { type: Number },
            cgstAmount: { type: Number },
            sgstAmount: { type: Number },
            cessAmount: { type: Number },
            additionalCessAmount: { type: Number },
            totalCessAmount: { type: Number },
          },
        ],
        hsn_code: { type: String },

        cgst: { type: Number },
        sgst: { type: Number },
        igst: { type: Number },
        product_master_id: { type: String },
        batchEnabled: { type: Boolean },
        gdnEnabled: { type: Boolean },

        Priceleveles: [
          {
            _id: { type: Schema.Types.ObjectId, ref: "PriceLevel" },
            pricelevel: { type: String },
            pricerate: { type: Number },
            priceDisc: { type: Number },
            applicabledt: { type: String },
          },
        ],

        addl_cess: { type: Number },
        cess: { type: Number },
        hasGodownOrBatch: { type: Boolean },
        isTaxInclusive: { type: Boolean },
        isExpanded: { type: Boolean },
        totalCount: { type: Number },
        totalActualCount: { type: Number },
        total: { type: Number },
        totalCgstAmt: { type: Number },
        totalSgstAmt: { type: Number },
        totalIgstAmt: { type: Number },
        totalCessAmt: { type: Number },
        totalAddlCessAmt: { type: Number },
        added: { type: Boolean },
        taxInclusive: { type: Boolean },
      },
    ],

    despatchDetails: {
      type: Object,
      set: function (value) {
        // Ensure the title is always included
        return { title: "Despatch Details", ...value };
      },
      default: {
        title: "Despatch Details",
        challanNo: "",
        containerNo: "",
        despatchThrough: "",
        destination: "",
        vehicleNo: "",
        orderNo: "",
        termsOfPay: "",
        termsOfDelivery: "",
      },
    },

    additionalCharges: [
      {
        _id: { type: Schema.Types.ObjectId, ref: "AdditionalCharge" },
        option: { type: String },
        value: { type: String },
        action: { type: String },
        taxPercentage: { type: Number },
        hsn: { type: String },
        finalValue: { type: Number },
      },
    ],

    finalAmount: { type: Number, required: true },
    paymentSplittingData: { type: Object },
    isCancelled: { type: Boolean, default: false },
  },
  {
    timestamps: true,
  }
);

purchaseSchema.index({ cmp_id: 1 });
purchaseSchema.index({ Secondary_user_id: 1 });
purchaseSchema.index({ cmp_id: 1, serialNumber: -1 });
purchaseSchema.index({
  cmp_id: 1,
  Secondary_user_id: 1,
  userLevelSerialNumber: -1,
});
purchaseSchema.index({ date: 1 });
purchaseSchema.index({ "party._id": 1 });

export default mongoose.model("Purchase", purchaseSchema);
