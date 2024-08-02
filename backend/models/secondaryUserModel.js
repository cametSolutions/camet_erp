import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const secondaryUserSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String },
    mobile: { type: Number },
    password: { type: String },
    organization: [
      { type: mongoose.Schema.Types.ObjectId, ref: "Organization" },
    ],
    primaryUser: { type: mongoose.Schema.Types.ObjectId, ref: "PrimaryUser" },
    otp: { type: Number },
    configurations: [
      {
        organization: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Organization",
        },
        selectedGodowns: { type: Array },
        selectedPriceLevels: { type: Array },
        salesConfiguration: { type: Object },
        salesOrderConfiguration: { type: Object },
        receiptConfiguration: { type: Object },
        purchaseConfiguration: { type: Object },
        vanSaleConfiguration: { type: Object },
        stockTransferConfiguration: { type: Object },
        vanSale: { type: Boolean },
        selectedVanSaleGodowns: { type: Array },
        orderNumber: { type: Number },
        salesNumber: { type: Number },
        purchaseNumber: { type: Number },
        receiptNumber: { type: Number },
        vanSalesNumber: { type: Number },
        stockTransferNumber: { type: Number },
        // vanSaleGodown:{type:String}
      },
    ],
    isBlocked: { type: Boolean, default: false },
    // orderNumber: { type: Number, default: 1 },
    // salesNumber: { type: Number, default: 1 },
    // vanSalesNumber: { type: Number, default: 1 },
    // purchaseNumber: { type: Number, default: 1 },
  },
  {
    timestamps: true,
  }
);

secondaryUserSchema.pre("save", async function (next) {
  if (!this.isModified("password")) {
    next();
  }

  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

export default mongoose.model("SecondaryUser", secondaryUserSchema);
