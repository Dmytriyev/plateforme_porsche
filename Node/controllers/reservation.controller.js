import Reservation from "../models/reservation.model.js";
import reservationValidation from "../validations/reservation.validation.js";
import Voiture from "../models/voiture.model.js";
import User from "../models/user.model.js";
import {
  sendSuccess,
  sendError,
  sendNotFound,
  sendValidationError,
} from "../utils/responses.js";

/**
 * Créer une réservation
 * Règle : Seules les voitures d'occasion peuvent être réservées
 */
const createReservation = async (req, res) => {
  try {
    const { body } = req;
    if (!body) {
      return sendValidationError(res, "Pas de données dans la requête");
    }

    const { error } = reservationValidation(body).reservationCreate;
    if (error) {
      return sendValidationError(res, error.details[0].message);
    }

    // Vérifier que la date n'est pas dans le passé
    const dateReservation = new Date(body.date_reservation);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (dateReservation < today) {
      return sendValidationError(
        res,
        "La date de réservation ne peut pas être dans le passé"
      );
    }

    // Vérifier que l'utilisateur existe
    if (body.user) {
      const userExists = await User.findById(body.user);
      if (!userExists) {
        return sendNotFound(res, "Utilisateur introuvable");
      }
    }

    // Vérifier que la voiture existe et est d'occasion
    if (body.voiture) {
      const voitureExists = await Voiture.findById(body.voiture);
      if (!voitureExists) {
        return sendNotFound(res, "Voiture introuvable");
      }

      // Règle : Seules les voitures d'occasion (type_voiture = false) sont réservables
      if (voitureExists.type_voiture !== false) {
        return sendValidationError(
          res,
          "Seules les voitures d'occasion peuvent être réservées. Les voitures neuves doivent être achetées via une commande."
        );
      }
    }

    // Vérifier qu'il n'y a pas déjà une réservation active pour cette date
    if (body.voiture && body.date_reservation) {
      const existingReservation = await Reservation.findOne({
        voiture: body.voiture,
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
    const newReservation = await reservation.save();

    const infoReservation = await Reservation.findById(newReservation._id)
      .populate("user", "nom prenom email telephone")
      .populate("voiture", "nom_model type_voiture description prix");

    return sendSuccess(
      res,
      infoReservation,
      "Réservation créée avec succès",
      201
    );
  } catch (error) {
    return sendError(res, "Erreur serveur", error);
  }
};

/**
 * Récupérer toutes les réservations
 */
const getAllReservations = async (req, res) => {
  try {
    const reservations = await Reservation.find()
      .populate("user", "nom prenom email telephone")
      .populate("voiture", "nom_model type_voiture description prix")
      .sort({ date_reservation: -1 });

    return sendSuccess(res, reservations);
  } catch (error) {
    return sendError(res, "Erreur serveur", error);
  }
};

/**
 * Récupérer une réservation par ID
 */
const getReservationById = async (req, res) => {
  try {
    const reservation = await Reservation.findById(req.params.id)
      .populate("user", "nom prenom email telephone")
      .populate("voiture", "nom_model type_voiture description prix");

    if (!reservation) {
      return sendNotFound(res, "Réservation introuvable");
    }

    return sendSuccess(res, reservation);
  } catch (error) {
    return sendError(res, "Erreur serveur", error);
  }
};

/**
 * Mettre à jour une réservation (utilisateur propriétaire ou admin)
 */
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

    // Vérifier les conflits de réservation
    if (body.voiture && body.date_reservation) {
      const existingReservation = await Reservation.findOne({
        _id: { $ne: req.params.id },
        voiture: body.voiture,
        date_reservation: body.date_reservation,
        status: true,
      });

      if (existingReservation) {
        return res.status(409).json({
          message: "Cette voiture est déjà réservée pour cette date",
        });
      }
    }

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

    const updatedReservation = await Reservation.findByIdAndUpdate(
      req.params.id,
      body,
      { new: true }
    )
      .populate("user", "nom prenom email telephone")
      .populate("voiture", "nom_model type_voiture description prix");

    return sendSuccess(res, updatedReservation, "Réservation mise à jour");
  } catch (error) {
    return sendError(res, "Erreur serveur", error);
  }
};

/**
 * Supprimer une réservation
 */
const deleteReservation = async (req, res) => {
  try {
    const reservation = await Reservation.findByIdAndDelete(req.params.id);
    if (!reservation) {
      return sendNotFound(res, "Réservation introuvable");
    }

    return sendSuccess(res, null, "Réservation supprimée avec succès");
  } catch (error) {
    return sendError(res, "Erreur serveur", error);
  }
};

/**
 * Récupérer les réservations d'un utilisateur
 */
const getReservationsByUser = async (req, res) => {
  try {
    const { userId } = req.params;

    const userExists = await User.findById(userId);
    if (!userExists) {
      return sendNotFound(res, "Utilisateur introuvable");
    }

    const reservations = await Reservation.find({ user: userId })
      .populate("voiture", "nom_model type_voiture description prix")
      .sort({ date_reservation: -1 });

    return sendSuccess(res, reservations);
  } catch (error) {
    return sendError(res, "Erreur serveur", error);
  }
};

/**
 * Récupérer les réservations pour une voiture
 */
const getReservationsByVoiture = async (req, res) => {
  try {
    const { voitureId } = req.params;

    const voitureExists = await Voiture.findById(voitureId);
    if (!voitureExists) {
      return sendNotFound(res, "Voiture introuvable");
    }

    const reservations = await Reservation.find({ voiture: voitureId })
      .populate("user", "nom prenom email telephone")
      .sort({ date_reservation: -1 });

    return sendSuccess(res, reservations);
  } catch (error) {
    return sendError(res, "Erreur serveur", error);
  }
};

/**
 * Vérifier la disponibilité d'une voiture pour une date donnée
 */
const checkReservations = async (req, res) => {
  try {
    const { voitureId } = req.params;
    const { date } = req.query;

    if (!date) {
      return sendValidationError(
        res,
        "La date est requise (format: YYYY-MM-DD)"
      );
    }

    const voitureExists = await Voiture.findById(voitureId);
    if (!voitureExists) {
      return sendNotFound(res, "Voiture introuvable");
    }

    const existReservation = await Reservation.findOne({
      voiture: voitureId,
      date_reservation: new Date(date),
      status: true,
    });

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
    return sendError(res, "Erreur serveur", error);
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
