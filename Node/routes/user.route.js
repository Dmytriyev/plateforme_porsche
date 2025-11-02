import { Router } from "express";
import {
  register,
  login,
  getAllUsers,
  getUserById,
  updateUser,
  deleteUser,
  createUserReservation,
  getUserReservations,
  deleteUserReservation,
  addUserPorsche,
  getUserPorsches,
  deleteUserPorsche,
  getUserProfile,
  getUserStatistiques,
  cancelUserReservation,
  updateUserPorsche,
  getUserDashboard,
} from "../controllers/user.controller.js";
import auth from "../middlewares/auth.js";
import isAdmin from "../middlewares/isAdmin.js";
import validateObjectId from "../middlewares/validateObjectId.js";

const router = Router();

// Routes publiques - Authentification
router.post("/register", register);
router.post("/login", login);

// Routes administrateur - Nécessite authentification + droits admin
router.get("/all", auth, isAdmin, getAllUsers);

// Routes utilisateur - Nécessite authentification
router.get("/:id", auth, validateObjectId("id"), getUserById);
router.put("/:id", auth, validateObjectId("id"), updateUser);
router.delete("/:id", auth, validateObjectId("id"), deleteUser);
router.get("/:id/profile", auth, validateObjectId("id"), getUserProfile);
router.get(
  "/:id/statistiques",
  auth,
  validateObjectId("id"),
  getUserStatistiques
);
router.get("/:id/dashboard", auth, validateObjectId("id"), getUserDashboard);

// Gestion des réservations - Nécessite authentification
router.post(
  "/:id/reservations",
  auth,
  validateObjectId("id"),
  createUserReservation
);
router.get(
  "/:id/reservations",
  auth,
  validateObjectId("id"),
  getUserReservations
);
router.put(
  "/:id/reservations/:reservationId/cancel",
  auth,
  validateObjectId("id"),
  validateObjectId("reservationId"),
  cancelUserReservation
);
router.delete(
  "/:id/reservations/:reservationId",
  auth,
  validateObjectId("id"),
  validateObjectId("reservationId"),
  deleteUserReservation
);

// Gestion des Porsches personnelles - Nécessite authentification
router.post("/:id/porsches", auth, validateObjectId("id"), addUserPorsche);
router.get("/:id/porsches", auth, validateObjectId("id"), getUserPorsches);
router.put(
  "/:id/porsches/:porscheId",
  auth,
  validateObjectId("id"),
  validateObjectId("porscheId"),
  updateUserPorsche
);
router.delete(
  "/:id/porsches/:porscheId",
  auth,
  validateObjectId("id"),
  validateObjectId("porscheId"),
  deleteUserPorsche
);

export default router;
