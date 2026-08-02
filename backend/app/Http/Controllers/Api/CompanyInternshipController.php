<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Internship;
use App\Services\AuditService;
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
            ->withCount('applications')
            ->where('company_id', $company->id)
            ->latest()
            ->get();

        $internships->loadCount(['applications as high_count' => fn($q) => $q->where('relevance', 'high')]);
        $internships->loadCount(['applications as medium_count' => fn($q) => $q->where('relevance', 'medium')]);
        $internships->loadCount(['applications as low_count' => fn($q) => $q->where('relevance', 'low')]);

        $internships->each(function ($internship) {
            $internship->application_stats = [
                'total' => $internship->applications_count,
                'high' => $internship->high_count,
                'medium' => $internship->medium_count,
                'low' => $internship->low_count,
            ];
            unset($internship->high_count, $internship->medium_count, $internship->low_count);
        });

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
            'study_level' => 'nullable|string|max:100',
            'salary' => 'nullable|numeric|min:0',
            'slots' => 'nullable|integer|min:1',
            'deadline' => 'nullable|date',
            'status' => 'nullable|in:draft,published,closed,expired',
            'categories' => 'nullable|array',
            'categories.*' => 'exists:categories,id',
        ]);

        $validated['company_id'] = $company->id;

        $internship = Internship::create($validated);

        if ($request->has('categories')) {
            $internship->categories()->sync($request->categories);
        }

        AuditService::log('internship_create', "Offre créée : {$internship->title}", $internship);

        $internship->load('categories');

        return response()->json($internship, 201);
    }

    public function show(Request $request, Internship $internship): JsonResponse
    {
        $this->authorize('update', $internship);

        $internship->load('categories');

        return response()->json($internship);
    }

    public function update(Request $request, Internship $internship): JsonResponse
    {
        $this->authorize('update', $internship);

        $validated = $request->validate([
            'title' => 'sometimes|string|max:255',
            'description' => 'sometimes|string',
            'requirements' => 'nullable|string',
            'location' => 'nullable|string',
            'type' => 'nullable|in:remote,onsite,hybrid',
            'duration' => 'nullable|string',
            'study_level' => 'nullable|string|max:100',
            'salary' => 'nullable|numeric|min:0',
            'slots' => 'nullable|integer|min:1',
            'deadline' => 'nullable|date',
            'status' => 'nullable|in:draft,published,closed,expired',
            'categories' => 'nullable|array',
            'categories.*' => 'exists:categories,id',
        ]);

        $internship->update($validated);

        if ($request->has('categories')) {
            $internship->categories()->sync($request->categories);
        }

        AuditService::log('internship_update', "Offre mise à jour : {$internship->title}", $internship, null, 'success', [
            'changes' => array_keys($validated),
        ]);

        $internship->load('categories');

        return response()->json($internship);
    }

    public function destroy(Request $request, Internship $internship): JsonResponse
    {
        $this->authorize('delete', $internship);

        AuditService::log('internship_delete', "Offre supprimée : {$internship->title}", $internship);

        $internship->delete();

        return response()->json(['message' => 'Internship deleted successfully.']);
    }
}
