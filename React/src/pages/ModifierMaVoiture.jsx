// modifier une voiture personnelle (édition des infos et gestion des photos)
import buildUrl from "../utils/buildUrl";
import maVoitureService from "../services/ma_voiture.service.js";
import personnalisationService from "../services/personnalisation.service.js";
import Loading from "../components/common/Loading.jsx";
import ImageWithFallback from "../components/common/ImageWithFallback.jsx";
import { formatPrice } from "../utils/helpers.js";
import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import "../css/ModifierMaVoiture.css";

const ModifierMaVoiture = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  // Données de la voiture  
  const [voiture, setVoiture] = useState(null);
  // Options de personnalisation  
  const [couleursExt, setCouleursExt] = useState([]);
  const [couleursInt, setCouleursInt] = useState([]);
  const [jantes, setJantes] = useState([]);
  // Gestion des photos de la voiture
  const [photosExistantes, setPhotosExistantes] = useState([]);
  const [nouvellesPhotos, setNouvellesPhotos] = useState([]);
  const [photosPreviews, setPhotosPreviews] = useState([]);
  const [photosASupprimer, setPhotosASupprimer] = useState([]);

  // Formulaire
  const [formData, setFormData] = useState({
    type_model: "",
    annee_production: "",
    couleur_exterieur: "",
    couleur_interieur: "",
    taille_jante: "",
    info_moteur: "",
    info_transmission: "",
  });

  useEffect(() => {
    // Fonction pour charger les données initiales
    const fetchData = async () => {
      try {
        setLoading(true);
        setError("");

        // Charger la voiture et les options en parallèle
        const [
          voitureData,
          couleursExtData,
          couleursIntData,
          jantesData,
        ] = await Promise.all([
          // Récupérer les infos de la voiture à modifier
          maVoitureService.getMaVoitureById(id),
          personnalisationService.getCouleursExterieur(),
          personnalisationService.getCouleursInterieur(),
          personnalisationService.getJantes(),
        ]);
        // Mettre à jour les états avec les données récupérées
        setVoiture(voitureData);
        setCouleursExt(couleursExtData);
        setCouleursInt(couleursIntData);
        setJantes(jantesData);
        // Charger les photos existantes de la voiture
        if (Array.isArray(voitureData.photo_voiture_actuel)) {
          setPhotosExistantes(voitureData.photo_voiture_actuel);
        }

        // Pré-remplir le formulaire avec les données de la voiture
        setFormData({
          type_model: voitureData.type_model || "",
          // Format date pour input type="date" si disponible sinon vide
          annee_production: voitureData.annee_production
            ? new Date(voitureData.annee_production).toISOString().split("T")[0]
            : "",
          couleur_exterieur: voitureData.couleur_exterieur?._id || "",
          couleur_interieur: voitureData.couleur_interieur?._id || "",
          taille_jante: voitureData.taille_jante?._id || "",
          info_moteur: voitureData.info_moteur || "",
          info_transmission: voitureData.info_transmission || "",
        });
      } catch (err) {
        // Afficher l'erreur si échec du chargement
        setError(err.message || "Erreur lors du chargement des données");
      } finally {
        setLoading(false);
      }
    };
    // Lancer le chargement des données si un id est présent
    if (id) {
      fetchData();
    }
  }, [id]);

  // Gestion des changements dans le formulaire
  const handleChange = (e) => {
    // Gérer les changements pour les inputs, selects et checkboxes
    const { name, value, type, checked } = e.target;
    // Mettre à jour le state du formulaire
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  // Gestion des changements de photos
  const handlePhotoChange = (e) => {
    // Gérer l'ajout de nouvelles photos
    const files = Array.from(e.target.files);
    // si aucun fichier sélectionné, ne rien faire
    if (files.length === 0) return;

    // Limiter à 10 photos au total
    const totalPhotos =
      photosExistantes.length -
      photosASupprimer.length +
      nouvellesPhotos.length +
      files.length;
    // si plus de 10, afficher une erreur et ne pas ajouter
    if (totalPhotos > 10) {
      setError("Maximum 10 photos au total");
      return;
    }
    // Vérifier la taille des fichiers (5MB max)
    const maxSize = 5 * 1024 * 1024;
    const invalidFiles = files.filter((f) => f.size > maxSize);
    // si des fichiers invalides, afficher une erreur et ne pas ajouter
    if (invalidFiles.length > 0) {
      setError("Certaines photos dépassent 5MB");
      return;
    }
    // Ajouter les nouvelles photos au state 
    setNouvellesPhotos((prev) => [...prev, ...files]);
    // Créer les previews des nouvelles photos
    files.forEach((file) => {
      // Lire le fichier pour prévisualisation
      const reader = new FileReader();
      reader.onloadend = () => {
        // Ajouter la prévisualisation au state
        setPhotosPreviews((prev) => [...prev, reader.result]);
      };
      reader.readAsDataURL(file);
    });
    setError("");
  };
  // Gestion de la suppression des photos existantes et nouvelles
  const supprimerPhotoExistante = (photoId) => {
    // Marquer la photo pour suppression
    setPhotosASupprimer((prev) => [...prev, photoId]);
  };
  // Annuler la suppression d'une photo existante
  const annulerSuppressionPhoto = (photoId) => {
    setPhotosASupprimer((prev) => prev.filter((id) => id !== photoId));
  };
  // Supprimer une nouvelle photo ajoutée
  const supprimerNouvellePhoto = (index) => {
    // Supprimer une nouvelle photo et sa prévisualisation
    setNouvellesPhotos((prev) => prev.filter((_, i) => i !== index));
    setPhotosPreviews((prev) => prev.filter((_, i) => i !== index));
  };
  // Gestion de la soumission du formulaire
  const handleSubmit = async (e) => {
    e.preventDefault();
    // Valider les champs obligatoires
    try {
      setSaving(true);
      setError("");
      setSuccess("");

      // Préparer les données pour l'API
      const updateData = {
        // Champs du formulaire 
        type_model: formData.type_model,
        annee_production: formData.annee_production,
        couleur_exterieur: formData.couleur_exterieur || undefined,
        couleur_interieur: formData.couleur_interieur || undefined,
        taille_jante: formData.taille_jante || undefined,
        info_moteur: formData.info_moteur || undefined,
        info_transmission: formData.info_transmission || undefined,
      };
      // Envoyer la requête de mise à jour
      await maVoitureService.updateMaVoiture(id, updateData);
      // si des photos à supprimer, les supprimer
      if (photosASupprimer.length > 0) {
        try {
          // Supprimer les photos existantes marquées pour suppression
          await maVoitureService.supprimerPhotos(id, {
            photo_voiture_actuel: photosASupprimer,
          });
        } catch (photoError) {
          setError("Erreur lors de la suppression des photos");
        }
      }
      // Ajouter les nouvelles photos (une par une)
      if (nouvellesPhotos.length > 0) {
        const photoIds = [];

        try {
          // Uploader chaque photo individuellement
          for (const photo of nouvellesPhotos) {
            // Préparer le FormData pour l'upload
            const photoFormData = new FormData();
            // Champs requis pour l'API
            photoFormData.append("photos", photo);
            // Associer la photo à la voiture modifiée
            photoFormData.append("model_porsche_actuel", id);
            // Ajouter un alt descriptif
            photoFormData.append("alt", `${formData.type_model} photo`);
            // Envoyer la requête d'upload
            const result = await maVoitureService.ajouterPhoto(photoFormData);
            // si upload réussi, stocker l'ID de la photo
            if (result?.photo?._id) {
              photoIds.push(result.photo._id);
            }
          }

          // Associer toutes les photos au véhicule
          if (photoIds.length > 0) {
            await maVoitureService.associerPhotos(id, {
              photo_voiture_actuel: photoIds
            });
          }
        } catch (photoError) {
          setError(photoError.message || "Erreur lors de l'ajout des photos");
        }
      }
      // Succès de la modification
      setSuccess("Voiture modifiée avec succès !");
      setTimeout(() => {
        navigate(`/mes-voitures/${id}`);
      }, 1500);
    } catch (err) {
      setError(err.message || "Erreur lors de la modification");
    } finally {
      setSaving(false);
    }
  };
  // si en cours de chargement, afficher le loader
  if (loading) {
    return <Loading fullScreen message="Chargement..." />;
  }
  // si voiture introuvable, afficher un message d'erreur
  if (!voiture) {
    return (
      <div className="modifier-voiture-error">
        <p>Voiture introuvable</p>
        <button onClick={() => navigate("/mon-compte")}>
          Retour à mon compte
        </button>
      </div>
    );
  }
  // photo principale de la voiture
  const photoPrincipale = voiture.photo_voiture_actuel?.[0];

  return (
    <div className="modifier-voiture-container">
      {/* Breadcrumb */}
      <div className="modifier-voiture-breadcrumb">
        <button
          className="modifier-voiture-back-btn"
          onClick={() => navigate(`/mes-voitures/${id}`)}
        >
          ← Retour aux détails
        </button>
      </div>

      {/* Header */}
      <div className="modifier-voiture-header">
        <h1 className="modifier-voiture-title">Modifier ma voiture</h1>
        <p className="modifier-voiture-subtitle">
          {voiture.type_model || "Porsche"}
        </p>
      </div>

      <div className="modifier-voiture-content">
        {/* Image de la voiture */}
        <div className="modifier-voiture-preview">
          <ImageWithFallback
            src={photoPrincipale && photoPrincipale.name ? buildUrl(photoPrincipale.name) : null}
            alt={voiture.type_model}
            imgClass="modifier-voiture-img"
            placeholder={
              <div className="modifier-voiture-no-photo">
                <span>{voiture.type_model?.charAt(0) || "P"}</span>
              </div>
            }
          />
        </div>

        {/* Formulaire */}
        <div className="modifier-voiture-form-wrapper">
          {/* Messages */}
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

          <form onSubmit={handleSubmit} className="modifier-voiture-form">
            {/* Informations de base */}
            <div className="modifier-voiture-section">
              <h2 className="modifier-voiture-section-title">
                Informations de base
              </h2>

              <div className="modifier-voiture-form-group">
                <label htmlFor="type_model" className="modifier-voiture-label">
                  Modèle *
                </label>
                <input
                  type="text"
                  id="type_model"
                  name="type_model"
                  value={formData.type_model}
                  onChange={handleChange}
                  className="modifier-voiture-input"
                  required
                  placeholder="Ex: 911 GT3 RS"
                />
              </div>

              <div className="modifier-voiture-form-group">
                <label
                  htmlFor="annee_production"
                  className="modifier-voiture-label"
                >
                  Année de production *
                </label>
                <input
                  type="date"
                  id="annee_production"
                  name="annee_production"
                  value={formData.annee_production}
                  onChange={handleChange}
                  className="modifier-voiture-input"
                  required
                />
              </div>
            </div>

            {/* Personnalisation */}
            <div className="modifier-voiture-section">
              <h2 className="modifier-voiture-section-title">
                Personnalisation
              </h2>

              <div className="modifier-voiture-form-group">
                <label
                  htmlFor="couleur_exterieur"
                  className="modifier-voiture-label"
                >
                  Couleur extérieure
                </label>
                <select
                  id="couleur_exterieur"
                  name="couleur_exterieur"
                  value={formData.couleur_exterieur}
                  onChange={handleChange}
                  className="modifier-voiture-select"
                >
                  {/*
                    par défaut vide : invite l'utilisateur à choisir.
                    Les options proviennent du(`personnalisationService.getCouleursExterieur()`)
                    - `key` et `value` utilisent l'identifiant `_id` (stable pour React).
                    - Si la couleur a un surcoût (`prix > 0`), on affiche
                      le montant formaté entre parenthèses (+€) grâce à `formatPrice`.
                  */}
                  <option value="">-- Sélectionner --</option>
                  {couleursExt.map((couleur) => (
                    <option key={couleur._id} value={couleur._id}>
                      {/* Nom lisible de la couleur */}
                      {couleur.nom_couleur}{" "}
                      {/* Afficher le prix additionnel si > 0 */}
                      {couleur.prix > 0 ? `(+${formatPrice(couleur.prix)})` : ""}
                    </option>
                  ))}
                </select>
              </div>

              <div className="modifier-voiture-form-group">
                <label
                  htmlFor="couleur_interieur"
                  className="modifier-voiture-label"
                >
                  Couleur intérieure
                </label>
                <select
                  id="couleur_interieur"
                  name="couleur_interieur"
                  value={formData.couleur_interieur}
                  onChange={handleChange}
                  className="modifier-voiture-select"
                >
                  {/*
                    par défaut vide : invite l'utilisateur à choisir.
                    Les options proviennent du(`personnalisationService.getCouleursExterieur()`)
                    - `key` et `value` utilisent l'identifiant `_id` (stable pour React).
                    - Si la couleur a un surcoût (`prix > 0`), on affiche
                      le montant formaté entre parenthèses (+€) grâce à `formatPrice`.
                  */}
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

              <div className="modifier-voiture-form-group">
                <label
                  htmlFor="taille_jante"
                  className="modifier-voiture-label"
                >
                  Jantes
                </label>
                <select
                  id="taille_jante"
                  name="taille_jante"
                  value={formData.taille_jante}
                  onChange={handleChange}
                  className="modifier-voiture-select"
                >
                  {/*
                    par défaut vide : invite l'utilisateur à choisir.
                    Les options proviennent du(`personnalisationService.getCouleursExterieur()`)
                    - `key` et `value` utilisent l'identifiant `_id` (stable pour React).
                    - Si la couleur a un surcoût (`prix > 0`), on affiche
                      le montant formaté entre parenthèses (+€) grâce à `formatPrice`.
                  */}
                  <option value="">-- Sélectionner --</option>
                  {jantes.map((jante) => (
                    <option key={jante._id} value={jante._id}>
                      {jante.taille_jante}" - {jante.description}{" "}
                      {jante.prix > 0 ? `(+${formatPrice(jante.prix)})` : ""}
                    </option>
                  ))}
                </select>
              </div>

            </div>

            {/* Spécifications techniques */}
            <div className="modifier-voiture-section">
              <h2 className="modifier-voiture-section-title">
                Spécifications techniques
              </h2>

              <div className="modifier-voiture-form-group">
                <label htmlFor="info_moteur" className="modifier-voiture-label">
                  Informations moteur
                </label>
                <input
                  type="text"
                  id="info_moteur"
                  name="info_moteur"
                  value={formData.info_moteur}
                  onChange={handleChange}
                  className="modifier-voiture-input"
                  placeholder="Ex: 525 ch / 386 kW"
                />
              </div>

              <div className="modifier-voiture-form-group">
                <label
                  htmlFor="info_transmission"
                  className="modifier-voiture-label"
                >
                  Transmission
                </label>
                <input
                  type="text"
                  id="info_transmission"
                  name="info_transmission"
                  value={formData.info_transmission}
                  onChange={handleChange}
                  className="modifier-voiture-input"
                  placeholder="Ex: PDK (automatique)"
                />
              </div>
            </div>

            {/* Photos */}
            <div className="modifier-voiture-section">
              <h2 className="modifier-voiture-section-title">
                Gérer les photos
                <span className="label-hint">
                  {" "}
                  (Maximum 10 photos au total)
                </span>
              </h2>

              {/* Photos existantes */}
              {photosExistantes.length > 0 && (
                <div className="modifier-voiture-photos-existantes">
                  <h3 className="modifier-voiture-subsection-title">
                    Photos actuelles
                  </h3>
                  <div className="modifier-voiture-photo-grid">
                    {photosExistantes.map((photo) => {
                      const estMarqueeSuppr = photosASupprimer.includes(
                        photo._id,
                      );
                      return (
                        <div
                          key={photo._id}
                          className={`modifier-voiture-photo-item ${estMarqueeSuppr ? "marked-delete" : ""}`}
                        >
                          <ImageWithFallback
                            src={photo && photo.name ? buildUrl(photo.name) : null}
                            alt={photo.alt || "Photo voiture"}
                            imgProps={{ style: { width: '100%', height: 'auto' } }}
                            placeholder={<div className="modifier-voiture-photo-missing" />}
                          />
                          {estMarqueeSuppr ? (
                            <button
                              type="button"
                              className="modifier-voiture-photo-restore"
                              onClick={() => annulerSuppressionPhoto(photo._id)}
                              title="Annuler la suppression"
                            >
                              ↶
                            </button>
                          ) : (
                            <button
                              type="button"
                              className="modifier-voiture-photo-remove"
                              onClick={() => supprimerPhotoExistante(photo._id)}
                              title="Supprimer cette photo"
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
              <div className="modifier-voiture-upload-area">
                <input
                  type="file"
                  id="photos"
                  name="photos"
                  accept="image/*"
                  multiple
                  onChange={handlePhotoChange}
                  className="modifier-voiture-file-input"
                />
                <label
                  htmlFor="photos"
                  className="modifier-voiture-upload-label"
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
                  <span>Ajouter des photos</span>
                  <span className="upload-hint">
                    Maximum 10 photos au total, 5MB par photo
                  </span>
                </label>
              </div>

              {/* Previews des nouvelles photos */}
              {photosPreviews.length > 0 && (
                <div className="modifier-voiture-nouvelles-photos">
                  <h3 className="modifier-voiture-subsection-title">
                    Nouvelles photos à ajouter
                  </h3>
                  <div className="modifier-voiture-photo-grid">
                    {photosPreviews.map((preview, index) => (
                      <div key={index} className="modifier-voiture-photo-item">
                        <img
                          src={preview}
                          alt={`Nouvelle photo ${index + 1}`}
                        />
                        <button
                          type="button"
                          className="modifier-voiture-photo-remove"
                          onClick={() => supprimerNouvellePhoto(index)}
                        >
                          ×
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="modifier-voiture-actions">
              <button
                type="button"
                className="modifier-voiture-btn modifier-voiture-btn-cancel"
                onClick={() => navigate(`/mes-voitures/${id}`)}
                disabled={saving}
              >
                Annuler
              </button>
              <button
                type="submit"
                className="modifier-voiture-btn modifier-voiture-btn-save"
                disabled={saving}
              >
                {saving ? "Enregistrement..." : "Enregistrer les modifications"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ModifierMaVoiture;
