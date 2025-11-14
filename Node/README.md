# Plateforme Porsche - API Node.js

## Résumé

API REST pour la vente de voitures Porsche (neuves & occasion) et accesoires. Stack : Node.js, Express, MongoDB. Rôles : Admin, Conseiller, User.

## Installation

```bash
npm install
npm start
```

Variables d'environnement : `MONGO_URI`, `JWT_SECRET`, `PORT`

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

- Auth : `/api/users/register`, `/api/users/login`, `/api/users/profile`
- Accesoires : `/api/accesoire`, `/api/couleur-accesoire`, `/api/photo-accesoire`
- Voitures : `/api/voiture`, `/api/model-porsche`, `/api/photo-voiture`, `/api/photo-porsche`
- Options : `/api/couleur-exterieur`, `/api/couleur-interieur`, `/api/taille-jante`
- Voiture user : `/api/model-porsche-actuel`, `/api/photo-voiture-actuel`
- Réservations : `/api/reservation`
- Commandes : `/api/commande`
- Paiement : `/api/payment`

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
POST / api / users / register; // Créer un compte admin
POST / api / users / login; // Se connecter
```

### Gestion des Accesoires

L'admin peut gérer la boutique d'accesoires en 3 étapes :

#### Étape 1 Créer les couleurs d'accesoires

```javascript
POST   /api/couleur-accesoire     // Créer une couleur (ex: noir, rouge)
GET    /api/couleur-accesoire     // Voir toutes les couleurs
PUT    /api/couleur-accesoire/:id // Modifier une couleur
DELETE /api/couleur-accesoire/:id // Supprimer une couleur
```

#### Étape 2 : Créer l'accesoire

```javascript
POST   /api/accesoire     // Créer un accessoire
GET    /api/accesoire     // Voir tous les accesoires
PUT    /api/accesoire/:id // Modifier un accessoire
DELETE /api/accesoire/:id // Supprimer un accessoire
```

#### Étape 3 : Ajouter des photos à l'accesoire

```javascript
POST   /api/photo-accesoire     // Ajouter une photo (liée à l'accessoire et sa couleur)
DELETE /api/photo-accesoire/:id // Supprimer une photo
```

### Gestion des Voitures

#### A. Créer les Options Disponibles (Une seule fois)

Avant de créer des voitures, l'admin doit créer les options :

```javascript
// Couleurs extérieures
POST   /api/couleur-exterieur     // Créer (ex: bleu, noir, rouge)
GET    /api/couleur-exterieur     // Lister
PUT    /api/couleur-exterieur/:id // Modifier
DELETE /api/couleur-exterieur/:id // Supprimer

// Couleurs intérieures
POST   /api/couleur-interieur     // Créer (ex: cuir noir, caramel)
GET    /api/couleur-interieur     // Lister
PUT    /api/couleur-interieur/:id // Modifier
DELETE /api/couleur-interieur/:id // Supprimer

// Tailles de jantes
POST   /api/taille-jante     // Créer (ex: 19", 20", 21")
GET    /api/taille-jante     // Lister
PUT    /api/taille-jante/:id // Modifier
DELETE /api/taille-jante/:id // Supprimer
```

#### B. Gestion des Voitures Neuves

Pour les voitures **neuves**, l'admin gère le catalogue en 3 étapes :

Étape 1 : Créer la voiture de base

```javascript
POST   /api/voiture     // Créer (ex: 911, Cayenne)
GET    /api/voiture     // Voir toutes
PUT    /api/voiture/:id // Modifier
DELETE /api/voiture/:id // Supprimer
```

Étape 2 : Créer les variantes (Model Porsche)

```javascript
POST   /api/model-porsche     // Créer variante (ex: 911 Carrera S)
GET    /api/model-porsche     // Voir toutes
PUT    /api/model-porsche/:id // Modifier
DELETE /api/model-porsche/:id // Supprimer
```

Étape 3 : Ajouter des photos

```javascript
POST   /api/photo-voiture     // Photo générale de la voiture
POST   /api/photo-porsche     // Photo de la variante avec options
DELETE /api/photo-voiture/:id // Supprimer photo
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
POST   /api/model-porsche     // Créer (avec toutes les infos)
GET    /api/model-porsche     // Voir toutes
PUT    /api/model-porsche/:id // Modifier
DELETE /api/model-porsche/:id // Supprimer
```

Étape 2 : Sélectionner les options

- Choisir parmi les couleurs_exterieur existantes
- Choisir parmi les couleurs_interieur existantes
- Choisir parmi les tailles_jante existantes

Étape 3 : Ajouter des photos

```javascript
POST   /api/photo-porsche     // Photo du véhicule d'occasion
DELETE /api/photo-porsche/:id // Supprimer photo
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
POST / api / users / register; // Créer son compte
POST / api / users / login; // Se connecter
GET / api / users / profile; // Voir son profil
PUT / api / users / profile; // Modifier son profil
```

### Ma Voiture Actuelle

L'utilisateur peut ajouter sa propre Porsche :

Étape 1 : Créer sa voiture

```javascript
POST   /api/model-porsche-actuel     // Ajouter ma Porsche
GET    /api/model-porsche-actuel     // Voir mes voitures
PUT    /api/model-porsche-actuel/:id // Modifier
DELETE /api/model-porsche-actuel/:id // Supprimer
```

Étape 2 : Choisir les options

- Sélectionner une couleur_exterieur (créée par admin)
- Sélectionner une couleur_interieur (créée par admin)
- Sélectionner une taille_jante (créée par admin)

Étape 3 : Ajouter des photos

```javascript
POST   /api/photo-voiture-actuel     // Ajouter photo de ma voiture
DELETE /api/photo-voiture-actuel/:id // Supprimer photo
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
POST / api / proposition - vente; // Proposer ma voiture
GET / api / proposition - vente; // Voir mes propositions
```

Note : Pas de vente directe. Un conseiller doit valider.

### Réserver une Voiture d'Occasion

```javascript
POST   /api/reservation     // Réserver une voiture d'occasion
GET    /api/reservation     // Voir mes réservations
DELETE /api/reservation/:id // Annuler une réservation
```

Comment ça marche

1. User trouve une voiture d'occasion qui lui plaît
2. User crée une réservation (48h de délai)
3. User peut annuler tant que ce n'est pas validé

### Passer une Commande

L'utilisateur peut commander de 2 façons :

#### A. Commander une Voiture Neuve (avec acompte)

```javascript
POST / api / commande; // Commander avec acompte (500€)
GET / api / commande; // Voir mes commandes
```

#### B. Acheter des Accessoires

```javascript
POST   /api/commande     // Créer une commande d'accessoires
GET    /api/commande     // Voir mes commandes
DELETE /api/commande/:id // Annuler (avant paiement uniquement)
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
DELETE /api/reservation/:id     // Annuler une réservation
DELETE /api/commande/:id        // Annuler une commande (avant paiement)
```

Important :

- Réservation : Annulable tant que non validée
- Commande : Annulable uniquement avant le paiement

## Fonctionnalités CONSEILLER

```javascript
GET /api/reservation              // Voir toutes les réservations
GET /api/proposition-vente        // Voir propositions de vente
PUT /api/proposition-vente/:id    // Valider/Refuser proposition
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
| User       | user@example.com       | User123!       |

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
