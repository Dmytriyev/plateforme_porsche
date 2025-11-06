//  Autorise l'accès uniquement si l'utilisateur connecté est un admin.
const isAdmin = (req, res, next) => {
  if (!req.user?.isAdmin) {
    return res
      .status(403)
      .json({ message: "Accès réservé aux administrateurs" });
  }
  next();
};

export default isAdmin;
