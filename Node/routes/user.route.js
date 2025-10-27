
import { Router } from "express";
import { 
  register, 
  login, 
  getAllUsers, 
  getUserById, 
  updateUser, 
  deleteUser,
  createUserReservation,
  getUserReservations,
  deleteUserReservation,
  addUserPorsche,
  getUserPorsches,
  deleteUserPorsche,
  getUserProfile
} from "../controllers/user.controller.js";
import auth from "../middlewares/auth.js";

const router = Router();

// Routes d'authentification (publiques)
router.post('/register', register);
router.post('/login', login);

// Routes administratives (protégées)
router.get('/all', auth, getAllUsers);

// Routes utilisateur (publiques pour certaines, protégées pour d'autres)
router.get('/:id', getUserById);
router.put('/:id', auth, updateUser);
router.delete('/:id', auth, deleteUser);

// Nouvelles routes pour les fonctionnalités utilisateur
router.get('/:id/profile', getUserProfile); // Profil complet

// Gestion des réservations
router.post('/:id/reservations', auth, createUserReservation); // Créer une réservation
router.get('/:id/reservations', getUserReservations); // Voir les réservations
router.delete('/:id/reservations/:reservationId', auth, deleteUserReservation); // Supprimer une réservation

// Gestion des Porsches personnelles
router.post('/:id/porsches', auth, addUserPorsche); // Ajouter une Porsche personnelle
router.get('/:id/porsches', getUserPorsches); // Voir les Porsches
router.delete('/:id/porsches/:porscheId', auth, deleteUserPorsche); // Supprimer une Porsche

export default router;