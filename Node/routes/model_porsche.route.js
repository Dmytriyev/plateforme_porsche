
import { Router } from "express";
import { createModel_porsche, getAllModel_porsches, getModel_porscheById, updateModel_porsche, deleteModel_porsche } from "../controllers/model_porsche.controller.js"

const router = Router()

router.post('/new', createModel_porsche)
router.get('/all', getAllModel_porsches)
router.get('/:id', getModel_porscheById)
router.put('/:id', updateModel_porsche)
router.delete('/:id', deleteModel_porsche)

export default router