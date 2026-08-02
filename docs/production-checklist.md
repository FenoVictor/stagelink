# Checklist de production — StageLink

## Pré-déploiement

### Environnement
- [ ] `APP_ENV=production`
- [ ] `APP_DEBUG=false`
- [ ] `APP_KEY` générée (base64, 32+ caractères)
- [ ] `APP_URL` configuré (HTTPS)
- [ ] `FRONTEND_URL` configuré (Vercel)
- [ ] `APP_LOCALE=fr`

### Base de données
- [ ] MariaDB accessible
- [ ] `DB_HOST`, `DB_PORT`, `DB_DATABASE`, `DB_USERNAME`, `DB_PASSWORD` configurés
- [ ] `Schema::defaultStringLength(191)` dans `AppServiceProvider::boot()`
- [ ] `php artisan migrate --force` exécuté
- [ ] `php artisan db:seed --force` (si données initiales)

### Sécurité
- [ ] `SESSION_SECURE_COOKIE=true`
- [ ] `SESSION_HTTP_ONLY=true`
- [ ] `SESSION_SAME_SITE=lax`
- [ ] `SESSION_ENCRYPT=true`
- [ ] `BCRYPT_ROUNDS=12`
- [ ] CORS configuré (`stagelink-ten.vercel.app`)
- [ ] CSP headers actifs (SecurityHeaders middleware)
- [ ] SecretsGuard actif (pas en debug)

### Email
- [ ] `MAIL_MAILER=smtp`
- [ ] `MAIL_HOST=smtp.gmail.com`
- [ ] `MAIL_PORT=587`
- [ ] `MAIL_USERNAME` / `MAIL_PASSWORD` configurés
- [ ] `MAIL_ENCRYPTION=tls`
- [ ] `MAIL_FROM_ADDRESS` défini
- [ ] Test envoi email : `php artisan tinker` → `Mail::raw('test', fn($m) => $m->to('test@test.com')->send())`

### WebSocket
- [ ] `BROADCAST_CONNECTION=reverb`
- [ ] `REVERB_APP_KEY`, `REVERB_APP_SECRET`, `REVERB_APP_ID` configurés
- [ ] `REVERB_HOST`, `REVERB_PORT=8080`, `REVERB_SCHEME=wss`
- [ ] Port 8080 ouvert/firewallé
- [ ] Reverb lancé : `php artisan reverb:start`

### Monitoring
- [ ] `SENTRY_LARAVEL_DSN` rempli
- [ ] `VITE_SENTRY_DSN` rempli
- [ ] `SENTRY_TRACES_SAMPLE_RATE` configuré
- [ ] `SENTRY_PROFILES_SAMPLE_RATE` configuré

### Backup
- [ ] Spatie backup installé
- [ ] `backup:clean` planifié (01h00)
- [ ] `app:cleanup-data` planifié (01h30)
- [ ] `backup:run` planifié (02h00)
- [ ] `backup:monitor` planifié (03h00)
- [ ] Stockage `storage/app/backups/` existe

### Queue & Scheduler
- [ ] `QUEUE_CONNECTION=database`
- [ ] File worker lancé : `php artisan queue:work`
- [ ] Cron configuré : `* * * * * php artisan schedule:run`
- [ ] Emails transactionnels en queue (Welcome, ApplicationStatus, etc.)

## Déploiement

### Build
- [ ] `composer install --no-dev --optimize-autoloader`
- [ ] `npm ci && npm run build`
- [ ] `php artisan config:cache`
- [ ] `php artisan route:cache`
- [ ] `php artisan view:cache`
- [ ] `php artisan event:cache`
- [ ] `php artisan storage:link`

### SEO
- [ ] `robots.txt` présent dans `public/`
- [ ] `sitemap.xml` généré
- [ ] `manifest.webmanifest` présent
- [ ] Favicons (SVG + PNG) présentes
- [ ] `og-image.png` générée
- [ ] Meta tags Open Graph dans `index.html`

### Health Check
- [ ] `GET /up` retourne 200
- [ ] Base de données accessible
- [ ] Cache fonctionnel
- [ ] Queue en cours d'exécution

## Post-déploiement

### Vérifications
- [ ] Inscription étudiant fonctionnelle
- [ ] Inscription entreprise fonctionnelle
- [ ] Connexion / déconnexion OK
- [ ] Offres de stage visibles (public)
- [ ] Candidature étudiant OK
- [ ] Réponse entreprise (statut candidature) OK
- [ ] Messagerie temps réel OK (WebSocket)
- [ ] Notifications temps réel OK
- [ ] Upload CV / photo OK
- [ ] Emails transactionnels reçus
- [ ] Page entreprise publique OK
- [ ] Dashboard admin OK
- [ ] Audit log enregistré
- [ ] Export CSV fonctionnel

### Sécurité post-déploiement
- [ ] `php artisan secrets:check` → 0 findings
- [ ] `composer audit` → 0 vulnérabilités
- [ ] `npm audit` → 0 vulnérabilités high/critical
- [ ] Rate limiting actif (login, register, forgot-password)
- [ ] Headers de sécurité présents (CSP, HSTS, X-Frame)
- [ ] Logs accessibles (`storage/logs/laravel.log`)
- [ ] Erreurs 500 monitorées (Sentry)

### Performance
- [ ] Temps de réponse < 500ms (API)
- [ ] Frontend chargé < 3s
- [ ] Images optimisées
- [ ] Cache fonctionnel (Redis/database)

## Rollback

Si problème critique :

```bash
# 1. Activer le mode maintenance
php artisan down

# 2. Restaurer le backup
php artisan backup:restore

# 3. Rollback code (si déployé via Git)
git revert HEAD
git push origin main

# 4. Vider le cache
php artisan cache:clear
php artisan config:clear
php artisan route:clear
php artisan view:clear

# 5. Redémarrer les services
php artisan queue:restart
php artisan reverb:restart

# 6. Désactiver le mode maintenance
php artisan up
```

## Contacts

| Rôle | Responsabilité |
|------|----------------|
| Admin | Déploiement, migration, rollback |
| Dev | Code, tests, correctifs |
| Ops | Serveur, cron, queue, SSL |

## Fréquence des vérifications

| Check | Fréquence |
|-------|-----------|
| Health check (`/up`) | Quotidien |
| Backup monitor | Quotidien |
| Secrets check | Hebdomadaire |
| Audit dépendances | Avant chaque release |
| Test restauration | Mensuel |
| Review logs | Hebdomadaire |
| Update dépendances | Mensuel |
