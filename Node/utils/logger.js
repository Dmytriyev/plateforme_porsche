import fs from "fs";
import path from "path";
// Répertoire des logs
const logsDir = process.env.LOGS_DIR || path.join(process.cwd(), "logs");
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir, { recursive: true });
}
// Écrit une ligne dans le fichier de log
const writeLine = (file, obj) => {
  try {
    fs.appendFileSync(path.join(logsDir, file), JSON.stringify(obj) + "\n");
  } catch (e) {
    console.error("Logger write échoué", e);
  }
};
// Crée une entrée de log structurée
const makeEntry = (level, message, meta) => {
  return {
    timestamp: new Date().toISOString(),
    level,
    message: typeof message === "string" ? message : JSON.stringify(message),
    meta: meta || null,
    pid: process.pid,
  };
};
// Fonctions de log
export const info = (message, meta) => {
  const entry = makeEntry("info", message, meta);
  console.log(JSON.stringify(entry));
  writeLine("app.log", entry);
};
// Fonction de log pour les avertissements
export const warn = (message, meta) => {
  const entry = makeEntry("warn", message, meta);
  console.warn(JSON.stringify(entry));
  writeLine("app.log", entry);
};
// Fonction de log pour les erreurs
export const error = (message, meta) => {
  const entry = makeEntry("error", message, meta);
  console.error(JSON.stringify(entry));
  writeLine("error.log", entry);
};

export default { info, warn, error };
