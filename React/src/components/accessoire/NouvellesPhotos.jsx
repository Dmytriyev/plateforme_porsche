/**
 * Composant pour ajouter de nouvelles photos à un accessoire
 * Gère l'upload et la prévisualisation des nouvelles images
 */
import PropTypes from "prop-types";

const NouvellesPhotos = ({ photosPreviews, onAjouterPhotos, onSupprimerPhoto }) => {
    return (
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
                    onChange={onAjouterPhotos}
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

            {photosPreviews.length > 0 && (
                <div className="modifier-accessoire-photos-grid">
                    {photosPreviews.map((preview, index) => (
                        <div key={index} className="modifier-accessoire-photo-item">
                            <img
                                src={preview}
                                alt={`Nouvelle photo ${index + 1}`}
                                loading="lazy"
                            />
                            <button
                                type="button"
                                onClick={() => onSupprimerPhoto(index)}
                                className="modifier-accessoire-photo-delete"
                                aria-label={`Supprimer la photo ${index + 1}`}
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
    );
};

NouvellesPhotos.propTypes = {
    photosPreviews: PropTypes.arrayOf(PropTypes.string).isRequired,
    onAjouterPhotos: PropTypes.func.isRequired,
    onSupprimerPhoto: PropTypes.func.isRequired,
};

export default NouvellesPhotos;
