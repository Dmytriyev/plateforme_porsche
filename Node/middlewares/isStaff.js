const isStaff = (req, res, next) => {
  const allowedRoles = ["admin", "responsable", "conseillere"];

  if (!req.user || !allowedRoles.includes(req.user.role)) {
    return res.status(403).json({
      message:
        "Accès réservé au personnel autorisé (admin, responsable, conseillère)",
    });
  }
  next();
};

export default isStaff;
