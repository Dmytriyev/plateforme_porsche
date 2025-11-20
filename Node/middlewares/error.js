// Middleware de gestion des erreurs globales
import { handleError } from "../utils/errorHandler.js";
import logger from "../utils/logger.js";

export default function (err, req, res, next) {
  // Log l'erreur avec contexte via le logger centralisé
  logger.error("Unhandled error in request", {
    method: req.method,
    url: req.originalUrl,
    stack: err.stack || err.message || String(err),
  });

  return handleError(res, err, `${req.method} ${req.originalUrl}`);
}
