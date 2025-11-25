/**
 * Contrôleur Photo Voiture
 * - Gère l'upload, la validation et la suppression des photos de voiture
 */
import Couleur_exterieur from "../models/couleur_exterieur.model.js";
import Couleur_interieur from "../models/couleur_interieur.model.js";
import { fileURLToPath } from "node:url";
import fs from "node:fs";
import logger from "../utils/logger.js";
import path from "node:path";
import Photo_voiture from "../models/photo_voiture.model.js";
import photo_voitureValidation from "../validations/photo_voiture.validation.js";
import Taille_jante from "../models/taille_jante.model.js";
import Voiture from "../models/voiture.model.js";

// Pour obtenir le nom du fichier courant
const __filename = fileURLToPath(import.meta.url);
// Pour obtenir le répertoire du fichier courant
const __dirname = path.dirname(__filename);

// Crée une photo pour une voiture (gère upload, validation et relations).
const createPhoto_voiture = async (req, res) => {
  try {
    // Assurer que body est un objet même si req.body est undefined
    const body = req.body || {};
    // Si la requête ne contient ni body ni fichier, rejeter la requête
    if (Object.keys(body).length === 0 && !req.file) {
      return res
        .status(400)
        .json({ message: "Pas de données dans la requête" });
    }
    // Si un fichier est uploadé, définir/écraser le champ name avec l'URL complète de l'image
    if (req.file) {
      body.name = "/uploads/voiture/" + req.file.filename;
    }
    // Gérer le cas où "voiture" est une chaîne (string) au lieu d'un tableau
    if (body.voiture && typeof body.voiture === "string") {
      const trimmed = body.voiture.trim();
      // Gérer le cas où "voiture" est une chaîne JSON représentant un tableau
      if (trimmed.startsWith("[") && trimmed.endsWith("]")) {
        try {
          body.voiture = JSON.parse(trimmed);
        } catch (err) {
          // Garder la chaîne originale si le parsing échoue
        }
        // Si ce n'est pas un tableau après parsing, le remettre en string pour validation
      } else if (trimmed.includes(",")) {
        body.voiture = trimmed
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean);
      } else {
        // Simple string, le convertir en tableau avec un seul élément
        body.voiture = [trimmed];
      }
    }

    const { error } = photo_voitureValidation(body).photo_voitureCreate;
    if (error) {
      // supprimer le fichier uploadé en cas d'erreur de validation
      if (req.file) {
        removeUploadedFile(req.file.filename);
      }
      return res.status(400).json({ message: error.details[0].message });
    }

    // Vérifier que la voiture existe et est de type neuf (type_voiture = true)
    if (body.voiture && Array.isArray(body.voiture)) {
      for (let voitureId of body.voiture) {
        const voiture = await Voiture.findById(voitureId);
        if (!voiture) {
          if (req.file) {
            removeUploadedFile(req.file.filename);
          }
          return res
            .status(404)
            .json({ message: `Voiture ${voitureId} introuvable` });
        }
        // Vérifier que c'est une voiture neuve avant d'ajouter une photo
        if (voiture.type_voiture !== true) {
          if (req.file) {
            removeUploadedFile(req.file.filename);
          }
          return res.status(400).json({
            message: `Les photos de voiture ne peuvent être ajoutées qu'aux voitures neuves (type_voiture = true)`,
          });
        }
      }
    }

    // Vérifier que la couleur extérieure existe si fournie
    if (body.couleur_exterieur) {
      const couleurExt = await Couleur_exterieur.findById(
        body.couleur_exterieur
      );
      if (!couleurExt) {
        // Nettoyer le fichier uploadé en cas d'erreur de validation
        if (req.file) {
          removeUploadedFile(req.file.filename);
        }
        return res
          .status(404)
          .json({ message: "Couleur extérieure introuvable" });
      }
    }
    // Vérifier que la couleur intérieure existe si fournie
    if (body.couleur_interieur) {
      const couleurInt = await Couleur_interieur.findById(
        body.couleur_interieur
      );
      if (!couleurInt) {
        if (req.file) {
          removeUploadedFile(req.file.filename);
        }
        return res
          .status(404)
          .json({ message: "Couleur intérieure introuvable" });
      }
    }
    // Vérifier que la taille de jante existe si fournie
    if (body.taille_jante) {
      const tailleJante = await Taille_jante.findById(body.taille_jante);
      if (!tailleJante) {
        if (req.file) {
          removeUploadedFile(req.file.filename);
        }
        return res.status(404).json({ message: "Taille de jante introuvable" });
      }
    }

    // Créer la photo de voiture dans la base de données
    const photo_voiture = new Photo_voiture(body);
    const newPhoto_voiture = await photo_voiture.save();

    // Retourner avec populate les références complètes
    const populatedPhoto = await Photo_voiture.findById(newPhoto_voiture._id)
      .populate("voiture", "nom_model type_voiture")
      .populate("couleur_exterieur", "nom_couleur photo_couleur")
      .populate("couleur_interieur", "nom_couleur photo_couleur")
      .populate("taille_jante", "taille_jante");

    return res.status(201).json({
      message: "Photo de voiture créée avec succès",
      photo: populatedPhoto,
    });
  } catch (error) {
    if (req.file) {
      removeUploadedFile(req.file.filename);
    }
    res.status(500).json({ message: "Erreur serveur", error: error });
  }
};

// Récupère toutes les photos de voitures (avec détails associés).
const getAllPhoto_voitures = async (req, res) => {
  try {
    const photo_voitures = await Photo_voiture.find()
      .populate("voiture", "nom_model type_voiture")
      .populate("couleur_exterieur", "nom_couleur photo_couleur")
      .populate("couleur_interieur", "nom_couleur photo_couleur")
      .populate("taille_jante", "taille_jante")
      .sort({ createdAt: -1 });
    return res.status(200).json(photo_voitures);
  } catch (error) {
    res.status(500).json({ message: "Erreur serveur", error: error });
  }
};

// Récupère une photo de voiture par ID.
const getPhoto_voitureById = async (req, res) => {
  try {
    const photo_voiture = await Photo_voiture.findById(req.params.id)
      .populate("voiture", "nom_model type_voiture description prix")
      .populate("couleur_exterieur", "nom_couleur photo_couleur description")
      .populate("couleur_interieur", "nom_couleur photo_couleur description")
      .populate("taille_jante", "taille_jante");
    if (!photo_voiture) {
      return res.status(404).json({ message: "photo de voiture n'existe pas" });
    }
    return res.status(200).json(photo_voiture);
  } catch (error) {
    res.status(500).json({ message: "Erreur serveur", error: error });
  }
};

// Met à jour une photo de voiture (remplace fichier si upload).
const updatePhoto_voiture = async (req, res) => {
  try {
    // Vérification auth/staff gérée par les middlewares (auth + isStaff)
    const { body } = req;
    // Vérifier qu'il y a des données (body ou file) à mettre à jour
    if ((!body || Object.keys(body).length === 0) && !req.file) {
      return res
        .status(400)
        .json({ message: "Pas de données dans la requête" });
    }
    // Si un fichier est uploadé, mettre à jour le champ name avec l'URL complète de l'image
    if (req.file) {
      body.name = "/uploads/voiture/" + req.file.filename;
    }
    // Valider seulement si body n'est pas vide (quelques champs à mettre à jour)
    if (body && Object.keys(body).length > 0) {
      const { error } = photo_voitureValidation(body).photo_voitureUpdate;
      if (error) {
        // Nettoyer le fichier uploadé en cas d'erreur de validation
        if (req.file) {
          removeUploadedFile(req.file.filename);
        }
        return res.status(400).json({ message: error.details[0].message });
      }
    }
    // Vérifier que les voitures existent et sont neuves si fournies
    if (body.voiture && Array.isArray(body.voiture)) {
      for (let voitureId of body.voiture) {
        const voiture = await Voiture.findById(voitureId);
        if (!voiture) {
          if (req.file) {
            removeUploadedFile(req.file.filename);
          }
          return res
            .status(404)
            .json({ message: `Voiture ${voitureId} introuvable` });
        }
        // Vérifier que c'est une voiture neuve avant d'ajouter une photo
        if (voiture.type_voiture !== true) {
          if (req.file) {
            removeUploadedFile(req.file.filename);
          }
          return res.status(400).json({
            message: `Les photos de voiture ne peuvent être ajoutées qu'aux voitures neuves`,
          });
        }
      }
    }
    // Vérifier couleur extérieure si fournie
    if (body.couleur_exterieur) {
      const couleurExt = await Couleur_exterieur.findById(
        body.couleur_exterieur
      );
      if (!couleurExt) {
        if (req.file) {
          removeUploadedFile(req.file.filename);
        }
        return res
          .status(404)
          .json({ message: "Couleur extérieure introuvable" });
      }
    }
    // Vérifier couleur intérieure si fournie
    if (body.couleur_interieur) {
      const couleurInt = await Couleur_interieur.findById(
        body.couleur_interieur
      );
      if (!couleurInt) {
        if (req.file) {
          removeUploadedFile(req.file.filename);
        }
        return res
          .status(404)
          .json({ message: "Couleur intérieure introuvable" });
      }
    }

    // Vérifier taille de jante si fournie
    if (body.taille_jante) {
      const tailleJante = await Taille_jante.findById(body.taille_jante);
      if (!tailleJante) {
        if (req.file) {
          removeUploadedFile(req.file.filename);
        }
        return res.status(404).json({ message: "Taille de jante introuvable" });
      }
    }

    // Récupérer l'ancienne photo pour supprimer l'ancien fichier si nécessaire
    const oldPhoto = await Photo_voiture.findById(req.params.id);
    if (!oldPhoto) {
      // Nettoyer le nouveau fichier si la photo n'existe pas
      if (req.file) {
        removeUploadedFile(req.file.filename);
      }
      return res.status(404).json({ message: "photo de voiture n'existe pas" });
    }
    // Si on remplace l'image, supprimer l'ancienne du serveur
    if (req.file && oldPhoto.name) {
      // Supprimer l'ancien fichier image
      removeUploadedFile(oldPhoto.name.split("/").at(-1));
    }

    // Mettre à jour la photo de voiture dans la base de données
    const updatedPhoto_voiture = await Photo_voiture.findByIdAndUpdate(
      req.params.id,
      body,
      { new: true }
    )
      .populate("voiture", "nom_model type_voiture")
      .populate("couleur_exterieur", "nom_couleur photo_couleur")
      .populate("couleur_interieur", "nom_couleur photo_couleur")
      .populate("taille_jante", "taille_jante");

    return res.status(200).json({
      message: "Photo de voiture mise à jour avec succès",
      photo: updatedPhoto_voiture,
    });
  } catch (error) {
    // Nettoyer le fichier en cas d'erreur serveur
    if (req.file) {
      removeUploadedFile(req.file.filename);
    }
    res.status(500).json({ message: "Erreur serveur", error: error });
  }
};

// Supprime un fichier uploadé du dossier `uploads/voiture`.
const removeUploadedFile = (FilenameOrPath) => {
  try {
    // Accepte soit un chemin absolu, soit juste le nom de fichier
    const filePath = path.isAbsolute(FilenameOrPath)
      ? FilenameOrPath
      : path.join(__dirname, "../uploads/voiture/", FilenameOrPath);
    // Supprimer le fichier s'il existe
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
  } catch (err) {
    logger.error("Erreur lors de la suppression du fichier:", err);
  }
};

// Supprime une photo de voiture (vérifie permissions et dépendances).
const deletePhoto_voiture = async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: "Non autorisé" });
    }
    // Vérifier que l'utilisateur est admin
    if (!req.user.isAdmin) {
      return res
        .status(403)
        .json({ message: "Accès réservé aux administrateurs" });
    }

    // Vérifier si des voitures utilisent cette photo avant de la supprimer
    const voitures = await Voiture.find({ photo_voiture: req.params.id });
    if (voitures.length > 0) {
      return res.status(400).json({
        message: `Impossible de supprimer cette image car elle est associée à ${voitures
          .map((voiture) => voiture.nom_model)
          .join(", ")}`,
      });
    }
    // Trouver la photo de voiture à supprimer
    const photo_voiture = await Photo_voiture.findById(req.params.id);
    if (!photo_voiture) {
      return res.status(404).json({ message: "Photo de voiture n'existe pas" });
    }
    // Supprimer le fichier image du serveur
    if (photo_voiture.name) {
      removeUploadedFile(photo_voiture.name.split("/").at(-1));
    }
    await photo_voiture.deleteOne();
    return res
      .status(200)
      .json({ message: "Photo de voiture supprimée avec succès" });
  } catch (error) {
    res.status(500).json({ message: "Erreur serveur", error: error });
  }
};

// Recherche des photos selon critères (voiture, couleur, jante).
const getPhotosByCriteria = async (req, res) => {
  try {
    const { voiture, couleur_exterieur, couleur_interieur, taille_jante } =
      req.query;
    const query = {};
    // Ajouter les critères fournis à la requête
    if (voiture) query.voiture = voiture;
    if (couleur_exterieur) query.couleur_exterieur = couleur_exterieur;
    if (couleur_interieur) query.couleur_interieur = couleur_interieur;
    if (taille_jante) query.taille_jante = taille_jante;
    // Exécuter la requête avec les critères
    const photos = await Photo_voiture.find(query)
      .populate("voiture", "nom_model type_voiture")
      .populate("couleur_exterieur", "nom_couleur photo_couleur")
      .populate("couleur_interieur", "nom_couleur photo_couleur")
      .populate("taille_jante", "taille_jante")
      .sort({ createdAt: -1 });

    return res.status(200).json({
      count: photos.length,
      filters: query,
      photos,
    });
  } catch (error) {
    res.status(500).json({ message: "Erreur serveur", error: error });
  }
};

export {
  createPhoto_voiture,
  getAllPhoto_voitures,
  getPhoto_voitureById,
  updatePhoto_voiture,
  deletePhoto_voiture,
  getPhotosByCriteria,
};
