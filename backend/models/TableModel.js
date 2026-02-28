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
  description: {
    type: String,
    trim: true,
  },
  status: { 
    type: String,
    trim: true,
  },

},{ timestamps: true });

// **ADD THIS VIRTUAL FIELD - 24 HOUR AUTO AVAILABLE LOGIC**
tableSchema.virtual('effectiveStatus').get(function() {
  if (this.status !== 'occupied') return this.status;
  
  const hoursDiff = (Date.now() - this.updatedAt.getTime()) / (1000 * 60 * 60);
  return hoursDiff > 24 ? 'available' : this.status;
});

// **ADD THESE LINES - ENABLE VIRTUALS IN JSON**
tableSchema.set('toJSON', { virtuals: true });
tableSchema.set('toObject', { virtuals: true });

export default mongoose.model("Table", tableSchema);
