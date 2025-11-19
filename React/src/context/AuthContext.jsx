import { createContext, useState, useEffect, useCallback, useMemo } from 'react';
import authService from '../services/auth.service.jsx';

/**
 * Contexte d'authentification
 * Gère l'état global de l'utilisateur connecté
 */
export const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Charger l'utilisateur au démarrage
  useEffect(() => {
    const loadUser = () => {
      try {
        const currentUser = authService.getCurrentUser();
        setUser(currentUser);
      } catch (err) {
      } finally {
        setLoading(false);
      }
    };

    loadUser();
  }, []);

  /**
   * Connexion
   */
  const login = useCallback(async (email, password) => {
    try {
      const data = await authService.login(email, password);
      setUser(data.user);
      return { success: true, data };
    } catch (err) {
      return { success: false, error: err.message || 'Erreur de connexion' };
    }
  }, []);

  /**
   * Inscription
   */
  const register = useCallback(async (userData) => {
    try {
      const data = await authService.register(userData);
      setUser(data.user);
      return { success: true, data };
    } catch (err) {
      return { success: false, error: err.message || "Erreur d'inscription" };
    }
  }, []);

  /**
   * Déconnexion
   */
  const logout = useCallback(() => {
    authService.logout();
    setUser(null);
  }, []);

  const updateProfile = useCallback(async (userId, userData) => {
    try {
      const data = await authService.updateProfile(userId, userData);
      if (data) setUser(data);
      return { success: true, data };
    } catch (err) {
      return { success: false, error: err.message || 'Erreur de mise à jour' };
    }
  }, []);

  /**
   * Vérifier si l'utilisateur est connecté
   */
  const isAuthenticated = useCallback(() => {
    return !!user && authService.isAuthenticated();
  }, [user]);

  /**
   * Vérifier le rôle de l'utilisateur
   */
  const hasRole = useCallback((role) => user?.role === role, [user]);

  /**
   * Vérifier si l'utilisateur est admin
   */
  const isAdmin = useCallback(() => hasRole('admin'), [hasRole]);
  const isConseiller = useCallback(() => hasRole('conseiller') || hasRole('responsable'), [hasRole]);

  const value = useMemo(
    () => ({
      user,
      loading,
      login,
      register,
      logout,
      updateProfile,
      isAuthenticated,
      hasRole,
      isAdmin,
      isConseiller,
    }),
    [user, loading, login, register, logout, updateProfile, isAuthenticated, hasRole, isAdmin, isConseiller]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export default AuthContext;

