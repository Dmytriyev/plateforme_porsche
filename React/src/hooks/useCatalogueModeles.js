// Hook personnalisé pour gérer le catalogue des modèles de voitures
import voitureService from "../services/voiture.service";
import modelPorscheService from "../services/modelPorsche.service";
import { useState, useEffect, useCallback } from "react";
import {
  grouperVoituresNeuves,
  grouperOccasions,
  trierModeles,
} from "../utils/catalogueHelpers";
import { warn } from "../utils/logger";

const useCatalogueModeles = (type) => {
  // États pour les modèles, le chargement et les erreurs
  const [modeles, setModeles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  // Détermination si le type est "neuve"
  const isNeuf = type === "neuve";

  // Enrichir modèles neufs avec prix des variantes
  const enrichirModelesNeufs = useCallback(async (modelesGroupes) => {
    // Parcours des groupes de modèles pour récupérer les variantes
    return Promise.all(
      modelesGroupes.map(async (modele) => {
        try {
          const variantes =
            await modelPorscheService.getConfigurationsByVoiture(modele._id);
          // Calcul du prix minimum parmi les variantes neuves
          if (Array.isArray(variantes) && variantes.length > 0) {
            // Filtrer les variantes neuves
            const variantesNeuves = variantes.filter(
              (v) =>
                v.voiture?.type_voiture === true ||
                v.voiture?.type_voiture === "neuve" ||
                v.voiture?.type_voiture === "true"
            );
            // Récupération des prix des variantes neuves
            const prixVariantes = variantesNeuves
              .map((v) => v.prix_base || v.prix_calcule || 0)
              .filter((p) => p > 0);
            // Définition du prix de base du modèle
            if (prixVariantes.length > 0) {
              modele.prix_base = Math.min(...prixVariantes);
            }
          }
        } catch (error) {
          warn("Erreur récupération variantes:", error);
        }
        return modele;
      })
    );
  }, []);

  // Charger les modèles
  const fetchModeles = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      // Log pour déboguer
      console.log(
        `[useCatalogueModeles] Type demandé: ${type}, isNeuf: ${isNeuf}`
      );

      // Récupération des voitures selon le type
      const response = isNeuf
        ? await voitureService.getVoituresNeuves()
        : await voitureService.getVoituresOccasion();

      // Log de la réponse
      console.log(
        `[useCatalogueModeles] Réponse reçue (${
          isNeuf ? "neuves" : "occasions"
        }):`,
        response?.length || 0,
        "voitures"
      );

      // Vérification et traitement des données reçues
      const data = Array.isArray(response) ? response : [];
      // Traitement des données selon le type
      if (isNeuf) {
        // Neuves
        const modelesGroupes = grouperVoituresNeuves(data);
        const modelesAvecPrix = await enrichirModelesNeufs(modelesGroupes);
        setModeles(modelesAvecPrix);
      } else {
        // Occasions
        const modelesGroupes = grouperOccasions(data);
        const modelesTries = trierModeles(modelesGroupes);
        setModeles(modelesTries);
      }
    } catch (err) {
      setError(err.message || "Erreur lors du chargement des modèles");
    } finally {
      setLoading(false);
    }
  }, [isNeuf, enrichirModelesNeufs, type]);
  // Chargement initial des modèles
  useEffect(() => {
    fetchModeles();
  }, [fetchModeles]);

  return {
    modeles,
    loading,
    error,
    isNeuf,
  };
};

export default useCatalogueModeles;
