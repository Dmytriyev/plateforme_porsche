/**
 * usePhotoManager - Hook pour gérer les photos du configurateur
 *
 * Responsabilités :
 * - Filtrage des photos visibles
 * - Recherche de photos par couleur
 * - Gestion de l'index actif
 *
 * @param {Object} variante - Variante sélectionnée avec photos
 * @returns {Object} - Photos visibles et fonctions de navigation
 */
import { useState, useCallback, useMemo, useEffect } from "react";
import { debug } from "../utils/logger";

const usePhotoManager = (variante) => {
  const [photoActiveIndex, setPhotoActiveIndex] = useState(0);

  // Récupération des photos depuis la variante
  const allPhotos = useMemo(() => {
    return Array.isArray(variante?.photo_porsche) ? variante.photo_porsche : [];
  }, [variante]);

  // Filtrage des photos visibles (exclut indices 0-1 et id_0/id_1)
  const visiblePhotos = useMemo(() => {
    if (!Array.isArray(allPhotos)) return [];

    return allPhotos.filter((photo, index) => {
      const id = photo._id || photo.id || "";
      const name = photo.name || "";

      return (
        index >= 2 &&
        !(
          id === "id_0" ||
          id === "id_1" ||
          name.includes("id_0") ||
          name.includes("id_1")
        )
      );
    });
  }, [allPhotos]);

  // Recherche d'une photo par couleur (extérieure ou intérieure)
  const findPhotoIndexByCouleur = useCallback(
    (couleur, type) => {
      if (!couleur?._id || !type) {
        if (import.meta.env.DEV) {
          debug("findPhotoIndexByCouleur: couleur ou type manquant");
        }
        return null;
      }

      if (!["exterieur", "interieur"].includes(type)) {
        if (import.meta.env.DEV) {
          debug("findPhotoIndexByCouleur: type invalide", type);
        }
        return null;
      }

      if (visiblePhotos.length === 0) {
        if (import.meta.env.DEV) {
          debug("findPhotoIndexByCouleur: pas de photos disponibles");
        }
        return null;
      }

      const fieldName =
        type === "exterieur" ? "couleur_exterieur" : "couleur_interieur";

      const foundIndex = visiblePhotos.findIndex((photo) => {
        const photoCouleurId = photo[fieldName]?._id || photo[fieldName];
        return (
          photoCouleurId && photoCouleurId.toString() === couleur._id.toString()
        );
      });

      if (import.meta.env.DEV) {
        debug("findPhotoIndexByCouleur: foundIndex", foundIndex);
      }

      return foundIndex >= 0 ? foundIndex : null;
    },
    [visiblePhotos]
  );

  // Réinitialiser l'index si hors limites
  useEffect(() => {
    if (photoActiveIndex >= visiblePhotos.length && visiblePhotos.length > 0) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setPhotoActiveIndex(0);
    }
  }, [visiblePhotos.length, photoActiveIndex]);

  return {
    visiblePhotos,
    photoActiveIndex,
    setPhotoActiveIndex,
    findPhotoIndexByCouleur,
  };
};

export default usePhotoManager;
