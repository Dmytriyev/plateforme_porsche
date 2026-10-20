// Notification de l'utilisateur via des toasts utilisant react-toastify
import { toast } from "react-toastify";

// Affiche une notification toast à l'utilisateur
export function show(message, { type = "error" } = {}) {
  try {
    // Vérifie que le message n'est pas vide
    if (!message) return;
    // Options communes pour les toasts
    const opts = {
      // Identifiant unique pour éviter les doublons
      toastId: message,
      className: `app-toast ${type ? `app-toast--${type}` : ""}`,
    };
    // Affiche le toast selon le type
    if (type === "success") return toast.success(message, opts);
    if (type === "info") return toast.info(message, opts);
    if (type === "warning") return toast.warn(message, opts);
    return toast.error(message, opts);
  } catch (e) {
    try {
      alert(message);
    } catch (err) {}
  }
}

export default { show };
