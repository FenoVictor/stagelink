# Sécurité — StageLink

## Authentification

### Sanctum Token-based
- Inscripton : `POST /api/register` → `Hash::make()` bcrypt → token Sanctum
- Connexion : `POST /api/login` → `Hash::check()` → token Sanctum
- Token stocké côté client via `localStorage` (clé `auth_token`)
- Token transmis via header `Authorization: Bearer <token>`
- Déconnexion : suppression du token côté serveur (`currentAccessToken()->delete()`)
- **MustVerifyEmail** : email verification obligatoire avant accès complet

### Rôles & Permissions
- 3 rôles : `student`, `company`, `admin`
- Middleware `CheckRole` sur les routes API protégées
- Un admin ne peut pas être banni
- Chaque rôle a ses propres routes préfixées (`/api/student/*`, `/api/company/*`, `/api/admin/*`)

### Sessions
- Table `sessions` pour les sessions web (non utilisée en API)
- Table `personal_access_tokens` pour les tokens API Sanctum
- Tokens expirables (configurable)

## Protection des données

### Hachage des mots de passe
- Algorithme : bcrypt via `Hash::make()` (Laravel)
- Coût : 12 rounds (défaut Laravel)
- Jamais de mots de passe en clair dans les logs
- `password` casté comme `hashed` dans le modèle User

### Données sensibles
- Champ `password` exclu des réponses JSON (via `$hidden` sur le model User)
- Token Sanctum jamais exposé dans les logs après création
- CV et photos stockés dans `storage/app/public/` (pas d'accès direct sans token)
- `SENTRY_SEND_DEFAULT_PII = false` par défaut

### Validation des entrées
- Validation Laravel sur chaque endpoint (`$request->validate()`)
- Règles : `required`, `email`, `unique`, `max`, `min`, `confirmed`
- Protection XSS : échappement automatique des données dans les vues Blade
- Protection SQL injection : Eloquent ORM (pas de requêtes raw)

## CORS & Headers

### CORS
- Configuration dans `config/cors.php`
- Frontend autorisé : `http://localhost:5173` (dev), `https://stagelink-ten.vercel.app` (prod)
- Headers autorisés : `Content-Type`, `Authorization`, `X-Requested-With`
- Credentials : `true` (pour Sanctum cookies)

### Headers de sécurité
- `X-Content-Type-Options: nosniff`
- `X-Frame-Options: DENY`
- `X-XSS-Protection: 1; mode=block`
- `Referrer-Policy: strict-origin-when-cross-origin`

## Uploads de fichiers

### Types autorisés
- Photos : `jpeg`, `png`, `jpg`, `webp` — max 2 Mo
- CV : `pdf`, `doc`, `docx` — max 2 Mo
- Logo entreprise : `jpeg`, `png`, `jpg`, `gif`, `webp` — max 2 Mo
- Messages : tous types — max 5 Mo

### Validation
- Vérification du MIME type côté serveur
- Vérification de la taille du fichier
- Noms de fichiers générés aléatoirement (pas de nom original dans le chemin)
- Stockage dans `storage/app/public/` avec symlink `public/storage`

### Exposition
- Fichiers accessibles via `/storage/{path}` (symlink public)
- Pas d'accès direct aux fichiers privés (CV, documents internes)
- Photos de profil accessibles publiquement (pour les entreprises)

## Rate Limiting

### Limites
- Login : 5 tentatives / minute par IP
- Register : 3 tentatives / minute par IP
- Forgot password : 3 tentatives / minute par IP
- API générale : 60 requêtes / minute par token

### Implémentation
- Laravel built-in rate limiter
- Réponse 429 avec header `Retry-After`

## WebSocket (Reverb)

### Sécurité
- Channels privés uniquement (`conversation.{id}`, `user.{id}`)
- Autorisation : vérification que l'utilisateur est participant (conversation) ou propriétaire (user channel)
- Token d'authentification requis pour se connecter
- Pas de channels publics

### Configuration
- `REVERB_APP_KEY` / `REVERB_APP_SECRET` : clés secrètes
- `REVERB_SCHEME` : `wss://` en production
- Pas de données sensibles dans les events broadcast

## Monitoring (Sentry)

### Ce qui est capturé
- Exceptions backend (via `reportable` handler)
- Erreurs frontend (browser tracing, 30% sample rate)
- Breadcrumbs : SQL queries, HTTP requests, logs

### Ce qui n'est PAS capturé
- `SENTRY_SEND_DEFAULT_PII = false` : pas de données personnelles
- `SENTRY_BREADCRUMBS_SQL_BINDINGS = false` : pas de valeurs de requêtes
- Passwords, tokens, clés API jamais envoyés à Sentry

## Backup (Spatie)

### Sécurité des backups
- Stockage local : `storage/app/backups/`
- Chiffrement : `encryption = 'default'` (AES-256 si disponible)
- Mot de passe archive : configurable via `BACKUP_ARCHIVE_PASSWORD`
- Cleanup automatique : 7 jours / 8 semaines / 4 mois / 2 ans

### Notifications
- Email automatique en cas d'échec de backup
- Email en cas de backup non sain (monitoring)

### Plan de restauration

Un backup inutile est un backup qu'on ne sait pas restaurer.

**Comment restaurer ?**

```bash
# 1. Lister les backups disponibles
ls storage/app/backups/

# 2. Restaurer la base de données
php artisan backup:restore
# Sélectionner le zip → choisir "database" → confirmer

# 3. Restaurer les fichiers (si nécessaire)
# Extraire le zip dans storage/app/public/
unzip storage/app/backups/backup-YYYY-MM-DD.zip -d storage/app/public/

# 4. Vider le cache
php artisan config:cache
php artisan route:cache
php artisan view:cache
```

**Temps estimé :**

| Étape | Temps |
|-------|-------|
| Restauration DB (MariaDB ~50 Mo) | ~30 secondes |
| Restauration fichiers (~100 Mo) | ~1 minute |
| Vérification integrity | ~15 secondes |
| Cache rebuild | ~5 secondes |
| **Total estimé** | **~2 minutes** |

**Qui peut restaurer ?**

| Rôle | Droit | Procédure |
|------|-------|-----------|
| Admin | Restauration complète | `php artisan backup:restore` |
| Développeur (via SSH) | Backup + DB | Accès serveur requis |
| Ops (CI/CD) | Backup automatique | GitHub Actions / cron |

**Fréquence des tests de restauration :**

| Action | Fréquence | Responsable |
|--------|-----------|-------------|
| Vérification intégrité backup | Automatique (quotidien) | `backup:monitor` |
| Test restauration DB sur staging | Mensuel | Admin |
| Test restauration complète | Trimestriel | Admin + Dev |
| Documentation mise à jour | Après chaque changement majeur | Dev |

**Checklist restauration :**

- [ ] Backup sélectionné est le bon (date, heure)
- [ ] Base de données restaurée et migrée
- [ ] Fichiers publics restaurés (storage/app/public)
- [ ] Storage link vérifié (`php artisan storage:link`)
- [ ] Cache vidé et rebuild
- [ ] Application fonctionnelle (test manuel)
- [ ] Logs vérifiés (pas d'erreurs post-restauration)
- [ ] notifications/email opérationnels

## Endpoints publics vs protégés

### Publics (pas d'auth requise)
- `GET /api/internships` — liste des offres
- `GET /api/internships/{id}` — détail d'une offre
- `GET /api/cities` — villes
- `GET /api/skills` — compétences
- `GET /api/categories` — catégories
- `GET /api/companies/{id}` — page entreprise publique
- `GET /api/stats` — statistiques publiques
- `GET /api/locations/*` — hiérarchie géographique
- `POST /api/register`, `POST /api/login`, `POST /api/forgot-password`

### Protégés (auth requise)
- Toutes les routes `/api/student/*`, `/api/company/*`, `/api/admin/*`
- `/api/user`, `/api/logout`, `/api/change-password`
- `/api/conversations/*`, `/api/notifications/*`, `/api/favorites`

## Bonnes pratiques

### Vérification des dépendances

Avant chaque release, exécuter l'audit de sécurité des dépendances :

**Backend :**
```bash
cd backend
composer install
composer audit
```

**Frontend :**
```bash
cd frontend
npm install
npm audit
npm audit fix
```

**Audit combiné (rapide) :**
```bash
php artisan app:audit
# ou
.\audit.bat  # vérifie tout : audit + tests + secrets + build
```

Si une vulnérabilité critique est détectée :
1. Mettre à jour la dépendance (`composer update <pkg>` ou `npm audit fix`)
2. Exécuter les tests (`php artisan test` + `npx vitest run`)
3. Vérifier les changements avant publication
4. Ne jamais blocker une release pour une vulnérabilité non critique sans ticket associé

**CI/CD :** `composer audit` et `npm audit --audit-level=high` sont exécutés automatiquement dans GitHub Actions. Une vulnérabilité high/critical bloque le build.

### Pour les développeurs
- Ne jamais commiter de `.env` (utiliser `.env.example`)
- Ne jamais logger de mots de passe ou tokens
- Valider toutes les entrées utilisateur
- Utiliser Eloquent plutôt que du SQL raw
- Exécuter `php artisan test` avant chaque push

### Pour la production
- `APP_ENV=production`, `APP_DEBUG=false`
- `SENTRY_LARAVEL_DSN` rempli
- HTTPS forcé (Vercel + proxy backend)
- Cron configuré pour les backups
- Logs dans `storage/logs/` (rotation)
