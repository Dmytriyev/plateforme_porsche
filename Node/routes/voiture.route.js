
import { Router } from "express";
import { createVoiture, getAllVoitures, getVoitureById, updateVoiture, deleteVoiture } from "../controllers/voiture.controller.js"

const router = Router()

router.post('/new', createVoiture)
router.get('/all', getAllVoitures)
router.get('/:id', getVoitureById)
router.put('/:id', updateVoiture)
router.delete('/:id', deleteVoiture)

export default router