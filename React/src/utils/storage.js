//  — Utilitaire de stockage sécurisé
// - Gère le stockage uniquement côté navigateur
// - Évite les erreurs lors du SSR ou en production

// Vérifie si le code s'exécute dans un environnement navigateur
const isBrowser = typeof window !== "undefined";
// Service de stockage utilisant sessionStorage
const storage = {
  // Récupère une valeur depuis sessionStorage
  get(key) {
    if (!isBrowser) return null;
    try {
      // Lire la valeur depuis sessionStorage
      const item = sessionStorage.getItem(key);
      //   console.log(`Lecture de ${key}:`, item);
      return item ? JSON.parse(item) : null;
    } catch (error) {
      console.warn(`Erreur lors de la lecture de ${key}:`, error);
      return null;
    }
  },
  // Stocke une valeur dans sessionStorage
  set(key, value) {
    if (!isBrowser) return;
    try {
      // Écrire la valeur dans sessionStorage
      sessionStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
      console.warn(`Erreur lors de l'écriture de ${key}:`, error);
    }
  },

  // Supprime une valeur de sessionStorage
  remove(key) {
    if (!isBrowser) return;
    try {
      sessionStorage.removeItem(key);
    } catch (error) {
      console.warn(`Erreur lors de la suppression de ${key}:`, error);
    }
  },

  // Vide tout le sessionStorage
  clear() {
    if (!isBrowser) return;
    try {
      sessionStorage.clear();
    } catch (error) {
      console.warn("Erreur lors du nettoyage du storage:", error);
    }
  },
};

export default storage;
