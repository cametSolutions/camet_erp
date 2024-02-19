import mongoose from "mongoose";
import bcrypt from 'bcryptjs'

const primaryUserSchema = new mongoose.Schema(
  {
    userName: { type: String, required: true },
    email: { type: String ,unique:true},
    mobile: { type: Number,unique:true },
    password: { type: String },
    subscription: { type: String},
    sms: { type: Boolean, default: false },
    whatsApp: { type: Boolean, default: false },
    isBlocked: { type: Boolean, default: false },
    isApproved: { type: Boolean, default: true },
    otp:{type:Number}
  },
  {
    timestamps: true,
  }
);

primaryUserSchema.pre("save", async function (next) {
  console.log("pre save middleware triggered");
  if (!this.isModified("password")) {
    next();
  }

  const salt=await bcrypt.genSalt(10);
  this.password=await bcrypt.hash(this.password,salt)


});

export default mongoose.model("PrimaryUser", primaryUserSchema);
