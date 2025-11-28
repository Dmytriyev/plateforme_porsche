/**
 * OrderSummary - Récapitulatif de commande
 * Utilise les styles CSS existants (Checkout.css)
 */
import PropTypes from "prop-types";
import { formatPrice } from "../../utils/helpers";
import CheckoutItem from "./CheckoutItem";

const OrderSummary = ({ lignesCommande, total, nombreArticles }) => {
  return (
    <div>
      <div className="checkout-items">
        {lignesCommande.map((ligne) => (
          <CheckoutItem key={ligne._id} ligne={ligne} />
        ))}
      </div>

      <div className="checkout-summary-card">
        <div className="checkout-summary-item">
          <span>Articles ({nombreArticles})</span>
          <span>{formatPrice(total)}</span>
        </div>
        <div className="checkout-summary-item">
          <span>Frais de livraison</span>
          <span className="checkout-free">Gratuit</span>
        </div>
        <div className="checkout-summary-divider"></div>
        <div className="checkout-summary-item checkout-summary-total">
          <span>Total à payer</span>
          <span>{formatPrice(total)}</span>
        </div>
      </div>

      <div className="checkout-security-info">
        <svg
          className="checkout-lock-icon"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
        >
          <rect x="5" y="11" width="14" height="10" rx="2" ry="2"></rect>
          <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
        </svg>
        <p>Paiement sécurisé par Stripe</p>
      </div>
    </div>
  );
};

OrderSummary.propTypes = {
  lignesCommande: PropTypes.arrayOf(
    PropTypes.shape({
      _id: PropTypes.string.isRequired,
      quantite: PropTypes.number.isRequired,
    })
  ).isRequired,
  total: PropTypes.number.isRequired,
  nombreArticles: PropTypes.number.isRequired,
};

export default OrderSummary;
