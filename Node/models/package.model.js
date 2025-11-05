import mongoose from "mongoose";
// Représente les packs optionnels Porsche (Weissach Package)
const packageSchema = new mongoose.Schema(
  {
    // Nom du package ( Weissach Package)
    nom_package: {
      type: String,
      required: true,
      trim: true,
      maxlength: 150,
    },
    description: {
      type: String,
      required: true,
      trim: true,
      maxlength: 1000,
    },
    prix: {
      type: Number,
      min: 0,
      default: 0,
      max: 100000,
    },
    photo_package: {
      type: String,
      trim: true,
    },
    // Disponibilité
    disponible: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

// Index pour accélérer les recherches
packageSchema.index({ nom_package: 1 });
packageSchema.index({ prix: 1 });
packageSchema.index({ disponible: 1 });

export default mongoose.model("Package", packageSchema);
