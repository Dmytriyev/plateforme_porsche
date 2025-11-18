/**
 * Constantes globales de l'application
 */

// Couleurs Porsche officielles
export const COLORS = {
  PORSCHE_BLACK: '#000000',
  PORSCHE_RED: '#d5001c',
  PORSCHE_GOLD: '#c0a062',
  WHITE: '#ffffff',
  GRAY_50: '#f9fafb',
  GRAY_100: '#f3f4f6',
  GRAY_200: '#e5e7eb',
  GRAY_300: '#d1d5db',
  GRAY_400: '#9ca3af',
  GRAY_500: '#6b7280',
  GRAY_600: '#4b5563',
  GRAY_700: '#374151',
  GRAY_800: '#1f2937',
  GRAY_900: '#111827',
};

// Rôles utilisateurs
export const USER_ROLES = {
  CLIENT: 'client',
  CONSEILLER: 'conseiller',
  RESPONSABLE: 'responsable',
  ADMIN: 'admin',
};

// Types de voitures
export const CAR_TYPES = {
  NEW: true,
  USED: false,
};

// Statuts de commande
export const ORDER_STATUS = {
  PENDING: 'en_attente',
  CONFIRMED: 'confirmee',
  PAID: 'payee',
  DELIVERED: 'livree',
  CANCELLED: 'annulee',
};

// Statuts de réservation
export const RESERVATION_STATUS = {
  PENDING: 'en_attente',
  CONFIRMED: 'confirmee',
  CANCELLED: 'annulee',
  EXPIRED: 'expiree',
};

// Messages d'erreur
export const ERROR_MESSAGES = {
  NETWORK_ERROR: 'Erreur de connexion au serveur',
  UNAUTHORIZED: 'Vous devez être connecté pour accéder à cette page',
  FORBIDDEN: 'Vous n\'avez pas les permissions nécessaires',
  NOT_FOUND: 'Ressource non trouvée',
  SERVER_ERROR: 'Erreur serveur, veuillez réessayer plus tard',
  VALIDATION_ERROR: 'Erreur de validation des données',
};

// Messages de succès
export const SUCCESS_MESSAGES = {
  LOGIN: 'Connexion réussie',
  REGISTER: 'Inscription réussie',
  LOGOUT: 'Déconnexion réussie',
  UPDATE_PROFILE: 'Profil mis à jour',
  ADD_TO_CART: 'Article ajouté au panier',
  ORDER_CREATED: 'Commande créée avec succès',
  RESERVATION_CREATED: 'Réservation créée avec succès',
};

// Délai de réservation (en heures)
export const RESERVATION_DELAY = 48;

// Montant de l'acompte pour voiture neuve (en euros)
export const DEPOSIT_AMOUNT = 500;

// Pagination
export const ITEMS_PER_PAGE = 12;

// Durées d'animation (en millisecondes)
export const ANIMATION_DURATION = {
  FAST: 150,
  NORMAL: 300,
  SLOW: 500,
};

// Breakpoints responsive (correspond à Tailwind)
export const BREAKPOINTS = {
  SM: 640,
  MD: 768,
  LG: 1024,
  XL: 1280,
  '2XL': 1536,
};

// Routes de l'application
export const ROUTES = {
  HOME: '/',
  LOGIN: '/login',
  REGISTER: '/register',
  VOITURES: '/voitures',
  VOITURE_DETAIL: '/voitures/:id',
  ACCESSOIRES: '/accessoires',
  ACCESSOIRE_DETAIL: '/accessoires/:id',
  PANIER: '/panier',
  COMMANDE: '/commande',
  MON_COMPTE: '/mon-compte',
  MES_COMMANDES: '/mes-commandes',
  MES_RESERVATIONS: '/mes-reservations',
  MA_VOITURE: '/ma-voiture',
  CONFIGURATEUR: '/configurateur/:id',
  ADMIN: '/admin',
  ADMIN_VOITURES: '/admin/voitures',
  ADMIN_ACCESSOIRES: '/admin/accessoires',
  ADMIN_UTILISATEURS: '/admin/utilisateurs',
  ADMIN_COMMANDES: '/admin/commandes',
};

// Modèles Porsche
export const PORSCHE_MODELS = {
  911: '911',
  718: '718',
  TAYCAN: 'Taycan',
  PANAMERA: 'Panamera',
  MACAN: 'Macan',
  CAYENNE: 'Cayenne',
};

export default {
  COLORS,
  USER_ROLES,
  CAR_TYPES,
  ORDER_STATUS,
  RESERVATION_STATUS,
  ERROR_MESSAGES,
  SUCCESS_MESSAGES,
  RESERVATION_DELAY,
  DEPOSIT_AMOUNT,
  ITEMS_PER_PAGE,
  ANIMATION_DURATION,
  BREAKPOINTS,
  ROUTES,
  PORSCHE_MODELS,
};

