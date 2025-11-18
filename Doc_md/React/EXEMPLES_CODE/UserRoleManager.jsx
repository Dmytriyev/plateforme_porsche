/**
 * Exemple de composant React pour gérer les rôles utilisateur
 * Ce fichier montre comment utiliser l'API de gestion des rôles
 * 
 * Utilisation:
 * 1. Récupérer la liste des rôles disponibles via GET /api/users/roles
 * 2. Afficher un select avec les rôles
 * 3. Modifier le rôle via PUT /api/users/:id/role
 */

import React, { useState, useEffect } from 'react';
import axios from 'axios';

const UserRoleManager = ({ userId, currentRole, onRoleUpdated }) => {
    const [availableRoles, setAvailableRoles] = useState([]);
    const [selectedRole, setSelectedRole] = useState(currentRole);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(null);

    // Récupérer la liste des rôles disponibles
    useEffect(() => {
        const fetchRoles = async () => {
            try {
                const token = localStorage.getItem('token'); // ou votre méthode de stockage
                const response = await axios.get('/api/users/roles', {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });
                setAvailableRoles(response.data);
                setSelectedRole(currentRole);
            } catch (err) {
                console.error('Erreur lors de la récupération des rôles:', err);
                setError('Impossible de charger les rôles disponibles');
            }
        };

        fetchRoles();
    }, [currentRole]);

    // Mettre à jour le rôle de l'utilisateur
    const handleRoleUpdate = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        setSuccess(null);

        try {
            const token = localStorage.getItem('token');
            const response = await axios.put(
                `/api/users/${userId}/role`,
                { role: selectedRole },
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            setSuccess(response.data.message);

            // Callback pour informer le parent du changement
            if (onRoleUpdated) {
                onRoleUpdated(response.data.user);
            }
        } catch (err) {
            const errorMessage =
                err.response?.data?.message ||
                'Erreur lors de la mise à jour du rôle';
            setError(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="user-role-manager">
            <h3>Gestion du rôle utilisateur</h3>

            {error && (
                <div className="alert alert-error">
                    {error}
                </div>
            )}

            {success && (
                <div className="alert alert-success">
                    {success}
                </div>
            )}

            <form onSubmit={handleRoleUpdate}>
                <div className="form-group">
                    <label htmlFor="role-select">Rôle:</label>
                    <select
                        id="role-select"
                        value={selectedRole}
                        onChange={(e) => setSelectedRole(e.target.value)}
                        disabled={loading}
                        className="form-control"
                    >
                        <option value="">-- Sélectionnez un rôle --</option>
                        {availableRoles.map((role) => (
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

            <div className="role-info">
                <p><strong>Rôle actuel:</strong> {currentRole}</p>
                <p className="text-muted">
                    Note: Seuls les administrateurs peuvent modifier les rôles.
                </p>
            </div>
        </div>
    );
};

export default UserRoleManager;


/**
 * Exemple d'utilisation du composant UserRoleManager
 */
const UserManagementPage = () => {
    const [user, setUser] = useState(null);

    const handleRoleUpdated = (updatedUser) => {
        console.log('Rôle mis à jour:', updatedUser);
        setUser(updatedUser);
        // Autres actions : rafraîchir la liste, afficher une notification, etc.
    };

    return (
        <div className="user-management-page">
            <h2>Gestion des utilisateurs</h2>

            {user && (
                <UserRoleManager
                    userId={user._id}
                    currentRole={user.role}
                    onRoleUpdated={handleRoleUpdated}
                />
            )}
        </div>
    );
};

// ========================================
// Exemple avec fetch au lieu d'axios
// ========================================

const UserRoleManagerFetch = ({ userId, currentRole, onRoleUpdated }) => {
    const [availableRoles, setAvailableRoles] = useState([]);
    const [selectedRole, setSelectedRole] = useState(currentRole);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(null);

    useEffect(() => {
        const fetchRoles = async () => {
            try {
                const token = localStorage.getItem('token');
                const response = await fetch('/api/users/roles', {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json',
                    },
                });

                if (!response.ok) {
                    throw new Error('Erreur lors de la récupération des rôles');
                }

                const data = await response.json();
                setAvailableRoles(data);
                setSelectedRole(currentRole);
            } catch (err) {
                console.error('Erreur:', err);
                setError(err.message);
            }
        };

        fetchRoles();
    }, [currentRole]);

    const handleRoleUpdate = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        setSuccess(null);

        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`/api/users/${userId}/role`, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ role: selectedRole }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Erreur lors de la mise à jour');
            }

            setSuccess(data.message);

            if (onRoleUpdated) {
                onRoleUpdated(data.user);
            }
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="user-role-manager">
            <h3>Gestion du rôle utilisateur</h3>

            {error && <div className="alert alert-error">{error}</div>}
            {success && <div className="alert alert-success">{success}</div>}

            <form onSubmit={handleRoleUpdate}>
                <div className="form-group">
                    <label htmlFor="role-select">Rôle:</label>
                    <select
                        id="role-select"
                        value={selectedRole}
                        onChange={(e) => setSelectedRole(e.target.value)}
                        disabled={loading}
                    >
                        <option value="">-- Sélectionnez un rôle --</option>
                        {availableRoles.map((role) => (
                            <option key={role.value} value={role.value}>
                                {role.label}
                            </option>
                        ))}
                    </select>
                </div>

                <button
                    type="submit"
                    disabled={loading || selectedRole === currentRole}
                >
                    {loading ? 'Mise à jour...' : 'Mettre à jour le rôle'}
                </button>
            </form>
        </div>
    );
};
