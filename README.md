# StageLink

Plateforme de mise en relation étudiants-entreprises pour les stages à Madagascar.

## Stack technique

| Couche | Technologie |
|--------|------------|
| **Frontend** | React 19, Vite 8, Tailwind CSS 4, TanStack Query, React Router 7, Axios |
| **Backend** | Laravel 13, PHP 8.3+, Sanctum (auth token) |
| **Base de données** | MariaDB |
| **Temps réel** | Laravel Reverb + Laravel Echo |
| **Monitoring** | Sentry (backend + frontend) |
| **Backup** | Spatie Laravel Backup (quotidien) |
| **Email** | SMTP Gmail (5 types transactionnels) |
| **Tests** | PHPUnit (31) + Vitest (25) |
| **CI/CD** | GitHub Actions |
| **Design** | Flat Design, Poppins + Open Sans, mode sombre |

## Prérequis

- PHP 8.3+
- Composer
- Node.js 22+
- MariaDB/MySQL

## Installation

```bash
# Backend
cd backend
cp .env.example .env
# Configurer la base de données dans .env
composer install
php artisan key:generate
php artisan migrate --seed
php artisan storage:link

# Frontend
cd ../frontend
npm install
cp .env.example .env
```

## Utilisateurs de test (seed)

| Rôle | Email | Mot de passe |
|------|-------|-------------|
| Admin | admin@stagelink.fr | password |
| Entreprise | company@stagelink.fr | password |
| Étudiant | student@stagelink.fr | password |

## Lancement

```bash
# Depuis la racine
.\start.bat        # Windows
.\start.ps1        # PowerShell

# Ou manuellement :
php artisan serve --port=8000       # Backend
php artisan reverb:start            # WebSocket (port 8080)
npm run dev                         # Frontend (port 5173)
```

## Fonctionnalités

### Authentification
- Inscription / connexion / déconnexion (Sanctum tokens)
- Vérification email (signed URL)
- Mot de passe oublié (email avec lien de reset)
- 3 rôles : Étudiant, Entreprise, Admin

### Étudiant
- Dashboard avec stats, progression, offres recommandées
- Recherche avancée d'offres (filtres, pagination, tri)
- Candidatures (lettre + CV upload)
- Profil intelligent (score readiness, auto-save)
- Compétences, formation, CV upload
- Favoris, entretiens, messages temps réel

### Entreprise
- Dashboard avec stats candidatures
- Gestion des candidatures (accepter/refuser/entretien)
- Programmation d'entretiens
- Profil entreprise (logo, description)
- Messagerie temps réel avec les étudiants

### Admin
- Dashboard avec graphiques (recharts)
- Gestion utilisateurs, entreprises, offres, catégories
- Validation des quartiers
- Stats publiques dynamiques

### Temps réel
- Notifications instantanées (WebSocket)
- Messages de conversation en temps réel
- Remplacement complet du polling

### Infrastructure
- Mode sombre / Multi-langue (FR/EN)
- SEO (Open Graph, robots.txt, sitemap.xml)
- Monitoring (Sentry backend + frontend)
- Backup automatique quotidien (Spatie)
- CI/CD (GitHub Actions)

## API

Documentation complète : `docs/api-documentation.md`

Base URL : `http://localhost:8000/api`

## Architecture

Documentation complète : `docs/architecture.md`

## Tests

```bash
# Backend (PHPUnit - 31 tests)
cd backend && php artisan test

# Frontend (Vitest - 25 tests)
cd frontend && npx vitest run
```
