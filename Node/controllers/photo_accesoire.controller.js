/**
 * Contrôleur Photo Accesoire
 * - Gère l'upload et la gestion des images d'accessoires
 */
import { fileURLToPath } from "node:url";
import fs from "node:fs";
import logger from "../utils/logger.js";
import path from "node:path";
import Photo_accesoire from "../models/photo_accesoire.model.js";
import photo_accesoireValidation from "../validations/photo_accesoire.validation.js";

// Pour obtenir le nom du fichier courant
const __filename = fileURLToPath(import.meta.url);
// Pour obtenir le répertoire du fichier courant
const __dirname = path.dirname(__filename);

// Créer une nouvelle photo d'accesoire
const createPhoto_accesoire = async (req, res) => {
  try {
    // Vérifier l'authentification
    if (!req.user) {
      // Supprimer le fichier uploadé en cas de non-authentification
      if (req.file) {
        removeUploadedFile(req.file.filename);
      }
      return res.status(401).json({ message: "Non autorisé" });
    }

    // Vérifier que l'utilisateur est admin
    if (!req.user.isAdmin) {
      if (req.file) {
        // Supprimer le fichier uploadé en cas de non-autorisation
        removeUploadedFile(req.file.filename);
      }
      return res
        .status(403)
        .json({ message: "Accès réservé aux administrateurs" });
    }

    // Vérifier la présence de données dans le body
    const { body } = req;

    if ((!body || Object.keys(body).length === 0) && !req.file) {
      if (req.file) {
        removeUploadedFile(req.file.filename);
      }
      return res
        .status(400)
        .json({ message: "Pas de données dans la requête" });
    }

    // Ajouter le champ name avec le chemin du fichier uploadé
    if (req.file) {
      body.name = "/uploads/accesoire/" + req.file.filename;
    }

    const { error } = photo_accesoireValidation(body).photo_accesoireCreate;
    if (error) {
      if (req.file) {
        removeUploadedFile(req.file.filename);
      }
      return res.status(400).json({
        message: error.details[0].message,
      });
    }

    // Créer et sauvegarder la nouvelle photo d'accesoire
    const photo_accesoire = new Photo_accesoire(body);
    const newPhoto_accesoire = await photo_accesoire.save();
    return res.status(201).json({
      message: "Photo d'accesoire créée avec succès",
      photo: newPhoto_accesoire,
    });
  } catch (error) {
    if (req.file) {
      removeUploadedFile(req.file.filename);
    }
    res.status(500).json({ message: "Erreur serveur", error: error });
  }
};

// Récupérer toutes les photos d'accesoires
const getAllPhoto_accesoires = async (req, res) => {
  try {
    const photo_accesoires = await Photo_accesoire.find();
    return res.status(200).json(photo_accesoires);
  } catch (error) {
    res.status(500).json({ message: "Erreur serveur", error: error });
  }
};

// Récupérer une photo d'accesoire par ID
const getPhoto_accesoireById = async (req, res) => {
  try {
    const photo_accesoire = await Photo_accesoire.findById(req.params.id);
    if (!photo_accesoire) {
      return res
        .status(404)
        .json({ message: "Photo d'accesoire n'existe pas" });
    }
    return res.status(200).json(photo_accesoire);
  } catch (error) {
    res.status(500).json({ message: "Erreur serveur", error: error });
  }
};

// Mettre à jour une photo d'accesoire
const updatePhoto_accesoire = async (req, res) => {
  try {
    if (!req.user) {
      if (req.file) {
        removeUploadedFile(req.file.filename);
      }
      return res.status(401).json({ message: "Non autorisé" });
    }
    // Vérifier que l'utilisateur est admin
    if (!req.user.isAdmin) {
      if (req.file) {
        removeUploadedFile(req.file.filename);
      }
      return res
        .status(403)
        .json({ message: "Accès réservé aux administrateurs" });
    }
    // Récupérer les données du body
    const { body } = req;

    // Vérifier qu'il y a des données (body ou file)
    if ((!body || Object.keys(body).length === 0) && !req.file) {
      return res
        .status(400)
        .json({ message: "Pas de données dans la requête" });
    }
    // Si un fichier est uploadé, mettre à jour le champ name
    if (req.file) {
      body.name = "/uploads/accesoire/" + req.file.filename;
    }

    // Valider seulement si body n'est pas vide
    if (body && Object.keys(body).length > 0) {
      const { error } = photo_accesoireValidation(body).photo_accesoireUpdate;
      if (error) {
        // Nettoyer le fichier uploadé en cas d'erreur de validation
        if (req.file) {
          removeUploadedFile(req.file.filename);
        }
        return res.status(400).json({ message: error.details[0].message });
      }
    }

    // Récupérer l'ancienne photo pour supprimer l'ancien fichier si nécessaire
    const oldPhoto = await Photo_accesoire.findById(req.params.id);
    if (!oldPhoto) {
      // Nettoyer le nouveau fichier si la photo n'existe pas
      if (req.file) {
        removeUploadedFile(req.file.filename);
      }
      return res
        .status(404)
        .json({ message: "Photo d'accesoire n'existe pas" });
    }

    // Si on remplace l'image, supprimer l'ancienne  du serveur de fichiers
    if (req.file && oldPhoto.name) {
      removeUploadedFile(oldPhoto.name.split("/").at(-1));
    }

    // Mettre à jour la photo d'accesoire dans la base de données
    const updatedPhoto_accesoire = await Photo_accesoire.findByIdAndUpdate(
      req.params.id,
      body,
      { new: true }
    );
    return res.status(200).json({
      message: "Photo d'accesoire mise à jour avec succès",
      photo: updatedPhoto_accesoire,
    });
  } catch (error) {
    // Nettoyer le fichier en cas d'erreur serveur
    if (req.file) {
      removeUploadedFile(req.file.filename);
    }
    res.status(500).json({ message: "Erreur serveur", error: error });
  }
};

// Supprimer un fichier uploadé
const removeUploadedFile = (FilenameOrPath) => {
  try {
    // Accepte soit un chemin absolu, soit juste le nom de fichier
    const filePath = path.isAbsolute(FilenameOrPath)
      ? FilenameOrPath
      : path.join(__dirname, "../uploads/accesoire/", FilenameOrPath);
    // Vérifier l'existence du fichier avant de le supprimer
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
  } catch (err) {
    logger.error("Erreur lors de la suppression du fichier:", err);
  }
};

// Supprimer une photo d'accesoire
const deletePhoto_accesoire = async (req, res) => {
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

    // Vérifier que la photo d'accesoire existe
    const photo_accesoire = await Photo_accesoire.findById(req.params.id);
    if (!photo_accesoire) {
      return res
        .status(404)
        .json({ message: "Photo d'accesoire n'existe pas" });
    }
    // Supprimer le fichier associé si existant
    if (photo_accesoire.name) {
      removeUploadedFile(photo_accesoire.name.split("/").at(-1));
    }
    // Supprimer la photo d'accesoire de la base de données
    await photo_accesoire.deleteOne();
    return res
      .status(200)
      .json({ message: "Photo d'accesoire supprimée avec succès" });
  } catch (error) {
    res.status(500).json({ message: "Erreur serveur", error: error });
  }
};

export {
  createPhoto_accesoire,
  getAllPhoto_accesoires,
  getPhoto_accesoireById,
  updatePhoto_accesoire,
  deletePhoto_accesoire,
};
