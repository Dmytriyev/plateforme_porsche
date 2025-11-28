/**
 * PackageItem - Affiche une option de package
 * 
 * @param {Object} pkg - Objet package avec _id, nom_package, description, photo_package, prix
 * @param {boolean} selected - État de sélection
 * @param {function} onSelect - Callback de sélection
 */
import PropTypes from "prop-types";
import buildUrl from "../../utils/buildUrl";
import buildImageUrl from "../../utils/buildImageUrl";
import ImageWithFallback from "../common/ImageWithFallback";
import { formatPrice } from "../../utils/helpers";

const PackageItem = ({ pkg, selected, onSelect }) => {
    const imageUrl = buildImageUrl(pkg.photo_package) ||
        (typeof pkg.photo_package === 'string' ? buildUrl(pkg.photo_package) : null);

    return (
        <button
            onClick={() => onSelect(pkg)}
            className={`configurateur-package-item ${selected ? "selected" : ""} ${imageUrl ? 'has-image' : ''}`}
            aria-pressed={selected}
            aria-label={`Package ${pkg.nom_package}${pkg.prix > 0 ? `, ${formatPrice(pkg.prix)} supplémentaire` : ""}`}
            type="button"
        >
            <div className="configurateur-package-image">
                {imageUrl ? (
                    <ImageWithFallback
                        src={imageUrl}
                        alt={pkg.nom_package}
                        imgProps={{ style: { width: '100%', height: '100%', objectFit: 'cover' } }}
                        placeholder={null}
                    />
                ) : (
                    <div className="configurateur-package-placeholder">
                        <svg
                            width="50"
                            height="50"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="1.5"
                            aria-hidden="true"
                        >
                            <path d="M12 2L2 7l10 5 10-5-10-5z" />
                            <path d="M2 17l10 5 10-5" />
                            <path d="M2 12l10 5 10-5" />
                        </svg>
                    </div>
                )}
            </div>
            <div className="configurateur-package-info">
                <span className="configurateur-package-name">{pkg.nom_package}</span>
                {pkg.description && (
                    <p className="configurateur-package-description">{pkg.description}</p>
                )}
                {pkg.prix > 0 && (
                    <span className="configurateur-package-price">+{formatPrice(pkg.prix)}</span>
                )}
            </div>
        </button>
    );
};

PackageItem.propTypes = {
    pkg: PropTypes.shape({
        _id: PropTypes.string.isRequired,
        nom_package: PropTypes.string.isRequired,
        description: PropTypes.string,
        photo_package: PropTypes.string,
        prix: PropTypes.number,
    }).isRequired,
    selected: PropTypes.bool.isRequired,
    onSelect: PropTypes.func.isRequired,
};

export default PackageItem;
