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
// Routes pour les réservations (préfixe: /api/reservation)
// GET  /check/:voitureId        : public — Vérifier disponibilités sur une voiture
router.get(
  "/check/:voitureId",
  validateObjectId("voitureId"),
  checkReservations
);

// GET  /all                     : admin — Récupérer toutes les réservations
router.get("/all", auth, isAdmin, getAllReservations);
// GET  /voiture/:voitureId      : admin — Réservations d'une voiture spécifique
router.get(
  "/voiture/:voitureId",
  auth,
  isAdmin,
  validateObjectId("voitureId"),
  getReservationsByVoiture
);

// GET  /user/:userId            : auth — Réservations d'un utilisateur
router.get(
  "/user/:userId",
  auth,
  validateObjectId("userId"),
  getReservationsByUser
);
// POST /new                     : auth — Créer une nouvelle réservation
router.post("/new", auth, createReservation);
// GET  /:id                     : auth — Détails d'une réservation
router.get("/:id", auth, validateObjectId("id"), getReservationById);
// PUT  /update/:id              : auth — Mettre à jour une réservation
router.put("/update/:id", auth, validateObjectId("id"), updateReservation);
// DELETE /delete/:id            : auth — Supprimer une réservation
router.delete("/delete/:id", auth, validateObjectId("id"), deleteReservation);

// PATCH /:id/accepter           : staff — Accepter une réservation
router.patch(
  "/:id/accepter",
  auth,
  isStaff,
  validateObjectId("id"),
  accepterReservation
);
// PATCH /:id/refuser            : staff — Refuser une réservation
router.patch(
  "/:id/refuser",
  auth,
  isStaff,
  validateObjectId("id"),
  refuserReservation
);

export default router;
