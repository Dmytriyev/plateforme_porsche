/**
 * Middleware Optional Upload
 * - Permet d'accepter une requête multipart/form-data seulement si nécessaire
 * - Transforme `req.files` en `req.file` quand un seul fichier est fourni
 */
import { upload } from "./multer.js";

const optionalUpload = (req, res, next) => {
  const contentType = req.headers["content-type"];
  const isMultipart = contentType?.includes("multipart/form-data");

  if (!isMultipart) {
    return next();
  }

  return upload.any()(req, res, (err) => {
    if (err) {
      return next(err);
    }

    if (req.files?.length === 1) {
      req.file = req.files[0];
    }

    next();
  });
};

export default optionalUpload;
