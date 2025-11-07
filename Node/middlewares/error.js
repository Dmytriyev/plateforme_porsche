// Middleware de gestion des erreurs globales
import { error as logError } from "../utils/logger.js";
import { handleError } from "../utils/errorHandler.js";
// Middleware de gestion des erreurs globales
export default function (err, req, res, next) {
  // Log l'erreur avec contexte
  logError("Unhandled error in request", {
    method: req.method,
    url: req.originalUrl,
    stack: err.stack || err.message || String(err),
  });

  return handleError(res, err, `${req.method} ${req.originalUrl}`);
}
