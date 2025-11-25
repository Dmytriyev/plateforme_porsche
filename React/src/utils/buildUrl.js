/**
 * utils/buildUrl.js — Construction d'URLs pour les ressources (images, API)
 *
 * Notes pédagogiques :
 * - Construit une URL absolue si `API_URL` est défini, sinon retourne un chemin relatif.
 * - Utile pour gérer les environnements (dev vs prod) sans disperser la logique partout.
 */

import { API_URL } from "../config/api.js";

export const buildUrl = (path) => {
  if (!path) return "";
  if (path.startsWith("http")) return path;

  const base = API_URL || "";
  if (!base) return path.startsWith("/") ? path : `/${path}`;

  return `${base.replace(/\/+$/, "")}/${path.replace(/^\/+/, "")}`;
};

export default buildUrl;
