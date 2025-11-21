import Accesoire from "../models/accesoire.model.js";
import accesoireValidation from "../validations/accesoire.validation.js";
import PhotoAccesoire from "../models/photo_accesoire.model.js";
import Couleur_accesoire from "../models/couleur_accesoire.model.js";
import { getAvailableTypesAccesoire } from "../utils/accesoire.constants.js";
import {
  sendSuccess,
  sendError,
  sendNotFound,
  sendValidationError,
} from "../utils/responses.js";

// Créer un nouvel accesoire dans la base de données
const createAccesoire = async (req, res) => {
  try {
    const { body } = req;
    // Vérifier que le corps de la requête n'est pas vide
    if (!body || Object.keys(body).length === 0) {
      return sendValidationError(res, "Pas de données dans la requête");
    }

    const { error } = accesoireValidation(body).accesoireCreate;
    if (error) {
      return sendValidationError(res, error.details[0].message);
    }

    // Vérifier que la couleur existe si fournie
    if (body.couleur_accesoire) {
      const couleur = await Couleur_accesoire.findById(body.couleur_accesoire);
      if (!couleur) {
        return sendNotFound(res, "Couleur d'accesoire introuvable");
      }
    }

    // Vérifier que les photos existent si fournies
    if (body.photo_accesoire && Array.isArray(body.photo_accesoire)) {
      for (let photoId of body.photo_accesoire) {
        const photo = await PhotoAccesoire.findById(photoId);
        if (!photo) {
          return sendNotFound(res, `Photo ${photoId} introuvable`);
        }
      }
    }

    // Créer et sauvegarder le nouvel accesoire
    const accesoire = new Accesoire(body);
    const newAccesoire = await accesoire.save();
    // Recharger l'accesoire avec les informations nécessaires
    const populatedAccesoire = await Accesoire.findById(newAccesoire._id)
      .populate("photo_accesoire", "name alt")
      .populate("couleur_accesoire", "nom_couleur photo_couleur");

    return sendSuccess(
      res,
      { accesoire: populatedAccesoire },
      "Accesoire créé avec succès",
      201
    );
  } catch (error) {
    return sendError(res, "Erreur serveur", 500, error);
  }
};

// Récupérer tous les accesoires de la base de données
const getAllAccesoires = async (req, res) => {
  try {
    const accesoires = await Accesoire.find()
      .populate("photo_accesoire", "name alt")
      .populate("couleur_accesoire", "nom_couleur photo_couleur")
      .sort({ createdAt: -1 })
      .lean(); // Retourne des objets JS purs (30-50% plus rapide)

    // Retourner le tableau directement dans data pour compatibilité avec extractArray
    return sendSuccess(res, accesoires, "Accesoires récupérés avec succès");
  } catch (error) {
    return sendError(res, "Erreur serveur", 500, error);
  }
};

// Récupérer un accesoire par son ID
const getAccesoireById = async (req, res) => {
  try {
    const accesoire = await Accesoire.findById(req.params.id)
      .populate("photo_accesoire", "name alt")
      .populate("couleur_accesoire", "nom_couleur photo_couleur description")
      .lean(); // Retourne un objet JS pur

    if (!accesoire) {
      return sendNotFound(res, "Accesoire introuvable");
    }

    return sendSuccess(res, accesoire, "Accesoire récupéré avec succès");
  } catch (error) {
    return sendError(res, "Erreur serveur", 500, error);
  }
};

// Mettre à jour un accesoire existant dans la base de données
const updateAccesoire = async (req, res) => {
  try {
    const { body } = req;
    // Vérifier que le corps de la requête n'est pas vide
    if (!body || Object.keys(body).length === 0) {
      return sendValidationError(res, "Pas de données dans la requête");
    }

    const { error } = accesoireValidation(body).accesoireUpdate;
    if (error) {
      return sendValidationError(res, error.details[0].message);
    }
    // Vérifier que l'accesoire existe avant de le mettre à jour
    const accesoireExist = await Accesoire.findById(req.params.id);
    if (!accesoireExist) {
      return sendNotFound(res, "Accesoire introuvable");
    }

    // Vérifier que la couleur existe si fournie
    if (body.couleur_accesoire) {
      const couleur = await Couleur_accesoire.findById(body.couleur_accesoire);
      if (!couleur) {
        return sendNotFound(res, "Couleur d'accesoire introuvable");
      }
    }

    // Mettre à jour l'accesoire dans la base de données et retourner le nouvel objet
    const updatedAccesoire = await Accesoire.findByIdAndUpdate(
      req.params.id,
      body,
      { new: true }
    )
      .populate("photo_accesoire", "name alt")
      .populate("couleur_accesoire", "nom_couleur photo_couleur");

    return sendSuccess(
      res,
      { accesoire: updatedAccesoire },
      "Accesoire mis à jour avec succès"
    );
  } catch (error) {
    return sendError(res, "Erreur serveur", 500, error);
  }
};

// Supprimer un accesoire de la base de données par son ID
const deleteAccesoire = async (req, res) => {
  try {
    const accesoire = await Accesoire.findByIdAndDelete(req.params.id);
    if (!accesoire) {
      return sendNotFound(res, "Accesoire introuvable");
    }

    return sendSuccess(res, null, "Accesoire supprimé avec succès");
  } catch (error) {
    return sendError(res, "Erreur serveur", 500, error);
  }
};

// Ajouter des images à un accesoire existant dans la base de données
const addImages = async (req, res) => {
  try {
    const { body } = req;
    if (!body || Object.keys(body).length === 0) {
      return sendValidationError(res, "Pas de données dans la requête");
    }

    const { error } = accesoireValidation(body).accesoireAddOrRemoveImage;
    if (error) {
      return sendValidationError(res, error.details[0].message);
    }
    // Vérifier que l'accesoire existe avant d'ajouter des images
    const accesoire = await Accesoire.findById(req.params.id);
    if (!accesoire) {
      return sendNotFound(res, `Accesoire ${req.params.id} introuvable`);
    }

    // Vérifier que toutes les photos existent
    for (let photo_accesoireId of body.photo_accesoire) {
      const photo_accesoire = await PhotoAccesoire.findById(photo_accesoireId);
      // Vérifier que chaque photo existe avant de l'ajouter
      if (!photo_accesoire) {
        return sendNotFound(res, `Photo ${photo_accesoireId} introuvable`);
      }
    }

    // $addToSet évite les doublons dans le tableau
    const updatedAccesoire = await Accesoire.findByIdAndUpdate(
      req.params.id,
      { $addToSet: { photo_accesoire: { $each: body.photo_accesoire } } },
      { new: true }
    )
      .populate("photo_accesoire", "name alt")
      .populate("couleur_accesoire", "nom_couleur photo_couleur");

    return sendSuccess(
      res,
      { accesoire: updatedAccesoire },
      "Photos ajoutées avec succès"
    );
  } catch (error) {
    return sendError(res, "Erreur serveur", 500, error);
  }
};

// Supprimer des images d'un accesoire existant dans la base de données
const removeImages = async (req, res) => {
  try {
    const { body } = req;
    if (!body || Object.keys(body).length === 0) {
      return sendValidationError(res, "Pas de données dans la requête");
    }

    const { error } = accesoireValidation(body).accesoireAddOrRemoveImage;
    if (error) {
      return sendValidationError(res, error.details[0].message);
    }

    const accesoire = await Accesoire.findById(req.params.id);
    if (!accesoire) {
      return sendNotFound(res, `Accesoire ${req.params.id} introuvable`);
    }

    // Vérifier que toutes les photos existent
    for (let photo_accesoireId of body.photo_accesoire) {
      const photo_accesoire = await PhotoAccesoire.findById(photo_accesoireId);
      if (!photo_accesoire) {
        return sendNotFound(res, `Photo ${photo_accesoireId} introuvable`);
      }
    }

    // Retirer les photos spécifiées du tableau photo_accesoire
    const updatedAccesoire = await Accesoire.findByIdAndUpdate(
      req.params.id,
      { $pull: { photo_accesoire: { $in: body.photo_accesoire } } },
      { new: true }
    )
      .populate("photo_accesoire", "name alt")
      .populate("couleur_accesoire", "nom_couleur photo_couleur");

    return sendSuccess(
      res,
      { accesoire: updatedAccesoire },
      "Photos supprimées avec succès"
    );
  } catch (error) {
    return sendError(res, "Erreur serveur", 500, error);
  }
};

// Définir la couleur d'un accesoire existant dans la base de données
const setCouleur = async (req, res) => {
  try {
    const { body } = req;
    if (!body || Object.keys(body).length === 0) {
      return sendValidationError(res, "Pas de données dans la requête");
    }

    const { error } = accesoireValidation(body).accesoireSetCouleur;
    if (error) {
      return sendValidationError(res, error.details[0].message);
    }

    // Vérifier que l'accesoire existe
    const accesoire = await Accesoire.findById(req.params.id);
    if (!accesoire) {
      return sendNotFound(res, "Accesoire introuvable");
    }

    // Vérifier que la couleur existe
    const couleur = await Couleur_accesoire.findById(body.couleur_accesoire);
    if (!couleur) {
      return sendNotFound(res, "Couleur d'accesoire introuvable");
    }

    // Mettre à jour la couleur
    const updatedAccesoire = await Accesoire.findByIdAndUpdate(
      req.params.id,
      { couleur_accesoire: body.couleur_accesoire },
      { new: true }
    )
      .populate("photo_accesoire", "name alt")
      .populate("couleur_accesoire", "nom_couleur photo_couleur description");

    return sendSuccess(
      res,
      { accesoire: updatedAccesoire },
      "Couleur définie avec succès"
    );
  } catch (error) {
    return sendError(res, "Erreur serveur", 500, error);
  }
};

// Retirer la couleur d'un accesoire existant dans la base de données
const removeCouleur = async (req, res) => {
  try {
    // Vérifier que l'accesoire existe
    const accesoire = await Accesoire.findById(req.params.id);
    if (!accesoire) {
      return sendNotFound(res, "Accesoire introuvable");
    }

    // Retirer la couleur
    const updatedAccesoire = await Accesoire.findByIdAndUpdate(
      req.params.id,
      // Retirer la couleur en utilisant $unset
      { $unset: { couleur_accesoire: "" } },
      { new: true }
    ).populate("photo_accesoire", "name alt");

    return sendSuccess(
      res,
      { accesoire: updatedAccesoire },
      "Couleur supprimée avec succès"
    );
  } catch (error) {
    return sendError(res, "Erreur serveur", 500, error);
  }
};

// Récupère les accesoires en fonction de critères spécifiques
const getAccesoiresByCriteria = async (req, res) => {
  try {
    // Extraire les critères de la requête query
    const { type_accesoire, couleur_accesoire, prix_min, prix_max } = req.query;
    // Construire la requête dynamique en fonction des critères fournis
    let query = {};
    // Ajouter les critères à la requête si présents
    if (type_accesoire) query.type_accesoire = type_accesoire;
    if (couleur_accesoire) query.couleur_accesoire = couleur_accesoire;
    // Ajouter les critères de prix si présents
    if (prix_min || prix_max) {
      query.prix = {};
      // Ajouter les conditions de prix minimum et maximum
      if (prix_min) query.prix.$gte = Number(prix_min);
      if (prix_max) query.prix.$lte = Number(prix_max);
    }

    // Exécuter la requête avec les critères construits et peupler les références
    const accesoires = await Accesoire.find(query)
      .populate("photo_accesoire", "name alt")
      .populate("couleur_accesoire", "nom_couleur photo_couleur")
      .sort({ createdAt: -1 }) // Trier par date de création décroissante
      .lean();

    return sendSuccess(
      res,
      {
        count: accesoires.length,
        filters: query,
        accesoires,
      },
      "Accesoires récupérés avec succès"
    );
  } catch (error) {
    return sendError(res, "Erreur serveur", 500, error);
  }
};

// Récupérer les types d'accesoires disponibles
const getAvailableTypesAccesoireOptions = async (req, res) => {
  try {
    const types = getAvailableTypesAccesoire();
    return sendSuccess(res, types, "Types d'accesoires récupérés avec succès");
  } catch (error) {
    return sendError(res, "Erreur serveur", 500, error);
  }
};

// ==================== FONCTIONS STAFF ====================

/**
 * Ajouter un accessoire (staff uniquement)
 */
const ajouterAccessoire = async (req, res) => {
  try {
    // Vérifier que l'utilisateur est staff
    if (!req.user) {
      return sendUnauthorized(res, "Authentification requise");
    }

    const staffRoles = ["admin", "responsable", "conseillere"];
    if (!req.user.isAdmin && !staffRoles.includes(req.user.role)) {
      return sendError(
        res,
        "Accès refusé. Vous devez être membre du staff.",
        403
      );
    }

    const { body } = req;

    if (!body || Object.keys(body).length === 0) {
      return sendValidationError(res, "Pas de données dans la requête");
    }
    if (!body.type_accesoire) {
      return sendValidationError(res, "Le type d'accessoire est requis");
    }
    if (!body.nom_accesoire) {
      return sendValidationError(res, "Le nom de l'accessoire est requis");
    }
    if (!body.description) {
      return sendValidationError(res, "La description est requise");
    }
    if (!body.prix || body.prix <= 0) {
      return sendValidationError(res, "Le prix doit être supérieur à 0");
    }

    // Créer l'accessoire
    const accessoire = await new Accesoire({
      type_accesoire: body.type_accesoire,
      nom_accesoire: body.nom_accesoire,
      description: body.description,
      prix: body.prix,
      couleur_accesoire: body.couleur_accesoire,
      photo_accesoire: body.photos || [],
    }).save();

    // Populer les données complètes
    const accessoireComplet = await Accesoire.findById(accessoire._id)
      .populate("couleur_accesoire")
      .populate("photo_accesoire");

    return sendSuccess(
      res,
      accessoireComplet,
      "Accessoire ajouté avec succès",
      201
    );
  } catch (error) {
    return sendError(res, "Erreur serveur", 500, error);
  }
};

/**
 * Supprimer un accessoire (staff uniquement)
 */
const supprimerAccessoire = async (req, res) => {
  try {
    // Vérifier que l'utilisateur est staff
    if (!req.user) {
      return sendUnauthorized(res, "Authentification requise");
    }

    const staffRoles = ["admin", "responsable", "conseillere"];
    if (!req.user.isAdmin && !staffRoles.includes(req.user.role)) {
      return sendError(
        res,
        "Accès refusé. Vous devez être membre du staff.",
        403
      );
    }

    const { id } = req.params;

    const accessoire = await Accesoire.findById(id);

    if (!accessoire) {
      return sendNotFound(res, "Accessoire");
    }

    // Vérifier qu'il n'y a pas de lignes de commande actives
    const LigneCommande = (await import("../models/ligneCommande.model.js"))
      .default;

    // Trouver les commandes actives (panier) avec cet accessoire
    const lignesActives = await LigneCommande.find({
      accesoire: id,
    }).populate("commande");

    const paniers = lignesActives.filter(
      (ligne) => ligne.commande && ligne.commande.status === false
    );

    if (paniers.length > 0) {
      return sendError(
        res,
        "Impossible de supprimer cet accessoire, il est dans des paniers actifs",
        400
      );
    }

    // Supprimer l'accessoire
    await Accesoire.findByIdAndDelete(id);

    return sendSuccess(res, { id }, "Accessoire supprimé avec succès");
  } catch (error) {
    return sendError(res, "Erreur serveur", 500, error);
  }
};

/**
 * Récupérer tous les accessoires (staff)
 */
const getAccessoires = async (req, res) => {
  try {
    // Vérifier que l'utilisateur est staff
    if (!req.user) {
      return sendUnauthorized(res, "Authentification requise");
    }

    const staffRoles = ["admin", "responsable", "conseillere"];
    if (!req.user.isAdmin && !staffRoles.includes(req.user.role)) {
      return sendError(
        res,
        "Accès refusé. Vous devez être membre du staff.",
        403
      );
    }

    const accessoires = await Accesoire.find()
      .populate("couleur_accesoire")
      .populate("photo_accesoire")
      .sort({ createdAt: -1 });

    return sendSuccess(res, {
      accessoires,
      total: accessoires.length,
    });
  } catch (error) {
    return sendError(res, "Erreur serveur", 500, error);
  }
};

/**
 * Mettre à jour un accessoire (staff uniquement)
 */
const modifierAccessoire = async (req, res) => {
  try {
    // Vérifier que l'utilisateur est staff
    if (!req.user) {
      return sendUnauthorized(res, "Authentification requise");
    }

    const staffRoles = ["admin", "responsable", "conseillere"];
    if (!req.user.isAdmin && !staffRoles.includes(req.user.role)) {
      return sendError(
        res,
        "Accès refusé. Vous devez être membre du staff.",
        403
      );
    }

    const { id } = req.params;
    const { body } = req;

    if (!body || Object.keys(body).length === 0) {
      return sendValidationError(res, "Pas de données dans la requête");
    }

    const accessoire = await Accesoire.findById(id);

    if (!accessoire) {
      return sendNotFound(res, "Accessoire");
    }

    // Mettre à jour les champs autorisés
    const champsAutorisés = [
      "type_accesoire",
      "nom_accesoire",
      "description",
      "prix",
      "couleur_accesoire",
      "photo_accesoire",
    ];

    champsAutorisés.forEach((champ) => {
      if (body[champ] !== undefined) {
        accessoire[champ] = body[champ];
      }
    });

    await accessoire.save();

    // Populer les données complètes
    const accessoireComplet = await Accesoire.findById(id)
      .populate("couleur_accesoire")
      .populate("photo_accesoire");

    return sendSuccess(
      res,
      accessoireComplet,
      "Accessoire modifié avec succès"
    );
  } catch (error) {
    return sendError(res, "Erreur serveur", 500, error);
  }
};

export {
  createAccesoire,
  getAllAccesoires,
  getAccesoireById,
  updateAccesoire,
  deleteAccesoire,
  addImages,
  removeImages,
  setCouleur,
  removeCouleur,
  getAccesoiresByCriteria,
  getAvailableTypesAccesoireOptions,
  // Fonctions staff
  ajouterAccessoire,
  supprimerAccessoire,
  getAccessoires,
  modifierAccessoire,
};
