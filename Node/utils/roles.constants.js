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

// Permissions par rôle
export const ROLE_PERMISSIONS = {
  [USER_ROLES.USER]: {
    canUpdateOwnProfile: true,
    canDeleteOwnAccount: true,
    canManageOwnReservations: true,
    canManageOwnPorsches: true,
    canModifyRoles: false,
    canAccessAllUsers: false,
  },
  [USER_ROLES.RESPONSABLE]: {
    canUpdateOwnProfile: true,
    canDeleteOwnAccount: true,
    canManageOwnReservations: true,
    canManageOwnPorsches: true,
    canViewReservations: true,
    canModifyRoles: false,
    canAccessAllUsers: false,
  },
  [USER_ROLES.CONSEILLERE]: {
    canUpdateOwnProfile: true,
    canDeleteOwnAccount: true,
    canManageOwnReservations: true,
    canManageOwnPorsches: true,
    canViewClients: true,
    canAssistClients: true,
    canModifyRoles: false,
    canAccessAllUsers: false,
  },
  [USER_ROLES.ADMIN]: {
    canUpdateOwnProfile: true,
    canDeleteOwnAccount: true,
    canManageOwnReservations: true,
    canManageOwnPorsches: true,
    canViewClients: true,
    canAssistClients: true,
    canViewReservations: true,
    canModifyRoles: true, // Seul l'admin peut modifier les rôles
    canAccessAllUsers: true,
    canManageAllReservations: true,
    canManageAllPorsches: true,
    canDeleteAnyUser: true,
  },
};

// vérifier si un rôle est valide
export const isValidRole = (role) => {
  return AVAILABLE_ROLES.includes(role);
};

// vérifier si un rôle est admin
export const isAdminRole = (role) => {
  return role === USER_ROLES.ADMIN;
};

// vérifier une permission pour un rôle
export const hasPermission = (role, permission) => {
  if (!isValidRole(role)) {
    return false;
  }
  return ROLE_PERMISSIONS[role]?.[permission] || false;
};

// obtenir les rôles disponibles
export const getAvailableRoles = () => {
  return AVAILABLE_ROLES.map((role) => ({
    value: role,
    label: role.charAt(0).toUpperCase() + role.slice(1),
  }));
};
