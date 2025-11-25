# Plateforme Porsche - API Node.js

## Résumé

API REST pour la vente de voitures Porsche (neuves & occasion) et accesoires. Stack : Node.js, Express, MongoDB. Rôles : Admin, Conseiller, User.

## Installation

```bash
npm install
npm start
```

Variables d'environnement : `MONGO_URI`, `JWT_SECRET`, `PORT`

Sécurité :

- Installez les dépendances de hardening : `express-mongo-sanitize`, `xss-clean`, `hpp`, `cookie-parser`.
- Veillez à définir la variable d'environnement `SECRET_KEY` ou `JWT_SECRET` (utiliser la même clé partout).

## Architecture Générale

L'application utilise une architecture en 2 niveaux pour gérer les voitures :

```
VOITURE (modèle de base)
    |
    +-- type_voiture: true  -> Voiture NEUVE
    |
    +-- type_voiture: false -> Voiture d'OCCASION
        |
        v
MODEL_PORSCHE (variante spécifique avec caractéristiques)
```

## Authentification

Toutes les routes nécessitent un JWT (sauf register/login) :

```
Authorization: Bearer TOKEN
```

## Rôles

- **Admin** : CRUD complet (catalogue, options, accesoires, photos)
- **Conseiller** : consulter réservations, valider propositions vente
- **User** : profil, réserver, commander, gérer ses voitures

## Endpoints principaux.

- Auth : `/user/register`, `/user/login`, `/user/me`
- Accesoires : `/accesoire`, `/couleur_accesoire`, `/photo_accesoire`
- Voitures : `/voiture`, `/model_porsche`, `/photo_voiture`, `/photo_porsche`
- Options : `/couleur_exterieur`, `/couleur_interieur`, `/taille_jante`, `/siege`, `/package`
- Voiture user : `/model_porsche_actuel`, `/photo_voiture_actuel`
- Réservations : `/reservation`
- Commandes : `/commande`
- Panier : `/api/panier`
- Paiement : `/api/payment`

## Paiement — Checkout Stripe (multi-étapes)

Cette API utilise Stripe Checkout pour les paiements. Le flux est en deux parties :

- Création d'une session Checkout (route protégée) : le serveur construit les `line_items` à partir des `LigneCommande` et retourne l'URL de Stripe Checkout.
- Webhook Stripe : Stripe notifie votre serveur via `/webhook` lorsque la session est complétée ; le serveur marque la `Commande` comme payée, enregistre la `factureUrl` et crée un nouveau panier vide pour l'utilisateur.

Endpoints et exemples

- POST `/api/payment/checkout/:id`
  - Description : Crée une session Stripe Checkout pour la commande `:id` (doit être un panier actif `status: false`).
  - Auth : requis (JWT)
  - Réponse (succès) : `{ id, url, status, customer }` — ouvrez `url` dans un navigateur pour finaliser le paiement.
  - Exemple (curl) :

```
curl -X POST "http://localhost:3000/api/payment/checkout/<COMMANDE_ID>" \
  -H "Authorization: Bearer <TOKEN>" \
  -H "Content-Type: application/json"
```

- POST `/webhook`
  - Description : Endpoint public pour recevoir les webhooks Stripe. Doit utiliser `express.raw({type: 'application/json'})` pour valider la signature.
  - Sécurité : Stripe signe chaque webhook ; la validation requiert `STRIPE_WEBHOOK_SECRET`.
  - Comportement : gère `checkout.session.completed` et met à jour la commande (status, prix, factureUrl).

Variables d'environnement requises

- `STRIPE_SECRET_KEY` : clé secrète Stripe (ex: `sk_test_...`).
- `STRIPE_WEBHOOK_SECRET` : secret pour vérifier la signature des webhooks (fourni par Stripe lors de la configuration du webhook).
- `FRONTEND_URL` : URL du front (utilisée pour `success_url` et `cancel_url`).

Configuration locale pour tester les webhooks

1. Installer la CLI Stripe (recommandé) : https://stripe.com/docs/stripe-cli
2. Dans une console, lancer l'écoute et forward vers votre serveur local :

```bash
stripe login
stripe listen --forward-to localhost:3000/webhook
```

3. Ouvrir la session Checkout renvoyée par l'endpoint de création ; effectuer un paiement en mode test.

Notes et bonnes pratiques

- Idempotence : le service enregistre `stripeSessionId` sur la `Commande` et ignore les webhooks si la commande est déjà marquée payée.
- Sécurité : gardez `STRIPE_SECRET_KEY` et `STRIPE_WEBHOOK_SECRET` hors du repo (fichier `.env` non commité).
- Logs : surveillez les logs pour les erreurs de webhooks et les signatures invalides.
- Production : configurez l'URL `/webhook` dans le dashboard Stripe (endpoint HTTPS) et utilisez `STRIPE_WEBHOOK_SECRET` correspondant.

Étapes recommandées après intégration

- Envoyer un email de confirmation après paiement (utiliser `utils/logger.js` ou un service mail).
- Émettre un événement socket pour mettre à jour l'interface client en temps réel.
- Ajouter des tests unitaires/mocks pour `payment.service.js`.

## Workflows.

- **Voiture neuve** : créer options → `voiture` → `model-porsche` → photos
- **Voiture occasion** : créer `model-porsche` → photos
- **Commander neuve** : configurer → acompte 500€ → livraison
- **Commander accesoires** : créer `commande` → paiement
- **Réserver occasion** : `POST /api/reservation` (délai 48h)

## Structure

```
server.js          # Point d'entrée
controllers/       # Logique métier
models/            # Schémas Mongoose
routes/            # Routes Express
middlewares/       # Auth, rôles, upload
utils/             # Constantes, helpers
```

## Technologies

Node.js, Express, MongoDB, Mongoose, JWT, Bcrypt, Multer, Stripe

## Quickstart

1. Installer :

```bash
npm install
```

2. Variables d'environnement principales :

- `MONGO_URI` : chaîne de connexion MongoDB
- `JWT_SECRET` : secret pour JWT
- `PORT` : port (par défaut 3000)

3. Lancer :

```bash
npm start
# ou en dev : npm run dev
```

## Rôles (résumé)

- Admin : gestion complète du catalogue (voitures, options, accessoires, photos).
- Conseiller : consulter réservations, valider/refuser propositions de vente.
- User : inscrire/éditer profil, réserver, commander, gérer ses voitures.

## Bonnes pratiques

- Créer d'abord les options réutilisables (couleurs, jantes).
- Séparer photos générales (`photo-voiture`) et photos par variante/options (`photo-porsche`).
- Les propositions de vente utilisateur nécessitent validation par un conseiller.

## Structure du projet

- `server.js` : point d'entrée
- `controllers/` : logique métier
- `models/` : schémas Mongoose
- `routes/` : routes Express
- `middlewares/` : auth, rôles, upload
- `utils/` : constantes et helpers

## Résumé

Cette API REST permet de gérer le catalogue (voitures neuves & d'occasion), une boutique d'accesoires, les réservations et les commandes. Le projet utilise Node.js, Express et MongoDB. Les trois rôles principaux sont : Admin, Conseiller et User.

## Fonctionnalités ADMIN

### Authentification

```javascript
POST / user / register; // Créer un compte admin
POST / user / login; // Se connecter
```

### Gestion des Accesoires

L'admin peut gérer la boutique d'accesoires en 3 étapes :

#### Étape 1 Créer les couleurs d'accesoires

```javascript
POST   /couleur_accesoire     // Créer une couleur (ex: noir, rouge)
GET    /couleur_accesoire     // Voir toutes les couleurs
PUT    /couleur_accesoire/:id // Modifier une couleur
DELETE /couleur_accesoire/:id // Supprimer une couleur
```

#### Étape 2 : Créer l'accesoire

```javascript
POST   /accesoire     // Créer un accessoire
GET    /accesoire     // Voir tous les accesoires
PUT    /accesoire/:id // Modifier un accessoire
DELETE /accesoire/:id // Supprimer un accessoire
```

#### Étape 3 : Ajouter des photos à l'accesoire

```javascript
POST   /photo_accesoire     // Ajouter une photo (liée à l'accessoire et sa couleur)
DELETE /photo_accesoire/:id // Supprimer une photo
```

### Gestion des Voitures

#### A. Créer les Options Disponibles (Une seule fois)

Avant de créer des voitures, l'admin doit créer les options :

```javascript
// Couleurs extérieures
POST   /couleur_exterieur     // Créer (ex: bleu, noir, rouge)
GET    /couleur_exterieur     // Lister
PUT    /couleur_exterieur/:id // Modifier
DELETE /couleur_exterieur/:id // Supprimer

// Couleurs intérieures
POST   /couleur_interieur     // Créer (ex: cuir noir, caramel)
GET    /couleur_interieur     // Lister
PUT    /couleur_interieur/:id // Modifier
DELETE /couleur_interieur/:id // Supprimer

// Tailles de jantes
POST   /taille_jante     // Créer (ex: 19", 20", 21")
GET    /taille_jante     // Lister
PUT    /taille_jante/:id // Modifier
DELETE /taille_jante/:id // Supprimer
```

#### B. Gestion des Voitures Neuves

Pour les voitures **neuves**, l'admin gère le catalogue en 3 étapes :

Étape 1 : Créer la voiture de base

```javascript
POST   /voiture     // Créer (ex: 911, Cayenne)
GET    /voiture     // Voir toutes
PUT    /voiture/:id // Modifier
DELETE /voiture/:id // Supprimer
```

Étape 2 : Créer les variantes (Model Porsche)

```javascript
POST   /model_porsche     // Créer variante (ex: 911 Carrera S)
GET    /model_porsche     // Voir toutes
PUT    /model_porsche/:id // Modifier
DELETE /model_porsche/:id // Supprimer
```

Étape 3 : Ajouter des photos

```javascript
POST   /photo_voiture     // Photo générale de la voiture
POST   /photo_porsche     // Photo de la variante avec options
DELETE /photo_voiture/:id // Supprimer photo
```

Exemple : Ajouter une 911 neuve

```
1. Créer voiture "911" (modèle de base)
2. Créer model-porsche "911 Carrera S" (variante)
   → Lier aux couleurs disponibles
   → Lier aux jantes disponibles
3. Ajouter photos de la 911 Carrera S
   → Photo avec couleur bleue
   → Photo avec intérieur noir
   → Photo avec jantes 20"
```

#### C. Gestion des Voitures d'Occasion

Pour les voitures **d'occasion**, c'est plus simple :

Étape 1 : Créer le model porsche d'occasion

```javascript
POST   /model_porsche     // Créer (avec toutes les infos)
GET    /model_porsche     // Voir toutes
PUT    /model_porsche/:id // Modifier
DELETE /model_porsche/:id // Supprimer
```

Étape 2 : Sélectionner les options

- Choisir parmi les couleurs_exterieur existantes
- Choisir parmi les couleurs_interieur existantes
- Choisir parmi les tailles_jante existantes

Étape 3 : Ajouter des photos

```javascript
POST   /photo_porsche     // Photo du véhicule d'occasion
DELETE /photo_porsche/:id // Supprimer photo
```

Exemple : Ajouter une 911 Targa d'occasion

```
1. Créer model-porsche "911 Targa 1985"
   → Sélectionner couleur_exterieur "vert" (déjà créée)
   → Sélectionner couleur_interieur "caramel" (déjà créée)
   → Sélectionner taille_jante "16 pouces" (déjà créée)
2. Ajouter photos de cette 911 spécifique
```

## Fonctionnalités USER

### Compte Utilisateur

```javascript
POST / user / register; // Créer son compte
POST / user / login; // Se connecter
GET / user / me; // Voir son profil
PUT / user / me; // Modifier son profil
```

### Ma Voiture Actuelle

L'utilisateur peut ajouter sa propre Porsche :

Étape 1 : Créer sa voiture

```javascript
POST   /model_porsche_actuel     // Ajouter ma Porsche
GET    /model_porsche_actuel     // Voir mes voitures
PUT    /model_porsche_actuel/:id // Modifier
DELETE /model_porsche_actuel/:id // Supprimer
```

Étape 2 : Choisir les options

- Sélectionner une couleur_exterieur (créée par admin)
- Sélectionner une couleur_interieur (créée par admin)
- Sélectionner une taille_jante (créée par admin)

Étape 3 : Ajouter des photos

```javascript
POST   /photo_voiture_actuel     // Ajouter photo de ma voiture
DELETE /photo_voiture_actuel/:id // Supprimer photo
```

Exemple : Ajouter ma 911 Turbo 1975

```
1. Créer model-porsche-actuel "911 Turbo 1975"
   → Choisir couleur verte
   → Choisir intérieur caramel
   → Choisir jantes 16"
2. Ajouter photos de ma voiture
```

### Proposer Ma Voiture en Vente

```javascript
POST / proposition - vente; // Proposer ma voiture
GET / proposition - vente; // Voir mes propositions
```

Note : Pas de vente directe. Un conseiller doit valider.

### Réserver une Voiture d'Occasion

```javascript
POST   /reservation     // Réserver une voiture d'occasion
GET    /reservation     // Voir mes réservations
DELETE /reservation/:id // Annuler une réservation
```

Comment ça marche

1. User trouve une voiture d'occasion qui lui plaît
2. User crée une réservation (48h de délai)
3. User peut annuler tant que ce n'est pas validé

### Passer une Commande

L'utilisateur peut commander de 2 façons :

#### A. Commander une Voiture Neuve (avec acompte)

```javascript
POST /
  commande /
  new // Commander avec acompte (500€)
  GET() /
  commande /
  historique; // Voir mes commandes
```

#### B. Acheter des Accessoires

```javascript
POST   /commande/new          // Créer une commande d'accessoires
GET    /commande/historique   // Voir mes commandes
DELETE /commande/delete/:id   // Annuler (avant paiement uniquement)
```

Panier d'accessoires :

```javascript
{
  "lignes_commande": [
    { "accesoire": "id_porte_cles", "quantite": 2 },
    { "accesoire": "id_casquette", "quantite": 1 }
  ]
}
```

### Annulation

```javascript
DELETE /reservation/:id        // Annuler une réservation
DELETE /commande/delete/:id    // Annuler une commande (avant paiement)
```

Important :

- Réservation : Annulable tant que non validée
- Commande : Annulable uniquement avant le paiement

## Fonctionnalités CONSEILLER

```javascript
GET /reservation              // Voir toutes les réservations
GET /proposition-vente        // Voir propositions de vente
PUT /proposition-vente/:id    // Valider/Refuser proposition
```

## Structure des Données

Relations Importantes

```
Voiture Neuve:
  Voiture (base)
    └─► Model_porsche (variantes)
         ├─► Couleur_exterieur (options)
         ├─► Couleur_interieur (options)
         ├─► Taille_jante (options)
         └─► Photo_porsche

Voiture Occasion:
  Model_porsche
    ├─► Couleur_exterieur (fixe)
    ├─► Couleur_interieur (fixe)
    ├─► Taille_jante (fixe)
    └─► Photo_porsche

Accessoire:
  Accessoire
    ├─► Couleur_accesoire
    └─► Photo_accesoire

User:
  User
    └─► Model_porsche_actuel (sa voiture)
         ├─► Couleur_exterieur (options admin)
         ├─► Couleur_interieur (options admin)
         ├─► Taille_jante (options admin)
         └─► Photo_voiture_actuel
```

### Comptes de Test

| Rôle       | Email                  | Mot de passe   |
| ---------- | ---------------------- | -------------- |
| Admin      | admin@porsche.com      | Admin123!      |
| Conseiller | conseiller@porsche.com | Conseiller123! |
| User       | user@gmail.com         | User123!       |

---

## Questions Fréquentes

**Q : Quelle est la différence entre Voiture et Model_porsche ?**  
R : `Voiture` = Modèle de base (911, Cayenne). `Model_porsche` = Variante spécifique (911 Carrera S, 911 Turbo).

**Q : Pourquoi créer les couleurs séparément ?**  
R : Pour réutiliser les mêmes couleurs sur plusieurs voitures sans duplication.

**Q : Un user peut vendre directement sa voiture ?**  
R : Non, il peut seulement proposer. Un conseiller doit valider.

**Q : Peut-on annuler une commande après paiement ?**  
R : Non, uniquement avant le paiement. Après, contacter le conseiller.

**Q : Combien de temps dure une réservation ?**  
R : 48 heures par défaut, le conseiller contacte le client.
