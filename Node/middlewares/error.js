/**
 * Middleware de gestion des erreurs globales
 * Centralise la gestion des erreurs non capturées dans les routes
 */
import { handleError } from "../utils/errorHandler.js";
import logger from "../utils/logger.js";

export default function errorMiddleware(err, req, res, next) {
  // Log l'erreur avec contexte complet pour debugging
  logger.error("Erreur non gérée dans la requête", {
    method: req.method,
    url: req.originalUrl,
    ip: req.ip,
    error: err.message,
    stack: process.env.NODE_ENV === "development" ? err.stack : undefined,
  });

  // Déléguer la gestion de la réponse au handler centralisé
  return handleError(res, err, `${req.method} ${req.originalUrl}`);
}
