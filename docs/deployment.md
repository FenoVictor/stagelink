# Déploiement — StageLink

## Environnements

| Environnement | Backend | Frontend | WebSocket | URL |
|---------------|---------|----------|-----------|-----|
| Local | localhost:8000 | localhost:5173 | localhost:8080 | — |
| Production | twenty-deer-appear.loca.lt | stagelink-ten.vercel.app | wss://... | — |

## Prérequis

- PHP 8.3+ avec extensions: pdo_mysql, mbstring, openssl, tokenizer, bcmath, gd, fileinfo
- Node.js 20+
- MariaDB 10.6+
- Composer 2.x
- Git

## Installation locale

```bash
# Cloner
git clone https://github.com/VICTOR-T-VARDA/Stagelink.git
cd Stagelink

# Backend
cd backend
composer install
cp .env.example .env
php artisan key:generate
# Configurer .env (DB, MAIL, REVERB)
php artisan migrate:fresh --seed --force

# Frontend
cd ../frontend
npm install
cp .env.example .env
# Configurer .env (VITE_API_URL, VITE_REVERB_*)
```

## Variables d'environnement

### Backend (.env)

| Variable | Description | Exemple |
|----------|-------------|---------|
| APP_NAME | Nom de l'app | StageLink |
| APP_URL | URL backend | http://localhost:8000 |
| APP_ENV | Environnement | local / production |
| APP_KEY | Clé générée | base64:... |
| DB_CONNECTION | Pilote DB | mysql |
| DB_HOST | Hôte MariaDB | 127.0.0.1 |
| DB_PORT | Port | 3306 |
| DB_DATABASE | Nom DB | stagelink |
| DB_USERNAME | Utilisateur DB | root |
| DB_PASSWORD | Mot de passe DB | — |
| FRONTEND_URL | URL frontend | http://localhost:5173 |
| MAIL_MAILER | Pilote email | smtp |
| MAIL_HOST | Serveur SMTP | smtp.gmail.com |
| MAIL_PORT | Port SMTP | 587 |
| MAIL_USERNAME | Email SMTP | votre.email@gmail.com |
| MAIL_PASSWORD | Mot de passe app | (générer dans Compte Google → Sécurité → Mots de passe d'application) |
| MAIL_ENCRYPTION | TLS | tls |
| MAIL_FROM_ADDRESS | Expéditeur | noreply@stagelink.fr |
| MAIL_FROM_NAME | Nom expéditeur | StageLink |
| BROADCAST_CONNECTION | WebSocket driver | reverb |
| REVERB_APP_ID | ID Reverb | local |
| REVERB_APP_KEY | Clé publique | local-key |
| REVERB_APP_SECRET | Clé secrète | local-secret |
| REVERB_HOST | Hôte Reverb | localhost |
| REVERB_PORT | Port | 8080 |
| REVERB_SCHEME | Protocole | http |
| SENTRY_LARAVEL_DSN | DSN Sentry (optionnel) | https://...@...ingest.sentry.io/... |
| BACKUP_NOTIFY_EMAIL | Email notifications backup | votre.email@gmail.com |

### Frontend (.env)

| Variable | Description | Exemple |
|----------|-------------|---------|
| VITE_API_URL | URL API backend | http://localhost:8000/api |
| VITE_REVERB_APP_KEY | Clé Reverb | local-key |
| VITE_REVERB_HOST | Hôte Reverb | localhost |
| VITE_REVERB_PORT | Port | 8080 |
| VITE_REVERB_SCHEME | Protocole | http |
| VITE_SENTRY_DSN | DSN Sentry frontend (optionnel) | https://... |

## Démarrage

```bash
# Terminal 1 — Backend
cd backend
php artisan serve --port=8000

# Terminal 2 — WebSocket
cd backend
php artisan reverb:start --port=8080

# Terminal 3 — Frontend
cd frontend
npm run dev
```

Ou utiliser les scripts inclus :
```bash
# Windows
.\start.bat

# PowerShell
.\start.ps1
```

## Déploiement Backend (VPS / Render)

1. Cloner le repo sur le serveur
2. `composer install --optimize-autoloader --no-dev`
3. Configurer `.env` avec les vraies clés
4. `php artisan key:generate`
5. `php artisan migrate --force`
6. `php artisan config:cache && php artisan route:cache && php artisan view:cache`
7. Configurer le cron :
   ```bash
   * * * * * cd /path/to/backend && php artisan schedule:run >> /dev/null 2>&1
   ```
8. Démarrer Reverb : `php artisan reverb:start --port=8080`
9. Configurer le serveur web (Nginx/Apache) pour servir `public/`

## Déploiement Frontend (Vercel)

1. Connecter le repo GitHub sur Vercel
2. Configuration :
   - **Framework Preset**: Vite
   - **Root Directory**: `frontend`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
3. Variables d'environnement à ajouter dans Vercel :
   - `VITE_API_URL` = URL du backend production
   - `VITE_REVERB_APP_KEY`, `VITE_REVERB_HOST`, `VITE_REVERB_PORT`, `VITE_REVERB_SCHEME`
4. Le déploiement se fait automatiquement à chaque push sur `main`

## Backup automatique

Spatie Laravel Backup configure 3 crons via `routes/console.php` :
- **01:00** — `backup:clean` : supprime les vieilles sauvegardes
- **02:00** — `backup:run` : DB + uploads + config
- **03:00** — `backup:monitor` : vérifie la santé

Politique de rétention :
- 7 jours : toutes les sauvegardes
- 8 semaines : backup hebdomadaire
- 4 mois : backup mensuel
- 2 ans : backup annuel

Stockage : `storage/app/backups/` (max 5 Go)

## Monitoring (Sentry)

### Backend
```php
// bootstrap/app.php
$exceptions->reportable(function (\Throwable $e) {
    if (app()->bound('sentry')) {
        app('sentry')->captureException($e);
    }
});
```

### Frontend
```js
// main.jsx
if (import.meta.env.VITE_SENTRY_DSN) {
  Sentry.init({
    dsn: import.meta.env.VITE_SENTRY_DSN,
    integrations: [Sentry.browserTracingIntegration()],
    tracesSampleRate: 0.3,
    environment: import.meta.env.MODE,
  });
}
```

## SSL / HTTPS

- **Vercel**: SSL automatique (Let's Encrypt)
- **Backend**: Configurer via Nginx ou le proxy du fournisseur
- **Reverb**: Utiliser `wss://` en production

## Vérification post-déploiement

```bash
# Backend
php artisan about          # Vérifier config
php artisan route:list     # Vérifier routes
php artisan test           # 31 tests doivent passer

# Frontend
npm run build              # Vérifier build
npx vitest run             # 25 tests doivent passer
```
