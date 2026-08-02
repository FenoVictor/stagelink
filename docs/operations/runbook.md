# Runbook — StageLink

> Guide opérationnel pour les personnes qui exploitent, surveillent et maintiennent StageLink en production.

## Vue d'ensemble des services

| Service | Technologie | Port | Rôle |
|---------|------------|------|------|
| Backend API | Laravel 13 + PHP 8.3 | 8000 | API REST, auth, logique métier |
| Frontend | React + Vite | 5173 (dev) / Vercel (prod) | SPA utilisateur |
| WebSocket | Laravel Reverb | 8080 | Messages temps réel, notifications |
| Base de données | MariaDB | 3306 | Stockage persistant |
| Cache | File-based / Redis | — | Sessions, cache routes |
| Email | Gmail SMTP | 587 | Emails transactionnels |
| Monitoring | Sentry | — | Capture erreurs |

## Commandes essentielles

### Démarrer les services

```bash
# Backend API
cd backend
php artisan serve --port=8000

# WebSocket
cd backend
php artisan reverb:start --port=8080

# Frontend
cd frontend
npm run dev

# Tout d'un coup (Windows)
.\start.bat
```

### Arrêter les services

```bash
# Backend
pkill -f "artisan serve"

# Reverb
pkill -f "reverb:start"

# Frontend
pkill -f "vite"
```

### Vérifier l'état

```bash
# Health check
curl http://localhost:8000/up

# Routes
php artisan route:list

# Configuration
php artisan about

# Logs récents
tail -50 storage/logs/laravel.log
```

## Surveillance quotidienne

### Matin (9h00)

```bash
# 1. Vérifier les erreurs de la nuit
tail -100 storage/logs/laravel.log | grep -i "error\|critical\|emergency"

# 2. Vérifier les backups
ls -la storage/app/backups/ | tail -5

# 3. Vérifier la base de données
php artisan tinker --execute="echo App\Models\User::count() . ' users';"

# 4. Vérifier Sentry
# → Dashboard Sentry : pas de nouveaux tickets critiques
```

### MIDI (12h00)

```bash
# 1. Health check
curl -s http://localhost:8000/up | head -1

# 2. Vérifier les queues
php artisan queue:work --once 2>&1 | head -5

# 3. Espace disque
df -h | grep -E '/$|/home'
```

### Fin de journée (18h00)

```bash
# 1. Vérifier les logs d'erreur
wc -l storage/logs/laravel.log

# 2. Vérifier les tokens actifs
php artisan tinker --execute="echo App\Models\PersonalAccessToken::count() . ' active tokens';"

# 3. Backup manuel (si nécessaire)
php artisan backup:run
```

## Maintenance hebdomadaire

### Lundi

```bash
# 1. Audit des dépendances
composer audit
npm audit

# 2. Nettoyage du cache
php artisan cache:clear
php artisan config:clear
php artisan route:clear
php artisan view:clear

# 3. Rebuild du cache
php artisan config:cache
php artisan route:cache
php artisan view:cache

# 4. Vérification des secrets
php artisan secrets:check
```

### Vendredi

```bash
# 1. Test de restauration backup (sur staging)
php artisan backup:restore

# 2. Revue des logs
grep -c "ERROR" storage/logs/laravel.log

# 3. Vérification des crons
crontab -l
```

## Maintenance mensuelle

### Premier lundi du mois

```bash
# 1. Mise à jour des dépendances
composer update
npm update

# 2. Tests complets
php artisan test
npx vitest run

# 3. Audit complet
php artisan app:audit

# 4. Nettoyage des anciens logs
php artisan cleanup-old-data

# 5. Revue de la sécurité
# → Vérifier SECURITY.md
# → Vérifier les nouveaux CVE
```

## Procédures d'urgence

### Service down

```bash
# 1. Diagnostiquer
curl -v http://localhost:8000/up
php artisan about
tail -20 storage/logs/laravel.log

# 2. Redémarrer
php artisan serve --port=8000 &

# 3. Vérifier
curl http://localhost:8000/up
```

### Base de données down

```bash
# 1. Vérifier MariaDB
mysql -u root -p -e "SELECT 1"

# 2. Redémarrer MariaDB
# Windows : via WampManager
# Linux : sudo systemctl restart mariadb

# 3. Vérifier la connexion
php artisan tinker --execute="echo DB::connection()->getPdo() ? 'OK' : 'FAIL';"
```

### WebSocket down

```bash
# 1. Vérifier Reverb
ps aux | grep reverb

# 2. Redémarrer
php artisan reverb:start --port=8080 &

# 3. Vérifier les channels
php artisan tinker --execute="echo 'Reverb OK';"
```

### Espace disque plein

```bash
# 1. Vérifier l'usage
du -sh storage/app/backups/*
du -sh storage/logs/*
du -sh storage/app/public/*

# 2. Nettoyer les vieux backups
php artisan backup:clean

# 3. Nettoyer les logs
php artisan cleanup-old-data

# 4. Nettoyer le cache
php artisan cache:clear
```

### Erreur Sentry

```bash
# 1. Voir l'erreur
# → Dashboard Sentry

# 2. Vérifier les logs
tail -200 storage/logs/laravel.log | grep -A5 -B5 "ERROR"

# 3. Diagnostiquer
php artisan tinker --execute="echo 'Debug: ' . config('app.debug');"

# 4. Corriger et tester
php artisan test
```

## Logs à surveiller

| Log | Emplacement | Rotation |
|-----|-------------|----------|
| Application | `storage/logs/laravel.log` | Quotidien |
| Access (Nginx) | `/var/log/nginx/access.log` | Hebdomadaire |
| Error (Nginx) | `/var/log/nginx/error.log` | Hebdomadaire |
| PHP-FPM | `/var/log/php-fpm/error.log` | Hebdomadaire |
| MariaDB | `/var/log/mariadb/mariadb.log` | Mensuel |
| Sentry | Dashboard cloud | — |

## Alertes automatiques

| Alerte | Source | Action |
|--------|--------|--------|
| Exception critique | Sentry | Vérifier et corriger |
| Backup échoué | Spatie | Restaurer manuellement |
| Espace disque < 10% | Monitoring | Nettoyer |
| CPU > 80% pendant 5min | Monitoring | Diagnostiquer |
| Requête DB > 2s | Laravel logs | Optimiser |
| Rate limit dépassé | Logs | Vérifier si attaque |

## Contacts

| Rôle | Responsabilité | Disponibilité |
|------|----------------|---------------|
| Admin | Déploiement, migration, rollback | 24/7 en urgence |
| Dev | Code, tests, correctifs | Heures ouvrées |
| Ops | Serveur, cron, queue, SSL | Heures ouvrées |

## Ressources

- `docs/architecture.md` — Architecture technique
- `docs/security.md` — Politique de sécurité
- `docs/deployment.md` — Guide de déploiement
- `docs/production-checklist.md` — Checklist pré-déploiement
- `SECURITY.md` — Signalement de failles
- Sentry dashboard — Monitoring erreurs
