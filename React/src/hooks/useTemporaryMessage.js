/**
 * Hook pour gérer les messages temporaires (succès, erreur)
 * Affiche un message pendant une durée définie puis le masque automatiquement
 */
import { useState, useCallback, useRef, useEffect } from "react";

const useTemporaryMessage = (defaultDuration = 3000) => {
  const [message, setMessage] = useState("");
  const [type, setType] = useState("info");
  const timeoutRef = useRef(null);
  const isMounted = useRef(true);

  useEffect(() => {
    return () => {
      isMounted.current = false;
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  const showMessage = useCallback(
    (msg, msgType = "info", duration = defaultDuration) => {
      // Annuler le timeout précédent s'il existe
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }

      setMessage(msg);
      setType(msgType);

      // Masquer le message après la durée spécifiée
      if (duration > 0) {
        timeoutRef.current = setTimeout(() => {
          if (isMounted.current) {
            setMessage("");
          }
        }, duration);
      }
    },
    [defaultDuration]
  );

  const showSuccess = useCallback(
    (msg, duration) => {
      showMessage(msg, "success", duration);
    },
    [showMessage]
  );

  const showError = useCallback(
    (msg, duration) => {
      showMessage(msg, "error", duration);
    },
    [showMessage]
  );

  const showWarning = useCallback(
    (msg, duration) => {
      showMessage(msg, "warning", duration);
    },
    [showMessage]
  );

  const showInfo = useCallback(
    (msg, duration) => {
      showMessage(msg, "info", duration);
    },
    [showMessage]
  );

  const clearMessage = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    setMessage("");
  }, []);

  return {
    message,
    type,
    showMessage,
    showSuccess,
    showError,
    showWarning,
    showInfo,
    clearMessage,
  };
};

export default useTemporaryMessage;
