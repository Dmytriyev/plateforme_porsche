# 🎓 Architecture du Projet Expliquée (Pour Étudiants)

> Guide pédagogique pour comprendre comment fonctionne une API Node.js avec MongoDB selon les principes SOLID et AGILE

---

## 📚 Table des Matières

1. [Vue d'ensemble](#-vue-densemble)
2. [Les Middlewares](#-les-middlewares)
3. [Les Utils](#️-les-utils)
4. [Le Flux d'une Requête](#-le-flux-dune-requête)
5. [Exemples Concrets](#-exemples-concrets)

---

## 🌐 Vue d'ensemble

### Comment fonctionne le projet ?

```
CLIENT (Navigateur/App Mobile)
    ↓
    📨 Requête HTTP (GET, POST, PUT, DELETE)
    ↓
SERVER.JS (Point d'entrée)
    ↓
MIDDLEWARES (Vérifications)
    ↓
ROUTES (Aiguillage)
    ↓
CONTROLLERS (Logique métier)
    ↓
MODELS (Base de données)
    ↓
    📤 Réponse JSON
    ↓
CLIENT
```

### Architecture MVC (Model-View-Controller)

```
📁 Node/
├── 🎯 server.js              → Démarre le serveur
├── 🛣️  routes/               → Définit les URLs (GET /users, POST /login...)
├── 🎮 controllers/           → Contient la logique métier
├── 📦 models/                → Définit la structure des données (MongoDB)
├── 🛡️  middlewares/          → Intercepte et vérifie les requêtes
├── 🔧 utils/                 → Fonctions réutilisables (helpers)
└── ✅ validations/           → Valide les données (Joi)
```

---

## 🛡️ Les Middlewares

### Qu'est-ce qu'un middleware ?

Un **middleware** est une fonction qui s'exécute **ENTRE** la réception de la requête et l'exécution du controller.

**Analogie** : C'est comme un agent de sécurité à l'entrée d'une boîte de nuit 🕴️

- Il vérifie ta carte d'identité (authentification)
- Il vérifie que tu as le droit d'entrer (autorisation)
- Si tout est OK, tu passes → `next()`
- Sinon, tu es refoulé → `return res.status(403)`

---

### 1. `auth.js` - Vérifier l'identité

**Rôle** : Vérifie que l'utilisateur est connecté (token JWT valide)

```javascript
// middlewares/auth.js
const auth = (req, res, next) => {
  // 1. Récupère le token dans les headers
  const token = req.headers["authorization"]?.split(" ")[1];

  // 2. Si pas de token → STOP
  if (!token) {
    return res.status(401).json({ message: "Tu n'es pas connecté" });
  }

  // 3. Vérifie le token avec JWT
  jwt.verify(token, process.env.SECRET_KEY, (err, user) => {
    if (err) {
      return res.status(403).json({ message: "Token invalide" });
    }

    // 4. Ajoute les infos utilisateur dans req
    req.user = user; // { id: "123", email: "...", isAdmin: false }

    // 5. Continue vers le controller
    next();
  });
};
```

**Où l'utiliser ?**

```javascript
// routes/user.route.js
router.get("/profile", auth, getUserProfile);
//                     ^^^^
//                     Le middleware s'exécute AVANT getUserProfile
```

**Ordre d'exécution** :

```
Requête → auth → getUserProfile → Réponse
```

---

### 2. `isAdmin.js` - Vérifier les permissions

**Rôle** : Vérifie que l'utilisateur est administrateur

```javascript
// middlewares/isAdmin.js
const isAdmin = (req, res, next) => {
  // 1. Vérifie si req.user.isAdmin existe (ajouté par auth.js)
  if (!req.user?.isAdmin) {
    return res.status(403).json({
      message: "Réservé aux admins",
    });
  }

  // 2. Continue si admin
  next();
};
```

**Où l'utiliser ?**

```javascript
// routes/user.route.js
router.get("/all", auth, isAdmin, getAllUsers);
//                 ^^^^  ^^^^^^^
//                 1er   2ème middleware
```

**Ordre d'exécution** :

```
Requête → auth → isAdmin → getAllUsers → Réponse
```

⚠️ **Important** : `isAdmin` doit **toujours** être après `auth` car il a besoin de `req.user`

---

### 3. `validateObjectId.js` - Valider les IDs

**Rôle** : Vérifie que l'ID MongoDB est valide (protection contre les injections NoSQL)

```javascript
// middlewares/validateObjectId.js
const validateObjectId = (paramName = "id") => {
  return (req, res, next) => {
    const id = req.params[paramName]; // Ex: /users/123abc

    // Vérifie le format MongoDB (24 caractères hexadécimaux)
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        message: "ID invalide",
      });
    }

    next();
  };
};
```

**Où l'utiliser ?**

```javascript
// routes/user.route.js
router.get("/:id", auth, validateObjectId("id"), getUserById);
//                       ^^^^^^^^^^^^^^^^^^^^^^
//                       Valide req.params.id
```

**Ordre d'exécution** :

```
GET /users/123abc
    ↓
auth → validateObjectId → getUserById → Réponse
```

---

### 4. `multer.js` - Gérer les fichiers (images)

**Rôle** : Upload et stockage des images

```javascript
// middlewares/multer.js
import multer from "multer";

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/"); // Stocke dans /uploads
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + "-" + file.originalname); // Nom unique
  },
});

const upload = multer({ storage });
```

**Où l'utiliser ?**

```javascript
// routes/photo_porsche.route.js
router.post("/upload", auth, upload.single("photo"), createPhoto);
//                           ^^^^^^^^^^^^^^^^^^^^
//                           Gère l'upload de 1 image
```

---

### 5. `permissions.js` - Gestion avancée des droits

**Rôle** : Vérifie si l'utilisateur peut modifier/supprimer ses propres données

```javascript
// middlewares/permissions.js
const canModifyOwn = (req, res, next) => {
  // Admin → peut tout faire
  if (req.user.isAdmin) {
    return next();
  }

  // Utilisateur → peut seulement modifier ses propres données
  if (req.user.id === req.params.id) {
    return next();
  }

  // Sinon → interdit
  return res.status(403).json({
    message: "Tu ne peux pas modifier les données d'un autre utilisateur",
  });
};
```

---

## 🔧 Les Utils

### Qu'est-ce qu'un util ?

Un **util** (utilitaire) est une **fonction réutilisable** qui effectue une tâche spécifique.

**Analogie** : C'est comme une boîte à outils 🧰

- Tu as besoin de calculer un prix ? → `prixCalculator.js`
- Tu as besoin de gérer une erreur ? → `errorHandler.js`
- Tu as besoin de formater une date ? → `date.js`

---

### 1. `errorHandler.js` - Gérer les erreurs

**Rôle** : Centralise la gestion des erreurs pour éviter la répétition de code

#### ❌ Sans errorHandler (Code répétitif)

```javascript
// couleur_exterieur.controller.js
const createCouleur = async (req, res) => {
  try {
    // ...
  } catch (error) {
    // Répété dans CHAQUE fonction
    if (error.name === "ValidationError") {
      return res.status(400).json({ message: "Données invalides" });
    }
    if (error.code === 11000) {
      return res.status(409).json({ message: "Déjà existant" });
    }
    return res.status(500).json({ message: "Erreur serveur" });
  }
};
```

#### ✅ Avec errorHandler (DRY - Don't Repeat Yourself)

```javascript
import { handleError } from "../utils/errorHandler.js";

const createCouleur = async (req, res) => {
  try {
    // ...
  } catch (error) {
    // Une seule ligne !
    return handleError(res, error, "createCouleur");
  }
};
```

**Comment ça marche ?**

```javascript
// utils/errorHandler.js
export const handleError = (res, error, context) => {
  // Erreur de validation Mongoose
  if (error.name === "ValidationError") {
    return res.status(400).json({ message: "Données invalides" });
  }

  // Erreur de duplication (unique constraint)
  if (error.code === 11000) {
    return res.status(409).json({ message: "Déjà existant" });
  }

  // Erreur générique
  return res.status(500).json({ message: "Erreur serveur" });
};
```

**Où l'utiliser ?**

Dans **TOUS les controllers**, dans le bloc `catch` :

```javascript
} catch (error) {
    return handleError(res, error, "nomDeLaFonction");
}
```

---

### 2. `prixCalculator.js` - Calculer les prix

**Rôle** : Calcule le prix total d'une Porsche avec toutes ses options

**Problème** : Une Porsche a plusieurs options (couleur, jantes, intérieur...) et on doit calculer le prix total.

```javascript
// utils/prixCalculator.js
export const calculerPrixTotalModelPorsche = async (voitureId) => {
  // 1. Récupère la voiture et ses options
  const modelPorsche = await Model_porsche.findOne({ voiture: voitureId })
    .populate("voiture", "prix") // Prix de base
    .populate("couleur_exterieur", "prix") // +500€
    .populate("couleur_interieur", "prix") // +300€
    .populate("taille_jante", "prix"); // +1200€

  // 2. Additionne tout
  const prixBase = modelPorsche.voiture?.prix || 0;
  const prixOptions = prixCouleurExt + prixCouleurInt + prixJante;

  // 3. Retourne le détail
  return {
    prix_base: prixBase, // Ex: 80000€
    prix_options: prixOptions, // Ex: 2000€
    prix_total: prixBase + prixOptions, // Ex: 82000€
  };
};
```

**Où l'utiliser ?**

```javascript
// controllers/model_porsche.controller.js
import { calculerPrixTotalModelPorsche } from "../utils/prixCalculator.js";

const getModelWithPrice = async (req, res) => {
  // Appelle l'utilitaire
  const prixDetails = await calculerPrixTotalModelPorsche(req.params.id);

  return res.status(200).json(prixDetails);
};
```

---

### 3. `ligneCommande.js` - Calculs de panier

**Rôle** : Calcule le total du panier (voitures + accessoires)

**Complexité** : Les voitures neuves ont un acompte, les accessoires ont un prix fixe.

```javascript
// utils/ligneCommande.js
export const calculerTotalPanier = (lignesCommande) => {
  return lignesCommande.reduce((total, ligne) => {
    let prix = 0;

    // Si c'est une voiture neuve → utilise l'acompte
    if (ligne.type_produit && ligne.acompte > 0) {
      prix = ligne.acompte * ligne.quantite;
    }
    // Si c'est un accessoire → utilise le prix
    else {
      prix = ligne.prix * ligne.quantite;
    }

    return total + prix;
  }, 0);
};
```

**Où l'utiliser ?**

```javascript
// controllers/Commande.controller.js
import { calculerTotalPanier } from "../utils/ligneCommande.js";

const getPanier = async (req, res) => {
  const lignes = await LigneCommande.find({ commande: panierId });

  // Utilise l'utilitaire
  const total = calculerTotalPanier(lignes);

  return res.json({ lignes, total });
};
```

---

### 4. `responses.js` - Réponses standardisées

**Rôle** : Uniformise le format des réponses API

```javascript
// utils/responses.js
export const successResponse = (res, data, message = "Succès") => {
  return res.status(200).json({
    success: true,
    message,
    data,
  });
};

export const errorResponse = (res, message, statusCode = 400) => {
  return res.status(statusCode).json({
    success: false,
    message,
  });
};
```

**Où l'utiliser ?**

```javascript
// controllers/user.controller.js
import { successResponse, errorResponse } from "../utils/responses.js";

const getUser = async (req, res) => {
  const user = await User.findById(req.params.id);

  if (!user) {
    return errorResponse(res, "Utilisateur introuvable", 404);
  }

  return successResponse(res, user, "Utilisateur trouvé");
};
```

---

## 🌊 Le Flux d'une Requête

### Exemple Complet : Récupérer un utilisateur

```javascript
// 1. CLIENT envoie la requête
GET http://localhost:3000/api/users/507f1f77bcf86cd799439011
Headers: Authorization: Bearer eyJhbGc...token...
```

```javascript
// 2. server.js reçoit la requête
app.use("/api/users", userRoutes);
//                    ↓
// 3. routes/user.route.js aiguille
router.get("/:id", auth, validateObjectId("id"), getUserById);
//                 ↓      ↓                       ↓
//                 MW1    MW2                     Controller
```

**Étape par étape** :

### MIDDLEWARE 1 : `auth`

```javascript
// middlewares/auth.js
const auth = (req, res, next) => {
  const token = req.headers["authorization"]?.split(" ")[1];

  if (!token) {
    // ❌ STOP : Pas de token
    return res.status(401).json({ message: "Non autorisé" });
  }

  jwt.verify(token, SECRET_KEY, (err, user) => {
    if (err) {
      // ❌ STOP : Token invalide
      return res.status(403).json({ message: "Token invalide" });
    }

    // ✅ OK : Ajoute les infos utilisateur
    req.user = { id: "507f...", email: "...", isAdmin: false };

    // Continue vers le prochain middleware
    next();
  });
};
```

### MIDDLEWARE 2 : `validateObjectId`

```javascript
// middlewares/validateObjectId.js
const validateObjectId = (paramName) => {
  return (req, res, next) => {
    const id = req.params.id; // "507f1f77bcf86cd799439011"

    if (!mongoose.Types.ObjectId.isValid(id)) {
      // ❌ STOP : ID invalide
      return res.status(400).json({ message: "ID invalide" });
    }

    // ✅ OK : Continue
    next();
  };
};
```

### CONTROLLER : `getUserById`

```javascript
// controllers/user.controller.js
const getUserById = async (req, res) => {
  try {
    // 1. Vérifie les permissions (propriétaire ou admin)
    if (req.user.id !== req.params.id && !req.user.isAdmin) {
      return res.status(403).json({ message: "Accès refusé" });
    }

    // 2. Cherche l'utilisateur dans MongoDB
    const user = await User.findById(req.params.id).select("-password");

    // 3. Vérifie s'il existe
    if (!user) {
      return res.status(404).json({ message: "Utilisateur introuvable" });
    }

    // 4. ✅ Renvoie l'utilisateur
    return res.status(200).json(user);
  } catch (error) {
    // 5. Utilise errorHandler pour gérer l'erreur
    return handleError(res, error, "getUserById");
  }
};
```

**Résumé du flux** :

```
CLIENT
  ↓ GET /users/507f...
server.js
  ↓ /api/users → userRoutes
routes/user.route.js
  ↓ /:id → auth, validateObjectId, getUserById
  ↓
auth (✅ Token valide)
  ↓
validateObjectId (✅ ID valide)
  ↓
getUserById (✅ User trouvé)
  ↓
Réponse JSON
  ↓
CLIENT
```

---

## 🎯 Exemples Concrets

### Exemple 1 : Créer un accessoire (Admin seulement)

```javascript
// routes/accesoire.route.js
router.post("/new", auth, isAdmin, createAccessoire);
//                  ^^^^  ^^^^^^^  ^^^^^^^^^^^^^^^^
//                  MW1   MW2      Controller
```

**Flux** :

```
POST /api/accessoires/new
Body: { nom: "Roue carbone", prix: 5000 }
  ↓
1. auth → Vérifie le token
  ↓ req.user = { id: "...", isAdmin: true }
  ↓
2. isAdmin → Vérifie si admin
  ↓ ✅ req.user.isAdmin === true
  ↓
3. createAccessoire → Crée l'accessoire
  ↓
Réponse: { _id: "...", nom: "Roue carbone", prix: 5000 }
```

---

### Exemple 2 : Ajouter une photo à une Porsche

```javascript
// routes/photo_porsche.route.js
router.post("/upload", auth, upload.single("photo"), createPhoto);
//                     ^^^^  ^^^^^^^^^^^^^^^^^^^^^   ^^^^^^^^^^^
//                     MW1   MW2 (multer)            Controller
```

**Flux** :

```
POST /api/photos/upload
Form-data: photo = [fichier.jpg]
  ↓
1. auth → Vérifie le token
  ↓
2. upload.single("photo") → Upload le fichier
  ↓ req.file = { filename: "123-porsche.jpg", path: "uploads/..." }
  ↓
3. createPhoto → Enregistre en base
  ↓
Réponse: { _id: "...", name: "123-porsche.jpg", path: "..." }
```

---

### Exemple 3 : Calculer le total du panier

```javascript
// controllers/Commande.controller.js
import { calculerTotalPanier } from "../utils/ligneCommande.js";

const getPanier = async (req, res) => {
  try {
    // 1. Récupère le panier de l'utilisateur
    const panier = await Commande.findOne({
      user: req.user.id,
      status: true,
    });

    // 2. Récupère les lignes du panier
    const lignes = await LigneCommande.find({ commande: panier._id })
      .populate("voiture", "nom_model prix")
      .populate("accesoire", "nom_accesoire prix");

    // 3. ✅ Utilise l'utilitaire pour calculer le total
    const total = calculerTotalPanier(lignes);

    // 4. Renvoie les données
    return res.status(200).json({
      panier,
      lignes,
      total,
    });
  } catch (error) {
    return handleError(res, error, "getPanier");
  }
};
```

---

## 🎓 Principes SOLID Appliqués

### 1. **S - Single Responsibility Principle**

Chaque fichier a **une seule responsabilité** :

- `auth.js` → Authentification uniquement
- `isAdmin.js` → Vérification admin uniquement
- `errorHandler.js` → Gestion erreurs uniquement

### 2. **O - Open/Closed Principle**

Les utils sont **ouverts à l'extension, fermés à la modification** :

- Tu peux ajouter de nouvelles fonctions dans `prixCalculator.js`
- Sans modifier les fonctions existantes

### 3. **L - Liskov Substitution Principle**

Les middlewares peuvent être **interchangeables** :

```javascript
router.get("/profile", auth, getUserProfile);
router.get("/profile", auth, isAdmin, getUserProfile); // Ajoute isAdmin
```

### 4. **I - Interface Segregation Principle**

Chaque middleware fait **une seule chose** :

- `auth` ne vérifie PAS si tu es admin
- `isAdmin` ne vérifie PAS le token
- Chacun a son rôle

### 5. **D - Dependency Inversion Principle**

Les controllers **dépendent des abstractions** (utils) :

```javascript
// ❌ Mauvais : Code dupliqué dans chaque controller
const total = lignes.reduce((sum, l) => sum + l.prix * l.quantite, 0);

// ✅ Bon : Dépend de l'utilitaire
const total = calculerTotalPanier(lignes);
```

---

## 🚀 Principes AGILE Appliqués

### 1. **Itérations courtes**

- Chaque middleware est **petit et testable**
- Chaque util est **indépendant**

### 2. **Collaboration**

- Les middlewares **travaillent ensemble** en chaîne
- Les utils sont **partagés** entre les controllers

### 3. **Amélioration continue**

- Ajout de `errorHandler.js` pour **éviter la répétition**
- Ajout de `prixCalculator.js` pour **centraliser les calculs**

### 4. **Code propre (Clean Code)**

- Noms explicites : `auth`, `isAdmin`, `validateObjectId`
- Fonctions courtes : chaque middleware = 10-20 lignes
- DRY : Pas de duplication

---

## 📝 Résumé

### Middlewares (dossier `middlewares/`)

| Fichier               | Rôle                                    | Où l'utiliser                |
| --------------------- | --------------------------------------- | ---------------------------- |
| `auth.js`             | Vérifie le token JWT                    | Toutes les routes protégées  |
| `isAdmin.js`          | Vérifie si admin                        | Routes admin uniquement      |
| `validateObjectId.js` | Valide les IDs MongoDB                  | Routes avec paramètres `:id` |
| `multer.js`           | Upload de fichiers                      | Routes d'upload d'images     |
| `permissions.js`      | Vérifie les droits (propriétaire/admin) | Routes de modification       |

### Utils (dossier `utils/`)

| Fichier             | Rôle                      | Où l'utiliser                         |
| ------------------- | ------------------------- | ------------------------------------- |
| `errorHandler.js`   | Gère les erreurs          | Dans tous les `catch` des controllers |
| `prixCalculator.js` | Calcule les prix          | Controllers de voitures/commandes     |
| `ligneCommande.js`  | Calcule les totaux panier | Controller Commande                   |
| `responses.js`      | Réponses standardisées    | Tous les controllers (optionnel)      |
| `date.js`           | Formate les dates         | Controllers avec des dates            |

### Ordre des Middlewares (Important !)

```javascript
router.get(
  "/route",
  auth, // 1. Toujours en premier
  validateObjectId, // 2. Validation
  isAdmin, // 3. Permissions
  controller // 4. Logique métier
);
```

---

## 💡 Conseils pour Apprendre

1. **Commence par les middlewares** : Comprends `auth.js` et `isAdmin.js`
2. **Trace le flux** : Utilise `console.log()` pour voir l'ordre d'exécution
3. **Teste les erreurs** : Envoie un mauvais token pour voir `auth.js` en action
4. **Lis les utils** : Regarde comment `errorHandler.js` simplifie le code
5. **Modifie progressivement** : Ajoute un nouveau middleware pour apprendre

---

## 🎉 Félicitations !

Tu comprends maintenant :

- ✅ Comment les **middlewares** interceptent les requêtes
- ✅ Comment les **utils** réutilisent le code
- ✅ Comment le flux d'une requête traverse l'application
- ✅ Pourquoi SOLID et AGILE rendent le code **propre et maintenable**

**Continue à coder et à apprendre ! 🚀**
