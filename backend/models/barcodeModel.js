import mongoose from "mongoose";

const BarcodeSchema = new mongoose.Schema({
  cmp_id: { type: String, required: true },
  primary_user_id: { type: String, required: true },
  stickerName: { type: String,  }, // Name of the sticker or barcode
  printOn: { type: String,  }, // Print on details (e.g., material or surface)
  format1: { type: String,  }, // Format of the sticker 1
  format2: { type: String,  }, // Format of the sticker 2
  printOff: { type: String,  }, // Instructions or settings for print-off
});

export default mongoose.model("Barcode", BarcodeSchema);
