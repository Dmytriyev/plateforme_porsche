# 🚀 Guide de démarrage - Plateforme Porsche

## ⚡ Installation (2 minutes)

```bash
# 1. Installer les dépendances
npm install

# 2. Créer le fichier .env.local
echo "VITE_API_URL=http://localhost:3000" > .env.local

# 3. Démarrer l'application
npm run dev
```

**C'est tout !** L'application s'ouvre sur http://localhost:5173

## 📋 Prérequis

- Node.js >= 18
- Backend API Node.js démarré sur le port 3000

## ✅ Vérification

1. Page d'accueil s'affiche ✓
2. Navigation fonctionne ✓
3. Pas d'erreurs dans la console ✓

## 🎯 Structure simplifiée

```
src/
├── config/      → Configuration API
├── services/    → Appels API
├── context/     → État global
├── hooks/       → Hooks personnalisés
├── components/  → Composants UI
├── pages/       → Pages
└── utils/       → Fonctions utilitaires
```

## 💡 Exemples rapides

### Authentification
```javascript
import { useAuth } from '@/hooks';

const { user, login, logout } = useAuth();
```

### Panier
```javascript
import { usePanier } from '@/hooks';

const { articles, ajouterAccessoire, total } = usePanier();
```

### Appel API
```javascript
import { voitureService } from '@/services';

const voitures = await voitureService.getAllModels();
```

### Composants communs
```javascript
import { Button, Input, Card } from '@/components/common';
```

## 🎨 Tailwind CSS

Couleurs Porsche disponibles :
- `bg-porsche-black` - Noir
- `text-porsche-red` - Rouge
- `text-porsche-gold` - Or

## 📚 Documentation

- **README.md** - Documentation complète
- **ARCHITECTURE.md** - Architecture détaillée
- **DEMARRAGE_RAPIDE.md** - Guide rapide

## 🐛 Problèmes courants

### Erreur : Cannot connect to API
→ Démarrer le backend : `cd ../Node && npm start`

### Erreur : Module not found
→ Réinstaller : `rm -rf node_modules && npm install`

## 🎉 Prêt !

Vous pouvez maintenant développer ! 🚗💨

Pour plus d'informations, consultez **README.md**
