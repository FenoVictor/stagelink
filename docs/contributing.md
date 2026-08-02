# Contribuer à StageLink

## Développement local

### Prérequis
- PHP 8.3+ (C:\wamp64\bin\php\php8.3.28\php.exe)
- Node.js 20+
- MariaDB 10.6+
- Composer 2.x

### Setup
```bash
git clone https://github.com/VICTOR-T-VARDA/Stagelink.git
cd Stagelink

# Backend
cd backend
composer install
cp .env.example .env
php artisan key:generate
php artisan migrate:fresh --seed --force

# Frontend
cd ../frontend
npm install
```

### Démarrage
```bash
# 3 terminaux nécessaires
.\start.bat        # Backend + Reverb + Frontend
# ou manuellement :
php artisan serve --port=8000
php artisan reverb:start --port=8080
npm run dev
```

## Convention de code

### Backend (Laravel)
- PSR-12 pour PHP
- Controllers dans `app/Http/Controllers/Api/`
- Models dans `app/Models/`
- Mailables dans `app/Mail/`
- Validation dans le controller (pas dans le model)
- Utiliser les Eloquent relationships plutôt que les requêtes raw
- Migration pour tout changement de schéma

### Frontend (React)
- Fonctions fléchées (`const Component = () => {}`)
- Composants dans `src/components/`
- Pages dans `src/pages/`
- Services API dans `src/services/`
- Hooks custom dans `src/hooks/`
- Traductions dans `src/i18n/fr.js` et `src/i18n/en.js`
- Utiliser Tailwind CSS (pas de CSS inline sauf exception)
- Props destructuring

### Git
- Branches : `main` (production), `feat/xxx`, `fix/xxx`, `chore/xxx`
- Messages : `feat: description` ou `fix: description` (conventional commits)
- Un commit = une modification logique
- Pas de secrets dans les commits

## Testing

### Backend (PHPUnit)
```bash
cd backend
php artisan test                    # Tous les tests (31)
php artisan test --filter=AuthTest  # Un fichier
```
- SQLite in-memory pour la vitesse
- 5 fichiers de tests : AuthTest, InternshipTest, ProfileTest, SkillTest, NotificationTest
- Config dans `phpunit.xml` + `.env.testing`

### Frontend (Vitest)
```bash
cd frontend
npx vitest run              # Tous les tests (25)
npx vitest run --reporter=verbose  # Mode verbeux
```
- 4 fichiers : cache.test.js, Badge.test.jsx, Button.test.jsx, constants.test.js
- jsdom environment + @testing-library/react
- Config dans `vitest.config.js`

### CI/CD
GitHub Actions vérifie automatiquement :
- Backend : PHP 8.3 + MariaDB → `php artisan test`
- Frontend : Node 20 → `npm run build` + `npx vitest run`

## Structure des PR

1. Créer une branche `feat/xxx` ou `fix/xxx`
2. Écrire le code + tests
3. Vérifier que `php artisan test` et `npx vitest run` passent
4. Push + créer une PR sur `main`
5. Décrire les changements dans la PR

## Ajouter une route API

1. Créer le controller dans `app/Http/Controllers/Api/`
2. Ajouter la route dans `routes/api.php` avec le bon middleware
3. Créer les migrations si nécessaire
4. Ajouter le service frontend dans `src/services/`
5. Documenter dans `docs/api-documentation.md`

## Ajouter un email transactionnel

1. Créer le Mailable : `php artisan make:mail NomEmail`
2. Créer le template Blade : `resources/views/emails/nom-email.blade.php`
3. Utiliser le layout standard (logo SVG inline, table-based, footer)
4. Dispatcher avec `Mail::to()->queue()` + try/catch
5. Documenter dans `docs/architecture.md`

## Variables d'environnement

Ne jamais commiter de vraies clés. Utiliser `.env.example` comme template.

Clés critiques :
- `APP_KEY` : générée par `php artisan key:generate`
- `SENTRY_LARAVEL_DSN` : optionnel, laisser vide en dev
- `MAIL_PASSWORD` : mot de passe app Gmail
- `REVERB_APP_KEY` / `REVERB_APP_SECRET` : WebSocket

## Aide utile

| Commande | Description |
|----------|-------------|
| `php artisan migrate:fresh --seed --force` | Reset complet DB |
| `php artisan config:cache` | Cache config |
| `php artisan route:cache` | Cache routes |
| `php artisan test --parallel` | Tests parallèles |
| `npm run build` | Build production |
| `npx vitest --watch` | Tests en watch mode |
