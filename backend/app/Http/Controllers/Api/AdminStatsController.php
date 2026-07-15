<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Application;
use App\Models\Category;
use App\Models\Company;
use App\Models\Conversation;
use App\Models\Internship;
use App\Models\Interview;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Support\Facades\DB;
use Illuminate\Http\JsonResponse;

class AdminStatsController extends Controller
{
    public function __invoke(): JsonResponse
    {
        $now = Carbon::now();
        $startMonth = $now->copy()->subMonths(11)->startOfMonth();

        $monthlyUsers = User::where('created_at', '>=', $startMonth)
            ->selectRaw("DATE_FORMAT(created_at, '%Y-%m') as month, COUNT(*) as total")
            ->groupBy('month')
            ->orderBy('month')
            ->pluck('total', 'month');

        $monthlyInternships = Internship::where('created_at', '>=', $startMonth)
            ->selectRaw("DATE_FORMAT(created_at, '%Y-%m') as month, COUNT(*) as total")
            ->groupBy('month')
            ->orderBy('month')
            ->pluck('total', 'month');

        $monthlyApplications = Application::where('created_at', '>=', $startMonth)
            ->selectRaw("DATE_FORMAT(created_at, '%Y-%m') as month, COUNT(*) as total")
            ->groupBy('month')
            ->orderBy('month')
            ->pluck('total', 'month');

        $months = [];
        for ($i = 11; $i >= 0; $i--) {
            $m = $now->copy()->subMonths($i)->format('Y-m');
            $months[] = [
                'month' => $m,
                'users' => (int) ($monthlyUsers[$m] ?? 0),
                'internships' => (int) ($monthlyInternships[$m] ?? 0),
                'applications' => (int) ($monthlyApplications[$m] ?? 0),
            ];
        }

        return response()->json([
            'users' => User::count(),
            'students' => User::where('role', 'student')->count(),
            'active_users' => User::where('status', 'active')->count(),
            'banned_users' => User::where('status', 'banned')->count(),
            'inactive_users' => User::where('status', 'inactive')->count(),
            'companies' => Company::count(),
            'verified_companies' => Company::whereNotNull('verified_at')->count(),
            'internships' => Internship::count(),
            'internships_open' => Internship::where('status', 'published')->count(),
            'applications' => Application::count(),
            'applications_pending' => Application::where('status', 'pending')->count(),
            'categories' => Category::count(),
            'conversations' => Conversation::count(),
            'interviews' => Interview::count(),
            'password_resets' => DB::table('password_reset_tokens')->count(),
            'monthly' => $months,
        ]);
    }
}
