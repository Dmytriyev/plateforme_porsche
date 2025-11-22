// Définition des rôles utilisateur et des permissions associées.
export const USER_ROLES = {
  USER: "user",
  RESPONSABLE: "responsable",
  CONSEILLERE: "conseillere",
  ADMIN: "admin",
};

// Liste des rôles sous forme de tableau
export const AVAILABLE_ROLES = Object.values(USER_ROLES);

// Rôle par défaut pour les nouveaux users
export const DEFAULT_ROLE = USER_ROLES.USER;

// vérifier si un rôle est valide
export const isValidRole = (role) => {
  return AVAILABLE_ROLES.includes(role);
};

// vérifier si un rôle est admin
export const isAdminRole = (role) => {
  return role === USER_ROLES.ADMIN;
};

// obtenir les rôles disponibles
export const getAvailableRoles = () => {
  return AVAILABLE_ROLES.map((role) => ({
    value: role,
    label: role.charAt(0).toUpperCase() + role.slice(1),
  }));
};
