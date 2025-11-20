import { API_URL } from "../config/api.jsx";

// Construit proprement une URL pour les ressources exposées par le backend.
// - Si `path` est déjà une URL absolue (http(s)://) elle est retournée telle quelle.
// - Si `API_URL` est vide (mode proxy / chemins relatifs), renvoie un chemin relatif
//   correctement préfixé par `/` si nécessaire.
// - Gère les slashs en double/trailing.
export function buildUrl(path) {
  if (!path) return "";
  if (typeof path !== "string") return "";
  const trimmed = path.trim();

  if (trimmed.startsWith("http://") || trimmed.startsWith("https://")) {
    return trimmed;
  }

  const base = (API_URL || "").trim();

  // si pas de base définie, retourner un chemin relatif correctement formé
  if (!base) {
    return trimmed.startsWith("/") ? trimmed : `/${trimmed}`;
  }

  // joindre sans doubles slash
  const baseNoSlash = base.replace(/\/+$/, "");
  const pathNoSlash = trimmed.replace(/^\/+/, "");
  return `${baseNoSlash}/${pathNoSlash}`;
}

export default buildUrl;
