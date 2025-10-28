import mongoose from "mongoose";

const factureSchema = new mongoose.Schema(
  {
    stripeInvoiceId: {
      type: String,
      required: true,
      unique: true,
    },
    stripeSessionId: {
      type: String,
      required: true,
    },
    commande: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Commande",
      required: true,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    montantTotal: {
      type: Number,
      required: true,
    },
    montantHT: {
      type: Number,
      required: true,
    },
    tva: {
      type: Number,
      required: true,
      default: 20,
    },
    montantTVA: {
      type: Number,
      required: true,
    },
    devise: {
      type: String,
      required: true,
      default: "EUR",
    },
    methodePaiement: {
      type: String,
      required: true,
    },
    statutPaiement: {
      type: String,
      required: true,
      enum: ["paid", "pending", "failed", "refunded"],
      default: "paid",
    },
    datePaiement: {
      type: Date,
      required: true,
    },
    factureUrl: {
      type: String,
      required: true,
    },
    facturePdf: {
      type: String,
    },
    clientInfo: {
      nom: { type: String, required: true },
      prenom: { type: String, required: true },
      email: { type: String, required: true },
      telephone: { type: String },
      adresse: { type: String, required: true },
      codePostal: { type: String, required: true },
    },
    produits: [
      {
        type: {
          type: String,
          required: true,
          enum: ["voiture", "accessoire"],
        },
        nom: { type: String, required: true },
        description: { type: String },
        quantite: { type: Number, required: true },
        prixUnitaire: { type: Number, required: true },
        prixTotal: { type: Number, required: true },
        produitId: { type: String, required: true },
      },
    ],
    numeroFacture: {
      type: String,
      required: false,
      unique: true,
    },
    statut: {
      type: String,
      required: true,
      enum: ["emise", "envoyee", "payee", "annulee"],
      default: "payee",
    },
    notes: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

factureSchema.index({ user: 1, createdAt: -1 });
factureSchema.index({ commande: 1 });

factureSchema.pre("save", async function (next) {
  if (this.isNew && !this.numeroFacture) {
    try {
      const year = new Date().getFullYear();
      const count = await this.constructor.countDocuments({
        createdAt: {
          $gte: new Date(year, 0, 1),
          $lt: new Date(year + 1, 0, 1),
        },
      });
      this.numeroFacture = `PORSCHE-${year}-${String(count + 1).padStart(
        6,
        "0"
      )}`;
    } catch (error) {
      return next(error);
    }
  }
  next();
});

export default mongoose.model("Facture", factureSchema);
