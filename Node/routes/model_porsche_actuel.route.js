import { Router } from "express";
import {
  createModel_porsche_actuel,
  getAllModel_porsche_actuels,
  getModel_porsche_actuelById,
  updateModel_porsche_actuel,
  deleteModel_porsche_actuel,
  addImages,
  removeImages,
} from "../controllers/model_porsche_actuel.controller.js";
import validateObjectId from "../middlewares/validateObjectId.js";

const router = Router();

router.post("/new", createModel_porsche_actuel);
router.get("/all", getAllModel_porsche_actuels);
router.get("/:id", validateObjectId("id"), getModel_porsche_actuelById);
router.put("/:id", validateObjectId("id"), updateModel_porsche_actuel);
router.delete("/:id", validateObjectId("id"), deleteModel_porsche_actuel);
router.put("/:id/addImages", validateObjectId("id"), addImages);
router.put("/:id/deleteImages", validateObjectId("id"), removeImages);

export default router;
