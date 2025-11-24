import { Router } from "express";
import rateLimit from "express-rate-limit";
import {
  register,
  login,
  getAllUsers,
  getUserById,
  updateUser,
  updateUserRole,
  deleteUser,
  createUserReservation,
  getUserReservations,
  deleteUserReservation,
  addUserPorsche,
  getUserPorsches,
  deleteUserPorsche,
  getUserProfile,
  cancelUserReservation,
  updateUserPorsche,
  getUserDashboard,
  getAvailableUserRoles,
  getCurrentUserProfile,
  updateCurrentUserProfile,
} from "../controllers/user.controller.js";
import { body } from "express-validator";
import validateRequest from "../middlewares/validateRequest.js";
import auth from "../middlewares/auth.js";
import isAdmin from "../middlewares/isAdmin.js";
import validateObjectId from "../middlewares/validateObjectId.js";

const router = Router();

// Limiters pour les tentatives de connexion et d'inscription
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // max 10 tentatives par IP
  message: "Trop de tentatives de connexion, réessayez plus tard",
  standardHeaders: true,
  legacyHeaders: false,
});

const registerLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 heure
  max: 5, // max 5 inscriptions par IP
  message: "Trop d'inscriptions, réessayez plus tard",
  standardHeaders: true,
  legacyHeaders: false,
});

// Routes publiques
router.post(
  "/register",
  registerLimiter,
  // validators
  body("email").isEmail().withMessage("Email invalide").normalizeEmail(),
  body("password")
    .isLength({ min: 8 })
    .withMessage("Le mot de passe doit contenir au moins 8 caractères")
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])/)
    .withMessage(
      "Le mot de passe doit contenir au moins une majuscule, une minuscule, un chiffre et un caractère spécial"
    ),
  body("nom").optional().isString().trim().escape(),
  body("prenom").optional().isString().trim().escape(),
  validateRequest,
  register
);
router.post(
  "/login",
  loginLimiter,
  body("email").isEmail().withMessage("Email invalide").normalizeEmail(),
  body("password").exists().withMessage("Mot de passe requis"),
  validateRequest,
  login
);

// Routes admin
router.get("/all", auth, isAdmin, getAllUsers);
router.get("/roles", auth, isAdmin, getAvailableUserRoles);
router.put("/role/:id", auth, isAdmin, validateObjectId("id"), updateUserRole);

// Routes utilisateur - Routes spécifiques AVANT les routes génériques avec :id
// Profil de l'utilisateur connecté (sans ID)
router.get("/profile", auth, getCurrentUserProfile);
router.patch("/profile", auth, updateCurrentUserProfile);
router.get("/profile/:id", auth, validateObjectId("id"), getUserProfile);

// Routes génériques avec ID (doivent être APRÈS les routes spécifiques)
router.get("/:id", auth, validateObjectId("id"), getUserById);
router.put("/update/:id", auth, validateObjectId("id"), updateUser);
router.delete("/delete/:id", auth, validateObjectId("id"), deleteUser);
router.get("/dashboard/:id", auth, validateObjectId("id"), getUserDashboard);
// Gestion des réservations
router.post(
  "/reservations/new/:id",
  auth,
  validateObjectId("id"), //id utilisateur
  createUserReservation
);
router.get(
  "/reservations/:id",
  auth,
  validateObjectId("id"), //id utilisateur
  getUserReservations
);
router.patch(
  "/cancel/reservations/:id/:reservationId",
  auth,
  validateObjectId("id"), //id utilisateur
  validateObjectId("reservationId"), //id réservation
  cancelUserReservation
);
router.delete(
  "/delete/reservations/:id/:reservationId",
  auth,
  validateObjectId("id"), //id utilisateur
  validateObjectId("reservationId"), //id réservation
  deleteUserReservation
);
// Gestion des voitures actuellles
router.post("/porsches/new/:id", auth, validateObjectId("id"), addUserPorsche);
router.get("/porsches/:id", auth, validateObjectId("id"), getUserPorsches);
router.patch(
  "/update/porsches/:id/:porscheId",
  auth,
  validateObjectId("id"), //id utilisateur
  validateObjectId("porscheId"), //id porsche
  updateUserPorsche
);
router.delete(
  "/delete/porsches/:id/:porscheId",
  auth,
  validateObjectId("id"), //id utilisateur
  validateObjectId("porscheId"), //id porsche
  deleteUserPorsche
);

export default router;
