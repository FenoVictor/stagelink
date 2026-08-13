# Architecture Technique - StageLink

## Vue d'ensemble

StageLink est une plateforme de mise en relation étudiants-entreprises pour les stages à Madagascar, construite avec Laravel 13 (backend API) et React + Vite (frontend SPA).

## Stack technique

| Couche | Technologie | Version |
|--------|------------|---------|
| Backend | Laravel | 13.x |
| Auth | Laravel Sanctum | Token-based |
| Base de données | MariaDB | — |
| Frontend | React + Vite | 18.x / 8.x |
| UI | Tailwind CSS | v4 |
| État | React Query | @tanstack/react-query |
| Temps réel | Laravel Reverb | 1.11 |
| Monitoring | Sentry | 4.27 |
| Backup | Spatie Laravel Backup | 10.3 |
| SEO | react-helmet-async | 3.x |
| Tests | PHPUnit / Vitest | — |

## Architecture backend

```
backend/
├── app/
│   ├── Console/              # Commandes artisan (AppAudit, CleanupOldData, secrets:check, etc.)
│   ├── Events/               # Events broadcast (NewMessage, NewNotification)
│   ├── Http/
│   │   ├── Controllers/Api/  # Controllers REST
│   │   │   ├── AuthController             # Login, register, forgot/reset password, 2FA login
│   │   │   ├── ApplicationController      # Candidatures étudiant
│   │   │   ├── CompanyApplicationController  # Gestion candidatures entreprise
│   │   │   ├── ConversationController     # Conversations messaging
│   │   │   ├── MessageController          # Messages (broadcast temps réel)
│   │   │   ├── NotificationController     # Notifications
│   │   │   ├── InternshipController       # Offres de stage CRUD
│   │   │   ├── StudentProfileController   # Profil étudiant
│   │   │   ├── CompanyProfileController   # Profil entreprise
│   │   │   ├── InterviewController        # Entretiens
│   │   │   ├── AdminStatsController       # Stats admin détaillées
│   │   │   ├── PublicStatsController      # Stats publiques landing
│   │   │   ├── PublicCompanyController    # Page entreprise publique
│   │   │   ├── CategoryController         # Catégories (public)
│   │   │   ├── EmailVerificationController  # Vérification email (verify + resend)
│   │   │   ├── TwoFactorController        # 2FA TOTP (status/enable/confirm/disable/qr-code)
│   │   │   ├── TokenController            # Clés API (list/create/rotate/revoke)
│   │   │   ├── AdminLoginLogController    # Journal de connexions admin
│   │   │   ├── AdminAuditLogController    # Journal d'audit (index/export/actions)
│   │   │   ├── AdminSecurityController    # Page sécurité admin (secrets)
│   │   │   ├── GdprController             # Export/suppression RGPD
│   │   │   ├── FeedbackController         # Feedback utilisateurs
│   │   │   ├── UserSearchController       # Recherche d'utilisateurs
│   │   │   ├── LocationController         # Hiérarchie géographique
│   │   │   ├── NeighborhoodController     # Quartiers (CRUD + validation admin)
│   │   │   ├── StudentInternshipController  # Stages démarrés/terminés
│   │   │   ├── StudentPublicController    # Profil étudiant public + CV
│   │   │   ├── StudentDashboardController # Dashboard étudiant (préchargement N+1)
│   │   │   └── FavoriteController         # Favoris
│   │   ├── Middleware/
│   │   │   ├── CheckRole                  # Guard rôles (student, company, admin)
│   │   │   ├── EnsureUserIsNotBanned      # Blocage comptes bannis
│   │   │   ├── SecurityHeaders            # CSP, HSTS, X-Frame-Options, etc.
│   │   │   ├── SecretsGuard               # Redaction secrets dans les erreurs
│   │   │   └── RequestMetrics             # Temps de réponse par requête
│   │   └── Requests/                      # 30 FormRequests de validation
│   │       └── (ConfirmTwoFactorRequest, DisableTwoFactorRequest, CreateTokenRequest,
│   │            ResetPasswordRequest, VerifyTwoFactorLoginRequest, LoginRequest,
│   │            RegisterRequest, StoreInternshipRequest, UpdateProfileRequest, ...)
│   ├── Presenters/
│   │   └── StudentProfilePresenter        # Mise en forme du profil étudiant
│   ├── Services/
│   │   ├── AuditService                   # Journal d'audit (16 événements)
│   │   └── LoginLogService                # Journal de connexions + détection inhabituelle
│   ├── Mail/                 # Mailables
│   │   ├── NewApplication
│   │   ├── ApplicationStatusChanged
│   │   ├── InterviewScheduled
│   │   ├── ForgotPassword
│   │   ├── Welcome
│   │   ├── ApplicationConfirmation
│   │   ├── NewFeedback
│   │   └── LoginAlert
│   ├── Models/               # Eloquent models
│   │   ├── User (MustVerifyEmail, HasApiTokens, SoftDeletes, casts 2FA + hashed)
│   │   ├── StudentProfile, Company
│   │   ├── Internship, Application
│   │   ├── Conversation, Message, ConversationParticipant
│   │   ├── Notification, Interview
│   │   ├── Skill, Category
│   │   ├── City, Commune, District, Region, Province, Country, Neighborhood
│   │   ├── PasswordResetToken             # Table password_reset_tokens (PK email)
│   │   ├── LoginLog, ActivityLog, RequestMetric, Feedback
│   ├── Notifications/
│   │   └── VerifyEmailNotification        # Signed URL, FR
│   ├── Policies/             # 8 policies (Student, Company, Application, Conversation, Message, Notification, Internship, Interview)
│   └── View/
├── config/
│   ├── backup.php            # Spatie Backup
│   ├── broadcasting.php      # Reverb
│   ├── reverb.php            # Reverb server config
│   ├── sentry.php            # Sentry monitoring
│   ├── secrets.php           # Gestion centralisée des secrets
│   └── filesystems.php       # Disque public piloté par FILESYSTEM_PUBLIC_DRIVER (local/s3)
├── database/
│   ├── migrations/           # ~50 migrations (dont index de performance, 2FA, login_logs)
│   ├── factories/            # UserFactory (rôles + profils)
│   └── seeders/              # DatabaseSeeder, SkillSeeder (113 skills)
├── routes/
│   ├── api.php               # Routes API (publiques + auth + rôles)
│   ├── channels.php          # Broadcast channels privés
│   └── console.php           # Scheduler (backup, nettoyage anciennes données)
├── resources/views/emails/   # Templates Blade emails (HTML table-based)
└── tests/
    ├── Feature/              # 168 tests PHPUnit (Auth, Sécurité, Internship, Profile, etc.)
    └── Unit/                 # Tests unitaires
```

## Architecture frontend

```
frontend/
├── src/
│   ├── components/
│   │   ├── chat/ChatModal.jsx         # Modal chat inline (WebSocket)
│   │   ├── common/
│   │   │   ├── NotificationBell.jsx   # Notifications temps réel
│   │   │   ├── ThemeToggle.jsx        # Mode sombre/clair
│   │   │   ├── LanguageSwitcher.jsx   # FR/EN
│   │   │   └── FeedbackWidget.jsx     # Bouton flottant de feedback
│   │   └── ui/                        # Card, Modal, Input, Select, Badge, Button, Pagination, LocationSelector
│   ├── context/
│   │   ├── AuthContext.jsx            # Auth + auto-connect/disconnect Echo
│   │   └── ThemeContext.jsx           # Thème dark/light
│   ├── i18n/                          # fr.js, en.js (~339 clés, 100 % synchronisées)
│   ├── layouts/DashboardLayout.jsx    # Layout sidebar sticky + notifications + badges 2FA
│   ├── pages/
│   │   ├── Home/                      # Landing page dynamique
│   │   ├── Login/, Register/          # Auth
│   │   ├── VerifyEmail.jsx            # Vérification email
│   │   ├── Student/                   # Dashboard, Profile, Internships, Applications, Favorites, MyInternships, Interviews
│   │   ├── Company/                   # Dashboard, Applications, Profile, CompanyPublic
│   │   ├── Admin/                     # Dashboard (code-splitté), Users, Students, Companies, Internships, Categories, PasswordResets, Neighborhoods, AuditLog, Security, Feedback
│   │   ├── Messages.jsx               # Messagerie complète (WebSocket)
│   │   ├── TwoFactorSettings.jsx      # Activation 2FA + QR code + recovery codes
│   │   ├── TokenManagement.jsx        # Clés API
│   │   ├── LoginLogs.jsx              # Journal de connexions (admin)
│   │   ├── DataProtection.jsx         # Page RGPD (/data-protection)
│   │   └── Dashboard/                 # Dashboard.jsx (router) + Student/Company/Admin + AdminCharts (recharts lazy)
│   ├── services/
│   │   ├── api.js                     # Axios + interceptors (normalisation data?.data ?? data)
│   │   ├── broadcast.js               # Laravel Echo + Reverb + fallback polling 8s
│   │   ├── cache.js                   # Cache localStorage TTL
│   │   ├── authService, internshipService, conversationService, etc.
│   │   ├── locationService, skillService, cityService
│   │   ├── notificationService, categoryService
│   │   └── favoriteService, studentService, adminService
│   └── utils/cache.js
├── public/
│   ├── robots.txt
│   ├── sitemap.xml
│   ├── favicon.svg
│   └── og-image.png
└── tests/                              # 71 tests Vitest (cache, Badge, Button, constants, i18n)
```

## Décisions B1–B6 (backend)

| Réf | Décision | Détail |
|-----|----------|--------|
| B1 | Validation centralisée | 30 `FormRequest` créés et câblés sur tous les controllers API (validation, autorisation implicite, 422 structuré). |
| B2 | Modèle `PasswordResetToken` | Remplace l'accès direct `DB::table('password_reset_tokens')` par un modèle Eloquent (`$timestamps=false`, PK email) — testable, hashé. |
| B3 | `StudentProfilePresenter` | Sérialisation métier du profil étudiant isolée dans un presenter (frontend consomme un contrat stable). |
| B4 | Garde truncate production | Les migrations « destructive » (favorites, messages v2) lèvent une exception si `APP_ENV=production`. |
| B5 | Catégories | `syncCategories()` pour l'association, filtre pivot en OR (`category_id`), modèle de données fiable. |
| B6 | Pagination universelle | 11+ endpoints passés à `paginate()`, frontend normalisé via `data?.data ?? data` dans l'intercepteur Axios. |

## Décisions F1–F3 (frontend)

| Réf | Décision | Détail |
|-----|----------|--------|
| F1 | Contrastes WCAG | Palette `@theme` dans `index.css` (`secondary`, `cta`, `cta-hover`, `danger`), boutons et cartes alignés (AA). |
| F2 | Gestion d'erreurs `LocationSelector` | 12 `catch(() => {})` remplacés par un état d'erreur visible (`role="alert"`), labels i18n. |
| F3 | i18n complète | 339 clés fr/en synchronisées à 100 %, script `i18ncheck.js` de détection des clés manquantes. |

## Sécurité avancée

- **2FA TOTP** : `pragmarx/google2fa-laravel`, secret/recovery codes chiffrés (cast), 8 codes de récupération, flux login en 2 étapes (`temp_token` → vérification).
- **Journal de connexions** : table `login_logs`, chaque succès/échec loggé, détection de changement IP/User-Agent avec alerte email `LoginAlert`.
- **Clés API** : expiration 30 jours, rotation (révocation + nouvelle), interface `/tokens`.
- **Rate limiting** : `throttle:5,60` login, `throttle:3,60` register/forgot/feedback.
- **SecurityHeaders** : CSP strict, HSTS, X-Frame-Options DENY, nosniff, Permissions-Policy.
- **Policies** : 8 policies + `$this->authorize()` dans 6 controllers.
- **Audit log** : `AuditService::log()` avec subject/browser/result/metadata, 16 événements.
- **RGPD** : export JSON + suppression anonymisée, purge des données anciennes.
- **Secrets** : `config/secrets.php`, redaction des erreurs (`SecretsGuard`), `secrets:check`.

## Flux de données

```
React App
   │
   ├── api.js (Axios + Sanctum token + normalisation pagination)
   │     │
   │     └── Laravel API (port 8000)
   │           ├── Controllers → FormRequests → Services → Models → MariaDB
   │           ├── Mailables → queue → SMTP
   │           └── Events → Reverb (WebSocket port 8080)
   │                                    │
   │                                    └── Laravel Echo (frontend)
   │                                          ├── NotificationBell (user.{id})
   │                                          ├── ChatModal (conversation.{id})
   │                                          └── Messages.jsx (conversation.{id})
   │
   └── React Query (cache frontend)
```

## Authentification

- **Inscription** : email + mot de passe → Sanctum token → email verification (signed URL) + bienvenue
- **Connexion** : credentials → Sanctum token (ou étape 2FA si activée) → user object
- **Guard rôles** : middleware `CheckRole` sur les routes API protégées
- **Vérification email** : `MustVerifyEmail` sur User, `VerifyEmailNotification` (FR, signed URL 60 min), page `/verify-email`, bannière amber pour comptes non vérifiés

## Temps réel (WebSocket)

- **Backend** : Laravel Reverb (port 8080), events `NewMessage` et `NewNotification`
- **Frontend** : Laravel Echo + Pusher.js, auto-connect via `AuthContext`
- **Channels privés** : `user.{userId}` (notifications), `conversation.{id}` (messages)
- **Fallback** : si `VITE_REVERB_HOST` absent, polling 8 s (NotificationBell, Messages, ChatModal)

## Emails transactionnels

| Événement | Mailable | Destinataire |
|-----------|----------|-------------|
| Nouvelle candidature | `NewApplication` | Entreprise |
| Statut candidature changé | `ApplicationStatusChanged` | Étudiant |
| Entretien programmé | `InterviewScheduled` | Étudiant |
| Mot de passe oublié | `ForgotPassword` | Utilisateur |
| Vérification email | `VerifyEmailNotification` | Utilisateur |
| Bienvenue | `Welcome` | Nouvel utilisateur |
| Confirmation candidature | `ApplicationConfirmation` | Étudiant |
| Connexion inhabituelle | `LoginAlert` | Utilisateur |
| Nouveau feedback | `NewFeedback` | Admin (FEEDBACK_EMAIL) |

## Monitoring & Backup

- **Sentry** : capture exceptions backend (via `reportable`) + frontend (browser tracing, chargé dynamiquement)
- **Backup** : `spatie/laravel-backup` → dump DB quotidien 02h00, cleanup 01h00, monitoring 03h00, disque `BACKUP_DISKS`
- **Health check** : `GET /up` (Laravel built-in)
- **Logs** : `storage/logs/laravel.log` (stack → single)

## Profil completion

Le score de complétion du profil utilise 8 catégories pour un total de 100 points :

| Catégorie | Points | Condition |
|-----------|--------|-----------|
| Photo | 10 | `photo` ou `photo_url` présent |
| CV | 20 | `cv_path` présent |
| Bio | 10 | `bio` non vide |
| Formation | 15 | `school` ET `major` remplis |
| Compétences | 20 | Au moins 1 skill |
| Langues | 10 | Au moins 1 langue |
| Localisation | 10 | `commune_id` ou `city_id` |
| Liens | 5 | GitHub, LinkedIn ou Portfolio |

- **Backend** (`StudentDashboardController::computeCompletion()`) : source de vérité, retourné par `GET /api/student/dashboard`
- **Frontend** (`Profile.jsx::computeReadiness()`) : feedback temps réel côté client uniquement
- Badge "Profil complété" débloqué à ≥ 80%

## Tests

- **PHPUnit** : 168 tests (Auth, Sécurité, Internship, Profile, Skill, Notification, Audit, Feedback, GDPR...) — SQLite in-memory
- **Vitest** : 71 tests (cache, Badge, Button, constants, i18n) — jsdom + @testing-library/react
- **CI/CD** : GitHub Actions (backend-tests MariaDB + frontend-tests Node 20, `audit.bat` pré-release bloquant vulnérabilités high/critical)

## Déploiement (Render)

- **Docker** : Dockerfile multi-stage → PHP 8.3 + MariaDB client (mysqldump backup), CMD = `migrate --force` → `schedule:work` (background) → `php artisan serve`
- **Services** : web (backend, port 8000) + Reverb (WebSocket, port 8080) ; frontend sur Vercel
- **Limitation plan free** : pas de cron Render → le scheduler tourne uniquement quand l'instance est réveillée
- **Uploads** : disque `public` piloté par `FILESYSTEM_PUBLIC_DRIVER` (local par défaut, S3 en production avec AWS_*)
- **Variables** : `APP_ENV=production`, `APP_DEBUG=false`, `FRONTEND_URL`, `REVERB_*`, `SENTRY_LARAVEL_DSN`, `FEEDBACK_EMAIL`, `BACKUP_DISKS`
- **Checklist** : `docs/production-checklist.md` (déploiement, rollback, fréquence des vérifications)

## Environnements

| Variable | Production | Local |
|----------|-----------|-------|
| `APP_URL` | `https://twenty-deer-appear.loca.lt` | `http://localhost:8000` |
| `FRONTEND_URL` | `https://stagelink-ten.vercel.app` | `http://localhost:5173` |
| `BROADCAST_CONNECTION` | `reverb` | `reverb` |
| `REVERB_*` | Clés production | `local-key`, `local-secret` |
| `SENTRY_LARAVEL_DSN` | Clé Sentry | (vide) |
| `MAIL_MAILER` | `smtp` (Gmail) | `smtp` (Gmail) |
| `FILESYSTEM_PUBLIC_DRIVER` | `s3` | `local` |
| `BACKUP_DISKS` | `s3` | `local` |
