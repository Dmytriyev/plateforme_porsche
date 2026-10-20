/**
 * ReservationForm.jsx — Formulaire de réservation réutilisable; validation locale avant envoi.
 *
 * @file components/ReservationForm.jsx
 */

import "../css/components/ReservationForm.css";
import useReservation from "../hooks/useReservation";
import { error as logError } from "../utils/logger.js";
import { Elements } from "@stripe/react-stripe-js";
import { loadStripe } from "@stripe/stripe-js";
import Button from "./common/Button.jsx";
import PaymentForm from "./PaymentForm";
import { useState, useMemo } from "react";

const stripePromise = loadStripe(
  import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY || "",
);

// Composant formulaire : créer une réservation puis initier le paiement (Stripe)
export default function ReservationForm({
  initialConfig = {},
  onCompleted,
}) {
  const {
    createReservation,
    reservation,
    getReservation,
    pollReservationStatus,
  } = useReservation();
  const [config] = useState(initialConfig);
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState(null);

  const clientSecret = reservation?.clientSecret;
  const reservationToken = reservation?.reservationToken || reservation?.token;

  const handleCreate = async () => {
    setError(null);
    setCreating(true);
    try {
      const data = await createReservation({ config });
      if (data?.reservationToken) {
        pollReservationStatus(data.reservationToken, { interval: 3000 });
      } else if (data?.token) {
        pollReservationStatus(data.token, { interval: 3000 });
      }
    } catch (err) {
      setError(err.message || String(err));
    } finally {
      setCreating(false);
    }
  };

  const handlePaymentSuccess = async (paymentIntent) => {
    try {
      const token = reservationToken;
      if (token) {
        const final = await getReservation(token);
        if (onCompleted) onCompleted(final, paymentIntent);
      } else if (onCompleted) {
        onCompleted(reservation, paymentIntent);
      }
    } catch (e) {
      if (import.meta.env.DEV) {
        logError("Erreur handlePaymentSuccess:", e);
      }
    }
  };

  const stripeOptions = useMemo(() => ({ clientSecret }), [clientSecret]);

  return (
    <div className="reservation-form card">
      <h3 className="card-title">Récapitulatif & Réservation</h3>
      <div className="card-body reservation-config-display">
        <pre className="reservation-config-pre">
          {JSON.stringify(config, null, 2)}
        </pre>
      </div>

      <div className="reservation-actions">
        <Button onClick={handleCreate} disabled={creating} variant="primary">
          {creating ? "Création…" : "Réserver & Payer"}
        </Button>
        {error && <div className="alert reservation-error">{error}</div>}
      </div>

      {clientSecret && (
        <div className="reservation-payment-section">
          <h4>Paiement</h4>
          <Elements stripe={stripePromise} options={stripeOptions}>
            <PaymentForm
              clientSecret={clientSecret}
              reservationToken={reservationToken}
              onSuccess={handlePaymentSuccess}
            />
          </Elements>
        </div>
      )}
    </div>
  );
}
