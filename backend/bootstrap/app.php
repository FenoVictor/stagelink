<?php

use Illuminate\Auth\AuthenticationException;
use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;
use Illuminate\Http\Request;
use Symfony\Component\HttpKernel\Exception\TooManyRequestsHttpException;

return Application::configure(basePath: dirname(__DIR__))
    ->withRouting(
        web: __DIR__.'/../routes/web.php',
        api: __DIR__.'/../routes/api.php',
        commands: __DIR__.'/../routes/console.php',
        health: '/up',
    )
    ->withBroadcasting(
        channels: __DIR__.'/../routes/channels.php',
        attributes: ['middleware' => ['auth:sanctum']],
    )
    ->withMiddleware(function (Middleware $middleware): void {
        $middleware->alias([
            'role' => \App\Http\Middleware\CheckRole::class,
            'banned' => \App\Http\Middleware\EnsureUserIsNotBanned::class,
        ]);
        $middleware->prepend(\App\Http\Middleware\SecurityHeaders::class);
        $middleware->prepend(\App\Http\Middleware\SecretsGuard::class);
        $middleware->prepend(\App\Http\Middleware\RequestMetrics::class);
        $middleware->prepend(\Sentry\Laravel\Tracing\Middleware::class);
        $middleware->redirectGuestsTo(
            fn (Request $request) => $request->is('api/*') ? null : route('login'),
        );
    })
    ->withExceptions(function (Exceptions $exceptions): void {
        $exceptions->shouldRenderJsonWhen(
            fn (Request $request) => $request->is('api/*'),
        );

        $exceptions->renderable(function (AuthenticationException $e, Request $request) {
            if ($request->is('api/*')) {
                return response()->json([
                    'message' => 'Non authentifié.',
                ], 401);
            }
        });

        $exceptions->renderable(function (TooManyRequestsHttpException $e, Request $request) {
            if ($request->is('api/*')) {
                return response()->json([
                    'message' => 'Trop de tentatives. Veuillez réessayer dans 60 secondes.',
                ], 429);
            }
        });

        $exceptions->respond(function ($response, $e, $request) {
            if ($request->is('api/*')) {
                $origin = $request->headers->get('Origin');

                if ($origin && in_array($origin, config('cors.allowed_origins'), true)) {
                    $response->headers->set('Access-Control-Allow-Origin', $origin);
                    $response->headers->set('Vary', 'Origin');
                }
            }

            return $response;
        });

        $exceptions->reportable(function (\Throwable $e) {
            if (app()->bound('sentry')) {
                app('sentry')->captureException($e);
            }
        });
    })->create();
