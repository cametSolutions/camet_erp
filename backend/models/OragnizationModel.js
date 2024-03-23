import mongoose from "mongoose";

const organizationSchema = new mongoose.Schema(
  {
  
    name: { type: String, required: true },
    flat: { type: String },
    road: { type: String },
    landmark: { type: String },
    email:{type:String},
    mobile:{ type: Number },
    senderId:{type:String},
    username:{type:String},
    password:{type:String},
    pin: { type: Number },
    gstNum:{ type: String },
    website:{ type: String },
    pan:{ type: String },
    financialYear:{ type: String },
    country: { type: String },
    logo: { type: String },
    state: { type: String },
    isBlocked: { type: Boolean, default: false },
    isApproved: { type: Boolean, default: false },
    owner:{type:mongoose.Schema.Types.ObjectId,ref:"PrimaryUser"},
    brands:{type:Array},
    categories:{type:Array},
    subcategories:{type:Array},
    levelNames:{type:Array},
    locations:{type:Array},
    type:{type:String,default:"self"},
    orderNumber:{type:Number,default:1},
    OrderNumberValue:{type:String},
    OrderNumberDetails:{type:Object}
    
  },
  {
    timestamps: true,
  }
);


export default mongoose.model("Organization", organizationSchema);
