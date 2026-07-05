<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Application;
use App\Models\Internship;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class CompanyApplicationController extends Controller
{
    public function index(Request $request, Internship $internship): JsonResponse
    {
        $company = $request->user()->companyProfile;

        if ($internship->company_id !== $company->id) {
            return response()->json(['message' => 'Unauthorized.'], 403);
        }

        $applications = Application::with('student')
            ->where('internship_id', $internship->id)
            ->latest()
            ->get();

        return response()->json($applications);
    }

    public function update(Request $request, Application $application): JsonResponse
    {
        $company = $request->user()->companyProfile;

        if ($application->internship->company_id !== $company->id) {
            return response()->json(['message' => 'Unauthorized.'], 403);
        }

        $validated = $request->validate([
            'status' => 'required|in:accepted,rejected',
        ]);

        $application->update($validated);

        return response()->json($application);
    }
}
