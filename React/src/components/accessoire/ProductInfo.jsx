/**
 * ProductInfo - Composant d'affichage des informations produit
 * 
 * Principe SOLID : Responsabilité unique (affichage info)
 * Séparation des données et de la présentation
 * 
 * @param {Object} accessoire - Objet accessoire complet
 * @param {function} onAddToCart - Callback ajout au panier
 */
import PropTypes from "prop-types";
import { formatPrice } from "../../utils/helpers";

const ProductInfo = ({ accessoire, onAddToCart }) => {
    const {
        nom_accesoire,
        prix,
        type_accesoire,
        description,
        couleur_accesoire,
    } = accessoire;

    return (
        <div className="accessoire-info-porsche">
            {/* Catégorie */}
            <div className="accessoire-category-porsche">
                Accessoires
                {type_accesoire &&
                    ` / ${type_accesoire.charAt(0).toUpperCase() + type_accesoire.slice(1)}`}
            </div>

            {/* Nom du produit */}
            <h1 className="accessoire-title-porsche">{nom_accesoire}</h1>

            {/* Prix */}
            <div className="accessoire-price-porsche" aria-label={`Prix : ${formatPrice(prix)}`}>
                {formatPrice(prix)} T.T.C.
            </div>

            {/* Description courte */}
            {description && (
                <p className="accessoire-short-description-porsche">
                    {description.length > 150
                        ? `${description.substring(0, 150)}...`
                        : description}
                </p>
            )}

            {/* Bouton Ajouter au panier */}
            <div className="accessoire-actions-porsche">
                <button
                    onClick={onAddToCart}
                    className="accessoire-add-cart-btn-porsche"
                    type="button"
                    aria-label={`Ajouter ${nom_accesoire} au panier`}
                >
                    <svg
                        width="20"
                        height="20"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        aria-hidden="true"
                    >
                        <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
                        <line x1="3" y1="6" x2="21" y2="6" />
                        <path d="M16 10a4 4 0 0 1-8 0" />
                    </svg>
                    AJOUTER AU PANIER
                </button>
            </div>

            {/* Caractéristiques */}
            <section className="accessoire-sections-porsche">
                <div className="accessoire-section-porsche">
                    <h2 className="accessoire-section-title-porsche">Caractéristiques</h2>
                    <dl className="accessoire-section-content-porsche">
                        {type_accesoire && (
                            <div className="accessoire-characteristic-item">
                                <dt className="accessoire-characteristic-label">Type</dt>
                                <dd className="accessoire-characteristic-value">
                                    {type_accesoire.charAt(0).toUpperCase() +
                                        type_accesoire.slice(1)}
                                </dd>
                            </div>
                        )}
                        {couleur_accesoire && (
                            <div className="accessoire-characteristic-item">
                                <dt className="accessoire-characteristic-label">Couleur</dt>
                                <dd className="accessoire-characteristic-value">
                                    {couleur_accesoire.nom_couleur}
                                </dd>
                            </div>
                        )}
                    </dl>
                </div>
            </section>
        </div>
    );
};

ProductInfo.propTypes = {
    accessoire: PropTypes.shape({
        nom_accesoire: PropTypes.string.isRequired,
        prix: PropTypes.number.isRequired,
        type_accesoire: PropTypes.string,
        description: PropTypes.string,
        couleur_accesoire: PropTypes.shape({
            nom_couleur: PropTypes.string,
        }),
    }).isRequired,
    onAddToCart: PropTypes.func.isRequired,
};

export default ProductInfo;
