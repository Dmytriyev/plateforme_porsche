/**
 * JanteItem - Affiche une option de jante avec image et taille
 * 
 * @param {Object} jante - Objet jante avec _id, taille_jante, photo_jante, prix
 * @param {boolean} selected - État de sélection
 * @param {function} onSelect - Callback de sélection
 */
import PropTypes from "prop-types";
import buildImageUrl from "../../utils/buildImageUrl";
import { formatPrice } from "../../utils/helpers";

const JanteItem = ({ jante, selected, onSelect }) => {
    const imageUrl = buildImageUrl(jante.photo_jante);

    return (
        <button
            onClick={() => onSelect(jante)}
            className={`configurateur-jante-item ${selected ? "selected" : ""}`}
            aria-pressed={selected}
            aria-label={`Jante ${jante.taille_jante} pouces${jante.prix > 0 ? `, ${formatPrice(jante.prix)} supplémentaire` : ""}`}
            type="button"
        >
            {imageUrl && (
                <div className="configurateur-jante-image">
                    <img
                        src={imageUrl}
                        alt={`Jante ${jante.taille_jante} pouces`}
                        loading="lazy"
                    />
                </div>
            )}
            <div className="configurateur-jante-info">
                <span className="configurateur-jante-size">{jante.taille_jante}"</span>
                {jante.prix > 0 && (
                    <span className="configurateur-jante-price">+{formatPrice(jante.prix)}</span>
                )}
            </div>
        </button>
    );
};

JanteItem.propTypes = {
    jante: PropTypes.shape({
        _id: PropTypes.string.isRequired,
        taille_jante: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
        photo_jante: PropTypes.string,
        prix: PropTypes.number,
    }).isRequired,
    selected: PropTypes.bool.isRequired,
    onSelect: PropTypes.func.isRequired,
};

export default JanteItem;
