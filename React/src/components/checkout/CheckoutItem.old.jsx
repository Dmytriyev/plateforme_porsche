// Élément de récapitulatif de commande
import PropTypes from "prop-types";
import { formatPrice } from "../../utils/helpers";
import {
    formatLigneCommandeNom,
    calculateLignePrix,
} from "../../utils/checkoutValidation";
// Affichage d'une ligne de commande dans le récapitulatif
const CheckoutItem = ({ ligne }) => {
    // Calcul du nom et du prix total
    const nom = formatLigneCommandeNom(ligne);
    const prixTotal = calculateLignePrix(ligne);
    const isVoiture = ligne.type_produit === true;

    return (
        <div
            className="flex items-start justify-between py-4 border-b border-gray-200 last:border-b-0"
            role="listitem"
        >
            <div className="flex-1">
                <h3 className="text-lg font-semibold text-gray-900">{nom}</h3>
                <p className="text-sm text-gray-600 mt-1">
                    Quantité : {ligne.quantite}
                </p>
                {isVoiture && (
                    <p className="text-sm text-red-600 mt-1 font-medium">
                        Acompte de 10%
                    </p>
                )}
            </div>
            <div className="text-right ml-4">
                <p className="text-lg font-bold text-gray-900">
                    {formatPrice(prixTotal)}
                </p>
            </div>
        </div>
    );
};
// PropTypes pour CheckoutItem
CheckoutItem.propTypes = {
    ligne: PropTypes.shape({
        _id: PropTypes.string.isRequired,
        quantite: PropTypes.number.isRequired,
        type_produit: PropTypes.bool,
        voiture: PropTypes.object,
        accesoire: PropTypes.object,
        acompte: PropTypes.number,
    }).isRequired,
};

export default CheckoutItem;
