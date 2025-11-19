// Middleware de gestion des erreurs globales
import { handleError } from "../utils/errorHandler.js";
export default function (err, req, res, next) {
  // Log l'erreur avec contexte (utilise console)
  console.error("Unhandled error in request", {
    method: req.method,
    url: req.originalUrl,
    stack: err.stack || err.message || String(err),
  });

  return handleError(res, err, `${req.method} ${req.originalUrl}`);
}
