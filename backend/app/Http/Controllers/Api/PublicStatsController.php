<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Models\Company;
use App\Models\Internship;
use App\Models\StudentProfile;
use Illuminate\Http\JsonResponse;

class PublicStatsController extends Controller
{
    public function __invoke(): JsonResponse
    {
        $totalStudents = User::where('role', 'student')->count();
        $completeProfiles = StudentProfile::whereNotNull('bio')
            ->where('bio', '!=', '')
            ->whereNotNull('school')
            ->where('school', '!=', '')
            ->whereNotNull('major')
            ->where('major', '!=', '')
            ->whereNotNull('phone')
            ->where('phone', '!=', '')
            ->count();

        $placement = $totalStudents > 0
            ? (int) round(($completeProfiles / $totalStudents) * 100)
            : 0;

        return response()->json([
            'internships' => Internship::where('status', 'published')->count(),
            'students' => $totalStudents,
            'companies' => Company::where('status', 'validated')->count(),
            'placement' => $placement,
        ]);
    }
}
