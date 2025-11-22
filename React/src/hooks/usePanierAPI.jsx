import { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext.jsx';
import { commandeService } from '../services';

/**
 * Hook personnalisé pour gérer le panier via l'API backend
 * Remplace PanierContext qui utilisait localStorage
 */
const usePanierAPI = () => {
    const { isAuthenticated, user } = useContext(AuthContext);
    const [nombreArticles, setNombreArticles] = useState(0);
    const [loading, setLoading] = useState(false);

    const fetchNombreArticles = async () => {
        try {
            const data = await commandeService.getPanier();
            const lignes = data?.lignesCommande || [];
            const total = lignes.reduce((sum, ligne) => sum + (ligne.quantite || 1), 0);
            setNombreArticles(total);
        } catch (error) {
            // Si le panier est vide ou erreur, on met 0
            setNombreArticles(0);
        }
    };

    // Charger le nombre d'articles au montage et quand l'auth change
    useEffect(() => {
        if (isAuthenticated()) {
            fetchNombreArticles();
        } else {
            setNombreArticles(0);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [user]);

    const ajouterAccessoire = async (accessoireId, quantite = 1) => {
        if (!isAuthenticated()) {
            throw new Error('Authentification requise');
        }

        setLoading(true);
        try {
            await commandeService.ajouterAccessoireAuPanier(accessoireId, quantite);
            await fetchNombreArticles(); // Rafraîchir le compteur
            return { success: true };
        } catch (error) {
            throw error;
        } finally {
            setLoading(false);
        }
    };

    const ajouterVoiture = async (modelPorscheId) => {
        if (!isAuthenticated()) {
            throw new Error('Authentification requise');
        }

        setLoading(true);
        try {
            await commandeService.ajouterVoitureNeuveAuPanier(modelPorscheId);
            await fetchNombreArticles(); // Rafraîchir le compteur
            return { success: true };
        } catch (error) {
            throw error;
        } finally {
            setLoading(false);
        }
    };

    const rafraichirPanier = async () => {
        await fetchNombreArticles();
    };

    return {
        nombreArticles,
        loading,
        ajouterAccessoire,
        ajouterVoiture,
        rafraichirPanier,
    };
};

export default usePanierAPI;
