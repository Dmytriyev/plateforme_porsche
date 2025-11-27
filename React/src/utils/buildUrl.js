// Construire une URL complète en fonction du chemin donné  et de la configuration API
import { API_URL } from "../config/api.js";
// startsWith: est une méthode de String qui renvoie true si la chaîne commence par les caractères spécifiés

// Fonction pour construire une URL complète
export const buildUrl = (path) => {
  // Gestion des cas particuliers
  if (!path) return "";
  // Retourner l'URL telle quelle si c'est déjà une URL complète
  if (path.startsWith("http")) return path;
  // Ajouter la base API_URL si elle est définie
  const base = API_URL || "";
  if (!base) return path.startsWith("/") ? path : `/${path}`;
  // Concaténer proprement la base et le chemin
  return `${base.replace(/\/+$/, "")}/${path.replace(/^\/+/, "")}`;
};

export default buildUrl;
