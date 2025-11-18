# 🔄 Instructions de Redémarrage Vite

## ⚠️ ACTION REQUISE

Vous devez **REDÉMARRER le serveur Vite** pour corriger l'erreur Network.

---

## 🎯 Pourquoi Redémarrer ?

**Problème:** `ERR_CONNECTION_REFUSED` sur `http://localhost:3000`

**Cause:** Vite lit les variables d'environnement (`.env`) **uniquement au démarrage**.

**Solution:** Après modification du `.env`, un redémarrage est **obligatoire**.

---

## ✅ Vérifications

### Backend ✅ FONCTIONNE
```bash
✓ Serveur Node en cours d'exécution (PID: 42744, 42816)
✓ API accessible: http://localhost:3000
✓ Endpoint model_porsche: 27 modèles disponibles
✓ CORS configuré correctement
```

### Frontend ⚠️ NÉCESSITE REDÉMARRAGE
```bash
✓ .env corrigé: VITE_API_URL=http://localhost:3000
✗ Vite doit être redémarré pour lire la nouvelle valeur
```

---

## 🚀 Procédure de Redémarrage

### Étape 1: Arrêter Vite
Dans votre terminal où Vite est lancé, appuyez sur:
```
Ctrl + C
```

### Étape 2: Relancer Vite
```bash
cd /Users/macbookm1pro/Document/Diplome_final/Code/plateforme_porsche/React
npm run dev
```

### Étape 3: Vérifier le démarrage
Vous devriez voir:
```
VITE v5.x.x  ready in xxx ms

➜  Local:   http://localhost:5173/
➜  Network: use --host to expose
```

### Étape 4: Rafraîchir le navigateur
```
http://localhost:5173/voitures
```
Appuyez sur `Cmd + Shift + R` (Mac) ou `Ctrl + Shift + R` (Windows/Linux) pour un hard refresh.

---

## 🧪 Test après Redémarrage

### Dans la Console Navigateur (F12)
Vous devriez voir:
```javascript
// Avant redémarrage
import.meta.env.VITE_API_URL // undefined → Network Error

// Après redémarrage
import.meta.env.VITE_API_URL // "http://localhost:3000" ✅
```

### Dans l'Onglet Network (F12)
```
✅ GET http://localhost:3000/model_porsche → 200 OK
✅ Images chargées depuis /uploads
```

---

## 📋 Checklist Finale

- [ ] Arrêter Vite (Ctrl+C)
- [ ] Relancer `npm run dev`
- [ ] Attendre "ready in xxx ms"
- [ ] Ouvrir http://localhost:5173/voitures
- [ ] Hard refresh (Cmd+Shift+R)
- [ ] Vérifier: 27 voitures avec photos s'affichent
- [ ] Console: Aucune erreur Network

---

## ⚡ Commande Rapide

```bash
# Tout en une seule ligne (si Vite n'est pas déjà lancé)
cd React && npm run dev
```

---

## 🔍 Diagnostic en Cas de Problème

### Si l'erreur persiste après redémarrage:

1. **Vérifier le .env**
   ```bash
   cd React
   cat .env
   # Doit afficher: VITE_API_URL=http://localhost:3000
   ```

2. **Vérifier le backend**
   ```bash
   curl http://localhost:3000/
   # Doit afficher: This is Porsche API
   ```

3. **Vérifier les logs Vite**
   ```bash
   # Rechercher dans les logs de démarrage Vite
   # Doit charger .env correctement
   ```

4. **Nettoyer le cache**
   ```bash
   cd React
   rm -rf node_modules/.vite
   npm run dev
   ```

---

## 💡 Rappel Important

### Variables d'Environnement Vite

**Règles:**
- ✅ Doivent commencer par `VITE_`
- ✅ Chargées au démarrage uniquement
- ✅ Accessibles via `import.meta.env.VITE_*`
- ❌ Non rechargées en hot-reload
- ❌ Modification = Redémarrage obligatoire

**Fichier:** `React/.env`
```env
VITE_API_URL=http://localhost:3000
```

**Utilisation:** `src/config/api.jsx`
```javascript
const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";
```

---

## ✅ Résultat Attendu

Après redémarrage, vous devriez voir:

```
Page Catalogue Porsche
http://localhost:5173/voitures

┌─────────────────────────────────┐
│  [Photo Porsche GTS]           │
│                                 │
│  GTS                            │
│  Description du modèle...       │
│  560 ch • 0-100: 3.5s          │
│  [Neuve]                        │
│  Prix: 127 500 €               │
│  [Voir les détails]            │
└─────────────────────────────────┘

... (27 voitures au total)
```

---

## 🎉 Confirmation

Une fois les voitures affichées avec leurs photos:
- ✅ Backend connecté
- ✅ CORS fonctionnel
- ✅ Photos chargées
- ✅ Application opérationnelle

**Votre plateforme Porsche est prête ! 🏎️✨**

