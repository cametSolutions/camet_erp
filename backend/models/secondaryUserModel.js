import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const secondaryUserSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String },
    mobile: { type: Number },
    password: { type: String },
    organization: [{ type: mongoose.Schema.Types.ObjectId, ref: "Organization" }],
    primaryUser:{type:mongoose.Schema.Types.ObjectId,ref:"PrimaryUser"},
    otp:{type:Number},


    isBlocked: { type: Boolean, default: false },
    isApproved: { type: Boolean, default: true },
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
