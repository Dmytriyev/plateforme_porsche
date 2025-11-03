import mongoose from "mongoose";

const CommandeSchema = new mongoose.Schema(
  {
    date_commande: {
      type: Date,
      required: true,
      default: Date.now,
    },
    // Prix total de la commande
    prix: {
      type: Number,
      min: 0,
      default: 0,
    },
    // Acompte versé (voiture neuve uniquement)
    acompte: {
      type: Number,
      min: 0,
      default: 0,
    },
    // Status : false = panier actif, true = commande validée
    status: {
      type: Boolean,
      required: true,
      default: false,
    },
    // URL de la facture PDF générée
    factureUrl: {
      type: String,
      trim: true,
    },
    // Relation Many-to-One: Utilisateur propriétaire
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Propriété virtuelle: récupère toutes les lignes de cette commande
CommandeSchema.virtual("lignesCommande", {
  ref: "LigneCommande",
  localField: "_id",
  foreignField: "commande",
});

export default mongoose.model("Commande", CommandeSchema);
