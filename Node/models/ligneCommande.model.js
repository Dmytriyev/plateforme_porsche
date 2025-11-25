/**
 * Modèle LigneCommande
 * - Représente un élément du panier (voiture ou accessoire)
 * - Contient quantité, prix, acompte et références vers la commande et le produit
 */
import mongoose from "mongoose";

const ligneCommandeSchema = new mongoose.Schema(
  {
    // Type de produit: true = voiture, false = accessoire
    type_produit: {
      type: Boolean,
      required: true,
    },
    quantite: {
      type: Number,
      required: true,
      min: 1,
      default: 1,
      max: 1000,
      validate: {
        validator: function (value) {
          // Les voitures neuves ne peuvent avoir qu'une quantité de 1
          if (this.type_produit === true && value > 1) {
            return false;
          }
          return true;
        },
        message: "Une voiture neuve ne peut être commandée qu'en quantité 1",
      },
    },
    // Prix total de la ligne
    prix: {
      type: Number,
      min: 0,
      default: 0,
      max: 1000000,
    },
    // Acompte versé (voiture neuve uniquement: 10%)
    acompte: {
      type: Number,
      min: 0,
      default: 0,
    },
    // Relation Many-to-One: Voiture commandée (si type_produit = true)
    // Ce champ est rempli automatiquement depuis model_porsche_id
    voiture: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Voiture",
      required: function () {
        return this.type_produit === true;
      },
    },
    // Relation Many-to-One (pour voitures neuves personnalisées)
    model_porsche_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Model_porsche",
      required: function () {
        return this.type_produit === true;
      },
    },
    // Relation Many-to-One: accesoire commandé (si type_produit = false)
    accesoire: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Accesoire",
      required: function () {
        return this.type_produit === false;
      },
    },
    // Relation Many-to-One: Commande
    commande: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Commande",
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

// Index pour accélérer les recherches
ligneCommandeSchema.index({ commande: 1 });
ligneCommandeSchema.index({ voiture: 1 });
ligneCommandeSchema.index({ model_porsche_id: 1 });
ligneCommandeSchema.index({ accesoire: 1 });
ligneCommandeSchema.index({ type_produit: 1 });

// l'acompte ne peut pas dépasser le prix
ligneCommandeSchema.pre("save", function (next) {
  if (this.acompte > this.prix) {
    next(new Error("L'acompte ne peut pas dépasser le prix total"));
  } else {
    next();
  }
});

export default mongoose.model("LigneCommande", ligneCommandeSchema);
