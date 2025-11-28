// affiche le détail d'une voiture personnelle; actions possible 
import buildUrl from "../utils/buildUrl";
import maVoitureService from "../services/ma_voiture.service.js";
import modelPorscheService from "../services/modelPorsche.service.js";
import Loading from "../components/common/Loading.jsx";
import ImageWithFallback from "../components/common/ImageWithFallback.jsx";
import { formatPrice } from "../utils/helpers.js";
import { useState, useEffect } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import "../css/MaVoitureDetail.css";

const MaVoitureDetail = () => {
  const { id } = useParams();
  // Navigation et location
  const navigate = useNavigate();
  // Location pour récupérer l'état de navigation
  const location = useLocation();
  // Récupérer la source et le type depuis l'état de la navigation
  const { source, type } = location.state || {};
  // source: "mes_voitures", "reservation", "commande"
  const [voiture, setVoiture] = useState(null);
  // Loading et gestion des erreurs
  const [loading, setLoading] = useState(true);
  // Erreur lors du chargement
  const [error, setError] = useState("");
  // Photo active dans la galerie
  const [photoActive, setPhotoActive] = useState(0);

  // Charger les détails de la voiture en fonction de la source et du type
  useEffect(() => {
    // Fonction pour charger la voiture
    const fetchVoiture = async () => {
      try {
        setLoading(true);
        setError("");
        // Déterminer la source et charger les données appropriées
        let voitureData = null;
        // Logique de chargement selon la source et le type
        if (source === "mes_voitures") {
          // Model_porsche_actuel
          voitureData = await maVoitureService.getMaVoitureById(id);
        } else if (source === "reservation" || type === "occasion") {
          // Occasion via Model_porsche
          voitureData = await modelPorscheService.getConfigurationById(id);
        } else if (source === "commande" || type === "neuve") {
          // Neuve via Model_porsche
          voitureData = await modelPorscheService.getConfigurationById(id);
        } else {
          // Par défaut, essayer Model_porsche_actuel
          voitureData = await maVoitureService.getMaVoitureById(id);
        }

        setVoiture(voitureData);
      } catch (err) {
        setError(err.message || "Erreur lors du chargement de la voiture");
      } finally {
        setLoading(false);
      }
    };
    // Lancer le chargement si l'id est présent
    if (id) {
      fetchVoiture();
    }
  }, [id, source, type]);

  // si loading afficher loading full screen
  if (loading) {
    return <Loading fullScreen message="Chargement des détails..." />;
  }
  // si erreur afficher message d'erreur 
  if (error) {
    return (
      <div className="ma-voiture-detail-error">
        <p>{error}</p>
        <button onClick={() => navigate("/mon-compte")}>
          Retour à mon compte
        </button>
      </div>
    );
  }
  // si voiture introuvable afficher message
  if (!voiture) {
    return (
      <div className="ma-voiture-detail-error">
        <p>Voiture introuvable</p>
        <button onClick={() => navigate("/mon-compte")}>
          Retour à mon compte
        </button>
      </div>
    );
  }

  // Déterminer les photos disponibles
  let photos = [];
  // Priorité aux photos de la voiture actuelle
  if (
    // si photo_voiture_actuel existe et est un tableau
    voiture.photo_voiture_actuel &&
    Array.isArray(voiture.photo_voiture_actuel)
  ) {
    // Utiliser les photos de la voiture actuelle
    photos = voiture.photo_voiture_actuel;
    // Sinon vérifier les autres sources
  } else if (voiture.photo_voiture && Array.isArray(voiture.photo_voiture)) {
    photos = voiture.photo_voiture;
    // Sinon vérifier les photos Porsche
  } else if (voiture.photo_porsche && Array.isArray(voiture.photo_porsche)) {
    photos = voiture.photo_porsche;
    // Sinon vérifier les photos dans l'objet voiture
  } else if (voiture.voiture?.photo_voiture) {
    photos = voiture.voiture.photo_voiture;
  }

  // Filtrer les photos valides (avec un nom)
  photos = photos.filter((p) => p && p.name);

  // Informations de base de la voiture
  const nomModele =
    voiture.type_model ||
    voiture.nom_model ||
    voiture.voiture?.nom_model ||
    "Porsche";

  // Prix de base de la voiture
  const prixBase = voiture.prix_base_variante || voiture.prix_base || 0;
  // Type de carrosserie
  const typeCarrosserie = voiture.type_carrosserie || "";
  // Année de production (année seulement)
  const anneeProduction = voiture.annee_production
    ? new Date(voiture.annee_production).getFullYear()
    : null;

  return (
    <div className="ma-voiture-detail-container">
      {/* Breadcrumb */}
      <div className="ma-voiture-detail-breadcrumb">
        <button
          className="ma-voiture-detail-back-btn"
          onClick={() => navigate("/mon-compte")}
        >
          ← Retour à mon compte
        </button>
      </div>

      {/* Titre */}
      <div className="ma-voiture-detail-header">
        <h1 className="ma-voiture-detail-title">{nomModele}</h1>
        {prixBase > 0 && (
          <p className="ma-voiture-detail-price">{formatPrice(prixBase)}</p>
        )}
      </div>

      <div className="ma-voiture-detail-content">
        {/* Galerie photos */}
        <div className="ma-voiture-detail-gallery">
          {photos.length > 0 ? (
            <>
              {/* Galerie principale */}
              <div className="ma-voiture-detail-main-image">
                <ImageWithFallback
                  src={photos[photoActive] ? buildUrl(photos[photoActive].name) : null}
                  alt={`${nomModele} - Photo ${photoActive + 1}`}
                  imgClass="ma-voiture-detail-img"
                  placeholder={<div className="ma-voiture-detail-img-missing" />}
                />
              </div>
              {/* Miniatures */}
              {photos.length > 1 && (
                <div className="ma-voiture-detail-thumbnails">
                  {/*
                    - une miniature de élément `photo` via `photos.map`.
                    - `key` utilise `photo._id` si disponible, sinon l'index (préférence : `_id`).
                    - Classe `active` si l'index correspond à `photoActive`.
                    - Onclick appelle `setPhotoActive(index)` pour afficher la photo principale.
                    - `ImageWithFallback` affiche l'image si `photo.name` existe.
                    - alt text descriptif avec le nom du modèle et le numéro de la miniature.
                    - Placeholder si l'image est manquante.
                  */}
                  {photos.map((photo, index) => (
                    <button
                      key={photo._id || index}
                      className={`ma-voiture-detail-thumbnail ${index === photoActive ? "active" : ""}`}
                      onClick={() => setPhotoActive(index)}
                    >
                      <ImageWithFallback
                        src={photo && photo.name ? buildUrl(photo.name) : null}
                        alt={`${nomModele} - Miniature ${index + 1}`}
                        placeholder={<div className="ma-voiture-detail-thumb-missing" />}
                      />
                    </button>
                  ))}
                </div>
              )}
            </>
          ) : (
            // si pas de photo disponible afficher placeholder
            <div className="ma-voiture-detail-no-photo">
              <span>{nomModele.charAt(0)}</span>
            </div>
          )}
        </div>

        {/* Informations détaillées */}
        <div className="ma-voiture-detail-info">
          <div className="ma-voiture-detail-section">
            <h2 className="ma-voiture-detail-section-title">
              Informations générales
            </h2>
            <div className="ma-voiture-detail-grid">
              {typeCarrosserie && (
                <div className="ma-voiture-detail-item">
                  <span className="ma-voiture-detail-label">
                    Type de carrosserie
                  </span>
                  <span className="ma-voiture-detail-value">
                    {typeCarrosserie}
                  </span>
                </div>
              )}
              {anneeProduction && (
                <div className="ma-voiture-detail-item">
                  <span className="ma-voiture-detail-label">
                    Année de production
                  </span>
                  <span className="ma-voiture-detail-value">
                    {anneeProduction}
                  </span>
                </div>
              )}
              {voiture.info_moteur && voiture.info_moteur !== "N/A" && (
                <div className="ma-voiture-detail-item">
                  <span className="ma-voiture-detail-label">
                    Puissance moteur
                  </span>
                  <span className="ma-voiture-detail-value">
                    {voiture.info_moteur}
                  </span>
                </div>
              )}
              {voiture.couleur_exterieur && (
                <div className="ma-voiture-detail-item">
                  <span className="ma-voiture-detail-label">
                    Couleur extérieure
                  </span>
                  <span className="ma-voiture-detail-value">
                    {voiture.couleur_exterieur.nom_couleur || "Non spécifié"}
                  </span>
                </div>
              )}
              {voiture.couleur_interieur && (
                <div className="ma-voiture-detail-item">
                  <span className="ma-voiture-detail-label">
                    Couleur intérieure
                  </span>
                  <span className="ma-voiture-detail-value">
                    {voiture.couleur_interieur.nom_couleur || "Non spécifié"}
                  </span>
                </div>
              )}
              {voiture.taille_jante && (
                <div className="ma-voiture-detail-item">
                  <span className="ma-voiture-detail-label">Jantes</span>
                  <span className="ma-voiture-detail-value">
                    {voiture.taille_jante.taille_jante}" -{" "}
                    {voiture.taille_jante.description || ""}
                  </span>
                </div>
              )}
              {voiture.siege && (
                <div className="ma-voiture-detail-item">
                  <span className="ma-voiture-detail-label">Sièges</span>
                  <span className="ma-voiture-detail-value">
                    {voiture.siege.type_siege || "Standard"}
                  </span>
                </div>
              )}
              {voiture.package_weissach !== undefined && (
                <div className="ma-voiture-detail-item">
                  <span className="ma-voiture-detail-label">
                    Package Weissach
                  </span>
                  <span className="ma-voiture-detail-value">
                    {voiture.package_weissach ? "Oui" : "Non"}
                  </span>
                </div>
              )}
              {voiture.sport_chrono !== undefined && (
                <div className="ma-voiture-detail-item">
                  <span className="ma-voiture-detail-label">Sport Chrono</span>
                  <span className="ma-voiture-detail-value">
                    {voiture.sport_chrono ? "Oui" : "Non"}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Spécifications techniques */}
          {voiture.specifications && (
            <div className="ma-voiture-detail-section">
              <h2 className="ma-voiture-detail-section-title">
                Spécifications techniques
              </h2>
              <div className="ma-voiture-detail-grid">
                {voiture.specifications.puissance && (
                  <div className="ma-voiture-detail-item">
                    <span className="ma-voiture-detail-label">Puissance</span>
                    <span className="ma-voiture-detail-value">
                      {voiture.specifications.puissance} ch
                    </span>
                  </div>
                )}
                {voiture.specifications.couple && (
                  <div className="ma-voiture-detail-item">
                    <span className="ma-voiture-detail-label">Couple</span>
                    <span className="ma-voiture-detail-value">
                      {voiture.specifications.couple} Nm
                    </span>
                  </div>
                )}
                {voiture.specifications.acceleration_0_100 && (
                  <div className="ma-voiture-detail-item">
                    <span className="ma-voiture-detail-label">0-100 km/h</span>
                    <span className="ma-voiture-detail-value">
                      {voiture.specifications.acceleration_0_100} s
                    </span>
                  </div>
                )}
                {voiture.specifications.vitesse_max && (
                  <div className="ma-voiture-detail-item">
                    <span className="ma-voiture-detail-label">
                      Vitesse maximale
                    </span>
                    <span className="ma-voiture-detail-value">
                      {voiture.specifications.vitesse_max} km/h
                    </span>
                  </div>
                )}
                {voiture.specifications.consommation && (
                  <div className="ma-voiture-detail-item">
                    <span className="ma-voiture-detail-label">
                      Consommation
                    </span>
                    <span className="ma-voiture-detail-value">
                      {voiture.specifications.consommation} L/100km
                    </span>
                  </div>
                )}
                {voiture.specifications.motorisation && (
                  <div className="ma-voiture-detail-item">
                    <span className="ma-voiture-detail-label">
                      Motorisation
                    </span>
                    <span className="ma-voiture-detail-value">
                      {voiture.specifications.motorisation}
                    </span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="ma-voiture-detail-actions">
            <button
              className="ma-voiture-detail-btn ma-voiture-detail-btn-primary"
              onClick={() => navigate("/mon-compte")}
            >
              Retour à mon compte
            </button>
            {source === "mes_voitures" && (
              <button
                className="ma-voiture-detail-btn ma-voiture-detail-btn-secondary"
                onClick={() => navigate(`/mes-voitures/${id}/modifier`)}
              >
                Modifier
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MaVoitureDetail;
