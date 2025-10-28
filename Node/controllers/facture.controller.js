import Facture from "../models/facture.model.js";
import Commande from "../models/Commande.model.js";
import User from "../models/user.model.js";
import LigneCommande from "../models/ligneCommande.model.js";
import factureValidation from "../validations/facture.validation.js";

export const createFactureFromStripe = async (stripeSession, stripeInvoice) => {
  try {
    const commandeId = stripeSession.metadata.commandeId;

    const commande = await Commande.findById(commandeId).populate("user");
    if (!commande) {
      throw new Error(`Commande ${commandeId} introuvable`);
    }

    const lignesCommande = await LigneCommande.find({ commande: commandeId })
      .populate("voiture", "nom_model prix acompte")
      .populate("accesoire", "nom_accesoire prix description");

    if (lignesCommande.length === 0) {
      throw new Error(
        `Aucune ligne de commande trouvée pour la commande ${commandeId}`
      );
    }

    const montantTotal = stripeSession.amount_total / 100;
    const montantHT = Math.round((montantTotal / 1.2) * 100) / 100;
    const montantTVA = montantTotal - montantHT;

    const clientInfo = {
      nom: commande.user.nom,
      prenom: commande.user.prenom,
      email: commande.user.email,
      telephone: commande.user.telephone,
      adresse: commande.user.adresse,
      codePostal: commande.user.code_postal,
    };

    const produits = lignesCommande
      .map((ligne) => {
        if (ligne.voiture) {
          return {
            type: "voiture",
            nom: ligne.voiture.nom_model,
            description: `Voiture ${ligne.voiture.nom_model}`,
            quantite: ligne.quantite,
            prixUnitaire: ligne.prix,
            prixTotal: ligne.prix * ligne.quantite,
            produitId: ligne.voiture._id.toString(),
          };
        } else if (ligne.accesoire) {
          return {
            type: "accessoire",
            nom: ligne.accesoire.nom_accesoire,
            description:
              ligne.accesoire.description ||
              `Accessoire ${ligne.accesoire.nom_accesoire}`,
            quantite: ligne.quantite,
            prixUnitaire: ligne.prix,
            prixTotal: ligne.prix * ligne.quantite,
            produitId: ligne.accesoire._id.toString(),
          };
        }
      })
      .filter(Boolean);

    const factureData = {
      stripeInvoiceId: stripeInvoice.id,
      stripeSessionId: stripeSession.id,
      commande: commandeId,
      user: commande.user._id,
      montantTotal,
      montantHT,
      tva: 20,
      montantTVA,
      devise: stripeSession.currency.toUpperCase(),
      methodePaiement: stripeSession.payment_method_types[0] || "card",
      statutPaiement: "paid",
      datePaiement: new Date(stripeSession.created * 1000),
      factureUrl: stripeInvoice.hosted_invoice_url,
      clientInfo,
      produits,
      statut: "payee",
    };

    const { error } = factureValidation(factureData).factureCreate;
    if (error) {
      throw new Error(`Validation error: ${error.details[0].message}`);
    }

    const facture = new Facture(factureData);
    const savedFacture = await facture.save();

    console.log(
      `Facture créée: ${savedFacture.numeroFacture} pour la commande ${commandeId}`
    );

    return savedFacture;
  } catch (error) {
    console.error("Erreur création facture:", error);
    throw error;
  }
};

export const createFacture = async (req, res) => {
  try {
    const factureData = req.body;

    const requiredFields = [
      "numeroFacture",
      "stripeInvoiceId",
      "stripeSessionId",
      "commande",
      "user",
      "montantTotal",
      "montantHT",
      "montantTVA",
      "methodePaiement",
      "datePaiement",
      "factureUrl",
      "clientInfo",
      "produits",
    ];

    for (const field of requiredFields) {
      if (!factureData[field]) {
        return res.status(400).json({
          message: `Champ requis manquant: ${field}`,
        });
      }
    }

    const requiredClientFields = [
      "nom",
      "prenom",
      "email",
      "adresse",
      "codePostal",
    ];
    for (const field of requiredClientFields) {
      if (!factureData.clientInfo[field]) {
        return res.status(400).json({
          message: `Champ clientInfo.${field} requis manquant`,
        });
      }
    }

    const facture = new Facture(factureData);
    await facture.save();

    const facturePopulated = await Facture.findById(facture._id)
      .populate("user", "nom prenom email")
      .populate("commande", "date_commande");

    res.status(201).json(facturePopulated);
  } catch (error) {
    console.error("Erreur création facture manuelle:", error);
    res.status(500).json({
      message: "Erreur lors de la création de la facture",
      error: error.message,
    });
  }
};

export const getAllFactures = async (req, res) => {
  try {
    const factures = await Facture.find()
      .populate("user", "nom prenom email")
      .populate("commande", "date_commande")
      .sort({ createdAt: -1 });

    res.status(200).json({
      message: "Factures récupérées avec succès",
      count: factures.length,
      data: factures,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Erreur serveur", error: error.message });
  }
};

export const getFactureById = async (req, res) => {
  try {
    const facture = await Facture.findById(req.params.id)
      .populate("user", "nom prenom email telephone adresse code_postal")
      .populate("commande", "date_commande prix acompte");

    if (!facture) {
      return res.status(404).json({ message: "Facture introuvable" });
    }

    res.status(200).json({
      message: "Facture récupérée avec succès",
      data: facture,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Erreur serveur", error: error.message });
  }
};

export const getFacturesByUser = async (req, res) => {
  try {
    const { userId } = req.params;

    const factures = await Facture.find({ user: userId })
      .populate("commande", "date_commande")
      .sort({ createdAt: -1 });

    res.status(200).json({
      message: "Factures utilisateur récupérées avec succès",
      count: factures.length,
      data: factures,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Erreur serveur", error: error.message });
  }
};

export const updateFacture = async (req, res) => {
  try {
    const { body } = req;
    const { error } = factureValidation(body).factureUpdate;

    if (error) {
      return res.status(400).json({ message: error.details[0].message });
    }

    const facture = await Facture.findByIdAndUpdate(req.params.id, body, {
      new: true,
      runValidators: true,
    }).populate("user", "nom prenom email");

    if (!facture) {
      return res.status(404).json({ message: "Facture introuvable" });
    }

    res.status(200).json({
      message: "Facture mise à jour avec succès",
      data: facture,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Erreur serveur", error: error.message });
  }
};

export const searchFactures = async (req, res) => {
  try {
    const { query } = req;
    const { error } = factureValidation(query).factureSearch;

    if (error) {
      return res.status(400).json({ message: error.details[0].message });
    }

    // Construire les critères de recherche
    const criteria = {};

    if (query.user) criteria.user = query.user;
    if (query.commande) criteria.commande = query.commande;
    if (query.statutPaiement) criteria.statutPaiement = query.statutPaiement;
    if (query.statut) criteria.statut = query.statut;

    if (query.dateDebut || query.dateFin) {
      criteria.createdAt = {};
      if (query.dateDebut) criteria.createdAt.$gte = new Date(query.dateDebut);
      if (query.dateFin) criteria.createdAt.$lte = new Date(query.dateFin);
    }

    const factures = await Facture.find(criteria)
      .populate("user", "nom prenom email")
      .populate("commande", "date_commande")
      .sort({ createdAt: -1 });

    res.status(200).json({
      message: "Recherche factures réussie",
      count: factures.length,
      criteria,
      data: factures,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Erreur serveur", error: error.message });
  }
};

export const deleteFacture = async (req, res) => {
  try {
    const facture = await Facture.findByIdAndUpdate(
      req.params.id,
      { statut: "annulee" },
      { new: true }
    );

    if (!facture) {
      return res.status(404).json({ message: "Facture introuvable" });
    }

    res.status(200).json({
      message: "Facture annulée avec succès",
      data: facture,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Erreur serveur", error: error.message });
  }
};
