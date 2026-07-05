# StageLink

Plateforme de mise en relation étudiants-entreprises pour les stages.

## Stack technique

- **Frontend :** React 19, Vite 8, Tailwind CSS 4, TanStack Query, React Router 7, Axios
- **Backend :** Laravel 13, PHP 8.3+, Sanctum (auth token), MySQL
- **Design :** Flat Design, Poppins + Open Sans, palette bleu professionnel

## Prérequis

- PHP 8.3+
- Composer
- Node.js 22+
- MySQL

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
# Backend (depuis le dossier backend/)
cd backend
php artisan serve --port=8000

# Frontend (autre terminal, depuis le dossier frontend/)
cd frontend
npm run dev
```

## API

L'API est accessible sur `http://localhost:8000/api` (auth via Bearer token).

## Structure

```
StageLink/
├── backend/       # API Laravel
│   ├── app/
│   │   ├── Http/Controllers/Api/  # 11 contrôleurs
│   │   ├── Models/                # 5 modèles
│   │   └── Http/Middleware/       # CheckRole
│   ├── database/
│   │   ├── migrations/            # 11 migrations
│   │   └── seeders/               # Données de test
│   └── routes/api.php             # 31 routes API
├── frontend/      # SPA React
│   └── src/
│       ├── components/ui/         # 7 composants (Button, Card, Input, Modal, Badge, Select, EmptyState)
│       ├── pages/                 # 12 pages
│       ├── services/              # 5 services API
│       ├── context/               # AuthContext
│       └── layouts/               # AuthLayout, DashboardLayout
└── docs/
```
