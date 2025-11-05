import mongoose from "mongoose";

const couleur_interieurSchema = new mongoose.Schema(
  {
    nom_couleur: {
      type: String,
      required: true,
      trim: true,
      maxlength: 100,
    },
    photo_couleur: {
      type: String,
      trim: true,
    },
    description: {
      type: String,
      trim: true,
      maxlength: 500,
    },
    // Prix supplémentaire pour cette couleur
    prix: {
      type: Number,
      min: 0,
      default: 0,
      max: 100000,
    },
    // Relation One-to-Many: Modèles utilisant cette couleur
    model_porsche: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Model_porsche",
      },
    ],
  },
  { timestamps: true }
);

// Index pour accélérer les recherches
couleur_interieurSchema.index({ nom_couleur: 1 });
couleur_interieurSchema.index({ prix: 1 });

export default mongoose.model("Couleur_interieur", couleur_interieurSchema);
