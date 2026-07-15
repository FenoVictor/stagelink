<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Internship;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class InternshipController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $query = Internship::with(['company', 'category:id,name'])
            ->withCount('applications')
            ->where('status', 'published');

        if ($keyword = $request->keyword) {
            $query->where(function ($q) use ($keyword) {
                $q->where('title', 'like', "%{$keyword}%")
                  ->orWhere('description', 'like', "%{$keyword}%")
                  ->orWhere('requirements', 'like', "%{$keyword}%")
                  ->orWhereHas('company', fn($c) => $c->where('name', 'like', "%{$keyword}%"));
            });
        }

        if ($location = $request->location) {
            $query->where('location', 'like', "%{$location}%");
        }

        if ($category = $request->category) {
            $query->where('category_id', $category);
        }

        if ($type = $request->type) {
            $query->where('type', $type);
        }

        if ($studyLevel = $request->study_level) {
            $query->where('study_level', $studyLevel);
        }

        if ($duration = $request->duration) {
            $query->where('duration', $duration);
        }

        if ($request->boolean('is_paid')) {
            $query->where('salary', '>', 0);
        }

        if ($salaryMin = $request->salary_min) {
            $query->where('salary', '>=', $salaryMin);
        }
        if ($salaryMax = $request->salary_max) {
            $query->where('salary', '<=', $salaryMax);
        }

        if ($dateFrom = $request->date_from) {
            $query->whereDate('created_at', '>=', $dateFrom);
        }
        if ($dateTo = $request->date_to) {
            $query->whereDate('created_at', '<=', $dateTo);
        }

        $sortField = $request->sort ?? 'created_at';
        $sortDir = $request->order ?? 'desc';
        $allowedSorts = ['created_at', 'title', 'salary', 'views_count'];
        if (in_array($sortField, $allowedSorts)) {
            $query->orderBy($sortField, $sortDir === 'asc' ? 'asc' : 'desc');
        } else {
            $query->latest();
        }

        $perPage = min((int) ($request->per_page ?? 12), 50);
        $internships = $query->paginate($perPage);

        if ($request->user()) {
            $userFavorites = $request->user()->favorites()->pluck('internship_id')->toArray();
            $internships->getCollection()->transform(function ($item) use ($userFavorites) {
                $item->is_favorited = in_array($item->id, $userFavorites);
                return $item;
            });
        }

        return response()->json($internships);
    }

    public function filters(): JsonResponse
    {
        $locations = Internship::where('status', 'published')
            ->whereNotNull('location')
            ->select('location')
            ->distinct()
            ->orderBy('location')
            ->pluck('location');

        $durations = Internship::where('status', 'published')
            ->whereNotNull('duration')
            ->select('duration')
            ->distinct()
            ->orderBy('duration')
            ->pluck('duration');

        $studyLevels = Internship::where('status', 'published')
            ->whereNotNull('study_level')
            ->select('study_level')
            ->distinct()
            ->orderBy('study_level')
            ->pluck('study_level');

        return response()->json([
            'locations' => $locations,
            'durations' => $durations,
            'study_levels' => $studyLevels,
        ]);
    }

    public function show(Request $request, Internship $internship): JsonResponse
    {
        $internship->increment('views_count');
        $internship->load(['company', 'categories', 'category:id,name']);

        $response = [
            'internship' => $internship,
            'applications_count' => $internship->applications()->count(),
        ];

        if ($request->user()) {
            $response['is_favorited'] = $request->user()->favorites()
                ->where('internship_id', $internship->id)
                ->exists();
        }

        return response()->json($response);
    }
}
