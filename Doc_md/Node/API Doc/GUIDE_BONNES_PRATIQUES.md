# 📚 GUIDE DES BONNES PRATIQUES - Plateforme Porsche

## 🎯 Architecture et Logique Métier

### **Hiérarchie des entités**

```
VOITURE (modèle global: 911, Cayenne, Cayman)
    └── MODEL_PORSCHE (configurations spécifiques: 911 GT3, Cayenne E-Hybrid)
        └── LIGNE_COMMANDE (ajout au panier avec acompte)

ACCESSOIRE (porte-clés, casquettes)
    └── LIGNE_COMMANDE (ajout au panier)

VOITURE OCCASION
    └── RESERVATION (système séparé, pas de panier)
```

---

## 🔐 Règles de Sécurité

### **1. Création de ressources**

| Ressource     | Qui peut créer ?     | Middleware       |
| ------------- | -------------------- | ---------------- |
| Voiture       | Staff uniquement     | `auth + isStaff` |
| Model_porsche | Staff uniquement     | `auth + isStaff` |
| Accessoire    | Staff uniquement     | `auth + isStaff` |
| LigneCommande | Utilisateur connecté | `auth`           |
| Réservation   | Utilisateur connecté | `auth`           |
| Commande      | Utilisateur connecté | `auth`           |

### **2. Champs interdits dans les requêtes utilisateur**

❌ **NE JAMAIS accepter ces champs depuis le frontend :**

```javascript
// ligneCommande
{
  voiture: "...",  // ❌ Rempli automatiquement depuis model_porsche_id
}

// reservation
{
  user: "...",  // ❌ Forcé depuis req.user.id (token JWT)
}
```

**Validation Joi :**

```javascript
voiture: joi.forbidden(),
user: joi.forbidden(),
```

### **3. Champs immuables**

Une fois créés, ces champs **NE PEUVENT PAS** être modifiés :

- `type_produit` (voiture ou accessoire)
- `voiture` (référence voiture)
- `model_porsche_id` (configuration)
- `accesoire` (référence accessoire)
- `user` (propriétaire réservation/commande)

**Solution :** Supprimer et recréer la ligne si besoin.

---

## 📋 Validation en Couches

### **Couche 1 : Validation Joi (schemas)**

```javascript
// validations/ligneCommande.validation.js
const ligneCommandeCreate = joi.object({
  type_produit: joi.boolean().required(),
  quantite: joi.number().min(1).max(1000).required(),
  voiture: joi.forbidden(), // ❌ Interdit
  model_porsche_id: joi.string().when("type_produit", {
    is: true,
    then: joi.required(),
  }),
  accesoire: joi.string().when("type_produit", {
    is: false,
    then: joi.required(),
  }),
});
```

### **Couche 2 : Validation Contrôleur**

```javascript
// controllers/ligneCommande.controller.js
if (body.voiture) {
  return sendError(res, "Impossible de créer directement une voiture", 403);
}

if (body.type_produit === true && body.quantite > 1) {
  return sendError(res, "Quantité maximale de 1 pour voiture neuve", 400);
}
```

### **Couche 3 : Validation Mongoose**

```javascript
// models/ligneCommande.model.js
quantite: {
  validate: {
    validator: function(value) {
      if (this.type_produit === true && value > 1) return false;
      return true;
    },
    message: "Quantité maximale de 1 pour voiture neuve"
  }
}
```

---

## 🚦 Workflow Utilisateur

### **Voiture Neuve (avec configuration)**

```
1. GET /voiture/neuves/configurateur
   → Affiche les modèles disponibles (911, Cayenne...)

2. GET /model-porsche/par-voiture/:voiture_id
   → Affiche les configurations disponibles pour le modèle choisi

3. GET /model-porsche/:id/details-complet
   → Affiche les détails complets + prix total calculé

4. POST /ligne-commande/new
   {
     type_produit: true,
     quantite: 1,
     model_porsche_id: "..."
   }
   → Ajout au panier (acompte 20% calculé automatiquement)

5. POST /commande/panier/valider
   → Validation du panier + paiement acompte
```

### **Voiture Occasion (réservation uniquement)**

```
1. GET /voiture/occasion/finder?modele=911&annee_min=2018
   → Affiche les voitures d'occasion disponibles

2. GET /reservation/disponibilite/:voitureId
   → Vérifie les dates de disponibilité

3. POST /reservation/new
   {
     voiture: "...",
     date_reservation: "2025-11-10"
   }
   → Crée la réservation (user forcé depuis token)
```

### **Accessoires (achat simple)**

```
1. GET /accesoire/all
   → Affiche tous les accessoires

2. POST /ligne-commande/new
   {
     type_produit: false,
     quantite: 3,
     accesoire: "..."
   }
   → Ajout au panier (pas d'acompte)
```

---

## ⚙️ Calcul Automatique des Prix

### **Voiture Neuve**

```javascript
Prix Total = Prix Base Voiture
           + Prix Couleur Extérieure
           + Prix Couleurs Intérieures
           + Prix Jantes

Acompte = 20% du Prix Total (ou valeur fournie si < Prix Total)
```

### **Accessoire**

```javascript
Prix Total = Prix Accessoire × Quantité
Acompte = 0
```

---

## 🛡️ Contrôles d'Accès (RBAC)

### **Rôles disponibles**

- `user` : Utilisateur normal (achats, réservations)
- `conseillere` : Conseillère (gestion voitures/configs)
- `responsable` : Responsable (gestion voitures/configs)
- `admin` : Administrateur (tous droits)

### **Middlewares**

```javascript
// auth.js : Vérifie le token JWT
// isAdmin.js : Vérifie role === "admin"
// isStaff.js : Vérifie role in ["admin", "responsable", "conseillere"]
```

### **Matrice des permissions**

| Action                  | user | conseillere | responsable | admin |
| ----------------------- | ---- | ----------- | ----------- | ----- |
| Consulter voitures      | ✅   | ✅          | ✅          | ✅    |
| Créer voiture           | ❌   | ✅          | ✅          | ✅    |
| Créer configuration     | ❌   | ✅          | ✅          | ✅    |
| Commander voiture neuve | ✅   | ✅          | ✅          | ✅    |
| Réserver occasion       | ✅   | ✅          | ✅          | ✅    |
| Supprimer voiture       | ❌   | ❌          | ❌          | ✅    |
| Voir toutes commandes   | ❌   | ❌          | ❌          | ✅    |

---

## 🔄 Principes SOLID Appliqués

### **S - Single Responsibility**

Chaque contrôleur gère UNE seule entité :

- `voiture.controller.js` → Voitures
- `ligneCommande.controller.js` → Lignes de commande
- `reservation.controller.js` → Réservations

### **O - Open/Closed**

Utilisation de middlewares pour étendre les fonctionnalités sans modifier le code existant.

### **L - Liskov Substitution**

Les routes utilisent des middlewares interchangeables (`isAdmin`, `isStaff`).

### **I - Interface Segregation**

Chaque route expose uniquement les endpoints nécessaires (pas de surcharge).

### **D - Dependency Inversion**

Les contrôleurs dépendent des abstractions (modèles) et non des implémentations concrètes.

---

## 📊 Gestion des États

### **Commande**

- `status: false` → Panier actif (en cours de modification)
- `status: true` → Commande validée (payée, immuable)

### **Réservation**

- `status: false` → En attente de confirmation
- `status: true` → Confirmée

---

## 🧪 Tests de Sécurité

Utilisez le fichier `tests-securite.js` pour valider :

1. Création directe de voiture bloquée
2. Modification de champs critiques bloquée
3. Usurpation d'identité bloquée
4. Quantité > 1 pour voiture neuve bloquée
5. Permissions staff respectées
6. Accessoires avec quantité > 1 autorisés
7. Réservation voiture neuve bloquée

---

## 📝 Checklist avant Déploiement

- [ ] Toutes les validations Joi sont en place
- [ ] Tous les champs sensibles sont `joi.forbidden()`
- [ ] Les middlewares `auth`, `isAdmin`, `isStaff` sont appliqués
- [ ] Les routes spécifiques sont avant les routes paramétrées
- [ ] Les ObjectId sont validés avec `validateObjectId`
- [ ] Les erreurs retournent des messages clairs
- [ ] Les tokens JWT sont vérifiés
- [ ] Les tests de sécurité passent
- [ ] Les logs sont activés pour les actions sensibles
- [ ] Rate limiting configuré
- [ ] CORS configuré correctement
- [ ] Variables d'environnement sécurisées

---

## 🚨 Alertes de Sécurité

### **À NE JAMAIS FAIRE**

❌ Accepter `voiture` dans `ligneCommande` depuis le frontend
❌ Accepter `user` dans `reservation` depuis le frontend
❌ Permettre la modification de `type_produit` après création
❌ Utiliser des ID en dur dans le code
❌ Exposer les tokens JWT dans les logs
❌ Permettre quantité > 1 pour voitures neuves
❌ Retourner les mots de passe dans les réponses API

### **À TOUJOURS FAIRE**

✅ Valider tous les inputs (Joi + Contrôleur + Mongoose)
✅ Vérifier les permissions avant chaque action
✅ Forcer `req.user.id` depuis le token JWT
✅ Utiliser `populate()` avec `select` pour limiter les données
✅ Hasher les mots de passe (bcrypt)
✅ Logger les tentatives d'accès non autorisées
✅ Utiliser HTTPS en production

---

**Maintenu par :** Équipe de développement
**Dernière mise à jour :** 5 novembre 2025
