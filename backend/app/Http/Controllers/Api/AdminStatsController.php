<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Application;
use App\Models\Company;
use App\Models\Internship;
use App\Models\User;
use Illuminate\Http\JsonResponse;

class AdminStatsController extends Controller
{
    public function __invoke(): JsonResponse
    {
        return response()->json([
            'users' => User::count(),
            'companies' => Company::count(),
            'internships' => Internship::count(),
            'applications' => Application::count(),
        ]);
    }
}
