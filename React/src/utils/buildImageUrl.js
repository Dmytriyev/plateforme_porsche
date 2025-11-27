import { API_URL } from "../config/api.js";

export default function buildImageUrl(image) {
  if (!image) return null;
  const path = typeof image === "string" ? image : image.name || null;
  if (!path) return null;
  if (path.startsWith("http") || path.startsWith("data:")) return path;
  return `${API_URL}${path.startsWith("/") ? "" : "/"}${encodeURI(path)}`;
}
