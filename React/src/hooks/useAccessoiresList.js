import { useState, useEffect, useCallback, useMemo } from "react";
import accesoireService from "../services/accesoire.service";
// Hook personnalisé pour charger la liste des accessoires
const useAccessoiresList = () => {
  const [accessoires, setAccessoires] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Chargement initial et rechargement des accessoires
  const fetchAccessoires = useCallback(async () => {
    try {
      setLoading(true);
      setError("");
      const data = await accesoireService.getAllAccessoires();
      // Vérification du format des données
      if (Array.isArray(data)) {
        setAccessoires(data);
      } else {
        // Format inattendu des données
        setError("Format de données invalide");
        setAccessoires([]);
      }
    } catch (err) {
      // Gestion des erreurs API
      setError(
        err?.message ||
          err?.response?.data?.message ||
          "Erreur lors du chargement des accessoires"
      );
      setAccessoires([]);
    } finally {
      setLoading(false);
    }
  }, []);
  // Chargement initial des accessoires
  useEffect(() => {
    fetchAccessoires();
  }, [fetchAccessoires]);

  // Extraction des types uniques (mémoïsé)
  const types = useMemo(() => {
    // Extraire les types uniques
    const uniqueTypes = new Set(
      accessoires.map((a) => a.type_accesoire).filter(Boolean)
    );
    // Ajouter une option "Tous" au début
    return ["tous", ...Array.from(uniqueTypes)];
  }, [accessoires]);

  // Suppression d'un accessoire
  const deleteAccessoire = useCallback(
    async (accessoireId) => {
      try {
        // Appel API de suppression d'un accessoire
        await accesoireService.deleteAccessoire(accessoireId);
        await fetchAccessoires();
        return { success: true, message: "Accessoire supprimé avec succès" };
      } catch (err) {
        return {
          success: false,
          message: err.message || "Erreur lors de la suppression",
        };
      }
    },
    [fetchAccessoires]
  );

  return {
    accessoires,
    loading,
    error,
    types,
    fetchAccessoires,
    deleteAccessoire,
  };
};

export default useAccessoiresList;
