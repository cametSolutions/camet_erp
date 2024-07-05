import mongoose from "mongoose";


const brandSchema = new mongoose.Schema({
    brand: { type: String, required: true },
    cmp_id: { type: String, required: true },
    Primary_user_id: { type: String, required: true }
});


const categorySchema = new mongoose.Schema({
    category: { type: String, required: true },
    cmp_id: { type: String, required: true },
    Primary_user_id: { type: String, required: true }
});

const subcategorySchema = new mongoose.Schema({
    subcategory: { type: String, required: true },
    // categoryId: { type: mongoose.Schema.Types.ObjectId, ref: 'Category', required: true },
    cmp_id: { type: String, required: true },
    Primary_user_id: { type: String, required: true }
});

const godownScheme = new mongoose.Schema({
    godown: { type: String, required: true },
    cmp_id: { type: String, required: true },
    Primary_user_id: { type: String, required: true }
});

const priceLevelSchema = new mongoose.Schema({
    pricelevel: { type: String, required: true },
    cmp_id: { type: String, required: true },
    Primary_user_id: { type: String, required: true }
});

export const Brand = mongoose.model("Brand", brandSchema); 
export const Category = mongoose.model("Category", categorySchema); 
export const Subcategory = mongoose.model("Subcategory", subcategorySchema);
export const Godown = mongoose.model("Godown", godownScheme);
export const PriceLevel = mongoose.model("PriceLevel", priceLevelSchema);
   