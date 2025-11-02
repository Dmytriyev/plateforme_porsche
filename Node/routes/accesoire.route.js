import { Router } from "express";
import {
  createAccesoire,
  getAllAccesoires,
  getAccesoireById,
  updateAccesoire,
  deleteAccesoire,
  addImages,
  removeImages,
} from "../controllers/accesoire.controller.js";
import validateObjectId from "../middlewares/validateObjectId.js";

const router = Router();

router.post("/new", createAccesoire);
router.get("/all", getAllAccesoires);
router.get("/:id", validateObjectId("id"), getAccesoireById);
router.put("/:id", validateObjectId("id"), updateAccesoire);
router.delete("/:id", validateObjectId("id"), deleteAccesoire);
router.put("/:id/images/add", validateObjectId("id"), addImages);
router.put("/:id/images/remove", validateObjectId("id"), removeImages);

export default router;
