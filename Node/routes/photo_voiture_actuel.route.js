
import { Router } from "express";
import { createPhoto_voiture_actuel, getAllPhoto_voiture_actuels, getPhoto_voiture_actuelById, deletePhoto_voiture_actuel } from "../controllers/photo_voiture_actuel.controller.js"
import { upload } from "../middlewares/multer.js"

const router = Router()

router.post('/new', upload.single('name'), createPhoto_voiture_actuel)
router.get('/all', getAllPhoto_voiture_actuels)
router.get('/:id', getPhoto_voiture_actuelById)
router.delete('/:id', deletePhoto_voiture_actuel)

export default router