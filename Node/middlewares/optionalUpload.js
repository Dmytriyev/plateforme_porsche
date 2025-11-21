/**
 * Middleware optionnel pour gérer les uploads multipart/form-data
 * Utilise multer uniquement si le Content-Type est multipart/form-data
 * Sinon, passe au middleware suivant
 */
import { upload } from "./multer.js";

/**
 * Middleware qui détecte et parse multipart/form-data
 * Remplit req.body avec les champs textuels et req.files avec les fichiers
 */
const optionalUpload = (req, res, next) => {
  const contentType = req.headers["content-type"];
  const isMultipart = contentType?.includes("multipart/form-data");

  // Si ce n'est pas multipart, passer au suivant
  if (!isMultipart) {
    return next();
  }

  // Utiliser multer pour parser multipart/form-data
  return upload.any()(req, res, (err) => {
    if (err) {
      return next(err);
    }

    // Normaliser: si un seul fichier, exposer aussi req.file
    if (req.files?.length === 1) {
      req.file = req.files[0];
    }

    next();
  });
};

export default optionalUpload;
