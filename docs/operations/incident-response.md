# Réponse aux incidents — StageLink

> Procédures de réponse aux incidents pour StageLink. Un logiciel professionnel est un logiciel qu'on sait restaurer quand quelque chose se passe mal.

## Classification des incidents

| Sévérité | Description | Exemples | Délai de réponse |
|----------|-------------|----------|------------------|
| **P1 - Critique** | Service完全down, perte de données | DB inaccessible, API 500 systématique, fuite de données | 15 minutes |
| **P2 - Haute** | Fonctionnalité clé indisponible | Login cassé, WebSocket down, email non envoyés | 1 heure |
| **P3 - Moyenne** | Fonctionnalité secondaire dégradée | Pagination lente, CSS cassé, search ne marche pas | 4 heures |
| **P4 - Basse** | Amélioration ou bug cosmétique | Typo, couleur incorrecte, feature request | 24 heures |

## Processus de réponse

### 1. Détection

| Source | Action |
|--------|--------|
| Sentry alert | Vérifier le ticket, identifier l'erreur |
| User report | Vérifier le endpoint concerné |
| Monitoring | Vérifier les métriques (CPU, RAM, disque) |
| Logs | `tail -100 storage/logs/laravel.log` |

### 2. Diagnostic

```bash
# État du service
curl -s http://localhost:8000/up

# Logs récents
tail -200 storage/logs/laravel.log | grep -i "error\|critical\|emergency"

# Base de données
php artisan tinker --execute="echo DB::connection()->getPdo() ? 'DB OK' : 'DB FAIL';"

# Queue
php artisan queue:work --once 2>&1

# Espace disque
df -h

# Processus
ps aux | grep -E "php|node|reverb"
```

### 3. Communication

#### Interne (Slack/Discord/Email)

```
🚨 Incident P1 détecté
- Service: Backend API
- Impact: Login impossible pour tous les utilisateurs
- Détection: 14h30
- Status: En cours d'investigation
- Responsable: [Nom]
```

#### Externe (si impact utilisateur)

```
⚠️ StageLink — Incident en cours

Nous rencontrons actuellement des difficultés avec [service].
Notre équipe travaille à résoudre le problème.

Temps de résolution estimé : [X] minutes.

Nous vous tiendrons informés de l'avancement.
```

### 4. Résolution

#### Scénario A : Service down

```bash
# 1. Redémarrer le service
php artisan serve --port=8000 &

# 2. Vérifier
curl http://localhost:8000/up

# 3. Si ne marche pas → rollback
# Voir docs/operations/rollback.md
```

#### Scénario B : Erreur base de données

```bash
# 1. Vérifier MariaDB
mysql -u root -p -e "SHOW PROCESSLIST"

# 2. Tuer les requêtes bloquées
mysql -u root -p -e "KILL [query_id]"

# 3. Si corruption → restaurer backup
php artisan backup:restore
```

#### Scénario C : Fuite de données

```bash
# 1. Couper l'accès immédiatement
# → Mettre APP_DEBUG=false si pas déjà fait
# → Vérifier les logs d'accès

# 2. Notifier les utilisateurs impactés
# → Email obligatoire (RGPD, 72h max)

# 3. Documenter l'incident
# → Date, heure, nature, données impactées
```

#### Scénario D : Attaque DDoS

```bash
# 1. Activer le mode maintenance
php artisan down

# 2. Vérifier les IPs suspectes
grep -oP '\d+\.\d+\.\d+\.\d+' storage/logs/laravel.log | sort | uniq -c | sort -rn | head

# 3. Bloquer les IPs (Cloudflare / firewall)
# → Configurer les règles WAF

# 4. Réactiver
php artisan up
```

### 5. Post-mortem

Après chaque incident P1/P2, rédiger un post-mortem :

```markdown
# Post-mortem — [Date]

## Résumé
- **Incident** : [Description courte]
- **Impact** : [Nombre utilisateurs, durée]
- **Sévérité** : P1/P2/P3

## Chronologie
- HH:MM — Détection
- HH:MM — Investigation
- HH:MM — Résolution

## Cause racine
[Description technique]

## Résolution
[Ce qui a été fait]

## Actions correctives
- [ ] [Action 1] — Responsable — Date
- [ ] [Action 2] — Responsable — Date

## Leçons apprises
- [Ce qu'on a appris]
```

## Procédures spécifiques

### Erreur 500 sur tous les endpoints

```bash
# 1. Vérifier les logs
tail -50 storage/logs/laravel.log

# 2. Vérifier la DB
php artisan tinker --execute="echo 'DB: ' . DB::connection()->getPdo()->getAttribute(PDO::ATTR_SERVER_VERSION);"

# 3. Vérifier les migrations
php artisan migrate:status

# 4. Si migration manquante
php artisan migrate --force

# 5. Si problème de config
php artisan config:clear
php artisan config:cache
```

### Emails ne partent pas

```bash
# 1. Vérifier la config SMTP
php artisan tinker --execute="echo config('mail.mailers.smtp.host');"

# 2. Tester l'envoi
php artisan tinker --execute="
Mail::raw('Test', function(\$m) {
    \$m->to('test@test.com')->subject('Test');
});
echo 'Email sent';
"

# 3. Vérifier les queues
php artisan queue:work --once

# 4. Vérifier Gmail
# → Vérifier que le mot de passe app Gmail est toujours valide
```

### WebSocket ne connecte pas

```bash
# 1. Vérifier Reverb
ps aux | grep reverb

# 2. Vérifier le port
netstat -tlnp | grep 8080

# 3. Redémarrer
pkill -f reverb
php artisan reverb:start --port=8080 &

# 4. Vérifier les logs Reverb
tail -20 storage/logs/laravel.log | grep -i reverb
```

### Login impossible

```bash
# 1. Vérifier la table users
php artisan tinker --execute="echo App\Models\User::where('email', 'user@test.com')->first() ? 'User exists' : 'User not found';"

# 2. Vérifier les tokens
php artisan tinker --execute="echo App\Models\PersonalAccessToken::count() . ' tokens';"

# 3. Vérifier le rate limiting
# → Regarder les logs pour les erreurs 429

# 4. Si token corrompu
php artisan tinker --execute="App\Models\PersonalAccessToken::truncate();"
```

## Checklists post-incident

### Pour les incidents P1

- [ ] Service restauré et vérifié
- [ ] Users notifiés si impact
- [ ] Post-mortem rédigé
- [ ] Actions correctives identifiées
- [ ] Review avec l'équipe planifiée
- [ ] Documentation mise à jour

### Pour les incidents P2

- [ ] Service restauré
- [ ] Cause identifiée
- [ ] Fix déployé
- [ ] Tests passés
- [ ] Sentry nettoyé

### Pour les incidents P3/P4

- [ ] Bug corrigé
- [ ] Tests ajoutés
- [ ] Ticket fermé

## Prévention

| Risque | Prévention | Monitoring |
|--------|------------|------------|
| DB down | Backup quotidien, réplication | Health check |
| Email down | Gmail backup SMTP | Queue monitoring |
| WebSocket down | Auto-restart, health check | Reverb logs |
| Fuite données | Encryption, RBAC, audit | Sentry, logs |
| DDoS | Rate limiting, WAF | CPU, réseau |
| Perte données | Backup 7j/8sem/4mo/2ans | backup:monitor |
| Erreur code | Tests automatisés, CI/CD | Sentry |
| Corruption | Migrations versionnées | DB integrity |

## Ressources

- `docs/operations/runbook.md` — Guide opérationnel
- `docs/operations/rollback.md` — Procédures de rollback
- `docs/operations/release-process.md` — Processus de release
- `docs/security.md` — Politique de sécurité
- `SECURITY.md` — Signalement de failles
- `docs/production-checklist.md` — Checklist pré-déploiement
