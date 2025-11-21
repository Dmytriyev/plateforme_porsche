/**
 * Logger simple pour l'application
 * Encapsule console.log/warn/error pour une gestion centralisée des logs
 */

const logger = {
  info: (...args) => console.log("[INFO]", ...args),
  warn: (...args) => console.warn("[WARN]", ...args),
  error: (...args) => console.error("[ERROR]", ...args),
};

export default logger;
