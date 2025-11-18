# 📋 CORRESPONDANCE ROUTES BACKEND ↔ FRONTEND

## ❌ PROBLÈME DÉTECTÉ

Les routes React ne correspondent PAS aux routes Backend !

---

## 🔍 ANALYSE COMPLÈTE DES ROUTES

### 🚗 ROUTES VOITURE

#### Backend (`/voiture`)
```javascript
// Routes publiques
GET /voiture/all                    → Toutes les voitures
GET /voiture/neuve                  → Voitures NEUVES uniquement
GET /voiture/occasion               → Voitures OCCASION uniquement
GET /voiture/:id                    → Une voiture par ID
GET /voiture/modelsPorsche/:id      → Modèles Porsche d'une voiture

// Routes protégées (staff)
POST /voiture/new                   → Créer voiture
PUT /voiture/update/:id             → Modifier voiture
PATCH /voiture/addImages/:id        → Ajouter images
PATCH /voiture/removeImages/:id     → Supprimer images
DELETE /voiture/delete/:id          → Supprimer voiture (admin)
```

#### Frontend React (`voitureService`)
```javascript
// ACTUELLEMENT (INCORRECT)
GET /voiture/all                    → getAllVoitures() ✅
GET /voiture/:id                    → getVoitureById(id) ✅
POST /voiture                       → createVoiture(data) ❌ INCORRECT
PUT /voiture/:id                    → updateVoiture(id, data) ❌ INCORRECT
DELETE /voiture/:id                 → deleteVoiture(id) ❌ INCORRECT

// MANQUANT
GET /voiture/neuve                  → ❌ PAS IMPLÉMENTÉ
GET /voiture/occasion               → ❌ PAS IMPLÉMENTÉ
GET /voiture/modelsPorsche/:id      → ❌ PAS IMPLÉMENTÉ
```

---

### 🏎️ ROUTES MODEL_PORSCHE (Variantes)

#### Backend (`/model_porsche`)
```javascript
// Routes publiques
GET /model_porsche/                 → Tous les modèles
GET /model_porsche/all              → Tous les modèles (alias)
GET /model_porsche/carrosseries     → Types de carrosseries
GET /model_porsche/variantes        → Toutes les variantes
GET /model_porsche/variantes/:nomModel → Variantes d'un modèle (ex: 911)
GET /model_porsche/occasions        → Modèles OCCASION
GET /model_porsche/neuves           → Modèles NEUFS
GET /model_porsche/prixTotal/:id    → Calcul prix total
GET /model_porsche/voiture/:voiture_id → Configurations d'une voiture
GET /model_porsche/:id              → Un modèle par ID

// Routes protégées (staff)
POST /model_porsche/new             → Créer modèle
PATCH /model_porsche/update/:id     → Modifier modèle
PATCH /model_porsche/addImages/:id  → Ajouter images
PATCH /model_porsche/removeImages/:id → Supprimer images
PATCH /model_porsche/addCouleurExterieur/:id → Ajouter couleur ext
PATCH /model_porsche/removeCouleurExterieur/:id → Supprimer couleur ext
PATCH /model_porsche/addCouleursInterieur/:id → Ajouter couleur int
PATCH /model_porsche/removeCouleursInterieur/:id → Supprimer couleur int
PATCH /model_porsche/addTailleJante/:id → Ajouter jantes
PATCH /model_porsche/removeTailleJante/:id → Supprimer jantes
DELETE /model_porsche/delete/:id    → Supprimer modèle (admin)
```

#### Frontend React (`voitureService` / `modelPorscheService`)
```javascript
// ACTUELLEMENT (INCORRECT)
GET /model_porsche                  → getAllModels() ✅
GET /model_porsche/:id              → getModelById(id) ✅
GET /model_porsche?type_voiture=... → getModelsByType(isNew) ❌ MAUVAISE APPROCHE
POST /model_porsche                 → createModel(data) ❌ INCORRECT
PUT /model_porsche/:id              → updateModel(id, data) ❌ INCORRECT
DELETE /model_porsche/:id           → deleteModel(id) ❌ INCORRECT

// MANQUANT
GET /model_porsche/occasions        → ❌ PAS IMPLÉMENTÉ
GET /model_porsche/neuves           → ❌ PAS IMPLÉMENTÉ
GET /model_porsche/variantes/:nomModel → ❌ PAS IMPLÉMENTÉ
GET /model_porsche/voiture/:voiture_id → ❌ PAS IMPLÉMENTÉ
GET /model_porsche/prixTotal/:id    → ❌ PAS IMPLÉMENTÉ
```

---

### 🛍️ ROUTES ACCESSOIRES

#### Backend (`/accesoire`)
```javascript
// Routes publiques
GET /accesoire/types                → Types d'accessoires disponibles
GET /accesoire/all                  → Tous les accessoires
GET /accesoire/search               → Recherche par critères (query params)
GET /accesoire/:id                  → Un accessoire par ID

// Routes protégées (admin)
POST /accesoire/new                 → Créer accessoire
PUT /accesoire/update/:id           → Modifier accessoire
PATCH /accesoire/addImage/:id       → Ajouter image
PATCH /accesoire/removeImages/:id   → Supprimer images
PATCH /accesoire/addCouleur/:id     → Ajouter couleur
PATCH /accesoire/removeCouleur/:id  → Supprimer couleur
DELETE /accesoire/delete/:id        → Supprimer accessoire
```

#### Frontend React (`accesoireService`)
```javascript
// ACTUELLEMENT (À VÉRIFIER)
GET /accesoire/all                  → getAllAccessoires() ✅
GET /accesoire/:id                  → getAccessoireById(id) ✅
GET /accesoire/search?type=...      → getAccessoiresByType(type) ✅

// MANQUANT
GET /accesoire/types                → ❌ PAS IMPLÉMENTÉ
```

---

## 🔧 CORRECTIONS À APPORTER

### 1. Service Voiture (`voiture.service.jsx`)

```javascript
// AJOUTER
getVoituresNeuves: async () => {
  const response = await apiClient.get('/voiture/neuve');
  return response.data;
},

getVoituresOccasion: async () => {
  const response = await apiClient.get('/voiture/occasion');
  return response.data;
},

getModelsPorscheByVoiture: async (voitureId) => {
  const response = await apiClient.get(`/voiture/modelsPorsche/${voitureId}`);
  return response.data;
},

// CORRIGER
createVoiture: async (data) => {
  const response = await apiClient.post('/voiture/new', data); // PAS /voiture
  return response.data;
},

updateVoiture: async (id, data) => {
  const response = await apiClient.put(`/voiture/update/${id}`, data); // PAS /voiture/:id
  return response.data;
},

deleteVoiture: async (id) => {
  const response = await apiClient.delete(`/voiture/delete/${id}`); // PAS /voiture/:id
  return response.data;
},
```

---

### 2. Service Model Porsche (CRÉER `modelPorsche.service.jsx`)

```javascript
const modelPorscheService = {
  // Récupérer tous les modèles
  getAllModels: async () => {
    const response = await apiClient.get('/model_porsche/all');
    return response.data;
  },

  // Modèles NEUFS uniquement
  getModelesNeufs: async () => {
    const response = await apiClient.get('/model_porsche/neuves');
    return response.data;
  },

  // Modèles OCCASION uniquement
  getModelesOccasion: async () => {
    const response = await apiClient.get('/model_porsche/occasions');
    return response.data;
  },

  // Variantes par nom de modèle (ex: '911')
  getVariantesByModel: async (nomModel) => {
    const response = await apiClient.get(`/model_porsche/variantes/${nomModel}`);
    return response.data;
  },

  // Configurations d'une voiture spécifique
  getConfigurationsByVoiture: async (voitureId) => {
    const response = await apiClient.get(`/model_porsche/voiture/${voitureId}`);
    return response.data;
  },

  // Calcul prix total avec options
  calculatePrixTotal: async (modelId) => {
    const response = await apiClient.get(`/model_porsche/prixTotal/${modelId}`);
    return response.data;
  },

  // Un modèle par ID
  getModelById: async (id) => {
    const response = await apiClient.get(`/model_porsche/${id}`);
    return response.data;
  },

  // ROUTES PROTÉGÉES
  createModel: async (data) => {
    const response = await apiClient.post('/model_porsche/new', data);
    return response.data;
  },

  updateModel: async (id, data) => {
    const response = await apiClient.patch(`/model_porsche/update/${id}`, data);
    return response.data;
  },

  deleteModel: async (id) => {
    const response = await apiClient.delete(`/model_porsche/delete/${id}`);
    return response.data;
  },
};
```

---

### 3. Service Accessoire (`accesoire.service.jsx`)

```javascript
const accesoireService = {
  // Tous les accessoires
  getAllAccessoires: async () => {
    const response = await apiClient.get('/accesoire/all');
    return response.data;
  },

  // Un accessoire par ID
  getAccessoireById: async (id) => {
    const response = await apiClient.get(`/accesoire/${id}`);
    return response.data;
  },

  // Types d'accessoires disponibles
  getAvailableTypes: async () => {
    const response = await apiClient.get('/accesoire/types');
    return response.data;
  },

  // Recherche par type
  getAccessoiresByType: async (type) => {
    const response = await apiClient.get(`/accesoire/search?type=${type}`);
    return response.data;
  },

  // Recherche avec critères multiples
  searchAccessoires: async (params) => {
    const queryString = new URLSearchParams(params).toString();
    const response = await apiClient.get(`/accesoire/search?${queryString}`);
    return response.data;
  },

  // ROUTES PROTÉGÉES
  createAccessoire: async (data) => {
    const response = await apiClient.post('/accesoire/new', data);
    return response.data;
  },

  updateAccessoire: async (id, data) => {
    const response = await apiClient.put(`/accesoire/update/${id}`, data);
    return response.data;
  },

  deleteAccessoire: async (id) => {
    const response = await apiClient.delete(`/accesoire/delete/${id}`);
    return response.data;
  },
};
```

---

## 📊 RÉCAPITULATIF DES ERREURS

### Erreurs critiques trouvées:

1. ❌ **Voiture service**: Routes POST/PUT/DELETE incorrectes
2. ❌ **Voiture service**: Manque routes `/neuve` et `/occasion`
3. ❌ **Model Porsche**: Manque routes `/neuves` et `/occasions`
4. ❌ **Model Porsche**: Manque route `/variantes/:nomModel`
5. ❌ **Model Porsche**: Manque route `/voiture/:voiture_id`
6. ❌ **Model Porsche**: Routes POST/PATCH/DELETE incorrectes
7. ❌ **Accessoire**: Manque route `/types`

---

## ✅ ACTIONS À FAIRE

1. **Corriger `voiture.service.jsx`** avec les bonnes routes
2. **Créer/Corriger `modelPorsche.service.jsx`** séparé
3. **Corriger `accesoire.service.jsx`** avec route `/types`
4. **Mettre à jour `index.jsx`** pour exporter les nouveaux services
5. **Tester TOUTES les pages** après corrections

---

## 🎯 IMPACT

Ces erreurs expliquent pourquoi:
- ❌ Les pages `/catalogue/neuve` et `/catalogue/occasion` sont vides
- ❌ Les variantes ne s'affichent pas correctement
- ❌ La configuration ne charge pas les données
- ❌ Les catégories d'accessoires ne fonctionnent pas

**Après correction, TOUTES les pages fonctionneront correctement !**

