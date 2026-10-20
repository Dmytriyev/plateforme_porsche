import buildUrl from "../utils/buildUrl";
import ImageWithFallback from "../components/common/ImageWithFallback.jsx";
import { formatPrice } from "../utils/helpers.js";

const VarianteCard = ({ variante, isNeuf, onClick, onSelect }) => {
    const nomVariante = variante.nom_model || "Modèle";

    // select photo url (variante.photoPrincipale should be passed or compute fallback)
    const photoPrincipale = variante.photoPrincipale || null;
    const photoUrl = photoPrincipale?.name?.startsWith("http")
        ? photoPrincipale.name
        : photoPrincipale?.name
            ? buildUrl(photoPrincipale.name)
            : null;

    const prix = variante.prix_base || variante.prix_calcule || 0;

    return (
        <article
            className="catalogue-modele-card-neuf-porsche"
            role="article"
            aria-labelledby={`variante-title-${variante._id}`}
            data-variante-id={variante._id}
            onClick={onClick}
            tabIndex={onClick ? 0 : undefined}
            onKeyDown={(e) => {
                if (!onClick) return;
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    onClick();
                }
            }}
        >
            <h2 id={`variante-title-${variante._id}`} className="catalogue-modele-title-porsche">
                {nomVariante}
            </h2>

            <div className="catalogue-modele-image-porsche">
                <ImageWithFallback
                    src={photoUrl}
                    alt={nomVariante}
                    imgClass="catalogue-modele-img-porsche"
                    loading="lazy"
                    placeholder={
                        <div className="catalogue-modele-placeholder-porsche">
                            <span className="catalogue-modele-letter-porsche">{nomVariante?.charAt(0) || "?"}</span>
                        </div>
                    }
                />
            </div>

            <div className="catalogue-modele-prix-porsche">
                {prix > 0 ? (
                    <>
                        <span className="catalogue-prix-label">Prix à partir de</span>
                        <span className="catalogue-prix-montant">{formatPrice(prix)}</span>
                    </>
                ) : (
                    <>
                        <span className="catalogue-prix-label">Prix</span>
                        <span className="catalogue-prix-montant">Sur demande</span>
                    </>
                )}
            </div>

            {variante.message && (
                <div className="variante-virtual-message">
                    {variante.message}
                </div>
            )}

            <button
                className="catalogue-modele-btn-porsche"
                onClick={(e) => {
                    e.stopPropagation();
                    if (onSelect) return onSelect();
                    if (onClick) return onClick();
                }}
                disabled={variante.disponible === false}
                aria-disabled={variante.disponible === false}
                style={
                    variante.disponible === false
                        ? { opacity: 0.6, cursor: 'not-allowed' }
                        : {}
                }
            >
                {isNeuf ? 'Configurer' : 'Voir les détails'}
            </button>
        </article>
    );
};

export default VarianteCard;
