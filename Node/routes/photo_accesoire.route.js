import { Router } from "express";
import {
  createPhoto_accesoire,
  getAllPhoto_accesoires,
  getPhoto_accesoireById,
  updatePhoto_accesoire,
  deletePhoto_accesoire,
} from "../controllers/photo_accesoire.controller.js";
import { upload } from "../middlewares/multer.js";
import validateObjectId from "../middlewares/validateObjectId.js";

const router = Router();

router.post("/new", upload.single("name"), createPhoto_accesoire);
router.get("/all", getAllPhoto_accesoires);
router.get("/:id", validateObjectId("id"), getPhoto_accesoireById);
router.put(
  "/:id",
  validateObjectId("id"),
  upload.single("name"),
  updatePhoto_accesoire
);
router.delete("/:id", validateObjectId("id"), deletePhoto_accesoire);

export default router;
