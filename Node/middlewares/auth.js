/**
 * Middleware d'authentification JWT
 * Vérifie le token JWT dans le header Authorization
 * Attache les informations utilisateur à req.user si valide
 */
import jwt from "jsonwebtoken";

const STAFF_ROLES = ["admin", "responsable", "conseillere"];

const auth = (req, res, next) => {
  // Extraire le token du header Authorization
  const authHeader = req.headers["authorization"];
  const token = authHeader?.split(" ")[1];

  if (!token) {
    return res.status(401).json({ message: "Token manquant" });
  }

  jwt.verify(token, process.env.SECRET_KEY, (err, user) => {
    if (err) {
      return res.status(403).json({ message: "Token invalide" });
    }

    // Attacher les informations utilisateur à la requête
    req.user = {
      ...user,
      isAdmin: Boolean(user.isAdmin),
      isStaff: user.isStaff || STAFF_ROLES.includes(user.role),
    };

    next();
  });
};

export default auth;
