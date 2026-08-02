<?php

namespace App\Services;

use App\Models\ActivityLog;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Request as RequestFacade;

class AuditService
{
    public static function log(
        string $action,
        ?string $description = null,
        ?object $subject = null,
        ?int $userId = null,
        ?string $result = 'success',
        ?array $metadata = null,
    ): ActivityLog {
        $request = RequestFacade::instance();

        $user = $userId
            ? \App\Models\User::find($userId)
            : ($request?->user());

        return ActivityLog::create([
            'user_id' => $user?->id,
            'action' => $action,
            'subject_type' => $subject ? get_class($subject) : null,
            'subject_id' => $subject?->id,
            'metadata' => $metadata,
            'ip_address' => $request?->ip(),
            'user_agent' => $request?->userAgent(),
            'browser' => self::parseBrowser($request?->userAgent()),
            'result' => $result,
            'description' => $description,
        ]);
    }

    private static function parseBrowser(?string $userAgent): ?string
    {
        if (!$userAgent) {
            return null;
        }

        $browsers = [
            'Edg' => 'Edge',
            'Chrome' => 'Chrome',
            'Firefox' => 'Firefox',
            'Safari' => 'Safari',
            'Opera' => 'Opera',
            'OPR' => 'Opera',
        ];

        foreach ($browsers as $pattern => $name) {
            if (str_contains($userAgent, $pattern)) {
                return $name;
            }
        }

        return 'Autre';
    }
}
