import { Router } from "express";
import {
  createPhoto_porsche,
  getAllPhoto_porsches,
  getPhoto_porscheById,
  updatePhoto_porsche,
  deletePhoto_porsche,
} from "../controllers/photo_porsche.controller.js";
import { upload } from "../middlewares/multer.js";
import validateObjectId from "../middlewares/validateObjectId.js";

const router = Router();

router.post("/new", upload.single("name"), createPhoto_porsche);
router.get("/all", getAllPhoto_porsches);
router.get("/:id", validateObjectId("id"), getPhoto_porscheById);
router.put(
  "/:id",
  validateObjectId("id"),
  upload.single("name"),
  updatePhoto_porsche
);
router.delete("/:id", validateObjectId("id"), deletePhoto_porsche);

export default router;
