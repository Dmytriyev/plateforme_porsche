import { Router } from "express";
import {
  createTaille_jante,
  getAllTaille_jantes,
  getTaille_janteById,
  updateTaille_jante,
  deleteTaille_jante,
} from "../controllers/taille_jante.controller.js";
import { upload } from "../middlewares/multer.js";
import validateObjectId from "../middlewares/validateObjectId.js";

const router = Router();

router.post("/new", upload.single("name"), createTaille_jante);
router.get("/all", getAllTaille_jantes);
router.get("/:id", validateObjectId("id"), getTaille_janteById);
router.put("/:id", validateObjectId("id"), updateTaille_jante);
router.delete("/:id", validateObjectId("id"), deleteTaille_jante);

export default router;
