/**
 * hooks/useReservation.jsx — Logique métier pour créer et valider une réservation côté client.
 *
 * @file hooks/useReservation.jsx
 */

import { sanitizeObject } from "../utils/helpers";
import { useState, useCallback, useEffect, useRef } from "react";

// Hook métier : créer/consulter/annuler une réservation côté client
export default function useReservation() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [reservation, setReservation] = useState(null);
  const pollRef = useRef(null);

  const createReservation = useCallback(async (payload) => {
    setLoading(true);
    setError(null);
    try {
      const safePayload = sanitizeObject(payload);
      const res = await fetch("/api/reservations", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        credentials: "include",
        body: JSON.stringify(safePayload),
      });
      if (!res.ok) throw new Error(`Reservation API error ${res.status}`);
      const data = await res.json();
      setReservation(data);
      return data;
    } catch (err) {
      setError(err.message || String(err));
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const getReservation = useCallback(async (token) => {
    setLoading(true);
    setError(null);
    try {
      if (!token) throw new Error("Missing reservation token");
      const res = await fetch(`/api/reservations/${encodeURIComponent(token)}`);
      if (!res.ok) throw new Error(`Get reservation failed ${res.status}`);
      const data = await res.json();
      setReservation(data);
      return data;
    } catch (err) {
      setError(err.message || String(err));
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const cancelReservation = useCallback(async (token) => {
    setLoading(true);
    setError(null);
    try {
      if (!token) throw new Error("Missing reservation token");
      const res = await fetch(
        `/api/reservations/${encodeURIComponent(token)}/cancel`,
        {
          method: "POST",
          headers: { Accept: "application/json" },
          credentials: "include",
        },
      );
      if (!res.ok) throw new Error(`Cancel failed ${res.status}`);
      const data = await res.json();
      setReservation(data);
      return data;
    } catch (err) {
      setError(err.message || String(err));
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const pollReservationStatus = useCallback(
    (token, { interval = 3000, stopWhen } = {}) => {
      if (!token) return;
      if (pollRef.current) clearInterval(pollRef.current);
      pollRef.current = setInterval(async () => {
        try {
          const data = await getReservation(token);
          const status = data?.status;
          const shouldStop = stopWhen
            ? stopWhen(status)
            : ["completed", "failed", "expired", "cancelled"].includes(status);
          if (shouldStop) {
            clearInterval(pollRef.current);
            pollRef.current = null;
          }
        } catch (err) {
          // Ignorer les erreurs de polling (réseau intermittent), on retentera au prochain interval
          // console.debug('pollReservationStatus error', err);
        }
      }, interval);
      return () => {
        if (pollRef.current) clearInterval(pollRef.current);
        pollRef.current = null;
      };
    },
    [getReservation],
  );

  useEffect(() => {
    return () => {
      if (pollRef.current) clearInterval(pollRef.current);
    };
  }, []);

  return {
    loading,
    error,
    reservation,
    createReservation,
    getReservation,
    cancelReservation,
    pollReservationStatus,
  };
}
