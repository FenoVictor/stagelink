<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\ActivityLog;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\StreamedResponse;

class AdminAuditLogController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $query = ActivityLog::with('user');

        if ($search = $request->input('search')) {
            $query->where(function ($q) use ($search) {
                $q->where('action', 'like', "%{$search}%")
                    ->orWhere('description', 'like', "%{$search}%")
                    ->orWhere('ip_address', 'like', "%{$search}%")
                    ->orWhereHas('user', function ($q2) use ($search) {
                        $q2->where('name', 'like', "%{$search}%")
                            ->orWhere('email', 'like', "%{$search}%");
                    });
            });
        }

        if ($action = $request->input('action')) {
            $query->where('action', $action);
        }

        if ($result = $request->input('result')) {
            $query->where('result', $result);
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

    public function actions(): JsonResponse
    {
        $actions = ActivityLog::distinct()
            ->pluck('action')
            ->sort()
            ->values();

        return response()->json($actions);
    }

    public function export(Request $request): StreamedResponse
    {
        $query = ActivityLog::with('user');

        if ($from = $request->input('from')) {
            $query->where('created_at', '>=', $from);
        }
        if ($to = $request->input('to')) {
            $query->where('created_at', '<=', $to . ' 23:59:59');
        }
        if ($action = $request->input('action')) {
            $query->where('action', $action);
        }
        if ($userId = $request->input('user_id')) {
            $query->where('user_id', $userId);
        }

        $logs = $query->orderByDesc('created_at')->limit(10000)->get();

        $filename = 'audit_log_' . now()->format('Y-m-d_His') . '.csv';

        $headers = [
            'Content-Type' => 'text/csv; charset=utf-8',
            'Content-Disposition' => "attachment; filename=\"$filename\"",
        ];

        $callback = function () use ($logs) {
            $handle = fopen('php://output', 'w');
            fwrite($handle, "\xEF\xBB\xBF");
            fputcsv($handle, ['Date', 'Utilisateur', 'Email', 'Rôle', 'Action', 'Description', 'IP', 'Navigateur', 'Résultat', 'Subject Type', 'Subject ID'], ';');
            foreach ($logs as $log) {
                fputcsv($handle, [
                    $log->created_at?->format('d/m/Y H:i:s') ?? '',
                    $log->user?->name ?? 'Système',
                    $log->user?->email ?? '',
                    $log->user?->role ?? '',
                    $log->action,
                    $log->description ?? '',
                    $log->ip_address ?? '',
                    $log->browser ?? '',
                    $log->result,
                    $log->subject_type ? class_basename($log->subject_type) : '',
                    $log->subject_id ?? '',
                ], ';');
            }
            fclose($handle);
        };

        return new StreamedResponse($callback, 200, $headers);
    }
}
