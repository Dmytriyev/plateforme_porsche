import { Router } from "express";
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
} from "../controllers/user.controller.js";
import auth from "../middlewares/auth.js";
import isAdmin from "../middlewares/isAdmin.js";
import validateObjectId from "../middlewares/validateObjectId.js";

const router = Router();

// Routes publiques
router.post("/register", register);
router.post("/login", login);

// Routes admin
router.get("/all", auth, isAdmin, getAllUsers);
router.get("/roles", auth, isAdmin, getAvailableUserRoles);
router.put("/role/:id", auth, isAdmin, validateObjectId("id"), updateUserRole);

// Routes utilisateur
router.get("/:id", auth, validateObjectId("id"), getUserById);
router.put("/update/:id", auth, validateObjectId("id"), updateUser);
router.delete("/delete/:id", auth, validateObjectId("id"), deleteUser);
// Profil
router.get("/profile/:id", auth, validateObjectId("id"), getUserProfile);
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
