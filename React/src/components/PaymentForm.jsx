import React, { useState } from 'react';
import { useStripe, useElements, CardElement } from '@stripe/react-stripe-js';
import Button from './common/Button.jsx';

// PaymentForm confirme le paiement avec le clientSecret fourni par le backend.
// Utilise le composant `Button` commun pour le style.
export default function PaymentForm({ clientSecret, onSuccess, onError }) {
    const stripe = useStripe();
    const elements = useElements();
    const [busy, setBusy] = useState(false);
    const [message, setMessage] = useState(null);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setMessage(null);
        if (!stripe || !elements) {
            setMessage('Stripe is not ready');
            return;
        }
        setBusy(true);
        try {
            const card = elements.getElement(CardElement);
            const result = await stripe.confirmCardPayment(clientSecret, {
                payment_method: { card },
            });

            if (result.error) {
                setMessage(result.error.message || 'Payment error');
                if (onError) onError(result.error);
            } else if (result.paymentIntent && result.paymentIntent.status === 'succeeded') {
                setMessage('Paiement réussi');
                if (onSuccess) onSuccess(result.paymentIntent);
            } else {
                setMessage('Traitement du paiement');
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
            <div className="form-group" style={{ marginBottom: 12 }}>
                <label className="label">Carte</label>
                <div className="card-element" style={{ padding: 8, border: '1px solid #ddd', borderRadius: 6 }}>
                    <CardElement />
                </div>
            </div>
            <Button type="submit" variant="primary" disabled={!stripe || busy}>
                {busy ? 'Traitement…' : 'Payer'}
            </Button>
            {message && <div style={{ marginTop: 12 }}>{message}</div>}
        </form>
    );
}
