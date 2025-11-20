// Constantes et utilitaires pour la gestion sécurisée des fichiers uploadés
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import logger from "./logger.js";

// Pour obtenir le nom du fichier courant
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Supprime un fichier d'upload en toute sécurité
export const removeUploadedFile = (FilenameOrPath, subFolder = "") => {
  try {
    // Accepte soit un chemin absolu, soit juste le nom de fichier
    let filePath;
    // Déterminer le chemin du fichier à supprimer
    if (path.isAbsolute(FilenameOrPath)) {
      filePath = FilenameOrPath;
    } else if (subFolder) {
      // Si un sous-dossier est spécifié, l'utiliser
      filePath = path.join(
        __dirname,
        `../uploads/${subFolder}/`,
        FilenameOrPath
      );
    } else {
      // Sinon, utiliser le dossier uploads racine
      filePath = path.join(__dirname, "../uploads/", FilenameOrPath);
    }
    // Vérifier l'existence du fichier avant de le supprimer
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
  } catch (err) {
    // On ne remonte pas l'erreur depuis l'effacement de fichier
    logger.warn(`Échec suppression fichier: ${FilenameOrPath}`, err.message);
  }
};
