const isConseillere = (req, res, next) => {
  const allowedRoles = ["admin", "responsable", "conseillere"];

  if (!req.user || !allowedRoles.includes(req.user.role)) {
    return res.status(403).json({
      message:
        "Accès réservé aux conseillères, responsables et administrateurs",
    });
  }
  next();
};

export default isConseillere;
