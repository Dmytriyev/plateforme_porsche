// services/api/authService.js
// Service pour gérer l'authentification (connexion, inscription, etc.)

import api, { sauvegarderToken, sauvegarderUtilisateur } from '@/config/api';

export const authService = {
  /**
   * Connexion d'un utilisateur
   * @param {string} email - Email de l'utilisateur
   * @param {string} password - Mot de passe
   * @returns {Promise<object>} - { success: boolean, user: object, token: string }
   */
  connexion: async (email, password) => {
    try {
      const response = await api.post('/user/login', {
        email,
        password,
      });

      // Extraire les données de la réponse
      const { token, user } = response.data;

      // Sauvegarder dans localStorage
      sauvegarderToken(token);
      sauvegarderUtilisateur(user);

      console.log('✅ Connexion réussie:', user.email);

      return {
        success: true,
        user,
        token,
      };
    } catch (erreur) {
      console.error('❌ Erreur connexion:', erreur);
      
      let message = 'Erreur lors de la connexion';
      
      if (erreur.response?.status === 401) {
        message = 'Email ou mot de passe incorrect';
      } else if (erreur.response?.status === 429) {
        message = 'Trop de tentatives. Réessayez plus tard';
      } else if (erreur.response?.data?.message) {
        message = erreur.response.data.message;
      }

      return {
        success: false,
        erreur: message,
      };
    }
  },

  /**
   * Inscription d'un nouvel utilisateur
   * @param {object} donnees - Données utilisateur
   * @returns {Promise<object>}
   */
  inscription: async (donnees) => {
    try {
      const response = await api.post('/user/register', {
        email: donnees.email,
        password: donnees.motDePasse,
        nom: donnees.nom,
        prenom: donnees.prenom,
        telephone: donnees.telephone,
        adresse: donnees.adresse,
        code_postal: donnees.codePostal,
      });

      // Extraire les données
      const { token, user } = response.data;

      // Sauvegarder
      sauvegarderToken(token);
      sauvegarderUtilisateur(user);

      console.log('✅ Inscription réussie:', user.email);

      return {
        success: true,
        user,
        token,
      };
    } catch (erreur) {
      console.error('❌ Erreur inscription:', erreur);
      
      let message = 'Erreur lors de l\'inscription';
      
      if (erreur.response?.status === 400) {
        message = 'Données invalides. Vérifiez vos informations';
      } else if (erreur.response?.status === 409) {
        message = 'Cet email ou téléphone est déjà utilisé';
      } else if (erreur.response?.status === 429) {
        message = 'Trop de tentatives. Réessayez plus tard';
      } else if (erreur.response?.data?.message) {
        message = erreur.response.data.message;
      }

      return {
        success: false,
        erreur: message,
      };
    }
  },

  /**
   * Déconnexion (côté client uniquement)
   */
  deconnexion: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('utilisateur');
    console.log('✅ Déconnexion réussie');
  },

  /**
   * Obtenir le profil de l'utilisateur connecté
   * @returns {Promise<object>}
   */
  obtenirProfil: async () => {
    try {
      const response = await api.get('/user/profile');
      
      // Mettre à jour les données en local
      sauvegarderUtilisateur(response.data);
      
      return {
        success: true,
        user: response.data,
      };
    } catch (erreur) {
      console.error('❌ Erreur récupération profil:', erreur);
      
      return {
        success: false,
        erreur: 'Impossible de récupérer le profil',
      };
    }
  },

  /**
   * Mettre à jour le profil utilisateur
   * @param {object} donnees - Nouvelles données
   * @returns {Promise<object>}
   */
  mettreAJourProfil: async (donnees) => {
    try {
      const response = await api.put('/user/profile', donnees);
      
      // Mettre à jour localStorage
      sauvegarderUtilisateur(response.data);
      
      return {
        success: true,
        user: response.data,
      };
    } catch (erreur) {
      console.error('❌ Erreur mise à jour profil:', erreur);
      
      return {
        success: false,
        erreur: erreur.response?.data?.message || 'Erreur lors de la mise à jour',
      };
    }
  },

  /**
   * Changer le mot de passe
   * @param {string} ancienMotDePasse
   * @param {string} nouveauMotDePasse
   * @returns {Promise<object>}
   */
  changerMotDePasse: async (ancienMotDePasse, nouveauMotDePasse) => {
    try {
      await api.put('/user/password', {
        oldPassword: ancienMotDePasse,
        newPassword: nouveauMotDePasse,
      });
      
      return {
        success: true,
        message: 'Mot de passe modifié avec succès',
      };
    } catch (erreur) {
      console.error('❌ Erreur changement mot de passe:', erreur);
      
      let message = 'Erreur lors du changement de mot de passe';
      
      if (erreur.response?.status === 401) {
        message = 'Ancien mot de passe incorrect';
      } else if (erreur.response?.data?.message) {
        message = erreur.response.data.message;
      }
      
      return {
        success: false,
        erreur: message,
      };
    }
  },

  /**
   * Vérifier si l'utilisateur est connecté
   * @returns {boolean}
   */
  estConnecte: () => {
    const token = localStorage.getItem('token');
    return !!token;
  },

  /**
   * Obtenir l'utilisateur depuis localStorage
   * @returns {object|null}
   */
  obtenirUtilisateurLocal: () => {
    const utilisateur = localStorage.getItem('utilisateur');
    try {
      return utilisateur ? JSON.parse(utilisateur) : null;
    } catch (error) {
      console.error('Erreur parsing utilisateur:', error);
      return null;
    }
  },

  /**
   * Vérifier si l'utilisateur est admin
   * @returns {boolean}
   */
  estAdmin: () => {
    const utilisateur = authService.obtenirUtilisateurLocal();
    return utilisateur?.role === 'admin' || utilisateur?.isAdmin === true;
  },

  /**
   * Vérifier si l'utilisateur est conseiller
   * @returns {boolean}
   */
  estConseiller: () => {
    const utilisateur = authService.obtenirUtilisateurLocal();
    return utilisateur?.role === 'conseillere' || utilisateur?.role === 'responsable';
  },
};

