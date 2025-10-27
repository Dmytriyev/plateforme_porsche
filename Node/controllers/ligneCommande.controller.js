import LigneCommande from "../models/ligneCommande.model.js";
import Commande from "../models/Commande.model.js";
import ligneCommandeValidation from "../validations/ligneCommande.validation.js";

/**
 * Créer une nouvelle ligne de commande
 * Ajoute un produit (voiture ou accessoire) à la commande active de l'utilisateur
 */
const createLigneCommande = async (req, res) => {
  try {
    // Extraction des données de la requête et de l'utilisateur connecté
    const { body, user } = req;

    // Recherche de la commande active de l'utilisateur (status: true = commande en cours)
    const commande = await Commande.findOne({ user: user.id, status: true });
    console.log(body);

    // Validation de la présence des données
    if (!body) {
      return res
        .status(400)
        .json({ message: "Pas de données dans la requête" });
    }

    // Construction de l'objet ligne avec l'ID de la commande associée
    const line = { ...body, commande: commande._id.toString() };
    console.log(line);

    // Validation des données avec le schéma Joi défini
    const { error } = ligneCommandeValidation(line).ligneCommandeCreate;
    if (error) {
      return res.status(401).json(error.details[0].message);
    }

    // Création et sauvegarde de la nouvelle ligne de commande
    const ligneCommande = new LigneCommande(line);
    const newLigneCommande = await ligneCommande.save();

    // Retour de la ligne créée avec succès
    return res.status(201).json(newLigneCommande);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Erreur serveur", error: error });
  }
};

/**
 * Récupérer toutes les lignes de commande
 * Retourne la liste complète de toutes les lignes de commande dans la base
 */
const getAllLigneCommandes = async (req, res) => {
  try {
    // Récupération de toutes les lignes de commande sans filtre
    const ligneCommandes = await LigneCommande.find();
    return res.status(200).json(ligneCommandes);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Erreur serveur", error: error });
  }
};

/**
 * Récupérer une ligne de commande par son ID
 * Trouve et retourne une ligne de commande spécifique basée sur son identifiant unique
 */
const getLigneCommandeById = async (req, res) => {
  try {
    // Recherche de la ligne de commande par son ID depuis les paramètres de la route
    const ligneCommande = await LigneCommande.findById(req.params.id);

    // Vérification de l'existence de la ligne de commande
    if (!ligneCommande) {
      return res.status(404).json({ message: "ligneCommande n'existe pas" });
    }

    // Retour de la ligne de commande trouvée
    return res.status(200).json(ligneCommande);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Erreur serveur", error: error });
  }
};

/**
 * Mettre à jour une ligne de commande existante
 * Modifie les données d'une ligne de commande après validation
 */
const updateLigneCommande = async (req, res) => {
  try {
    // Extraction des nouvelles données depuis le corps de la requête
    const { body } = req;

    // Validation de la présence des données à modifier
    if (!body) {
      return res
        .status(400)
        .json({ message: "Pas de données dans la requête" });
    }

    // Validation des nouvelles données avec le schéma Joi
    const { error } = ligneCommandeValidation(body).ligneCommandeUpdate;
    if (error) {
      return res.status(401).json(error.details[0].message);
    }

    // Mise à jour de la ligne de commande avec les nouvelles données
    const updatedLigneCommande = await LigneCommande.findByIdAndUpdate(
      req.params.id, // ID de la ligne à modifier
      body, // Nouvelles données
      { new: true } // Retourne le document modifié
    );

    // Vérification que la ligne de commande existe
    if (!updatedLigneCommande) {
      return res.status(404).json({ message: "ligneCommande n'existe pas" });
    }

    // Retour de la ligne de commande mise à jour
    return res.status(200).json(updatedLigneCommande);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Erreur serveur", error: error });
  }
};

/**
 * Supprimer une ligne de commande
 * Supprime définitivement une ligne de commande de la base de données
 */
const deleteLigneCommande = async (req, res) => {
  try {
    // Suppression de la ligne de commande par son ID
    const ligneCommande = await LigneCommande.findByIdAndDelete(req.params.id);

    // Vérification que la ligne de commande existait
    if (!ligneCommande) {
      return res.status(404).json({ message: "ligneCommande n'existe pas" });
    }

    // Confirmation de la suppression réussie
    return res.status(200).json({ message: "ligneCommande a été supprimé" });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Erreur serveur", error: error });
  }
};

export {
  createLigneCommande,
  getAllLigneCommandes,
  getLigneCommandeById,
  updateLigneCommande,
  deleteLigneCommande,
};
