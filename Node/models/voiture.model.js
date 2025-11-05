import mongoose from "mongoose";

const voitureSchema = new mongoose.Schema(
  {
    // Type: true = neuve, false = occasion
    type_voiture: {
      type: Boolean,
      required: true,
      default: false,
    },
    // Nom du modèle: 911, Cayman, Cayenne.
    nom_model: {
      type: String,
      required: true,
      //  nettoie automatiquement les espaces en début/fin avant validation
      trim: true,
      maxlength: 100,
    },
    // Description générale du modèle
    description: {
      type: String,
      trim: true,
      maxlength: 500,
    },
    // ⚠️ DÉPRÉCIÉ: Ce champ ne devrait PLUS être utilisé
    // Les prix sont maintenant dans MODEL_PORSCHE (prix_base de chaque variante)
    // Ex: 911 Carrera = 120k€, 911 GTS = 150k€, 911 Turbo = 200k€
    // Conservé pour compatibilité descendante uniquement
    prix: {
      type: Number,
      min: 0,
      max: 100000000,
      default: 0,
    },
    // Relation Many-to-Many: Photos associées
    photo_voiture: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Photo_voiture",
      },
    ],
  },
  { timestamps: true }
);

voitureSchema.index({ type_voiture: 1 });
voitureSchema.index({ nom_model: 1 });
voitureSchema.index({ prix: 1 });
voitureSchema.index({ createdAt: -1 });

export default mongoose.model("Voiture", voitureSchema);
