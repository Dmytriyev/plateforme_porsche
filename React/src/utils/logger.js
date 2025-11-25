// Logger utilitaire pour gérer les logs en fonction de l'environnement
const isProduction = import.meta.env && import.meta.env.MODE === "production";
// Logger minimal qui désactive les logs en production
export const debug = () => {};
// Logger minimal : warnings désactivés pour réduire le bruit
export const warn = () => {};
// Erreurs toujours envoyées vers console.error
export const error = (...args) => {
  if (console && console.error) console.error(...args);
};

export default { debug, warn, error };
