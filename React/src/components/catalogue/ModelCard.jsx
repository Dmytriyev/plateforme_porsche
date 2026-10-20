// Composant carte de modèle Porsche (neuf et occasion)
import { useNavigate } from "react-router-dom";
import PropTypes from "prop-types";
import { getPhotoUrl, getPhotoPrincipale } from "../../utils/catalogueHelpers";
import { formatPrice } from "../../utils/helpers";
// Composant ModelCard
const ModelCard = ({ modele, isNeuf }) => {
    const navigate = useNavigate();
    // Photo principale
    const photo = getPhotoPrincipale(modele.photo_voiture);
    const photoUrl = photo ? getPhotoUrl(photo) : null;
    // Navigation
    const handleClick = () => {
        if (isNeuf) {
            // Rediriger vers la page des variantes pour choisir la configuration
            navigate(`/variantes/neuve/${modele._id}`, {
                state: { modele },
            });
        } else {
            // Rediriger vers la page des variantes occasion
            navigate(`/variantes/occasion/${modele._id}`, {
                state: { modele },
            });
        }
    };

    // Prix : neuf utilise prix_base, occasion utilise prix_depuis
    const prix = isNeuf ? modele.prix_base : modele.prix_depuis;
    const afficherPrix = prix && prix > 0;

    return (
        <article
            className="catalogue-modele-card-neuf-porsche"
            aria-label={`${modele.nom_model} ${isNeuf ? "neuve" : "d'occasion"}`}
            onClick={handleClick}
        >
            <h2 className="catalogue-modele-title-porsche">
                {modele.nom_model}
            </h2>

            <div className="catalogue-modele-image-porsche">
                {photoUrl ? (
                    <img
                        src={photoUrl}
                        alt={`Porsche ${modele.nom_model}`}
                        className="catalogue-modele-img-porsche"
                        loading="lazy"
                    />
                ) : (
                    <div className="catalogue-modele-placeholder-porsche">
                        <span className="catalogue-modele-letter-porsche">
                            {modele.nom_model.charAt(0)}
                        </span>
                    </div>
                )}
            </div>

            <div className="catalogue-modele-prix-porsche">
                {afficherPrix ? (
                    <>
                        <span className="catalogue-prix-label">
                            {isNeuf ? "À partir de" : "Dès"}
                        </span>
                        <span className="catalogue-prix-montant">
                            {formatPrice(prix)}
                        </span>
                    </>
                ) : (
                    <>
                        <span className="catalogue-prix-label">Prix</span>
                        <span className="catalogue-prix-montant">Sur demande</span>
                    </>
                )}
            </div>

            <button
                className="catalogue-modele-btn-porsche"
                aria-label={`${isNeuf ? "Configurer" : "Voir les occasions"} Porsche ${modele.nom_model}`}
            >
                {isNeuf ? "Configurer" : "Voir les occasions"}
            </button>
        </article>
    );
};
// PropTypes pour ModelCard
ModelCard.propTypes = {
    modele: PropTypes.shape({
        _id: PropTypes.string.isRequired,
        nom_model: PropTypes.string.isRequired,
        description: PropTypes.string,
        photo_voiture: PropTypes.array,
        prix_base: PropTypes.number,
        prix_depuis: PropTypes.number,
        nombre_occasions: PropTypes.number,
        carrosseries_disponibles: PropTypes.arrayOf(PropTypes.string),
        transmissions_disponibles: PropTypes.arrayOf(PropTypes.string),
    }).isRequired,
    isNeuf: PropTypes.bool.isRequired,
};

export default ModelCard;
