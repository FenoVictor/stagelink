<?php

return [

    /*
    |--------------------------------------------------------------------------
    | Secrets Registry
    |--------------------------------------------------------------------------
    |
    | Liste de toutes les clés secrètes de l'application.
    | Ces valeurs ne doivent JAMAIS :
    |   - Être versionnées dans Git
    |   - Être affichées dans les logs ou erreurs
    |   - Être retournées dans les réponses API
    |
    | Utilisez `php artisan secrets:check` pour vérifier les fuites.
    |
    */

    'keys' => [

        'APP_KEY' => [
            'description' => 'Clé principale de chiffrement Laravel (32 caractères)',
            'category' => 'core',
            'rotation' => 'Annuel ou en cas de compromission',
        ],

        'MAIL_PASSWORD' => [
            'description' => 'Mot de passe SMTP / App password Gmail',
            'category' => 'email',
            'rotation' => 'Trimestriel',
        ],

        'SENTRY_LARAVEL_DSN' => [
            'description' => 'DSN de connexion Sentry (errors monitoring)',
            'category' => 'monitoring',
            'rotation' => 'En cas de compromission',
        ],

        'VITE_SENTRY_DSN' => [
            'description' => 'DSN Sentry côté frontend (browser)',
            'category' => 'monitoring',
            'rotation' => 'En cas de compromission',
        ],

        'REVERB_APP_SECRET' => [
            'description' => 'Secret de l\'application Reverb (WebSocket)',
            'category' => 'broadcasting',
            'rotation' => 'Annuel',
        ],

        'REVERB_APP_KEY' => [
            'description' => 'Clé publique Reverb (non critique mais sensitive)',
            'category' => 'broadcasting',
            'rotation' => 'Annuel',
        ],

        'DB_PASSWORD' => [
            'description' => 'Mot de passe de la base de données MariaDB',
            'category' => 'database',
            'rotation' => 'Semestriel',
        ],

        'REDIS_PASSWORD' => [
            'description' => 'Mot de passe Redis (si utilisé)',
            'category' => 'cache',
            'rotation' => 'Semestriel',
        ],

    ],

    /*
    |--------------------------------------------------------------------------
    | Patterns de détection
    |--------------------------------------------------------------------------
    |
    | Expressions régulières pour détecter les secrets qui fuiteraient
    | dans les logs, le code source, ou les réponses API.
    |
    */

    'patterns' => [
        '/APP_KEY=.+/',
        '/MAIL_PASSWORD=.+/',
        '/SENTRY_LARAVEL_DSN=.+/',
        '/REVERB_APP_SECRET=.+/',
        '/REVERB_APP_KEY=.+/',
        '/DB_PASSWORD=.+/',
        '/REDIS_PASSWORD=.+/',
        '/"token":"[A-Za-z0-9\-_]+"\./',
        '/base64:[A-Za-z0-9\/+=]+/',
    ],

    /*
    |--------------------------------------------------------------------------
    | Mots-clés de détection dans les logs
    |--------------------------------------------------------------------------
    */

    'log_keywords' => [
        'password',
        'secret',
        'token',
        'key',
        'dsn',
        'app_key',
    ],

];
