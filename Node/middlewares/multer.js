/**
 * Middleware Upload (multer)
 * - Gère le stockage des fichiers uploadés, la validation des types et la
 *   structure des dossiers `uploads/` pour différentes ressources (voiture, accesoire, etc.).
 */
import { fileURLToPath } from "node:url";
import fs from "node:fs";
import multer from "multer";
import path from "node:path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
// Créer le dossier de téléchargement s'il n'existe pas
const uploadDir = path.join(__dirname, "../uploads/");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}
// Configuration du stockage des fichiers
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    // Mapper les chemins aux sous-dossiers (plus maintenable)
    const routeToFolder = {
      photo_accesoire: "accesoire",
      photo_porsche: "model_porsche",
      photo_voiture_actuel: "voiture_actuel",
      photo_voiture: "voiture",
      couleur_exterieur: "couleur_exterieur",
      couleur_interieur: "couleur_interieur",
      couleur_accesoire: "couleur_accesoire",
      taille_jante: "taille_jante",
      siege: "siege",
      package: "package",
    };

    // Trouver le sous-dossier basé sur le baseUrl ou le path
    const subFolder =
      Object.keys(routeToFolder).find(
        (key) => req.baseUrl.includes(key) || req.path.includes(key)
      ) || "";

    const destinationFolder = routeToFolder[subFolder] || "";

    // Créer le sous-dossier s'il n'existe pas
    const destinationPath = destinationFolder
      ? path.join(uploadDir, destinationFolder)
      : uploadDir;
    if (!fs.existsSync(destinationPath)) {
      fs.mkdirSync(destinationPath, { recursive: true });
    }
    // Retourner le chemin de destination
    cb(null, destinationPath);
  },
  // Nommer le fichier de manière unique
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    const baseName = path.basename(file.originalname, ext);

    // Sanitiser le nom de fichier (caractères invalides et espaces)
    const MAX_NAME_LENGTH = 50;
    const sanitizedName = baseName
      .replace(/[:/\\?*|"<>\s+]/g, "-")
      .substring(0, MAX_NAME_LENGTH);

    // Générer un nom unique avec timestamp
    cb(null, `${sanitizedName}_${Date.now()}${ext}`);
  },
});
// Filtrer les types de fichiers autorisés (images uniquement)
const fileFilter = (req, file, cb) => {
  const allowedMimeTypes = [
    "image/jpeg",
    "image/jpg",
    "image/webp",
    "image/avif",
    "image/png",
  ];
  if (allowedMimeTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error("Type de fichier non autorisé"), false);
  }
};
// Limiter la taille des fichiers à 20MB et le nombre de fichiers à 20
export const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 50 * 1024 * 1024,
    files: 25,
  },
});
