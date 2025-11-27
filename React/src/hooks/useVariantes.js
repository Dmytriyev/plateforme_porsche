import { useState, useEffect, useCallback } from "react";
import modelPorscheService from "../services/modelPorsche.service.js";
import voitureService from "../services/voiture.service.js";
import { debug } from "../utils/logger.js";

export default function useVariantes(modeleId, isNeuf) {
  const [modele, setModele] = useState(null);
  const [variantes, setVariantes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetch = useCallback(
    async (signal) => {
      try {
        setLoading(true);
        setError("");

        const isObjectId = /^[0-9a-fA-F]{24}$/.test(modeleId);

        let modeleData;

        if (isObjectId) {
          modeleData = await voitureService.getVoitureById(modeleId, {
            signal,
          });
        } else {
          const allVoitures = await voitureService.getAllVoitures({ signal });
          modeleData = allVoitures.find(
            (v) =>
              v.nom_model === modeleId ||
              v.nom_model?.toLowerCase() === modeleId?.toLowerCase()
          );
        }

        if (!modeleData || !modeleData.nom_model) {
          const errorMsg = isObjectId
            ? `Modèle introuvable pour l'ID: ${modeleId}`
            : `Modèle "${modeleId}" introuvable. Vérifiez que ce modèle existe dans la base de données.`;
          throw new Error(errorMsg);
        }

        setModele(modeleData);

        const variantesData =
          await modelPorscheService.getConfigurationsByVoiture(
            isObjectId ? modeleId : modeleData._id,
            { signal }
          );

        const allVariantes = Array.isArray(variantesData) ? variantesData : [];

        if (isNeuf) {
          if (allVariantes.length === 0 && modeleData) {
            const virtualVariante = {
              _id: modeleData._id,
              nom_model: modeleData.nom_model,
              description: modeleData.description,
              voiture: modeleData,
              photo_voiture: modeleData.photo_voiture || [],
              photo_porsche: [],
              type_carrosserie: "N/A",
              prix_base: 0,
              specifications: {
                puissance: 0,
                acceleration_0_100: 0,
                vitesse_max: 0,
                transmission: "N/A",
                consommation: 0,
              },
              disponible: false,
              message:
                "Configurations non disponibles - Contactez le concessionnaire",
            };
            setVariantes([virtualVariante]);
          } else {
            setVariantes(allVariantes);
          }
        } else {
          const filteredOccasions = allVariantes.filter((variante) => {
            const typeVoiture = variante.voiture?.type_voiture;
            return (
              typeVoiture === false ||
              typeVoiture === "occasion" ||
              typeVoiture === "false"
            );
          });

          let occasionsToDisplay = filteredOccasions;

          if (
            filteredOccasions.length === 0 &&
            modeleData.type_voiture === false
          ) {
            const virtualOccasion = {
              _id: modeleData._id,
              nom_model: modeleData.nom_model,
              description: modeleData.description,
              voiture: modeleData,
              photo_voiture: modeleData.photo_voiture || [],
              photo_porsche: [],
              type_carrosserie: "N/A",
              prix_base: 0,
              specifications: {
                puissance: 0,
                acceleration_0_100: 0,
                vitesse_max: 0,
                transmission: "N/A",
                consommation: 0,
              },
              disponible: true,
              message:
                "Variantes détaillées non disponibles - Contactez le concessionnaire",
            };
            occasionsToDisplay = [virtualOccasion];
          }

          if (import.meta.env.DEV)
            debug("Aucun filtre trouvé, utilisation d'une virtualOccasion");

          setVariantes(occasionsToDisplay);
        }
      } catch (err) {
        if (err.name === "CanceledError" || err.name === "AbortError") return;
        setError(err.message || "Erreur lors du chargement des variantes");
      } finally {
        setLoading(false);
      }
    },
    [modeleId, isNeuf]
  );

  useEffect(() => {
    const controller = new AbortController();
    const signal = controller.signal;
    fetch(signal);
    return () => controller.abort();
  }, [fetch]);

  const refetch = useCallback(() => {
    const controller = new AbortController();
    fetch(controller.signal);
    // no abort returned since caller may not unmount immediately
  }, [fetch]);

  return { modele, variantes, loading, error, refetch };
}
