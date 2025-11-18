# 🚗 Plateforme Porsche - Frontend React

Application web moderne pour la vente de voitures Porsche neuves, d'occasion et d'accessoires.

## 📋 Table des matières

- [Technologies utilisées](#technologies-utilisées)
- [Architecture](#architecture)
- [Installation](#installation)
- [Configuration](#configuration)
- [Démarrage](#démarrage)
- [Structure du projet](#structure-du-projet)
- [Guide de développement](#guide-de-développement)

---

## 🛠️ Technologies utilisées

- **React 19** - Framework JavaScript
- **Vite** - Build tool ultra-rapide
- **React Router DOM** - Gestion de la navigation
- **Tailwind CSS** - Framework CSS utilitaire
- **Flowbite** - Composants UI basés sur Tailwind
- **Axios** - Client HTTP pour les appels API
- **Stripe** - Paiement sécurisé

---

## 🏗️ Architecture

L'application suit une architecture en couches **SOLID** et **Agile** :

```
src/
├── config/          # Configuration (API, constantes)
├── services/        # Communication avec l'API backend
├── context/         # États globaux (Auth, Panier)
├── hooks/           # Hooks personnalisés réutilisables
├── components/      # Composants React
│   ├── common/      # Composants génériques (Button, Input, Card...)
│   ├── layout/      # Structure (Navbar, Footer)
│   ├── voiture/     # Composants spécifiques voitures
│   └── accessoire/  # Composants spécifiques accessoires
├── pages/           # Pages de l'application
├── utils/           # Fonctions utilitaires
└── assets/          # Images, icônes, fonts
```

### Principes SOLID appliqués

1. **Single Responsibility** - Chaque composant a une seule responsabilité
2. **Open/Closed** - Composants extensibles via props
3. **Liskov Substitution** - Composants réutilisables
4. **Interface Segregation** - Props spécifiques à chaque composant
5. **Dependency Inversion** - Services abstraits

---

## 📦 Installation

### Prérequis

- Node.js >= 18.0.0
- npm ou yarn
- Backend API Node.js en cours d'exécution

### Étapes

```bash
# 1. Cloner le projet
git clone [url-du-repo]

# 2. Aller dans le dossier React
cd React

# 3. Installer les dépendances
npm install
```

---

## ⚙️ Configuration

### 1. Créer le fichier `.env`

Copier le fichier `.env.example` et le renommer en `.env` :

```bash
cp .env.example .env
```

### 2. Configurer les variables d'environnement

```env
# URL de l'API backend
NODE_API_URL=http://localhost:3000

# Clé publique Stripe
VITE_STRIPE_PUBLIC_KEY=pk_test_votre_cle_publique
```

---

## 🚀 Démarrage

### Mode développement

```bash
npm run dev
```

L'application sera accessible sur `http://localhost:5173`

### Build pour production

```bash
npm run build
```

Les fichiers compilés seront dans le dossier `dist/`

### Prévisualiser le build

```bash
npm run preview
```

---

## 📁 Structure détaillée du projet

### 1. **Services** (`src/services/`)

Les services gèrent la communication avec l'API backend :

```javascript
// Exemple d'utilisation
import { authService, voitureService } from '../services';

const voitures = await voitureService.getAllModels();
const user = await authService.login(email, password);
```

**Services disponibles :**
- `auth.service.jsx` - Authentification (login, register, profile)
- `voiture.service.jsx` - Gestion des voitures neuves et d'occasion
- `personnalisation.service.jsx` - Options (couleurs, jantes, sièges, packages)
- `accesoire.service.jsx` - Accessoires Porsche
- `commande.service.jsx` - Commandes, réservations et paiement

### 2. **Contextes** (`src/context/`)

Les contextes gèrent l'état global de l'application :

```javascript
// AuthContext - Authentification
import { useAuth } from '../hooks/useAuth';

const { user, login, logout, isAuthenticated } = useAuth();
```

```javascript
// PanierContext - Panier d'achats
import { usePanier } from '../hooks/usePanier';

const { articles, ajouterVoiture, total } = usePanier();
```

### 3. **Composants communs** (`src/components/common/`)

Composants réutilisables avec Tailwind CSS :

- **Button** - Bouton avec variants (primary, secondary, danger, outline)
- **Input** - Champ de saisie avec validation
- **Card** - Carte avec effet hover
- **Loading** - Indicateur de chargement
- **Alert** - Message d'alerte (success, error, warning, info)
- **Modal** - Fenêtre modale

```javascript
import { Button, Input, Card } from '../components/common';

<Button variant="primary" size="lg" onClick={handleClick}>
  Cliquez ici
</Button>
```

### 4. **Pages** (`src/pages/`)

Pages principales de l'application :

- **Home** - Page d'accueil
- **Login** - Connexion
- **Register** - Inscription
- **Voitures** - Catalogue des voitures
- **Accessoires** - Boutique d'accessoires
- **Panier** - Panier d'achats
- **MonCompte** - Profil utilisateur (protégée)

### 5. **Utilitaires** (`src/utils/`)

Fonctions utilitaires :

```javascript
// Formatage
import { formatPrice, formatDate } from '../utils/format';

formatPrice(95000); // "95 000 €"
formatDate(new Date()); // "18 novembre 2025"

// Validation
import { validateEmail, validatePassword } from '../utils/validation';

validateEmail('test@example.com'); // true
validatePassword('Password123'); // true
```

---

## 👨‍💻 Guide de développement

### Créer un nouveau composant

```bash
# Structure recommandée
src/components/common/MonComposant/
├── MonComposant.jsx    # Composant
├── MonComposant.css    # Styles (si nécessaire avec Tailwind)
└── index.jsx           # Export (optionnel)
```

```javascript
// MonComposant.jsx
const MonComposant = ({ prop1, prop2 }) => {
  return (
    <div className="bg-white p-4 rounded-lg shadow">
      {/* Votre code */}
    </div>
  );
};

export default MonComposant;
```

### Créer une nouvelle page

```javascript
// src/pages/MaNouvellePage.jsx
import { useState, useEffect } from 'react';
import { Loading } from '../components/common';

const MaNouvellePage = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Charger les données
    const fetchData = async () => {
      try {
        // Appel API
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) return <Loading fullScreen />;

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      {/* Votre contenu */}
    </div>
  );
};

export default MaNouvellePage;
```

### Ajouter une route

```javascript
// src/App.jsx
import MaNouvellePage from './pages/MaNouvellePage.jsx';

// Dans les Routes
<Route path="/ma-route" element={<MaNouvellePage />} />

// Route protégée
<Route
  path="/ma-route-protegee"
  element={
    <ProtectedRoute>
      <MaNouvellePage />
    </ProtectedRoute>
  }
/>
```

### Utiliser les services API

```javascript
import { voitureService } from '../services';

const MaPage = () => {
  const [voitures, setVoitures] = useState([]);

  useEffect(() => {
    const loadVoitures = async () => {
      try {
        const data = await voitureService.getAllModels();
        setVoitures(data);
      } catch (error) {
        console.error('Erreur:', error);
      }
    };
    loadVoitures();
  }, []);

  // ...
};
```

---

## 🎨 Tailwind CSS

### Classes utiles

```javascript
// Conteneur principal
<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

// Grille responsive
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">

// Bouton
<button className="px-6 py-3 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors">

// Card
<div className="bg-white rounded-lg shadow-lg p-6 hover:shadow-xl transition-all">

// Texte
<h1 className="text-4xl font-bold mb-6">
<p className="text-gray-600">
```

---

## 🔒 Authentification

### Routes protégées

Les routes protégées nécessitent une authentification :

```javascript
<ProtectedRoute>
  <MonCompte />
</ProtectedRoute>

// Ou avec rôle spécifique
<ProtectedRoute requireRole="admin">
  <AdminPanel />
</ProtectedRoute>
```

### Utiliser le contexte Auth

```javascript
import { useAuth } from '../hooks/useAuth';

const MonComposant = () => {
  const { user, isAuthenticated, isAdmin, logout } = useAuth();

  if (!isAuthenticated()) {
    return <p>Veuillez vous connecter</p>;
  }

  return (
    <div>
      <p>Bonjour {user.prenom}</p>
      <button onClick={logout}>Déconnexion</button>
    </div>
  );
};
```

---

## 📝 Bonnes pratiques

1. **Toujours utiliser les composants communs** plutôt que de recréer les mêmes éléments
2. **Utiliser les services** pour tous les appels API
3. **Gérer les erreurs** avec try/catch dans les fonctions async
4. **Valider les formulaires** avec les fonctions de `utils/validation`
5. **Utiliser les contextes** (Auth, Panier) pour l'état global
6. **Ajouter des commentaires** pour expliquer la logique complexe
7. **Tester régulièrement** pendant le développement

---

## 🤝 Contribution

### Workflow Git

```bash
# 1. Créer une branche
git checkout -b feature/ma-fonctionnalite

# 2. Faire vos modifications
git add .
git commit -m "Description de la fonctionnalité"

# 3. Push
git push origin feature/ma-fonctionnalite

# 4. Créer une Pull Request
```

---

## 📞 Support

Pour toute question ou problème :

- Email : contact@porsche.fr
- Documentation API : Voir `/Node/README.md`

---

## 📄 Licence

© 2025 Porsche. Tous droits réservés.

---

**Bon développement ! 🚗💨**

