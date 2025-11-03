import mongoose from "mongoose";

const photo_accesoireSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    alt: {
      type: String,
      required: true,
      trim: true,
    },
    // Relation Many-to-One: Accessoire associé
    accesoire: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Accesoire",
      required: true,
    },
  },
  { timestamps: true }
);

export default mongoose.model("Photo_accesoire", photo_accesoireSchema);
