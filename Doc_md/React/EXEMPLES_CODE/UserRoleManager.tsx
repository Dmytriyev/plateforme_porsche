/**
 * Types et interfaces TypeScript pour la gestion des rôles
 * Utilisez ce fichier avec votre projet React TypeScript
 */

// ==========================================
// Types de base
// ==========================================

export type UserRole = 'user' | 'responsable' | 'conseillere' | 'admin';

export interface RoleOption {
  value: UserRole;
  label: string;
}

export interface User {
  _id: string;
  email: string;
  nom: string;
  prenom: string;
  telephone: string;
  adresse: string;
  code_postal: string;
  role: UserRole;
  isAdmin: boolean;
  panier?: string;
  createdAt: string;
  updatedAt: string;
}

export interface UpdateRoleRequest {
  role: UserRole;
}

export interface UpdateRoleResponse {
  message: string;
  user: User;
}

export interface ApiError {
  message: string;
  error?: string;
}

// ==========================================
// Service API
// ==========================================

import axios, { AxiosInstance, AxiosError } from 'axios';

class UserRoleService {
  private api: AxiosInstance;

  constructor(baseURL: string = '/api') {
    this.api = axios.create({
      baseURL,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Intercepteur pour ajouter le token automatiquement
    this.api.interceptors.request.use((config) => {
      const token = localStorage.getItem('token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    });
  }

  /**
   * Récupère la liste des rôles disponibles
   */
  async getAvailableRoles(): Promise<RoleOption[]> {
    try {
      const response = await this.api.get<RoleOption[]>('/users/roles');
      return response.data;
    } catch (error) {
      this.handleError(error);
      throw error;
    }
  }

  /**
   * Met à jour le rôle d'un utilisateur (admin uniquement)
   */
  async updateUserRole(
    userId: string,
    role: UserRole
  ): Promise<UpdateRoleResponse> {
    try {
      const response = await this.api.put<UpdateRoleResponse>(
        `/users/${userId}/role`,
        { role }
      );
      return response.data;
    } catch (error) {
      this.handleError(error);
      throw error;
    }
  }

  /**
   * Récupère les informations d'un utilisateur
   */
  async getUserById(userId: string): Promise<User> {
    try {
      const response = await this.api.get<User>(`/users/${userId}`);
      return response.data;
    } catch (error) {
      this.handleError(error);
      throw error;
    }
  }

  /**
   * Récupère tous les utilisateurs (admin uniquement)
   */
  async getAllUsers(): Promise<User[]> {
    try {
      const response = await this.api.get<User[]>('/users/all');
      return response.data;
    } catch (error) {
      this.handleError(error);
      throw error;
    }
  }

  /**
   * Gestion centralisée des erreurs
   */
  private handleError(error: unknown): void {
    if (axios.isAxiosError(error)) {
      const axiosError = error as AxiosError<ApiError>;
      console.error('API Error:', axiosError.response?.data?.message || error.message);
    } else {
      console.error('Unexpected error:', error);
    }
  }
}

export const userRoleService = new UserRoleService();

// ==========================================
// Hook React personnalisé
// ==========================================

import { useState, useEffect } from 'react';

interface UseUserRolesReturn {
  roles: RoleOption[];
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

export const useUserRoles = (): UseUserRolesReturn => {
  const [roles, setRoles] = useState<RoleOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchRoles = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await userRoleService.getAvailableRoles();
      setRoles(data);
    } catch (err) {
      setError('Impossible de charger les rôles');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRoles();
  }, []);

  return { roles, loading, error, refetch: fetchRoles };
};

// ==========================================
// Hook pour mise à jour de rôle
// ==========================================

interface UseUpdateUserRoleReturn {
  updateRole: (userId: string, role: UserRole) => Promise<void>;
  loading: boolean;
  error: string | null;
  success: string | null;
  reset: () => void;
}

export const useUpdateUserRole = (): UseUpdateUserRoleReturn => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const updateRole = async (userId: string, role: UserRole) => {
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const response = await userRoleService.updateUserRole(userId, role);
      setSuccess(response.message);
    } catch (err) {
      if (axios.isAxiosError(err)) {
        setError(err.response?.data?.message || 'Erreur lors de la mise à jour');
      } else {
        setError('Erreur inattendue');
      }
    } finally {
      setLoading(false);
    }
  };

  const reset = () => {
    setError(null);
    setSuccess(null);
  };

  return { updateRole, loading, error, success, reset };
};

// ==========================================
// Composant React TypeScript
// ==========================================

import React, { FC, FormEvent } from 'react';

interface UserRoleManagerProps {
  userId: string;
  currentRole: UserRole;
  onRoleUpdated?: (user: User) => void;
}

export const UserRoleManager: FC<UserRoleManagerProps> = ({
  userId,
  currentRole,
  onRoleUpdated,
}) => {
  const { roles, loading: rolesLoading, error: rolesError } = useUserRoles();
  const { updateRole, loading, error, success, reset } = useUpdateUserRole();
  const [selectedRole, setSelectedRole] = useState<UserRole>(currentRole);

  useEffect(() => {
    setSelectedRole(currentRole);
  }, [currentRole]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    
    try {
      await updateRole(userId, selectedRole);
      
      // Rafraîchir les données de l'utilisateur
      if (onRoleUpdated) {
        const updatedUser = await userRoleService.getUserById(userId);
        onRoleUpdated(updatedUser);
      }
    } catch (err) {
      // L'erreur est déjà gérée par le hook
    }
  };

  if (rolesLoading) {
    return <div className="loading">Chargement des rôles...</div>;
  }

  if (rolesError) {
    return <div className="error">{rolesError}</div>;
  }

  return (
    <div className="user-role-manager">
      <h3>Gestion du rôle utilisateur</h3>

      {error && (
        <div className="alert alert-danger" role="alert">
          {error}
          <button onClick={reset} className="btn-close" aria-label="Close" />
        </div>
      )}

      {success && (
        <div className="alert alert-success" role="alert">
          {success}
          <button onClick={reset} className="btn-close" aria-label="Close" />
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="role-select">Rôle:</label>
          <select
            id="role-select"
            value={selectedRole}
            onChange={(e) => setSelectedRole(e.target.value as UserRole)}
            disabled={loading}
            className="form-control"
          >
            {roles.map((role) => (
              <option key={role.value} value={role.value}>
                {role.label}
              </option>
            ))}
          </select>
        </div>

        <button
          type="submit"
          disabled={loading || selectedRole === currentRole}
          className="btn btn-primary"
        >
          {loading ? 'Mise à jour...' : 'Mettre à jour le rôle'}
        </button>
      </form>

      <div className="role-info mt-3">
        <p>
          <strong>Rôle actuel:</strong> {currentRole}
        </p>
        <p className="text-muted">
          Note: Seuls les administrateurs peuvent modifier les rôles.
        </p>
      </div>
    </div>
  );
};

// ==========================================
// Composant avec React Query (optionnel)
// ==========================================

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

export const useRolesQuery = () => {
  return useQuery<RoleOption[], Error>({
    queryKey: ['roles'],
    queryFn: () => userRoleService.getAvailableRoles(),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

export const useUpdateRoleMutation = () => {
  const queryClient = useQueryClient();

  return useMutation<UpdateRoleResponse, Error, { userId: string; role: UserRole }>({
    mutationFn: ({ userId, role }) => userRoleService.updateUserRole(userId, role),
    onSuccess: (data, variables) => {
      // Invalider le cache pour forcer un refresh
      queryClient.invalidateQueries({ queryKey: ['users'] });
      queryClient.invalidateQueries({ queryKey: ['user', variables.userId] });
    },
  });
};

export const UserRoleManagerWithQuery: FC<UserRoleManagerProps> = ({
  userId,
  currentRole,
  onRoleUpdated,
}) => {
  const { data: roles, isLoading: rolesLoading, error: rolesError } = useRolesQuery();
  const mutation = useUpdateRoleMutation();
  const [selectedRole, setSelectedRole] = useState<UserRole>(currentRole);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    
    mutation.mutate(
      { userId, role: selectedRole },
      {
        onSuccess: (data) => {
          if (onRoleUpdated) {
            onRoleUpdated(data.user);
          }
        },
      }
    );
  };

  if (rolesLoading) return <div>Chargement...</div>;
  if (rolesError) return <div>Erreur: {rolesError.message}</div>;

  return (
    <div className="user-role-manager">
      <h3>Gestion du rôle utilisateur</h3>

      {mutation.error && (
        <div className="alert alert-danger">
          {mutation.error instanceof Error ? mutation.error.message : 'Erreur'}
        </div>
      )}

      {mutation.isSuccess && (
        <div className="alert alert-success">
          Rôle mis à jour avec succès !
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <select
          value={selectedRole}
          onChange={(e) => setSelectedRole(e.target.value as UserRole)}
          disabled={mutation.isPending}
        >
          {roles?.map((role) => (
            <option key={role.value} value={role.value}>
              {role.label}
            </option>
          ))}
        </select>

        <button
          type="submit"
          disabled={mutation.isPending || selectedRole === currentRole}
        >
          {mutation.isPending ? 'Mise à jour...' : 'Mettre à jour'}
        </button>
      </form>
    </div>
  );
};

// ==========================================
// Utilitaires TypeScript
// ==========================================

/**
 * Type guard pour vérifier si une chaîne est un UserRole valide
 */
export const isUserRole = (value: string): value is UserRole => {
  return ['user', 'responsable', 'conseillere', 'admin'].includes(value);
};

/**
 * Vérifie si un utilisateur est admin
 */
export const isAdmin = (user: User): boolean => {
  return user.role === 'admin' || user.isAdmin;
};

/**
 * Vérifie si un utilisateur a la permission de modifier les rôles
 */
export const canModifyRoles = (user: User): boolean => {
  return isAdmin(user);
};

/**
 * Formatte le label d'un rôle
 */
export const formatRoleLabel = (role: UserRole): string => {
  const labels: Record<UserRole, string> = {
    user: 'Utilisateur',
    responsable: 'Responsable',
    conseillere: 'Conseillère',
    admin: 'Administrateur',
  };
  return labels[role];
};

export default UserRoleManager;
