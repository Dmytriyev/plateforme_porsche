import Photo_accesoire from "../models/photo_accesoire.model.js";
import photo_accesoireValidation from "../validations/photo_accesoire.validation.js";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const createPhoto_accesoire = async (req, res) => {
  try {
    const { body } = req;
    if (!body || Object.keys(body).length === 0) {
      if (req.file) {
        fs.unlinkSync("./uploads/accesoire/" + req.file.filename);
      }
      return res
        .status(400)
        .json({ message: "Pas de données dans la requête" });
    }
    if (req.file) {
      body.name =
        req.protocol +
        "://" +
        req.get("host") +
        "/uploads/accesoire/" +
        req.file.filename;
    }
    const { error } = photo_accesoireValidation(body).photo_accesoireCreate;
    if (error) {
      if (req.file) {
        fs.unlinkSync("./uploads/accesoire/" + req.file.filename);
      }
      return res.status(400).json({ message: error.details[0].message });
    }
    const photo_accesoire = new Photo_accesoire(body);
    const newPhoto_accesoire = await photo_accesoire.save();
    return res.status(201).json(newPhoto_accesoire);
  } catch (error) {
    console.log(error);
    if (req.file) {
      fs.unlinkSync("./uploads/accesoire/" + req.file.filename);
    }
    res.status(500).json({ message: "Erreur serveur", error: error });
  }
};

const getAllPhoto_accesoires = async (req, res) => {
  try {
    const photo_accesoires = await Photo_accesoire.find();
    return res.status(200).json(photo_accesoires);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Erreur serveur", error: error });
  }
};

const getPhoto_accesoireById = async (req, res) => {
  try {
    const photo_accesoire = await Photo_accesoire.findById(req.params.id);
    if (!photo_accesoire) {
      return res.status(404).json({ message: "photo_accessoire n'existe pas" });
    }
    return res.status(200).json(photo_accesoire);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Erreur serveur", error: error });
  }
};

const updatePhoto_accesoire = async (req, res) => {
  try {
    const { body } = req;

    // Vérifier qu'il y a des données (body ou file)
    if ((!body || Object.keys(body).length === 0) && !req.file) {
      return res
        .status(400)
        .json({ message: "Pas de données dans la requête" });
    }

    // Si un fichier est uploadé, mettre à jour le champ name
    if (req.file) {
      body.name =
        req.protocol +
        "://" +
        req.get("host") +
        "/uploads/accesoire/" +
        req.file.filename;
    }

    // Valider seulement si body n'est pas vide
    if (body && Object.keys(body).length > 0) {
      const { error } = photo_accesoireValidation(body).photo_accesoireUpdate;
      if (error) {
        // Nettoyer le fichier uploadé en cas d'erreur de validation
        if (req.file) {
          fs.unlinkSync("./uploads/accesoire/" + req.file.filename);
        }
        return res.status(400).json({ message: error.details[0].message });
      }
    }

    // Récupérer l'ancienne photo pour supprimer l'ancien fichier si nécessaire
    const oldPhoto = await Photo_accesoire.findById(req.params.id);
    if (!oldPhoto) {
      // Nettoyer le nouveau fichier si la photo n'existe pas
      if (req.file) {
        fs.unlinkSync("./uploads/accesoire/" + req.file.filename);
      }
      return res.status(404).json({ message: "photo_accessoire n'existe pas" });
    }

    // Si on remplace l'image, supprimer l'ancienne
    if (req.file && oldPhoto.name) {
      const oldPath = path.join(
        __dirname,
        "../uploads/accesoire/",
        oldPhoto.name.split("/").at(-1)
      );
      if (fs.existsSync(oldPath)) {
        try {
          fs.unlinkSync(oldPath);
        } catch (err) {
          console.log(
            "Erreur lors de la suppression de l'ancien fichier:",
            err
          );
        }
      }
    }

    // Mettre à jour la photo
    const updatedPhoto_accesoire = await Photo_accesoire.findByIdAndUpdate(
      req.params.id,
      body,
      { new: true }
    );

    return res.status(200).json(updatedPhoto_accesoire);
  } catch (error) {
    console.log(error);
    // Nettoyer le fichier en cas d'erreur serveur
    if (req.file) {
      try {
        fs.unlinkSync("./uploads/accesoire/" + req.file.filename);
      } catch (err) {
        console.log("Erreur lors du nettoyage du fichier:", err);
      }
    }
    res.status(500).json({ message: "Erreur serveur", error: error });
  }
};

const deletePhoto_accesoire = async (req, res) => {
  try {
    const photo_accesoire = await Photo_accesoire.findById(req.params.id);
    if (!photo_accesoire) {
      return res.status(404).json({ message: "photo_accessoire n'existe pas" });
    }
    if (photo_accesoire.name) {
      const oldPath = path.join(
        __dirname,
        "../uploads/accesoire/",
        photo_accesoire.name.split("/").at(-1)
      );
      if (fs.existsSync(oldPath)) {
        fs.unlinkSync(oldPath);
      }
    }
    await photo_accesoire.deleteOne();
    return res
      .status(200)
      .json({ message: "photo_accesoire est bien supprimé" });
  } catch (error) {
    console.log(error);
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
