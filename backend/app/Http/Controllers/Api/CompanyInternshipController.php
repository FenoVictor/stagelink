<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Internship;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class CompanyInternshipController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $company = $request->user()->companyProfile;

        if (!$company) {
            return response()->json(['message' => 'Company profile not found.'], 404);
        }

        $internships = Internship::with('categories')
            ->where('company_id', $company->id)
            ->latest()
            ->get();

        return response()->json($internships);
    }

    public function store(Request $request): JsonResponse
    {
        $company = $request->user()->companyProfile;

        if (!$company) {
            return response()->json(['message' => 'Company profile not found.'], 404);
        }

        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'description' => 'required|string',
            'requirements' => 'nullable|string',
            'location' => 'nullable|string',
            'type' => 'nullable|in:remote,onsite,hybrid',
            'duration' => 'nullable|string',
            'salary' => 'nullable|numeric|min:0',
            'slots' => 'nullable|integer|min:1',
            'deadline' => 'nullable|date',
            'status' => 'nullable|in:draft,open,closed,filled',
            'categories' => 'nullable|array',
            'categories.*' => 'exists:categories,id',
        ]);

        $validated['company_id'] = $company->id;

        $internship = Internship::create($validated);

        if ($request->has('categories')) {
            $internship->categories()->sync($request->categories);
        }

        $internship->load('categories');

        return response()->json($internship, 201);
    }

    public function show(Request $request, Internship $internship): JsonResponse
    {
        $company = $request->user()->companyProfile;

        if ($internship->company_id !== $company->id) {
            return response()->json(['message' => 'Unauthorized.'], 403);
        }

        $internship->load('categories');

        return response()->json($internship);
    }

    public function update(Request $request, Internship $internship): JsonResponse
    {
        $company = $request->user()->companyProfile;

        if ($internship->company_id !== $company->id) {
            return response()->json(['message' => 'Unauthorized.'], 403);
        }

        $validated = $request->validate([
            'title' => 'sometimes|string|max:255',
            'description' => 'sometimes|string',
            'requirements' => 'nullable|string',
            'location' => 'nullable|string',
            'type' => 'nullable|in:remote,onsite,hybrid',
            'duration' => 'nullable|string',
            'salary' => 'nullable|numeric|min:0',
            'slots' => 'nullable|integer|min:1',
            'deadline' => 'nullable|date',
            'status' => 'nullable|in:draft,open,closed,filled',
            'categories' => 'nullable|array',
            'categories.*' => 'exists:categories,id',
        ]);

        $internship->update($validated);

        if ($request->has('categories')) {
            $internship->categories()->sync($request->categories);
        }

        $internship->load('categories');

        return response()->json($internship);
    }

    public function destroy(Request $request, Internship $internship): JsonResponse
    {
        $company = $request->user()->companyProfile;

        if ($internship->company_id !== $company->id) {
            return response()->json(['message' => 'Unauthorized.'], 403);
        }

        $internship->delete();

        return response()->json(['message' => 'Internship deleted successfully.']);
    }
}
