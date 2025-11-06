// Autorise l'accès aux rôles `admin` et `responsable` uniquement.
const isResponsable = (req, res, next) => {
  const allowedRoles = ["admin", "responsable"];

  if (!req.user || !allowedRoles.includes(req.user.role)) {
    return res.status(403).json({
      message: "Accès réservé aux responsables et administrateurs",
    });
  }
  next();
};

export default isResponsable;
