import { createContext, useState, useEffect } from 'react';
import authService from '../services/auth.service.jsx';

/**
 * Contexte d'authentification
 * Gère l'état global de l'utilisateur connecté
 */
export const AuthContext = createContext(undefined);

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
        console.error('Erreur chargement utilisateur:', err);
      } finally {
        setLoading(false);
      }
    };

    loadUser();
  }, []);

  /**
   * Connexion
   */
  const login = async (email, password) => {
    try {
      const data = await authService.login(email, password);
      setUser(data.user);
      return { success: true, data };
    } catch (err) {
      return { success: false, error: err.message || 'Erreur de connexion' };
    }
  };

  /**
   * Inscription
   */
  const register = async (userData) => {
    try {
      const data = await authService.register(userData);
      setUser(data.user);
      return { success: true, data };
    } catch (err) {
      return { success: false, error: err.message || 'Erreur d\'inscription' };
    }
  };

  /**
   * Déconnexion
   */
  const logout = () => {
    authService.logout();
    setUser(null);
  };

  const updateProfile = async (userId, userData) => {
    try {
      const data = await authService.updateProfile(userId, userData);
      if (data) {
        setUser(data);
      }
      return { success: true, data };
    } catch (err) {
      return { success: false, error: err.message || 'Erreur de mise à jour' };
    }
  };

  /**
   * Vérifier si l'utilisateur est connecté
   */
  const isAuthenticated = () => {
    return !!user && authService.isAuthenticated();
  };

  /**
   * Vérifier le rôle de l'utilisateur
   */
  const hasRole = (role) => {
    return user?.role === role;
  };

  /**
   * Vérifier si l'utilisateur est admin
   */
  const isAdmin = () => {
    return hasRole('admin');
  };

  /**
   * Vérifier si l'utilisateur est conseiller
   */
  const isConseiller = () => {
    return hasRole('conseiller') || hasRole('responsable');
  };

  const value = {
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
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export default AuthContext;

