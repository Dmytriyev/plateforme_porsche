const htmlEntities = {
  "&": "&amp;",
  "<": "&lt;",
  ">": "&gt;",
  '"': "&quot;",
  "'": "&#39;",
  "`": "&#96;",
};

const escapeHtml = (str) =>
  String(str).replace(/[&<>"'`]/g, (char) => htmlEntities[char]);

const sanitizeValue = (value) => {
  if (typeof value === "string") return escapeHtml(value.trim());
  if (Array.isArray(value)) return value.map(sanitizeValue);
  if (value && typeof value === "object") return sanitizeObject(value);
  return value;
};

const sanitizeObject = (obj) => {
  const out = Array.isArray(obj) ? [] : {};
  for (const key in obj) {
    try {
      out[key] = sanitizeValue(obj[key]);
    } catch {
      out[key] = obj[key];
    }
  }
  return out;
};

export default function sanitizeInputs(req, res, next) {
  try {
    if (req.body && typeof req.body === "object")
      req.body = sanitizeObject(req.body);
    if (req.query && typeof req.query === "object")
      req.query = sanitizeObject(req.query);
    if (req.params && typeof req.params === "object")
      req.params = sanitizeObject(req.params);
  } catch {}
  next();
}
