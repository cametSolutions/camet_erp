import mongoose from "mongoose";
const { Schema } = mongoose;

const StockTransferSchema = new mongoose.Schema(
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
    voucherType: { type: String, default: "stockTransfer" },
    serialNumber: { type: Number },
    stockTransferNumber: { type: String, required: true },
    Primary_user_id: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    Secondary_user_id: { type: Schema.Types.ObjectId, ref: "User" },
    cmp_id: { type: Schema.Types.ObjectId, ref: "Company", required: true },
    stockTransferToGodown: {
      _id: { type: Schema.Types.ObjectId, ref: "Godown", default: null },
      godown: { type: String, default: null },
      godown_id: { type: String, default: null },
      defaultGodown: { type: Boolean, default: false },
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
    finalAmount: { type: Number, required: true },
    isCancelled: { type: Boolean, default: false },
  },
  {
    timestamps: true,
  }
);

StockTransferSchema.index({ cmp_id: 1 });
StockTransferSchema.index({ Secondary_user_id: 1 });
StockTransferSchema.index({ cmp_id: 1, serialNumber: -1 });
StockTransferSchema.index({
  cmp_id: 1,
  Secondary_user_id: 1,
  userLevelSerialNumber: -1,
});
StockTransferSchema.index({ date: 1 });
StockTransferSchema.index({ "party._id": 1 });
export default mongoose.model("StockTransfer", StockTransferSchema);
