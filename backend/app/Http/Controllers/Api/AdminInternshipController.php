<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Internship;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class AdminInternshipController extends Controller
{
    public function index(): JsonResponse
    {
        $internships = Internship::with('company')->latest()->get();

        return response()->json($internships);
    }

    public function update(Request $request, Internship $internship): JsonResponse
    {
        $validated = $request->validate([
            'status' => 'sometimes|in:draft,open,closed,filled',
            'title' => 'sometimes|string|max:255',
            'description' => 'sometimes|string',
        ]);

        $internship->update($validated);

        return response()->json($internship);
    }

    public function destroy(Internship $internship): JsonResponse
    {
        $internship->delete();

        return response()->json(['message' => 'Internship deleted successfully.']);
    }
}
