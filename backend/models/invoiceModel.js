import mongoose from "mongoose";

const invoiceSchema = new mongoose.Schema(
  {
    date: { 
      type: Date, 
      required: true,
      set: function(value) {
        // Set the time to 00:00:00.000
        const date = new Date(value);
        date.setUTCHours(0, 0, 0, 0); // Ensure the time is zeroed out
        return date;
      }
    },
    serialNumber: { type: Number }, // Add this line to include a serial number field
    orderNumber: { type: String, required: true },
    Primary_user_id: { type: String, required: true },
    Secondary_user_id: { type: String },
    cmp_id: { type: String, required: true },
    partyAccount: { type: String, required: true },

    party: { type: Object, required: true },
    priceLevel: { type: String },
    items: { type: Array, required: true },
    despatchDetails: { 
      type: Object ,
      set :function(value){
        return  { title: "Despatch Details", ...value };
      }
    },
    additionalCharges: { type: Array, required: true },
    finalAmount: { type: String, required: true },
    isCancelled: { type: Boolean, default: false },
    // createdAt: {
    //   type: Date,
    //   immutable: false  // Make sure this is false or not set
    // }
  },
  {
    timestamps: true,
  }
);
export default mongoose.model("Invoice", invoiceSchema);
