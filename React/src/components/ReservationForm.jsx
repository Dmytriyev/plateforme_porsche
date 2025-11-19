import React, { useState, useMemo } from 'react';
import useReservation from '../hooks/useReservation';
import PaymentForm from './PaymentForm';
import { loadStripe } from '@stripe/stripe-js';
import { Elements } from '@stripe/react-stripe-js';
import Button from './common/Button.jsx';
import ContactButton from './ContactButton.jsx';

// ReservationForm: exemple minimal d'usage
// - calcule/serialise une "config" minimale et appelle createReservation
// - affiche la zone de paiement lorsque backend retourne clientSecret

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY || '');

export default function ReservationForm({ initialConfig = {}, onCompleted, vehiculeId }) {
    const { createReservation, reservation, getReservation, pollReservationStatus } = useReservation();
    const [config, setConfig] = useState(initialConfig);
    const [creating, setCreating] = useState(false);
    const [error, setError] = useState(null);

    const clientSecret = reservation?.clientSecret;
    const reservationToken = reservation?.reservationToken || reservation?.token;

    const handleCreate = async () => {
        setError(null);
        setCreating(true);
        try {
            // envoyer uniquement la config côté serveur; le backend doit calculer le montant
            const data = await createReservation({ config });
            // lancer polling pour détecter la finalisation (optionnel)
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
        // Optionnel: récupérer la reservation finale et informer parent
        try {
            const token = reservationToken;
            if (token) {
                const final = await getReservation(token);
                if (onCompleted) onCompleted(final, paymentIntent);
            } else if (onCompleted) {
                onCompleted(reservation, paymentIntent);
            }
        } catch (e) {
            // ignore
        }
    };

    const stripeOptions = useMemo(() => ({ clientSecret }), [clientSecret]);

    return (
        <div className="reservation-form card">
            <h3 className="card-title">Récapitulatif & Réservation</h3>
            <div className="card-body" style={{ background: '#fafafa', padding: 10 }}>
                <pre style={{ whiteSpace: 'pre-wrap' }}>{JSON.stringify(config, null, 2)}</pre>
            </div>

            <div style={{ marginTop: 12, display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                <Button onClick={handleCreate} disabled={creating} variant="primary">
                    {creating ? 'Création…' : 'Réserver & Payer'}
                </Button>
                <ContactButton
                    vehiculeId={vehiculeId}
                    typeVehicule="occasion"
                    variant="secondary"
                />
                {error && <div className="alert" style={{ color: 'red', marginTop: 8 }}>{error}</div>}
            </div>

            {clientSecret && (
                <div style={{ marginTop: 20 }}>
                    <h4>Paiement</h4>
                    <Elements stripe={stripePromise} options={stripeOptions}>
                        <PaymentForm clientSecret={clientSecret} reservationToken={reservationToken} onSuccess={handlePaymentSuccess} />
                    </Elements>
                </div>
            )}
        </div>
    );
}
