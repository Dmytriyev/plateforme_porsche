/**
 * Middleware de validation des requêtes avec express-validator
 * Retourne les erreurs de validation sous format standardisé
 */
import { validationResult } from "express-validator";
import logger from "../utils/logger.js";

export default function validateRequest(req, res, next) {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    // Logger les erreurs de validation pour le monitoring
    logger.warn("Erreur de validation", {
      path: req.path,
      errors: errors.array(),
    });

    return res.status(400).json({
      success: false,
      message: "Erreur de validation",
      errors: errors.array(),
    });
  }

  next();
}
