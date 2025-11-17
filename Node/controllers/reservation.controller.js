import Reservation from "../models/reservation.model.js";
import reservationValidation from "../validations/reservation.validation.js";
import Model_porsche from "../models/model_porsche.model.js";
import User from "../models/user.model.js";
import {
  sendSuccess,
  sendError,
  sendNotFound,
  sendValidationError,
} from "../utils/responses.js";

// Créer une réservation d'une voiture d'occasion
const createReservation = async (req, res) => {
  try {
    const { body } = req;
    if (!body) {
      return sendValidationError(res, "Pas de données dans la requête");
    }
    // L'utilisateur ne peut créer que SES propres réservations (authentification requise)
    if (!req.user) {
      return sendError(res, "Authentification requise", 401);
    }
    // Valider AVANT d'ajouter le user depuis le token pour éviter l'usurpation d'identité
    const { error } = reservationValidation(body).reservationCreate;
    if (error) {
      return sendValidationError(res, error.details[0].message);
    }
    // Forcer l'ID utilisateur depuis le token APRÈS validation (empêcher usurpation)
    body.user = req.user.id;
    // Vérifier que la date n'est pas dans le passé
    const dateReservation = new Date(body.date_reservation);
    const today = new Date();
    // Réinitialiser l'heure pour comparer uniquement les dates
    today.setHours(0, 0, 0, 0);
    // Comparer les dates
    if (dateReservation < today) {
      return sendValidationError(
        res,
        "La date de réservation ne peut pas être dans le passé"
      );
    }
    if (body.user) {
      const userExists = await User.findById(body.user);
      if (!userExists) {
        return sendNotFound(res, "Utilisateur introuvable");
      }
    }
    // Vérifier que le model_porsche existe et est d'occasion avant de créer la réservation
    if (body.model_porsche) {
      const modelExists = await Model_porsche.findById(
        body.model_porsche
      ).populate("voiture", "type_voiture nom_model");

      if (!modelExists) {
        return sendNotFound(res, "Voiture introuvable");
      }

      // Seules les voitures d'occasion (type_voiture = false) sont réservables
      if (modelExists.voiture.type_voiture !== false) {
        return sendValidationError(
          res,
          "Seules les voitures d'occasion peuvent être réservées. Les voitures neuves doivent être achetées via une commande."
        );
      }
    }
    // Vérifier qu'il n'y a pas déjà une réservation active pour cette date et cette voiture
    if (body.model_porsche && body.date_reservation) {
      const existingReservation = await Reservation.findOne({
        model_porsche: body.model_porsche,
        date_reservation: body.date_reservation,
        status: true,
      });
      if (existingReservation) {
        return res.status(409).json({
          message: "Cette voiture est déjà réservée pour cette date",
        });
      }
    }
    const reservation = new Reservation(body);
    // Enregistrer la réservation dans la base de données
    const newReservation = await reservation.save();
    // Récupérer les informations complètes de la réservation créée avec les détails utilisateur et voiture
    const infoReservation = await Reservation.findById(newReservation._id)
      .populate("user", "nom prenom email telephone")
      .populate({
        path: "model_porsche",
        populate: {
          path: "voiture",
          select: "nom_model type_voiture description",
        },
      });
    return sendSuccess(
      res,
      infoReservation,
      "Réservation créée avec succès",
      201
    );
  } catch (error) {
    return sendError(res, "Erreur serveur", 500, error);
  }
};
// Récupérer toutes les réservations avec les détails utilisateur et voiture
const getAllReservations = async (req, res) => {
  try {
    const reservations = await Reservation.find()
      .populate("user", "nom prenom email telephone")
      .populate({
        path: "model_porsche",
        populate: {
          path: "voiture",
          select: "nom_model type_voiture description",
        },
      })
      .sort({ date_reservation: -1 });

    return sendSuccess(res, reservations);
  } catch (error) {
    return sendError(res, "Erreur serveur", 500, error);
  }
};
// Récupérer une réservation par ID avec les détails utilisateur et voiture
const getReservationById = async (req, res) => {
  try {
    const reservation = await Reservation.findById(req.params.id)
      .populate("user", "nom prenom email telephone")
      .populate({
        path: "model_porsche",
        populate: {
          path: "voiture",
          select: "nom_model type_voiture description",
        },
      });

    if (!reservation) {
      return sendNotFound(res, "Réservation introuvable");
    }

    return sendSuccess(res, reservation);
  } catch (error) {
    return sendError(res, "Erreur serveur", 500, error);
  }
};
// Mettre à jour une réservation existante
const updateReservation = async (req, res) => {
  try {
    const { body } = req;
    if (!body) {
      return sendValidationError(res, "Pas de données dans la requête");
    }
    const { error } = reservationValidation(body).reservationUpdate;
    if (error) {
      return sendValidationError(res, error.details[0].message);
    }

    // Vérifier que la nouvelle date n'est pas dans le passé
    if (body.date_reservation) {
      const dateReservation = new Date(body.date_reservation);
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      if (dateReservation < today) {
        return sendValidationError(
          res,
          "La date de réservation ne peut pas être dans le passé"
        );
      }
    }

    // Vérifier les conflits de réservation avec d'autres réservations existantes
    if (body.model_porsche && body.date_reservation) {
      const existingReservation = await Reservation.findOne({
        _id: { $ne: req.params.id },
        model_porsche: body.model_porsche,
        date_reservation: body.date_reservation,
        status: true,
      });
      if (existingReservation) {
        return res.status(409).json({
          message: "Cette voiture est déjà réservée pour cette date",
        });
      }
    }
    // Vérifier que la réservation existe avant de la mettre à jour
    const reservation = await Reservation.findById(req.params.id);
    if (!reservation) {
      return sendNotFound(res, "Réservation introuvable");
    }
    // Vérifier les permissions : propriétaire ou admin
    if (reservation.user.toString() !== req.user.id && !req.user.isAdmin) {
      return res.status(403).json({
        message: "Accès refusé: cette réservation ne vous appartient pas",
      });
    }
    // Mettre à jour la réservation dans la base de données
    const updatedReservation = await Reservation.findByIdAndUpdate(
      req.params.id,
      body,
      { new: true }
    )
      .populate("user", "nom prenom email telephone")
      .populate({
        path: "model_porsche",
        populate: {
          path: "voiture",
          select: "nom_model type_voiture description",
        },
      });
    return sendSuccess(res, updatedReservation, "Réservation mise à jour");
  } catch (error) {
    return sendError(res, "Erreur serveur", 500, error);
  }
};
// Supprimer une réservation par ID
const deleteReservation = async (req, res) => {
  try {
    const reservation = await Reservation.findByIdAndDelete(req.params.id);
    if (!reservation) {
      return sendNotFound(res, "Réservation introuvable");
    }
    return sendSuccess(res, null, "Réservation supprimée avec succès");
  } catch (error) {
    return sendError(res, "Erreur serveur", 500, error);
  }
};
// Récupérer toutes les réservations d'un utilisateur spécifique
const getReservationsByUser = async (req, res) => {
  try {
    const { userId } = req.params;
    const userExists = await User.findById(userId);
    if (!userExists) {
      return sendNotFound(res, "Utilisateur introuvable");
    }
    // Récupérer les réservations avec les détails de la voiture
    const reservations = await Reservation.find({ user: userId })
      .populate({
        path: "model_porsche",
        populate: {
          path: "voiture",
          select: "nom_model type_voiture description",
        },
      })
      .sort({ date_reservation: -1 });
    return sendSuccess(res, reservations);
  } catch (error) {
    return sendError(res, "Erreur serveur", 500, error);
  }
};
// Récupérer toutes les réservations pour une voiture spécifique
const getReservationsByVoiture = async (req, res) => {
  try {
    const { voitureId } = req.params;
    const modelExists = await Model_porsche.findById(voitureId);
    if (!modelExists) {
      return sendNotFound(res, "Voiture introuvable");
    }
    // Récupérer les réservations avec les détails de l'utilisateur
    const reservations = await Reservation.find({ model_porsche: voitureId })
      .populate("user", "nom prenom email telephone")
      .sort({ date_reservation: -1 });

    return sendSuccess(res, reservations);
  } catch (error) {
    return sendError(res, "Erreur serveur", 500, error);
  }
};
// Vérifier la disponibilité d'une voiture pour une date donnée
const checkReservations = async (req, res) => {
  try {
    const { voitureId } = req.params;
    const { date } = req.query;
    // Valider les paramètres requête
    if (!date) {
      return sendValidationError(
        res,
        "La date est requise (format: YYYY-MM-DD)"
      );
    }
    const modelExists = await Model_porsche.findById(voitureId);
    if (!modelExists) {
      return sendNotFound(res, "Voiture introuvable");
    }
    // Vérifier s'il existe une réservation active pour cette voiture à la date donnée
    const existReservation = await Reservation.findOne({
      model_porsche: voitureId,
      date_reservation: new Date(date),
      status: true,
    });
    // Disponible si aucune réservation existante trouvée
    const isAvailable = !existReservation;
    return sendSuccess(res, {
      voiture: voitureId,
      date: date,
      available: isAvailable,
      message: isAvailable
        ? "Voiture disponible pour cette date"
        : "Voiture déjà réservée pour cette date",
    });
  } catch (error) {
    return sendError(res, "Erreur serveur", 500, error);
  }
};

export {
  createReservation,
  getAllReservations,
  getReservationById,
  updateReservation,
  deleteReservation,
  getReservationsByUser,
  getReservationsByVoiture,
  checkReservations,
};
