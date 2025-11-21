import { Router } from "express";
import {
  createDemandeContact,
  getAllDemandesContact,
  getDemandeContactById,
  updateDemandeContact,
  repondreDemandeContact,
  marquerCommeTraitee,
  getDemandesParStatut,
} from "../controllers/demande_contact.controller.js";
import auth from "../middlewares/auth.js";
import isStaff from "../middlewares/isStaff.js";
import validateObjectId from "../middlewares/validateObjectId.js";

const router = Router();

// Route publique pour créer une demande de contact
router.post("/demande", createDemandeContact);

// Routes protégées pour admin/staff
router.get("/all", auth, isStaff, getAllDemandesContact);
router.get("/statut/:statut", auth, isStaff, getDemandesParStatut);
router.get(
  "/:id",
  auth,
  isStaff,
  validateObjectId("id"),
  getDemandeContactById
);
router.patch(
  "/:id",
  auth,
  isStaff,
  validateObjectId("id"),
  updateDemandeContact
);
router.post(
  "/:id/repondre",
  auth,
  isStaff,
  validateObjectId("id"),
  repondreDemandeContact
);
router.patch(
  "/:id/traitee",
  auth,
  isStaff,
  validateObjectId("id"),
  marquerCommeTraitee
);

export default router;
