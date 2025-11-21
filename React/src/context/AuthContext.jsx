import { createContext, useState, useEffect, useMemo, useCallback } from 'react';
import authService from '../services/auth.service.js';

export const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setUser(authService.getCurrentUser());
    setLoading(false);
  }, []);

  const login = useCallback(async (email, password) => {
    try {
      const data = await authService.login(email, password);
      setUser(data.user);
      return { success: true, data };
    } catch (err) {
      return { success: false, error: err.message || 'Erreur de connexion' };
    }
  }, []);

  const register = useCallback(async (userData) => {
    try {
      const data = await authService.register(userData);
      setUser(data.user);
      return { success: true, data };
    } catch (err) {
      return { success: false, error: err.message || "Erreur d'inscription" };
    }
  }, []);

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

  const isAuthenticated = useCallback(() => !!user && authService.isAuthenticated(), [user]);

  const hasRole = useCallback((roleOrRoles) => {
    if (!user?.role) return false;
    return Array.isArray(roleOrRoles) ? roleOrRoles.includes(user.role) : user.role === roleOrRoles;
  }, [user]);

  const value = useMemo(() => ({
    user,
    loading,
    login,
    register,
    logout,
    updateProfile,
    isAuthenticated,
    hasRole,
    isAdmin: () => hasRole('admin'),
    isConseiller: () => hasRole(['conseiller', 'responsable']),
  }), [user, loading, login, register, logout, updateProfile, isAuthenticated, hasRole]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export default AuthContext;

