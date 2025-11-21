import { API_URL } from "../config/api.js";

export const buildUrl = (path) => {
  if (!path) return "";
  if (path.startsWith("http")) return path;

  const base = API_URL || "";
  if (!base) return path.startsWith("/") ? path : `/${path}`;

  return `${base.replace(/\/+$/, "")}/${path.replace(/^\/+/, "")}`;
};

export default buildUrl;
