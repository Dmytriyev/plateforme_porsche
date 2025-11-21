export const USER_ROLES = {
  CLIENT: "client",
  CONSEILLER: "conseiller",
  RESPONSABLE: "responsable",
  ADMIN: "admin",
};

export const ORDER_STATUS = {
  PENDING: "en_attente",
  CONFIRMED: "confirmee",
  PAID: "payee",
  DELIVERED: "livree",
  CANCELLED: "annulee",
};

export const ERROR_MESSAGES = {
  NETWORK_ERROR: "Erreur de connexion au serveur",
  UNAUTHORIZED: "Vous devez être connecté pour accéder à cette page",
  FORBIDDEN: "Vous n'avez pas les permissions nécessaires",
  NOT_FOUND: "Ressource non trouvée",
  SERVER_ERROR: "Erreur serveur, veuillez réessayer plus tard",
  VALIDATION_ERROR: "Erreur de validation des données",
};

export const RESERVATION_DELAY = 48;
export const DEPOSIT_AMOUNT = 500;
