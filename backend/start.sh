#!/bin/bash
set -e

php artisan migrate --force --seed
php artisan storage:link
php artisan config:cache
php artisan route:cache
php artisan queue:work --daemon &
php artisan serve --host=0.0.0.0 --port=$PORT
