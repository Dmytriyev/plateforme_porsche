/**
 * CheckoutItem - Élément de récapitulatif de commande
 * Utilise les styles CSS existants (Checkout.css)
 */
import PropTypes from "prop-types";
import { formatPrice } from "../../utils/helpers";
import {
  formatLigneCommandeNom,
  calculateLignePrix,
} from "../../utils/checkoutValidation";

const CheckoutItem = ({ ligne }) => {
  const nom = formatLigneCommandeNom(ligne);
  const prixTotal = calculateLignePrix(ligne);
  const isVoiture = ligne.type_produit === true;

  return (
    <div className="checkout-item">
      <div className="checkout-item-details">
        <h3 className="checkout-item-name">{nom}</h3>
        <p className="checkout-item-quantity">Quantité : {ligne.quantite}</p>
        {isVoiture && (
          <p className="checkout-item-acompte">(Acompte de 10%)</p>
        )}
      </div>
      <div className="checkout-item-price">{formatPrice(prixTotal)}</div>
    </div>
  );
};

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
