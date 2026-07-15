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

## Lancement
- `.\start.bat` depuis la racine (ou start.ps1)
- Backend: port 8000, Frontend: port 5173
