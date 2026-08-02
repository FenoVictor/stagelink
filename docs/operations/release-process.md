# Processus de release — StageLink

> Guide étape par étape pour publier une nouvelle version de StageLink en production.

## Types de release

| Type | Description | Exemple | Risque |
|------|-------------|---------|--------|
| **Patch** | Correction de bug | Fix login cassé | Faible |
| **Minor** | Nouvelle fonctionnalité | Ajout favoris | Moyen |
| **Major** | Refonte importante | Nouveau système d'auth | Élevé |

## Pré-release

### 1. Vérifications préalables

```bash
# 1. Tous les tests passent
php artisan test
npx vitest run

# 2. Audit de sécurité
composer audit
npm audit

# 3. Audit des secrets
php artisan secrets:check

# 4. Build production
cd frontend && npm run build

# 5. Audit complet (optionnel mais recommandé)
.\audit.bat
```

### 2. Mise à jour des dépendances

```bash
# Backend
composer update
composer audit

# Frontend
npm update
npm audit

# Si vulnérabilités critiques
composer update <package>
npm audit fix
```

### 3. Préparer le changelog

```markdown
## [X.Y.Z] - YYYY-MM-DD

### Added
- [Feature 1]
- [Feature 2]

### Changed
- [Modification 1]

### Fixed
- [Bug fix 1]

### Security
- [Fix sécurité 1]
```

### 4. Version bump

```bash
# Backend (composer.json)
# → Mettre à jour "version" dans composer.json

# Frontend (package.json)
# → Mettre à jour "version" dans package.json

# Git
git add .
git commit -m "chore: prepare release vX.Y.Z"
```

## Release

### 5. Créer la branche de release

```bash
# Créer la branche
git checkout -b release/vX.Y.Z

# Push
git push origin release/vX.Y.Z
```

### 6. Déployer le backend

```bash
# 1. SSH sur le serveur
ssh user@server

# 2. Pull la branche
git pull origin release/vX.Y.Z

# 3. Installer les dépendances
composer install --no-dev --optimize-autoloader

# 4. Mettre à jour la base de données
php artisan migrate --force

# 5. Vider et rebuild le cache
php artisan config:cache
php artisan route:cache
php artisan view:cache
php artisan event:cache

# 6. Redémarrer les workers
php artisan queue:restart

# 7. Vérifier
php artisan about
php artisan test
```

### 7. Déployer le frontend

```bash
# Option A : Vercel (auto)
# → Push sur main → Vercel build automatiquement

# Option B : Manuel
cd frontend
npm ci
npm run build
# Déployer dist/ sur le serveur web
```

### 8. Redémarrer les services

```bash
# Reverb (WebSocket)
pkill -f reverb
php artisan reverb:start --port=8080 &

# Workers
php artisan queue:work --daemon &

# Vérifier
curl http://localhost:8000/up
```

### 9. Vérifications post-déploiement

```bash
# Health check
curl -s http://localhost:8000/up

# Test manuel
# → Inscription
# → Connexion
# → Offres de stage
# → Candidature
# → Messagerie
# → Notifications

# Vérifier Sentry
# → Pas de nouveaux tickets

# Vérifier les logs
tail -50 storage/logs/laravel.log | grep -i error
```

### 10. Finaliser

```bash
# Merge la branche de release dans main
git checkout main
git merge release/vX.Y.Z
git push origin main

# Tag
git tag -a vX.Y.Z -m "Release vX.Y.Z"
git push origin vX.Y.Z

# Supprimer la branche de release
git branch -d release/vX.Y.Z
git push origin --delete release/vX.Y.Z
```

## Release candidate (RC)

Pour les releases majeures, créer une RC :

```bash
# 1. Créer la branche RC
git checkout -b rc/vX.Y.Z-rc1

# 2. Déployer sur staging
# → Même procédure que production

# 3. Tester pendant 24-72h
# → Tests manuels
# → Monitoring Sentry
# → Feedback utilisateurs

# 4. Si OK → release finale
# Si KO → fix sur la RC, créer rc2
```

## Hotfix (patch urgent)

Pour corriger un bug critique en production :

```bash
# 1. Créer la branche hotfix
git checkout main
git checkout -b hotfix/vX.Y.Z-hotfix

# 2. Corriger le bug
# → Fix minimal, pas de refonte

# 3. Tests
php artisan test
npx vitest run

# 4. Déployer
# → Même procédure que release

# 5. Merge dans main ET develop
git checkout main
git merge hotfix/vX.Y.Z-hotfix
git push origin main

# 6. Tag
git tag -a vX.Y.Z-hotfix -m "Hotfix vX.Y.Z"
git push origin vX.Y.Z-hotfix
```

## Checklist release

### Avant release
- [ ] Tests unitaires passent
- [ ] Tests d'intégration passent
- [ ] Audit sécurité OK
- [ ] Secrets check OK
- [ ] Build frontend OK
- [ ] Changelog rédigé
- [ ] Version bumpée

### Pendant release
- [ ] Branche de release créée
- [ ] Backend déployé
- [ ] Frontend déployé
- [ ] Migrations exécutées
- [ ] Cache rebuild
- [ ] Workers redémarrés
- [ ] Reverb redémarré

### Après release
- [ ] Health check OK
- [ ] Tests manuels OK
- [ ] Sentry propre
- [ ] Logs sans erreur
- [ ] Branche mergée dans main
- [ ] Tag créé
- [ ] Branche de release supprimée

## Fréquence des releases

| Type | Fréquence | Planning |
|------|-----------|----------|
| Patch | Quand nécessaire | Immédiat |
| Minor | Hebdomadaire | Vendredi 16h |
| Major | Mensuelle | Premier lundi |
| Hotfix | Quand nécessaire | Immédiat |

## Communication

### Avant release

```
📢 Release v[X.Y.Z] prévue le [date]

Nouveautés :
- [Feature 1]
- [Feature 2]

Corrections :
- [Bug fix 1]

Downtime estimé : [X] minutes
```

### Après release

```
✅ Release v[X.Y.Z] déployée avec succès

Vérifications :
- Health check ✅
- Tests manuels ✅
- Sentry propre ✅

Merci de votre patience !
```

## Ressources

- `docs/production-checklist.md` — Checklist complète
- `docs/operations/runbook.md` — Guide opérationnel
- `docs/operations/rollback.md` — Procédures de rollback
- `docs/operations/incident-response.md` — Réponse aux incidents
- `audit.bat` — Script de vérification pré-release
