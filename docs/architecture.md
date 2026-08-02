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
│   ├── Console/              # Commandes artisan
│   ├── Events/               # Events broadcast (NewMessage, NewNotification)
│   ├── Http/
│   │   ├── Controllers/Api/  # Controllers REST
│   │   │   ├── AuthController           # Login, register, forgot/reset password
│   │   │   ├── ApplicationController     # Candidatures étudiant
│   │   │   ├── CompanyApplicationController  # Gestion candidatures entreprise
│   │   │   ├── ConversationController   # Conversations messaging
│   │   │   ├── MessageController        # Messages (broadcast temps réel)
│   │   │   ├── NotificationController   # Notifications
│   │   │   ├── InternshipController     # Offres de stage CRUD
│   │   │   ├── StudentProfileController # Profil étudiant
│   │   │   ├── CompanyProfileController # Profil entreprise
│   │   │   ├── InterviewController      # Entretiens
│   │   │   ├── AdminStatsController     # Stats admin détaillées
│   │   │   ├── PublicStatsController    # Stats publiques landing
│   │   │   ├── PublicCompanyController  # Page entreprise publique
│   │   │   ├── CategoryController       # Catégories (public)
│   │   │   ├── EmailVerificationController  # Vérification email
│   │   │   ├── NeighborhoodController   # Quartiers (CRUD + validation admin)
│   │   │   ├── StudentInternshipController  # Stages démarrés/terminés
│   │   │   └── FavoriteController       # Favoris
│   │   └── Middleware/
│   │       └── CheckRole    # Guard rôles (student, company, admin)
│   ├── Mail/                 # Mailables
│   │   ├── NewApplication
│   │   ├── ApplicationStatusChanged
│   │   ├── InterviewScheduled
│   │   └── ForgotPassword
│   ├── Models/               # Eloquent models
│   │   ├── User (MustVerifyEmail, HasApiTokens, SoftDeletes)
│   │   ├── StudentProfile, Company
│   │   ├── Internship, Application
│   │   ├── Conversation, Message, ConversationParticipant
│   │   ├── Notification, Interview
│   │   ├── Skill, Category
│   │   └── City, Commune, District, Region, Province, Neighborhood
│   ├── Notifications/
│   │   └── VerifyEmailNotification
│   └── View/
├── config/
│   ├── backup.php            # Spatie Backup
│   ├── broadcasting.php      # Reverb
│   ├── reverb.php            # Reverb server config
│   └── sentry.php            # Sentry monitoring
├── database/
│   ├── migrations/           # ~30 migrations
│   └── seeders/              # DatabaseSeeder, SkillSeeder (113 skills)
├── routes/
│   ├── api.php               # Routes API (publiques + auth)
│   ├── channels.php          # Broadcast channels privés
│   └── console.php           # Scheduler (backup:clean, backup:run, backup:monitor)
├── resources/views/emails/   # Templates Blade emails
└── tests/Feature/            # 31 tests PHPUnit
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
│   │   │   └── LanguageSwitcher.jsx   # FR/EN
│   │   └── ui/                        # Card, Modal, Input, Select, Badge, Button, Pagination
│   ├── context/
│   │   ├── AuthContext.jsx            # Auth + auto-connect/disconnect Echo
│   │   └── ThemeContext.jsx           # Thème dark/light
│   ├── i18n/                          # fr.js, en.js (~250 clés)
│   ├── layouts/DashboardLayout.jsx    # Layout sidebar sticky + notifications
│   ├── pages/
│   │   ├── Home/                      # Landing page dynamique
│   │   ├── Login/, Register/          # Auth
│   │   ├── VerifyEmail.jsx            # Vérification email
│   │   ├── Student/                   # Dashboard, Profile, Internships, Applications, Favorites, MyInternships, Interviews
│   │   ├── Company/                   # Dashboard, Applications, Profile, CompanyPublic
│   │   ├── Admin/                     # Dashboard, Users, Students, Companies, Internships, Categories, PasswordResets, Neighborhoods
│   │   └── Messages.jsx               # Messagerie complète (WebSocket)
│   ├── services/
│   │   ├── api.js                     # Axios + interceptors
│   │   ├── broadcast.js               # Laravel Echo + Reverb
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
└── tests/                              # 25 tests Vitest
```

## Flux de données

```
React App
   │
   ├── api.js (Axios + Sanctum token)
   │     │
   │     └── Laravel API (port 8000)
   │           ├── Controllers → Models → MariaDB
   │           ├── Mailables → SMTP (Gmail)
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

- **Inscription** : email + mot de passe → Sanctum token → email verification (signed URL)
- **Connexion** : credentials → Sanctum token → user object
- **Guard rôles** : middleware `CheckRole` sur les routes API protégées
- **Vérification email** : `MustVerifyEmail` sur User, `VerifyEmailNotification`, page `/verify-email`

## Temps réel (WebSocket)

- **Backend** : Laravel Reverb (port 8080), events `NewMessage` et `NewNotification`
- **Frontend** : Laravel Echo + Pusher.js, auto-connect via `AuthContext`
- **Channels privés** : `user.{userId}` (notifications), `conversation.{id}` (messages)
- **Remplace** : polling 30s dans NotificationBell, ChatModal, Messages.jsx

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

## Monitoring & Backup

- **Sentry** : capture exceptions backend (via `reportable`) + frontend (browser tracing)
- **Backup** : `spatie/laravel-backup` → dump DB quotidien 02h00, cleanup 01h00, monitoring 03h00
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

- **PHPUnit** : 31 tests (Auth, Internship, Profile, Skill, Notification) — SQLite in-memory
- **Vitest** : 25 tests (cache, Badge, Button, constants) — jsdom + @testing-library/react
- **CI/CD** : GitHub Actions (backend-tests MariaDB + frontend-tests Node 20)

## Environnements

| Variable | Production | Local |
|----------|-----------|-------|
| `APP_URL` | `https://twenty-deer-appear.loca.lt` | `http://localhost:8000` |
| `FRONTEND_URL` | `https://stagelink-ten.vercel.app` | `http://localhost:5173` |
| `BROADCAST_CONNECTION` | `reverb` | `reverb` |
| `REVERB_*` | Clés production | `local-key`, `local-secret` |
| `SENTRY_LARAVEL_DSN` | Clé Sentry | (vide) |
| `MAIL_MAILER` | `smtp` (Gmail) | `smtp` (Gmail) |
