// Hook personnalisé pour charger un accessoire par son ID
import { useState, useEffect, useCallback } from "react";
import accesoireService from "../services/accesoire.service";

const useAccessoireData = (accessoireId) => {
  const [accessoire, setAccessoire] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchAccessoire = useCallback(async () => {
    if (!accessoireId) {
      setError("ID accessoire manquant");
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError("");
      const data = await accesoireService.getAccessoireById(accessoireId);
      setAccessoire(data);
    } catch (err) {
      setError(err.message || "Erreur lors du chargement de l'accessoire");
      setAccessoire(null);
    } finally {
      setLoading(false);
    }
  }, [accessoireId]);

  useEffect(() => {
    fetchAccessoire();
  }, [fetchAccessoire]);

  return {
    accessoire,
    loading,
    error,
    refetch: fetchAccessoire,
  };
};

export default useAccessoireData;
