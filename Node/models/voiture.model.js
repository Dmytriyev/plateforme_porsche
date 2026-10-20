/**
 * Schéma Mongoose pour les configurations de modèles Porsche.
 * 1. USER visite voiture une model-start(911)
 * 2. USER choisit model_porsche une VARIANTE (Carrera, Carrera S, GTS, Turbo)
 * 3. Chaque variante a ses specs (puissance, transmission, accélération)
 * 4. USER configure: couleurs, jantes, sièges, package, options
 * 5. calcule prix total (prix_base_variante + options)
 * voiture = Modèle de voiture général (911, Cayman, Cayenne)
 */
import mongoose from "mongoose";
import { PORSCHE_MODELS } from "../utils/model_porsche.constants.js";

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
      enum: PORSCHE_MODELS,
    },
    // Description générale du modèle
    description: {
      type: String,
      trim: true,
      maxlength: 500,
    },
    // Relation Many-to-Many: Photos associées
    photo_voiture: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Photo_voiture",
      },
    ],
  },
  { timestamps: true },
);
// Indexes pour optimiser les requêtes fréquentes
voitureSchema.index({ type_voiture: 1 });
voitureSchema.index({ nom_model: 1 });
voitureSchema.index({ createdAt: -1 });

export default mongoose.model("Voiture", voitureSchema);
