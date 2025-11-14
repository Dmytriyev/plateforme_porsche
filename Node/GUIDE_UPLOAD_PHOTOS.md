# Guide d'Upload de Photos via Postman

Ce guide explique comment ajouter des photos à votre API Porsche en utilisant Postman.

## 📋 Prérequis

- Postman installé
- Serveur API démarré (`npm start`)
- Token d'authentification (selon le type de photo)

---

## 🔐 Authentification

### Obtenir un Token

1. **Créez une requête POST** : `http://localhost:3000/user/login`
2. **Body** → **raw** → **JSON** :

```json
{
  "email": "admin@porsche.com",
  "password": "Admin123!"
}
```

3. **Envoyez** la requête
4. **Copiez** le `token` dans la réponse

### Utiliser le Token

Pour toutes les requêtes d'upload :

- Allez dans l'onglet **Authorization**
- Type : **Bearer Token**
- Collez votre token dans le champ **Token**

---

## 📸 Types de Photos et Permissions

| Type de Photo            | Route                       | Permission Requise                    |
| ------------------------ | --------------------------- | ------------------------------------- |
| Photos Porsche (modèles) | `/photo_porsche/new`        | Staff (admin/responsable/conseillère) |
| Photos Accessoires       | `/photo_accesoire/new`      | Staff                                 |
| Photos Voiture Actuelle  | `/photo_voiture_actuel/new` | User authentifié                      |
| Photos Voiture           | `/photo_voiture/new`        | Staff                                 |

---

## 🚀 Upload d'une Photo

### Méthode 1 : Photo + Données (Recommandée)

**Exemple : Ajouter une photo à un modèle Porsche**

1. **Créez une requête POST** : `http://localhost:3000/photo_porsche/new`

2. **Authorization** : Ajoutez votre Bearer Token

3. **Body** → **form-data** :

| Key                 | Type     | Value                             |
| ------------------- | -------- | --------------------------------- |
| `photo`             | **File** | _Sélectionnez votre image_        |
| `model_porsche`     | Text     | `67890abcdef12345` (ID du modèle) |
| `type_photo`        | Text     | `exterieur`                       |
| `couleur_exterieur` | Text     | `12345abcdef67890` (ID couleur)   |

4. **Send** ✅

### Méthode 2 : Données Seulement (Sans Photo)

Si vous voulez créer l'entrée sans fichier image :

1. **Body** → **raw** → **JSON** :

```json
{
  "name": "http://localhost:3000/uploads/model_porsche/existing_photo.jpg",
  "model_porsche": "67890abcdef12345",
  "type_photo": "exterieur",
  "couleur_exterieur": "12345abcdef67890"
}
```

---

## 📝 Exemples Pratiques

### Photo d'Accessoire

**POST** `http://localhost:3000/photo_accesoire/new`

**Body (form-data)** :
| Key | Type | Value |
|-----|------|-------|
| `photo` | File | `casquette_porsche.jpg` |
| `accesoire` | Text | `64f9a123bc456def78901` |
| `couleur_accesoire` | Text | `64f9a456bc789def01234` |

---

### Photo de Voiture Actuelle (User)

**POST** `http://localhost:3000/photo_voiture_actuel/new`

**Body (form-data)** :
| Key | Type | Value |
|-----|------|-------|
| `photo` | File | `ma_911.jpg` |
| `model_porsche_actuel` | Text | `64f9a789bc012def34567` |
| `type_photo` | Text | `exterieur` |

---

## ✏️ Modifier une Photo

**PUT** `http://localhost:3000/photo_porsche/{id}`

Pour changer uniquement l'image :

**Body (form-data)** :
| Key | Type | Value |
|-----|------|-------|
| `photo` | File | `nouvelle_image.jpg` |

Pour changer les données :

**Body (raw - JSON)** :

```json
{
  "type_photo": "interieur",
  "couleur_interieur": "64f9a456bc789def01234"
}
```

---

## ❌ Erreurs Courantes

### 401 Unauthorized

- ✅ Vérifiez que vous avez ajouté le Bearer Token
- ✅ Vérifiez que le token n'a pas expiré

### 403 Forbidden

- ✅ Vérifiez que votre rôle a les permissions nécessaires
- ✅ Photos Porsche/Accessoires = Staff uniquement

### 400 Bad Request (Type de fichier non autorisé)

- ✅ Formats acceptés : `.jpg`, `.jpeg`, `.png`, `.webp`, `.avif`
- ✅ Taille max : **20 MB**

### 404 Not Found

- ✅ Vérifiez que l'ID du modèle/accessoire existe
- ✅ Récupérez les IDs via `GET /model_porsche/all`

---

## 💡 Conseils

1. **Vérifiez les IDs** avant d'uploader :

   - `GET /model_porsche/all` pour les modèles
   - `GET /accesoire/all` pour les accessoires
   - `GET /couleur_exterieur/all` pour les couleurs

2. **Nommez vos fichiers** clairement : `911_carrera_rouge_exterieur.jpg`

3. **Testez sans photo** d'abord avec JSON pour valider vos données

4. **La photo est optionnelle** : vous pouvez créer l'entrée puis ajouter la photo plus tard avec PUT

---

## 🎯 Résumé Rapide

```
1. Login → Récupérer token
2. Nouvelle requête → Authorization → Bearer Token
3. POST /photo_xxx/new
4. Body → form-data
5. Ajouter champ "photo" (File) + autres champs (Text)
6. Send ✅
```

---

**Questions ?** Consultez le `GUIDE_POSTMAN.md` pour plus d'informations sur l'API.
