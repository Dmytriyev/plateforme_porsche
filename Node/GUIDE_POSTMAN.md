# Guide d'Utilisation - Initialisation de l'API Porsche avec Postman

## 📋 Vue d'ensemble

Ce guide vous explique comment initialiser votre base de données MongoDB avec les données de test en utilisant Postman et votre API.

## 🔧 Prérequis

1. MongoDB en cours d'exécution
2. Serveur Node.js démarré (`node server.js` ou `npm start`)
3. Postman installé
4. Fichier `seed-data.json` disponible

## 🚀 Étapes d'Initialisation

### Étape 1: Créer les Utilisateurs

#### 1.1 Créer l'Admin

```http
POST http://localhost:3000/api/users/register
Content-Type: application/json

{
  "email": "admin@porsche.com",
  "password": "Admin123!",
  "nom": "Dupont",
  "prenom": "Jean",
  "telephone": "+33612345678",
  "adresse": "15 Avenue des Champs-Élysées",
  "code_postal": "75008",
  "role": "admin"
}
```

#### 1.2 - Créer le Conseiller

```http
POST http://localhost:3000/api/users/register
Content-Type: application/json

{
  "email": "conseiller@porsche.com",
  "password": "Conseiller123!",
  "nom": "Martin",
  "prenom": "Sophie",
  "telephone": "+33612345679",
  "adresse": "22 Rue de Rivoli",
  "code_postal": "75001",
  "role": "conseillere"
}
```

#### 1.3 - Créer l'Utilisateur

```http
POST http://localhost:3000/api/users/register
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "User123!",
  "nom": "Bernard",
  "prenom": "Pierre",
  "telephone": "+33612345680",
  "adresse": "10 Boulevard Saint-Germain",
  "code_postal": "75005",
  "role": "user"
}
```

### Étape 2: Se Connecter en tant qu'Admin

```http
POST http://localhost:3000/api/users/login
Content-Type: application/json

{
  "email": "admin@porsche.com",
  "password": "Admin123!"
}
```

**Important:** Copiez le `token` reçu dans la réponse. Vous devrez l'utiliser pour toutes les requêtes suivantes.

Pour les requêtes suivantes, ajoutez ce header:

```
Authorization: Bearer VOTRE_TOKEN_ICI
```

### Étape 3: Créer les Couleurs Extérieures

```http
POST http://localhost:3000/api/couleur-exterieur
Authorization: Bearer VOTRE_TOKEN
Content-Type: application/json

{
  "nom_couleur": "bleu",
  "photo_couleur": "bleu.jpg",
  "description": "Bleu racing métallisé",
  "prix": 0
}
```

Répétez pour: `black`, `gray`, `green`, `red`, `white`, `yellow`

### Étape 4: Créer les Couleurs Intérieures

```http
POST http://localhost:3000/api/couleur-interieur
Authorization: Bearer VOTRE_TOKEN
Content-Type: application/json

{
  "nom_couleur": "black",
  "photo_couleur": "black_interieur.jpg",
  "description": "Cuir noir classique",
  "prix": 0
}
```

Répétez pour: `caramel`, `red`, `red_white`

### Étape 5: Créer les Tailles de Jantes

```http
POST http://localhost:3000/api/taille-jante
Authorization: Bearer VOTRE_TOKEN
Content-Type: application/json

{
  "taille_jante": "20",
  "couleur_jante": "gray",
  "photo_jante": "jante_20.jpg",
  "description": "Jantes 20 pouces GT gris anthracite",
  "prix": 0
}
```

Répétez pour: `19`, `21`, `22`, `16`

### Étape 6: Créer les Voitures (Modèles de base)

#### 6.1 - Voiture 911 Neuve

```http
POST http://localhost:3000/api/voiture
Authorization: Bearer VOTRE_TOKEN
Content-Type: application/json

{
  "type_voiture": true,
  "nom_model": "911",
  "description": "Quand on imagine une Porsche, c'est généralement elle que l'on a en tête : la 911 est depuis 60 ans l'incarnation même d'une voiture de sport passionnante et puissante, adaptée à un usage au quotidien."
}
```

**Copiez l'ID de la voiture créée (\_id)**

#### 6.2 - Ajouter des Photos à la Voiture 911

```http
POST http://localhost:3000/api/photo-voiture
Authorization: Bearer VOTRE_TOKEN
Content-Type: multipart/form-data

nom_photo: Photo avant 911
alt_photo: Vue avant de la Porsche 911
photo: [Sélectionner le fichier photo_avant_911.jpg]
voiture: [ID_VOITURE_911]
```

Répétez pour les autres photos: `photo_arriere_911`, `photo_phare_911`, etc.

Répétez les étapes 6.1 et 6.2 pour les modèles `Cayenne` et `Cayman`.

### Étape 7: Créer les Model Porsche (Variantes)

#### 7.1 - 911 Carrera S

```http
POST http://localhost:3000/api/model-porsche
Authorization: Bearer VOTRE_TOKEN
Content-Type: application/json

{
  "nom_model": "911 Carrera S",
  "type_carrosserie": "coupe",
  "specifications": {
    "moteur": "Flat 6 3.0l Turbo",
    "puissance": 480,
    "couple": 530,
    "transmission": "PDK 8",
    "acceleration_0_100": 3.5,
    "vitesse_max": 308,
    "consommation": 11
  },
  "description": "Des lignes emblématiques épurées et un bouclier arrière puissant décrivant clairement le caractère.",
  "prix": 158500,
  "acompte": 500
}
```

**Copiez l'ID du model_porsche créé**

#### 7.2 - Ajouter des Photos au Model Porsche

```http
POST http://localhost:3000/api/photo-porsche
Authorization: Bearer VOTRE_TOKEN
Content-Type: multipart/form-data

nom_photo: Photo avant 911 Carrera S
alt_photo: Vue avant de la Porsche 911 Carrera S
photo: [Sélectionner le fichier photo_avant_911_S.jpg]
model_porsche: [ID_MODEL_PORSCHE]
couleur_exterieur: [ID_COULEUR_BLEU]
```

Répétez pour `Cayenne E-Hybrid` et `Cayman GTS`.

### Étape 8: Créer les Couleurs d'Accessoires

```http
POST http://localhost:3000/api/couleur-accesoire
Authorization: Bearer VOTRE_TOKEN
Content-Type: application/json

{
  "nom_couleur": "black",
  "photo_couleur": "black_accesoire.jpg",
  "description": "Noir classique"
}
```

Répétez pour: `black_white`, `bleu_sky`, `caramel`, `gray`, `green`, `red`

### Étape 9: Créer les Accessoires

```http
POST http://localhost:3000/api/accesoire
Authorization: Bearer VOTRE_TOKEN
Content-Type: application/json

{
  "type_accesoire": "porte-clés",
  "nom_accesoire": "Porte-clés écusson noir",
  "description": "Chaque Porsche l'arbore. Pourquoi ne le feriez-vous pas vous aussi ?",
  "prix": 35,
  "couleur_accesoire": "[ID_COULEUR_BLACK]"
}
```

#### 9.2 - Ajouter des Photos aux Accessoires

```http
POST http://localhost:3000/api/photo-accesoire
Authorization: Bearer VOTRE_TOKEN
Content-Type: multipart/form-data

nom_photo: Porte-clés écusson noir
alt_photo: Porte-clés Porsche écusson noir
photo: [Sélectionner le fichier porte_cles_black.jpg]
accesoire: [ID_ACCESSOIRE]
```

### Étape 10: Se Connecter en tant qu'Utilisateur

```http
POST http://localhost:3000/api/users/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "User123!"
}
```

**Copiez le token utilisateur**

### Étape 11: Créer les Voitures Actuelles de l'Utilisateur

```http
POST http://localhost:3000/api/model-porsche-actuel
Authorization: Bearer TOKEN_USER
Content-Type: application/json

{
  "type_model": "Porsche 911 Turbo",
  "type_carrosserie": "targa",
  "annee_production": "1975-01-01",
  "info_moteur": "3.0 litres 260 ch",
  "info_transmission": "manuel",
  "numero_win": "9306700644",
  "couleur_exterieur": "[ID_COULEUR_GREEN]",
  "couleur_interieur": "[ID_COULEUR_CARAMEL]",
  "taille_jante": "[ID_JANTE_16]"
}
```

#### 11.2 - Ajouter une Photo à la Voiture Actuelle

```http
POST http://localhost:3000/api/photo-voiture-actuel
Authorization: Bearer TOKEN_USER
Content-Type: multipart/form-data

nom_photo: Ma 911 Turbo 1975
alt_photo: Porsche 911 Turbo Targa 1975 verte
photo: [Sélectionner le fichier]
model_porsche_actuel: [ID_MODEL_ACTUEL]
```

## 📝 Notes Importantes

### IDs à Remplacer

Lors de l'utilisation de ces requêtes, vous devrez remplacer:

- `[ID_VOITURE_911]` par l'ID de la voiture 911 créée
- `[ID_MODEL_PORSCHE]` par l'ID du model porsche créé
- `[ID_COULEUR_BLEU]` par l'ID de la couleur bleue créée
- `[ID_COULEUR_BLACK]` par l'ID de la couleur noire créée
- `[ID_JANTE_16]` par l'ID de la jante 16 pouces créée
- etc.

### Ordre d'Exécution

L'ordre est crucial car certaines entités dépendent d'autres:

1. **Users** → base pour tout
2. **Couleurs** → nécessaires pour les voitures et accessoires
3. **Jantes** → nécessaires pour les configurations
4. **Voitures** → modèles de base
5. **Model Porsche** → variantes des voitures
6. **Photos** → liées aux entités créées
7. **Accessoires** → avec leurs couleurs
8. **Model Porsche Actuel** → voitures des utilisateurs

### Endpoints Disponibles

#### Authentification

- `POST /api/users/register` - Créer un compte
- `POST /api/users/login` - Se connecter

#### Gestion des Voitures (Admin)

- `POST /api/voiture` - Créer une voiture
- `GET /api/voiture` - Lister les voitures
- `PUT /api/voiture/:id` - Modifier une voiture
- `DELETE /api/voiture/:id` - Supprimer une voiture

#### Gestion des Model Porsche (Admin)

- `POST /api/model-porsche` - Créer un model
- `GET /api/model-porsche` - Lister les models
- `PUT /api/model-porsche/:id` - Modifier un model
- `DELETE /api/model-porsche/:id` - Supprimer un model

#### Gestion des Couleurs (Admin)

- `POST /api/couleur-exterieur` - Créer une couleur extérieure
- `POST /api/couleur-interieur` - Créer une couleur intérieure
- `POST /api/couleur-accesoire` - Créer une couleur d'accessoire

#### Gestion des Accessoires (Admin)

- `POST /api/accesoire` - Créer un accessoire
- `GET /api/accesoire` - Lister les accessoires
- `PUT /api/accesoire/:id` - Modifier un accessoire
- `DELETE /api/accesoire/:id` - Supprimer un accessoire

#### Gestion des Voitures Actuelles (User)

- `POST /api/model-porsche-actuel` - Ajouter sa voiture
- `GET /api/model-porsche-actuel` - Voir ses voitures
- `PUT /api/model-porsche-actuel/:id` - Modifier sa voiture
- `DELETE /api/model-porsche-actuel/:id` - Supprimer sa voiture

#### Gestion des Photos (Admin/User selon contexte)

- `POST /api/photo-voiture` - Ajouter photo voiture
- `POST /api/photo-porsche` - Ajouter photo model porsche
- `POST /api/photo-accesoire` - Ajouter photo accessoire
- `POST /api/photo-voiture-actuel` - Ajouter photo voiture actuelle

#### Réservations (User)

- `POST /api/reservation` - Créer une réservation
- `GET /api/reservation` - Voir ses réservations
- `DELETE /api/reservation/:id` - Annuler une réservation

#### Commandes (User)

- `POST /api/commande` - Créer une commande
- `GET /api/commande` - Voir ses commandes
- `DELETE /api/commande/:id` - Annuler une commande (avant paiement)

## 🔐 Gestion des Permissions

### Admin

- Tous les CRUD sur toutes les entités
- Gestion des utilisateurs
- Gestion du catalogue complet

### Conseiller

- Consultation des réservations
- Assistance aux clients
- Pas de modification du catalogue

### User

- CRUD de son profil
- CRUD de ses voitures actuelles
- Réservations de voitures d'occasion
- Commandes (acomptes voitures neuves, accessoires)
- Annulation de ses réservations/commandes

## 📊 Vérification dans MongoDB Compass

Après l'import, vous pouvez vérifier dans MongoDB Compass:

1. Ouvrir MongoDB Compass
2. Connecter à votre base de données
3. Vérifier les collections:
   - `users` (3 documents)
   - `couleur_exterieurs` (7 documents)
   - `couleur_interieurs` (4 documents)
   - `taille_jantes` (5 documents)
   - `voitures` (5 documents)
   - `model_porsches` (5 documents)
   - `accesoires` (9 documents)
   - `model_porsche_actuels` (2 documents)

## 🎯 Scénarios de Test

### Scénario 1: User achète un accessoire

1. Login en tant que user
2. GET /api/accesoire (voir les accessoires)
3. POST /api/commande (créer commande avec accessoire)
4. POST /api/payment (payer la commande)

### Scénario 2: User réserve une voiture d'occasion

1. Login en tant que user
2. GET /api/model-porsche?type_voiture=false (voir occasions)
3. POST /api/reservation (réserver une voiture)

### Scénario 3: Admin ajoute une nouvelle voiture

1. Login en tant qu'admin
2. POST /api/couleur-exterieur (si nouvelle couleur)
3. POST /api/voiture (créer la voiture de base)
4. POST /api/model-porsche (créer la variante)
5. POST /api/photo-porsche (ajouter les photos)

### Scénario 4: User propose sa voiture en vente

1. Login en tant que user
2. POST /api/model-porsche-actuel (ajouter sa voiture)
3. POST /api/photo-voiture-actuel (ajouter photos)
4. Attente validation conseiller

## 🐛 Dépannage

### Erreur 401 Unauthorized

- Vérifiez que le token est valide
- Reconnectez-vous pour obtenir un nouveau token

### Erreur 403 Forbidden

- Vérifiez que vous avez les bonnes permissions (admin/user)
- Certaines actions nécessitent le rôle admin

### Erreur 400 Bad Request

- Vérifiez que tous les champs requis sont présents
- Vérifiez que les IDs de référence existent

### Erreur 404 Not Found

- Vérifiez l'URL de l'endpoint
- Vérifiez que le serveur est démarré

## 📞 Support

Pour toute question ou problème:

1. Vérifiez les logs du serveur Node.js
2. Vérifiez les données dans MongoDB Compass
3. Consultez la documentation de l'API
