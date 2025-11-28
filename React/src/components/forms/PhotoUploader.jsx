/**
 * PhotoUploader - Composant d'upload de photos avec previews
 * 
 * Principe : Responsabilité unique (gestion photos)
 * Accessibilité : ARIA labels, keyboard navigation
 * 
 * @param {Array} photos - Fichiers photos
 * @param {Array} previews - URLs preview
 * @param {function} onAdd - Callback ajout photos
 * @param {function} onRemove - Callback suppression photo
 * @param {number} maxPhotos - Nombre max de photos
 * @param {number} maxSize - Taille max par fichier (MB)
 */
import PropTypes from "prop-types";

const PhotoUploader = ({
    photos = [],
    previews = [],
    onAdd,
    onRemove,
    maxPhotos = 10,
    maxSize = 5,
}) => {
    const handleFileChange = (e) => {
        const files = Array.from(e.target.files);
        onAdd(files);
        e.target.value = ""; // Reset input
    };

    const remainingSlots = maxPhotos - photos.length;

    return (
        <div className="ajouter-accessoire-section">
            <h2 className="ajouter-accessoire-section-title">
                Photos (max {maxPhotos})
            </h2>

            <div className="ajouter-accessoire-upload-area">
                <input
                    type="file"
                    id="photo-upload"
                    accept="image/*"
                    multiple
                    onChange={handleFileChange}
                    className="ajouter-accessoire-upload-input"
                    disabled={remainingSlots === 0}
                    aria-label={`Ajouter des photos. ${remainingSlots} emplacements restants`}
                />
                <label
                    htmlFor="photo-upload"
                    className={`ajouter-accessoire-upload-label ${remainingSlots === 0 ? "disabled" : ""}`}
                >
                    <svg
                        width="48"
                        height="48"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        aria-hidden="true"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M12 4v16m8-8H4"
                        />
                    </svg>
                    <span>
                        {remainingSlots > 0
                            ? "Cliquez pour ajouter des photos"
                            : "Limite atteinte"}
                    </span>
                    <span className="ajouter-accessoire-upload-hint">
                        PNG, JPG jusqu'à {maxSize}MB (max {maxPhotos} photos)
                    </span>
                </label>
            </div>

            {previews.length > 0 && (
                <div
                    className="ajouter-accessoire-photos-grid"
                    role="list"
                    aria-label="Photos téléchargées"
                >
                    {previews.map((preview, index) => (
                        <div
                            key={index}
                            className="ajouter-accessoire-photo-item"
                            role="listitem"
                        >
                            <img
                                src={preview}
                                alt={`Aperçu ${index + 1}`}
                                loading="lazy"
                            />
                            <button
                                type="button"
                                onClick={() => onRemove(index)}
                                className="ajouter-accessoire-photo-delete"
                                aria-label={`Supprimer la photo ${index + 1}`}
                            >
                                <svg
                                    width="20"
                                    height="20"
                                    viewBox="0 0 20 20"
                                    fill="none"
                                    aria-hidden="true"
                                >
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

PhotoUploader.propTypes = {
    photos: PropTypes.array,
    previews: PropTypes.array,
    onAdd: PropTypes.func.isRequired,
    onRemove: PropTypes.func.isRequired,
    maxPhotos: PropTypes.number,
    maxSize: PropTypes.number,
};

export default PhotoUploader;
