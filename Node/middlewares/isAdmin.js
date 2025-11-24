/**
 * Middleware d'autorisation Admin
 * Vérifie que l'utilisateur authentifié a les droits d'administrateur
 */
import logger from "../utils/logger.js";

const isAdmin = (req, res, next) => {
  if (!req.user?.isAdmin) {
    logger.warn("Tentative d'accès admin non autorisé", {
      userId: req.user?.id,
      path: req.path,
      ip: req.ip,
    });
    return res
      .status(403)
      .json({ message: "Accès réservé aux administrateurs" });
  }
  next();
};

export default isAdmin;
