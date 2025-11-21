import { Router } from "express";
import {
  createReservation,
  getAllReservations,
  getReservationById,
  updateReservation,
  deleteReservation,
  getReservationsByUser,
  getReservationsByVoiture,
  checkReservations,
  accepterReservation,
  refuserReservation,
} from "../controllers/reservation.controller.js";
import auth from "../middlewares/auth.js";
import isAdmin from "../middlewares/isAdmin.js";
import isStaff from "../middlewares/isStaff.js";
import validateObjectId from "../middlewares/validateObjectId.js";

const router = Router();

// ============================================
// ROUTES PUBLIQUES
// ============================================
router.get(
  "/check/:voitureId",
  validateObjectId("voitureId"),
  checkReservations
);

// ============================================
// ROUTES ADMIN
// ============================================
router.get("/all", auth, isAdmin, getAllReservations);
router.get(
  "/voiture/:voitureId",
  auth,
  isAdmin,
  validateObjectId("voitureId"),
  getReservationsByVoiture
);

// ============================================
// ROUTES UTILISATEUR
// ============================================
router.get(
  "/user/:userId",
  auth,
  validateObjectId("userId"),
  getReservationsByUser
);
router.post("/new", auth, createReservation);
router.get("/:id", auth, validateObjectId("id"), getReservationById);
router.put("/update/:id", auth, validateObjectId("id"), updateReservation);
router.delete("/delete/:id", auth, validateObjectId("id"), deleteReservation);

// Routes staff - Gestion des réservations
router.patch(
  "/:id/accepter",
  auth,
  isStaff,
  validateObjectId("id"),
  accepterReservation
);
router.patch(
  "/:id/refuser",
  auth,
  isStaff,
  validateObjectId("id"),
  refuserReservation
);

export default router;
