// gestion des voitures personnelles de l'utilisateur
import maVoitureService from "../services/ma_voiture.service.js";
import buildUrl from "../utils/buildUrl";
import ImageWithFallback from "../components/common/ImageWithFallback.jsx";
import Loading from "../components/common/Loading.jsx";
import { AuthContext } from "../context/AuthContext.jsx";
import { useState, useEffect, useContext } from "react";
import { useNavigate } from "react-router-dom";
import "../css/components/Message.css";
import "../css/MesVoitures.css";

const MesVoitures = () => {
  const navigate = useNavigate();
  // Récupérer l'utilisateur connecté depuis le contexte d'authentification
  const { user } = useContext(AuthContext);
  const [voitures, setVoitures] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, _setSuccess] = useState("");

  // Charger les voitures de l'utilisateur à la connexion
  useEffect(() => {
    if (user) {
      fetchMesVoitures();
    }
  }, [user]);

  // Fonction pour récupérer les voitures de l'utilisateur
  const fetchMesVoitures = async () => {
    try {
      setLoading(true);
      setError("");
      // Appel au service pour obtenir les voitures
      const data = await maVoitureService.getMesVoitures();
      setVoitures(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err.message || "Erreur lors du chargement de vos voitures");
    } finally {
      setLoading(false);
    }
  };
  // Formater les informations de puissance du moteur
  const formatPower = (infoMoteur) => {
    if (!infoMoteur) return null;
    return infoMoteur;
  };

  // si pas connecté, rediriger vers la page de connexion
  if (!user) {
    return (
      <div className="mes-voitures-error">
        <p>Vous devez être connecté pour accéder à cette page</p>
        <button onClick={() => navigate("/login")}>Se connecter</button>
      </div>
    );
  }
  // Afficher un indicateur de chargement pendant la récupération des données
  if (loading) {
    return <Loading fullScreen message="Chargement de vos voitures..." />;
  }
  // Image générale pour l'en-tête de la page
  const photoGenerale =
    // si il y a au moins une voiture avec une photo actuelle, prendre la première photo de la première voiture
    voitures.length > 0 && voitures[0]?.photo_voiture_actuel?.length > 0
      ? voitures[0].photo_voiture_actuel[0]
      : null;

  return (
    <div className="mes-voitures-container-finder">
      <section className="mes-voitures-hero-finder">
        {photoGenerale ? (
          <div className="mes-voitures-hero-image-finder">
            <ImageWithFallback
              src={buildUrl(photoGenerale.name)}
              alt="Mes Porsche"
              imgClass="mes-voitures-hero-img-finder"
              placeholder={
                <div className="mes-voitures-hero-placeholder-finder">
                  <span className="mes-voitures-hero-text-finder">Mes Porsche</span>
                </div>
              }
            />
          </div>
        ) : (
          <div className="mes-voitures-hero-placeholder-finder">
            <span className="mes-voitures-hero-text-finder">Mes Porsche</span>
          </div>
        )}
      </section>

      <section className="mes-voitures-actions-header-finder">
        <div className="mes-voitures-actions-container-finder">
          <button
            className="mes-voitures-action-btn-finder"
            onClick={() => navigate("/ajouter-ma-voiture")}
          >
            + Ajouter ma Porsche
          </button>
          <button
            className="mes-voitures-action-btn-finder"
            onClick={() => navigate("/occasion")}
          >
            Parcourir les annonces et sauvegarder des véhicules
          </button>
        </div>
      </section>

      {error && (
        <div className="mes-voitures-messages-finder">
          <div className="message-box message-error">
            <p>{error}</p>
          </div>
        </div>
      )}
      {success && (
        <div className="mes-voitures-messages-finder">
          <div className="message-box message-success">
            <p>{success}</p>
          </div>
        </div>
      )}

      {voitures.length === 0 ? (
        <section className="mes-voitures-empty-finder">
          <div className="mes-voitures-empty-content-finder">
            <p className="mes-voitures-empty-text-finder">
              Vous n'avez pas encore ajouté de Porsche
            </p>
            <button
              className="mes-voitures-empty-btn-finder"
              onClick={() => navigate("/ajouter-ma-voiture")}
            >
              Ajouter ma première Porsche
            </button>
          </div>
        </section>
      ) : (
        <section className="mes-voitures-list-finder">
          {voitures.map((voiture) => {
            const photos =
              voiture.photo_voiture_actuel &&
                Array.isArray(voiture.photo_voiture_actuel)
                ? voiture.photo_voiture_actuel.filter(
                  (p) => p && (p.name || p._id),
                )
                : [];

            const photoPrincipale = photos.length > 0 ? photos[0] : null;
            const thumbnails = photos.slice(1, 4);

            return (
              <article key={voiture._id} className="mes-voitures-card-finder">
                <div className="mes-voitures-card-images-finder">
                  {/* Image principale */}
                  <div className="mes-voitures-main-image-finder">
                    <ImageWithFallback
                      src={photoPrincipale && photoPrincipale.name ? buildUrl(photoPrincipale.name) : null}
                      alt={voiture.type_model || "Porsche"}
                      imgClass="mes-voitures-main-img-finder"
                      placeholder={
                        <div className="mes-voitures-image-placeholder-finder">
                          <span className="mes-voitures-image-letter-finder">
                            {voiture.type_model?.charAt(0) || "P"}
                          </span>
                        </div>
                      }
                    />
                  </div>

                  {/* Thumbnails */}
                  {thumbnails.length > 0 && (
                    <div className="mes-voitures-thumbnails-finder">
                      {thumbnails.map((thumb, index) => (
                        <div
                          key={thumb._id || `thumb-${index}`}
                          className="mes-voitures-thumbnail-finder"
                        >
                          <ImageWithFallback
                            src={buildUrl(thumb.name)}
                            alt={`Vue ${index + 2}`}
                            imgClass="mes-voitures-thumbnail-img-finder"
                            placeholder={<div className="mes-voitures-thumbnail-placeholder-finder" />}
                          />
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Informations */}
                <div className="mes-voitures-info-finder">
                  {/* Nom et statut */}
                  <div className="mes-voitures-header-card-finder">
                    <h3 className="mes-voitures-name-finder">
                      {voiture.type_model || "Porsche"}
                    </h3>
                    <div className="mes-voitures-status-finder">
                      <span className="mes-voitures-approved-badge-finder">
                        Véhicule d'occasion Porsche Approved
                      </span>
                    </div>
                  </div>

                  {/* Spécifications */}
                  <div className="mes-voitures-specs-finder">
                    {voiture.couleur_exterieur && (
                      <div className="mes-voitures-spec-item-finder">
                        <span className="mes-voitures-spec-label-finder">
                          Couleur:
                        </span>
                        <span className="mes-voitures-spec-value-finder">
                          {voiture.couleur_exterieur.nom_couleur}
                        </span>
                        {voiture.couleur_interieur && (
                          <span className="mes-voitures-spec-value-finder">
                            / {voiture.couleur_interieur.nom_couleur}
                          </span>
                        )}
                      </div>
                    )}
                    <div className="mes-voitures-spec-item-finder">
                      <span className="mes-voitures-spec-label-finder">
                        Carburant:
                      </span>
                      <span className="mes-voitures-spec-value-finder">
                        Essence
                      </span>
                    </div>
                    {voiture.info_transmission &&
                      voiture.info_transmission !== "N/A" && (
                        <div className="mes-voitures-spec-item-finder">
                          <span className="mes-voitures-spec-label-finder">
                            Transmission:
                          </span>
                          <span className="mes-voitures-spec-value-finder">
                            {voiture.info_transmission}
                          </span>
                        </div>
                      )}
                    {voiture.info_moteur && voiture.info_moteur !== "N/A" && (
                      <div className="mes-voitures-spec-item-finder">
                        <span className="mes-voitures-spec-label-finder">
                          Puissance:
                        </span>
                        <span className="mes-voitures-spec-value-finder">
                          {formatPower(voiture.info_moteur) ||
                            voiture.info_moteur}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="mes-voitures-actions-card-finder">
                    <button
                      className="mes-voitures-btn-details-finder"
                      onClick={() => navigate(`/mes-voitures/${voiture._id}`)}
                    >
                      Détails du véhicule
                    </button>
                  </div>
                </div>
              </article>
            );
          })}
        </section>
      )}

      {/* Message d'ajout d'une autre Porsche */}
      {voitures.length > 0 && (
        <section className="mes-voitures-add-more-finder">
          <div className="mes-voitures-add-more-content-finder">
            <p className="mes-voitures-add-more-text-finder">
              Voulez-vous ajouter une autre Porsche à cette liste?
            </p>
            <button
              className="mes-voitures-add-more-btn-finder"
              onClick={() => navigate("/occasion")}
            >
              Parcourir les annonces et sauvegarder des véhicules
            </button>
          </div>
        </section>
      )}
    </div>
  );
};

export default MesVoitures;
