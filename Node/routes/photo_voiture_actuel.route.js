import { Router } from "express";
import {
  createPhoto_voiture_actuel,
  getAllPhoto_voiture_actuels,
  getPhoto_voiture_actuelById,
  updatePhoto_voiture_actuel,
  deletePhoto_voiture_actuel,
} from "../controllers/photo_voiture_actuel.controller.js";
import { upload } from "../middlewares/multer.js";
import validateObjectId from "../middlewares/validateObjectId.js";

const router = Router();

router.post("/new", upload.single("name"), createPhoto_voiture_actuel);
router.get("/all", getAllPhoto_voiture_actuels);
router.get("/:id", validateObjectId("id"), getPhoto_voiture_actuelById);
router.put(
  "/:id",
  validateObjectId("id"),
  upload.single("name"),
  updatePhoto_voiture_actuel
);
router.delete("/:id", validateObjectId("id"), deletePhoto_voiture_actuel);

export default router;
