import mongoose from "mongoose";

const productSchema = new mongoose.Schema({
  product_name: {
    type: String,
    required: true,
  },
  product_code: {
    type: String,
  },
  balance_stock: {
    type: String,
  },
  distributor_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "PrimaryUser",
  },
  brand: {
    type: String,
  },
  category: {
    type: String,
  },
  sub_category: {
    type: String,
  },
  unit: {
    type: String,
    required: true,
  },
  alt_unit: {
    type: String,
  },
  unit_conversion: {
    type: Number,
  },
  alt_unit_conversion: {
    type: Number,
  },
  godownCount: {
    type: Number,
  },
  pricelevelcount: {
    type: Number,
  },
  hsn_code: {
    type: String,
    required: true,
  },
  purchase_price: {
    type: String,
  },
  purchase_cost: {
    type: String,
  },
  Priceleveles: {
    type: Array, // Array of strings
  },
  GodownList: {
    type: Array, // Array of strings
  },
  cgst: {
    type: String,
  },
  sgst: {
    type: String,
  },
  igst: {
    type: String,
  },
  cess: {
    type: String,
  },
  addl_cess: {
    type: String,
  },
  state_cess: {
    type: String,
  },
  product_id: {
    type: String,
  },
  category_id: {
    type: String,
  },
  subcategory_id: {
    type: String,
  },
  brand_id: {
    type: String,
  },
});

export default mongoose.model("Product", productSchema);
