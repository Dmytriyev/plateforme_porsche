/**
 * pages/PaymentSuccess.jsx — Affiche succès du paiement; serveur finalise via webhook.
 *
 * @file pages/PaymentSuccess.jsx
 */

import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "../css/PaymentStatus.css";

// Page : affiche le succès du paiement; redirige automatiquement vers l'historique des commandes.
const PaymentSuccess = () => {
  const navigate = useNavigate();

  useEffect(() => {
    // Rediriger vers les commandes après 5 secondes
    const timer = setTimeout(() => {
      navigate("/mes-commandes");
    }, 5000);

    return () => clearTimeout(timer);
  }, [navigate]);

  return (
    <div className="payment-status-container">
      <div className="payment-status-content">
        <div className="payment-status-icon payment-status-success">
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="3"
          >
            <polyline points="20 6 9 17 4 12"></polyline>
          </svg>
        </div>
        <h1 className="payment-status-title">Paiement réussi !</h1>
        <p className="payment-status-message">
          Merci pour votre commande. Votre paiement a été traité avec succès.
        </p>
        <p className="payment-status-info">
          Vous recevrez un email de confirmation avec les détails de votre
          commande.
        </p>
        <div className="payment-status-actions">
          <button
            onClick={() => navigate("/mes-commandes")}
            className="payment-status-btn payment-status-btn-primary"
          >
            Voir mes commandes
          </button>
          <button
            onClick={() => navigate("/")}
            className="payment-status-btn payment-status-btn-secondary"
          >
            Retour à l'accueil
          </button>
        </div>
        <p className="payment-status-redirect">
          Vous serez redirigé vers vos commandes dans quelques secondes...
        </p>
      </div>
    </div>
  );
};

export default PaymentSuccess;
