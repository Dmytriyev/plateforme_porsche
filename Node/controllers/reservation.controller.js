import Reservation from "../models/reservation.model.js";
import reservationValidation from "../validations/reservation.validation.js";
import Voiture from "../models/voiture.model.js";
import User from "../models/user.model.js";

const createReservation = async (req, res) => {
  try {
    const { body } = req;
    if (!body) {
      return res
        .status(400)
        .json({ message: "Pas de données dans la requête" });
    }

    // Validation des données
    const { error } = reservationValidation(body).reservationCreate;
    if (error) {
      return res.status(401).json(error.details[0].message);
    }

    // Vérifier que la date de réservation n'est pas dans le passé
    const dateReservation = new Date(body.date_reservation);
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Mettre à zéro les heures pour ne comparer que les dates

    if (dateReservation < today) {
      return res.status(400).json({
        message: "La date de réservation ne peut pas être dans le passé",
      });
    }

    // Vérifier que l'utilisateur existe
    if (body.user) {
      const userExists = await User.findById(body.user);
      if (!userExists) {
        return res.status(404).json({ message: "Utilisateur introuvable" });
      }
    }

    // Vérifier que la voiture existe
    if (body.voiture) {
      const voitureExists = await Voiture.findById(body.voiture);
      if (!voitureExists) {
        return res.status(404).json({ message: "Voiture introuvable" });
      }
    }

    // Vérifier qu'il n'y a pas déjà une réservation active pour cette voiture à cette date
    if (body.voiture && body.date_reservation) {
      const existingReservation = await Reservation.findOne({
        voiture: body.voiture,
        date_reservation: body.date_reservation,
        status: true, // Réservation active
      });

      if (existingReservation) {
        return res.status(409).json({
          message: "Cette voiture est déjà réservée pour cette date",
        });
      }
    }

    const reservation = new Reservation(body);
    const newReservation = await reservation.save();

    // Populate pour retourner les détails complets
    const infoReservation = await Reservation.findById(newReservation._id)
      .populate("user", "nom prenom email telephone")
      .populate("voiture", "nom_model concessionnaire prix");

    return res.status(201).json(infoReservation);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Erreur serveur", error: error });
  }
};

const getAllReservations = async (req, res) => {
  try {
    const reservations = await Reservation.find()
      .populate("user", "nom prenom email telephone")
      .populate("voiture", "nom_model concessionnaire prix ")
      .sort({ date_reservation: -1 }); // Trier par date décroissante
    return res.status(200).json(reservations);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Erreur serveur", error: error });
  }
};

const getReservationById = async (req, res) => {
  try {
    const reservation = await Reservation.findById(req.params.id)
      .populate("user", "nom prenom email telephone")
      .populate("voiture", "nom_model concessionnaire prix");
    if (!reservation) {
      return res.status(404).json({ message: "réservation n'existe pas" });
    }
    return res.status(200).json(reservation);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Erreur serveur", error: error });
  }
};

const updateReservation = async (req, res) => {
  try {
    const { body } = req;
    if (!body) {
      return res
        .status(400)
        .json({ message: "Pas de données dans la requête" });
    }

    // Validation des données
    const { error } = reservationValidation(body).reservationUpdate;
    if (error) {
      return res.status(401).json(error.details[0].message);
    }

    // Si on modifie la date, vérifier qu'elle n'est pas dans le passé
    if (body.date_reservation) {
      const dateReservation = new Date(body.date_reservation);
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      if (dateReservation < today) {
        return res.status(400).json({
          message: "La date de réservation ne peut pas être dans le passé",
        });
      }
    }

    // Si on modifie la voiture et la date, vérifier les conflits
    if (body.voiture && body.date_reservation) {
      const existingReservation = await Reservation.findOne({
        _id: { $ne: req.params.id }, // Exclure la réservation actuelle
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

    const updatedReservation = await Reservation.findByIdAndUpdate(
      req.params.id,
      body,
      { new: true }
    )
      .populate("user", "nom prenom email telephone")
      .populate("voiture", "nom_model concessionnaire prix");

    if (!updatedReservation) {
      return res.status(404).json({ message: "réservation n'existe pas" });
    }
    return res.status(200).json(updatedReservation);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Erreur serveur", error: error });
  }
};

const deleteReservation = async (req, res) => {
  try {
    const reservation = await Reservation.findByIdAndDelete(req.params.id);
    if (!reservation) {
      return res.status(404).json({ message: "réservation n'existe pas" });
    }
    return res.status(200).json({ message: "réservation a été supprimée" });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Erreur serveur", error: error });
  }
};

// Obtenir les réservations d'un utilisateur spécifique
const getReservationsByUser = async (req, res) => {
  try {
    const { userId } = req.params;

    // Vérifier que l'utilisateur existe
    const userExists = await User.findById(userId);
    if (!userExists) {
      return res.status(404).json({ message: "Utilisateur introuvable" });
    }

    const reservations = await Reservation.find({ user: userId })
      .populate("voiture", "nom_model concessionnaire prix")
      .sort({ date_reservation: -1 });

    return res.status(200).json(reservations);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Erreur serveur", error: error });
  }
};

// Obtenir les réservations pour une voiture spécifique
const getReservationsByVoiture = async (req, res) => {
  try {
    const { voitureId } = req.params;

    // Vérifier que la voiture existe
    const voitureExists = await Voiture.findById(voitureId);
    if (!voitureExists) {
      return res.status(404).json({ message: "Voiture introuvable" });
    }

    const reservations = await Reservation.find({ voiture: voitureId })
      .populate("user", "nom prenom email telephone")
      .sort({ date_reservation: -1 });

    return res.status(200).json(reservations);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Erreur serveur", error: error });
  }
};

// Vérifier la disponibilité d'une voiture pour une date
const checkReservations = async (req, res) => {
  try {
    const { voitureId } = req.params;
    const { date } = req.query;

    if (!date) {
      return res.status(400).json({
        message: "La date est requise (format: YYYY-MM-DD)",
      });
    }

    // Vérifier que la voiture existe
    const voitureExists = await Voiture.findById(voitureId);
    if (!voitureExists) {
      return res.status(404).json({ message: "Voiture introuvable" });
    }

    const existReservation = await Reservation.findOne({
      voiture: voitureId,
      date_reservation: new Date(date),
      status: true,
    });

    const isAvailable = !existReservation;

    return res.status(200).json({
      voiture: voitureId,
      date: date,
      available: isAvailable,
      message: isAvailable
        ? "Voiture disponible pour cette date"
        : "Voiture déjà réservée pour cette date",
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Erreur serveur", error: error });
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
