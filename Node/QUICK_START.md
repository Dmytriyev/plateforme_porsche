# Quick Start - Initialisation Rapide

## 3 Méthodes au Choix

### Méthode 1: Script Automatique (LA PLUS RAPIDE)

```bash
# 1. Démarrez votre serveur
npm start

# 2. Dans un autre terminal, lancez le script d'initialisation
node seed-database.js
```

**C'est tout !** Le script va créer automatiquement:

- ✅ 3 utilisateurs (admin, conseiller, user)
- ✅ 7 couleurs extérieures
- ✅ 4 couleurs intérieures
- ✅ 5 tailles de jantes
- ✅ 3 voitures de base
- ✅ 3 model porsche
- ✅ 7 couleurs d'accesoires
- ✅ 6+ accesoires
- ✅ 2 voitures actuelles pour l'utilisateur

---

### Méthode 2 Avec Postman (RECOMMANDÉE POUR TESTER)

1. **Importer la collection**

   - Ouvrez Postman
   - Import → Fichier `Porsche_Platform_API.postman_collection.json`

2. **Exécuter les requêtes dans l'ordre**
   - 1. Authentication → Register Admin, Conseiller, User
   - 2. Authentication → Login Admin
   - 3. Couleurs Extérieures → Créer toutes
   - 4. Couleurs Intérieures → Créer toutes
   - 5. Tailles Jantes → Créer toutes
   - 6. Voitures → Créer 911, Cayenne, Cayman
   - 7. Model Porsche → Créer les variantes
   - 8. Accesoires → Créer couleurs et produits
   - 9. Login User → Créer ses voitures

---

### 📊 Méthode 3: Import CSV dans MongoDB Compass

1. Ouvrez MongoDB Compass
2. Connectez-vous à votre base de données
3. Pour chaque collection, importez le CSV correspondant:
   - `csv-data/users.csv` → Collection `users`
   - `csv-data/couleurs_exterieur.csv` → `couleur_exterieurs`
   - `csv-data/couleurs_interieur.csv` → `couleur_interieurs`
   - `csv-data/tailles_jante.csv` → `taille_jantes`
   - `csv-data/couleurs_accesoire.csv` → `couleur_accesoires`

⚠️ **Limitation**: Les CSV ne contiennent pas les relations (ObjectId)

---

## 🔑 Informations de Connexion

| Rôle       | Email                  | Mot de passe   |
| ---------- | ---------------------- | -------------- |
| Admin      | admin@porsche.com      | Admin123!      |
| Conseiller | conseiller@porsche.com | Conseiller123! |
| User       | user@example.com       | User123!       |

---

## ✅ Vérification

### Dans MongoDB Compass

Comptez les documents dans chaque collection:

- `users`: 3
- `couleur_exterieurs`: 7
- `couleur_interieurs`: 4
- `taille_jantes`: 5
- `voitures`: 3
- `model_porsches`: 3
- `accesoires`: 6+

### Avec l'API (Postman ou cURL)

```bash
# Voir toutes les voitures
curl http://localhost:3000/api/voiture

# Voir tous les accesoires
curl http://localhost:3000/api/accesoire

# Login admin
curl -X POST http://localhost:3000/api/users/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@porsche.com","password":"Admin123!"}'
```

---

## 📚 Documentation Complète

- **`README_INITIALISATION.md`** - Guide complet détaillé
- **`GUIDE_POSTMAN.md`** - Instructions Postman pas à pas
- **`seed-data.json`** - Toutes les données en JSON
- **`seed-database.js`** - Script d'automatisation

---

## 🐛 Problèmes Courants

### Le script échoue

```bash
# Vérifiez que le serveur est démarré
npm start

# Vérifiez que MongoDB est en cours
mongod --version
```

### Erreur 401/403

- Les tokens expirent après un certain temps
- Reconnectez-vous pour obtenir un nouveau token

### Les données existent déjà

- Supprimez les collections dans MongoDB Compass
- Ou utilisez un nouveau nom de base de données

---

## 🎬 Scénarios de Test Rapides

### Test 1: User achète un accesoire

1. Login user (Postman: `Login User`)
2. Voir accesoires (GET `/api/accesoire`)
3. Créer commande (POST `/api/commande`)

### Test 2: Admin ajoute une voiture

1. Login admin (Postman: `Login Admin`)
2. Créer couleur (POST `/api/couleur-exterieur`)
3. Créer voiture (POST `/api/voiture`)
4. Créer model (POST `/api/model-porsche`)

### Test 3: User ajoute sa voiture

1. Login user
2. Créer model actuel (POST `/api/model-porsche-actuel`)
3. Voir ses voitures (GET `/api/model-porsche-actuel`)

---

## 🚀 Prochaines Étapes

1. ✅ Initialisez les données (choisissez une méthode ci-dessus)
2. 🧪 Testez les endpoints avec Postman
3. 🔍 Vérifiez dans MongoDB Compass
4. 🎨 Ajoutez vos propres données
5. 🏗️ Développez de nouvelles fonctionnalités

---

**Bonne initialisation ! 🏁**
