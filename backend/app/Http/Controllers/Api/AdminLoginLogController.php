<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\LoginLog;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\StreamedResponse;

class AdminLoginLogController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $query = LoginLog::with('user');

        if ($search = $request->input('search')) {
            $query->where(function ($q) use ($search) {
                $q->where('email', 'like', "%{$search}%")
                    ->orWhere('ip_address', 'like', "%{$search}%")
                    ->orWhere('browser', 'like', "%{$search}%");
            });
        }

        if ($request->boolean('success_only')) {
            $query->where('success', true);
        }

        if ($request->boolean('suspicious_only')) {
            $query->where('suspicious', true);
        }

        if ($userId = $request->input('user_id')) {
            $query->where('user_id', $userId);
        }

        if ($from = $request->input('from')) {
            $query->where('created_at', '>=', $from);
        }

        if ($to = $request->input('to')) {
            $query->where('created_at', '<=', $to . ' 23:59:59');
        }

        $logs = $query->orderByDesc('created_at')
            ->paginate(perPage: min((int) $request->input('per_page', 20), 100));

        return response()->json($logs);
    }

    public function stats(): JsonResponse
    {
        $total = LoginLog::count();
        $success = LoginLog::where('success', true)->count();
        $failed = LoginLog::where('success', false)->count();
        $suspicious = LoginLog::where('suspicious', true)->count();
        $today = LoginLog::whereDate('created_at', today())->count();

        $topIps = LoginLog::where('success', true)
            ->whereNotNull('ip_address')
            ->select('ip_address', \DB::raw('count(*) as attempts'))
            ->groupBy('ip_address')
            ->orderByDesc('attempts')
            ->limit(10)
            ->get();

        $topBrowsers = LoginLog::where('success', true)
            ->whereNotNull('browser')
            ->select('browser', \DB::raw('count(*) as count'))
            ->groupBy('browser')
            ->orderByDesc('count')
            ->get();

        return response()->json([
            'total' => $total,
            'success' => $success,
            'failed' => $failed,
            'suspicious' => $suspicious,
            'today' => $today,
            'success_rate' => $total > 0 ? round(($success / $total) * 100, 1) : 0,
            'top_ips' => $topIps,
            'top_browsers' => $topBrowsers,
        ]);
    }

    public function export(Request $request): StreamedResponse
    {
        $query = LoginLog::with('user');

        if ($from = $request->input('from')) {
            $query->where('created_at', '>=', $from);
        }
        if ($to = $request->input('to')) {
            $query->where('created_at', '<=', $to . ' 23:59:59');
        }

        $logs = $query->orderByDesc('created_at')->limit(10000)->get();

        $filename = 'login_logs_' . now()->format('Y-m-d_His') . '.csv';

        $headers = [
            'Content-Type' => 'text/csv; charset=utf-8',
            'Content-Disposition' => "attachment; filename=\"$filename\"",
        ];

        $callback = function () use ($logs) {
            $handle = fopen('php://output', 'w');
            fwrite($handle, "\xEF\xBB\xBF");
            fputcsv($handle, ['Date', 'Email', 'Nom', 'IP', 'Navigateur', 'Succès', 'Suspect', 'Raison échec'], ';');
            foreach ($logs as $log) {
                fputcsv($handle, [
                    $log->created_at?->format('d/m/Y H:i:s') ?? '',
                    $log->email,
                    $log->user?->name ?? '',
                    $log->ip_address ?? '',
                    $log->browser ?? '',
                    $log->success ? 'Oui' : 'Non',
                    $log->suspicious ? 'Oui' : 'Non',
                    $log->failure_reason ?? '',
                ], ';');
            }
            fclose($handle);
        };

        return new StreamedResponse($callback, 200, $headers);
    }
}
