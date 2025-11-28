/**
 * SiegeItem - Affiche une option de siège
 * 
 * @param {Object} siege - Objet siège avec _id, nom_siege, photo_siege, prix
 * @param {boolean} selected - État de sélection
 * @param {function} onSelect - Callback de sélection
 */
import PropTypes from "prop-types";
import buildImageUrl from "../../utils/buildImageUrl";
import { formatPrice } from "../../utils/helpers";

const SiegeItem = ({ siege, selected, onSelect }) => {
    const imageUrl = buildImageUrl(siege.photo_siege);

    return (
        <button
            onClick={() => onSelect(siege)}
            className={`configurateur-siege-item ${selected ? "selected" : ""}`}
            aria-pressed={selected}
            aria-label={`Siège ${siege.nom_siege}${siege.prix > 0 ? `, ${formatPrice(siege.prix)} supplémentaire` : ""}`}
            type="button"
        >
            {imageUrl && (
                <div className="configurateur-siege-image">
                    <img
                        src={imageUrl}
                        alt={siege.nom_siege}
                        loading="lazy"
                    />
                </div>
            )}
            <div className="configurateur-siege-info">
                <span className="configurateur-siege-name">{siege.nom_siege}</span>
                {siege.prix > 0 && (
                    <span className="configurateur-siege-price">+{formatPrice(siege.prix)}</span>
                )}
            </div>
        </button>
    );
};

SiegeItem.propTypes = {
    siege: PropTypes.shape({
        _id: PropTypes.string.isRequired,
        nom_siege: PropTypes.string.isRequired,
        photo_siege: PropTypes.string,
        prix: PropTypes.number,
    }).isRequired,
    selected: PropTypes.bool.isRequired,
    onSelect: PropTypes.func.isRequired,
};

export default SiegeItem;
