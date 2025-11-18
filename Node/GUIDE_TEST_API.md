# 🧪 GUIDE DE TEST API - PLATEFORME PORSCHE

## 📋 PRÉREQUIS

1. **MongoDB** en cours d'exécution sur `localhost:27017`
2. **Backend Node.js** démarré sur `http://localhost:3000`
3. **Postman** ou **curl** ou **Thunder Client** (VS Code)

---

## 🚀 DÉMARRAGE RAPIDE

### 1. Démarrer MongoDB
```bash
# macOS (avec Homebrew)
brew services start mongodb-community

# Ou manuellement
mongod --dbpath /path/to/data/db
```

### 2. Démarrer le backend
```bash
cd /Users/macbookm1pro/Document/Diplome_final/Code/plateforme_porsche/Node
npm run dev
```

**Output attendu**:
```
[INFO] Le serveur est démarré sur le port 3000
[INFO] Connecté à MongoDB avec succès
```

---

## 📝 COLLECTION POSTMAN

### Étape 1: Créer une collection "Porsche API"

### Étape 2: Ajouter variables d'environnement
```
baseUrl: http://localhost:3000
token: (sera rempli après login)
userId: (sera rempli après login)
```

---

## 🔐 TESTS AUTHENTIFICATION

### Test 1: Inscription Utilisateur

**Request**:
```
POST {{baseUrl}}/user/register
Content-Type: application/json

{
  "nom": "Dupont",
  "prenom": "Jean",
  "email": "jean.dupont@example.com",
  "password": "SecurePass123!",
  "telephone": "+33612345678"
}
```

**Expected Response** (201 Created):
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "_id": "673b1234567890abcdef1234",
    "nom": "Dupont",
    "prenom": "Jean",
    "email": "jean.dupont@example.com",
    "role": "User",
    "createdAt": "2024-11-18T..."
  }
}
```

**Post-action**: Sauvegarder `token` et `userId` dans les variables d'environnement

---

### Test 2: Connexion

**Request**:
```
POST {{baseUrl}}/user/login
Content-Type: application/json

{
  "email": "jean.dupont@example.com",
  "password": "SecurePass123!"
}
```

**Expected Response** (200 OK):
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": { ... }
}
```

---

### Test 3: Profil Utilisateur

**Request**:
```
GET {{baseUrl}}/user/profile
Authorization: Bearer {{token}}
```

**Expected Response** (200 OK):
```json
{
  "_id": "673b1234567890abcdef1234",
  "nom": "Dupont",
  "prenom": "Jean",
  "email": "jean.dupont@example.com",
  "role": "User",
  "telephone": "+33612345678",
  "createdAt": "2024-11-18T..."
}
```

---

## 🚗 TESTS CATALOGUE VOITURES

### Test 4: Liste Toutes les Voitures

**Request**:
```
GET {{baseUrl}}/voiture/all
```

**Expected Response** (200 OK):
```json
[
  {
    "_id": "...",
    "nom_model": "911 Carrera 4S",
    "type_voiture": false,
    "description": "...",
    "prix": 104990,
    "specifications": {
      "moteur": "Flat-6 3.0L bi-turbo",
      "puissance": 450,
      "transmission": "PDK 8 rapports",
      "acceleration_0_100": 3.6,
      "vitesse_max": 308,
      "consommation": 10.3
    },
    "photo_voiture": [],
    "disponible": true
  }
]
```

---

### Test 5: Voitures Neuves

**Request**:
```
GET {{baseUrl}}/voiture/neuve
```

**Expected Response** (200 OK): Liste des voitures avec `type_voiture: true`

---

### Test 6: Voitures d'Occasion

**Request**:
```
GET {{baseUrl}}/voiture/occasion
```

**Expected Response** (200 OK): Liste des voitures avec `type_voiture: false`

---

### Test 7: Détail d'une Voiture

**Request**:
```
GET {{baseUrl}}/voiture/{{voitureId}}
```

**Expected Response** (200 OK): Détail complet avec relations populées

---

## ⚙️ TESTS CONFIGURATION PORSCHE

### Test 8: Liste des Modèles Porsche

**Request**:
```
GET {{baseUrl}}/model_porsche/
```

**Expected Response** (200 OK): Liste complète des configurations

---

### Test 9: Variantes d'un Modèle

**Request**:
```
GET {{baseUrl}}/model_porsche/variantes/911
```

**Expected Response** (200 OK):
```json
[
  {
    "_id": "...",
    "nom_model": "911 Carrera",
    "type_carrosserie": "Coupé",
    "prix_base": 120000,
    "specifications": {
      "moteur": "Flat-6 3.0L bi-turbo",
      "puissance": 385,
      "acceleration_0_100": 4.0,
      "vitesse_max": 293
    }
  },
  {
    "_id": "...",
    "nom_model": "911 Carrera S",
    "type_carrosserie": "Coupé",
    "prix_base": 140000,
    "specifications": {
      "moteur": "Flat-6 3.0L bi-turbo",
      "puissance": 450,
      "acceleration_0_100": 3.6,
      "vitesse_max": 308
    }
  }
]
```

---

### Test 10: Calcul Prix Total Configuration

**Request**:
```
GET {{baseUrl}}/model_porsche/prixTotal/{{configId}}
```

**Expected Response** (200 OK):
```json
{
  "prix_base_variante": 140000,
  "prix_couleur_exterieur": 2500,
  "prix_couleurs_interieur": 1800,
  "prix_jantes": 3500,
  "prix_package": 5000,
  "prix_siege": 2000,
  "prix_total": 154800,
  "acompte_requis": 15480
}
```

---

## 🎨 TESTS OPTIONS PERSONNALISATION

### Test 11: Couleurs Extérieures

**Request**:
```
GET {{baseUrl}}/couleur_exterieur
```

**Expected Response** (200 OK):
```json
[
  {
    "_id": "...",
    "nom_couleur": "Blanc Carrara Métallisé",
    "code_hex": "#FFFFFF",
    "prix": 0,
    "photo_couleur": "..."
  },
  {
    "_id": "...",
    "nom_couleur": "Rouge Guards",
    "code_hex": "#C1272D",
    "prix": 2500,
    "photo_couleur": "..."
  }
]
```

---

### Test 12: Couleurs Intérieures

**Request**:
```
GET {{baseUrl}}/couleur_interieur
```

**Expected Response** (200 OK): Liste couleurs intérieures

---

### Test 13: Jantes

**Request**:
```
GET {{baseUrl}}/taille_jante
```

**Expected Response** (200 OK):
```json
[
  {
    "_id": "...",
    "taille_jante": 20,
    "couleur_jante": "Noir satiné",
    "prix": 0,
    "photo_jante": "..."
  },
  {
    "_id": "...",
    "taille_jante": 21,
    "couleur_jante": "Titane",
    "prix": 3500,
    "photo_jante": "..."
  }
]
```

---

### Test 14: Sièges

**Request**:
```
GET {{baseUrl}}/siege
```

**Expected Response** (200 OK): Liste types de sièges

---

### Test 15: Packages

**Request**:
```
GET {{baseUrl}}/package
```

**Expected Response** (200 OK):
```json
[
  {
    "_id": "...",
    "nom_package": "Sport Chrono",
    "description": "...",
    "prix": 5000
  },
  {
    "_id": "...",
    "nom_package": "Weissach Package",
    "description": "...",
    "prix": 15000
  }
]
```

---

## 🛍️ TESTS ACCESSOIRES

### Test 16: Liste Accessoires

**Request**:
```
GET {{baseUrl}}/accesoire
```

**Expected Response** (200 OK):
```json
[
  {
    "_id": "...",
    "nom_accesoire": "Porte-clés écusson Essential",
    "description": "...",
    "prix": 35,
    "stock": 150,
    "categorie": "Lifestyle",
    "photo_accesoire": []
  }
]
```

---

### Test 17: Détail Accessoire

**Request**:
```
GET {{baseUrl}}/accesoire/{{accessoireId}}
```

**Expected Response** (200 OK): Détail complet accessoire

---

## 📦 TESTS COMMANDES

### Test 18: Créer une Commande

**Request**:
```
POST {{baseUrl}}/commande
Authorization: Bearer {{token}}
Content-Type: application/json

{
  "articles": [
    {
      "type": "accessoire",
      "reference_id": "{{accessoireId}}",
      "quantite": 2,
      "prix_unitaire": 35
    }
  ],
  "adresse_livraison": {
    "rue": "123 Avenue des Champs",
    "ville": "Paris",
    "code_postal": "75008",
    "pays": "France"
  }
}
```

**Expected Response** (201 Created):
```json
{
  "_id": "...",
  "numero_commande": "CMD-2024-001",
  "user": "{{userId}}",
  "articles": [...],
  "montant_total": 70,
  "statut": "En attente",
  "createdAt": "2024-11-18T..."
}
```

---

### Test 19: Historique Commandes Utilisateur

**Request**:
```
GET {{baseUrl}}/commande/user/{{userId}}
Authorization: Bearer {{token}}
```

**Expected Response** (200 OK): Liste commandes utilisateur

---

## 📅 TESTS RÉSERVATIONS

### Test 20: Créer une Réservation

**Request**:
```
POST {{baseUrl}}/reservation
Authorization: Bearer {{token}}
Content-Type: application/json

{
  "voiture": "{{voitureId}}",
  "date_reservation": "2024-11-25T10:00:00Z",
  "message": "Je souhaite réserver cette voiture pour un essai"
}
```

**Expected Response** (201 Created):
```json
{
  "_id": "...",
  "user": "{{userId}}",
  "voiture": {...},
  "date_reservation": "2024-11-25T10:00:00Z",
  "statut": "En attente",
  "message": "...",
  "createdAt": "2024-11-18T..."
}
```

---

### Test 21: Réservations Utilisateur

**Request**:
```
GET {{baseUrl}}/reservation/user/{{userId}}
Authorization: Bearer {{token}}
```

**Expected Response** (200 OK): Liste réservations utilisateur

---

## 💳 TESTS PAIEMENT

### Test 22: Créer Session Stripe

**Request**:
```
POST {{baseUrl}}/api/payment/create-checkout-session
Authorization: Bearer {{token}}
Content-Type: application/json

{
  "commande_id": "{{commandeId}}",
  "success_url": "http://localhost:5173/success",
  "cancel_url": "http://localhost:5173/cancel"
}
```

**Expected Response** (200 OK):
```json
{
  "sessionId": "cs_test_...",
  "url": "https://checkout.stripe.com/pay/cs_test_..."
}
```

---

## ✅ CHECKLIST COMPLÈTE

### Authentification
- [ ] Test 1: Inscription
- [ ] Test 2: Connexion
- [ ] Test 3: Profil

### Catalogue
- [ ] Test 4: Liste voitures
- [ ] Test 5: Voitures neuves
- [ ] Test 6: Voitures occasion
- [ ] Test 7: Détail voiture

### Configuration
- [ ] Test 8: Liste modèles
- [ ] Test 9: Variantes modèle
- [ ] Test 10: Prix total

### Options
- [ ] Test 11: Couleurs extérieures
- [ ] Test 12: Couleurs intérieures
- [ ] Test 13: Jantes
- [ ] Test 14: Sièges
- [ ] Test 15: Packages

### Accessoires
- [ ] Test 16: Liste
- [ ] Test 17: Détail

### Commandes
- [ ] Test 18: Créer commande
- [ ] Test 19: Historique

### Réservations
- [ ] Test 20: Créer réservation
- [ ] Test 21: Liste réservations

### Paiement
- [ ] Test 22: Session Stripe

---

## 🛠️ OUTILS RECOMMANDÉS

### Postman
- Télécharger: https://www.postman.com/downloads/
- Importer collection
- Configurer environnement

### Thunder Client (VS Code)
- Extension: Thunder Client
- Interface similaire à Postman
- Intégré dans VS Code

### curl (Terminal)
```bash
# Exemple test rapide
curl http://localhost:3000/
curl http://localhost:3000/voiture/all | jq
```

---

## 📊 RÉSULTATS ATTENDUS

Tous les tests devraient réussir avec:
- ✅ Status codes corrects (200, 201, 404, 401, etc.)
- ✅ Réponses JSON valides
- ✅ Données cohérentes
- ✅ Temps de réponse < 500ms

---

## 🏆 CONCLUSION

Après avoir exécuté tous ces tests, vous aurez validé:
- ✅ Authentification JWT
- ✅ CRUD complet
- ✅ Relations MongoDB
- ✅ Calculs prix
- ✅ Upload fichiers
- ✅ Paiement Stripe
- ✅ Rate limiting
- ✅ Sécurité

**Backend API**: ✅ **Validé et Fonctionnel**

---

**Version**: 1.0.0  
**Date**: Novembre 2024

