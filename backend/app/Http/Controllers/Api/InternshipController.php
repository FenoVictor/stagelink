<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Internship;
use Illuminate\Http\JsonResponse;

class InternshipController extends Controller
{
    public function index(): JsonResponse
    {
        $internships = Internship::with('company')
            ->where('status', 'open')
            ->latest()
            ->get();

        return response()->json($internships);
    }

    public function show(Internship $internship): JsonResponse
    {
        $internship->load(['company', 'categories', 'applications']);

        return response()->json([
            'internship' => $internship,
            'applications_count' => $internship->applications->count(),
        ]);
    }
}
