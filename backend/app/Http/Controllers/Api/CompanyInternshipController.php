<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreCompanyInternshipRequest;
use App\Http\Requests\UpdateCompanyInternshipRequest;
use App\Models\Internship;
use App\Services\AuditService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class CompanyInternshipController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $company = $request->user()->companyProfile;

        if (! $company) {
            return response()->json(['message' => 'Company profile not found.'], 404);
        }

        $perPage = min((int) $request->input('per_page', 50), 100);

        $internships = Internship::with('categories')
            ->withCount('applications')
            ->where('company_id', $company->id)
            ->latest()
            ->paginate($perPage);

        $internships->getCollection()->loadCount([
            'applications as high_count' => fn ($q) => $q->where('relevance', 'high'),
            'applications as medium_count' => fn ($q) => $q->where('relevance', 'medium'),
            'applications as low_count' => fn ($q) => $q->where('relevance', 'low'),
        ]);

        $internships->getCollection()->each(function ($internship) {
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

    public function store(StoreCompanyInternshipRequest $request): JsonResponse
    {
        $company = $request->user()->companyProfile;

        if (! $company) {
            return response()->json(['message' => 'Company profile not found.'], 404);
        }

        $validated = $request->validated();

        $validated['company_id'] = $company->id;

        $internship = Internship::create($validated);

        $this->syncCategories($internship, $request->input('category_id'), $request->input('categories', []));

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

    public function update(UpdateCompanyInternshipRequest $request, Internship $internship): JsonResponse
    {
        $this->authorize('update', $internship);

        $validated = $request->validated();

        $internship->update($validated);

        if ($request->has('category_id') || $request->has('categories')) {
            $this->syncCategories($internship, $request->input('category_id'), $request->input('categories', []));
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

    private function syncCategories(Internship $internship, $categoryId, array $categoryIds): void
    {
        $categoryIds = array_values(array_filter(array_map('intval', $categoryIds)));

        if ($categoryId) {
            $categoryIds[] = (int) $categoryId;
        }

        $categoryIds = array_values(array_unique($categoryIds));

        $internship->categories()->sync($categoryIds);

        if ($categoryIds) {
            $internship->forceFill(['category_id' => $categoryIds[0]])->save();
        }
    }
}
