# Plateforme Porsche

Application web full-stack de configuration et vente en ligne de véhicules Porsche avec paiement sécurisé Stripe.

## Description

Système e-commerce complet permettant la personnalisation de véhicules Porsche, gestion de panier, traitement des commandes et administration. Architecture découplée avec API REST Node.js et interface React moderne.

## Technologies

**Backend** : Node.js, Express 5, MongoDB (Mongoose), JWT, Stripe, Bcrypt
**Frontend** : React 19, Vite 7, Tailwind CSS 4, Axios, React Router 7
**Sécurité** : Rate limiting, HPP, CORS, Express-validator, DOMPurify

## Fonctionnalités

- Catalogue de modèles Porsche avec filtres et recherche
- Configurateur interactif (couleurs, intérieur, jantes, options)
- Système de panier avec calcul en temps réel
- Paiement sécurisé via Stripe avec webhooks
- Authentification JWT avec gestion de rôles (client, staff, admin)
- Espace client : historique commandes, véhicules sauvegardés, profil
- Dashboard admin : gestion modèles, accessoires, commandes, utilisateurs
- Upload et gestion d'images multi-formats
- API REST complète et documentée

## Installation rapide

```bash
# Cloner le repository
git clone <votre-repo-url>
cd plateforme_porsche

# Backend
cd Node
npm install
cp .env.example .env    # Configurer les variables d'environnement

# Frontend
cd ../React
npm install
cp .env.example .env    # Configurer VITE_API_URL

# Démarrer MongoDB
brew services start mongodb-community  # macOS

# Lancer l'application
# Terminal 1 - Backend
cd Node && npm run dev

# Terminal 2 - Frontend
cd React && npm run dev
```

## Configuration

### Backend (.env)

```env
PORT=3000
MONGODB_URI=mongodb://localhost:27017/db
JWT_SECRET=your_secret_key_minimum_32_characters
JWT_EXPIRES_IN=7d
STRIPE_SECRET_KEY=sk_test_...
STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
CLIENT_URL=http://localhost:5173
NODE_ENV=development
```

### Frontend (.env)

```env
VITE_API_URL=http://localhost:3000
```

## Structure du projet

```
plateforme_porsche/
├── Node/                    # Backend API REST
│   ├── controllers/         # Logique métier
│   ├── models/              # Schémas MongoDB
│   ├── routes/              # Endpoints API
│   ├── middlewares/         # Auth, validation, sécurité
│   ├── services/            # Services métier (paiement)
│   └── server.js            # Point d'entrée
│
└── React/                   # Frontend React
    ├── src/
    │   ├── components/      # Composants réutilisables
    │   ├── pages/           # Pages/Vues
    │   ├── services/        # Appels API
    │   ├── hooks/           # Custom hooks
    │   ├── context/         # État global (Auth)
    │   └── utils/           # Utilitaires
    └── vite.config.js
```

## API Endpoints

```
POST   /user/register                  # Inscription
POST   /user/login                     # Connexion
GET    /model_porsche                  # Liste modèles
GET    /voiture/:id                    # Détails variante
POST   /api/panier/voiture-neuve       # Ajouter voiture au panier
POST   /api/panier/accessoire          # Ajouter accessoire
POST   /api/payment/checkout/:id       # Session Stripe
GET    /commande/historique            # Mes commandes
```

Consulter le README principal pour la liste complète des endpoints.

## Sécurité

- JWT avec expiration configurable
- Mots de passe hachés (bcrypt)
- Rate limiting (100 req/15min)
- Validation des entrées (express-validator)
- Protection CSRF et HPP
- CORS configuré
- Sanitization HTML (DOMPurify)
- Webhooks Stripe signés

## Scripts disponibles

```bash
# Backend
npm start          # Démarrer le serveur
npm run dev        # Mode développement (nodemon)

# Frontend
npm run dev        # Serveur de développement
npm run build      # Build de production
npm run preview    # Prévisualiser le build
npm run lint       # Vérifier le code
```

## Architecture

```
┌─────────────┐         ┌─────────────┐
│   React     │  HTTP   │   Node.js   │
│  (Port      │◄───────►│   Express   │
│   5173)     │  REST   │  (Port      │
└─────────────┘  API    │   3000)     │
                        └──────┬──────┘
                               │
                        ┌──────▼──────┐
                        │   MongoDB   │
                        └─────────────┘
```

## Déploiement

**Backend** : Heroku, Railway, DigitalOcean
**Frontend** : Vercel, Netlify
**Database** : MongoDB Atlas

Variables d'environnement de production requises avec clés Stripe live et JWT_SECRET fort.

## Tests locaux

```bash
# Backend
curl http://localhost:3000/model_porsche

# Frontend
npm run build && npm run preview
```

## Principes de développement

- Architecture MVC (backend) et composants (frontend)
- SOLID : Séparation des responsabilités
- DRY : Code réutilisable (hooks, services, middlewares)
- AGILE : Développement itératif
- Code auto-documenté et commenté

## Problèmes courants

**Backend ne démarre pas** : Vérifier MongoDB lancé et variables .env
**Frontend ne connecte pas** : Vérifier VITE_API_URL et CORS backend
**Erreur paiement** : Vérifier clés Stripe et webhook configuré
