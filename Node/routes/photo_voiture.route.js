import { Router } from "express";
import {
  createPhoto_voiture,
  getAllPhoto_voitures,
  getPhoto_voitureById,
  updatePhoto_voiture,
  deletePhoto_voiture,
  getPhotosByCriteria,
} from "../controllers/photo_voiture.controller.js";
import { upload } from "../middlewares/multer.js";
import validateObjectId from "../middlewares/validateObjectId.js";

const router = Router();

router.post("/new", upload.single("name"), createPhoto_voiture);
router.get("/all", getAllPhoto_voitures);
router.get("/search", getPhotosByCriteria);
router.get("/:id", validateObjectId("id"), getPhoto_voitureById);
router.put(
  "/:id",
  validateObjectId("id"),
  upload.single("name"),
  updatePhoto_voiture
);
router.delete("/:id", validateObjectId("id"), deletePhoto_voiture);

export default router;
