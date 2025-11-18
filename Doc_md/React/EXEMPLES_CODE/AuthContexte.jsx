// contextes/AuthContexte.jsx
// Context API pour gérer l'état d'authentification global

import { createContext, useState, useEffect } from 'react';
import { authService } from '@/services/api/authService';

// Créer le contexte
export const AuthContexte = createContext();

/**
 * Provider pour l'authentification
 * À placer à la racine de l'application (dans App.jsx)
 */
export function AuthProvider({ children }) {
  // État de l'utilisateur connecté
  const [utilisateur, setUtilisateur] = useState(null);
  
  // État du chargement initial
  const [chargement, setChargement] = useState(true);

  // ============================================
  // EFFET : Charger l'utilisateur au montage
  // ============================================
  useEffect(() => {
    const chargerUtilisateur = () => {
      // Récupérer depuis localStorage
      const utilisateurLocal = authService.obtenirUtilisateurLocal();
      
      if (utilisateurLocal) {
        setUtilisateur(utilisateurLocal);
        console.log('👤 Utilisateur chargé:', utilisateurLocal.email);
      } else {
        console.log('👤 Aucun utilisateur connecté');
      }
      
      setChargement(false);
    };

    chargerUtilisateur();
  }, []);

  // ============================================
  // FONCTION : Connexion
  // ============================================
  const connexion = async (email, motDePasse) => {
    try {
      const resultat = await authService.connexion(email, motDePasse);
      
      if (resultat.success) {
        setUtilisateur(resultat.user);
        return { success: true };
      }
      
      return resultat;
    } catch (erreur) {
      console.error('Erreur connexion:', erreur);
      return {
        success: false,
        erreur: 'Une erreur est survenue',
      };
    }
  };

  // ============================================
  // FONCTION : Inscription
  // ============================================
  const inscription = async (donnees) => {
    try {
      const resultat = await authService.inscription(donnees);
      
      if (resultat.success) {
        setUtilisateur(resultat.user);
        return { success: true };
      }
      
      return resultat;
    } catch (erreur) {
      console.error('Erreur inscription:', erreur);
      return {
        success: false,
        erreur: 'Une erreur est survenue',
      };
    }
  };

  // ============================================
  // FONCTION : Déconnexion
  // ============================================
  const deconnexion = () => {
    authService.deconnexion();
    setUtilisateur(null);
    console.log('👋 Utilisateur déconnecté');
  };

  // ============================================
  // FONCTION : Rafraîchir le profil
  // ============================================
  const rafraichirProfil = async () => {
    const resultat = await authService.obtenirProfil();
    
    if (resultat.success) {
      setUtilisateur(resultat.user);
    }
    
    return resultat;
  };

  // ============================================
  // FONCTION : Mettre à jour le profil
  // ============================================
  const mettreAJourProfil = async (donnees) => {
    const resultat = await authService.mettreAJourProfil(donnees);
    
    if (resultat.success) {
      setUtilisateur(resultat.user);
    }
    
    return resultat;
  };

  // ============================================
  // VALEURS DU CONTEXTE
  // ============================================
  const valeur = {
    // État
    utilisateur,
    chargement,
    estConnecte: !!utilisateur,
    estAdmin: utilisateur?.role === 'admin' || utilisateur?.isAdmin === true,
    estConseiller: utilisateur?.role === 'conseillere' || utilisateur?.role === 'responsable',
    
    // Fonctions
    connexion,
    inscription,
    deconnexion,
    rafraichirProfil,
    mettreAJourProfil,
    setUtilisateur, // Pour mise à jour directe si besoin
  };

  // Afficher un loader pendant le chargement initial
  if (chargement) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh' 
      }}>
        <p>Chargement...</p>
      </div>
    );
  }

  // Fournir le contexte à tous les enfants
  return (
    <AuthContexte.Provider value={valeur}>
      {children}
    </AuthContexte.Provider>
  );
}

