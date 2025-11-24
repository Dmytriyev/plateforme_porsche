/**
 * Middleware d'authentification JWT
 * Vérifie le token JWT dans le header Authorization
 * Attache les informations utilisateur à req.user si valide
 */
import jwt from "jsonwebtoken";
import logger from "../utils/logger.js";

const STAFF_ROLES = ["admin", "responsable", "conseillere"];

const auth = (req, res, next) => {
  // Extraire le token du header Authorization (format: "Bearer <token>")
  const authHeader = req.headers["authorization"];
  const token = authHeader?.split(" ")[1];

  if (!token) {
    return res.status(401).json({ message: "Token manquant" });
  }

  // Vérifier la validité du token
  jwt.verify(token, process.env.SECRET_KEY, (err, user) => {
    if (err) {
      // Logger les tentatives d'authentification échouées (sécurité)
      logger.warn("Tentative d'accès avec token invalide", {
        ip: req.ip,
        path: req.path,
      });
      return res.status(403).json({ message: "Token invalide ou expiré" });
    }

    // Attacher les informations utilisateur enrichies à la requête
    req.user = {
      ...user,
      isAdmin: Boolean(user.isAdmin),
      isStaff: user.isStaff || STAFF_ROLES.includes(user.role),
    };

    next();
  });
};

export default auth;
