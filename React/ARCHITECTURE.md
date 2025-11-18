# 📐 Architecture Frontend - Plateforme Porsche

## 🎯 Vue d'ensemble

Cette application React/Vite suit une architecture **simple, claire et professionnelle** basée sur les principes **SOLID** et **Agile**.

---

## 🏗️ Structure des dossiers

```
React/src/
├── config/                  ⚙️ CONFIGURATION
│   └── api.jsx              → Configuration Axios avec intercepteurs
│
├── services/                🔌 SERVICES API
│   ├── auth.service.jsx     → Authentification (login, register, profile)
│   ├── voiture.service.jsx  → Voitures neuves et d'occasion
│   ├── personnalisation.service.jsx → Options (couleurs, jantes, sièges)
│   ├── accesoire.service.jsx → Accessoires Porsche
│   ├── commande.service.jsx → Commandes, réservations, paiement
│   └── index.jsx            → Export centralisé
│
├── context/                 🌐 ÉTAT GLOBAL
│   ├── AuthContext.jsx      → Gestion de l'utilisateur connecté
│   ├── PanierContext.jsx    → Gestion du panier d'achats
│   └── index.jsx            → Export centralisé
│
├── hooks/                   🪝 HOOKS PERSONNALISÉS
│   ├── useAuth.jsx          → Hook pour utiliser AuthContext
│   ├── usePanier.jsx        → Hook pour utiliser PanierContext
│   └── index.jsx            → Export centralisé
│
├── components/              🧩 COMPOSANTS
│   ├── common/              → Composants réutilisables
│   │   ├── Button.jsx       → Bouton avec variants
│   │   ├── Input.jsx        → Champ de saisie avec validation
│   │   ├── Card.jsx         → Carte avec effet hover
│   │   ├── Loading.jsx      → Indicateur de chargement
│   │   ├── Alert.jsx        → Message d'alerte
│   │   ├── Modal.jsx        → Fenêtre modale
│   │   └── index.jsx        → Export centralisé
│   │
│   ├── layout/              → Structure de page
│   │   ├── Navbar.jsx       → Barre de navigation
│   │   ├── Footer.jsx       → Pied de page
│   │   └── index.jsx        → Export centralisé
│   │
│   ├── voiture/             → Composants voitures (à développer)
│   ├── accessoire/          → Composants accessoires (à développer)
│   └── ProtectedRoute.jsx   → Route protégée avec authentification
│
├── pages/                   📄 PAGES
│   ├── Home.jsx             → Page d'accueil
│   ├── Login.jsx            → Connexion
│   ├── Register.jsx         → Inscription
│   ├── Voitures.jsx         → Catalogue des voitures
│   ├── Accessoires.jsx      → Boutique d'accessoires
│   ├── Panier.jsx           → Panier d'achats
│   └── MonCompte.jsx        → Profil utilisateur (protégée)
│
├── utils/                   🛠️ UTILITAIRES
│   ├── format.js            → Formatage (prix, dates, kilométrage)
│   ├── validation.js        → Validation de formulaires
│   └── index.js             → Export centralisé
│
├── assets/                  📦 ASSETS STATIQUES
│   ├── images/
│   ├── icons/
│   └── fonts/
│
├── App.jsx                  🎯 COMPOSANT RACINE
├── App.css                  → Styles globaux
└── main.jsx                 → Point d'entrée
```

---

## 🔄 Flux de données

### 1. Authentification

```
Login.jsx
    ↓ appelle
useAuth()
    ↓ utilise
AuthContext
    ↓ appelle
authService.login()
    ↓ appelle
API Backend (Node.js)
    ↓ retourne
Token JWT + User
    ↓ stocke
localStorage + AuthContext
```

### 2. Panier d'achats

```
Voitures.jsx ou Accessoires.jsx
    ↓ action utilisateur
usePanier()
    ↓ utilise
PanierContext
    ↓ ajoute article
articles[] (state)
    ↓ sauvegarde
localStorage
    ↓ affichage
Panier.jsx
```

### 3. Chargement de données

```
Voitures.jsx (page)
    ↓ useEffect
voitureService.getAllModels()
    ↓ appelle
API Backend via Axios
    ↓ intercepteur ajoute
Token JWT (automatique)
    ↓ retourne
Données
    ↓ affiche
Liste de voitures
```

---

## 🎨 Design Pattern : Component Pattern

### Composants de présentation (Dumb Components)

**Rôle** : Affichage uniquement, pas de logique métier

```javascript
// Exemple : Button.jsx
const Button = ({ children, onClick, variant }) => {
  return (
    <button onClick={onClick} className={variantClasses[variant]}>
      {children}
    </button>
  );
};
```

### Composants conteneurs (Smart Components)

**Rôle** : Logique métier et gestion d'état

```javascript
// Exemple : Voitures.jsx
const Voitures = () => {
  const [voitures, setVoitures] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      const data = await voitureService.getAllModels();
      setVoitures(data);
      setLoading(false);
    };
    fetchData();
  }, []);

  return <div>{/* Affichage */}</div>;
};
```

---

## 🔐 Système d'authentification

### Routes publiques

- `/` - Accueil
- `/login` - Connexion
- `/register` - Inscription
- `/voitures` - Catalogue
- `/accessoires` - Accessoires
- `/panier` - Panier

### Routes protégées

Nécessitent authentification :

- `/mon-compte` - Profil utilisateur
- `/mes-commandes` - Historique des commandes
- `/mes-reservations` - Réservations

Nécessitent rôle admin :

- `/admin/*` - Panneau d'administration

### Protection des routes

```javascript
<ProtectedRoute>
  <MonCompte />
</ProtectedRoute>

// Ou avec rôle
<ProtectedRoute requireRole="admin">
  <AdminPanel />
</ProtectedRoute>
```

---

## 📡 Communication avec l'API

### Configuration Axios

```javascript
// config/api.jsx
const apiClient = axios.create({
  baseURL: 'http://localhost:3000',
  timeout: 10000,
});

// Intercepteur requête : ajoute le token
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Intercepteur réponse : gère les erreurs 401
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Déconnexion automatique
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);
```

### Services API

Tous les appels API passent par les services :

```javascript
// services/voiture.service.jsx
export const voitureService = {
  getAllModels: async () => {
    const response = await apiClient.get('/model_porsche');
    return response.data;
  },

  getModelById: async (id) => {
    const response = await apiClient.get(`/model_porsche/${id}`);
    return response.data;
  },
  // ...
};
```

---

## 🎨 Tailwind CSS

### Utilisation

L'application utilise **Tailwind CSS** pour le styling :

```javascript
<button className="px-6 py-3 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors">
  Cliquez ici
</button>
```

### Classes utiles

```css
/* Conteneur */
max-w-7xl mx-auto px-4 sm:px-6 lg:px-8

/* Grille responsive */
grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6

/* Flexbox */
flex items-center justify-between

/* Spacing */
p-4 (padding)
m-4 (margin)
gap-4 (gap)

/* Couleurs Porsche */
bg-black text-white
bg-gray-800 text-gray-600

/* Transitions */
hover:bg-gray-800 transition-colors
hover:shadow-xl transition-all
```

---

## 🚀 Bonnes pratiques

### 1. Séparation des responsabilités

```
Services → Communication API
Context → État global
Hooks → Logique réutilisable
Components → Affichage
Utils → Fonctions utilitaires
```

### 2. Gestion des erreurs

```javascript
try {
  const data = await voitureService.getAllModels();
  setVoitures(data);
} catch (error) {
  setError('Erreur lors du chargement');
  console.error(error);
}
```

### 3. Validation des formulaires

```javascript
import { validateEmail, validatePassword } from '../utils/validation';

if (!validateEmail(email)) {
  setErrors({ email: 'Email invalide' });
  return;
}
```

### 4. Formatage des données

```javascript
import { formatPrice, formatDate } from '../utils/format';

<p>{formatPrice(95000)}</p> // "95 000 €"
<p>{formatDate(new Date())}</p> // "18 novembre 2025"
```

### 5. État de chargement

```javascript
if (loading) return <Loading fullScreen />;
```

---

## 📝 Conventions de nommage

### Fichiers

- **Composants** : PascalCase (ex: `Button.jsx`)
- **Services** : camelCase.service (ex: `auth.service.jsx`)
- **Utilitaires** : camelCase (ex: `format.js`)
- **Pages** : PascalCase (ex: `Home.jsx`)

### Variables

- **useState** : `[value, setValue]`
- **useEffect** : Descriptif de l'action
- **Fonctions** : Verbe d'action (ex: `handleClick`, `fetchData`)

---

## 🔧 Développement

### Ajouter une nouvelle fonctionnalité

1. Créer le service API si nécessaire
2. Créer les composants nécessaires
3. Créer la page
4. Ajouter la route dans `App.jsx`
5. Tester l'intégration

### Ajouter un nouveau composant commun

```bash
# 1. Créer le composant
src/components/common/MonComposant.jsx

# 2. Exporter dans index.jsx
export { default as MonComposant } from './MonComposant.jsx';

# 3. Utiliser partout
import { MonComposant } from '../components/common';
```

---

## ✅ Points forts de cette architecture

1. **Simple et claire** - Facile à comprendre et à maintenir
2. **Réutilisable** - Composants communs utilisables partout
3. **Scalable** - Peut évoluer facilement
4. **Testable** - Séparation claire des responsabilités
5. **Performante** - Optimisations React (lazy loading possible)
6. **Maintenable** - Code organisé et documenté

---

## 📚 Ressources

- [React Documentation](https://react.dev)
- [Vite Documentation](https://vitejs.dev)
- [Tailwind CSS](https://tailwindcss.com)
- [React Router](https://reactrouter.com)
- [Axios](https://axios-http.com)

---

**Architecture créée avec ❤️ pour la Plateforme Porsche**

