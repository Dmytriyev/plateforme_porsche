
import { Router } from "express";
import { createPhoto_voiture, getAllPhoto_voitures, getPhoto_voitureById, deletePhoto_voiture } from "../controllers/photo_voiture.controller.js"
import { upload } from "../middlewares/multer.js"

const router = Router()

router.post('/new', upload.single('name'), createPhoto_voiture)
router.get('/all', getAllPhoto_voitures)
router.get('/:id', getPhoto_voitureById)
router.delete('/:id', deletePhoto_voiture)

export default router