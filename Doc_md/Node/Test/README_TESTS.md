# 🧪 Tests API - Plateforme Porsche

## 📖 Qu'est-ce que c'est ?

Ce fichier teste **automatiquement** toutes les fonctionnalités de votre API Porsche. C'est comme un robot qui vérifie que tout fonctionne correctement !

## 🎯 Pourquoi des tests ?

Imaginez que vous modifiez le code de l'API. Comment savoir si vous n'avez rien cassé ?
👉 **Les tests le font pour vous automatiquement !**

### Avantages :

- ✅ Vérifier que l'API fonctionne
- ✅ Détecter les bugs rapidement
- ✅ S'assurer que les permissions sont respectées
- ✅ Gagner du temps (pas besoin de tester manuellement)

---

## 🚀 Lancer les Tests

### Prérequis

```bash
# 1. MongoDB doit être démarré
# 2. Le serveur Node.js doit être lancé
npm start
```

### Exécuter les tests

```bash
# Dans un nouveau terminal
npm test

# Ou directement
node test-api-complete.js
```

---

## 📋 Ce Qui Est Testé

Le script teste **14 étapes** dans l'ordre :

### 🔐 **Partie 1 : Authentification & Permissions**

#### Étape 1 : Création des Utilisateurs

Crée 4 utilisateurs de test :

- 👨‍💼 **Admin** (accès total)
- 🔧 **Responsable** (gestion du catalogue)
- 🤝 **Conseillère** (assistance clients)
- 👤 **User** (client standard)

```javascript
// Exemple de ce qui est créé
{
  email: "admin.test@porsche.com",
  password: "Admin@123456",
  role: "admin"
}
```

#### Étape 2 : Connexion des Utilisateurs

Teste la connexion de chaque utilisateur et récupère leur **token JWT**.

💡 **Pourquoi ?** Le token est comme un badge d'accès pour les requêtes suivantes.

#### Étape 3 : Test des Permissions sur les Voitures

Vérifie **qui peut faire quoi** :

| Action            | User | Conseillère | Responsable | Admin |
| ----------------- | ---- | ----------- | ----------- | ----- |
| Créer voiture     | ❌   | ✅          | ✅          | ✅    |
| Voir voitures     | ✅   | ✅          | ✅          | ✅    |
| Supprimer voiture | ❌   | ❌          | ❌          | ✅    |

💡 **Test important** : Vérifie qu'un simple user ne peut pas créer de voitures !

#### Étape 4 : Test des Permissions sur les Model Porsche

Même principe pour les variantes de voitures :

- User ❌ NE PEUT PAS créer
- Staff ✅ PEUT créer

---

### 🎨 **Partie 2 : Données de Base**

#### Étape 5 : Couleurs Extérieures

Crée et teste 3 couleurs :

```javascript
// Exemples
{ nom_couleur: "red", prix: 2000 }
{ nom_couleur: "bleu", prix: 2500 }
{ nom_couleur: "black", prix: 1500 }
```

#### Étape 6 : Couleurs Intérieures

Crée 3 couleurs d'intérieur :

```javascript
{ nom_couleur: "black", description: "Cuir noir premium" }
{ nom_couleur: "caramel", description: "Cuir beige élégant" }
```

#### Étape 7 : Couleurs Accessoires

Crée 3 couleurs pour les accessoires :

```javascript
{
  nom_couleur: "Noir Mat";
}
{
  nom_couleur: "Argent";
}
{
  nom_couleur: "Carbone";
}
```

#### Étape 8 : Tailles de Jantes

Crée 3 tailles :

```javascript
{ taille_jante: "19", couleur_jante: "gray", prix: 2000 }
{ taille_jante: "21", couleur_jante: "black", prix: 2500 }
{ taille_jante: "22", couleur_jante: "white", prix: 3000 }
```

#### Étape 9 : Accessoires

Crée 3 accessoires avec leurs couleurs :

```javascript
{
  type_accesoire: "decoration",
  nom_accesoire: "Tapis de sol",
  prix: 350,
  couleur_accesoire: "id_couleur_noire"
}
```

---

### 🚗 **Partie 3 : Voitures**

#### Étape 9.5 : Configurations Model Porsche Complètes

Crée des voitures complètes avec toutes leurs options :

**Voiture d'Occasion (Finder) :**

```javascript
{
  nom_model: "911 Carrera S",
  type_voiture: false, // Occasion
  prix_base: 95000,
  couleur_exterieur: "Rouge",
  couleur_interieur: "Noir",
  taille_jante: "19 pouces"
}
```

**Voiture Neuve (Configurateur) :**

```javascript
{
  nom_model: "Cayenne",
  type_voiture: true, // Neuve
  prix_base: 85000,
  disponible: true
}
```

#### Étape 10 : Permissions sur les Ressources

Vérifie que :

- ❌ User ne peut pas créer de photos
- ❌ User ne peut pas créer de couleurs
- ✅ Admin peut tout créer

#### Étape 10.3 : Configurateur Voitures Neuves

Teste le workflow complet :

1. Créer la voiture de base (ex: "911")
2. Créer les variantes (ex: "911 Carrera S")
3. Ajouter les options disponibles
4. Vérifier que tout est bien lié

#### Étape 10.5 : Finder Voitures Occasion

Teste le catalogue d'occasion :

1. Créer des voitures d'occasion complètes
2. Vérifier les couleurs et options
3. Tester les filtres de recherche

---

### 👤 **Partie 4 : Actions Utilisateur**

#### Étape 11 : Réservations

Teste la réservation d'une voiture d'occasion :

```javascript
{
  voiture: "id_911_occasion",
  date_reservation: "2025-11-15",
  heure_reservation: "14:00"
}
```

💡 **Vérifie que** :

- ✅ User peut réserver
- ✅ Les dates futures sont acceptées
- ✅ La réservation est bien créée

#### Étape 12 : Profil Utilisateur

Teste la gestion du profil :

```javascript
// Lire le profil
GET /users/profile

// Modifier le profil
PUT /users/profile
{
  nom: "Nouveau Nom",
  telephone: "0612345678"
}
```

#### Étape 13 : Commandes

Teste 2 types de commandes :

**A. Commander une voiture neuve (avec acompte) :**

```javascript
{
  voiture: "id_cayenne",
  type_commande: "voiture_neuve",
  montant_acompte: 500
}
```

**B. Acheter des accessoires :**

```javascript
{
  lignes_commande: [
    { accesoire: "id_tapis", quantite: 2 },
    { accesoire: "id_spoiler", quantite: 1 },
  ];
}
```

#### Étape 14 : Nettoyage

Supprime toutes les données de test créées.

💡 **Pourquoi ?** Pour ne pas polluer la base de données.

---

### 🎪 **Bonus : Workflow Configurateur Complet**

Simule un parcours client réel (comme sur Porsche.com) :

```
1. Choisir un modèle : "911"
2. Choisir une variante : "911 Carrera S"
3. Configurer :
   - Couleur extérieure : Bleu
   - Couleur intérieure : Noir
   - Jantes : 20 pouces
4. Ajouter au panier
5. Payer l'acompte (500€)
6. Confirmer la commande
```

---

## 📊 Résultats des Tests

À la fin, vous verrez un résumé :

```
═══════════════════════════════════════════════════
                RÉSUMÉ DES TESTS
═══════════════════════════════════════════════════

Statistiques:
  Total tests: 45
  ✓ Réussis: 42
  ✗ Échoués: 2
  ⚠ Ignorés: 1
  Taux de réussite: 93.33%

Données créées:
  - Utilisateurs: 4 (admin, responsable, conseillere, user)
  - Couleurs extérieures: 3
  - Couleurs intérieures: 3
  - Voitures neuves: 2
  - Voitures occasion: 2
  - Accessoires: 3
  - Réservations: 1

Permissions testées:
  ✓ Users authentifiés peuvent créer voitures/modèles
  ✗ Users simples ne peuvent pas gérer photos/options
  ✓ Staff peut gérer photos/couleurs/jantes
  ✗ Seul admin peut supprimer
```

### Codes Couleur :

- 🟢 **Vert** = Test réussi ✅
- 🔴 **Rouge** = Test échoué ❌
- 🟡 **Jaune** = Test ignoré ⚠️

---

## 🔍 Comment Lire les Résultats

### Exemple de test réussi :

```
✓ Admin peut créer une voiture
  Voiture créée: Cayenne (ID: 67abc123...)
```

### Exemple de test échoué :

```
✗ User NE PEUT PAS créer une voiture
  Attendu: 403 Forbidden
  Reçu: 201 Created
  → PROBLÈME: Les permissions ne sont pas respectées !
```

---

## 🛠️ Structure du Code

Le fichier est organisé en **fonctions** :

```javascript
// 1. Fonctions utilitaires
log.success(); // Affiche un message de succès
log.error(); // Affiche une erreur
request(); // Fait une requête HTTP

// 2. Fonctions de test
createTestUsers(); // Étape 1
loginUsers(); // Étape 2
testVoiturePermissions(); // Étape 3
// ... etc

// 3. Fonction principale
main(); // Lance tous les tests dans l'ordre
```

---

## 💡 Bonnes Pratiques Utilisées

### 1. **Tests Isolés**

Chaque test est indépendant. Si un test échoue, les autres continuent.

### 2. **Données Réutilisables**

Les données créées dans un test sont réutilisées dans les suivants :

```javascript
// Étape 5 : Créer couleur rouge
testData.couleurs.exterieur.push(couleurRouge);

// Étape 9 : Utiliser la couleur rouge
voiture.couleur_exterieur = testData.couleurs.exterieur[0]._id;
```

### 3. **Nettoyage Automatique**

À la fin, tout est supprimé (Étape 14).

### 4. **Messages Clairs**

Chaque test affiche ce qu'il fait :

```javascript
log.info("Test: User NE PEUT PAS créer de voiture");
log.success("Voiture créée avec succès");
log.error("Erreur: Permission refusée");
```

---

## 🎓 Ce Que Vous Apprenez

### 1. **Tests d'API REST**

- Comment tester des endpoints
- Comment vérifier les codes HTTP (200, 201, 403, etc.)
- Comment gérer l'authentification (JWT)

### 2. **Gestion des Permissions**

- Différence entre rôles (admin, user, etc.)
- Qui peut faire quoi
- Comment bloquer les actions non autorisées

### 3. **Workflow Complet**

- Comment un client utilise l'API
- L'ordre des opérations
- Les dépendances entre les données

### 4. **Bonnes Pratiques**

- Organiser les tests
- Réutiliser les données
- Nettoyer après les tests

---

## 🐛 Que Faire Si Un Test Échoue ?

### 1. **Lire le Message d'Erreur**

```
✗ Test échoué: User peut créer une voiture
  Attendu: 403
  Reçu: 201
```

👉 Problème : Les permissions ne bloquent pas le user

### 2. **Vérifier le Code**

- Ouvrir le controller concerné
- Vérifier le middleware d'authentification
- Corriger le problème

### 3. **Relancer les Tests**

```bash
npm test
```

### 4. **Vérifier Que C'est Corrigé**

```
✓ User NE PEUT PAS créer une voiture (403 Forbidden)
```

---

## 🔄 Workflow de Développement

```
1. Écrire du code
   ↓
2. Lancer les tests (npm test)
   ↓
3. Tests verts ? ✅
   → Commit et push

3. Tests rouges ? ❌
   → Corriger le code
   → Retour à l'étape 2
```

---

## 📚 Commandes Utiles

```bash
# Lancer tous les tests
npm test

# Lancer avec plus de détails
node test-api-complete.js

# Nettoyer la base avant les tests
npm run clean
node test-api-complete.js

# Voir les logs détaillés
# (Les couleurs dans le terminal aident à lire)
```

---

## ❓ Questions Fréquentes

**Q : Combien de temps prennent les tests ?**  
R : Environ 10-30 secondes selon votre machine.

**Q : Dois-je lancer les tests à chaque modification ?**  
R : Oui ! C'est le principe. Ça évite de casser des fonctionnalités existantes.

**Q : Que faire si tous les tests échouent ?**  
R : Vérifier que :

- MongoDB est démarré
- Le serveur Node.js tourne (npm start)
- L'URL est correcte (http://localhost:3000)

**Q : Puis-je ajouter mes propres tests ?**  
R : Oui ! Créez une nouvelle fonction comme `testMaFonctionnalite()` et appelez-la dans `main()`.

**Q : Pourquoi nettoyer les données ?**  
R : Pour que chaque lancement de test parte d'un état propre et prévisible.

---

## 🎯 Résumé

### Ce fichier teste :

1. ✅ **Authentification** - Création et connexion des users
2. ✅ **Permissions** - Qui peut faire quoi
3. ✅ **CRUD** - Création, lecture, modification, suppression
4. ✅ **Relations** - Liens entre voitures, couleurs, accessoires
5. ✅ **Workflows** - Parcours client complet
6. ✅ **Nettoyage** - Suppression des données de test

### Avantages :

- 🚀 **Rapide** - 30 secondes pour tout tester
- 🎯 **Précis** - Détecte exactement où est le problème
- 🔄 **Automatique** - Pas besoin de tester manuellement
- 📊 **Visuel** - Couleurs et résumé clair

---

**Bon testing ! 🧪✨**

_Les tests sont vos amis - Ils vous alertent quand quelque chose ne va pas !_
