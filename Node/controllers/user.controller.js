// Controller: User
// Gestion des utilisateurs: inscription, connexion, CRUD utilisateur et actions liées (réservations, paniers, voitures personnelles).
// Points clés:
// - crée un panier vide à la création d'un utilisateur
// - sécurise certaines opérations (seul l'utilisateur ou l'admin peut modifier/supprimer)
// - la modification des rôles est strictement réservée aux admins
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
import { getAvailableRoles, hasPermission } from "../utils/roles.constants.js";

const register = async (req, res) => {
  try {
    const { body } = req;
    if (!body || Object.keys(body).length === 0) {
      return res
        .status(400)
        .json({ message: "Pas de données dans la requête" });
    }

    const { error } = userValidation(body).userCreate;
    if (error) {
      return res.status(400).json({ message: error.details[0].message });
    }

    const searchUser = await User.findOne({ email: body.email });
    if (searchUser) {
      return res
        .status(409)
        .json({ message: "Utilisateur existe déjà avec cet email" });
    }

    const user = new User(body);
    const newUser = await user.save();

    const commande = new Commande({
      user: newUser._id,
      date_commande: new Date(),
      prix: 0,
      acompte: 0,
      status: false, // false = panier actif/non validé
    });

    await commande.save();
    newUser.panier = commande._id;
    await newUser.save();

    const userResponse = newUser.toObject();
    delete userResponse.password;

    return res.status(201).json(userResponse);
  } catch (error) {
    res.status(500).json({ message: "Erreur serveur", error: error.message });
  }
};

const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!req.body || Object.keys(req.body).length === 0) {
      return res
        .status(400)
        .json({ message: "Pas de données dans la requête" });
    }

    const { error } = userValidation(req.body).userLogin;
    if (error) {
      return res.status(400).json({ message: error.details[0].message });
    }

    const user = await User.findOne({ email: email }).select("+password");
    if (!user) {
      return res.status(400).json({ message: "Identifiants invalides" });
    }
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Identifiants invalides" });
    }

    const userForToken = {
      id: user._id,
      email: user.email,
      nom: user.nom,
      prenom: user.prenom,
      role: user.role,
      isAdmin: user.isAdmin,
    };

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
    res.status(500).json({ message: "Erreur serveur", error: error.message });
  }
};

const getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select("-password");
    return res.status(200).json(users);
  } catch (error) {
    res.status(500).json({ message: "Erreur serveur", error: error });
  }
};

const getUserById = async (req, res) => {
  try {
    if (req.user.id !== req.params.id && !req.user.isAdmin) {
      return res.status(403).json({ message: "Accès non autorisé" });
    }

    const user = await User.findById(req.params.id).select("-password");
    if (!user) {
      return res.status(404).json({ message: "Utilisateur n'existe pas" });
    }
    return res.status(200).json(user);
  } catch (error) {
    res.status(500).json({ message: "Erreur serveur" });
  }
};

const updateUser = async (req, res) => {
  try {
    if (req.user.id !== req.params.id && !req.user.isAdmin) {
      return res.status(403).json({ message: "Accès non autorisé" });
    }

    const { body } = req;
    if (!body || Object.keys(body).length === 0) {
      return res
        .status(400)
        .json({ message: "Pas de données dans la requête" });
    }

    // Empêcher la modification des champs sensibles par un utilisateur non-admin
    // Les rôles sont gérés via updateUserRole (route séparée)
    if (!req.user.isAdmin) {
      delete body.isAdmin;
      delete body.role;
      delete body.panier;
    }

    // Si un admin essaie de modifier le rôle via cette route, le bloquer
    if (body.role || body.isAdmin !== undefined) {
      return res.status(400).json({
        message:
          "Pour modifier le rôle, utilisez la route dédiée PUT /api/users/:id/role",
      });
    }

    const { error } = userValidation(body).userUpdate;
    if (error) {
      return res.status(400).json({ message: error.details[0].message });
    }

    const updatedUser = await User.findByIdAndUpdate(req.params.id, body, {
      new: true,
    }).select("-password");

    if (!updatedUser) {
      return res.status(404).json({ message: "Utilisateur n'existe pas" });
    }
    return res.status(200).json(updatedUser);
  } catch (error) {
    res.status(500).json({ message: "Erreur serveur" });
  }
};

const deleteUser = async (req, res) => {
  try {
    if (req.user.id !== req.params.id && !req.user.isAdmin) {
      return res.status(403).json({ message: "Accès non autorisé" });
    }

    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) {
      return res.status(404).json({ message: "Utilisateur n'existe pas" });
    }

    // Supprimer toutes les réservations et Porsches associées à user
    await Reservation.deleteMany({ user: req.params.id });
    await Model_porsche_actuel.deleteMany({ user: req.params.id });
    await Commande.deleteMany({ user: req.params.id });

    return res
      .status(200)
      .json({ message: "Utilisateur et toutes ses données ont été supprimés" });
  } catch (error) {
    res.status(500).json({ message: "Erreur serveur" });
  }
};

// Créer une réservation pour l'utilisateur
const createUserReservation = async (req, res) => {
  try {
    const { body } = req;
    const userId = req.params.id;

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

    const dateReservation = new Date(body.date_reservation);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

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

    // LOGIQUE MÉTIER: Seules les voitures d'occasion peuvent être réservées
    if (voiture.type_voiture !== false) {
      return res.status(400).json({
        message:
          "Seules les voitures d'occasion peuvent être réservées. Les voitures neuves doivent être achetées via une commande.",
      });
    }

    const existingReservation = await Reservation.findOne({
      voiture: body.voiture,
      date_reservation: dateReservation,
      status: true,
    });

    if (existingReservation) {
      return res.status(409).json({
        message: "Cette voiture est déjà réservée pour cette date",
      });
    }
    const reservation = new Reservation({
      ...body,
      user: userId,
      status: true,
    });

    const newReservation = await reservation.save();
    const populatedReservation = await Reservation.findById(newReservation._id)
      .populate("user", "nom prenom email telephone")
      .populate("voiture", "nom_model type_voiture description prix");

    return res.status(201).json(populatedReservation);
  } catch (error) {
    res.status(500).json({ message: "Erreur serveur", error: error });
  }
};

// Obtenir les réservations de l'utilisateur
const getUserReservations = async (req, res) => {
  try {
    const userId = req.params.id;

    if (req.user.id !== userId && !req.user.isAdmin) {
      return res.status(403).json({ message: "Accès non autorisé" });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "Utilisateur n'existe pas" });
    }

    const reservations = await Reservation.find({ user: userId })
      .populate("voiture", "nom_model type_voiture description prix")
      .sort({ date_reservation: -1 });

    return res.status(200).json(reservations);
  } catch (error) {
    res.status(500).json({ message: "Erreur serveur", error: error });
  }
};

// Ajouter une Porsche personnelle à l'utilisateur
const addUserPorsche = async (req, res) => {
  try {
    const { body } = req;
    const userId = req.params.id;

    if (req.user.id !== userId && !req.user.isAdmin) {
      return res.status(403).json({ message: "Accès non autorisé" });
    }

    if (!body || Object.keys(body).length === 0) {
      return res.status(400).json({
        message: "Données de la Porsche requises",
      });
    }

    const { error } =
      model_porsche_actuelValidation(body).model_porsche_actuelCreate;
    if (error) {
      return res.status(400).json({ message: error.details[0].message });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "Utilisateur n'existe pas" });
    }

    const porsche = new Model_porsche_actuel({
      ...body,
      user: userId,
    });

    const newPorsche = await porsche.save();
    return res.status(201).json(newPorsche);
  } catch (error) {
    res.status(500).json({ message: "Erreur serveur", error: error });
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

    const porsches = await Model_porsche_actuel.find({ user: userId })
      .populate("couleur_exterieur", "nom_couleur")
      .populate("couleur_interieur", "nom_couleur")
      .populate("photo_voiture_actuel", "name alt")
      .sort({
        createdAt: -1,
      });

    return res.status(200).json(porsches);
  } catch (error) {
    res.status(500).json({ message: "Erreur serveur", error: error });
  }
};

// Obtenir le profil complet de l'utilisateur
const getUserProfile = async (req, res) => {
  try {
    const userId = req.params.id;

    if (req.user.id !== userId && !req.user.isAdmin) {
      return res.status(403).json({ message: "Accès non autorisé" });
    }

    const user = await User.findById(userId).select("-password");
    if (!user) {
      return res.status(404).json({ message: "Utilisateur n'existe pas" });
    }

    // Obtenir les réservations
    const reservations = await Reservation.find({ user: userId })
      .populate("voiture", "nom_model type_voiture description prix")
      .sort({ date_reservation: -1 })
      .limit(5); // 5 dernières

    // Obtenir les Porsches personnelles
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

    if (panier) {
      const ligneCommandes = await LigneCommande.find({ commande: panier._id })
        .populate("accesoire", "nom_accesoire prix")
        .populate("voiture", "nom_model type_voiture prix");

      const total = ligneCommandes.reduce((sum, line) => {
        // Si c'est une voiture, utiliser l'acompte de la ligne de commande, sinon le prix de l'accessoire
        const prix = line.type_produit
          ? line.acompte
          : line.accesoire
          ? line.accesoire.prix
          : 0;
        return sum + prix * line.quantite;
      }, 0);

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

    const profile = {
      user,
      reservations,
      porsches,
      panier: panierDetails,
      historique,
    };

    return res.status(200).json(profile);
  } catch (error) {
    res.status(500).json({ message: "Erreur serveur", error: error });
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

    await Reservation.findByIdAndDelete(reservationId);
    return res
      .status(200)
      .json({ message: "Réservation supprimée avec succès" });
  } catch (error) {
    res.status(500).json({ message: "Erreur serveur", error: error });
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
    res.status(500).json({ message: "Erreur serveur", error: error });
  }
};

// Annuler une réservation (change le status au lieu de supprimer)
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
    res.status(500).json({ message: "Erreur serveur", error: error });
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

    const { error } =
      model_porsche_actuelValidation(body).model_porsche_actuelUpdate;
    if (error) {
      return res.status(400).json({ message: error.details[0].message });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "Utilisateur n'existe pas" });
    }

    const porsche = await Model_porsche_actuel.findOne({
      _id: porscheId,
      user: userId,
    });

    if (!porsche) {
      return res.status(404).json({
        message: "Porsche introuvable ou n'appartient pas à cet utilisateur",
      });
    }

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
    res.status(500).json({ message: "Erreur serveur", error: error });
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

    // Réservations à venir
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
        // Si c'est une voiture avec acompte, utiliser l'acompte, sinon le prix
        const montant =
          ligne.type_produit && ligne.acompte > 0 ? ligne.acompte : ligne.prix;
        return sum + (montant * ligne.quantite || 0);
      }, 0);

      panierDetails = {
        _id: panier._id,
        nombreArticles: lignesCommande.length,
        total,
        lignesCommande,
      };
    }

    // Porsches personnelles récentes
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
    const totalReservations = await Reservation.countDocuments({
      user: userId,
    });
    const totalPorsches = await Model_porsche_actuel.countDocuments({
      user: userId,
    });

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
    res.status(500).json({ message: "Erreur serveur", error: error });
  }
};

// Obtenir la liste des rôles disponibles (pour React)
const getAvailableUserRoles = async (req, res) => {
  try {
    // Cette route peut être accessible aux admins uniquement ou à tous selon vos besoins
    // Actuellement ouverte aux utilisateurs authentifiés pour affichage dans UI
    const roles = getAvailableRoles();
    return res.status(200).json(roles);
  } catch (error) {
    res.status(500).json({ message: "Erreur serveur", error: error.message });
  }
};

// Modifier le rôle d'un utilisateur (admin uniquement)
const updateUserRole = async (req, res) => {
  try {
    // Vérification supplémentaire: seul un admin peut modifier un rôle
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
        message:
          "Vous ne pouvez pas rétrograder votre propre compte. Demandez à un autre administrateur.",
      });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "Utilisateur n'existe pas" });
    }

    // Mettre à jour le rôle
    user.role = body.role;
    await user.save();

    const updatedUser = await User.findById(userId).select("-password");

    return res.status(200).json({
      message: `Rôle mis à jour avec succès pour ${updatedUser.email}`,
      user: updatedUser,
    });
  } catch (error) {
    res.status(500).json({ message: "Erreur serveur", error: error.message });
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
