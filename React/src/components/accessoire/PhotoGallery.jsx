/**
 * PhotoGallery - Composant réutilisable pour galerie photo avec navigation
 * 
 * Principe SOLID : Responsabilité unique (affichage galerie)
 * Accessibilité : Navigation clavier, ARIA labels, compteur
 * 
 * @param {Array} photos - Tableau de photos
 * @param {number} activeIndex - Index de la photo active
 * @param {function} onChangeIndex - Callback changement d'index
 * @param {string} productName - Nom du produit (pour alt text)
 */
import PropTypes from "prop-types";
import { useCallback } from "react";
import buildUrl from "../../utils/buildUrl";
import ImageWithFallback from "../common/ImageWithFallback";

const PhotoGallery = ({ photos, activeIndex, onChangeIndex, productName }) => {
    const hasMultiplePhotos = photos.length > 1;

    const handlePrev = useCallback(() => {
        onChangeIndex(activeIndex === 0 ? photos.length - 1 : activeIndex - 1);
    }, [activeIndex, photos.length, onChangeIndex]);

    const handleNext = useCallback(() => {
        onChangeIndex(activeIndex === photos.length - 1 ? 0 : activeIndex + 1);
    }, [activeIndex, photos.length, onChangeIndex]);

    // Gestion clavier (flèches gauche/droite)
    const handleKeyDown = useCallback(
        (e) => {
            if (e.key === "ArrowLeft") handlePrev();
            if (e.key === "ArrowRight") handleNext();
        },
        [handlePrev, handleNext]
    );

    if (photos.length === 0) {
        return (
            <div className="gallery-main-porsche">
                <div className="gallery-main-placeholder-porsche">
                    <span className="gallery-placeholder-letter-porsche">
                        {productName?.charAt(0) || "?"}
                    </span>
                </div>
            </div>
        );
    }

    return (
        <div className="accessoire-gallery-porsche">
            {/* Photo principale */}
            <div
                className="gallery-main-porsche"
                onKeyDown={handleKeyDown}
                tabIndex={hasMultiplePhotos ? 0 : -1}
                role="region"
                aria-label="Galerie photo du produit"
            >
                {hasMultiplePhotos && (
                    <button
                        className="gallery-nav-btn gallery-nav-prev"
                        onClick={handlePrev}
                        aria-label="Photo précédente"
                        type="button"
                    >
                        <svg
                            width="24"
                            height="24"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            aria-hidden="true"
                        >
                            <path d="M19 12H5M12 19l-7-7 7-7" />
                        </svg>
                    </button>
                )}

                <ImageWithFallback
                    src={photos[activeIndex] ? buildUrl(photos[activeIndex].name) : null}
                    alt={photos[activeIndex]?.alt || `${productName} - Vue principale`}
                    imgClass="gallery-main-image-porsche"
                    imgProps={{ style: { maxWidth: "100%", height: "auto" } }}
                    placeholder={
                        <div className="gallery-main-placeholder-porsche">
                            <span className="gallery-placeholder-letter-porsche">
                                {productName?.charAt(0) || "?"}
                            </span>
                        </div>
                    }
                />

                {hasMultiplePhotos && (
                    <>
                        <button
                            className="gallery-nav-btn gallery-nav-next"
                            onClick={handleNext}
                            aria-label="Photo suivante"
                            type="button"
                        >
                            <svg
                                width="24"
                                height="24"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                                aria-hidden="true"
                            >
                                <path d="M5 12h14M12 5l7 7-7 7" />
                            </svg>
                        </button>

                        <div className="gallery-counter" aria-live="polite">
                            {activeIndex + 1} / {photos.length}
                        </div>
                    </>
                )}
            </div>

            {/* Miniatures */}
            {hasMultiplePhotos && (
                <nav className="gallery-thumbs-porsche" aria-label="Miniatures des photos">
                    {photos.map((photo, index) => (
                        <button
                            key={photo._id || `photo-${index}`}
                            onClick={() => onChangeIndex(index)}
                            className={`gallery-thumb-porsche ${activeIndex === index ? "gallery-thumb-active-porsche" : ""
                                }`}
                            aria-label={`Afficher la photo ${index + 1}`}
                            aria-current={activeIndex === index ? "true" : undefined}
                            type="button"
                        >
                            <ImageWithFallback
                                src={photo && photo.name ? buildUrl(photo.name) : null}
                                alt={photo?.alt || `Photo ${index + 1}`}
                                imgProps={{ style: { width: "100%", height: "auto" } }}
                                placeholder={<div className="gallery-thumb-missing-porsche" />}
                            />
                        </button>
                    ))}
                </nav>
            )}
        </div>
    );
};

PhotoGallery.propTypes = {
    photos: PropTypes.arrayOf(
        PropTypes.shape({
            _id: PropTypes.string,
            name: PropTypes.string,
            alt: PropTypes.string,
        })
    ).isRequired,
    activeIndex: PropTypes.number.isRequired,
    onChangeIndex: PropTypes.func.isRequired,
    productName: PropTypes.string.isRequired,
};

export default PhotoGallery;
