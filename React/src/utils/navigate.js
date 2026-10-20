// - fichier servant à la navigation programmatique dans l'application React
// — Permet d'utiliser la navigation en dehors des composants React
// — Utilise une fonction de rappel pour effectuer la navigation
// — Fournit une solution de repli utilisant window.location si nécessaire
let _navigate = null;
// Définit la fonction de navigation à utiliser
export function setNavigate(fn) {
  _navigate = fn;
}
// Effectue la navigation vers le chemin spécifié
export function navigate(path, options) {
  // Utilise la fonction de navigation si définie
  if (typeof _navigate === "function") {
    try {
      // Effectue la navigation en utilisant la fonction définie
      _navigate(path, options);
      return true;
    } catch (e) {}
  }
  try {
    window.location.replace(path);
  } catch (e) {}
  return false;
}
