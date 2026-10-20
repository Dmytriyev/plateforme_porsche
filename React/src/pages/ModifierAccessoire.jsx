// modifier un accessoire existant, gérer images et métadonnées.
import accesoireService from "../services/accesoire.service.js";
import buildUrl from "../utils/buildUrl";
import Loading from "../components/common/Loading.jsx";
import { useState, useEffect, useCallback } from "react";
import { useNavigate, useParams } from "react-router-dom";
import "../css/ModifierAccessoire.css";

const ModifierAccessoire = () => {
  // Récupérer l'ID de l'accessoire depuis les paramètres d'URL
  const { id } = useParams();
  // Navigation pour redirection après modification
  const navigate = useNavigate();
  // États locaux pour le formulaire et la gestion des photos
  const [loading, setLoading] = useState(false);
  // Chargement des données initiales
  const [loadingData, setLoadingData] = useState(true);
  // Messages d'erreur et de succès
  const [error, setError] = useState("");
  // Messages de succès
  const [success, setSuccess] = useState("");
  // Liste des couleurs disponibles
  const [couleurs, setCouleurs] = useState([]);
  // Types d'accessoires disponibles
  const [typesDisponibles] = useState([
    "porte-clés",
    "vetement",
    "decoration",
    "life-style",
  ]);

  // États locaux pour la gestion des photos
  const [photosExistantes, setPhotosExistantes] = useState([]);
  // Photos à supprimer lors de la soumission
  const [photosASupprimer, setPhotosASupprimer] = useState([]);
  // Nouvelles photos à ajouter
  const [nouvellesPhotos, setNouvellesPhotos] = useState([]);
  // Prévisualisations des nouvelles photos
  const [photosPreviews, setPhotosPreviews] = useState([]);
  // Données du formulaire
  const [formData, setFormData] = useState({
    nom_accesoire: "",
    description: "",
    type_accesoire: "",
    prix: "",
    prix_promotion: "",
    stock: "",
    couleur_accesoire: "",
  });

  // fetchAccessoire est déclaré localement; le définir comme useCallback
  const fetchAccessoire = useCallback(async () => {
    try {
      setLoadingData(true);
      // Récupérer les données de l'accessoire et les couleurs disponibles
      const [accessoireData, couleursData] = await Promise.all([
        accesoireService.getAccessoireById(id),
        accesoireService.getCouleurs(),
      ]);
      // Remplir les états avec les données récupérées
      setCouleurs(Array.isArray(couleursData) ? couleursData : []);
      // Remplir les données du formulaire
      if (Array.isArray(accessoireData.photo_accesoire)) {
        setPhotosExistantes(accessoireData.photo_accesoire);
      }
      // Initialiser les données du formulaire avec les valeurs existantes
      setFormData({
        nom_accesoire: accessoireData.nom_accesoire || "",
        description: accessoireData.description || "",
        type_accesoire: accessoireData.type_accesoire || "",
        prix: accessoireData.prix || "",
        prix_promotion: accessoireData.prix_promotion || "",
        stock: accessoireData.stock || 0,
        disponible: accessoireData.disponible !== false,
        couleur_accesoire: accessoireData.couleur_accesoire?._id || "",
      });
    } catch (err) {
      // Afficher l'erreur si la récupération échoue
      setError(err.message || "Erreur lors du chargement de l'accessoire");
    } finally {
      setLoadingData(false);
    }
  }, [id]);
  // Charger les données de l'accessoire au montage du composant
  useEffect(() => {
    if (id) {
      fetchAccessoire();
    }
  }, [id, fetchAccessoire]);
  // Gérer les changements dans les champs du formulaire
  const handleChange = (e) => {
    // Récupérer le nom, la valeur, le type et l'état coché du champ
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };
  // Supprimer une photo existante
  const supprimerPhotoExistante = (photoId) => {
    setPhotosASupprimer((prev) => [...prev, photoId]);
  };
  // Annuler la suppression d'une photo existante
  const annulerSuppressionPhoto = (photoId) => {
    setPhotosASupprimer((prev) => prev.filter((id) => id !== photoId));
  };
  // Gérer l'ajout de nouvelles photos
  const handleNouvellesPhotos = (e) => {
    // Récupérer les fichiers sélectionnés
    const files = Array.from(e.target.files);
    // Vérifier le nombre total de photos après ajout
    const totalPhotos =
      photosExistantes.length -
      photosASupprimer.length +
      nouvellesPhotos.length +
      files.length;
    // Vérifier si le nombre total de photos dépasse la limite
    if (totalPhotos > 10) {
      setError("Maximum 10 photos autorisées au total");
      setTimeout(() => setError(""), 3000);
      return;
    }
    // Vérifier la taille des fichiers sélectionnés
    const invalidFiles = files.filter((file) => file.size > 5 * 1024 * 1024);
    // Afficher une erreur si des fichiers sont trop volumineux
    if (invalidFiles.length > 0) {
      setError("Chaque photo doit faire moins de 5MB");
      setTimeout(() => setError(""), 3000);
      return;
    }
    // Ajouter les nouvelles photos à l'état
    setNouvellesPhotos((prev) => [...prev, ...files]);
    // Générer les prévisualisations des nouvelles photos
    files.forEach((file) => {
      // Créer un FileReader pour lire le fichier
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotosPreviews((prev) => [...prev, reader.result]);
      };
      // Lire le fichier en tant qu'URL de données
      reader.readAsDataURL(file);
    });
    // Réinitialiser la valeur de l'input pour permettre la sélection du même fichier à nouveau
    e.target.value = "";
  };
  // Supprimer une nouvelle photo ajoutée
  const supprimerNouvellePhoto = (index) => {
    // Supprimer la photo et sa prévisualisation correspondante
    setNouvellesPhotos((prev) => prev.filter((_, i) => i !== index));
    setPhotosPreviews((prev) => prev.filter((_, i) => i !== index));
  };
  // Gérer la soumission du formulaire 
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    // Validation des champs obligatoires
    if (
      // si un des champs obligatoires est vide
      !formData.nom_accesoire ||
      !formData.description ||
      !formData.type_accesoire ||
      !formData.prix
    ) {
      setError("Veuillez remplir tous les champs obligatoires");
      return;
    }
    // Validation des valeurs numériques
    if (formData.prix <= 0) {
      setError("Le prix doit être supérieur à 0");
      return;
    }
    // Validation du prix promotionnel
    if (
      formData.prix_promotion &&
      parseFloat(formData.prix_promotion) >= parseFloat(formData.prix)
    ) {
      // Le prix promotionnel doit être inférieur au prix normal
      setError("Le prix promotionnel doit être inférieur au prix normal");
      return;
    }

    try {
      // Envoyer les données modifiées au serveur
      setLoading(true);
      // Préparer les données à envoyer
      const dataToSend = {
        nom_accesoire: formData.nom_accesoire.trim(),
        description: formData.description.trim(),
        type_accesoire: formData.type_accesoire,
        prix: parseFloat(formData.prix),
        stock: parseInt(formData.stock) || 0,
      };
      // Ajouter les champs optionnels si remplis
      if (formData.prix_promotion) {
        dataToSend.prix_promotion = parseFloat(formData.prix_promotion);
      }
      // Ajouter la couleur si sélectionnée
      if (formData.couleur_accesoire) {
        dataToSend.couleur_accesoire = formData.couleur_accesoire;
      }
      // Envoyer les données modifiées au serveur
      await accesoireService.updateAccessoire(id, dataToSend);
      // Gérer la suppression des photos marquées
      if (photosASupprimer.length > 0) {
        await accesoireService.removeImages(id, photosASupprimer);
      }
      // Gérer l'ajout des nouvelles photos
      if (nouvellesPhotos.length > 0) {
        // Créer un FormData pour l'upload des photos
        const formDataPhotos = new FormData();
        // Ajouter chaque nouvelle photo au FormData
        nouvellesPhotos.forEach((photo) => {
          // Ajouter la photo au FormData avec la clé "photos"
          formDataPhotos.append("photos", photo);
        });
        // Le token est automatiquement envoyé via cookie HTTP-Only
        await fetch(
          `${import.meta.env.VITE_API_URL}/accesoire/addImage/${id}`,
          {
            method: "PATCH",
            credentials: "include",
            body: formDataPhotos,
          },
        );
      }
      // Afficher le message de succès
      setSuccess("Accessoire modifié avec succès !");
      setTimeout(() => {
        navigate("/accessoires");
      }, 2000);
    } catch (err) {
      // Afficher l'erreur si la modification échoue
      setError(err.message || "Erreur lors de la modification");
    } finally {
      setLoading(false);
    }
  };
  // Afficher le chargement si les données sont en cours de récupération
  if (loadingData) {
    // Afficher un composant de chargement avec un message
    return <Loading fullScreen message="Chargement de l'accessoire..." />;
  }

  return (
    <div className="modifier-accessoire-container">
      <div className="modifier-accessoire-header">
        {/* button de retour */}
        <button
          className="modifier-accessoire-back"
          onClick={() => navigate("/accessoires")}
        >
          <svg
            width="20"
            height="20"
            viewBox="0 0 20 20"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M12 16L6 10L12 4"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          Retour
        </button>
        <h1 className="modifier-accessoire-title">Modifier l'accessoire</h1>
        <p className="modifier-accessoire-subtitle">
          Modifiez les informations de l'accessoire
        </p>
      </div>
      {/* error message */}
      {error && (
        <div className="modifier-accessoire-message modifier-accessoire-message-error">
          {error}
        </div>
      )}
      {/* success message */}
      {success && (
        <div className="modifier-accessoire-message modifier-accessoire-message-success">
          {success}
        </div>
      )}
      {/* modification accessoire */}
      <form onSubmit={handleSubmit} className="modifier-accessoire-form">
        <div className="modifier-accessoire-section">
          <h2 className="modifier-accessoire-section-title">
            Informations de base
          </h2>

          <div className="modifier-accessoire-row">
            <div className="modifier-accessoire-field">
              <label className="modifier-accessoire-label">
                Nom de l'accessoire <span className="required">*</span>
              </label>
              <input
                type="text"
                name="nom_accesoire"
                value={formData.nom_accesoire}
                onChange={handleChange}
                className="modifier-accessoire-input"
                required
              />
            </div>

            <div className="modifier-accessoire-field">
              <label className="modifier-accessoire-label">
                Type d'accessoire <span className="required">*</span>
              </label>
              <select
                name="type_accesoire"
                value={formData.type_accesoire}
                onChange={handleChange}
                className="modifier-accessoire-select"
                required
              >
                <option value="">Sélectionner un type</option>
                {typesDisponibles.map((type) => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="modifier-accessoire-field">
            <label className="modifier-accessoire-label">
              Description <span className="required">*</span>
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              className="modifier-accessoire-textarea"
              rows="4"
              required
            />
          </div>
        </div>

        <div className="modifier-accessoire-section">
          <h2 className="modifier-accessoire-section-title">
            Prix et disponibilité
          </h2>

          <div className="modifier-accessoire-row">
            <div className="modifier-accessoire-field">
              <label className="modifier-accessoire-label">
                Prix (€) <span className="required">*</span>
              </label>
              <input
                type="number"
                name="prix"
                value={formData.prix}
                onChange={handleChange}
                className="modifier-accessoire-input"
                step="0.01"
                min="0"
                required
              />
            </div>

            <div className="modifier-accessoire-field">
              <label className="modifier-accessoire-label">
                Prix promotionnel (€)
              </label>
              <input
                type="number"
                name="prix_promotion"
                value={formData.prix_promotion}
                onChange={handleChange}
                className="modifier-accessoire-input"
                step="0.01"
                min="0"
              />
            </div>
          </div>

          <div className="modifier-accessoire-field">
            <label className="modifier-accessoire-label">Stock</label>
            <input
              type="number"
              name="stock"
              value={formData.stock}
              onChange={handleChange}
              className="modifier-accessoire-input"
              min="0"
            />
          </div>
        </div>

        {/* Personnalisation */}
        <div className="modifier-accessoire-section">
          <h2 className="modifier-accessoire-section-title">
            Personnalisation
          </h2>

          <div className="modifier-accessoire-field">
            <label className="modifier-accessoire-label">Couleur</label>
            <select
              name="couleur_accesoire"
              value={formData.couleur_accesoire}
              onChange={handleChange}
              className="modifier-accessoire-select"
            >
              <option value="">Aucune couleur spécifique</option>
              {couleurs.map((couleur) => (
                <option key={couleur._id} value={couleur._id}>
                  {couleur.nom_couleur}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Photos existantes */}
        {photosExistantes.length > 0 && (
          <div className="modifier-accessoire-section">
            <h2 className="modifier-accessoire-section-title">
              Photos existantes
            </h2>
            <div className="modifier-accessoire-photos-grid">
              {photosExistantes.map((photo) => {
                const isMarkedForDeletion = photosASupprimer.includes(
                  photo._id,
                );
                return (
                  <div
                    key={photo._id}
                    className={`modifier-accessoire-photo-item ${isMarkedForDeletion ? "marked-delete" : ""}`}
                  >
                    <img
                      src={buildUrl(photo.name)}
                      alt={photo.alt || "Photo accessoire"}
                    />
                    {/* button de suppression */}
                    {isMarkedForDeletion ? (
                      <button
                        type="button"
                        onClick={() => annulerSuppressionPhoto(photo._id)}
                        className="modifier-accessoire-photo-restore"
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
                      // button de marquage pour suppression
                      <button
                        type="button"
                        onClick={() => supprimerPhotoExistante(photo._id)}
                        className="modifier-accessoire-photo-delete"
                      >
                        <svg
                          width="20"
                          height="20"
                          viewBox="0 0 20 20"
                          fill="none"
                        >
                          <path
                            d="M6 6L14 14M6 14L14 6"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                          />
                        </svg>
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Nouvelles photos */}
        <div className="modifier-accessoire-section">
          <h2 className="modifier-accessoire-section-title">
            Ajouter de nouvelles photos
          </h2>

          <div className="modifier-accessoire-upload-area">
            <input
              type="file"
              id="nouvelles-photos"
              accept="image/*"
              multiple
              onChange={handleNouvellesPhotos}
              className="modifier-accessoire-upload-input"
            />
            <label
              htmlFor="nouvelles-photos"
              className="modifier-accessoire-upload-label"
            >
              <svg
                width="48"
                height="48"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M12 4v16m8-8H4"
                />
              </svg>
              <span>Ajouter des photos</span>
              <span className="modifier-accessoire-upload-hint">
                PNG, JPG jusqu'à 5MB (max 10 photos au total)
              </span>
            </label>
          </div>
          {/* Nouvelles photos */}
          {photosPreviews.length > 0 && (
            <div className="modifier-accessoire-photos-grid">
              {photosPreviews.map((preview, index) => (
                <div key={index} className="modifier-accessoire-photo-item">
                  <img src={preview} alt={`Nouvelle photo ${index + 1}`} />
                  <button
                    type="button"
                    onClick={() => supprimerNouvellePhoto(index)}
                    className="modifier-accessoire-photo-delete"
                  >
                    <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                      <path
                        d="M6 6L14 14M6 14L14 6"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                      />
                    </svg>
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Boutons d'action */}
        <div className="modifier-accessoire-actions">
          <button
            type="button"
            onClick={() => navigate("/accessoires")}
            className="modifier-accessoire-btn modifier-accessoire-btn-cancel"
            disabled={loading}
          >
            Annuler
          </button>
          <button
            type="submit"
            className="modifier-accessoire-btn modifier-accessoire-btn-submit"
            disabled={loading}
          >
            {/* Bouton d'enregistrement */}
            {loading ? "Enregistrement..." : "Enregistrer les modifications"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default ModifierAccessoire;
