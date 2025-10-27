
import { Router } from "express";
import { createPhoto_accesoire, getAllPhoto_accesoires, getPhoto_accesoireById, deletePhoto_accesoire } from "../controllers/photo_accesoire.controller.js"
import { upload } from "../middlewares/multer.js"

const router = Router()

router.post('/new', upload.single('name'), createPhoto_accesoire)
router.get('/all', getAllPhoto_accesoires)
router.get('/:id', getPhoto_accesoireById)
router.delete('/:id', deletePhoto_accesoire)

export default router