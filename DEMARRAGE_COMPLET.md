# 🚀 GUIDE COMPLET DE DÉMARRAGE - PLATEFORME PORSCHE

Ce guide vous permet de démarrer la plateforme Porsche avec **TOUTES les données** dans la base de données.

---

## 📋 PRÉ-REQUIS

### 1️⃣ MongoDB doit être installé et démarré

```bash
# Vérifier que MongoDB est démarré
brew services list | grep mongodb

# Si pas démarré, le démarrer
brew services start mongodb-community
```

### 2️⃣ Node.js et npm doivent être installés

```bash
node --version  # Doit afficher v18 ou supérieur
npm --version   # Doit afficher v9 ou supérieur
```

---

## 🗄️ ÉTAPE 1: PEUPLER LA BASE DE DONNÉES

### Exécuter le script de seed complet

```bash
cd /Users/macbookm1pro/Document/Diplome_final/Code/plateforme_porsche/Node
node scripts/seed-complete-database.js
```

### Ce que le script fait:

1. **Nettoie** la base de données existante
2. **Ajoute** toutes les données:
   - ✨ **6 voitures** (3 neuves + 3 occasion)
   - 🏎️ **14 variantes** Porsche
   - 🛍️ **18 accessoires** (tous types)
   - 🎨 **12 couleurs** (7 extérieures + 5 intérieures)
   - ⚙️ **14 options** (jantes, sièges, packages)

### Résultat attendu:

```
═══════════════════════════════════════════════════════════════════
  📊 RÉSUMÉ COMPLET DE LA BASE DE DONNÉES
═══════════════════════════════════════════════════════════════════

🚗 VOITURES:
   ✨ Neuves: 3
   🔄 Occasion: 3
   📦 Total: 6

🏎️  VARIANTES PORSCHE: 14

🛍️  ACCESSOIRES: 18
   Types: porte-clés, casquettes, vêtements, bagages, décoration, miniatures

🎨 COULEURS:
   Extérieures: 7
   Intérieures: 5

⚙️  OPTIONS:
   Jantes: 5
   Sièges: 4
   Packages: 4

═══════════════════════════════════════════════════════════════════
  ✅ BASE DE DONNÉES COMPLÈTEMENT PEUPLÉE !
═══════════════════════════════════════════════════════════════════
```

---

## 🔧 ÉTAPE 2: DÉMARRER LE BACKEND (Node.js)

### Terminal 1 - Backend

```bash
cd /Users/macbookm1pro/Document/Diplome_final/Code/plateforme_porsche/Node
npm start
```

### Résultat attendu:

```
🚀 Serveur démarré sur le port 3000
✅ Connexion à mongoDB réussie
```

### Vérifier le backend:

Ouvrez dans le navigateur: **http://localhost:3000/voiture/all**

Vous devriez voir un JSON avec 6 voitures.

---

## 🎨 ÉTAPE 3: DÉMARRER LE FRONTEND (React/Vite)

### Terminal 2 - Frontend

```bash
cd /Users/macbookm1pro/Document/Diplome_final/Code/plateforme_porsche/React
npm run dev
```

### Résultat attendu:

```
VITE v5.x.x  ready in xxx ms

➜  Local:   http://localhost:5173/
➜  Network: use --host to expose
```

---

## ✅ ÉTAPE 4: TESTER TOUTES LES PAGES

Ouvrez votre navigateur et testez **TOUTES** ces pages:

### 🏠 Page d'accueil
**URL:** http://localhost:5173/

**Doit afficher:**
- Section Hero avec choix Neuf/Occasion
- 3 cartes de modèles: 911, Cayenne, Cayman (avec photos si disponibles)
- Section Accessoires

---

### ✨ Voitures NEUVES
**URL:** http://localhost:5173/catalogue/neuve

**Doit afficher:**
- 3 modèles: 911, Cayenne, Cayman
- Badge "NEUVE" sur chaque carte
- Descriptions complètes

**Actions:**
1. Cliquer sur une carte (ex: 911)
2. Doit rediriger vers: `/variantes/neuve/:id`
3. Doit afficher les variantes: Carrera, Carrera S, GTS, Turbo, etc.

---

### 🔄 Voitures OCCASION
**URL:** http://localhost:5173/catalogue/occasion

**Doit afficher:**
- 3 modèles: 911, Cayenne, Cayman
- Badge "OCCASION" sur chaque carte
- Descriptions "certifiée"

**Actions:**
1. Cliquer sur une carte (ex: Cayenne)
2. Doit rediriger vers: `/variantes/occasion/:id`
3. Doit afficher les variantes d'occasion

---

### 🛍️ Accessoires
**URL:** http://localhost:5173/accessoires

**Doit afficher:**
- 6 catégories:
  - Porte-clés
  - Casquettes
  - Vêtements
  - Bagages
  - Décoration
  - Miniatures

**Actions:**
1. Cliquer sur une catégorie (ex: Vêtements)
2. Doit rediriger vers: `/accessoires/categorie/vetement`
3. Doit afficher 4 vêtements

---

### ⚙️ Configuration (pour voitures neuves)

**Parcours complet:**
1. Accueil → Catalogue Neuve → Sélectionner 911
2. Choisir une variante (ex: Carrera S)
3. Doit rediriger vers: `/configuration/neuve/:id`
4. **Page de configuration doit afficher:**
   - Nom de la variante
   - Photos (galerie)
   - Spécifications techniques
   - Sélecteurs: couleur extérieure, intérieure, jantes, sièges, packages
   - Prix total qui se met à jour en temps réel

---

## 🔍 VÉRIFICATION DES DONNÉES

### Vérifier directement l'API:

```bash
# Toutes les voitures
http://localhost:3000/voiture/all

# Voitures neuves
http://localhost:3000/voiture/neuve

# Voitures occasion
http://localhost:3000/voiture/occasion

# Toutes les variantes
http://localhost:3000/model_porsche

# Tous les accessoires
http://localhost:3000/accesoire/all

# Couleurs extérieures
http://localhost:3000/couleur_exterieur

# Couleurs intérieures
http://localhost:3000/couleur_interieur
```

---

## 🐛 RÉSOLUTION DE PROBLÈMES

### ❌ Erreur: "Cannot GET /voiture/all"
**Solution:** Le backend n'est pas démarré

```bash
cd Node/
npm start
```

---

### ❌ Erreur: ERR_CONNECTION_REFUSED
**Solution:** Le frontend essaie de se connecter au backend qui n'est pas démarré

1. Vérifier que le backend tourne sur le port 3000
2. Vérifier le fichier `React/.env`:
   ```
   VITE_API_URL=http://localhost:3000
   ```
3. Redémarrer Vite:
   ```bash
   cd React/
   npm run dev
   ```

---

### ❌ Pas de données affichées (page vide)
**Solutions:**

1. **Vérifier la base de données:**
   ```bash
   node scripts/seed-complete-database.js
   ```

2. **Vérifier MongoDB:**
   ```bash
   brew services list | grep mongodb
   # Si pas running:
   brew services start mongodb-community
   ```

3. **Vérifier la console du navigateur (F12):**
   - Regarder les erreurs réseau (onglet Network)
   - Regarder les erreurs JavaScript (onglet Console)

---

### ❌ Images ne s'affichent pas
**Solution:** Problème CORS ou fichiers manquants

1. Vérifier que `Node/uploads/` contient des images
2. Vérifier la configuration CORS dans `Node/server.js`
3. Les images doivent être accessibles via:
   ```
   http://localhost:3000/uploads/model_porsche/nom_image.jpg
   ```

---

## 📦 STRUCTURE DES DONNÉES

### Voiture (modèle parent)
```javascript
{
  _id: "...",
  type_voiture: true,  // true = neuve, false = occasion
  nom_model: "911",
  description: "L'icône intemporelle...",
  photo_voiture: []
}
```

### ModelPorsche (variante)
```javascript
{
  _id: "...",
  nom_model: "Carrera S",
  voiture: "id_voiture_parent",
  puissance_ch: 450,
  type_transmission: "PDK",
  acceleration_0_100: 3.7,
  prix_base: 135000,
  statut: "disponible",
  disponible: true
}
```

### Accessoire
```javascript
{
  _id: "...",
  nom: "Casquette Porsche Racing",
  type_accesoire: "casquette",
  description: "Casquette officielle...",
  prix: 45,
  stock: 120
}
```

---

## 🎯 CHECKLIST FINALE

Avant de dire que tout fonctionne, vérifiez:

- [ ] MongoDB est démarré
- [ ] Base de données peuplée (script seed exécuté)
- [ ] Backend démarré sur port 3000
- [ ] Frontend démarré sur port 5173
- [ ] Page d'accueil affiche 3 modèles
- [ ] Page catalogue neuve affiche 3 voitures
- [ ] Page catalogue occasion affiche 3 voitures
- [ ] Page accessoires affiche 6 catégories
- [ ] Clic sur une voiture neuve → affiche variantes
- [ ] Clic sur une variante → affiche configuration
- [ ] Clic sur une catégorie accessoire → affiche liste
- [ ] Aucune erreur dans la console navigateur
- [ ] Aucune erreur dans le terminal backend

---

## 🚀 COMMANDES RAPIDES

### Tout démarrer en une fois:

**Terminal 1 - Backend:**
```bash
cd /Users/macbookm1pro/Document/Diplome_final/Code/plateforme_porsche/Node && npm start
```

**Terminal 2 - Frontend:**
```bash
cd /Users/macbookm1pro/Document/Diplome_final/Code/plateforme_porsche/React && npm run dev
```

### Repeupler la base:
```bash
cd /Users/macbookm1pro/Document/Diplome_final/Code/plateforme_porsche/Node && node scripts/seed-complete-database.js
```

---

## 📞 AIDE SUPPLÉMENTAIRE

Si vous avez encore des problèmes:

1. **Vérifier les logs du backend** (Terminal 1)
2. **Vérifier la console du navigateur** (F12)
3. **Tester l'API directement** (http://localhost:3000/voiture/all)
4. **Nettoyer et réinstaller:**
   ```bash
   cd Node/
   rm -rf node_modules
   npm install
   
   cd ../React/
   rm -rf node_modules
   npm install
   ```

---

**✅ Avec ce guide, TOUTES les données devraient s'afficher sur TOUTES les pages !**
