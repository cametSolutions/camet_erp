import mongoose from "mongoose";

const productSchema = new mongoose.Schema({
  product_name: {
    type: String,
    required: true,
  },
  cmp_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Organization",
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
    type: mongoose.Schema.Types.ObjectId,
    ref: "Brand",
  },
  category:  {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Category",
  },
  sub_category: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Subcategory",
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

  hsn: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Hsn",
  },
  purchase_price: {
    type: Number,
  },
  purchase_cost: {
    type: Number,
  },
  item_mrp: {
    type: Number,
  },
  Priceleveles: [
    {
      pricelevel: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "PriceLevel", // Reference to the Pricelevel model
        // required: true,
      },
      pricerate: {
        type: Number,
        required: true,
      },
    },
  ],
  
  GodownList: [
    {
      godown: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Godown", // Reference to the Godown model
        // required: true,
      },
      balance_stock: {
        type: Number,
        default: 0,
      },
      batch: {
        type: String,
      },
    },
  ],
  
  cgst: {
    type: Number,
  },
  sgst: {
    type: Number,
  },
  igst: {
    type: Number,
  },
  cess: {
    type: Number,
  },
  addl_cess: {
    type: Number,
  },
  state_cess: {
    type: Number,
  },
  product_master_id: {
    type: String,
  },
  // subcategory_id: {
  //   type: String,
  // },
  // brand_id: {
  //   type: String,
  // },
  batchEnabled: {
    type: Boolean,
    default: false,
  },
  gdnEnabled: {
    type: Boolean,
    default: false,
  },
});

export default mongoose.model("Product", productSchema);
