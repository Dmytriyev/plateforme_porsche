# Plateforme Porsche - Interface Client

Application web React moderne pour la configuration, réservation et achat de véhicules Porsche avec gestion complète du processus de vente en ligne.

## Table des matières

- [Aperçu](#aperçu)
- [Fonctionnalités](#fonctionnalités)
- [Technologies](#technologies)
- [Prérequis](#prérequis)
- [Installation](#installation)
- [Configuration](#configuration)
- [Utilisation](#utilisation)
- [Structure du projet](#structure-du-projet)
- [Scripts disponibles](#scripts-disponibles)

## Aperçu

Cette application React constitue le frontend de la plateforme Porsche. Elle offre une expérience utilisateur fluide pour explorer les modèles, configurer des véhicules personnalisés, gérer un panier d'achat et finaliser des commandes avec paiement sécurisé via Stripe.

## Fonctionnalités

### Pour les clients

- **Catalogue de modèles** : Exploration des différents modèles Porsche disponibles
- **Configurateur** : Personnalisation complète (couleur, intérieur, jantes, options)
- **Gestion du panier** : Ajout/suppression d'articles et accessoires
- **Paiement sécurisé** : Intégration Stripe pour les transactions
- **Suivi des commandes** : Historique et statut des commandes
- **Compte utilisateur** : Gestion du profil et des informations personnelles
- **Mes véhicules** : Gestion des véhicules configurés et sauvegardés

### Pour les administrateurs

- **Gestion des modèles** : Ajout/modification de modèles Porsche
- **Gestion des accessoires** : Administration des accessoires disponibles
- **Dashboard** : Vue d'ensemble des ventes et réservations

## Technologies

### Core

- **React 19** - Bibliothèque UI avec les dernières fonctionnalités
- **Vite 7** - Outil de build ultra-rapide
- **React Router DOM 7** - Navigation côté client

### Styling

- **Tailwind CSS 4** - Framework CSS utility-first
- **Flowbite** - Composants UI basés sur Tailwind
- **CSS Modules** - Styles modulaires et scopés

### Intégrations

- **Stripe** - Paiement en ligne (@stripe/react-stripe-js, @stripe/stripe-js)
- **Axios** - Client HTTP pour les appels API
- **JWT Decode** - Décodage des tokens d'authentification

## Installation

1. **Cloner le repository** (si ce n'est pas déjà fait)

```bash
git clone <votre-repo-url>
cd plateforme_porsche/React
```

2. **Installer les dépendances**

```bash
npm install
```

## Configuration

1. **Créer le fichier d'environnement**

Créez un fichier `.env` à la racine du dossier `React` :

> **Note** : Modifiez l'URL selon votre configuration backend.

2. **Configuration Stripe**

Les clés Stripe sont gérées par le backend. Assurez-vous que votre API backend est correctement configurée avec vos identifiants Stripe.

## Utilisation

### Développement

Lancer le serveur de développement avec hot-reload :

```bash
npm run dev
```

Pour rendre accessible sur le réseau local :

```bash
npm run start
```

### Production

1. **Build de production** :

```bash
npm run build
```

Les fichiers optimisés seront générés dans le dossier `dist/`

2. **Prévisualiser le build** :

```bash
npm run preview
```

## Structure du projet

```
React/
├── public/              # Fichiers statiques (images, logos)
├── src/
│   ├── components/      # Composants réutilisables
│   │   ├── common/      # Composants UI de base (Button, Card, Input, Modal)
│   │   ├── layout/      # Composants de mise en page (Footer, Navbar)
│   │   └── modals/      # Modales spécifiques
│   ├── config/          # Configuration (API, constants)
│   ├── context/         # Contextes React (AuthContext)
│   ├── css/             # Fichiers CSS modulaires
│   ├── hooks/           # Hooks personnalisés (useAuth, usePanierAPI)
│   ├── pages/           # Pages de l'application
│   ├── routes/          # Configuration des routes
│   ├── services/        # Services API (auth, commande, voiture, etc.)
│   ├── utils/           # Utilitaires (helpers, logger, notify, storage)
│   ├── App.jsx          # Composant racine
│   └── main.jsx         # Point d'entrée
├── .env                 # Variables d'environnement
├── package.json         # Dépendances et scripts
├── vite.config.js       # Configuration Vite
└── tailwind.config.js   # Configuration Tailwind CSS
```

### Organisation par fonctionnalité

- **Services** : Centralisation des appels API (`*.service.js`)
- **Hooks** : Logique réutilisable encapsulée
- **Context** : Gestion de l'état global (authentification)
- **Utils** : Fonctions utilitaires partagées

## Scripts disponibles

| Script            | Description                               |
| ----------------- | ----------------------------------------- |
| `npm run dev`     | Lance le serveur de développement         |
| `npm run build`   | Crée le build de production               |
| `npm run preview` | Prévisualise le build de production       |
| `npm run lint`    | Vérifie le code avec ESLint               |
| `npm run start`   | Lance le serveur avec accès réseau        |
| `npm run serve`   | Sert le build de production sur le réseau |

## Authentification

L'application utilise JWT (JSON Web Tokens) pour l'authentification :

1. Les tokens sont stockés dans le `localStorage`
2. Le `AuthContext` gère l'état d'authentification global
3. Les routes protégées utilisent le composant `ProtectedRoute`
4. Les tokens sont automatiquement ajoutés aux requêtes API

## Styling et UI/UX

### Approche CSS

- **Tailwind CSS** pour le styling utilitaire et rapide
- **CSS Modules** pour les styles spécifiques aux pages
- **Variables CSS** centralisées dans `variables.css`

### Composants réutilisables

- `Button`, `Card`, `Input`, `Modal` : Composants de base
- `Loading` : Indicateur de chargement
- `ErrorBoundary` : Gestion des erreurs React

## Gestion des notifications

Les notifications utilisent **React Toastify** :

```javascript
import notify from "./utils/notify";

// Succès
notify.success("Opération réussie !");

// Erreur
notify.error("Une erreur est survenue");

// Info
notify.info("Information importante");
```

## Sécurité

- Sanitization des entrées utilisateur avec DOMPurify
- Validation des tokens JWT
- Protection des routes sensibles
- Gestion sécurisée des paiements via Stripe
- HTTPS recommandé en production

## Debug et logs

Le système de logging est centralisé dans `utils/logger.js` :

```javascript
import logger from "./utils/logger";

logger.info("Message informatif");
logger.error("Erreur détectée", error);
logger.warn("Avertissement");
```

**Note** : Cette application nécessite le backend Node.js pour fonctionner. Consultez le README du dossier `Node/` pour les instructions d'installation et configuration du serveur.
