<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Symfony\Component\HttpFoundation\Response;

class SecretsGuard
{
    private const SENSITIVE_KEYS = [
        'password', 'secret', 'token', 'app_key', 'dsn',
        'MAIL_PASSWORD', 'DB_PASSWORD', 'REDIS_PASSWORD',
        'SENTRY_LARAVEL_DSN', 'REVERB_APP_SECRET', 'REVERB_APP_KEY',
        'APP_KEY', 'current_password', 'password_confirmation',
    ];

    public function handle(Request $request, Closure $next): Response
    {
        if (config('app.debug')) {
            return $next($request);
        }

        $response = $next($request);

        $response->headers->set('X-Content-Type-Options', 'nosniff');
        $response->headers->set('X-Robots-Tag', 'noindex, nofollow');

        if ($response->getStatusCode() >= 400) {
            $this->sanitizeErrorResponse($response);
        }

        return $response;
    }

    private function sanitizeErrorResponse(Response $response): void
    {
        if (Str::contains($response->headers->get('Content-Type', ''), 'json')) {
            $content = $response->getContent();

            if ($content) {
                $sanitized = $this->sanitizeString($content);
                if ($sanitized !== $content) {
                    $response->setContent($sanitized);
                }
            }
        }
    }

    private function sanitizeString(string $data): string
    {
        foreach (self::SENSITIVE_KEYS as $key) {
            $data = preg_replace(
                '/"' . preg_quote($key, '/') . '"\s*:\s*"[^"]*"/',
                '"' . $key . '":"[REDACTED]"',
                $data
            );
        }

        $data = preg_replace(
            '/base64:[A-Za-z0-9\/+=]{20,}/',
            'base64:[REDACTED]',
            $data
        );

        return $data;
    }
}
