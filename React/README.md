# 🚗 Plateforme Porsche - Frontend React

Application web moderne pour la vente de voitures Porsche neuves, d'occasion et d'accessoires.

## 🚀 Démarrage rapide

```bash
# Installation
npm install

# Démarrage
npm run dev
```

L'application s'ouvre automatiquement sur **http://localhost:5173**

## ⚙️ Configuration

Créer un fichier `.env.local` à la racine :

```env
VITE_API_URL=http://localhost:3000
VITE_STRIPE_PUBLIC_KEY=pk_test_votre_cle
```

**Important** : Les variables Vite doivent commencer par `VITE_`

## 🏗️ Architecture

```
src/
├── config/          # Configuration API
├── services/        # Communication avec l'API
├── context/         # État global (Auth, Panier)
├── hooks/           # Hooks personnalisés
├── components/      # Composants réutilisables
│   ├── common/      # Boutons, Inputs, Cards...
│   ├── layout/      # Navbar, Footer
│   └── ...
├── pages/           # Pages de l'application
└── utils/           # Fonctions utilitaires
```

## 📦 Technologies

- **React 19** - Framework
- **Vite** - Build tool
- **React Router** - Navigation
- **Tailwind CSS** - Styling
- **Axios** - HTTP client

## 🎯 Fonctionnalités

### ✅ Authentification
- Connexion / Inscription
- Gestion du profil
- Routes protégées
- Gestion des rôles (client, conseiller, admin)

### 🚗 Catalogue
- Liste des voitures neuves et d'occasion
- Catalogue d'accessoires
- Filtres et recherche

### 🛒 Panier
- Ajout de voitures configurées
- Ajout d'accessoires
- Persistance localStorage

### 💳 Commandes
- Créer des commandes
- Réservations
- Paiement Stripe

## 💡 Exemples d'utilisation

### Imports simplifiés avec @
```javascript
import { Button, Input } from '@/components/common';
import { useAuth } from '@/hooks';
import { formatPrice } from '@/utils';
```

### Utiliser l'authentification
```javascript
const { user, login, logout, isAuthenticated } = useAuth();

if (isAuthenticated()) {
  // Utilisateur connecté
}
```

### Utiliser le panier
```javascript
const { articles, ajouterVoiture, total } = usePanier();
```

### Gérer les erreurs API
```javascript
import { handleApiError, logError } from '@/utils';

try {
  const data = await voitureService.getAllModels();
} catch (error) {
  logError('Voitures', error);
  setError(handleApiError(error));
}
```

## 🎨 Tailwind - Couleurs Porsche

```javascript
<div className="bg-porsche-black">
  <h1 className="text-porsche-red">Porsche</h1>
  <span className="text-porsche-gold">Premium</span>
</div>
```

## 🔧 Scripts disponibles

```bash
npm run dev      # Démarrage développement
npm run build    # Build production
npm run preview  # Prévisualiser build
npm run lint     # Linter ESLint
```

## 📁 Structure des composants

Chaque composant suit cette structure :

```javascript
/**
 * ComponentName - Description
 * 
 * Props:
 * - prop1: Description
 * - prop2: Description
 */
const ComponentName = ({ prop1, prop2 }) => {
  return (
    <div className="...">
      {/* JSX */}
    </div>
  );
};

export default ComponentName;
```

## 🛡️ Routes protégées

```javascript
<Route
  path="/mon-compte"
  element={
    <ProtectedRoute>
      <MonCompte />
    </ProtectedRoute>
  }
/>

// Avec rôle spécifique
<ProtectedRoute requireRole="admin">
  <AdminPanel />
</ProtectedRoute>
```

## 🐛 Dépannage

### API ne se connecte pas
- Vérifier que le backend tourne sur le port 3000
- Vérifier le fichier `.env.local`
- Redémarrer : `npm run dev`

### Styles ne s'appliquent pas
```bash
rm -rf node_modules package-lock.json
npm install
npm run dev
```

### Imports @ ne fonctionnent pas
- Vérifier `vite.config.js` (alias doit être configuré)
- Redémarrer le serveur

## 📚 Documentation

- **COMMENCEZ_ICI.md** - Guide de démarrage complet
- **ARCHITECTURE.md** - Architecture détaillée
- **CORRECTIONS.md** - Détails des corrections appliquées
- **DEMARRAGE_RAPIDE.md** - Installation rapide

## 🤝 Contribution

1. Créer une branche : `git checkout -b feature/ma-feature`
2. Commit : `git commit -m "Description"`
3. Push : `git push origin feature/ma-feature`
4. Créer une Pull Request

## 📄 Licence

© 2025 Porsche. Tous droits réservés.

---

**Version : 1.0.0**  
**Date : 18 novembre 2025**
