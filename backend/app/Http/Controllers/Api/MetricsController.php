<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\RequestMetric;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\DB;

class MetricsController extends Controller
{
    public function dashboard(): JsonResponse
    {
        $now = now();

        $totalRequests = RequestMetric::count();
        $requests24h = RequestMetric::where('created_at', '>=', $now->copy()->subHours(24))->count();
        $requests7d = RequestMetric::where('created_at', '>=', $now->copy()->subDays(7))->count();

        $avgResponseTime = [
            '1h' => (int) RequestMetric::where('created_at', '>=', $now->copy()->subHour())->avg('response_time_ms'),
            '24h' => (int) RequestMetric::where('created_at', '>=', $now->copy()->subHours(24))->avg('response_time_ms'),
            '7d' => (int) RequestMetric::where('created_at', '>=', $now->copy()->subDays(7))->avg('response_time_ms'),
        ];

        $p95ResponseTime = [
            '1h' => $this->percentile('response_time_ms', 95, $now->copy()->subHour()),
            '24h' => $this->percentile('response_time_ms', 95, $now->copy()->subHours(24)),
        ];

        $errorRate24h = $this->calculateErrorRate($now->copy()->subHours(24));

        $statusCodeDistribution = RequestMetric::where('created_at', '>=', $now->copy()->subHours(24))
            ->select('status_code', DB::raw('count(*) as count'))
            ->groupBy('status_code')
            ->orderBy('count', 'desc')
            ->get();

        $hourExpr = $this->hourExpression('created_at');

        $requestsPerHour = RequestMetric::where('created_at', '>=', $now->copy()->subHours(24))
            ->select(DB::raw("$hourExpr as hour"), DB::raw('count(*) as count'))
            ->groupBy('hour')
            ->orderBy('hour')
            ->get();

        $responseTimeByHour = RequestMetric::where('created_at', '>=', $now->copy()->subHours(24))
            ->select(
                DB::raw("$hourExpr as hour"),
                DB::raw('avg(response_time_ms) as avg_ms'),
                DB::raw('max(response_time_ms) as max_ms')
            )
            ->groupBy('hour')
            ->orderBy('hour')
            ->get();

        $topSlowEndpoints = RequestMetric::where('created_at', '>=', $now->copy()->subDays(7))
            ->select('path', DB::raw('avg(response_time_ms) as avg_ms'), DB::raw('count(*) as hits'))
            ->groupBy('path')
            ->having('hits', '>=', 5)
            ->orderByDesc('avg_ms')
            ->limit(10)
            ->get();

        $errorsByHour = RequestMetric::where('created_at', '>=', $now->copy()->subHours(24))
            ->where('status_code', '>=', 400)
            ->select(DB::raw("$hourExpr as hour"), DB::raw('count(*) as count'))
            ->groupBy('hour')
            ->orderBy('hour')
            ->get();

        $activeUsers5min = RequestMetric::where('created_at', '>=', $now->copy()->subMinutes(5))
            ->whereNotNull('user_id')
            ->distinct('user_id')
            ->count('user_id');

        $activeUsers1h = RequestMetric::where('created_at', '>=', $now->copy()->subHour())
            ->whereNotNull('user_id')
            ->distinct('user_id')
            ->count('user_id');

        $uptime24h = $this->calculateUptime($now->copy()->subHours(24));

        $methodDistribution = RequestMetric::where('created_at', '>=', $now->copy()->subHours(24))
            ->select('method', DB::raw('count(*) as count'))
            ->groupBy('method')
            ->get();

        $topEndpoints = RequestMetric::where('created_at', '>=', $now->copy()->subHours(24))
            ->select('path', DB::raw('count(*) as hits'))
            ->groupBy('path')
            ->orderByDesc('hits')
            ->limit(10)
            ->get();

        return response()->json([
            'summary' => [
                'total_requests' => $totalRequests,
                'requests_24h' => $requests24h,
                'requests_7d' => $requests7d,
                'avg_response_time' => $avgResponseTime,
                'p95_response_time' => $p95ResponseTime,
                'error_rate_24h' => $errorRate24h,
                'uptime_24h' => $uptime24h,
                'active_users_5min' => $activeUsers5min,
                'active_users_1h' => $activeUsers1h,
            ],
            'status_codes' => $statusCodeDistribution,
            'requests_per_hour' => $requestsPerHour,
            'response_time_by_hour' => $responseTimeByHour,
            'errors_by_hour' => $errorsByHour,
            'top_slow_endpoints' => $topSlowEndpoints,
            'top_endpoints' => $topEndpoints,
            'method_distribution' => $methodDistribution,
        ]);
    }

    private function hourExpression(string $column): string
    {
        return DB::connection()->getDriverName() === 'sqlite'
            ? "strftime('%Y-%m-%d %H:00', $column)"
            : "DATE_FORMAT($column, '%Y-%m-%d %H:00')";
    }

    private function percentile(string $column, int $percentile, $since): int
    {
        $count = RequestMetric::where('created_at', '>=', $since)->count();
        if ($count === 0) return 0;

        $offset = (int) ceil(($percentile / 100) * $count) - 1;
        $offset = max(0, $offset);

        $result = RequestMetric::where('created_at', '>=', $since)
            ->orderBy($column)
            ->skip($offset)
            ->limit(1)
            ->value($column);

        return (int) ($result ?? 0);
    }

    private function calculateErrorRate($since): float
    {
        $total = RequestMetric::where('created_at', '>=', $since)->count();
        if ($total === 0) return 0.0;

        $errors = RequestMetric::where('created_at', '>=', $since)
            ->where('status_code', '>=', 400)
            ->count();

        return round(($errors / $total) * 100, 2);
    }

    private function calculateUptime($since): float
    {
        $total = RequestMetric::where('created_at', '>=', $since)->count();
        if ($total === 0) return 100.0;

        $serverErrors = RequestMetric::where('created_at', '>=', $since)
            ->where('status_code', '>=', 500)
            ->count();

        return round((($total - $serverErrors) / $total) * 100, 2);
    }
}
