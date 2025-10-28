import mongoose from "mongoose";

const photo_accesoireSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    alt: {
      type: String,
      required: true,
    },
    accesoire: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Accesoire",
      required: true,
    },
  },
  { timestamps: true }
);

export default mongoose.model("Photo_accesoire", photo_accesoireSchema);
