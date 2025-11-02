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
import validateObjectId from "../middlewares/validateObjectId.js";

const router = Router();

router.post("/new", createReservation);
router.get("/all", getAllReservations);
router.get("/:id", validateObjectId("id"), getReservationById);
router.put("/:id", validateObjectId("id"), updateReservation);
router.delete("/:id", validateObjectId("id"), deleteReservation);
router.get("/user/:userId", validateObjectId("userId"), getReservationsByUser);
router.get(
  "/voiture/:voitureId",
  validateObjectId("voitureId"),
  getReservationsByVoiture
);
router.get(
  "/disponibilite/:voitureId",
  validateObjectId("voitureId"),
  checkReservations
);

export default router;
