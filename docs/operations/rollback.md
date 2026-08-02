# Rollback — StageLink

> Procédures de restauration rapide en cas de problème critique après une release.

## Quand faire un rollback ?

| Situation | Action |
|-----------|--------|
| Erreur 500 systématique | Rollback immédiat |
| Login/register cassé | Rollback immédiat |
| Perte de données | Rollback + restauration backup |
| Régression majeure | Rollback |
| Bug mineur | Hotfix (pas de rollback) |

## Rollback rapide (code)

### 1. Rollback Git

```bash
# Identifier le dernier commit stable
git log --oneline -10

# Rollback au commit précédent
git revert HEAD
git push origin main

# Ou rollback à un commit spécifique
git revert <commit-hash>
git push origin main
```

### 2. Rollback branche de release

```bash
# Si la release est sur une branche séparée
git checkout main
git merge --abort  # Si le merge est en cours
git push origin main
```

## Rollback complet (code + DB + cache)

### Étape 1 : Mode maintenance

```bash
php artisan down
```

### Étape 2 : Rollback code

```bash
# Option A : Git revert
git revert HEAD
git push origin main

# Option B : Revenir à la version précédente
git checkout v1.0.0  # Tag de la version stable
git checkout -b hotfix/rollback
git push origin hotfix/rollback
```

### Étape 3 : Rollback base de données

```bash
# Rollback la dernière migration
php artisan migrate:rollback

# Ou rollback 3 migrations
php artisan migrate:rollback --step=3

# Ou rollback toutes les migrations
php artisan migrate:rollback
```

### Étape 4 : Vider le cache

```bash
php artisan config:clear
php artisan route:clear
php artisan view:clear
php artisan cache:clear
php artisan event:clear
```

### Étape 5 : Rebuild le cache

```bash
php artisan config:cache
php artisan route:cache
php artisan view:cache
php artisan event:cache
```

### Étape 6 : Redémarrer les services

```bash
# Workers
php artisan queue:restart

# Reverb
pkill -f reverb
php artisan reverb:start --port=8080 &
```

### Étape 7 : Vérifier

```bash
# Health check
curl http://localhost:8000/up

# Tests
php artisan test

# Logs
tail -20 storage/logs/laravel.log | grep -i error
```

### Étape 8 : Désactiver le mode maintenance

```bash
php artisan up
```

## Rollback avec restauration backup

Si le problème vient des données :

### 1. Lister les backups

```bash
ls -la storage/app/backups/
```

### 2. Restaurer le backup

```bash
# interactif
php artisan backup:restore

# ou restore de la dernière sauvegarde
php artisan backup:restore --latest
```

### 3. Vérifier l'intégrité

```bash
php artisan tinker --execute="
echo 'Users: ' . App\Models\User::count() . PHP_EOL;
echo 'Internships: ' . App\Models\Internship::count() . PHP_EOL;
echo 'Applications: ' . App\Models\Application::count() . PHP_EOL;
"
```

### 4. Restaurer les fichiers (si nécessaire)

```bash
# Extraire le backup
unzip storage/app/backups/backup-YYYY-MM-DD.zip -d storage/app/public/

# Vérifier le storage link
php artisan storage:link
```

## Rollback frontend (Vercel)

### Option A : Rollback via Vercel CLI

```bash
# Lister les déploiements
vercel ls

# Rollback au déploiement précédent
vercel rollback
```

### Option B : Rollback via Git

```bash
# Revenir au commit précédent
git revert HEAD
git push origin main
# Vercel rebuild automatiquement
```

### Option C : Rollback via dashboard Vercel

1. Aller sur vercel.com
2. Sélectionner le projet
3. Onglet "Deployments"
4. Trouver le dernier déploiement stable
5. Cliquer "..." → "Promote to Production"

## Rollback partiel

### Rollback backend uniquement

```bash
# 1. Rollback code
git revert HEAD
git push origin main

# 2. Rollback migrations si nécessaire
php artisan migrate:rollback --step=1

# 3. Clear cache
php artisan config:clear
php artisan config:cache

# 4. Redémarrer workers
php artisan queue:restart
```

### Rollback frontend uniquement

```bash
# 1. Rollback frontend
cd frontend
git revert HEAD
git push origin main

# 2. Vercel rebuild automatiquement
```

### Rollback base de données uniquement

```bash
# 1. Rollback migrations
php artisan migrate:rollback

# 2. Clear cache
php artisan config:clear
php artisan config:cache

# 3. Redémarrer workers
php artisan queue:restart
```

## Checklists post-rollback

### Rollback simple

- [ ] Service restauré (health check OK)
- [ ] Users peuvent se connecter
- [ ] Fonctionnalités clés testées
- [ ] Sentry vérifié (pas de nouveaux tickets)
- [ ] Logs vérifiés (pas d'erreurs)
- [ ] Communication interne faite

### Rollback avec restauration backup

- [ ] Backup identifié et sélectionné
- [ ] Base de données restaurée
- [ ] Fichiers restaurés (si nécessaire)
- [ ] Intégrité vérifiée (counts)
- [ ] Service restauré
- [ ] Users notifiés (si impact)
- [ ] Post-mortem rédigé

## Prévention

| Action | Fréquence |
|--------|-----------|
| Backup automatique | Quotidien |
| Test restauration staging | Mensuel |
| Test restauration production | Trimestriel |
| Documentation rollback | Après chaque release |
| Review post-rollback | Après chaque incident |

## Temps de rollback estimé

| Étape | Temps |
|-------|-------|
| Mode maintenance | 5 secondes |
| Rollback Git | 30 secondes |
| Rollback migrations | 1 minute |
| Clear + rebuild cache | 30 secondes |
| Redémarrer services | 15 secondes |
| Vérifications | 1 minute |
| **Total estimé** | **~3-4 minutes** |

## Contacts

| Rôle | Responsabilité |
|------|----------------|
| Admin | Décision de rollback |
| Dev | Exécution du rollback |
| Ops | Restauration backup |

## Ressources

- `docs/operations/incident-response.md` — Réponse aux incidents
- `docs/operations/runbook.md` — Guide opérationnel
- `docs/operations/release-process.md` — Processus de release
- `docs/security.md` — Plan de restauration détaillé
- `docs/production-checklist.md` — Checklist pré-déploiement
