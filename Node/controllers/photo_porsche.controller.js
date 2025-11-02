import Photo_porsche from "../models/photo_porsche.model.js";
import photo_porscheValidation from "../validations/photo_porsche.validation.js";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const createPhoto_porsche = async (req, res) => {
  try {
    const { body } = req;
    if (!body || Object.keys(body).length === 0) {
      if (req.file) {
        fs.unlinkSync("./uploads/model_porsche/" + req.file.filename);
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
        "/uploads/model_porsche/" +
        req.file.filename;
    }
    const { error } = photo_porscheValidation(body).photo_porscheCreate;
    if (error) {
      if (req.file) {
        fs.unlinkSync("./uploads/model_porsche/" + req.file.filename);
      }
      return res.status(400).json({ message: error.details[0].message });
    }
    const photo_porsche = new Photo_porsche(body);
    const newPhoto_porsche = await photo_porsche.save();
    return res.status(201).json(newPhoto_porsche);
  } catch (error) {
    console.log(error);
    if (req.file) {
      fs.unlinkSync("./uploads/model_porsche/" + req.file.filename);
    }
    res.status(500).json({ message: "Erreur serveur", error: error });
  }
};

const getAllPhoto_porsches = async (req, res) => {
  try {
    const photo_porsches = await Photo_porsche.find();
    return res.status(200).json(photo_porsches);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Server error", error: error });
  }
};

const getPhoto_porscheById = async (req, res) => {
  try {
    const photo_porsche = await Photo_porsche.findById(req.params.id);
    if (!photo_porsche) {
      return res.status(404).json({ message: "photo_porsche n'existe pas" });
    }
    return res.status(200).json(photo_porsche);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Server error", error: error });
  }
};

const updatePhoto_porsche = async (req, res) => {
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
        "/uploads/model_porsche/" +
        req.file.filename;
    }

    // Valider seulement si body n'est pas vide
    if (body && Object.keys(body).length > 0) {
      const { error } = photo_porscheValidation(body).photo_porscheUpdate;
      if (error) {
        // Nettoyer le fichier uploadé en cas d'erreur de validation
        if (req.file) {
          fs.unlinkSync("./uploads/model_porsche/" + req.file.filename);
        }
        return res.status(400).json({ message: error.details[0].message });
      }
    }

    // Récupérer l'ancienne photo pour supprimer l'ancien fichier si nécessaire
    const oldPhoto = await Photo_porsche.findById(req.params.id);
    if (!oldPhoto) {
      // Nettoyer le nouveau fichier si la photo n'existe pas
      if (req.file) {
        fs.unlinkSync("./uploads/model_porsche/" + req.file.filename);
      }
      return res.status(404).json({ message: "photo_porsche n'existe pas" });
    }

    // Si on remplace l'image, supprimer l'ancienne
    if (req.file && oldPhoto.name) {
      const oldPath = path.join(
        __dirname,
        "../uploads/model_porsche/",
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
    const updatedPhoto_porsche = await Photo_porsche.findByIdAndUpdate(
      req.params.id,
      body,
      { new: true }
    );

    return res.status(200).json(updatedPhoto_porsche);
  } catch (error) {
    console.log(error);
    // Nettoyer le fichier en cas d'erreur serveur
    if (req.file) {
      try {
        fs.unlinkSync("./uploads/model_porsche/" + req.file.filename);
      } catch (err) {
        console.log("Erreur lors du nettoyage du fichier:", err);
      }
    }
    res.status(500).json({ message: "Erreur serveur", error: error });
  }
};

const deletePhoto_porsche = async (req, res) => {
  try {
    const photo_porsche = await Photo_porsche.findById(req.params.id);
    if (!photo_porsche) {
      return res.status(404).json({ message: "photo_porsche n'existe pas" });
    }
    if (photo_porsche.name) {
      const oldPath = path.join(
        __dirname,
        "../uploads/model_porsche/",
        photo_porsche.name.split("/").at(-1)
      );
      if (fs.existsSync(oldPath)) {
        fs.unlinkSync(oldPath);
      }
    }
    await photo_porsche.deleteOne();
    return res.status(200).json({ message: "photo_porsche est bien supprimé" });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Erreur serveur", error: error });
  }
};

export {
  createPhoto_porsche,
  getAllPhoto_porsches,
  getPhoto_porscheById,
  updatePhoto_porsche,
  deletePhoto_porsche,
};
