// Hook personnalisé pour gérer les photos des accessoires
import { useState, useCallback, useRef, useEffect } from "react";
// Constantes de configuration
const MAX_PHOTOS = 10;
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
// Hook principal de gestion des photos
const useAccessoirePhotoManager = (initialPhotos = []) => {
  // États pour les photos et erreurs
  const [photosExistantes, _setPhotosExistantes] = useState(
    initialPhotos || []
  );
  // Photos existantes marquées pour suppression
  const [photosASupprimer, setPhotosASupprimer] = useState([]);
  // Nouvelles photos à ajouter
  const [nouvellesPhotos, setNouvellesPhotos] = useState([]);
  // Prévisualisations des nouvelles photos
  const [photosPreviews, setPhotosPreviews] = useState([]);
  // État pour les messages d'erreur temporaires
  const [error, setError] = useState("");
  // Indicateur de montage pour éviter les mises à jour d'état après démontage
  const isMounted = useRef(true);

  // Cleanup au démontage
  useEffect(() => {
    return () => {
      isMounted.current = false;
    };
  }, []);

  // Mettre à jour photosExistantes quand initialPhotos change
  // NOTE: `photosExistantes` est initialisé via `useState(initialPhotos)`.
  // Si `initialPhotos` change après le montage, la synchronisation doit
  // être gérée par le composant parent. Eviter d'appeler setState()
  // directement dans un effet pour prévenir des rendus en cascade.
  const showTemporaryError = useCallback((message, duration = 3000) => {
    setError(message);
    setTimeout(() => {
      if (isMounted.current) setError("");
    }, duration);
  }, []);

  // Marquer photo existante pour suppression
  const marquerPourSuppression = useCallback((photoId) => {
    setPhotosASupprimer((prev) => [...prev, photoId]);
  }, []);

  // Annuler suppression
  const annulerSuppression = useCallback((photoId) => {
    setPhotosASupprimer((prev) => prev.filter((id) => id !== photoId));
  }, []);

  // Valider fichiers
  const validerFichiers = useCallback(
    (files) => {
      const totalPhotosApres =
        photosExistantes.length -
        photosASupprimer.length +
        nouvellesPhotos.length +
        files.length;
      // Vérifier si le nombre total de photos dépasse la limite
      if (totalPhotosApres > MAX_PHOTOS) {
        return {
          valide: false,
          erreur: `Maximum ${MAX_PHOTOS} photos autorisées`,
        };
      }
      // Vérifier la taille des fichiers sélectionnés
      const fichiersInvalides = files.filter((f) => f.size > MAX_FILE_SIZE);
      if (fichiersInvalides.length > 0) {
        return {
          valide: false,
          erreur: "Chaque photo doit faire moins de 5MB",
        };
      }
      // Vérifier les types de fichiers (uniquement images)
      const typesInvalides = files.filter((f) => !f.type.startsWith("image/"));
      if (typesInvalides.length > 0) {
        return { valide: false, erreur: "Seules les images sont autorisées" };
      }

      return { valide: true };
    },
    // Dépendances pour recalculer la validation
    [photosExistantes.length, photosASupprimer.length, nouvellesPhotos.length]
  );

  // Ajouter nouvelles photos
  const ajouterNouvellesPhotos = useCallback(
    (files) => {
      // Convertir FileList en Array
      const filesArray = Array.from(files);
      // Valider fichiers avant ajout
      const validation = validerFichiers(filesArray);
      if (!validation.valide) {
        showTemporaryError(validation.erreur);
        return false;
      }
      // Ajouter aux nouvelles photos à ajouter
      setNouvellesPhotos((prev) => [...prev, ...filesArray]);

      // Générer prévisualisations
      filesArray.forEach((file) => {
        // Lire le fichier pour prévisualisation
        const reader = new FileReader();
        // Quand la lecture est terminée, ajouter la prévisualisation
        reader.onloadend = () => {
          // Vérifier que le composant est toujours monté avant de mettre à jour l'état
          if (isMounted.current) {
            // Ajouter la prévisualisation
            setPhotosPreviews((prev) => [...prev, reader.result]);
          }
        };
        // Gérer les erreurs de lecture
        reader.onerror = () => {
          // Vérifier que le composant est toujours monté avant de mettre à jour l'état
          if (isMounted.current) {
            showTemporaryError("Erreur lors de la lecture du fichier");
          }
        };
        reader.readAsDataURL(file);
      });

      return true;
    },
    // Dépendances pour recalculer l'ajout
    [validerFichiers, showTemporaryError]
  );
  // Supprimer nouvelle photo
  const supprimerNouvellePhoto = useCallback((index) => {
    // Retirer de nouvellesPhotos et photosPreviews
    setNouvellesPhotos((prev) => prev.filter((_, i) => i !== index));
    // Retirer la prévisualisation correspondante
    setPhotosPreviews((prev) => prev.filter((_, i) => i !== index));
  }, []);

  // Calculer total après modifications
  const totalPhotosApres =
    photosExistantes.length - photosASupprimer.length + nouvellesPhotos.length;

  return {
    photosExistantes,
    photosASupprimer,
    nouvellesPhotos,
    photosPreviews,
    error,
    totalPhotosApres,
    marquerPourSuppression,
    annulerSuppression,
    ajouterNouvellesPhotos,
    supprimerNouvellePhoto,
  };
};

export default useAccessoirePhotoManager;
