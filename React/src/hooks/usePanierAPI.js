// Hook personnalisé pour gérer le panier avec authentification
import { useState, useCallback, useContext } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import commandeService from "../services/commande.service";
// Hook usePanierAPI
export const usePanierAPI = () => {
  // États internes
  const [successMessage, setSuccessMessage] = useState("");
  const [error, setError] = useState("");
  const [showLoginPrompt, setShowLoginPrompt] = useState(false);
  const { isAuthenticated } = useContext(AuthContext);
  const navigate = useNavigate();
  const location = useLocation();

  // Ajout au panier avec gestion auth
  const ajouterAccessoire = useCallback(
    async (accessoire) => {
      // Vérification authentification
      if (!isAuthenticated()) {
        setShowLoginPrompt(true);
        return { success: false, needsAuth: true };
      }

      try {
        // Appel API ajout au panier
        await commandeService.ajouterAccessoireAuPanier(accessoire._id, 1);
        // Message de succès
        const message = `${accessoire.nom_accesoire} ajouté au panier`;
        // Afficher le message temporairement
        setSuccessMessage(message);
        setTimeout(() => setSuccessMessage(""), 3000);
        return { success: true, message };
      } catch (err) {
        // Gestion des erreurs
        const errorMsg = err.message || "Erreur lors de l'ajout au panier";
        setError(errorMsg);
        setTimeout(() => setError(""), 3000);
        return { success: false, message: errorMsg };
      }
    },
    // Dépendance sur l'état d'authentification
    [isAuthenticated]
  );

  // Navigation vers login
  const handleLoginRedirect = useCallback(() => {
    // Redirection vers la page de login avec état de provenance
    navigate("/login", { state: { from: location.pathname } });
  }, [navigate, location.pathname]);

  // Fermeture du prompt
  const closeLoginPrompt = useCallback(() => {
    setShowLoginPrompt(false);
  }, []);

  return {
    successMessage,
    error,
    showLoginPrompt,
    ajouterAccessoire,
    handleLoginRedirect,
    closeLoginPrompt,
  };
};

export default usePanierAPI;
