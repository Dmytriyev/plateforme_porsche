import mongoose from "mongoose";

const photo_porscheSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      maxlength: 100,
    },
    alt: {
      type: String,
      trim: true,
      maxlength: 100,
    },
    // Relation Many-to-One: Modèle Porsche associé
    model_porsche: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Model_porsche",
      required: true,
    },
    // Relation Many-to-One: Couleur extérieure
    couleur_exterieur: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Couleur_exterieur",
    },
    // Relation Many-to-One: Couleur intérieure
    couleur_interieur: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Couleur_interieur",
    },
  },
  { timestamps: true }
);

// Index pour accélérer les recherches
photo_porscheSchema.index({ model_porsche: 1 });

export default mongoose.model("Photo_porsche", photo_porscheSchema);
