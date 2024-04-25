import mongoose from "mongoose";

const invoiceSchema = new mongoose.Schema(
 {
    serialNumber: { type: Number }, // Add this line to include a serial number field
    orderNumber: { type: String, required: true },
    Primary_user_id: { type: String, required: true },
    Secondary_user_id: { type: String },
    cmp_id:{ type: String, required: true },
    party: { type: Object, required: true },
    priceLevel: { type: String, required: true },
    items: { type: Array, required: true },
    additionalCharges: { type: Array, required: true },
    finalAmount: { type: String, required: true },
 },
 {
    timestamps: true,
 }
);

// Pre-save hook to generate serial number
invoiceSchema.pre('save', async function (next) {

  console.log("haiii");
 try {
    if (!this.serialNumber) {
      const lastInvoice = await this.constructor.findOne({}, {}, { sort: { 'serialNumber': -1 } });
      this.serialNumber = lastInvoice ? lastInvoice.serialNumber + 1 : 1;
    }
    next();
 } catch (error) {
    next(error);
 }
});

export default mongoose.model("Invoice", invoiceSchema);

