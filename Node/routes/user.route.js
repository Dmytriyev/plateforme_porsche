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
} from "../controllers/user.controller.js";
import auth from "../middlewares/auth.js";
import isAdmin from "../middlewares/isAdmin.js";
import validateObjectId from "../middlewares/validateObjectId.js";

const router = Router();

// Routes publiques - Authentification
router.post("/register", register);
router.post("/login", login);

// Routes administrateur - Nécessite authentification + droits admin
router.get("/all", getAllUsers);

// Routes utilisateur - Nécessite authentification
router.get("/:id", validateObjectId("id"), getUserById);
router.put("/:id", validateObjectId("id"), updateUser);
router.delete("/:id", validateObjectId("id"), deleteUser);
router.get("/:id/profile", validateObjectId("id"), getUserProfile);

// Gestion des réservations - Nécessite authentification
router.post("/:id/reservations", validateObjectId("id"), createUserReservation);
router.get("/:id/reservations", validateObjectId("id"), getUserReservations);
router.delete(
  "/:id/reservations/:reservationId",
  validateObjectId("id"),
  validateObjectId("reservationId"),
  deleteUserReservation
);

// Gestion des Porsches personnelles - Nécessite authentification
router.post("/:id/porsches", validateObjectId("id"), addUserPorsche);
router.get("/:id/porsches", validateObjectId("id"), getUserPorsches);
router.delete(
  "/:id/porsches/:porscheId",
  validateObjectId("id"),
  validateObjectId("porscheId"),
  deleteUserPorsche
);

export default router;
