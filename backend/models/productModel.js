import mongoose from "mongoose";

const productSchema = new mongoose.Schema({
  product_name: {
    type: String,
    required: true,
  },
  cmp_id: {
    type: String,
    required: true,
  },
  product_code: {
    type: String,
  },
  balance_stock: {
    type: Number,
    default: 0,
  },
  Primary_user_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "PrimaryUser",
    required: true,
  },
  Secondary_user_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "SecondaryUser",
  },
  brand: {
    type: Object,
  },
  category: {
    type: Object,
  },
  sub_category: {
    type: Object,
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
  },
  hsn_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Hsn",
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
    type: Array, // Array of objects with balance_stock
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
  product_master_id: {
    type: String,
  },
  subcategory_id: {
    type: String,
  },
  brand_id: {
    type: String,
  },
  batchEnabled:{
    type: Boolean,
    default: false
  }
}

);

// Function to truncate to a specified number of decimals
// const truncateToNDecimals = (value, n) => {
//   const num = parseFloat(value);
//   if (isNaN(num)) {
//     return value; // Return the original value if it's not a number
//   }
//   return parseFloat(num.toFixed(n));
// };

// // Pre-save middleware to truncate fields
// productSchema.pre('save', function (next) {
//   const n = 2; // Number of decimals to truncate to

//   const fieldsToTruncate = [
//     'balance_stock', 'purchase_price', 'purchase_cost',
//     'cgst', 'sgst', 'igst', 'cess', 'addl_cess', 'state_cess'
//   ];

//   fieldsToTruncate.forEach(field => {
//     if (this[field]) {
//       this[field] = truncateToNDecimals(this[field], n);
//     }
//   });

//   if (this.GodownList && Array.isArray(this.GodownList)) {
//     this.GodownList.forEach(godown => {
//       if (godown.balance_stock) {
//         godown.balance_stock = truncateToNDecimals(godown.balance_stock, n);
//       }
//     });
//   }

//   next();
// });

// // Pre-update middleware to truncate fields
// productSchema.pre(['findOneAndUpdate', 'updateOne', 'updateMany'], function (next) {
//   const update = this.getUpdate();
//   const n = 2; // Number of decimals to truncate to

//   const fieldsToTruncate = [
//     'balance_stock', 'purchase_price', 'purchase_cost',
//     'cgst', 'sgst', 'igst', 'cess', 'addl_cess', 'state_cess'
//   ];

//   fieldsToTruncate.forEach(field => {
//     if (update[field]) {
//       update[field] = truncateToNDecimals(update[field], n);
//     }
//   });

//   if (update.GodownList && Array.isArray(update.GodownList)) {
//     update.GodownList.forEach(godown => {
//       if (godown.balance_stock) {
//         godown.balance_stock = truncateToNDecimals(godown.balance_stock, n);
//       }
//     });
//   }

//   next();
// });

export default mongoose.model("Product", productSchema);
