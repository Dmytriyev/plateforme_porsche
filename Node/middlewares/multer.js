/*
  - Crée le dossier `uploads/` si nécessaire.
  - Renomme les fichiers avec le timestamp pour éviter collisions.
  - Filtre les types MIME image et limite la taille/nombre des fichiers (10MB, max 20 fichiers).
*/
import multer from "multer";
import path from "node:path";
import fs from "node:fs";
import { fileURLToPath } from "node:url";

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
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    const baseName = path.basename(file.originalname, ext);
    cb(null, baseName + "_" + Date.now() + ext);
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
    fileSize: 20 * 1024 * 1024,
    files: 20,
  },
});
