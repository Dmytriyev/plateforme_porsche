/**
 * ColorItem - Affiche une option de couleur (extérieure ou intérieure)
 * Utilise soit une image, soit un swatch de couleur (code hex)
 * 
 * Principe SOLID : Responsabilité unique (affichage d'une couleur)
 * 
 * @param {Object} couleur - Objet couleur avec _id, nom_couleur, prix, photo_couleur, code_hex
 * @param {boolean} selected - Indique si cette couleur est sélectionnée
 * @param {function} onSelect - Callback lors de la sélection
 */
import PropTypes from "prop-types";
import buildUrl from "../../utils/buildUrl";
import { formatPrice } from "../../utils/helpers";

const ColorItem = ({ couleur, selected, onSelect }) => {
    return (
        <button
            onClick={() => onSelect(couleur)}
            className={`configurateur-color-item ${selected ? "selected" : ""}`}
            aria-pressed={selected}
            aria-label={`Couleur ${couleur.nom_couleur}${couleur.prix > 0 ? `, ${formatPrice(couleur.prix)} supplémentaire` : ""}`}
            type="button"
        >
            {couleur.photo_couleur ? (
                <img
                    src={buildUrl(couleur.photo_couleur)}
                    alt={couleur.nom_couleur}
                    className="configurateur-color-item-image"
                    loading="lazy"
                />
            ) : (
                <div
                    className="configurateur-color-item-swatch"
                    style={{ backgroundColor: couleur.code_hex || "#ccc" }}
                    role="img"
                    aria-label={`Échantillon de couleur ${couleur.nom_couleur}`}
                />
            )}
            <div className="configurateur-color-item-info">
                <span className="configurateur-color-item-name">{couleur.nom_couleur}</span>
                {couleur.prix > 0 && (
                    <span className="configurateur-color-item-price">+{formatPrice(couleur.prix)}</span>
                )}
            </div>
        </button>
    );
};

ColorItem.propTypes = {
    couleur: PropTypes.shape({
        _id: PropTypes.string.isRequired,
        nom_couleur: PropTypes.string.isRequired,
        prix: PropTypes.number,
        photo_couleur: PropTypes.string,
        code_hex: PropTypes.string,
    }).isRequired,
    selected: PropTypes.bool.isRequired,
    onSelect: PropTypes.func.isRequired,
};

export default ColorItem;
