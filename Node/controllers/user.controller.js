import User from "../models/user.model.js";
import userValidation from "../validations/user.validation.js";
import model_porsche_actuelValidation from "../validations/model_porsche_actuel.validation.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import Commande from "../models/Commande.model.js";
import Reservation from "../models/reservation.model.js";
import Voiture from "../models/voiture.model.js";
import Model_porsche_actuel from "../models/model_porsche_actuel.model.js";
import LigneCommande from "../models/ligneCommande.model.js";
import { getAvailableRoles } from "../utils/roles.constants.js";
import logger from "../utils/logger.js";
// Enregistrer un nouvel utilisateur
const register = async (req, res) => {
  try {
    const { body } = req;
    if (!body || Object.keys(body).length === 0) {
      return res
        .status(400)
        .json({ message: "Pas de données dans la requête" });
    }

    // Normaliser l'email tôt pour éviter les doublons liés à la casse
    if (body.email) {
      body.email = body.email.toLowerCase();
    }

    // Vérifier que le mot de passe est fourni
    if (!body.password) {
      return res.status(400).json({ message: "Mot de passe requis" });
    }

    const { error } = userValidation(body).userCreate;
    if (error) {
      return res.status(400).json({ message: error.details[0].message });
    }
    // Vérifier si l'email existe déjà
    const searchUser = await User.findOne({ email: body.email });
    if (searchUser) {
      return res
        .status(409)
        .json({ message: "Utilisateur existe déjà avec cet email" });
    }
    // Créer l'utilisateur et le panier dans une transaction MongoDB
    let newUser = null;
    const session = await User.startSession();
    try {
      try {
        // Utiliser une transaction MongoDB
        await session.withTransaction(async () => {
          const user = new User(body);
          await user.save({ session });
          // Créer un panier
          const commande = new Commande({
            user: user._id,
            date_commande: new Date(),
            prix: 0,
            acompte: 0,
            status: false, // false = panier actif/non validé
          });

          await commande.save({ session });
          user.panier = commande._id;
          await user.save({ session });
          newUser = user;
        });
      } catch (txError) {
        // Transactions non supportées (pas de replica set).
        logger.warn(
          "Transaction non supportée ou a échoué, fallback sans transaction",
          { error: txError && (txError.message || txError) }
        );
        // Tentative sans transaction
        const user = new User(body);
        await user.save();
        // Créer un panier pour l'utilisateur créé
        const commande = new Commande({
          user: user._id,
          date_commande: new Date(),
          prix: 0,
          acompte: 0,
          status: false,
        });
        await commande.save();
        user.panier = commande._id;
        await user.save();
        newUser = user;
      }
    } finally {
      session.endSession();
    }
    // Retourner l'utilisateur sans le mot de passe dans la réponse
    const userResponse = newUser.toObject();
    delete userResponse.password;

    return res.status(201).json(userResponse);
  } catch (error) {
    logger.error("Erreur lors de l'inscription de l'utilisateur", {
      error: error.message,
      email: req.body?.email,
    });
    res.status(500).json({ message: "Erreur serveur" });
  }
};
// Connexion d'un utilisateur existant
const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    // Vérifier que des données sont fournies
    if (!req.body || Object.keys(req.body).length === 0) {
      return res
        .status(400)
        .json({ message: "Pas de données dans la requête" });
    }
    // Validation des données de connexion
    const { error } = userValidation(req.body).userLogin;
    if (error) {
      return res.status(400).json({ message: error.details[0].message });
    }
    // Normaliser l'email pour la recherche d'utilisateur
    const emailToFind = email ? email.toLowerCase() : email;
    // Rechercher l'utilisateur par email avec le mot de passe
    const user = await User.findOne({ email: emailToFind }).select("+password");
    if (!user) {
      return res.status(400).json({ message: "Identifiants invalides" });
    }
    // Vérifier le mot de passe
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Identifiants invalides" });
    }
    // Préparer les données utilisateur pour le token et la réponse
    const userForToken = {
      id: user._id,
      email: user.email,
      nom: user.nom,
      prenom: user.prenom,
      role: user.role,
      isAdmin: user.isAdmin,
    };
    // Retourner le token JWT et les informations utilisateur
    res.status(200).json({
      message: user.email + " est connecté",
      user: userForToken,
      token: jwt.sign(
        {
          id: user._id,
          email: user.email,
          isAdmin: user.isAdmin,
          role: user.role,
        },
        process.env.SECRET_KEY,
        { expiresIn: "24h" }
      ),
    });
  } catch (error) {
    logger.error("Erreur lors de la connexion", {
      error: error.message,
      email: req.body?.email,
    });
    res.status(500).json({ message: "Erreur serveur" });
  }
};
// Obtenir tous les utilisateurs
const getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select("-password");
    return res.status(200).json(users);
  } catch (error) {
    logger.error("Erreur lors de la récupération des utilisateurs", {
      error: error.message,
    });
    res.status(500).json({ message: "Erreur serveur" });
  }
};
// Obtenir un utilisateur par ID
const getUserById = async (req, res) => {
  try {
    // Vérifier l'autorisation d'accès
    if (req.user.id !== req.params.id && !req.user.isAdmin) {
      return res.status(403).json({ message: "Accès non autorisé" });
    }
    // Récupérer l'utilisateur sans le mot de passe dans la réponse
    const user = await User.findById(req.params.id).select("-password");
    if (!user) {
      return res.status(404).json({ message: "Utilisateur n'existe pas" });
    }
    return res.status(200).json(user);
  } catch (error) {
    logger.error("Erreur lors de la récupération de l'utilisateur", {
      error: error.message,
      userId: req.params.id,
    });
    res.status(500).json({ message: "Erreur serveur" });
  }
};
// Mettre à jour un utilisateur existant
const updateUser = async (req, res) => {
  try {
    if (req.user.id !== req.params.id && !req.user.isAdmin) {
      return res.status(403).json({ message: "Accès non autorisé" });
    }
    // Vérifier que des données sont fournies
    const { body } = req;
    if (!body || Object.keys(body).length === 0) {
      return res
        .status(400)
        .json({ message: "Pas de données dans la requête" });
    }
    // Empêcher la modification des champs sensibles par un utilisateur non admin
    if (!req.user.isAdmin) {
      delete body.isAdmin;
      delete body.role;
      delete body.panier;
    } else {
      // Pour les admins, empêcher la modification du rôle ici
      if (body.role !== undefined || body.isAdmin !== undefined) {
        return res.status(400).json({
          message:
            "Pour modifier le rôle, utilisez la route dédiée PUT /api/users/:id/role",
        });
      }
    }
    const { error } = userValidation(body).userUpdate;
    if (error) {
      return res.status(400).json({ message: error.details[0].message });
    }
    // Normaliser l'email si présent.
    if (body.email) {
      body.email = body.email.toLowerCase();
    }
    // Mettre à jour l'utilisateur dans la base de données, sans mot de passe dans la réponse.
    const updatedUser = await User.findByIdAndUpdate(req.params.id, body, {
      new: true,
    }).select("-password");
    if (!updatedUser) {
      return res.status(404).json({ message: "Utilisateur n'existe pas" });
    }
    return res.status(200).json(updatedUser);
  } catch (error) {
    logger.error("Erreur lors de la mise à jour de l'utilisateur", {
      error: error.message,
      userId: req.params.id,
    });
    res.status(500).json({ message: "Erreur serveur" });
  }
};
// Supprimer un utilisateur et toutes ses données associées
const deleteUser = async (req, res) => {
  try {
    if (req.user.id !== req.params.id && !req.user.isAdmin) {
      return res.status(403).json({ message: "Accès non autorisé" });
    }

    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: "Utilisateur n'existe pas" });
    }

    // Supprimer toutes les données associées à l'utilisateur
    await Reservation.deleteMany({ user: req.params.id });
    await Model_porsche_actuel.deleteMany({ user: req.params.id });

    // Supprimer les lignes de commande liées aux commandes de l'utilisateur
    const commandes = await Commande.find({ user: req.params.id });
    // Récupérer les IDs des commandes pour supprimer les lignes associées
    const commandeIds = commandes.map((c) => c._id);
    if (commandeIds.length > 0) {
      // Supprimer les lignes de commande associées
      await LigneCommande.deleteMany({ commande: { $in: commandeIds } });
    }
    await Commande.deleteMany({ user: req.params.id });

    // Supprimer cet utilisateur
    await User.findByIdAndDelete(req.params.id);
    return res
      .status(200)
      .json({ message: "Utilisateur et toutes ses données ont été supprimés" });
  } catch (error) {
    logger.error("Erreur lors de la suppression de l'utilisateur", {
      error: error.message,
      userId: req.params.id,
    });
    res.status(500).json({ message: "Erreur serveur" });
  }
};

// Créer une réservation pour l'utilisateur
const createUserReservation = async (req, res) => {
  try {
    const { body } = req;
    const userId = req.params.id;
    // Vérifier l'autorisation d'accès
    if (req.user.id !== userId && !req.user.isAdmin) {
      return res.status(403).json({ message: "Accès non autorisé" });
    }

    if (!body || Object.keys(body).length === 0) {
      return res.status(400).json({
        message: "Données de réservation requises",
      });
    }

    const { error } = userValidation(body).userReservation;
    if (error) {
      return res.status(400).json({ message: error.details[0].message });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "Utilisateur n'existe pas" });
    }
    // Vérifier que la date de réservation n'est pas dans le passé
    const dateReservation = new Date(body.date_reservation);
    const today = new Date();
    // Mettre à zéro les heures pour la comparaison
    today.setHours(0, 0, 0, 0);
    // Comparer uniquement les dates sans l'heure
    if (dateReservation < today) {
      return res.status(400).json({
        message: "La date de réservation ne peut pas être dans le passé",
      });
    }

    // Vérifier que la voiture existe et qu'elle est bien d'occasion
    const voiture = await Voiture.findById(body.voiture);
    if (!voiture) {
      return res.status(404).json({ message: "Voiture introuvable" });
    }
    // Seules les voitures d'occasion peuvent être réservées
    if (voiture.type_voiture !== false) {
      return res.status(400).json({
        message:
          "Seules les voitures d'occasion peuvent être réservées. Les voitures neuves doivent être achetées via une commande.",
      });
    }
    // Vérifier les conflits de réservation pour la même voiture à la même date
    const existingReservation = await Reservation.findOne({
      voiture: body.voiture,
      date_reservation: dateReservation,
      status: true,
    });
    // Si une réservation existe déjà pour cette voiture à cette date
    if (existingReservation) {
      return res.status(409).json({
        message: "Cette voiture est déjà réservée pour cette date",
      });
    }
    // Créer la réservation
    const reservation = new Reservation({
      ...body,
      user: userId,
      status: true,
    });

    const newReservation = await reservation.save();
    // Récupérer les détails de la réservation avant de retourner
    const populatedReservation = await Reservation.findById(newReservation._id)
      .populate("user", "nom prenom email telephone")
      .populate("voiture", "nom_model type_voiture description prix");
    return res.status(201).json(populatedReservation);
  } catch (error) {
    logger.error("Erreur lors de la création de la réservation", {
      error: error.message,
      userId: req.params.id,
    });
    res.status(500).json({ message: "Erreur serveur" });
  }
};

// Obtenir les réservations de l'utilisateur
const getUserReservations = async (req, res) => {
  try {
    const userId = req.params.id;
    // Vérifier l'autorisation d'accès
    if (req.user.id !== userId && !req.user.isAdmin) {
      return res.status(403).json({ message: "Accès non autorisé" });
    }
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "Utilisateur n'existe pas" });
    }
    // Récupérer les réservations de l'utilisateur avec les détails de la voiture
    const reservations = await Reservation.find({ user: userId })
      .populate("voiture", "nom_model type_voiture description prix")
      .sort({ date_reservation: -1 });
    return res.status(200).json(reservations);
  } catch (error) {
    logger.error("Erreur lors de la récupération des réservations", {
      error: error.message,
      userId: req.params.id,
    });
    res.status(500).json({ message: "Erreur serveur" });
  }
};
// Ajouter une Porsche personnelle à l'utilisateur
const addUserPorsche = async (req, res) => {
  try {
    const { body } = req;
    const userId = req.params.id;
    // Vérifier l'autorisation d'accès
    if (req.user.id !== userId && !req.user.isAdmin) {
      return res.status(403).json({ message: "Accès non autorisé" });
    }
    // Vérifier que des données sont fournies
    if (!body || Object.keys(body).length === 0) {
      return res.status(400).json({
        message: "Données de la Porsche requises",
      });
    }
    // Validation des données de la Porsche
    const { error } =
      model_porsche_actuelValidation(body).model_porsche_actuelCreate;
    if (error) {
      return res.status(400).json({ message: error.details[0].message });
    }
    // Vérifier que l'utilisateur existe
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "Utilisateur n'existe pas" });
    }
    // Créer la Porsche personnelle pour l'utilisateur
    const porsche = new Model_porsche_actuel({
      ...body,
      user: userId,
    });
    const newPorsche = await porsche.save();
    return res.status(201).json(newPorsche);
  } catch (error) {
    logger.error("Erreur lors de l'ajout de la Porsche", {
      error: error.message,
      userId: req.params.id,
    });
    res.status(500).json({ message: "Erreur serveur" });
  }
};

// Obtenir les Porsches de l'utilisateur
const getUserPorsches = async (req, res) => {
  try {
    const userId = req.params.id;

    if (req.user.id !== userId && !req.user.isAdmin) {
      return res.status(403).json({ message: "Accès non autorisé" });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "Utilisateur n'existe pas" });
    }
    // Récupérer les Porsches personnelles de l'utilisateur avec les détails nécessaires
    const porsches = await Model_porsche_actuel.find({ user: userId })
      .populate("couleur_exterieur", "nom_couleur")
      .populate("couleur_interieur", "nom_couleur")
      .populate("photo_voiture_actuel", "name alt")
      .sort({
        createdAt: -1,
      });

    return res.status(200).json(porsches);
  } catch (error) {
    logger.error("Erreur lors de la récupération des Porsches", {
      error: error.message,
      userId: req.params.id,
    });
    res.status(500).json({ message: "Erreur serveur" });
  }
};

// Obtenir le profil complet de l'utilisateur
const getUserProfile = async (req, res) => {
  try {
    const userId = req.params.id;

    if (req.user.id !== userId && !req.user.isAdmin) {
      return res.status(403).json({ message: "Accès non autorisé" });
    }
    // Obtenir les informations de l'utilisateur
    const user = await User.findById(userId).select("-password");
    if (!user) {
      return res.status(404).json({ message: "Utilisateur n'existe pas" });
    }

    // Obtenir les réservations récentes de l'utilisateur
    const reservations = await Reservation.find({ user: userId })
      .populate("voiture", "nom_model type_voiture description prix")
      .sort({ date_reservation: -1 })
      .limit(5); // 5 dernières

    // Obtenir les Porsches personnelles de l'utilisateur
    const porsches = await Model_porsche_actuel.find({ user: userId })
      .populate("couleur_exterieur", "nom_couleur")
      .populate("couleur_interieur", "nom_couleur")
      .populate("photo_voiture_actuel", "name alt")
      .sort({
        createdAt: -1,
      });

    // Obtenir le panier actuel (status: false = panier actif)
    const panier = await Commande.findOne({ user: userId, status: false });
    let panierDetails = null;
    // Si un panier existe, obtenir ses lignes de commande et le total
    if (panier) {
      const ligneCommandes = await LigneCommande.find({ commande: panier._id })
        .populate("accesoire", "nom_accesoire prix")
        .populate("voiture", "nom_model type_voiture prix");

      const total = ligneCommandes.reduce((sum, line) => {
        // Si c'est une voiture, utiliser l'acompte, sinon le prix de l'accessoire
        const prix = line.type_produit
          ? line.acompte
          : line.accesoire
          ? line.accesoire.prix
          : 0;
        return sum + prix * line.quantite;
      }, 0);
      // Assembler les détails du panier
      panierDetails = {
        ...panier.toObject(),
        ligneCommandes,
        total,
      };
    }

    // Obtenir l'historique des commandes (status: true = commandes validées)
    const historique = await Commande.find({ user: userId, status: true })
      .sort({ date_commande: -1 })
      .limit(5);
    // Assembler le profil complet de l'utilisateur à retourner
    const profile = {
      user,
      reservations,
      porsches,
      panier: panierDetails,
      historique,
    };

    return res.status(200).json(profile);
  } catch (error) {
    logger.error("Erreur lors de la récupération du profil", {
      error: error.message,
      userId: req.params.id,
    });
    res.status(500).json({ message: "Erreur serveur" });
  }
};

// Supprimer une réservation de l'utilisateur
const deleteUserReservation = async (req, res) => {
  try {
    const userId = req.params.id;
    const reservationId = req.params.reservationId;

    if (req.user.id !== userId && !req.user.isAdmin) {
      return res.status(403).json({ message: "Accès non autorisé" });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "Utilisateur n'existe pas" });
    }
    // Vérifier que la réservation appartient à l'utilisateur
    const reservation = await Reservation.findOne({
      _id: reservationId,
      user: userId,
    });

    if (!reservation) {
      return res.status(404).json({
        message:
          "Réservation introuvable ou n'appartient pas à cet utilisateur",
      });
    }
    //  Supprimer la réservation
    await Reservation.findByIdAndDelete(reservationId);
    return res
      .status(200)
      .json({ message: "Réservation supprimée avec succès" });
  } catch (error) {
    logger.error("Erreur lors de la suppression de la réservation", {
      error: error.message,
      userId: req.params.id,
      reservationId: req.params.reservationId,
    });
    res.status(500).json({ message: "Erreur serveur" });
  }
};

// Supprimer une Porsche de l'utilisateur
const deleteUserPorsche = async (req, res) => {
  try {
    const userId = req.params.id;
    const porscheId = req.params.porscheId;

    if (req.user.id !== userId && !req.user.isAdmin) {
      return res.status(403).json({ message: "Accès non autorisé" });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "Utilisateur n'existe pas" });
    }
    // Vérifier que la Porsche appartient à l'utilisateur
    const porsche = await Model_porsche_actuel.findOne({
      _id: porscheId,
      user: userId,
    });
    if (!porsche) {
      return res.status(404).json({
        message: "Porsche introuvable ou n'appartient pas à cet utilisateur",
      });
    }
    await Model_porsche_actuel.findByIdAndDelete(porscheId);
    return res.status(200).json({ message: "Porsche supprimée avec succès" });
  } catch (error) {
    logger.error("Erreur lors de la suppression de la Porsche", {
      error: error.message,
      userId: req.params.id,
      porscheId: req.params.porscheId,
    });
    res.status(500).json({ message: "Erreur serveur" });
  }
};
// Annuler une réservation de l'utilisateur
const cancelUserReservation = async (req, res) => {
  try {
    const userId = req.params.id;
    const reservationId = req.params.reservationId;

    if (req.user.id !== userId && !req.user.isAdmin) {
      return res.status(403).json({ message: "Accès non autorisé" });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "Utilisateur n'existe pas" });
    }
    // Vérifier que la réservation appartient à l'utilisateur
    const reservation = await Reservation.findOne({
      _id: reservationId,
      user: userId,
    });

    if (!reservation) {
      return res.status(404).json({
        message:
          "Réservation introuvable ou n'appartient pas à cet utilisateur",
      });
    }
    // Vérifier si la réservation est déjà annulée
    if (reservation.status === false) {
      return res.status(400).json({
        message: "Cette réservation est déjà annulée",
      });
    }
    // Mettre à jour le status au lieu de supprimer
    reservation.status = false;
    await reservation.save();

    return res.status(200).json({
      message: "Réservation annulée avec succès",
      reservation,
    });
  } catch (error) {
    logger.error("Erreur lors de l'annulation de la réservation", {
      error: error.message,
      userId: req.params.id,
      reservationId: req.params.reservationId,
    });
    res.status(500).json({ message: "Erreur serveur" });
  }
};

// Mettre à jour une Porsche personnelle
const updateUserPorsche = async (req, res) => {
  try {
    const { body } = req;
    const userId = req.params.id;
    const porscheId = req.params.porscheId;

    if (req.user.id !== userId && !req.user.isAdmin) {
      return res.status(403).json({ message: "Accès non autorisé" });
    }
    if (!body || Object.keys(body).length === 0) {
      return res.status(400).json({
        message: "Données de mise à jour requises",
      });
    }
    // Validation des données de la Porsche à mettre à jour
    const { error } =
      model_porsche_actuelValidation(body).model_porsche_actuelUpdate;
    if (error) {
      return res.status(400).json({ message: error.details[0].message });
    }
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "Utilisateur n'existe pas" });
    }
    // Vérifier que la Porsche appartient à l'utilisateur
    const porsche = await Model_porsche_actuel.findOne({
      _id: porscheId,
      user: userId,
    });

    if (!porsche) {
      return res.status(404).json({
        message: "Porsche introuvable ou n'appartient pas à cet utilisateur",
      });
    }
    // Mettre à jour la Porsche personnelle de l'utilisateur dans la base de données
    const updatedPorsche = await Model_porsche_actuel.findByIdAndUpdate(
      porscheId,
      body,
      { new: true }
    )
      .populate("couleur_exterieur", "nom_couleur")
      .populate("couleur_interieur", "nom_couleur")
      .populate("photo_voiture_actuel", "name alt");

    return res.status(200).json({
      message: "Porsche mise à jour avec succès",
      porsche: updatedPorsche,
    });
  } catch (error) {
    logger.error("Erreur lors de la mise à jour de la Porsche", {
      error: error.message,
      userId: req.params.id,
      porscheId: req.params.porscheId,
    });
    res.status(500).json({ message: "Erreur serveur" });
  }
};
// Obtenir le tableau de bord complet de l'utilisateur
const getUserDashboard = async (req, res) => {
  try {
    const userId = req.params.id;

    if (req.user.id !== userId && !req.user.isAdmin) {
      return res.status(403).json({ message: "Accès non autorisé" });
    }

    const user = await User.findById(userId).select("-password");
    if (!user) {
      return res.status(404).json({ message: "Utilisateur n'existe pas" });
    }

    // Réservations à venir (status: true = réservations actives)
    const today = new Date();
    const reservationsAvenir = await Reservation.find({
      user: userId,
      status: true,
      date_reservation: { $gte: today },
    })
      .populate("voiture", "nom_model type_voiture description prix")
      .sort({ date_reservation: 1 })
      .limit(5);

    // Dernières commandes (status: true = commandes validées)
    const dernieresCommandes = await Commande.find({
      user: userId,
      status: true,
    })
      .sort({ date_commande: -1 })
      .limit(5);

    // Panier actuel (status: false = panier actif)
    const panier = await Commande.findOne({ user: userId, status: false });
    let panierDetails = null;
    if (panier) {
      const lignesCommande = await LigneCommande.find({ commande: panier._id })
        .populate("accesoire", "nom_accesoire prix")
        .populate("voiture", "nom_model type_voiture prix");

      const total = lignesCommande.reduce((sum, ligne) => {
        // Si c'est une voiture avec acompte, utiliser l'acompte, sinon le prix de l'accessoire ou le prix de la voiture
        const montant =
          ligne.type_produit && ligne.acompte > 0 ? ligne.acompte : ligne.prix;
        return sum + (montant * ligne.quantite || 0);
      }, 0);
      // Assembler les détails du panier
      panierDetails = {
        _id: panier._id,
        nombreArticles: lignesCommande.length,
        total,
        lignesCommande,
      };
    }

    // Porsches personnelles récentes (3 dernières)
    const porschesRecentes = await Model_porsche_actuel.find({ user: userId })
      .populate("couleur_exterieur", "nom_couleur")
      .populate("couleur_interieur", "nom_couleur")
      .populate("photo_voiture_actuel", "name alt")
      .sort({ createdAt: -1 })
      .limit(3);

    // Statistiques rapides (commandes validées = status: true)
    const totalCommandes = await Commande.countDocuments({
      user: userId,
      status: true,
    });
    // Statistiques rapides (réservations actives = status: true)
    const totalReservations = await Reservation.countDocuments({
      user: userId,
      status: true,
    });
    // Statistiques rapides (total Porsches personnelles)
    const totalPorsches = await Model_porsche_actuel.countDocuments({
      user: userId,
    });
    // Assembler le dashboard complet à retourner
    const dashboard = {
      utilisateur: user,
      stats: {
        totalCommandes,
        totalReservations,
        totalPorsches,
      },
      reservationsAvenir,
      dernieresCommandes,
      panier: panierDetails,
      porschesRecentes,
    };

    return res.status(200).json(dashboard);
  } catch (error) {
    logger.error("Erreur lors de la récupération du dashboard", {
      error: error.message,
      userId: req.params.id,
    });
    res.status(500).json({ message: "Erreur serveur" });
  }
};
// Obtenir les rôles utilisateur disponibles
const getAvailableUserRoles = async (req, res) => {
  try {
    const roles = getAvailableRoles();
    return res.status(200).json(roles);
  } catch (error) {
    logger.error("Erreur lors de la récupération des rôles", {
      error: error.message,
    });
    res.status(500).json({ message: "Erreur serveur" });
  }
};

// Modifier le rôle d'un utilisateur
const updateUserRole = async (req, res) => {
  try {
    // seul un admin peut modifier un rôle
    if (!req.user.isAdmin) {
      return res.status(403).json({
        message:
          "Accès refusé. Seuls les administrateurs peuvent modifier les rôles.",
      });
    }
    const { body } = req;
    const userId = req.params.id;
    if (!body || Object.keys(body).length === 0) {
      return res.status(400).json({
        message: "Pas de données dans la requête",
      });
    }
    // Validation spécifique pour la modification de rôle
    const { error } = userValidation(body).userRoleUpdate;
    if (error) {
      return res.status(400).json({ message: error.details[0].message });
    }
    // Empêcher un admin de se rétrograder lui-même
    if (req.user.id === userId && body.role !== "admin") {
      return res.status(400).json({
        message: "Vous ne pouvez pas rétrograder votre propre compte.",
      });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "Utilisateur n'existe pas" });
    }
    // Mettre à jour le rôle de l'utilisateur
    user.role = body.role;
    await user.save();
    const updatedUser = await User.findById(userId).select("-password");

    return res.status(200).json({
      message: `Rôle mis à jour avec succès pour ${updatedUser.email}`,
      user: updatedUser,
    });
  } catch (error) {
    logger.error("Erreur lors de la mise à jour du rôle", {
      error: error.message,
      userId: req.params.id,
    });
    res.status(500).json({ message: "Erreur serveur" });
  }
};

export {
  register,
  login,
  getAllUsers,
  getUserById,
  updateUser,
  updateUserRole,
  deleteUser,
  createUserReservation,
  getUserReservations,
  deleteUserReservation,
  addUserPorsche,
  getUserPorsches,
  deleteUserPorsche,
  getUserProfile,
  cancelUserReservation,
  updateUserPorsche,
  getUserDashboard,
  getAvailableUserRoles,
};
