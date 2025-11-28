/**
 * useConfiguratorData - Hook personnalisé pour charger les données du configurateur
 *
 * Principe SOLID : Séparation des responsabilités
 * - Gestion du chargement des données
 * - Gestion des erreurs
 * - Sélection de la variante par défaut
 *
 * @param {string} voitureId - ID de la voiture
 * @param {string} varianteId - ID de la variante
 * @returns {Object} - Données chargées et états
 */
import { useState, useEffect } from "react";
import modelPorscheService from "../services/modelPorsche.service";
import personnalisationService from "../services/personnalisation.service";

const useConfiguratorData = (voitureId, varianteId) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [voitureIdActuel, setVoitureIdActuel] = useState(voitureId);

  // Données chargées
  const [variantes, setVariantes] = useState([]);
  const [couleursExt, setCouleursExt] = useState([]);
  const [couleursInt, setCouleursInt] = useState([]);
  const [jantes, setJantes] = useState([]);
  const [sieges, setSieges] = useState([]);
  const [packages, setPackages] = useState([]);
  const [varianteSelectionnee, setVarianteSelectionnee] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError("");

        let voitureIdLocal = voitureId;

        // Cas edge : varianteId sans voitureId => récupérer le voitureId depuis la variante
        if (!voitureId && varianteId) {
          const varianteData = await modelPorscheService.getModelById(
            varianteId
          );

          if (varianteData?.voiture?._id || varianteData?.voiture) {
            voitureIdLocal =
              typeof varianteData.voiture === "string"
                ? varianteData.voiture
                : varianteData.voiture._id;
            setVoitureIdActuel(voitureIdLocal);
          } else {
            throw new Error("VoitureId introuvable dans la variante");
          }
        } else if (voitureId) {
          setVoitureIdActuel(voitureId);
        }

        if (!voitureIdLocal) {
          throw new Error("ID de voiture manquant");
        }

        // Chargement parallèle de toutes les données (optimisation performance)
        const [
          responseVariantes,
          couleursExtData,
          couleursIntData,
          jantesData,
          siegesData,
          packagesData,
        ] = await Promise.all([
          modelPorscheService.getConfigurationsByVoiture(voitureIdLocal),
          personnalisationService.getCouleursExterieur(),
          personnalisationService.getCouleursInterieur(),
          personnalisationService.getJantes(),
          personnalisationService.getSieges(),
          personnalisationService.getPackages(),
        ]);

        const variantesData = Array.isArray(responseVariantes)
          ? responseVariantes
          : responseVariantes?.configurations || [];

        setVariantes(variantesData);
        setCouleursExt(couleursExtData);
        setCouleursInt(couleursIntData);

        // Filtrage des jantes (exclure taille 16)
        const jantesFiltrees = Array.isArray(jantesData)
          ? jantesData.filter((jante) => {
              const taille = String(jante.taille_jante);
              return taille !== "16";
            })
          : [];

        setJantes(jantesFiltrees);
        setSieges(siegesData);
        setPackages(packagesData);

        // Sélection de la variante par défaut
        if (variantesData.length > 0) {
          const varianteDefaut = varianteId
            ? variantesData.find((v) => v._id === varianteId)
            : variantesData[0];

          setVarianteSelectionnee(varianteDefaut || variantesData[0]);
        }
      } catch (err) {
        setError(err.message || "Erreur lors du chargement des options");
      } finally {
        setLoading(false);
      }
    };

    if (voitureId || varianteId) {
      fetchData();
    } else {
      setLoading(false);
      setError("Paramètres manquants : voitureId ou varianteId requis");
    }
  }, [voitureId, varianteId]);

  return {
    loading,
    error,
    voitureIdActuel,
    variantes,
    couleursExt,
    couleursInt,
    jantes,
    sieges,
    packages,
    varianteSelectionnee,
  };
};

export default useConfiguratorData;
