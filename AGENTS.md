# StageLink - Notes & Commandes

## PHP
- Binaires disponibles : `C:\wamp64\bin\php\php8.3.28\php.exe`
- Ne pas utiliser `C:\laragon\bin\php\*` (inaccessible depuis le shell)

## Backend
- `php artisan migrate:fresh --seed --force` - reset + seed
- `php artisan serve --port=8000` - démarrer le serveur
- `Schema::defaultStringLength(191)` requis dans `AppServiceProvider::boot()` pour MariaDB
- Traductions françaises dans `lang/fr/` (validation, auth, passwords, pagination)
- `APP_LOCALE=fr` dans `.env`

## Frontend
- `npm run dev` - serveur dev
- `npm run build` - build production
- `recharts` installé pour les graphiques

## Lancement
- `.\start.bat` depuis la racine (ou start.ps1)
- Backend: port 8000, Frontend: port 5173, WebSocket: port 8080

## Sprints réalisés

### Sprint 5 – Fonctionnalités clés
- Recherche offres avec filtres (mot-clé, localisation, type, durée, niveau, rémunéré)
- Pagination, tri, recherche debounced
- Favoris (toggle + liste)
- Notifications (liste, marquage lecture, tout lu, badge sidebar)
- Profil entreprise (logo, infos)
- Messagerie (conversations, messages, fichiers joints)
- Dashboard étudiant (stats, progression, badges, offres recommandées, astuce)
- Dashboard entreprise (stats, candidatures récentes, messages)
- Dashboard admin (stats globales, utilisateurs récents)

### Sprint 6 – Profil étudiant intelligent
- Score readiness (10 critères) + conseil contextualisé
- Photo : modal aperçu → canvas crop/compress 500×500 JPEG 80%
- Compétences en tags cyclables (Débutant→Expert) + suppression
- Formation : diplôme, niveau (L1–M2), dates début/fin
- CV : `cv_uploaded_at`, affiché dans le profil
- Auto-save debounce 3s
- Auto-assign quartier proposé au profil

### Sprint 7 – Améliorations UX
- Landing page dynamique (6 dernières offres)
- LocationSelector hiérarchie complète restaurée
- Export CSV candidatures
- Stats vues profil/CV
- Filtre `city_id` pour internships

### Sprint 8 – Priorités moyennes
- **Cache listes déroulantes** : `utils/cache.js` (localStorage + TTL), appliqué à `locationService`, `skillService`, `cityService`
- **Point d'accès public `GET /categories`** + `categoryService` frontend, correction bug 403 étudiant
- **Graphiques admin** (recharts) : BarChart (utilisateurs/offres 12 mois), LineChart (candidatures), 3 PieCharts (répartition, statut, vérification)
- **Page entreprise publique** (`/entreprise/:id`) : `PublicCompanyController`, logo, infos, offres publiées, liens cliquables
- **Chat modal inline** : `ChatModal` remplace la redirection vers `/messages` par une modale dans la page offres

### Sprint 9 – Mode sombre & Multi-langue
- **Mode sombre** : `ThemeContext.jsx` (localStorage + préférence système), `@custom-variant dark` Tailwind v4, toggle bouton lune/soleil dans header + pages publiques, classes `dark:` sur tous les composants UI (Card, Modal, Input, Select, Button, Badge, Pagination, AuthLayout, DashboardLayout, Home)
- **Multi-langue** : `react-i18next` + `i18next`, fichiers `i18n/fr.js` et `i18n/en.js` (~200 clés), `LanguageSwitcher` avec dropdown Globe, détection auto navigateur, persist localStorage. Pages traduites : Home, Login, Register, DashboardLayout (navigation complète), messages chat, statuts, profils ; `~250 clés` au total
- **Profile.jsx i18n** : toutes les sections traduites (infos perso, bio, localisation, formation, compétences, langues, liens, CV, password) via `useTranslation` ; clés `studentProfile.*` complétées dans fr/en (`bioPlaceholder`, etc.)

### Sprint 10 – Qualité & Temps réel
- **Vérification email** : `MustVerifyEmail` sur User, `VerifyEmailNotification` (signed URL), `EmailVerificationController` (verify + resend), page `VerifyEmail.jsx`, bannière amber dans DashboardLayout pour comptes non vérifiés
- **Tests automatisés PHPUnit** : 31 tests dans 5 fichiers (AuthTest, InternshipTest, ProfileTest, SkillTest, NotificationTest), SQLite in-memory, guards MySQL-only migrations
- **Tests automatisés Vitest** : 25 tests dans 4 fichiers (cache, Badge, Button, constants), setup `vitest.config.js` + `@testing-library/react`
- **CI/CD GitHub Actions** : `.github/workflows/ci.yml` — backend-tests (MariaDB service, PHP 8.3) + frontend-tests (Node 20)
- **WebSocket temps réel** : Laravel Reverb v1.11, `NewMessage` + `NewNotification` broadcast events, channels privés `conversation.{id}` + `user.{id}`, frontend `laravel-echo` + `pusher-js`, broadcast service (`broadcast.js`), replacement du polling 30s dans NotificationBell, ChatModal et Messages.jsx, auto-connect/disconnect via AuthContext

### Sprint 11 – Production-ready
- **Email mot de passe oublié** : `ForgotPassword` Mailable + template Blade, envoi via `Mail::to()->queue()`, token 60min
- **SEO complet** : Open Graph + Twitter Cards dans `index.html`, `robots.txt`, `sitemap.xml`, `react-helmet-async` pour meta dynamiques (Home, CompanyPublic)
- **Analytics dynamiques** : `% profils complétés` calculé (bio + school + major + phone) au lieu de valeur hardcodée
- **Monitoring externe** : `sentry/sentry-laravel` (backend exceptions + tracing), `@sentry/react` (frontend browser tracing), config `SENTRY_LARAVEL_DSN`
- **Backup automatique** : `spatie/laravel-backup` v10, dump DB quotidien 02h00, cleanup 01h00, monitoring 03h00, stockage local `storage/app/backups`
- **Doc architecture** : `docs/architecture.md` complète (stack, dossiers, flux, auth, WebSocket, emails, monitoring, tests)

### Sprint 12 – Sécurité & Gouvernance
- **Rate limiting** : `throttle:5,60` login, `throttle:3,60` register/forgot-password, réponse 429 JSON français
- **SecurityHeaders middleware** : CSP strict (`script-src 'self'`, `frame-ancestors 'none'`), HSTS, X-Frame-Options DENY, nosniff, referrer strict-origin, Permissions-Policy
- **Cookie hardening** : `SESSION_SECURE_COOKIE=true`, `SESSION_HTTP_ONLY=true`, `SESSION_SAME_SITE=lax`, `SESSION_ENCRYPT=true`
- **8 Policies Laravel** : Student, Company, Application, Conversation, Message, Notification, Internship, Interview — dans `AuthServiceProvider`, `$this->authorize()` dans 6 controllers
- **Audit Log** : `AuditService::log()`, migration enhanced (+6 colonnes : subject_type, subject_id, metadata, browser, result, description), 16 événements trackés, `AdminAuditLogController` (index/export/actions), page frontend `/admin/audit-log` avec filtres + export CSV
- **GDPR** : `GdprController` (export JSON, delete avec anonymisation), `CleanupOldData` artisan command (notifications >1yr, messages >1yr, logs >3yr), page `/data-protection`
- **Secrets management** : `config/secrets.php` (8 clés), `SecretsGuard` middleware (redact errors), `secrets:check` command, `AdminSecurityController`, page `/admin/security`
- **Dependency audit** : `AppAudit` command (composer + npm), `audit.bat` pré-release (6 étapes), CI/CD block high/critical, dompdf → v3.1.6, guzzle → v7.15.1
- **SECURITY.md** : Politique de signalement de failles (email, processus, temps de réponse, confidentialité)
- **Production checklist** : `docs/production-checklist.md` — déploiement, rollback, fréquence vérifications

### Sprint 13 – Performance & Optimisation
- **N+1 query fixes** (15 controllers) : eager loading `company`, `student`, `internship`, `city` partout ; `StudentDashboardController` réécrit (pré-chargement map skills, extraction `$active` au lieu de 5x `firstWhere`, eager load `activeInternships.internship.company`) — réduction ~1550 requêtes/dashboard
- **Pagination universelle** : 11 endpoints convertis `→get()` vers `→paginate()` (ApplicationController, CompanyApplicationController, CompanyInternshipController, InterviewController, FavoriteController, ConversationController, StudentInternshipController, NeighborhoodController, etc.) ; limites ajoutées (PublicCompanyController→50, AdminAuditLog export→10000, password resets→50)
- **24 index de performance** : migration `2026_07_26_100000_add_performance_indexes` — `internships.status`, `notifications(user_id, read_at)`, `users.role/status/deleted_at`, `companies.status/deleted_at`, `messages(conversation_id, created_at)`, `activity_logs(user_id, created_at)`, `applications.status`, `neighborhoods.verified`, `conversations(student_id, company_id)`
- **AdminCompanyController** : suppression du eager load inutile `internships` (gardé `withCount`)
- **CompanyProfileController** : eager load `city` ajouté
- **StudentPublicController** : suppression requête redondante skills (utilise collection déjà chargée)
- **Code splitting frontend** : Dashboard.jsx split en 5 fichiers (`Dashboard.jsx` router, `StudentDashboard.jsx`, `CompanyDashboard.jsx`, `AdminDashboard.jsx`, `AdminCharts.jsx`) + `shared.jsx` ; recharts lazy-loaded uniquement pour admin (~400KB hors bundle student/company)
- **Sentry dynamique** : `import("@sentry/react")` conditionnel dans `main.jsx` (~300KB de moins quand DSN non configuré)
- **Vite manualChunks** : vendor (react/react-dom/router: 182KB), ui (lucide/toast: 29KB), i18n (56KB) — chunks séparés
- **Résultat** : index principal `index.js` 246KB (vs 484KB avant), recharts 397KB lazy-only, student/company dashboards ~6-10KB chacun

### Sprint 14 – Sécurité avancée
- **2FA (Double authentification)** : `pragmarx/google2fa-laravel` v3.0.1, colonnes `two_factor_secret`/`two_factor_recovery_codes`/`two_factor_confirmed_at` sur `users`, `TwoFactorController` (status/enable/confirm/disable/qr-code), flux login en 2 étapes (temp token `2fa-pending` → vérification TOTP → vrai token), 8 recovery codes hashés, QR code `otpauth://`
- **Journal de connexions** : table `login_logs` (user_id, email, ip_address, user_agent, browser, success, suspicious, failure_reason), `LoginLogService` enregistre chaque connexion/échec, `AdminLoginLogController` (index avec filtres/stats/export CSV)
- **Détection connexions inhabituelles** : comparaison IP + user_agent avec dernière connexion réussie, email d'alerte `LoginAlert` (template HTML table-based) envoyé si changement détecté
- **Rotation des clés API** : `TokenController` (list/create/rotate/revoke), tokens expirent à 30 jours, rotation = révocation de tous les anciens + création d'un nouveau, gestion frontend dans `/tokens`
- **Pages frontend** : `TwoFactorSettings.jsx` (activation avec QR code + recovery codes + désactivation), `LoginLogs.jsx` (stats + tableau + filtres + export CSV), `TokenManagement.jsx` (liste + création + rotation + révocation)
- **Sidebar** : Double authentification + Clés API pour tous les rôles, Journal de connexions pour admin
- **124 tests backend ✓, 69 tests frontend ✓, build 2.5s ✓**

### Sprint 15 – Feedback utilisateur
- **Bouton flottant global** : `FeedbackWidget.jsx` (fixed bottom-5 right-5, lucide Lightbulb) monté dans `App.jsx` — visible sur toutes les pages, ouvert aussi via CustomEvent `stagelink:open-feedback` (lien footer Home)
- **Formulaire** : type (feature/improvement/bug/general), message obligatoire (min 10, max 3000), note 1-5 étoiles, nom+email optionnels pour visiteurs, utilisateur connecté auto-identifié (bearer token sur route publique via `auth('sanctum')`)
- **Table `feedbacks`** : user_id nullable, type, message, rating, name, email, status (new/read/in_progress/done/declined), admin_note, timestamps, 3 index
- **Backend** : `FeedbackController` (store public + admin index/update/stats), modèle `Feedback` (`$table='feedbacks'` — Laravel pluralise mal `feedback`), `NewFeedback` Mailable + template Blade, email → `config('services.feedback.email')` (`FEEDBACK_EMAIL` dans .env)
- **Anti-spam** : `throttle:5,60` sur `POST /api/feedback`
- **Audit log** : événements `feedback.submitted` + `feedback.updated`
- **Page admin** `/admin/feedback` : stats (total + par statut + note moyenne), filtres (recherche/statut/type), tableau paginé, modal détail avec changement de statut + note privée
- **132 tests backend ✓, 69 tests frontend ✓, build 5.5s ✓**

## Priorités restantes (sprints dédiés)

| Priorité | Description |
|----------|-------------|
| 🟠 Tests automatisés | ✅ PHPUnit 124 tests + Vitest 69 tests |
| 🟠 CI/CD | ✅ GitHub Actions (backend + frontend) |
| 🟢 Validation email | ✅ MustVerifyEmail + page verification |
| 🔴 WebSocket temps réel | ✅ Laravel Reverb + Echo |
| 🟠 Emails transactionnels | ✅ 5 types (candidature, entretien, statut, forgot pwd, vérification) |
| 🟠 SEO | ✅ Open Graph, robots.txt, sitemap.xml, Helmet |
| 🟢 Analytics | ✅ Stats publiques dynamiques |
| 🟠 Monitoring | ✅ Sentry backend + frontend |
| 🔴 Backup | ✅ Spatie backup quotidien auto |
| 🔴 Performance | ✅ N+1 fixes, pagination, 24 indexes, code splitting, Sentry dynamique |
| 🔴 Sécurité avancée | ✅ 2FA TOTP, journal connexions, détection inhabituel, rotation clés API |

## Architecture
- `frontend/src/utils/cache.js` — Cache localStorage avec TTL (1h défaut)
- `frontend/src/components/chat/ChatModal.jsx` — Modal de chat inline
- `frontend/src/components/common/ThemeToggle.jsx` — Bascule mode sombre/clair
- `frontend/src/components/common/LanguageSwitcher.jsx` — Sélecteur langue
- `frontend/src/context/ThemeContext.jsx` — Contexte thème dark/light
- `frontend/src/i18n/fr.js` — Traductions françaises
- `frontend/src/i18n/en.js` — Traductions anglaises
- `frontend/src/services/categoryService.js` — Service catégories avec cache
- `frontend/src/services/broadcast.js` — Laravel Echo + Reverb (WebSocket)
- `backend/app/Events/NewMessage.php` — Event broadcast messages temps réel
- `backend/app/Events/NewNotification.php` — Event broadcast notifications temps réel
- `backend/routes/channels.php` — Broadcast channels privés
- `backend/app/Http/Controllers/Api/CategoryController.php` — Endpoint public catégories
- `backend/app/Http/Controllers/Api/PublicCompanyController.php` — Page entreprise publique
- `backend/app/Http/Controllers/Api/PublicStatsController.php` — Statistiques publiques landing
- `backend/app/Mail/ForgotPassword.php` — Email mot de passe oublié
- `backend/resources/views/emails/forgot-password.blade.php` — Template email reset
- `config/sentry.php` — Monitoring Sentry
- `config/backup.php` — Backup Spatie (quotidien)
- `docs/architecture.md` — Doc architecture complète
- `SECURITY.md` — Politique de signalement de failles
- `docs/production-checklist.md` — Checklist déploiement production
- `docs/operations/runbook.md` — Runbook opérationnel
- `docs/operations/incident-response.md` — Réponse aux incidents
- `docs/operations/release-process.md` — Processus de release
- `docs/operations/rollback.md` — Procédures de rollback
