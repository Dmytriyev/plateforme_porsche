# Guide de Mise à Jour

## 🔄 Historique des versions

### Version actuelle - Migration CSS dédié

**Date** : Novembre 2024

#### Changements majeurs

1. **Architecture CSS**
   - Migration de Tailwind vers CSS dédié
   - 17 nouveaux fichiers CSS
   - Navbar et Card conservent Tailwind

2. **Structure du projet**
   - Réorganisation des composants
   - Séparation des préoccupations
   - Documentation complète

3. **Services et API**
   - Correction des imports
   - Structure cohérente
   - Gestion d'erreurs améliorée

## 📦 Mise à jour des dépendances

```bash
# Installer les dépendances
npm install

# Mettre à jour les dépendances
npm update

# Vérifier les vulnérabilités
npm audit
```

## 🔧 Configuration

### Variables d'environnement

Créer un fichier `.env.local` :

```env
VITE_API_URL=http://localhost:5000/api
```

### Tailwind CSS

Le projet utilise Tailwind v3 avec Flowbite :
- `tailwind.config.js` - Configuration
- `src/index.css` - Imports Tailwind

## 🚀 Démarrage après mise à jour

```bash
# Nettoyer le cache
rm -rf node_modules dist
npm install

# Démarrer
npm run dev
```

## 📚 Documentation

Consultez les fichiers suivants pour plus d'informations :
- `README.md` - Vue d'ensemble
- `ARCHITECTURE.md` - Architecture détaillée
- `COMMENCEZ_ICI.md` - Guide de démarrage
- `CORRECTIONS.md` - Liste des corrections

## ⚠️ Notes importantes

- Node.js >= 16.x requis
- npm >= 8.x recommandé
- Les styles Tailwind sont maintenant dans `Navbar` et `Card` uniquement

