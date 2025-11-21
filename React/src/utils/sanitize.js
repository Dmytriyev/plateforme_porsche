import DOMPurify from "dompurify";

const defaultHTMLOptions = {
  ALLOWED_TAGS: ["b", "i", "em", "strong", "p", "br", "ul", "ol", "li", "a"],
  ALLOWED_ATTR: ["href", "target", "rel"],
};

export const sanitizeHTML = (dirty, options = {}) =>
  dirty ? DOMPurify.sanitize(dirty, { ...defaultHTMLOptions, ...options }) : "";

export const sanitizeText = (text) =>
  text == null ? "" : DOMPurify.sanitize(String(text), { ALLOWED_TAGS: [] });

export const sanitizeURL = (url) =>
  !url || /^(javascript|data|vbscript):/i.test(url)
    ? ""
    : DOMPurify.sanitize(url, { ALLOWED_TAGS: [] });

export const sanitizeObject = (obj) => {
  if (obj == null || typeof obj !== "object") return obj;

  if (Array.isArray(obj)) {
    return obj.map((item) =>
      typeof item === "string"
        ? sanitizeText(item)
        : typeof item === "object"
        ? sanitizeObject(item)
        : item
    );
  }

  return Object.keys(obj).reduce((cleaned, key) => {
    const value = obj[key];
    cleaned[key] =
      typeof value === "string"
        ? sanitizeText(value)
        : typeof value === "object"
        ? sanitizeObject(value)
        : value;
    return cleaned;
  }, {});
};
