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
} from "../controllers/reservation.controller.js";
import auth from "../middlewares/auth.js";
import isAdmin from "../middlewares/isAdmin.js";
import validateObjectId from "../middlewares/validateObjectId.js";

const router = Router();

// Routes publiques (consultation disponibilité)
router.get(
  "/disponibilite/:voitureId",
  validateObjectId("voitureId"),
  checkReservations
);

// Routes protégées - nécessitent authentification
router.post("/new", auth, createReservation);
router.get("/:id", auth, validateObjectId("id"), getReservationById);
router.put("/:id", auth, validateObjectId("id"), updateReservation);
router.delete("/:id", auth, validateObjectId("id"), deleteReservation);
router.get(
  "/user/:userId",
  auth,
  validateObjectId("userId"),
  getReservationsByUser
);

// Routes admin
router.get("/all", auth, isAdmin, getAllReservations);
router.get(
  "/voiture/:voitureId",
  auth,
  isAdmin,
  validateObjectId("voitureId"),
  getReservationsByVoiture
);

export default router;
