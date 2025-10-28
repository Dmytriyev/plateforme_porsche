import joi from "joi";

export default function factureValidation(body) {
  const factureCreate = joi.object({
    stripeInvoiceId: joi.string().required(),
    stripeSessionId: joi.string().required(),
    commande: joi.string().hex().length(24).required(),
    user: joi.string().hex().length(24).required(),
    montantTotal: joi.number().min(0).required(),
    montantHT: joi.number().min(0).required(),
    tva: joi.number().min(0).max(100).default(20),
    montantTVA: joi.number().min(0).required(),
    devise: joi.string().length(3).default("EUR"),
    methodePaiement: joi.string().required(),
    statutPaiement: joi
      .string()
      .valid("paid", "pending", "failed", "refunded")
      .default("paid"),
    datePaiement: joi.date().required(),
    factureUrl: joi.string().uri().required(),
    facturePdf: joi.string(),
    clientInfo: joi
      .object({
        nom: joi.string().required(),
        prenom: joi.string().required(),
        email: joi.string().email().required(),
        telephone: joi.string(),
        adresse: joi.string().required(),
        codePostal: joi.string().required(),
      })
      .required(),
    produits: joi
      .array()
      .items(
        joi.object({
          type: joi.string().valid("voiture", "accessoire").required(),
          nom: joi.string().required(),
          description: joi.string(),
          quantite: joi.number().min(1).required(),
          prixUnitaire: joi.number().min(0).required(),
          prixTotal: joi.number().min(0).required(),
          produitId: joi.string().required(),
        })
      )
      .min(1)
      .required(),
    numeroFacture: joi.string(),
    statut: joi
      .string()
      .valid("emise", "envoyee", "payee", "annulee")
      .default("payee"),
    notes: joi.string(),
  });

  const factureUpdate = joi.object({
    statutPaiement: joi.string().valid("paid", "pending", "failed", "refunded"),
    facturePdf: joi.string(),
    statut: joi.string().valid("emise", "envoyee", "payee", "annulee"),
    notes: joi.string(),
  });

  const factureSearch = joi.object({
    user: joi.string().hex().length(24),
    commande: joi.string().hex().length(24),
    statutPaiement: joi.string().valid("paid", "pending", "failed", "refunded"),
    statut: joi.string().valid("emise", "envoyee", "payee", "annulee"),
    dateDebut: joi.date(),
    dateFin: joi.date(),
  });

  return {
    factureCreate: factureCreate.validate(body),
    factureUpdate: factureUpdate.validate(body),
    factureSearch: factureSearch.validate(body),
  };
}
