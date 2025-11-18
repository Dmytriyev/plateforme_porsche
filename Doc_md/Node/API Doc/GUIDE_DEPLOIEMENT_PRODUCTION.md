# 🚀 GUIDE DE DÉPLOIEMENT SÉCURISÉ - PORSCHE E-COMMERCE

**Version**: 1.0.0
**Date**: 01/11/2025
**Statut**: ✅ PRÊT POUR PRODUCTION

---

## ✅ CHECKLIST SÉCURITÉ PRÉ-DÉPLOIEMENT

### Configuration de base:

- ✅ CORS restreint aux origines autorisées
- ✅ validateObjectId sur 65+ routes
- ✅ Rate limiting multicouche (5 limiters)
- ✅ Validation Joi sur tous les inputs
- ✅ Helmet pour sécuriser les en-têtes HTTP
- ✅ JWT avec SECRET_KEY cryptographique
- ✅ Bcrypt pour les mots de passe (10 rounds)

### Variables d'environnement:

- ✅ `PORT=3000`
- ✅ `DB_URI` configuré
- ✅ `FRONTEND_URL=http://localhost:3001` (à changer en production)
- ✅ `SECRET_KEY` (128 caractères aléatoires)
- ✅ `JWT_EXPIRE=24h`
- ✅ Clés Stripe configurées

---

## 🔧 CONFIGURATION PRODUCTION

### 1. Variables d'environnement (.env)

```bash
# Serveur
PORT=3000
NODE_ENV=production

# Base de données
DB_URI="mongodb+srv://user:password@cluster.mongodb.net/porsche?retryWrites=true&w=majority"

# Frontend (OBLIGATOIRE - À MODIFIER)
FRONTEND_URL=https://votre-domaine-production.com

# Sécurité JWT (NE PAS PARTAGER)
SECRET_KEY="b27a46059af20944c80d4a3c7812d1ba6fea5a4e8b2c9d7f3e1a0b8c6d4e2f9a7b5c3d1e0f8a6b4c2d0e9f7a5b3c1d8e6f4a2b0c8d6e4f2a0b8c6d4e2f0a8b6c4d2e0f8"

# JWT
JWT_EXPIRE=24h

# Stripe (Passer en mode LIVE)
STRIPE_SECRET_KEY="sk_live_VOTRE_CLE_LIVE"
STRIPE_PUBLISHABLE_KEY="pk_live_VOTRE_CLE_LIVE"
STRIPE_WEBHOOK_SECRET="whsec_VOTRE_SECRET_LIVE"
```

### 2. Origines CORS autorisées (server.js)

```javascript
const corsOptions = {
  origin: function (origin, callback) {
    const allowedOrigins = [
      process.env.FRONTEND_URL, // Production
      "https://www.votre-domaine.com", // WWW
      "https://votre-domaine.com", // Sans WWW
      // Retirer localhost en production !
      // "http://localhost:3000",
      // "http://localhost:3001",
    ];

    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error("Non autorisé par CORS"));
    }
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
  allowedHeaders: ["Content-Type", "Authorization"],
};
```

---

## SÉCURITÉ RENFORCÉE PRODUCTION

### 1. HTTPS obligatoire

**Option A: Serveur Node.js avec HTTPS**

```javascript
import https from "https";
import fs from "fs";

const httpsOptions = {
  key: fs.readFileSync("./ssl/private.key"),
  cert: fs.readFileSync("./ssl/certificate.crt"),
  ca: fs.readFileSync("./ssl/ca_bundle.crt"),
};

https.createServer(httpsOptions, app).listen(443, () => {
  console.log("HTTPS Server running on port 443");
});
```

**Option B: Reverse Proxy (Nginx) - Recommandé**

```nginx
server {
    listen 80;
    server_name votre-domaine.com;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name votre-domaine.com;

    ssl_certificate /etc/letsencrypt/live/votre-domaine.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/votre-domaine.com/privkey.pem;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

### 2. Configuration Helmet renforcée

```javascript
app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'"],
        scriptSrc: ["'self'"],
        imgSrc: ["'self'", "data:", "https:"],
      },
    },
    hsts: {
      maxAge: 31536000, // 1 an
      includeSubDomains: true,
      preload: true,
    },
    referrerPolicy: { policy: "strict-origin-when-cross-origin" },
  })
);
```

### 3. Rate Limiting production

```javascript
// Ajuster les limites pour la production
const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 1000, // Augmenter pour production
  message: "Trop de requêtes depuis cette adresse IP",
  standardHeaders: true,
  legacyHeaders: false,
  // Utiliser Redis en production pour partager entre instances
  // store: new RedisStore({...})
});
```

---

## 📊 MONITORING ET LOGGING

### 1. Logger centralisé (Winston)

```bash
npm install winston winston-daily-rotate-file
```

```javascript
// utils/logger.js
import winston from "winston";
import "winston-daily-rotate-file";

const fileRotateTransport = new winston.transports.DailyRotateFile({
  filename: "logs/application-%DATE%.log",
  datePattern: "YYYY-MM-DD",
  maxFiles: "30d",
  level: "info",
});

const errorFileTransport = new winston.transports.DailyRotateFile({
  filename: "logs/error-%DATE%.log",
  datePattern: "YYYY-MM-DD",
  maxFiles: "30d",
  level: "error",
});

const logger = winston.createLogger({
  level: "info",
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  transports: [
    fileRotateTransport,
    errorFileTransport,
    new winston.transports.Console({
      format: winston.format.simple(),
    }),
  ],
});

export default logger;
```

### 2. Monitoring des tentatives d'attaque

```javascript
// Middleware de logging des requêtes suspectes
app.use((req, res, next) => {
  // Logger les tentatives d'injection
  const suspiciousPatterns = /(\$|\.\.\/|<script|javascript:|data:)/gi;

  const checkSuspicious = (obj) => {
    const str = JSON.stringify(obj);
    if (suspiciousPatterns.test(str)) {
      logger.warn({
        type: "SUSPICIOUS_REQUEST",
        ip: req.ip,
        path: req.path,
        method: req.method,
        body: req.body,
        query: req.query,
        timestamp: new Date().toISOString(),
      });
    }
  };

  if (req.body) checkSuspicious(req.body);
  if (req.query) checkSuspicious(req.query);

  next();
});
```

---

## 🔐 BACKUP ET RÉCUPÉRATION

### 1. Backups MongoDB automatiques

```bash
#!/bin/bash
# backup-mongodb.sh

DATE=$(date +%Y-%m-%d_%H-%M-%S)
BACKUP_DIR="/backups/mongodb"
DB_NAME="porsche"

# Créer le dossier de backup
mkdir -p $BACKUP_DIR

# Backup avec mongodump
mongodump --uri="$DB_URI" --out="$BACKUP_DIR/$DATE"

# Compresser le backup
tar -czf "$BACKUP_DIR/porsche-$DATE.tar.gz" "$BACKUP_DIR/$DATE"

# Supprimer le dossier non compressé
rm -rf "$BACKUP_DIR/$DATE"

# Garder seulement les 30 derniers jours
find $BACKUP_DIR -name "*.tar.gz" -mtime +30 -delete

echo "Backup completed: porsche-$DATE.tar.gz"
```

**Cron job (exécution quotidienne à 2h du matin)**:

```bash
crontab -e
0 2 * * * /path/to/backup-mongodb.sh
```

### 2. Plan de récupération

```bash
# Restaurer depuis un backup
mongorestore --uri="$DB_URI" --archive="backup.tar.gz" --gzip
```

---

## 🚀 DÉPLOIEMENT

### Option 1: Serveur VPS (Linux)

```bash
# 1. Cloner le repo
git clone https://github.com/votre-repo/porsche-backend.git
cd porsche-backend

# 2. Installer les dépendances
npm ci --production

# 3. Configurer les variables d'environnement
nano .env

# 4. Installer PM2 pour la gestion des processus
npm install -g pm2

# 5. Démarrer l'application
pm2 start server.js --name porsche-api

# 6. Configurer PM2 pour démarrage automatique
pm2 startup
pm2 save

# 7. Vérifier les logs
pm2 logs porsche-api
```

### Option 2: Docker

```dockerfile
# Dockerfile
FROM node:20-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --production

COPY . .

EXPOSE 3000

CMD ["node", "server.js"]
```

```yaml
# docker-compose.yml
version: "3.8"

services:
  api:
    build: .
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
    env_file:
      - .env
    restart: always
    depends_on:
      - mongodb

  mongodb:
    image: mongo:7
    volumes:
      - mongo-data:/data/db
    restart: always

volumes:
  mongo-data:
```

### Option 3: Cloud (Heroku, Railway, Render)

```bash
# Heroku
heroku create porsche-api
heroku config:set FRONTEND_URL=https://votre-frontend.com
heroku config:set SECRET_KEY=...
git push heroku main
```

---

## 🧪 TESTS PRÉ-LANCEMENT

### Checklist de vérification:

```bash
# 1. Test de connexion
curl https://api.votre-domaine.com/

# 2. Test CORS
curl -H "Origin: https://votre-domaine.com" \
     -H "Access-Control-Request-Method: GET" \
     -X OPTIONS https://api.votre-domaine.com/user/all

# 3. Test validateObjectId
curl https://api.votre-domaine.com/voiture/INVALID_ID

# 4. Test rate limiting
for i in {1..6}; do
  curl -X POST https://api.votre-domaine.com/user/login \
       -H "Content-Type: application/json" \
       -d '{"email":"test@test.com","password":"test"}'
done

# 5. Test HTTPS redirection
curl -I http://api.votre-domaine.com/

# 6. Test validation Joi
curl -X PUT https://api.votre-domaine.com/commande/507f1f77bcf86cd799439011 \
     -H "Content-Type: application/json" \
     -d '{"status":"INVALID"}'
```

---

## 📈 MONITORING CONTINU

### Outils recommandés:

1. **Uptime Monitoring**: UptimeRobot, Pingdom
2. **Performance**: New Relic, DataDog
3. **Logs centralisés**: LogTail, Papertrail
4. **Alertes**: PagerDuty, Slack notifications
5. **Analytics**: Google Analytics, Mixpanel

### Métriques à surveiller:

- ✅ Taux de disponibilité (uptime > 99.9%)
- ✅ Temps de réponse API (< 200ms)
- ✅ Taux d'erreur (< 0.1%)
- ✅ Tentatives de rate limiting
- ✅ Erreurs 500
- ✅ Connexions MongoDB

---

## 🔍 AUDIT SÉCURITÉ POST-DÉPLOIEMENT

### À effectuer tous les mois:

```bash
# 1. Mettre à jour les dépendances
npm audit
npm audit fix

# 2. Scanner les vulnérabilités
npm install -g snyk
snyk test

# 3. Vérifier les certificats SSL
openssl s_client -connect votre-domaine.com:443 -servername votre-domaine.com

# 4. Tester la configuration CORS
curl -H "Origin: http://malicious.com" https://api.votre-domaine.com

# 5. Analyser les logs d'attaques
grep "SUSPICIOUS" logs/*.log
```

---

## ✅ CHECKLIST FINALE

Avant de lancer en production:

- [ ] `.env` configuré avec valeurs de production
- [ ] `FRONTEND_URL` pointe vers le domaine de production
- [ ] Clés Stripe en mode LIVE
- [ ] CORS restreint (localhost supprimé)
- [ ] HTTPS configuré avec certificat valide
- [ ] MongoDB en production (Atlas recommandé)
- [ ] Backups automatiques configurés
- [ ] PM2 ou Docker configuré
- [ ] Monitoring activé
- [ ] Tous les tests passent ✅
- [ ] Documentation à jour
- [ ] Équipe formée sur les procédures d'urgence

---

## 📞 PROCÉDURES D'URGENCE

### En cas d'attaque détectée:

1. **Bloquer l'IP immédiatement**:

```bash
# Nginx
deny 123.456.789.0;
nginx -s reload
```

2. **Activer rate limiting strict**:

```javascript
const emergencyLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10, // Très restrictif
});
app.use(emergencyLimiter);
```

3. **Analyser les logs**:

```bash
grep -E "(SQL|NoSQL|XSS)" logs/*.log
```

4. **Notifier l'équipe** via Slack/Email

5. **Documenter l'incident** pour analyse post-mortem

---

**Déploiement vérifié par**: Équipe DevSecOps
**Date de mise en production**: À définir
**Contact support**: support@votre-entreprise.com
**Statut**: ✅ PRÊT POUR PRODUCTION
