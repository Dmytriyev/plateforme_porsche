/**
 * usePhotoNavigation - Hook pour gérer la navigation dans une galerie
 *
 * Principe SOLID : Logique réutilisable
 *
 * @param {number} totalPhotos - Nombre total de photos
 * @returns {Object} - { activeIndex, setActiveIndex, nextPhoto, prevPhoto }
 */
import { useState, useCallback } from "react";

const usePhotoNavigation = (totalPhotos = 0) => {
  const [activeIndex, setActiveIndex] = useState(0);

  const nextPhoto = useCallback(() => {
    setActiveIndex((prev) => (prev === totalPhotos - 1 ? 0 : prev + 1));
  }, [totalPhotos]);

  const prevPhoto = useCallback(() => {
    setActiveIndex((prev) => (prev === 0 ? totalPhotos - 1 : prev - 1));
  }, [totalPhotos]);

  return {
    activeIndex,
    setActiveIndex,
    nextPhoto,
    prevPhoto,
  };
};

export default usePhotoNavigation;
