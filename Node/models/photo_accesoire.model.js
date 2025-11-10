import mongoose from "mongoose";

const photo_accesoireSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      maxlength: 100,
    },
    alt: {
      type: String,
      required: true,
      trim: true,
      maxlength: 100,
    },
    // Relation Many-to-One: accesoire associé
    accesoire: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Accesoire",
      required: true,
    },
  },
  { timestamps: true }
);

// Index pour accélérer les recherches
photo_accesoireSchema.index({ accesoire: 1 });

export default mongoose.model("Photo_accesoire", photo_accesoireSchema);
