<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Internship;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class AdminInternshipController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $query = Internship::with('company');

        if ($search = $request->input('search')) {
            $query->where(function ($q) use ($search) {
                $q->where('title', 'like', "%{$search}%")
                    ->orWhere('description', 'like', "%{$search}%")
                    ->orWhereHas('company', function ($cq) use ($search) {
                        $cq->where('name', 'like', "%{$search}%");
                    });
            });
        }

        if ($status = $request->input('status')) {
            $query->where('status', $status);
        }

        $sortField = in_array($request->input('sort'), ['created_at', 'title', 'status']) ? $request->input('sort') : 'created_at';
        $sortOrder = $request->input('order') === 'asc' ? 'asc' : 'desc';
        $perPage = min((int) $request->input('per_page', 15), 50);

        $internships = $query->orderBy($sortField, $sortOrder)
            ->paginate($perPage);

        return response()->json($internships);
    }

    public function update(Request $request, Internship $internship): JsonResponse
    {
        $validated = $request->validate([
            'status' => 'sometimes|in:draft,published,closed,expired',
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
