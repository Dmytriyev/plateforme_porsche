// Telechargement des fichiers avec multer
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
    // Déterminer le sous-dossier basé sur le chemin de la route
    let subFolder = "";

    if (
      // uploader pour accesoires
      req.path.includes("photo_accesoire") ||
      req.baseUrl.includes("photo_accesoire")
    ) {
      // ajouter sur ce sous-dossier
      subFolder = "accesoire";
    } else if (
      req.path.includes("photo_porsche") ||
      req.baseUrl.includes("photo_porsche")
    ) {
      subFolder = "model_porsche";
    } else if (
      req.path.includes("photo_voiture_actuel") ||
      req.baseUrl.includes("photo_voiture_actuel")
    ) {
      subFolder = "voiture_actuel";
    } else if (
      req.path.includes("photo_voiture") ||
      req.baseUrl.includes("photo_voiture")
    ) {
      subFolder = "voiture";
    } else if (req.baseUrl.includes("couleur_exterieur")) {
      subFolder = "couleur_exterieur";
    } else if (req.baseUrl.includes("couleur_interieur")) {
      subFolder = "couleur_interieur";
    } else if (req.baseUrl.includes("couleur_accesoire")) {
      subFolder = "couleur_accesoire";
    } else if (req.baseUrl.includes("taille_jante")) {
      subFolder = "taille_jante";
    } else if (req.baseUrl.includes("siege")) {
      subFolder = "siege";
    } else if (req.baseUrl.includes("package")) {
      subFolder = "package";
    }

    // Créer le sous-dossier s'il n'existe pas
    const destinationPath = subFolder
      ? path.join(uploadDir, subFolder)
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
    // Sanitiser le nom de fichier pour éviter les caractères invalides sur macOS
    let sanitizedName = baseName.replace(/[:/\\?*|"<>]/g, "-");
    // Remplacer espaces et autres caractères problématiques
    sanitizedName = sanitizedName.replace(/\s+/g, "-").replace(/\+/g, "-");

    // Limiter la longueur pour éviter ENAMETOOLONG (max 50 caractères pour le nom de base)
    const MAX_NAME_LENGTH = 50;
    if (sanitizedName.length > MAX_NAME_LENGTH) {
      sanitizedName = sanitizedName.substring(0, MAX_NAME_LENGTH);
    }

    cb(null, sanitizedName + "_" + Date.now() + ext);
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
