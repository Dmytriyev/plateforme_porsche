import User from "../models/user.model.js";
import userValidation from "../validations/user.validation.js";
import model_porsche_actuelValidation from "../validations/model_porsche_actuel.validation.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import Commande from "../models/Commande.model.js";
import Reservation from "../models/reservation.model.js";
import Model_porsche_actuel from "../models/model_porsche_actuel.model.js";
import LigneCommande from "../models/ligneCommande.model.js";

const register = async (req, res) => {
  try {
    const { body } = req;
    if (!body) {
      return res
        .status(400)
        .json({ message: "Pas de données dans la requête" });
    }

    const { error } = userValidation(body).userCreate;
    if (error) {
      return res.status(401).json(error.details[0].message);
    }

    const searchUser = await User.findOne({ email: body.email });
    if (searchUser) {
      return res
        .status(409)
        .json({ message: "Utilisateur existe déjà avec cet email" });
    }

    const user = new User(body);
    const newUser = await user.save();
    // Créer une commande panier pour l'utilisateur
    const commande = new Commande({
      user: newUser._id,
      date_commande: new Date(),
      prix: 0,
      acompte: 0,
      status: true, // true = panier actif, false = commande validée
    });

    await commande.save();
    // Mettre à jour l'utilisateur avec l'ID du panier
    newUser.panier = commande._id;
    await newUser.save();

    const userResponse = newUser.toObject();
    delete userResponse.password;

    return res.status(201).json(userResponse);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Erreur serveur", error: error });
  }
};

const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const { error } = userValidation(req.body).userLogin;

    if (error) {
      return res.status(401).json(error.details[0].message);
    }

    const user = await User.findOne({ email: email });
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
        { id: user._id, email: user.email },
        process.env.SECRET_KEY,
        { expiresIn: "24h" }
      ),
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Erreur serveur", error: error });
  }
};

const getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select("-password");
    return res.status(200).json(users);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Erreur serveur", error: error });
  }
};

const getUserById = async (req, res) => {
  try {
    // Vérifier que l'utilisateur accède à ses propres données ou est admin
    if (req.user.id !== req.params.id && !req.user.isAdmin) {
      return res.status(403).json({ message: "Accès non autorisé" });
    }

    const user = await User.findById(req.params.id).select("-password");
    if (!user) {
      return res.status(404).json({ message: "Utilisateur n'existe pas" });
    }
    return res.status(200).json(user);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Erreur serveur" });
  }
};

const updateUser = async (req, res) => {
  try {
    // Vérifier que l'utilisateur modifie ses propres données ou est admin
    if (req.user.id !== req.params.id && !req.user.isAdmin) {
      return res.status(403).json({ message: "Accès non autorisé" });
    }

    const { body } = req;
    if (!body) {
      return res
        .status(400)
        .json({ message: "Pas de données dans la requête" });
    }

    // Empêcher la modification des champs sensibles par un utilisateur non-admin
    if (!req.user.isAdmin) {
      delete body.isAdmin;
      delete body.role;
      delete body.panier;
    }

    const { error } = userValidation(body).userUpdate;
    if (error) {
      return res.status(401).json(error.details[0].message);
    }

    const updatedUser = await User.findByIdAndUpdate(req.params.id, body, {
      new: true,
    }).select("-password");

    if (!updatedUser) {
      return res.status(404).json({ message: "Utilisateur n'existe pas" });
    }
    return res.status(200).json(updatedUser);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Erreur serveur" });
  }
};

const deleteUser = async (req, res) => {
  try {
    // Vérifier que l'utilisateur supprime son propre compte ou est admin
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
    console.log(error);
    res.status(500).json({ message: "Erreur serveur" });
  }
};

// Créer une réservation pour l'utilisateur
const createUserReservation = async (req, res) => {
  try {
    const { body } = req;
    const userId = req.params.id;

    // Vérifier que l'utilisateur crée une réservation pour lui-même ou est admin
    if (req.user.id !== userId && !req.user.isAdmin) {
      return res.status(403).json({ message: "Accès non autorisé" });
    }

    if (!body) {
      return res.status(400).json({
        message: "Données de réservation requises",
      });
    }

    const { error } = userValidation(body).userReservation;
    if (error) {
      return res.status(401).json(error.details[0].message);
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
    console.log(error);
    res.status(500).json({ message: "Erreur serveur", error: error });
  }
};

// Obtenir les réservations de l'utilisateur
const getUserReservations = async (req, res) => {
  try {
    const userId = req.params.id;

    // Vérifier que l'utilisateur accède à ses propres réservations ou est admin
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
    console.log(error);
    res.status(500).json({ message: "Erreur serveur", error: error });
  }
};

// Ajouter une Porsche personnelle à l'utilisateur
const addUserPorsche = async (req, res) => {
  try {
    const { body } = req;
    const userId = req.params.id;

    // Vérifier que l'utilisateur ajoute une Porsche pour lui-même ou est admin
    if (req.user.id !== userId && !req.user.isAdmin) {
      return res.status(403).json({ message: "Accès non autorisé" });
    }

    if (!body) {
      return res.status(400).json({
        message: "Données de la Porsche requises",
      });
    }

    const { error } =
      model_porsche_actuelValidation(body).model_porsche_actuelCreate;
    if (error) {
      return res.status(401).json(error.details[0].message);
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
    console.log(error);
    res.status(500).json({ message: "Erreur serveur", error: error });
  }
};

// Obtenir les Porsches de l'utilisateur
const getUserPorsches = async (req, res) => {
  try {
    const userId = req.params.id;

    // Vérifier que l'utilisateur accède à ses propres Porsches ou est admin
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
    console.log(error);
    res.status(500).json({ message: "Erreur serveur", error: error });
  }
};

// Obtenir le profil complet de l'utilisateur
const getUserProfile = async (req, res) => {
  try {
    const userId = req.params.id;

    // Vérifier que l'utilisateur accède à son propre profil ou est admin
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

    // Obtenir le panier actuel
    const panier = await Commande.findOne({ user: userId, status: true });
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

    // Obtenir l'historique des commandes
    const historique = await Commande.find({ user: userId, status: false })
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
    console.log(error);
    res.status(500).json({ message: "Erreur serveur", error: error });
  }
};

// Supprimer une réservation de l'utilisateur
const deleteUserReservation = async (req, res) => {
  try {
    const userId = req.params.id;
    const reservationId = req.params.reservationId;

    // Vérifier que l'utilisateur supprime sa propre réservation ou est admin
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
    console.log(error);
    res.status(500).json({ message: "Erreur serveur", error: error });
  }
};

// Supprimer une Porsche de l'utilisateur
const deleteUserPorsche = async (req, res) => {
  try {
    const userId = req.params.id;
    const porscheId = req.params.porscheId;

    // Vérifier que l'utilisateur supprime sa propre Porsche ou est admin
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
    console.log(error);
    res.status(500).json({ message: "Erreur serveur", error: error });
  }
};

export {
  register,
  login,
  getAllUsers,
  getUserById,
  updateUser,
  deleteUser,
  createUserReservation,
  getUserReservations,
  deleteUserReservation,
  addUserPorsche,
  getUserPorsches,
  deleteUserPorsche,
  getUserProfile,
};
