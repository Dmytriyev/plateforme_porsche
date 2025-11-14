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

// Routes publiques
router.get(
  "/check/:voitureId",
  validateObjectId("voitureId"),
  checkReservations
);

// Routes admin
router.get("/all", auth, isAdmin, getAllReservations);
router.get(
  "/voiture/:voitureId",
  auth,
  isAdmin,
  validateObjectId("voitureId"), //id voiture
  getReservationsByVoiture
);

// Routes utilisateur - userId
router.get(
  "/user/:userId",
  auth,
  validateObjectId("userId"), //id utilisateur
  getReservationsByUser
);

// Routes utilisateur - :id réservation
router.post("/new", auth, createReservation);
router.get("/:id", auth, validateObjectId("id"), getReservationById);
router.put("/update/:id", auth, validateObjectId("id"), updateReservation);
router.delete("/delete/:id", auth, validateObjectId("id"), deleteReservation);

export default router;
