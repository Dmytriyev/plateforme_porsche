/**
 * Middleware d'autorisation Personnel
 * Autorise l'accès aux rôles: admin, responsable, conseillere
 */
const STAFF_ROLES = ["admin", "responsable", "conseillere"];

const isStaff = (req, res, next) => {
  if (!req.user || !STAFF_ROLES.includes(req.user.role)) {
    return res.status(403).json({
      message: "Accès réservé au personnel autorisé",
    });
  }
  next();
};

export default isStaff;
