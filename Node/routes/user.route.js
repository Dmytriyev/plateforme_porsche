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

const router = Router();
// d'authentification
router.post("/register", register);
router.post("/login", login);
// administrateur
router.get("/all", getAllUsers);
// utilisateur
router.get("/:id", getUserById);
router.put("/:id", updateUser);
router.delete("/:id", deleteUser);
router.get("/:id/profile", getUserProfile);
// Gestion des réservations
router.post("/:id/reservations", createUserReservation);
router.get("/:id/reservations", getUserReservations);
router.delete("/:id/reservations/:reservationId", deleteUserReservation);
// Gestion des Porsches personnelles
router.post("/:id/porsches", addUserPorsche);
router.get("/:id/porsches", getUserPorsches);
router.delete("/:id/porsches/:porscheId", deleteUserPorsche);

export default router;
