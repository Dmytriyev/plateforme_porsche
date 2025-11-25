/**
 * context/AuthContext.jsx — Gestion de l'auth globale (user, tokens, login, logout, refresh).
 *
 * @file context/AuthContext.jsx
 */

/* eslint-disable react-refresh/only-export-components */

import { createContext, useState, useMemo, useCallback, useEffect } from "react";
import authService from "../services/auth.service.js";
import userService from "../services/user.service.js";

export const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  // Initialiser l'utilisateur depuis le cache sessionStorage (si disponible)
  const [user, setUser] = useState(() => authService.getCurrentUser());
  const [loading, setLoading] = useState(true);

  // Charger l'utilisateur depuis l'API au démarrage si un token existe
  useEffect(() => {
    const loadUser = async () => {
      try {
        // Si on a déjà un user en cache, on l'utilise temporairement
        if (user) {
          setLoading(false);
          return;
        }

        // Sinon, on tente de charger depuis l'API (via cookie)
        const userData = await userService.getCurrentUser();
        if (userData) {
          setUser(userData);
        }
      } catch (error) {
        // Pas d'utilisateur connecté ou token invalide
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    loadUser();
  }, []);

  const login = useCallback(async (email, password) => {
    try {
      const data = await authService.login(email, password);
      setUser(data.user);
      return { success: true, data };
    } catch (err) {
      return { success: false, error: err.message || "Erreur de connexion" };
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
      return { success: false, error: err.message || "Erreur de mise à jour" };
    }
  }, []);

  const updateUser = useCallback((userData) => {
    setUser(userData);
  }, []);

  const isAuthenticated = useCallback(
    () => !!user && authService.isAuthenticated(),
    [user],
  );

  const hasRole = useCallback(
    (roleOrRoles) => {
      if (!user?.role) return false;
      return Array.isArray(roleOrRoles)
        ? roleOrRoles.includes(user.role)
        : user.role === roleOrRoles;
    },
    [user],
  );

  const value = useMemo(
    () => ({
      user,
      loading,
      login,
      register,
      logout,
      updateProfile,
      updateUser,
      isAuthenticated,
      hasRole,
      isAdmin: () => hasRole("admin"),
      isConseiller: () => hasRole(["conseiller", "responsable"]),
      isStaff: () => hasRole(["admin", "conseiller", "responsable"]),
    }),
    [
      user,
      loading,
      login,
      register,
      logout,
      updateProfile,
      updateUser,
      isAuthenticated,
      hasRole,
    ],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export default AuthProvider;
