import Image from "../models/image.model.js";
import imageValidation from "../validations/image.validation.js";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const createImage = async (req, res) => {
  try {
    const { body } = req;
    if (!body) {
      if (req.file) {
        fs.unlinkSync("./uploads/" + req.file.filename);
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
        "/uploads/" +
        req.file.filename;
    }
    const { error } = imageValidation(body).imageCreate;
    if (error) {
      if (req.file) {
        fs.unlinkSync("./uploads/" + req.file.filename);
      }
      return res.status(401).json(error.details[0].message);
    }
    const image = new Image(body);
    const newImage = await image.save();
    return res.status(201).json(newImage);
  } catch (error) {
    console.log(error);
    if (req.file) {
      fs.unlinkSync("./uploads/" + req.file.filename);
    }
    res.status(500).json({ message: "Erreur serveur", error: error });
  }
};

const getAllImages = async (req, res) => {
  try {
    const images = await Image.find();
    return res.status(200).json(images);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Erreur serveur", error: error });
  }
};

const getImageById = async (req, res) => {
  try {
    const image = await Image.findById(req.params.id);
    if (!image) {
      return res.status(404).json({ message: "image n'existe pas" });
    }
    return res.status(200).json(image);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Erreur serveur", error: error });
  }
};

const deleteImage = async (req, res) => {
  try {
    const image = await Image.findById(req.params.id);
    if (!image) {
      return res.status(404).json({ message: "image n'existe pas" });
    }
    if (image.name) {
      const oldPath = path.join(
        __dirname,
        "../uploads/",
        image.name.split("/").at(-1)
      );
      if (fs.existsSync(oldPath)) {
        fs.unlinkSync(oldPath);
      }
    }
    await image.deleteOne();
    return res.status(200).json({ message: "image a été supprimé" });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Erreur serveur", error: error });
  }
};

export { createImage, getAllImages, getImageById, deleteImage };
