// Vérifie la présence et la validité d'un token JWT dans Authorization. Si valide, attache req.user.
import jwt from "jsonwebtoken";

const auth = (req, res, next) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];
  if (!token) {
    return res.status(401).json({ message: "Missing token" });
  }
  jwt.verify(token, process.env.SECRET_KEY, (err, user) => {
    if (err) return res.status(403).json({ message: "Invalid token" });
    // Attacher les informations décodées et des flags pratiques
    req.user = user;
    // Flag isAdmin peut être présent dans le token; garantir un booléen
    req.user.isAdmin = Boolean(req.user.isAdmin);
    // Déterminer isStaff d'après le rôle si non fourni
    const staffRoles = ["admin", "responsable", "conseillere"];
    req.user.isStaff = req.user.isStaff || staffRoles.includes(req.user.role);
    next();
  });
};
export default auth;
