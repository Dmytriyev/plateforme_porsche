/**
 * PaymentForm.jsx — Intégration Stripe (Elements) — crée/confirm PaymentIntent via backend; gérer état `processing` et erreurs.
 *
 * @file components/PaymentForm.jsx
 */

import React, { useState } from "react";
import { useStripe, useElements, CardElement } from "@stripe/react-stripe-js";
import Button from "./common/Button.jsx";
import "../css/components/PaymentForm.css";

// Composant : PaymentForm — intègre Stripe Elements et confirme un paiement via `clientSecret`.
export default function PaymentForm({ clientSecret, onSuccess, onError }) {
  const stripe = useStripe();
  const elements = useElements();
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage(null);
    if (!stripe || !elements) {
      setMessage("Stripe is not ready");
      return;
    }
    setBusy(true);
    try {
      const card = elements.getElement(CardElement);
      const result = await stripe.confirmCardPayment(clientSecret, {
        payment_method: { card },
      });

      if (result.error) {
        setMessage(result.error.message || "Payment error");
        if (onError) onError(result.error);
      } else if (
        result.paymentIntent &&
        result.paymentIntent.status === "succeeded"
      ) {
        setMessage("Paiement réussi");
        if (onSuccess) onSuccess(result.paymentIntent);
      } else {
        setMessage("Traitement du paiement");
      }
    } catch (err) {
      setMessage(err.message || String(err));
      if (onError) onError(err);
    } finally {
      setBusy(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="payment-form">
      <div className="payment-form-group">
        <label className="label">Carte</label>
        <div className="payment-card-element">
          <CardElement />
        </div>
      </div>
      <Button type="submit" variant="primary" disabled={!stripe || busy}>
        {busy ? "Traitement…" : "Payer"}
      </Button>
      {message && <div className="payment-message">{message}</div>}
    </form>
  );
}

// PaymentForm : intègre Stripe Elements, confirme le paiement via `clientSecret`.
