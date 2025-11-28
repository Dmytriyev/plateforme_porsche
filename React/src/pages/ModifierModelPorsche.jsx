// modification d'un modèle Porsche d'occasion
import buildUrl from "../utils/buildUrl";
import modelPorscheService from "../services/modelPorsche.service.js";
import personnalisationService from "../services/personnalisation.service.js";
import voitureService from "../services/voiture.service.js";
import Loading from "../components/common/Loading.jsx";
import { useState, useEffect, useCallback, useMemo } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { formatPrice } from "../utils/helpers.js";
import { warn } from "../utils/logger.js";
import "../css/ModifierModelPorsche.css";

// Variantes disponibles par modèle de base Porsche 
const VARIANTES_PAR_MODELE = {
  911: ["Carrera S", "GTS", "Turbo", "GT3", "GT3 RS", "Targa GTS", "Targa 4S"],
  Cayman: ["GTS", "GT4 RS"],
  Cayenne: ["E-Hybrid", "S", "GTS"],
};
// Carrosseries disponibles par modèle de base Porsche
const CARROSSERIES_PAR_MODELE = {
  911: ["Coupe", "Cabriolet", "Targa"],
  Cayman: ["Coupe"],
  Cayenne: ["SUV"],
};
// Configuration des photos
const PHOTO_CONFIG = {
  MAX_COUNT: 15,
  MAX_SIZE_MB: 5,
  MAX_SIZE_BYTES: 5 * 1024 * 1024,
};
// Délai avant redirection après succès (ms)
const REDIRECT_DELAY = 1500;
// Composant principal 
const ModifierModelPorsche = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [voitures, setVoitures] = useState([]);
  const [couleursExt, setCouleursExt] = useState([]);
  const [couleursInt, setCouleursInt] = useState([]);
  const [jantes, setJantes] = useState([]);
  const [sieges, setSieges] = useState([]);
  const [packages, setPackages] = useState([]);
  // Options dynamiques selon le modèle sélectionné
  const [variantesDisponibles, setVariantesDisponibles] = useState([]);
  // Options dynamiques selon le modèle sélectionné
  const [carrosseriesDisponibles, setCarrosseriesDisponibles] = useState([]);
  const [photos, setPhotos] = useState([]); // Nouvelles photos à uploader
  const [photoPreviews, setPhotoPreviews] = useState([]); // Prévisualisations
  const [photosExistantes, setPhotosExistantes] = useState([]); // Photos actuelles
  const [photosASupprimer, setPhotosASupprimer] = useState([]); // IDs à supprimer
  const [formData, setFormData] = useState({
    voiture: "",
    nom_model: "",
    type_carrosserie: "",
    prix_base: "",
    description: "",
    numero_vin: "",
    concessionnaire: "",
    couleur_exterieur: "",
    couleur_interieur: "",
    taille_jante: "",
    siege: "",
    package: [],
    // Spécifications
    moteur: "",
    puissance: "",
    couple: "",
    transmission: "PDK",
    acceleration_0_100: "",
    vitesse_max: "",
    consommation: "",
    pack_sport_chrono: false,
    pack_weissach: false,
  });

  // Charge le modèle existant + toutes les options de personnalisation.
  useEffect(() => {
    if (!id) {
      setError("ID du modèle manquant");
      setLoading(false);
      return;
    }
    // Fonction asynchrone pour charger toutes les données nécessaires
    const fetchAllData = async () => {
      try {
        setLoading(true);
        setError("");
        // Chargement parallèle pour optimiser les performances
        const [
          modelData,
          voituresData,
          couleursExtData,
          couleursIntData,
          jantesData,
          siegesData,
          packagesData,
        ] = await Promise.all([
          modelPorscheService.getModelById(id),
          voitureService.getVoituresOccasion(),
          personnalisationService.getCouleursExterieur(),
          personnalisationService.getCouleursInterieur(),
          personnalisationService.getJantes(),
          personnalisationService.getSieges(),
          personnalisationService.getPackages(),
        ]);

        // Assurer que les données sont des tableaux
        setVoitures(Array.isArray(voituresData) ? voituresData : []);
        setCouleursExt(Array.isArray(couleursExtData) ? couleursExtData : []);
        // Couleurs intérieures
        setCouleursInt(
          Array.isArray(couleursIntData) ? couleursIntData : []
        );
        setJantes(Array.isArray(jantesData) ? jantesData : []);
        setSieges(Array.isArray(siegesData) ? siegesData : []);
        setPackages(Array.isArray(packagesData) ? packagesData : []);

        // Charger les photos existantes
        if (Array.isArray(modelData.photo_porsche)) {
          setPhotosExistantes(modelData.photo_porsche);
        }

        // Déterminer les variantes et carrosseries disponibles selon le modèle
        const nomModele = modelData.voiture?.nom_model || "";
        const variantes = VARIANTES_PAR_MODELE[nomModele] || [];
        const carrosseries = CARROSSERIES_PAR_MODELE[nomModele] || [];
        // Mettre à jour les options dynamiques
        setVariantesDisponibles(variantes);
        setCarrosseriesDisponibles(carrosseries);
        // Pré-remplir le formulaire avec les données du modèle
        setFormData({
          voiture: modelData.voiture?._id || "",
          nom_model: modelData.nom_model || "",
          type_carrosserie: modelData.type_carrosserie || "",
          prix_base: modelData.prix_base || "",
          description: modelData.description || "",
          numero_vin: modelData.numero_vin || "",
          concessionnaire: modelData.concessionnaire || "",
          couleur_exterieur: modelData.couleur_exterieur?._id || "",
          couleur_interieur: modelData.couleur_interieur?._id || "",
          taille_jante: modelData.taille_jante?._id || "",
          siege: modelData.siege?._id || "",
          // Packages (extraire les IDs)
          package: Array.isArray(modelData.package)
            ? modelData.package.map((p) => p._id || p)
            : [],
          moteur: modelData.specifications?.moteur || "",
          puissance: modelData.specifications?.puissance || "",
          couple: modelData.specifications?.couple || "",
          transmission: modelData.specifications?.transmission || "PDK",
          acceleration_0_100:
            modelData.specifications?.acceleration_0_100 || "",
          vitesse_max: modelData.specifications?.vitesse_max || "",
          consommation: modelData.specifications?.consommation || "",
        });
      } catch (err) {
        // Gestion des erreurs générale
        const errorMsg =
          err.message || "Erreur lors du chargement des données";
        setError(errorMsg);
        warn("Erreur lors du chargement du modèle :", err);
      } finally {
        setLoading(false);
      }
    };
    // Appeler la fonction de chargement
    fetchAllData();
  }, [id]);

  // Gestion des changements de formulaire
  const handleChange = useCallback(
    (e) => {
      // Extraire les valeurs de l'événement
      const { name, value, type, checked } = e.target;
      // Cas spécial : changement du modèle de base
      if (name === "voiture" && value) {
        // Mettre à jour les variantes et carrosseries disponibles selon le modèle sélectionné
        const voitureSelectionnee = voitures.find((v) => v._id === value);
        // si on trouve la voiture sélectionnée 
        if (voitureSelectionnee) {
          // Récupérer le nom_model pour déterminer les options
          const nomModele = voitureSelectionnee.nom_model || "";
          // Récupérer les variantes et carrosseries associées
          const variantes = VARIANTES_PAR_MODELE[nomModele] || [];
          // Récupérer les carrosseries associées
          const carrosseries = CARROSSERIES_PAR_MODELE[nomModele] || [];
          // Mettre à jour les options dynamiques
          setVariantesDisponibles(variantes);
          setCarrosseriesDisponibles(carrosseries);
          // Mettre à jour le formulaire (réinitialiser variante/carrosserie si incompatibles)
          setFormData((prev) => ({
            ...prev,
            voiture: value,
            nom_model: variantes.includes(prev.nom_model) ? prev.nom_model : "",
            type_carrosserie: carrosseries.includes(prev.type_carrosserie)
              ? prev.type_carrosserie
              : "",
          }));
          return;
        }
      }
      //  mise à jour simple
      // - Utilise la forme fonctionnelle de setState (`prev`) pour éviter les problèmes
      // - Conserve les champs existants avec `...prev` puis met à jour dynamiquement
      //   ciblée via la variable `name` (ex: 'prix_base', 'moteur').
      // - Pour les inputs de type checkbox, React fournit `checked` (bool),
      //   on stocke `checked` ; pour les autres inputs on stocke `value`.
      setFormData((prev) => ({
        ...prev,
        [name]: type === "checkbox" ? checked : value,
      }));
    },
    [voitures]
  );

  // - `package` est un tableau d'IDs (strings) représentant les packages sélectionnés.
  // - la mise à jour fonctionnelle (`prev`) 
  // - Si `checked` est vrai on ajoute l'ID (en conservant l'immuabilité via
  //   la création d'un nouveau tableau), sinon on filtre l'ID pour le supprimer.
  const handlePackageChange = useCallback((e) => {
    const { value, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      package: checked
        ? [...prev.package, value]
        : prev.package.filter((pkgId) => pkgId !== value),
    }));
  }, []);
  // Gestion de l'ajout de nouvelles photos
  const handlePhotoChange = useCallback(
    (e) => {
      const files = Array.from(e.target.files);
      // si aucun fichier sélectionné, on sort immédiatement
      if (files.length === 0) return;
      // nombre total de photos (existantes - marquées pour suppression + nouvelles)
      const totalPhotos =
        photosExistantes.length -
        photosASupprimer.length +
        photos.length +
        files.length;
      // si dépasse le max autorisé erreur
      if (totalPhotos > PHOTO_CONFIG.MAX_COUNT) {
        setError(
          `Maximum ${PHOTO_CONFIG.MAX_COUNT} photos autorisées (actuellement : ${photosExistantes.length - photosASupprimer.length} existantes + ${photos.length} nouvelles)`
        );
        return;
      }

      // taille de chaque fichier
      const invalidFiles = files.filter(
        (f) => f.size > PHOTO_CONFIG.MAX_SIZE_BYTES
      );
      // si des fichiers invalides, erreur
      if (invalidFiles.length > 0) {
        setError(
          `${invalidFiles.length} photo(s) dépassent la limite de ${PHOTO_CONFIG.MAX_SIZE_MB}MB`
        );
        return;
      }

      // Ajouter les fichiers valides
      setPhotos((prev) => [...prev, ...files]);

      // Générer les prévisualisations
      files.forEach((file) => {
        // Créer un FileReader pour lire le fichier
        const reader = new FileReader();
        reader.onloadend = () => {
          setPhotoPreviews((prev) => [...prev, reader.result]);
        };
        reader.onerror = () => {
          warn("Erreur lors de la lecture du fichier :", file.name);
        };
        // Lire le fichier en tant qu'URL de données (base64)
        reader.readAsDataURL(file);
      });

      setError("");
    },
    [photos.length, photosExistantes.length, photosASupprimer.length]
  );

  // Suppression d'une nouvelle photo avant upload
  const removePhoto = useCallback((index) => {
    // Filtrer la photo et la prévisualisation par index
    setPhotos((prev) => prev.filter((_, i) => i !== index));
    // Mettre à jour les prévisualisations
    setPhotoPreviews((prev) => prev.filter((_, i) => i !== index));
  }, []);

  // Marquer une photo existante pour suppression
  const supprimerPhotoExistante = useCallback((photoId) => {
    setPhotosASupprimer((prev) => [...prev, photoId]);
  }, []);

  // Annuler la suppression d'une photo existante
  const annulerSuppressionPhoto = useCallback((photoId) => {
    setPhotosASupprimer((prev) => prev.filter((id) => id !== photoId));
  }, []);

  // Liste des voitures uniques pour le select
  const uniqueVoitures = useMemo(() => {
    return voitures.filter(
      // Filtrer pour ne garder qu'une occurrence par nom_model
      (voiture, index, self) =>
        index === self.findIndex((v) => v.nom_model === voiture.nom_model)
    );
  }, [voitures]);

  // Calcul du nombre total de photos après modifications
  const _totalPhotos = useMemo(() => {
    return photosExistantes.length + photos.length;
  }, [photosExistantes.length, photos.length]);

  //  Désactivation du bouton de soumission
  const isSubmitDisabled = useMemo(() => {
    return saving || !formData.voiture || !formData.nom_model;
  }, [saving, formData.voiture, formData.nom_model]);

  // Gestion de la soumission du formulaire
  const handleSubmit = async (e) => {
    e.preventDefault();
    // Soumission asynchrone
    try {
      setSaving(true);
      setError("");
      setSuccess("");

      // Validation côté client
      if (!formData.voiture || !formData.nom_model) {
        setError("Le modèle de base et la variante sont obligatoires");
        setSaving(false);
        return;
      }

      // Préparation du payload à envoyer au backend
      const dataToSend = {
        voiture: formData.voiture,
        nom_model: formData.nom_model.trim(),
        type_carrosserie: formData.type_carrosserie || undefined,
        prix_base: parseFloat(formData.prix_base) || 0,
        description: formData.description?.trim() || undefined,
        numero_vin: formData.numero_vin?.trim() || undefined,
        concessionnaire: formData.concessionnaire?.trim() || undefined,
        couleur_exterieur: formData.couleur_exterieur || undefined,
        couleur_interieur: formData.couleur_interieur || undefined,
        taille_jante: formData.taille_jante || undefined,
        siege: formData.siege || undefined,
        package: formData.package.length > 0 ? formData.package : undefined,
      };

      // Construire l'objet specifications dynamiquement
      const specs = {};
      if (formData.moteur?.trim()) {
        specs.moteur = formData.moteur.trim();
      }
      if (formData.puissance) {
        specs.puissance = parseFloat(formData.puissance);
      }
      if (formData.couple) {
        specs.couple = parseFloat(formData.couple);
      }
      if (formData.transmission) {
        specs.transmission = formData.transmission;
      }
      if (formData.acceleration_0_100) {
        specs.acceleration_0_100 = parseFloat(formData.acceleration_0_100);
      }
      if (formData.vitesse_max) {
        specs.vitesse_max = parseFloat(formData.vitesse_max);
      }
      if (formData.consommation) {
        specs.consommation = parseFloat(formData.consommation);
      }

      // Ajouter specifications seulement s'il y a des données
      if (Object.keys(specs).length > 0) {
        dataToSend.specifications = specs;
      }

      // 1 : Mettre à jour les informations du modèle
      await modelPorscheService.updateModelPorsche(id, dataToSend);

      // 2 : Supprimer les photos marquées
      if (photosASupprimer.length > 0) {
        try {
          await modelPorscheService.supprimerPhotos(id, {
            photo_porsche: photosASupprimer,
          });
        } catch (photoError) {
          warn("Erreur lors de la suppression des photos :", photoError);
          // On continue malgré l'erreur pour ne pas bloquer l'upload
        }
      }

      // 3 : Upload des nouvelles photos
      if (photos.length > 0) {
        // Préparer le FormData pour l'upload
        const photoFormData = new FormData();
        // Ajouter chaque photo au FormData
        photos.forEach((photo) => {
          photoFormData.append("photos", photo);
        });
        // Ajouter l'ID du modèle pour association
        photoFormData.append("model_porsche", id);

        // Générer un texte alt descriptif
        const altText = `Porsche ${formData.nom_model} ${formData.type_carrosserie || ""}`.trim();
        // Ajouter le texte alt au FormData
        photoFormData.append("alt", altText);

        try {
          await modelPorscheService.ajouterPhotos(id, photoFormData);
        } catch (photoError) {
          warn("Erreur lors de l'ajout des photos :", photoError);
          // On continue pour permettre la redirection
        }
      }

      // Succès : afficher message et rediriger
      setSuccess("Voiture modifiée avec succès !");
      // Redirection après un court délai
      setTimeout(() => {
        navigate(`/occasion/${id}`);
      }, REDIRECT_DELAY);
    } catch (err) {
      // Gestion des erreurs lors de la soumission
      const errorMsg =
        err.message || "Erreur lors de la modification du modèle";
      setError(errorMsg);
      warn("Erreur lors de la soumission :", err);
    } finally {
      setSaving(false);
    }
  };
  // si en chargement, afficher le composant Loading
  if (loading) {
    return <Loading fullScreen message="Chargement..." />;
  }
  // Rendu du formulaire de modification
  return (
    <div className="ajouter-model-porsche-container">
      <div className="ajouter-model-porsche-breadcrumb">
        <button
          className="ajouter-model-porsche-back-btn"
          onClick={() => navigate(-1)}
        >
          ← Retour
        </button>
      </div>

      <div className="ajouter-model-porsche-header">
        <h1 className="ajouter-model-porsche-title">Modifier la voiture</h1>
        <p className="ajouter-model-porsche-subtitle">
          Modifiez les informations de la voiture
        </p>
      </div>

      <div className="ajouter-model-porsche-content">
        {error && (
          <div className="message-box message-error">
            <p>{error}</p>
          </div>
        )}
        {success && (
          <div className="message-box message-success">
            <p>{success}</p>
          </div>
        )}
        <form onSubmit={handleSubmit} className="ajouter-model-porsche-form">
          {/* Informations de base */}
          <div className="ajouter-model-porsche-section">
            <h2 className="ajouter-model-porsche-section-title">
              Informations de base
            </h2>

            <div className="ajouter-model-porsche-form-row">
              <div className="ajouter-model-porsche-form-group">
                <label
                  htmlFor="voiture"
                  className="ajouter-model-porsche-label"
                >
                  Modèle de base *{" "}
                  <span className="label-hint">(911, Cayenne, etc.)</span>
                </label>
                <select
                  id="voiture"
                  name="voiture"
                  value={formData.voiture}
                  onChange={handleChange}
                  className="ajouter-model-porsche-select"
                  required
                >
                  <option value="">-- Sélectionner un modèle --</option>
                  {uniqueVoitures.map((voiture) => (
                    <option key={voiture._id} value={voiture._id}>
                      {voiture.nom_model}
                    </option>
                  ))}
                </select>
              </div>

              <div className="ajouter-model-porsche-form-group">
                <label
                  htmlFor="nom_model"
                  className="ajouter-model-porsche-label"
                >
                  Variante *{" "}
                  <span className="label-hint">
                    (Carrera S, GTS, Turbo, etc.)
                  </span>
                </label>
                <select
                  id="nom_model"
                  name="nom_model"
                  value={formData.nom_model}
                  onChange={handleChange}
                  className="ajouter-model-porsche-select"
                  required
                  disabled={
                    !formData.voiture || variantesDisponibles.length === 0
                  }
                >
                  {/* Variantes disponibles en fonction du modèle sélectionné */}
                  <option value="">-- Sélectionner une variante --</option>
                  {variantesDisponibles.map((variante, index) => (
                    <option key={index} value={variante}>
                      {variante}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="ajouter-model-porsche-form-row">
              <div className="ajouter-model-porsche-form-group">
                <label
                  htmlFor="type_carrosserie"
                  className="ajouter-model-porsche-label"
                >
                  Type de carrosserie
                </label>
                <select
                  id="type_carrosserie"
                  name="type_carrosserie"
                  value={formData.type_carrosserie}
                  onChange={handleChange}
                  className="ajouter-model-porsche-select"
                  disabled={
                    !formData.voiture || carrosseriesDisponibles.length === 0
                  }
                >
                  {/* Types de carrosserie disponibles en fonction du modèle sélectionné */}
                  <option value="">-- Sélectionner --</option>
                  {carrosseriesDisponibles.map((carrosserie, index) => (
                    <option key={index} value={carrosserie}>
                      {carrosserie}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="ajouter-model-porsche-form-group">
              <label
                htmlFor="prix_base"
                className="ajouter-model-porsche-label"
              >
                Prix (€) *
              </label>
              <input
                type="number"
                id="prix_base"
                name="prix_base"
                value={formData.prix_base}
                onChange={handleChange}
                className="ajouter-model-porsche-input"
                required
                placeholder="85000"
                min="0"
                step="1000"
              />
            </div>

            <div className="ajouter-model-porsche-form-group">
              <label
                htmlFor="description"
                className="ajouter-model-porsche-label"
              >
                Description
              </label>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                className="ajouter-model-porsche-textarea"
                rows="4"
                placeholder="Description détaillée du véhicule..."
              />
            </div>
          </div>

          {/* Informations concessionnaire */}
          <div className="ajouter-model-porsche-section">
            <h2 className="ajouter-model-porsche-section-title">
              Informations concessionnaire
            </h2>

            <div className="ajouter-model-porsche-form-row">
              <div className="ajouter-model-porsche-form-group">
                <label
                  htmlFor="numero_vin"
                  className="ajouter-model-porsche-label"
                >
                  Numéro VIN
                </label>
                <input
                  type="text"
                  id="numero_vin"
                  name="numero_vin"
                  value={formData.numero_vin}
                  onChange={handleChange}
                  className="ajouter-model-porsche-input"
                  placeholder="WP0ZZZ99ZTS392155"
                />
              </div>

              <div className="ajouter-model-porsche-form-group">
                <label
                  htmlFor="concessionnaire"
                  className="ajouter-model-porsche-label"
                >
                  Concessionnaire
                </label>
                <input
                  type="text"
                  id="concessionnaire"
                  name="concessionnaire"
                  value={formData.concessionnaire}
                  onChange={handleChange}
                  className="ajouter-model-porsche-input"
                  placeholder="Porsche Centre Paris"
                />
              </div>
            </div>
          </div>

          {/* Permet de configurer l'apparence du véhicule : couleurs, jantes, sièges, packages */}
          <div className="ajouter-model-porsche-section">
            <h2 className="ajouter-model-porsche-section-title">
              Personnalisation
            </h2>

            <div className="ajouter-model-porsche-form-row">
              <div className="ajouter-model-porsche-form-group">
                <label
                  htmlFor="couleur_exterieur"
                  className="ajouter-model-porsche-label"
                >
                  Couleur extérieure
                </label>
                {/* 
                  Couleurs extérieures disponibles
                  - personnalisationService.getCouleursExterieur()
                  - key = couleur._id (MongoDB ObjectId unique)
                  - value = couleur._id (référence pour le modèle)
                  -  nom_couleur + prix additionnel si > 0
                */}
                <select
                  id="couleur_exterieur"
                  name="couleur_exterieur"
                  value={formData.couleur_exterieur}
                  onChange={handleChange}
                  className="ajouter-model-porsche-select"
                >
                  <option value="">-- Sélectionner --</option>
                  {couleursExt.map((couleur) => (
                    <option key={couleur._id} value={couleur._id}>
                      {couleur.nom_couleur}{" "}
                      {couleur.prix > 0
                        ? `(+${formatPrice(couleur.prix)})`
                        : ""}
                    </option>
                  ))}
                </select>
              </div>

              <div className="ajouter-model-porsche-form-group">
                <label
                  htmlFor="couleur_interieur"
                  className="ajouter-model-porsche-label"
                >
                  Couleur intérieure
                </label>
                {/* 
                  Couleurs intérieures disponibles
                  - personnalisationService.getCouleursInterieur()
                  -  nom_couleur + prix additionnel si > 0
                */}
                <select
                  id="couleur_interieur"
                  name="couleur_interieur"
                  value={formData.couleur_interieur}
                  onChange={handleChange}
                  className="ajouter-model-porsche-select"
                >
                  <option value="">-- Sélectionner --</option>
                  {couleursInt.map((couleur) => (
                    <option key={couleur._id} value={couleur._id}>
                      {couleur.nom_couleur}{" "}
                      {couleur.prix > 0
                        ? `(+${formatPrice(couleur.prix)})`
                        : ""}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="ajouter-model-porsche-form-row">
              <div className="ajouter-model-porsche-form-group">
                <label
                  htmlFor="taille_jante"
                  className="ajouter-model-porsche-label"
                >
                  Jantes
                </label>
                {/* 
                  Jantes disponibles
                  - personnalisationService.getJantes()
                  - taille_jante (en pouces) + description + prix
                  - 20" - Jantes sport (+2 500 €)
                */}
                <select
                  id="taille_jante"
                  name="taille_jante"
                  value={formData.taille_jante}
                  onChange={handleChange}
                  className="ajouter-model-porsche-select"
                >
                  <option value="">-- Sélectionner --</option>
                  {jantes.map((jante) => (
                    <option key={jante._id} value={jante._id}>
                      {jante.taille_jante}" - {jante.description}{" "}
                      {jante.prix > 0 ? `(+${formatPrice(jante.prix)})` : ""}
                    </option>
                  ))}
                </select>
              </div>

              <div className="ajouter-model-porsche-form-group">
                <label htmlFor="siege" className="ajouter-model-porsche-label">
                  Sièges
                </label>
                {/* 
                  Types de sièges disponibles
                  - personnalisationService.getSieges()
                  - type_siege + prix additionnel si > 0
                  - Sièges sport baquets (+1 800 €)
                */}
                <select
                  id="siege"
                  name="siege"
                  value={formData.siege}
                  onChange={handleChange}
                  className="ajouter-model-porsche-select"
                >
                  <option value="">-- Sélectionner --</option>
                  {sieges.map((siege) => (
                    <option key={siege._id} value={siege._id}>
                      {siege.type_siege}{" "}
                      {siege.prix > 0 ? `(+${formatPrice(siege.prix)})` : ""}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* 
               Packages optionnels cumulables
              - personnalisationService.getPackages()
              - Permet la sélection multiple
              - formData.package est un tableau d'IDs
              -  Pack Sport Chrono, Pack Weissach, etc.
            */}
            <div className="ajouter-model-porsche-form-group">
              <label className="ajouter-model-porsche-label">Packages</label>
              <div className="ajouter-model-porsche-checkbox-list">
                {packages.map((pkg) => (
                  <label
                    key={pkg._id}
                    className="ajouter-model-porsche-checkbox-label"
                  >
                    <input
                      type="checkbox"
                      value={pkg._id}
                      checked={formData.package.includes(pkg._id)}
                      onChange={handlePackageChange}
                      className="ajouter-model-porsche-checkbox"
                    />
                    <span>
                      {pkg.nom_package}{" "}
                      {pkg.prix > 0 ? `(+${formatPrice(pkg.prix)})` : ""}
                    </span>
                  </label>
                ))}
              </div>
            </div>
          </div>

          {/* Spécifications techniques */}
          <div className="ajouter-model-porsche-section">
            <h2 className="ajouter-model-porsche-section-title">
              Spécifications techniques
            </h2>

            <div className="ajouter-model-porsche-form-group">
              <label htmlFor="moteur" className="ajouter-model-porsche-label">
                Moteur *
              </label>
              <input
                type="text"
                id="moteur"
                name="moteur"
                value={formData.moteur}
                onChange={handleChange}
                className="ajouter-model-porsche-input"
                placeholder="Flat-6 4.0L bi-turbo"
                required
              />
            </div>

            <div className="ajouter-model-porsche-form-row">
              <div className="ajouter-model-porsche-form-group">
                <label
                  htmlFor="puissance"
                  className="ajouter-model-porsche-label"
                >
                  Puissance (ch) *
                </label>
                <input
                  type="number"
                  id="puissance"
                  name="puissance"
                  value={formData.puissance}
                  onChange={handleChange}
                  className="ajouter-model-porsche-input"
                  placeholder="385"
                  min="0"
                  required
                />
              </div>

              <div className="ajouter-model-porsche-form-group">
                <label htmlFor="couple" className="ajouter-model-porsche-label">
                  Couple (Nm)
                </label>
                <input
                  type="number"
                  id="couple"
                  name="couple"
                  value={formData.couple}
                  onChange={handleChange}
                  className="ajouter-model-porsche-input"
                  placeholder="450"
                  min="0"
                />
              </div>
            </div>

            <div className="ajouter-model-porsche-form-row">
              <div className="ajouter-model-porsche-form-group">
                <label
                  htmlFor="transmission"
                  className="ajouter-model-porsche-label"
                >
                  Transmission *
                </label>
                <select
                  id="transmission"
                  name="transmission"
                  value={formData.transmission}
                  onChange={handleChange}
                  className="ajouter-model-porsche-select"
                  required
                >
                  <option value="PDK">PDK</option>
                  <option value="Manuelle">Manuelle</option>
                  <option value="Tiptronic">Tiptronic</option>
                </select>
              </div>

              <div className="ajouter-model-porsche-form-group">
                <label
                  htmlFor="acceleration_0_100"
                  className="ajouter-model-porsche-label"
                >
                  Accélération 0-100 km/h (s) *
                </label>
                <input
                  type="number"
                  id="acceleration_0_100"
                  name="acceleration_0_100"
                  value={formData.acceleration_0_100}
                  onChange={handleChange}
                  className="ajouter-model-porsche-input"
                  placeholder="4.2"
                  step="0.1"
                  min="0"
                  required
                />
              </div>
            </div>

            <div className="ajouter-model-porsche-form-row">
              <div className="ajouter-model-porsche-form-group">
                <label
                  htmlFor="vitesse_max"
                  className="ajouter-model-porsche-label"
                >
                  Vitesse max (km/h) *
                </label>
                <input
                  type="number"
                  id="vitesse_max"
                  name="vitesse_max"
                  value={formData.vitesse_max}
                  onChange={handleChange}
                  className="ajouter-model-porsche-input"
                  placeholder="293"
                  min="0"
                  required
                />
              </div>

              <div className="ajouter-model-porsche-form-group">
                <label
                  htmlFor="consommation"
                  className="ajouter-model-porsche-label"
                >
                  Consommation (L/100km) *
                </label>
                <input
                  type="number"
                  id="consommation"
                  name="consommation"
                  value={formData.consommation}
                  onChange={handleChange}
                  className="ajouter-model-porsche-input"
                  placeholder="10.5"
                  step="0.1"
                  min="0"
                  required
                />
              </div>
            </div>
          </div>

          {/* Photos existantes */}
          {photosExistantes.length > 0 && (
            <div className="ajouter-model-porsche-section">
              <h2 className="ajouter-model-porsche-section-title">
                Photos existantes
                <span className="label-hint">
                  {" "}
                  ({photosExistantes.length - photosASupprimer.length} photo(s))
                </span>
              </h2>
              <div className="ajouter-model-porsche-photo-grid">
                {photosExistantes.map((photo) => {
                  const isMarkedForDeletion = photosASupprimer.includes(photo._id);
                  return (
                    <div
                      key={photo._id}
                      className={`ajouter-model-porsche-photo-item ${isMarkedForDeletion ? "marked-delete" : ""
                        }`}
                    >
                      <img
                        src={buildUrl(photo.name)}
                        alt={photo.alt || "Photo Porsche"}
                        loading="lazy"
                      />
                      {/* annuler la suppression */}
                      {isMarkedForDeletion ? (
                        <button
                          type="button"
                          onClick={() => annulerSuppressionPhoto(photo._id)}
                          className="ajouter-model-porsche-photo-restore"
                          title="Annuler la suppression"
                        >
                          <svg
                            width="20"
                            height="20"
                            viewBox="0 0 20 20"
                            fill="none"
                          >
                            <path
                              d="M4 10L8 14L16 6"
                              stroke="currentColor"
                              strokeWidth="2"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            />
                          </svg>
                          Annuler
                        </button>
                      ) : (
                        // marquer pour suppression 
                        <button
                          type="button"
                          onClick={() => supprimerPhotoExistante(photo._id)}
                          className="ajouter-model-porsche-photo-remove"
                          title="Marquer pour suppression"
                        >
                          ×
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Ajouter de nouvelles photos */}
          <div className="ajouter-model-porsche-section">
            <h2 className="ajouter-model-porsche-section-title">
              Ajouter de nouvelles photos
              <span className="label-hint">
                {" "}
                (Maximum 15 photos au total, 5MB par photo)
              </span>
            </h2>

            <div className="ajouter-model-porsche-upload-area">
              <input
                type="file"
                id="photos"
                name="photos"
                accept="image/*"
                multiple
                onChange={handlePhotoChange}
                className="ajouter-model-porsche-file-input"
              />
              <label
                htmlFor="photos"
                className="ajouter-model-porsche-upload-label"
              >
                <svg
                  width="48"
                  height="48"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                  <polyline points="17 8 12 3 7 8" />
                  <line x1="12" y1="3" x2="12" y2="15" />
                </svg>
                <span>Cliquez pour ajouter des photos</span>
                <span className="upload-hint">
                  ou glissez-déposez vos images ici
                </span>
              </label>
            </div>
            {photoPreviews.length > 0 && (
              <div className="ajouter-model-porsche-photo-grid">
                {photoPreviews.map((preview, index) => (
                  <div key={index} className="ajouter-model-porsche-photo-item">
                    <img src={preview} alt={`Preview ${index + 1}`} />
                    <button
                      type="button"
                      className="ajouter-model-porsche-photo-remove"
                      onClick={() => removePhoto(index)}
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="ajouter-model-porsche-actions">
            <button
              type="button"
              className="ajouter-model-porsche-btn ajouter-model-porsche-btn-cancel"
              onClick={() => navigate(-1)}
              disabled={saving}
            >
              Annuler
            </button>
            <button
              type="submit"
              className="ajouter-model-porsche-btn ajouter-model-porsche-btn-save"
              disabled={isSubmitDisabled}
              aria-busy={saving}
            >
              {saving
                ? "Enregistrement en cours..."
                : "Enregistrer les modifications"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ModifierModelPorsche;
