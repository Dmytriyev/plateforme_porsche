// Composant de carte d'accessoire
import PropTypes from "prop-types";
import buildUrl from "../../utils/buildUrl";
import ImageWithFallback from "../common/ImageWithFallback";
import { formatPrice } from "../../utils/helpers";
import { useMemo } from "react";
// Composant AccessoireCard
const AccessoireCard = ({
    accessoire,
    isStaff = false,
    onAddToCart,
    onViewDetails,
    onEdit,
    onDelete,
}) => {
    // Désignation des propriétés de l'accessoire
    const {
        _id,
        nom_accesoire,
        prix,
        prix_promotion,
        photo_accesoire,
        stock,
        disponible,
    } = accessoire;

    // Calculs dérivés mémoïsés
    const photoPrincipale = useMemo(
        () => photo_accesoire?.[0] || null,
        [photo_accesoire]
    );
    // URL de la photo principale
    const photoUrl = useMemo(
        () => (photoPrincipale?.name ? buildUrl(photoPrincipale.name) : null),
        [photoPrincipale]
    );
    // Vérification rupture de stock
    const isOutOfStock = stock === 0 || disponible === false;
    // Vérification promotion active
    const hasDiscount = prix_promotion && prix_promotion < prix;

    return (
        <article
            className="accessoire-card-porsche"
            data-accessoire-id={_id}
            aria-label={`Accessoire : ${nom_accesoire}`}
        >
            {/* Image container avec badges */}
            <div className="accessoire-card-image-container">
                {hasDiscount && !isOutOfStock && (
                    <div className="accessoire-card-badge" aria-label="Promotion Cyber Week">
                        Cyber Week
                    </div>
                )}
                {/* Badge rupture de stock */}
                {isOutOfStock && (
                    <div
                        className="accessoire-card-out-of-stock"
                        role="status"
                        aria-label="Produit en rupture de stock"
                    >
                        En rupture de stock
                    </div>
                )}
                {/* Image principale avec fallback */}
                <ImageWithFallback
                    src={photoUrl}
                    alt={photoPrincipale?.alt || nom_accesoire}
                    imgClass="accessoire-card-image"
                    imgProps={{ loading: "lazy" }}
                    placeholder={
                        <div className="accessoire-card-image-placeholder">
                            <span className="accessoire-card-image-letter">
                                {nom_accesoire?.charAt(0) || "?"}
                            </span>
                        </div>
                    }
                />
            </div>

            {/* Contenu de la carte */}
            <div className="accessoire-card-content">
                <h3 className="accessoire-card-name">{nom_accesoire}</h3>

                {/* Prix avec gestion promo */}
                <div className="accessoire-card-price" aria-label={`Prix : ${formatPrice(hasDiscount ? prix_promotion : prix)}`}>
                    {hasDiscount ? (
                        <>
                            <span className="accessoire-card-price-old">
                                {formatPrice(prix)}
                            </span>
                            <span className="accessoire-card-price-new">
                                {formatPrice(prix_promotion)}
                            </span>
                        </>
                    ) : (
                        <span className="accessoire-card-price-current">
                            {formatPrice(prix)}
                        </span>
                    )}
                </div>

                {/* Actions principales */}
                <div className="accessoire-card-actions">
                    <button
                        className="accessoire-card-btn accessoire-card-btn-primary"
                        onClick={() => onAddToCart(accessoire)}
                        disabled={isOutOfStock}
                        type="button"
                        aria-label={`Ajouter ${nom_accesoire} au panier`}
                    >
                        AJOUTER AU PANIER
                    </button>
                    <button
                        className="accessoire-card-btn accessoire-card-btn-secondary"
                        onClick={() => onViewDetails(_id)}
                        type="button"
                        aria-label={`Voir les détails de ${nom_accesoire}`}
                    >
                        DÉTAILS
                    </button>
                </div>

                {/* Actions admin (visible seulement pour le staff) */}
                {isStaff && (
                    <div className="accessoire-card-admin-actions">
                        <button
                            className="accessoire-card-admin-btn accessoire-card-admin-btn-edit"
                            onClick={() => onEdit(_id)}
                            type="button"
                            aria-label={`Modifier ${nom_accesoire}`}
                        >
                            <svg
                                width="16"
                                height="16"
                                viewBox="0 0 20 20"
                                fill="none"
                                xmlns="http://www.w3.org/2000/svg"
                                aria-hidden="true"
                            >
                                <path
                                    d="M13.5858 3.58579C14.3668 2.80474 15.6332 2.80474 16.4142 3.58579C17.1953 4.36683 17.1953 5.63316 16.4142 6.41421L15.6213 7.20711L12.7929 4.37868L13.5858 3.58579Z"
                                    fill="currentColor"
                                />
                                <path
                                    d="M11.3787 5.79289L3 14.1716V17H5.82843L14.2071 8.62132L11.3787 5.79289Z"
                                    fill="currentColor"
                                />
                            </svg>
                            Modifier
                        </button>
                        <button
                            className="accessoire-card-admin-btn accessoire-card-admin-btn-delete"
                            onClick={() => onDelete(accessoire)}
                            type="button"
                            aria-label={`Supprimer ${nom_accesoire}`}
                        >
                            <svg
                                width="16"
                                height="16"
                                viewBox="0 0 20 20"
                                fill="none"
                                xmlns="http://www.w3.org/2000/svg"
                                aria-hidden="true"
                            >
                                <path
                                    fillRule="evenodd"
                                    clipRule="evenodd"
                                    d="M9 2C8.62123 2 8.27497 2.214 8.10557 2.55279L7.38197 4H4C3.44772 4 3 4.44772 3 5C3 5.55228 3.44772 6 4 6V16C4 17.1046 4.89543 18 6 18H14C15.1046 18 16 17.1046 16 16V6C16.5523 6 17 5.55228 17 5C17 4.44772 16.5523 4 16 4H12.618L11.8944 2.55279C11.725 2.214 11.3788 2 11 2H9ZM7 8C7 7.44772 7.44772 7 8 7C8.55228 7 9 7.44772 9 8V14C9 14.5523 8.55228 15 8 15C7.44772 15 7 14.5523 7 14V8ZM12 7C11.4477 7 11 7.44772 11 8V14C11 14.5523 11.4477 15 12 15C12.5523 15 13 14.5523 13 14V8C13 7.44772 12.5523 7 12 7Z"
                                    fill="currentColor"
                                />
                            </svg>
                            Supprimer
                        </button>
                    </div>
                )}
            </div>
        </article>
    );
};

// PropTypes pour le composant
AccessoireCard.propTypes = {
    accessoire: PropTypes.shape({
        _id: PropTypes.string.isRequired,
        nom_accesoire: PropTypes.string.isRequired,
        prix: PropTypes.number.isRequired,
        prix_promotion: PropTypes.number,
        photo_accesoire: PropTypes.array,
        stock: PropTypes.number,
        disponible: PropTypes.bool,
    }).isRequired,
    // Indique si l'utilisateur est du personnel
    isStaff: PropTypes.bool,
    onAddToCart: PropTypes.func.isRequired,
    onViewDetails: PropTypes.func.isRequired,
    onEdit: PropTypes.func,
    onDelete: PropTypes.func,
};

export default AccessoireCard;
