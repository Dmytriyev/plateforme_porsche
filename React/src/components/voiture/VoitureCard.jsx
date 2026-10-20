// Carte de véhicule dans "Mes Voitures" avec photos, spécifications et actions
import buildUrl from "../../utils/buildUrl";
import PropTypes from "prop-types";
import ImageWithFallback from "../common/ImageWithFallback";
import { useNavigate } from "react-router-dom";
import {
    getPhotoPrincipale,
    getThumbnails,
    getPhotosVoiture,
    formatDateImmat,
    formatPower,
    getInitialLetter,
} from "../../utils/mesVoituresHelpers";

const VoitureCard = ({
    voiture,
    isEnregistree = false,
    onToggleEnregistrer,
    onSupprimer: _onSupprimer,
}) => {
    // Navigation
    const navigate = useNavigate();
    // Photos
    const photos = getPhotosVoiture(voiture);
    // Photo principale
    const photoPrincipale = getPhotoPrincipale(photos);
    const thumbnails = getThumbnails(photos, 3);
    // Données formatées
    const dateImmat = formatDateImmat(voiture.annee_production);
    // Puissance formatée
    const puissance = formatPower(voiture.info_moteur);
    // Lettre initiale pour placeholder
    const initialLetter = getInitialLetter(voiture.type_model);

    return (
        <article className="mes-voitures-card-finder">
            <div className="mes-voitures-card-images-finder">
                {/* Image principale */}
                <div className="mes-voitures-main-image-finder">
                    <ImageWithFallback
                        src={
                            photoPrincipale && photoPrincipale.name
                                ? buildUrl(photoPrincipale.name)
                                : null
                        }
                        alt={voiture.type_model || "Porsche"}
                        imgClass="mes-voitures-main-img-finder"
                        placeholder={
                            <div className="mes-voitures-image-placeholder-finder">
                                <span className="mes-voitures-image-letter-finder">
                                    {initialLetter}
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
                                    placeholder={
                                        <div className="mes-voitures-thumbnail-placeholder-finder" />
                                    }
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
                        {dateImmat && (
                            <span className="mes-voitures-date-finder">
                                Enregistrée le {dateImmat}
                            </span>
                        )}
                    </div>
                </div>

                {/* Spécifications */}
                <div className="mes-voitures-specs-finder">
                    {voiture.couleur_exterieur && (
                        <div className="mes-voitures-spec-item-finder">
                            <span className="mes-voitures-spec-label-finder">Couleur:</span>
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
                        <span className="mes-voitures-spec-label-finder">Carburant:</span>
                        <span className="mes-voitures-spec-value-finder">Essence</span>
                    </div>
                    {dateImmat && (
                        <div className="mes-voitures-spec-item-finder">
                            <span className="mes-voitures-spec-label-finder">
                                Première immatriculation:
                            </span>
                            <span className="mes-voitures-spec-value-finder">
                                {dateImmat}
                            </span>
                        </div>
                    )}
                    {voiture.info_transmission && voiture.info_transmission !== "N/A" && (
                        <div className="mes-voitures-spec-item-finder">
                            <span className="mes-voitures-spec-label-finder">
                                Transmission:
                            </span>
                            <span className="mes-voitures-spec-value-finder">
                                {voiture.info_transmission}
                            </span>
                        </div>
                    )}
                    {puissance && (
                        <div className="mes-voitures-spec-item-finder">
                            <span className="mes-voitures-spec-label-finder">
                                Puissance:
                            </span>
                            <span className="mes-voitures-spec-value-finder">
                                {puissance}
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
                    <button
                        className={`mes-voitures-btn-compare-finder ${isEnregistree ? "enregistre" : ""
                            }`}
                        onClick={() => onToggleEnregistrer(voiture._id)}
                    >
                        {isEnregistree ? (
                            // Voiture enregistrée
                            <>
                                <svg
                                    width="16"
                                    height="16"
                                    viewBox="0 0 24 24"
                                    fill="currentColor"
                                >
                                    <path d="M5 3h14a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2z" />
                                </svg>
                                Enregistré
                            </>
                        ) : (
                            // Voiture non enregistrée
                            <>

                                <svg
                                    width="16"
                                    height="16"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="2"
                                >
                                    <path d="M5 3h14a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2z" />
                                </svg>
                                → Comparer
                            </>
                        )}
                    </button>
                </div>
            </div>
        </article>
    );
};
// voiture type validation
VoitureCard.propTypes = {
    voiture: PropTypes.shape({
        _id: PropTypes.string.isRequired,
        type_model: PropTypes.string,
        photo_voiture_actuel: PropTypes.array,
        annee_production: PropTypes.oneOfType([
            PropTypes.string,
            PropTypes.instanceOf(Date),
        ]),
        couleur_exterieur: PropTypes.shape({
            nom_couleur: PropTypes.string,
        }),
        couleur_interieur: PropTypes.shape({
            nom_couleur: PropTypes.string,
        }),
        info_transmission: PropTypes.string,
        info_moteur: PropTypes.string,
    }).isRequired,
    // Indique si la voiture est enregistrée
    isEnregistree: PropTypes.bool,
    onToggleEnregistrer: PropTypes.func.isRequired,
    onSupprimer: PropTypes.func,
};

export default VoitureCard;
