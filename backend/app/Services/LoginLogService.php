<?php

namespace App\Services;

use App\Mail\LoginAlert;
use App\Models\LoginLog;
use App\Models\User;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;

class LoginLogService
{
    public static function log(
        ?User $user,
        string $email,
        bool $success,
        ?string $failureReason = null,
    ): LoginLog {
        $request = request();

        $lastLogin = null;
        $suspicious = false;

        if ($user && $success) {
            $lastLogin = LoginLog::where('user_id', $user->id)
                ->where('success', true)
                ->latest()
                ->first();

            if ($lastLogin) {
                $ipChanged = $lastLogin->ip_address !== $request->ip();
                $uaChanged = $lastLogin->user_agent !== $request->userAgent();
                $suspicious = $ipChanged || $uaChanged;
            } elseif (!$lastLogin && $user->created_at->diffInDays(now()) < 1) {
                $suspicious = false;
            }
        }

        $log = LoginLog::create([
            'user_id' => $user?->id,
            'email' => $email,
            'ip_address' => $request->ip(),
            'user_agent' => $request->userAgent(),
            'browser' => self::parseBrowser($request->userAgent()),
            'success' => $success,
            'suspicious' => $suspicious,
            'failure_reason' => $failureReason,
            'created_at' => now(),
        ]);

        if ($suspicious && $user && $success) {
            try {
                Mail::to($user->email)->queue(new LoginAlert($user, $log, $lastLogin));
            } catch (\Throwable $e) {
                Log::error('Login alert email failed', [
                    'user_id' => $user->id,
                    'error' => $e->getMessage(),
                ]);
            }
        }

        return $log;
    }

    private static function parseBrowser(?string $userAgent): ?string
    {
        if (!$userAgent) return null;
        if (str_contains($userAgent, 'Edge')) return 'Edge';
        if (str_contains($userAgent, 'Chrome')) return 'Chrome';
        if (str_contains($userAgent, 'Firefox')) return 'Firefox';
        if (str_contains($userAgent, 'Safari')) return 'Safari';
        if (str_contains($userAgent, 'Opera')) return 'Opera';
        return 'Autre';
    }
}
