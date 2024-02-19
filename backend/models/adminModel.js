import mongoose from "mongoose";
import bcrypt from 'bcryptjs'

const adminSchema = new mongoose.Schema(
  {
    email: { type: String },
    password: { type: String },
 
  },
  {
    timestamps: true,
  }
);

adminSchema.pre("save", async function (next) {
  if (!this.isModified("password")) {
    next();
  }

  const salt=await bcrypt.genSalt(10);
  this.password=await bcrypt.hash(this.password,salt)


});

export default mongoose.model("Admin", adminSchema);
