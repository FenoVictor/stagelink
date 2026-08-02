<?php

namespace App\Http\Middleware;

use App\Models\RequestMetric;
use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class RequestMetrics
{
    private const SKIP_PATHS = [
        '/up',
        '/api/sanctum/csrf-cookie',
    ];

    public function handle(Request $request, Closure $next): Response
    {
        $request->metricsStartTime = microtime(true);

        return $next($request);
    }

    public function terminate(Request $request, Response $response): void
    {
        $path = $request->path();

        foreach (self::SKIP_PATHS as $skip) {
            if ($path === ltrim($skip, '/')) {
                return;
            }
        }

        $startTime = $request->metricsStartTime ?? null;
        if ($startTime === null) {
            return;
        }

        $responseTimeMs = (int) ((microtime(true) - $startTime) * 1000);

        try {
            RequestMetric::create([
                'method' => $request->method(),
                'path' => substr($request->path(), 0, 500),
                'status_code' => $response->getStatusCode(),
                'response_time_ms' => $responseTimeMs,
                'ip_address' => $request->ip(),
                'user_agent' => substr($request->userAgent(), 0, 500),
                'user_id' => $request->user()?->id,
                'route_name' => $request->route()?->getName() ? substr($request->route()->getName(), 0, 100) : null,
            ]);
        } catch (\Throwable $e) {
        }
    }
}
