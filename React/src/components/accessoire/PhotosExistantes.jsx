/**
 * Composant de gestion des photos existantes d'un accessoire
 * Affiche les photos avec possibilité de marquer pour suppression
 */
import buildUrl from "../../utils/buildUrl";
import PropTypes from "prop-types";

const PhotosExistantes = ({ photos, photosASupprimer, onMarquerSuppression, onAnnulerSuppression }) => {
    if (!photos || photos.length === 0) {
        return null;
    }

    return (
        <div className="modifier-accessoire-section">
            <h2 className="modifier-accessoire-section-title">Photos existantes</h2>
            <div className="modifier-accessoire-photos-grid">
                {photos.map((photo) => {
                    const isMarkedForDeletion = photosASupprimer.includes(photo._id);

                    return (
                        <div
                            key={photo._id}
                            className={`modifier-accessoire-photo-item ${isMarkedForDeletion ? "marked-delete" : ""}`}
                        >
                            <img
                                src={buildUrl(photo.name)}
                                alt={photo.alt || "Photo accessoire"}
                                loading="lazy"
                            />
                            {isMarkedForDeletion ? (
                                <button
                                    type="button"
                                    onClick={() => onAnnulerSuppression(photo._id)}
                                    className="modifier-accessoire-photo-restore"
                                    aria-label="Annuler la suppression de cette photo"
                                >
                                    <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
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
                                <button
                                    type="button"
                                    onClick={() => onMarquerSuppression(photo._id)}
                                    className="modifier-accessoire-photo-delete"
                                    aria-label="Marquer cette photo pour suppression"
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
                            )}
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

PhotosExistantes.propTypes = {
    photos: PropTypes.arrayOf(
        PropTypes.shape({
            _id: PropTypes.string.isRequired,
            name: PropTypes.string.isRequired,
            alt: PropTypes.string,
        })
    ).isRequired,
    photosASupprimer: PropTypes.arrayOf(PropTypes.string).isRequired,
    onMarquerSuppression: PropTypes.func.isRequired,
    onAnnulerSuppression: PropTypes.func.isRequired,
};

export default PhotosExistantes;
