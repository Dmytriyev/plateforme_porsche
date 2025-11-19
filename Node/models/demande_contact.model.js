import mongoose from "mongoose";

const demandeContactSchema = new mongoose.Schema(
  {
    prenom: {
      type: String,
      required: true,
      trim: true,
      maxlength: 100,
    },
    nom: {
      type: String,
      required: true,
      trim: true,
      maxlength: 100,
    },
    email: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
      maxlength: 150,
    },
    telephone: {
      type: String,
      required: true,
      trim: true,
      maxlength: 20,
    },
    message: {
      type: String,
      trim: true,
      maxlength: 2000,
    },
    vehicule_id: {
      type: mongoose.Schema.Types.ObjectId,
      refPath: 'type_vehicule_model',
    },
    type_vehicule: {
      type: String,
      enum: ['occasion', 'neuf', 'autre'],
      default: 'autre',
    },
    type_vehicule_model: {
      type: String,
      enum: ['Model_porsche', 'Voiture', null],
    },
    user_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    statut: {
      type: String,
      enum: ['nouvelle', 'en_cours', 'traitee', 'fermee'],
      default: 'nouvelle',
    },
  },
  { timestamps: true }
);

// Index pour optimiser les recherches
demandeContactSchema.index({ email: 1 });
demandeContactSchema.index({ statut: 1 });
demandeContactSchema.index({ createdAt: -1 });
demandeContactSchema.index({ user_id: 1 });

export default mongoose.model("Demande_contact", demandeContactSchema);

