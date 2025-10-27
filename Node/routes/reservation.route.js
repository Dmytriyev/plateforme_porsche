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

const router = Router();

router.post("/new", createReservation);
router.get("/all", getAllReservations);
router.get("/:id", getReservationById);
router.put("/:id", updateReservation);
router.delete("/:id", deleteReservation);
router.get("/user/:userId", getReservationsByUser);
router.get("/voiture/:voitureId", getReservationsByVoiture);
router.get("/disponibilite/:voitureId", checkReservations);

export default router;
