import mongoose from "mongoose";

const BarcodeSchema = new mongoose.Schema({
  cmp_id: { type: String, required: true },
  primary_user_id: { type: String, required: true },
  stickerName: { type: String, required: true }, // Name of the sticker or barcode
  printOn: { type: String, required: true }, // Print on details (e.g., material or surface)
  format1: { type: String, required: true }, // Format of the sticker 1
  format2: { type: String, required: true }, // Format of the sticker 2
  printOff: { type: String, required: true }, // Instructions or settings for print-off
});

export default mongoose.model("Barcode", BarcodeSchema);
