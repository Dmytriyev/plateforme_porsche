import Demande_contact from "../models/demande_contact.model.js";
import demandeContactValidation from "../validations/demande_contact.validation.js";
import { sendSuccess, sendError, sendValidationError } from "../utils/responses.js";

// Créer une nouvelle demande de contact
const createDemandeContact = async (req, res) => {
  try {
    const { body } = req;

    if (!body || Object.keys(body).length === 0) {
      return sendError(res, "Pas de données dans la requête", 400);
    }

    // Validation des données
    const { error } = demandeContactValidation(body).demandeContactCreate;
    if (error) {
      return sendValidationError(res, error);
    }

    // Déterminer le type de modèle pour la référence
    if (body.vehicule_id && body.type_vehicule) {
      if (body.type_vehicule === 'occasion' || body.type_vehicule === 'neuf') {
        body.type_vehicule_model = 'Model_porsche';
      } else {
        body.type_vehicule_model = 'Voiture';
      }
    }

    // Si l'utilisateur est connecté, utiliser son ID
    if (req.user && !body.user_id) {
      body.user_id = req.user.id;
    }

    // Créer la demande de contact
    const demandeContact = new Demande_contact(body);
    const newDemandeContact = await demandeContact.save();

    return sendSuccess(
      res,
      newDemandeContact,
      "Demande de contact créée avec succès",
      201
    );
  } catch (error) {
    return sendError(res, "Erreur serveur", 500, error);
  }
};

// Récupérer toutes les demandes de contact (admin/staff uniquement)
const getAllDemandesContact = async (req, res) => {
  try {
    if (!req.user || (!req.user.isAdmin && req.user.role !== 'staff' && req.user.role !== 'conseillere')) {
      return sendError(res, "Accès non autorisé", 403);
    }

    const demandes = await Demande_contact.find()
      .populate('user_id', 'nom prenom email')
      .sort({ createdAt: -1 })
      .lean();

    return sendSuccess(res, demandes, "Demandes de contact récupérées avec succès");
  } catch (error) {
    return sendError(res, "Erreur serveur", 500, error);
  }
};

// Récupérer une demande de contact par ID
const getDemandeContactById = async (req, res) => {
  try {
    const demande = await Demande_contact.findById(req.params.id)
      .populate('user_id', 'nom prenom email')
      .lean();

    if (!demande) {
      return sendError(res, "Demande de contact introuvable", 404);
    }

    // Vérifier que l'utilisateur peut accéder à cette demande
    if (!req.user || (!req.user.isAdmin && req.user.role !== 'staff' && req.user.role !== 'conseillere' && demande.user_id?.toString() !== req.user.id.toString())) {
      return sendError(res, "Accès non autorisé", 403);
    }

    return sendSuccess(res, demande, "Demande de contact récupérée avec succès");
  } catch (error) {
    return sendError(res, "Erreur serveur", 500, error);
  }
};

// Mettre à jour le statut d'une demande de contact (admin/staff uniquement)
const updateDemandeContact = async (req, res) => {
  try {
    if (!req.user || (!req.user.isAdmin && req.user.role !== 'staff' && req.user.role !== 'conseillere')) {
      return sendError(res, "Accès non autorisé", 403);
    }

    const { statut } = req.body;

    if (!statut || !['nouvelle', 'en_cours', 'traitee', 'fermee'].includes(statut)) {
      return sendError(res, "Statut invalide", 400);
    }

    const demande = await Demande_contact.findByIdAndUpdate(
      req.params.id,
      { statut },
      { new: true }
    ).lean();

    if (!demande) {
      return sendError(res, "Demande de contact introuvable", 404);
    }

    return sendSuccess(res, demande, "Statut de la demande mis à jour avec succès");
  } catch (error) {
    return sendError(res, "Erreur serveur", 500, error);
  }
};

export {
  createDemandeContact,
  getAllDemandesContact,
  getDemandeContactById,
  updateDemandeContact,
};

