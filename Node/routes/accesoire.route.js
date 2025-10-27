
import { Router } from "express";
import { createAccesoire, getAllAccesoires, getAccesoireById, updateAccesoire, deleteAccesoire } from "../controllers/accesoire.controller.js"

const router = Router()

router.post('/new', createAccesoire)
router.get('/all', getAllAccesoires)
router.get('/:id', getAccesoireById)
router.put('/:id', updateAccesoire)
router.delete('/:id', deleteAccesoire)

export default router