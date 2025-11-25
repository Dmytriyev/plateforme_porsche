// Fichier servant à gérer les routes d'authentification, le rafraîchissement des tokens.
import { Router } from "express";
import { refreshToken } from "../controllers/auth.controller.js";

const router = Router();

router.post("/refresh", refreshToken);

export default router;
