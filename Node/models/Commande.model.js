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
      max: 1000000,
    },
    // Acompte versé (voiture neuve uniquement 10%)
    acompte: {
      type: Number,
      min: 0,
      default: 0,
    },
    // Status : false = panier actif (non validé), true = commande validée/payée
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
    // ID de session Stripe pour idempotence et debug
    stripeSessionId: {
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

// Index pour accélérer les recherches
CommandeSchema.index({ user: 1 });
CommandeSchema.index({ status: 1 });
CommandeSchema.index({ date_commande: -1 });
CommandeSchema.index({ user: 1, status: 1 }); // Index composé pour panier actif

// Validation: l'acompte ne peut pas dépasser le prix
CommandeSchema.pre("save", function (next) {
  if (this.acompte > this.prix) {
    next(new Error("L'acompte ne peut pas dépasser le prix total"));
  } else {
    next();
  }
});

export default mongoose.model("Commande", CommandeSchema);
