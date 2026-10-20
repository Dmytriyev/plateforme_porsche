/**
 * Middleware d'autorisation Personnel
 * Autorise l'accès aux rôles: admin, responsable, conseillere
 */
import logger from "../utils/logger.js";

const STAFF_ROLES = ["admin", "responsable", "conseillere"];

const isStaff = (req, res, next) => {
  if (!req.user || !STAFF_ROLES.includes(req.user.role)) {
    logger.warn("Tentative d'accès staff non autorisé", {
      userId: req.user?.id,
      role: req.user?.role,
      path: req.path,
      ip: req.ip,
    });
    return res.status(403).json({
      message: "Accès réservé au personnel autorisé",
    });
  }
  next();
};

export default isStaff;
