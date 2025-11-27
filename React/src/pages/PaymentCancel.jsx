// Affiche annulation de paiement et actions possibles
import "../css/PaymentStatus.css";
import { useNavigate } from "react-router-dom";

// affiche l'annulation d'un paiement et propose actions (retour panier / accueil).
const PaymentCancel = () => {
  const navigate = useNavigate();

  return (
    // Structure de la page d'annulation de paiement avec styles Porsche
    <div className="payment-status-container">
      {/* Contenu de la page d'annulation de paiement */}
      <div className="payment-status-content">
        {/* Icône d'annulation */}
        <div className="payment-status-icon payment-status-cancel">
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="3"
          >
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
        </div>
        <h1 className="payment-status-title">Paiement annulé</h1>
        <p className="payment-status-message">
          Votre paiement a été annulé. Aucun montant n'a été débité.
        </p>
        <p className="payment-status-info">
          Vos articles restent dans votre panier. Vous pouvez continuer vos
          achats ou réessayer le paiement.
        </p>
        <div className="payment-status-actions">
          <button
            onClick={() => navigate("/panier")}
            className="payment-status-btn payment-status-btn-primary"
          >
            Retour au panier
          </button>
          <button
            onClick={() => navigate("/")}
            className="payment-status-btn payment-status-btn-secondary"
          >
            Continuer mes achats
          </button>
        </div>
      </div>
    </div>
  );
};

export default PaymentCancel;
