// Composant récapitulatif de commande
import PropTypes from "prop-types";
import { formatPrice } from "../../utils/helpers";
import CheckoutItem from "./CheckoutItem";
// Affichage du récapitulatif de la commande
const OrderSummary = ({ lignesCommande, total, nombreArticles }) => {
    return (
        <section
            className="bg-white rounded-lg shadow-md p-6"
            aria-labelledby="order-summary-title"
        >
            <h2
                id="order-summary-title"
                className="text-2xl font-bold text-gray-900 mb-6"
            >
                Récapitulatif de votre commande
            </h2>

            {/* Liste des articles */}
            <div
                className="mb-6"
                role="list"
                aria-label="Articles de la commande"
            >
                {lignesCommande.map((ligne) => (
                    <CheckoutItem key={ligne._id} ligne={ligne} />
                ))}
            </div>

            {/* Résumé des totaux */}
            <div className="border-t border-gray-200 pt-6 space-y-3">
                <div className="flex items-center justify-between text-gray-700">
                    <span>
                        Articles ({nombreArticles})
                    </span>
                    <span className="font-semibold">{formatPrice(total)}</span>
                </div>

                <div className="flex items-center justify-between text-gray-700">
                    <span>Frais de livraison</span>
                    <span className="font-semibold text-green-600">Gratuit</span>
                </div>

                <div className="border-t border-gray-200 pt-3 mt-3">
                    <div className="flex items-center justify-between">
                        <span className="text-xl font-bold text-gray-900">
                            Total à payer
                        </span>
                        <span className="text-2xl font-bold text-red-600">
                            {formatPrice(total)}
                        </span>
                    </div>
                </div>
            </div>

            {/* Badge sécurité */}
            <div className="mt-6 flex items-center justify-center text-gray-600 bg-gray-50 rounded-lg py-3">
                <svg
                    className="w-5 h-5 mr-2 text-green-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    aria-hidden="true"
                >
                    <rect x="5" y="11" width="14" height="10" rx="2" ry="2" />
                    <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                </svg>
                <span className="text-sm font-medium">
                    Paiement sécurisé par Stripe
                </span>
            </div>
        </section>
    );
};
// function PropTypes
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
