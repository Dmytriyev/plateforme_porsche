# 🚗 Plateforme Porsche - Initialisation de Données

Bienvenue ! Vous avez maintenant accès à un ensemble complet de fichiers pour initialiser rapidement votre base de données MongoDB avec des données de test réalistes.

## 🎯 Démarrage en 30 Secondes

```bash
# Terminal 1: Démarrez le serveur
npm start

# Terminal 2: Lancez l'initialisation automatique
node seed-database.js
```

**C'est tout !** En 1-2 minutes, vous aurez :

- ✅ 3 utilisateurs (admin, conseiller, user)
- ✅ Toutes les couleurs (extérieures, intérieures, accesoires)
- ✅ 5 tailles de jantes
- ✅ 5 voitures avec leurs variantes
- ✅ 9+ accesoires
- ✅ 2 voitures actuelles pour l'utilisateur

## 📁 Fichiers Disponibles

| Fichier                                            | Description                         | Usage                           |
| -------------------------------------------------- | ----------------------------------- | ------------------------------- |
| **`seed-database.js`**                             | Script d'initialisation automatique | `node seed-database.js`         |
| **`seed-data.json`**                               | Données JSON complètes              | Référence/Import programmatique |
| **`csv-data/`**                                    | Fichiers CSV pour import            | MongoDB Compass                 |
| **`Porsche_Platform_API.postman_collection.json`** | Collection Postman                  | Tests API                       |
| **`QUICK_START.md`**                               | Guide de démarrage rapide           | Lecture: 2 min                  |
| **`README_INITIALISATION.md`**                     | Guide complet                       | Lecture: 15 min                 |
| **`GUIDE_POSTMAN.md`**                             | Guide Postman détaillé              | Lecture: 10 min                 |
| **`INDEX_FICHIERS.md`**                            | Index complet                       | Référence                       |
| **`RESUME_VISUEL.txt`**                            | Résumé visuel                       | Vue d'ensemble                  |

## 🔑 Informations de Connexion

| Rôle           | Email                  | Mot de passe   |
| -------------- | ---------------------- | -------------- |
| **Admin**      | admin@porsche.com      | Admin123!      |
| **Conseiller** | conseiller@porsche.com | Conseiller123! |
| **User**       | user@example.com       | User123!       |

## 🚀 Trois Méthodes au Choix

### 1️⃣ Script Automatique ( Recommandé)

La plus rapide, tout est automatisé :

```bash
node seed-database.js
```

### 2️⃣ Postman (🎯 Pour Apprendre)

Idéal pour comprendre l'API :

1. Import → `Porsche_Platform_API.postman_collection.json`
2. Exécutez les requêtes dans l'ordre

### 3️⃣ CSV + MongoDB Compass (📊 Import Basique)

Pour un import rapide de données de base :

- Importez les fichiers du dossier `csv-data/`

## 📊 Données Créées

### Utilisateurs (3)

- 1 Admin (accès complet)
- 1 Conseiller (assistance clients)
- 1 User (client standard)

### Catalogue Voitures

- **3 voitures neuves** : 911, Cayenne, Cayman
- **5 model porsche** : 911 Carrera S, Cayenne E-Hybrid, Cayman GTS, 911 Targa, Cayenne GTS
- **Prix de 95 000€ à 158 500€**

### Options & Personnalisation

- **7 couleurs extérieures** : bleu, black, gray, green, red, white, yellow
- **4 couleurs intérieures** : black, caramel, red, red_white
- **5 tailles de jantes** : 16", 19", 20", 21", 22"

### Accesoires (9)

- **Porte-clés** (35€ - 45€)
- **Casquettes** (55€ - 65€)
- **Décoration** (75€ - 120€)

### Voitures Utilisateur (2)

- 911 Turbo Targa 1975 (collection)
- Cayenne S 2018 (moderne)

## ✅ Vérification Rapide

### Dans MongoDB Compass

Vérifiez le nombre de documents :

- `users` : 3
- `couleur_exterieurs` : 7
- `voitures` : 5
- `model_porsches` : 5
- `accesoires` : 9+

### Avec l'API

```bash
# Login admin
curl -X POST http://localhost:3000/api/users/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@porsche.com","password":"Admin123!"}'

# Voir les voitures
curl http://localhost:3000/api/voiture
```

## 🎬 Scénarios de Test

### User achète un accesoire

1. Login → `POST /api/users/login`
2. Voir accesoires → `GET /api/accesoire`
3. Créer commande → `POST /api/commande`

### User configure une 911 neuve

1. Voir les 911 → `GET /api/model-porsche?nom_model=911`
2. Choisir options → couleurs, jantes, etc.
3. Commander avec acompte → `POST /api/commande`

### Admin ajoute une voiture

1. Login admin
2. Créer voiture → `POST /api/voiture`
3. Créer variante → `POST /api/model-porsche`
4. Ajouter photos → `POST /api/photo-porsche`

## 📚 Documentation

| Fichier                    | Pour Qui             | Temps  |
| -------------------------- | -------------------- | ------ |
| `QUICK_START.md`           | Débutants            | 2 min  |
| `README_INITIALISATION.md` | Tous                 | 15 min |
| `GUIDE_POSTMAN.md`         | Utilisateurs Postman | 10 min |
| `INDEX_FICHIERS.md`        | Référence complète   | -      |
| `RESUME_VISUEL.txt`        | Vue d'ensemble       | 1 min  |

## 🐛 Problèmes Fréquents

**Le script échoue**
→ Vérifiez que le serveur est démarré (`npm start`)

**Erreur 401/403**
→ Reconnectez-vous pour obtenir un nouveau token

**Données déjà existantes**
→ Supprimez les collections dans MongoDB Compass

## 💡 Conseils

1. **Première fois** → Utilisez le script automatique (`seed-database.js`)
2. **Pour apprendre** → Utilisez Postman pour comprendre l'API
3. **Pour développer** → Référez-vous à `seed-data.json` pour la structure
4. **Pour tester** → Utilisez les scénarios dans `GUIDE_POSTMAN.md`

## 🔐 Sécurité

⚠️ **Important** : Ces mots de passe sont pour le développement uniquement !

- En production, utilisez des mots de passe forts
- Activez HTTPS
- Utilisez des variables d'environnement

## 🎓 Fonctionnalités Testables

### Admin Peut :

- ✅ Créer/Modifier/Supprimer voitures
- ✅ Créer/Modifier/Supprimer model porsche
- ✅ Gérer couleurs, jantes, accesoires
- ✅ Voir toutes les commandes/réservations

### User Peut :

- ✅ Créer son compte
- ✅ Ajouter ses voitures actuelles
- ✅ Consulter le catalogue
- ✅ Réserver une voiture d'occasion
- ✅ Commander une voiture neuve (acompte)
- ✅ Acheter des accesoires
- ✅ Annuler réservations/commandes

### Conseiller Peut :

- ✅ Voir les clients
- ✅ Assister les clients
- ✅ Voir les réservations

## 🚀 Prochaines Étapes

1. ✅ Initialisez les données (choisissez une méthode)
2. 🧪 Testez avec Postman
3. 🔍 Vérifiez dans MongoDB Compass
4. 🎨 Personnalisez les données
5. 🏗️ Développez de nouvelles fonctionnalités

---

## 🎯 Commandes Utiles

```bash
# Démarrer le serveur
npm start

# Initialiser la base de données
node seed-database.js

# Nettoyer la base de données
npm run clean

# Créer un admin
npm run create:admin

# Lancer les tests
npm test
```

---

**Bonne initialisation ! 🏁**

Pour toute question, consultez la documentation dans les fichiers MD.
