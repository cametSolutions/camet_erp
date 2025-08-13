import mongoose from "mongoose";

const tableSchema = new mongoose.Schema({
  primary_user_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "PrimaryUser",
    
  },
 
  cmp_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Organization",
    required: true,
  },

 
    tableNumber: {
      type: String,
      trim: true,
    },


    status:{ 
      type: String,
      trim: true,
    },


  createdAt: {
    type: Date,
    default: Date.now,
  },

  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

export default mongoose.model("Table", tableSchema);
