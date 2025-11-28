// Hook personnalisé pour gérer les photos des accessoires
import { useState, useCallback } from "react";
// Gestion des photos des accessoires
const useAccessoirePhotos = (maxPhotos = 10, maxSize = 5) => {
  const [photos, setPhotos] = useState([]);
  const [photoPreviews, setPhotoPreviews] = useState([]);
  const [photoError, setPhotoError] = useState("");
  // Ajouter des photos avec validation
  const ajouterPhotos = useCallback(
    (files) => {
      // Validation: max photos
      if (photos.length + files.length > maxPhotos) {
        // Erreur si dépassement du max
        setPhotoError(`Maximum ${maxPhotos} photos autorisées`);
        setTimeout(() => setPhotoError(""), 3000);
        return false;
      }

      // Validation: taille max par fichier
      const maxSizeBytes = maxSize * 1024 * 1024;
      const invalidFiles = files.filter((file) => file.size > maxSizeBytes);
      //   Validation: taille max par fichier
      if (invalidFiles.length > 0) {
        setPhotoError(`Chaque photo doit faire moins de ${maxSize}MB`);
        setTimeout(() => setPhotoError(""), 3000);
        return false;
      }

      // Ajouter les photos
      setPhotos((prev) => [...prev, ...files]);

      // Créer les previews
      files.forEach((file) => {
        // Générer l'aperçu de la photo
        const reader = new FileReader();
        reader.onloadend = () => {
          setPhotoPreviews((prev) => [...prev, reader.result]);
        };
        reader.readAsDataURL(file);
      });

      return true;
    },
    [photos.length, maxPhotos, maxSize]
  );

  // Supprimer une photo et son aperçu
  const supprimerPhoto = useCallback((index) => {
    // Garder tous les éléments sauf celui à l'index spécifié
    const garderSaufIndex = (tableau) => {
      return tableau.filter((_, position) => position !== index);
    };
    // Mettre à jour les états
    setPhotos(garderSaufIndex);
    setPhotoPreviews(garderSaufIndex);
  }, []);

  // Reset
  const resetPhotos = useCallback(() => {
    // Réinitialiser les états
    setPhotos([]);
    setPhotoPreviews([]);
    setPhotoError("");
  }, []);

  return {
    photos,
    photoPreviews,
    photoError,
    ajouterPhotos,
    supprimerPhoto,
    resetPhotos,
  };
};

export default useAccessoirePhotos;
