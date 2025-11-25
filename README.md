# Plateforme Porsche - Système de Configuration et Vente en Ligne

Application web full-stack pour la configuration, personnalisation et achat de véhicules Porsche avec gestion complète du processus de vente incluant paiement sécurisé, gestion d'inventaire et administration.

## Table des matières

- [Vue d'ensemble](#vue-densemble)
- [Architecture du système](#architecture-du-système)
- [Technologies utilisées](#technologies-utilisées)
- [Prérequis](#prérequis)
- [Installation](#installation)
- [Configuration](#configuration)
- [Lancement de l'application](#lancement-de-lapplication)
- [Structure du projet](#structure-du-projet)
- [Fonctionnalités principales](#fonctionnalités-principales)
- [API Endpoints](#api-endpoints)
- [Sécurité](#sécurité)
- [Tests et déploiement](#tests-et-déploiement)

## Vue d'ensemble

La Plateforme Porsche est une solution complète e-commerce spécialisée dans la vente et configuration de véhicules de luxe. Le système permet aux clients de configurer leur véhicule sur mesure, de gérer leur panier d'achat, et de finaliser leurs achats avec un système de paiement sécurisé via Stripe.

### Caractéristiques principales

**Architecture moderne** : Application découplée avec API REST et interface client React
**Expérience utilisateur fluide** : Interface responsive avec configurateur 3D interactif
**Sécurité renforcée** : Authentification JWT, validation des données, protection contre les attaques courantes
**Paiement sécurisé** : Intégration complète de Stripe avec gestion des webhooks
**Administration complète** : Dashboard pour la gestion des modèles, accessoires et commandes

## Architecture du système

Le projet suit une architecture client-serveur découplée :

```
┌─────────────────────┐         ┌─────────────────────┐
│   React Frontend    │  HTTP   │   Node.js Backend   │
│   (Port 5173)       │◄───────►│   (Port 3000)       │
│                     │  REST   │                     │
└─────────────────────┘  API    └──────────┬──────────┘
                                           │
                                           │ Mongoose
                                           │
                                  ┌────────▼──────────┐
                                  │   MongoDB Atlas   │
                                  │   (Database)      │
                                  └───────────────────┘

                                  ┌───────────────────┐
                                  │   Stripe API      │
                                  │   (Payments)      │
                                  └───────────────────┘
```

### Stack technique

**Frontend** : React 19 + Vite 7 + Tailwind CSS 4
**Backend** : Node.js + Express 5 + MongoDB (Mongoose 8)
**Authentification** : JWT (JSON Web Tokens)
**Paiement** : Stripe API
**Sécurité** : Bcrypt, Express-validator, HPP, Rate limiting

## Technologies utilisées

### Backend (Node.js)

#### Core

- **Express 5.1.0** - Framework web minimaliste et flexible
- **MongoDB 8.20.0** (Mongoose) - Base de données NoSQL avec ODM
- **Node.js ≥ 18.0.0** - Runtime JavaScript

#### Sécurité

- **bcrypt 6.0.0** - Hachage sécurisé des mots de passe
- **jsonwebtoken 9.0.2** - Génération et validation de tokens JWT
- **express-validator 7.3.1** - Validation et sanitization des entrées
- **express-rate-limit 8.2.1** - Protection contre le brute force
- **hpp 0.2.3** - Protection contre HTTP Parameter Pollution
- **cors 2.8.5** - Gestion des requêtes cross-origin

#### Paiement et fichiers

- **Stripe 18.5.0** - Traitement des paiements
- **Multer 2.0.2** - Gestion des uploads de fichiers

#### Validation

- **Joi 18.0.1** - Schémas de validation

#### Utilitaires

- **dotenv 17.2.3** - Gestion des variables d'environnement
- **cookie-parser 1.4.6** - Parsing des cookies

### Frontend (React)

#### Core

- **React 19.2.0** - Bibliothèque UI avec dernières fonctionnalités
- **Vite 7.2.2** - Build tool ultra-rapide avec HMR
- **React Router DOM 7.9.6** - Navigation SPA

#### Styling

- **Tailwind CSS 4.1.17** - Framework CSS utility-first
- **Flowbite 4.0.1** - Composants UI pré-construits
- **TW Elements 2.0.0** - Composants interactifs

#### Intégrations

- **Stripe (@stripe/react-stripe-js 5.4.0)** - Composants React pour Stripe
- **Axios 1.13.2** - Client HTTP pour les requêtes API
- **JWT Decode 4.0.0** - Décodage des tokens d'authentification

#### Utilitaires

- **React Toastify 9.1.1** - Notifications toast
- **React Icons 5.5.0** - Bibliothèque d'icônes
- **Date-fns 4.1.0** - Manipulation de dates
- **DOMPurify 3.3.0** - Sanitization du HTML

#### Qualité de code

- **ESLint 9.39.1** - Linting JavaScript/React
- **Nodemon 3.1.10** (backend dev) - Hot-reload du serveur

## Prérequis

Avant de commencer, assurez-vous d'avoir installé les éléments suivants :

### Logiciels requis

- **Node.js** version 18.0.0 ou supérieure
- **npm** version 9.0.0 ou supérieure (ou yarn ≥ 1.22.0)
- **MongoDB** (local ou Atlas cloud)
- **Git** pour le contrôle de version

### Comptes externes

- **Stripe Account** - Pour les paiements (clés API requises)
- **MongoDB Atlas** (optionnel) - Pour la base de données cloud

### Vérification des installations

```bash
node --version    # Doit afficher v18.x.x ou supérieur
npm --version     # Doit afficher 9.x.x ou supérieur
mongod --version  # Si MongoDB local
```

## Installation

### 1. Cloner le repository

```bash
git clone <votre-repo-url>
cd plateforme_porsche
```

### 2. Installation du Backend (Node.js)

```bash
cd Node
npm install
```

### 3. Installation du Frontend (React)

```bash
cd ../React
npm install
```

### 4. Configuration MongoDB

**Option A : MongoDB local**

```bash
# macOS (avec Homebrew)
brew services start mongodb-community

# Vérifier que MongoDB tourne
brew services list
```

**Option B : MongoDB Atlas (Cloud)**

1. Créer un compte sur [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Créer un cluster gratuit
3. Configurer l'accès réseau (whitelist IP)
4. Obtenir la chaîne de connexion

### 5. Configuration Stripe

1. Créer un compte [Stripe](https://stripe.com)
2. Obtenir les clés API (mode test) :

   - Clé publique (pk*test*...)
   - Clé secrète (sk*test*...)
   - Clé de webhook (whsec\_...)

3. Configurer le webhook Stripe :

```bash
# À la racine du projet
chmod +x setup-stripe-webhook.sh
./setup-stripe-webhook.sh
```

## Configuration

### Backend (.env)

Créer un fichier `.env` dans le dossier `Node/` :

```env
# Port du serveur
PORT=3000

# MongoDB
MONGODB_URI=mongodb://localhost:27017/porsche_db
# Ou pour MongoDB Atlas :
# MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/porsche_db

# JWT
JWT_SECRET=votre_secret_jwt_très_sécurisé_minimum_32_caractères
JWT_EXPIRES_IN=7d

# Stripe
STRIPE_SECRET_KEY=sk_test_votre_clé_secrète
STRIPE_PUBLISHABLE_KEY=pk_test_votre_clé_publique
STRIPE_WEBHOOK_SECRET=whsec_votre_secret_webhook

# Client URL (pour CORS)
CLIENT_URL=http://localhost:5173

# Node Environment
NODE_ENV=development
```

### Frontend (.env)

Créer un fichier `.env` dans le dossier `React/` :

```env
# URL de l'API backend
VITE_API_URL=http://localhost:3000
```

### Important : Sécurité

- Ne jamais commiter les fichiers `.env`
- Utiliser des valeurs différentes en production
- Générer un JWT_SECRET aléatoire et fort

```bash
# Générer un secret JWT sécurisé
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

## Lancement de l'application

### Méthode 1 : Lancement séparé (Développement)

**Terminal 1 : Backend**

```bash
cd Node
npm run dev      # Avec nodemon (auto-reload)
# ou
npm start        # Sans auto-reload
```

Le serveur démarre sur `http://localhost:3000`

**Terminal 2 : Frontend**

```bash
cd React
npm run dev      # Mode développement
```

L'application React s'ouvre sur `http://localhost:5173`

### Méthode 2 : Accès réseau local

Pour tester sur d'autres appareils du réseau local :

```bash
# Backend
cd Node
npm start

# Frontend (nouveau terminal)
cd React
npm run start    # Accessible via IP locale
```

### Vérification du fonctionnement

1. **Backend** : Ouvrir `http://localhost:3000/` (devrait retourner un statut)
2. **Frontend** : Ouvrir `http://localhost:5173` (page d'accueil)
3. **Base de données** : Vérifier la connexion MongoDB dans les logs du backend

## Structure du projet

```
plateforme_porsche/
│
├── Node/                       # Backend API REST
│   ├── controllers/            # Logique métier des routes
│   ├── models/                 # Schémas Mongoose (MongoDB)
│   ├── routes/                 # Définition des endpoints API
│   ├── middlewares/            # Middlewares Express (auth, validation, etc.)
│   ├── services/               # Services métier (paiement, etc.)
│   ├── utils/                  # Utilitaires et constantes
│   ├── validations/            # Schémas de validation Joi
│   ├── db/                     # Configuration base de données
│   ├── uploads/                # Dossier des fichiers uploadés
│   ├── server.js               # Point d'entrée du serveur
│   ├── package.json            # Dépendances backend
│   └── .env                    # Variables d'environnement backend
│
├── React/                      # Frontend React
│   ├── src/
│   │   ├── components/         # Composants réutilisables
│   │   │   ├── common/         # Composants UI de base (Button, Input, etc.)
│   │   │   ├── layout/         # Layout (Header, Footer, Navbar)
│   │   │   └── modals/         # Modales
│   │   ├── pages/              # Pages/Vues de l'application
│   │   ├── services/           # Services API (appels HTTP)
│   │   ├── hooks/              # Custom hooks React
│   │   ├── context/            # Context API (AuthContext, etc.)
│   │   ├── routes/             # Configuration du routing
│   │   ├── utils/              # Fonctions utilitaires
│   │   ├── css/                # Styles CSS modulaires
│   │   ├── config/             # Configuration (API URL, etc.)
│   │   ├── App.jsx             # Composant racine
│   │   └── main.jsx            # Point d'entrée React
│   ├── public/                 # Assets statiques
│   ├── package.json            # Dépendances frontend
│   ├── vite.config.js          # Configuration Vite
│   ├── tailwind.config.js      # Configuration Tailwind
│   └── .env                    # Variables d'environnement frontend
│
├── setup-stripe-webhook.sh     # Script de configuration Stripe
└── README.md                   # Documentation principale
```

### Organisation du code backend (Node/)

**Principe MVC adapté** :

- **Models** : Définition des schémas de données (Mongoose)
- **Controllers** : Logique métier et traitement des requêtes
- **Routes** : Mapping des URLs vers les controllers
- **Middlewares** : Couche intermédiaire (authentification, validation)
- **Services** : Logique métier complexe réutilisable

### Organisation du code frontend (React/)

**Architecture par fonctionnalité** :

- **Pages** : Composants de niveau page (routing)
- **Components** : Composants réutilisables
- **Services** : Centralisation des appels API
- **Hooks** : Logique réutilisable encapsulée
- **Context** : État global partagé

## Fonctionnalités principales

### Espace Client

**Navigation et découverte**

- Catalogue complet des modèles Porsche disponibles
- Visualisation détaillée de chaque modèle avec galerie photos
- Filtres et recherche avancée

**Configurateur de véhicule**

- Choix du modèle de base
- Sélection de la couleur extérieure
- Personnalisation de l'intérieur
- Choix des jantes et tailles
- Ajout d'options et packages
- Visualisation en temps réel des modifications
- Calcul automatique du prix

**Gestion du panier**

- Ajout de véhicules configurés
- Ajout d'accessoires
- Modification des quantités
- Calcul du total avec taxes
- Sauvegarde du panier entre sessions

**Processus de commande**

- Formulaire de livraison
- Récapitulatif de la commande
- Paiement sécurisé via Stripe
- Confirmation par email
- Suivi de commande

**Espace personnel**

- Gestion du profil utilisateur
- Historique des commandes
- Mes véhicules configurés
- Favoris et sauvegardes

### Espace Administration

**Gestion des véhicules**

- Ajout/modification/suppression de modèles
- Gestion des variantes
- Upload de photos
- Gestion des prix et disponibilités

**Gestion des accessoires**

- Catalogue d'accessoires
- Catégorisation
- Gestion des stocks
- Pricing

**Gestion des commandes**

- Vue d'ensemble des commandes
- Changement de statut
- Gestion des livraisons
- Rapports de ventes

**Gestion des utilisateurs**

- Liste des clients
- Modification des rôles (admin, staff, client)
- Statistiques utilisateurs

## API Endpoints

### Authentification

```
POST   /user/register              # Inscription
POST   /user/login                 # Connexion
POST   /auth/refresh               # Rafraîchir le token
GET    /user/me                    # Profil utilisateur actuel
PUT    /user/me                    # Mettre à jour son profil
```

### Véhicules et modèles

```
GET    /model_porsche              # Liste des modèles
GET    /model_porsche/:id          # Détails d'un modèle
POST   /model_porsche              # Créer un modèle (Admin)
PUT    /model_porsche/:id          # Modifier un modèle (Admin)
DELETE /model_porsche/:id          # Supprimer un modèle (Admin)

GET    /voiture                    # Liste des variantes
GET    /voiture/:id                # Détails d'une variante
```

### Personnalisation

```
GET    /couleur_exterieur          # Couleurs extérieures
GET    /couleur_interieur          # Couleurs intérieures
GET    /siege                      # Types de sièges
GET    /taille_jante               # Tailles de jantes
GET    /package                    # Packages disponibles
```

### Accessoires

```
GET    /accesoire                  # Liste des accessoires
GET    /accesoire/:id              # Détails d'un accessoire
POST   /accesoire                  # Créer un accessoire (Admin)
PUT    /accesoire/:id              # Modifier un accessoire (Admin)
DELETE /accesoire/:id              # Supprimer un accessoire (Admin)
```

### Panier

```
GET    /api/panier                      # Récupérer le panier
POST   /api/panier/voiture-neuve        # Ajouter une voiture neuve
POST   /api/panier/accessoire           # Ajouter un accessoire
PATCH  /api/panier/ligne/:ligne_id/quantite  # Modifier quantité
DELETE /api/panier/ligne/:ligne_id      # Retirer une ligne

# Routes alternatives (dans /commande, deprecated)
GET    /commande/panier                 # Récupérer le panier
POST   /commande/panier/addConfig       # Ajouter une configuration
POST   /commande/panier/valider         # Valider le panier
```

### Commandes

```
GET    /commande/historique        # Mes commandes
GET    /commande/all               # Toutes les commandes (Admin)
GET    /commande/:id               # Détails d'une commande
POST   /commande/new               # Créer une commande
PUT    /commande/update/:id        # Modifier une commande
DELETE /commande/delete/:id        # Supprimer une commande
```

### Paiement

```
POST   /api/payment/checkout/:id   # Créer session Stripe (id = commande)
POST   /webhook                    # Webhook Stripe (raw body)
```

### Utilisateurs (Admin)

```
GET    /user                       # Liste tous les utilisateurs (Admin)
GET    /user/:id                   # Détails d'un utilisateur (Admin)
PUT    /user/:id                   # Modifier un utilisateur (Admin)
PUT    /user/:id/role              # Modifier le rôle (Admin)
DELETE /user/:id                   # Supprimer un utilisateur (Admin)
GET    /user/roles                 # Rôles disponibles (Admin)
```

### Réservations

```
POST   /user/:id/reservations      # Créer une réservation (Admin)
GET    /user/:id/reservations      # Réservations d'un utilisateur (Admin)
DELETE /user/:id/reservations/:reservationId  # Supprimer réservation (Admin)
GET    /reservation                # Liste des réservations
```

### Photos (Upload - Admin)

```
POST   /photo_voiture              # Upload photo de voiture
POST   /photo_voiture_actuel       # Upload photo voiture actuelle
POST   /photo_accesoire            # Upload photo accessoire
POST   /photo_porsche              # Upload photo Porsche
GET    /uploads/:filename          # Accéder aux fichiers uploadés
```

### Format de réponse API

**Succès** :

```json
{
  "success": true,
  "data": {
    /* données */
  },
  "message": "Opération réussie"
}
```

**Erreur** :

```json
{
  "success": false,
  "error": "Message d'erreur",
  "details": [
    /* détails de validation */
  ]
}
```

## Sécurité

### Mesures de protection backend

**Authentification et autorisation**

- JWT avec expiration configurable
- Hachage des mots de passe avec bcrypt (salt rounds : 10)
- Middleware d'authentification sur les routes protégées
- Système de rôles (admin, staff, client)

**Protection contre les attaques**

- Rate limiting : 100 requêtes / 15 minutes par IP
- HPP : Protection contre HTTP Parameter Pollution
- CORS : Origine autorisée uniquement depuis le frontend
- Express-validator : Validation et sanitization des entrées
- Protection contre les injections MongoDB

**Gestion des fichiers**

- Multer avec validation du type MIME
- Limitation de la taille des uploads (5MB)
- Stockage sécurisé dans un dossier dédié

**Sécurité des paiements**

- Vérification des signatures Stripe Webhook
- Aucune donnée de carte stockée (gérée par Stripe)
- Transactions idempotentes

### Mesures de protection frontend

**Sanitization**

- DOMPurify pour nettoyer le HTML avant l'affichage
- Validation côté client des formulaires

**Stockage sécurisé**

- JWT stocké dans localStorage (avec expiration)
- Nettoyage automatique à la déconnexion

**Requêtes API**

- Timeout configuré sur les requêtes
- Gestion des erreurs réseau
- Retry logic sur les échecs temporaires

### Bonnes pratiques recommandées

**En production**

- Utiliser HTTPS obligatoirement
- Configurer des secrets forts (JWT_SECRET > 32 caractères)
- Activer les logs de sécurité
- Mettre en place une surveillance (monitoring)
- Sauvegardes régulières de la base de données
- Limiter les accès à la base de données (whitelist IP)

**Variables d'environnement**

- Ne jamais commiter les fichiers `.env`
- Utiliser des valeurs différentes par environnement
- Rotation régulière des secrets en production

## Tests et déploiement

### Tests locaux

**Backend**

```bash
cd Node
npm start
# Tester un endpoint
curl http://localhost:3000/model_porsche
```

**Frontend**

```bash
cd React
npm run build       # Build de production
npm run preview     # Prévisualiser le build
```

### Build de production

**Backend**

```bash
cd Node
# Le backend utilise directement Node.js, pas de build nécessaire
# S'assurer que NODE_ENV=production dans .env
```

**Frontend**

```bash
cd React
npm run build
# Les fichiers optimisés sont dans dist/
```

### Déploiement recommandé

**Backend** : Heroku, Railway, DigitalOcean, AWS EC2
**Frontend** : Vercel, Netlify, AWS S3 + CloudFront
**Base de données** : MongoDB Atlas (recommandé)

### Variables d'environnement en production

Configurer les mêmes variables `.env` que localement mais avec :

- MongoDB Atlas URI
- Clés Stripe en mode live (pas test)
- JWT_SECRET fort et unique
- NODE_ENV=production
- URL de production pour CLIENT_URL et VITE_API_URL

## Commandes utiles

### Backend (Node/)

```bash
npm start              # Démarrer le serveur
npm run dev            # Démarrer avec nodemon (auto-reload)
```

### Frontend (React/)

```bash
npm run dev            # Serveur de développement
npm run build          # Build de production
npm run preview        # Prévisualiser le build
npm run lint           # Vérifier le code avec ESLint
npm run start          # Dev avec accès réseau
```

### MongoDB

```bash
# macOS
brew services start mongodb-community    # Démarrer MongoDB
brew services stop mongodb-community     # Arrêter MongoDB
brew services restart mongodb-community  # Redémarrer MongoDB

# Connexion à MongoDB
mongosh porsche_db
```

### Stripe CLI (pour tester les webhooks localement)

```bash
stripe listen --forward-to localhost:3000/api/payment/webhook
```

## Principes de développement

### Architecture SOLID

**Single Responsibility** : Chaque module a une responsabilité unique

- Controllers : Traitement des requêtes HTTP
- Services : Logique métier
- Models : Schémas de données

**Open/Closed** : Ouvert à l'extension, fermé à la modification

- Middlewares chainables
- Composants React réutilisables

**Liskov Substitution** : Héritage et interfaces cohérents

- Schémas Mongoose extensibles

**Interface Segregation** : Interfaces spécifiques

- Services API granulaires

**Dependency Inversion** : Dépendance aux abstractions

- Injection de dépendances dans les services

### Méthodologie AGILE

**Développement itératif** : Fonctionnalités livrées par sprints
**Communication continue** : Code documenté et auto-explicatif
**Amélioration continue** : Refactoring régulier
**Tests** : Validation à chaque étape

### Principes DRY (Don't Repeat Yourself)

- Composants réutilisables (React)
- Hooks personnalisés pour la logique partagée
- Services API centralisés
- Middlewares Express réutilisables

## Support et maintenance

### Logs

**Backend** : Les logs sont affichés dans la console du serveur
**Frontend** : Utiliser les DevTools du navigateur (Console)

### Debugging

**Backend**

```bash
# Mode debug Node.js
node --inspect server.js
```

**Frontend**

- React DevTools (extension Chrome/Firefox)
- Vite DevTools intégré

### Problèmes courants

**Le backend ne démarre pas**

- Vérifier que MongoDB est lancé
- Vérifier les variables d'environnement (.env)
- Vérifier que le port 3000 n'est pas déjà utilisé

**Le frontend ne se connecte pas au backend**

- Vérifier que VITE_API_URL est correct dans .env
- Vérifier que le backend tourne sur le bon port
- Vérifier la configuration CORS du backend

**Erreur de paiement Stripe**

- Vérifier les clés API Stripe (mode test vs live)
- Vérifier le webhook Stripe
- Consulter les logs Stripe Dashboard

**Problèmes de base de données**

- Vérifier la connexion MongoDB
- Vérifier les permissions utilisateur MongoDB
- Consulter les logs Mongoose

## Contribution

Pour contribuer au projet :

1. Suivre les conventions de nommage existantes
2. Respecter l'architecture MVC (backend) et component-based (frontend)
3. Utiliser ESLint avant de commit
4. Documenter les fonctions complexes
5. Tester les modifications avant de pusher

## Licence

Ce projet est sous licence ISC.

## Contact et support

Pour toute question technique :

1. Consulter cette documentation
2. Vérifier les logs d'erreur
3. Consulter la documentation des technologies utilisées

---

**Note importante** : Ce projet est conçu à des fins éducatives et de démonstration. Pour une utilisation en production, des mesures de sécurité et d'optimisation supplémentaires sont recommandées.
