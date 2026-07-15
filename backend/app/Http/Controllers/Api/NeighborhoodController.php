<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Neighborhood;
use App\Models\Notification;
use App\Models\StudentProfile;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class NeighborhoodController extends Controller
{
    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'commune_id' => 'required|exists:communes,id',
            'name' => 'required|string|max:100',
        ]);

        $exists = Neighborhood::where('commune_id', $validated['commune_id'])
            ->where('name', $validated['name'])
            ->exists();

        if ($exists) {
            return response()->json(['message' => 'Ce quartier existe déjà.'], 409);
        }

        $neighborhood = Neighborhood::create([
            'commune_id' => $validated['commune_id'],
            'name' => $validated['name'],
            'created_by' => $request->user()->id,
            'status' => 'pending',
            'verified' => false,
        ]);

        // Notify all admin users
        $admins = User::where('role', 'admin')->get();
        foreach ($admins as $admin) {
            Notification::create([
                'user_id' => $admin->id,
                'type' => 'neighborhood',
                'title' => 'Nouveau quartier à valider',
                'message' => $neighborhood->name . ' a été proposé par ' . ($request->user()->name ?? 'un étudiant') . ' et attend votre validation.',
            ]);
        }

        // Auto-assign to proposer's student profile
        StudentProfile::where('user_id', $request->user()->id)
            ->whereNull('neighborhood_id')
            ->update(['neighborhood_id' => $neighborhood->id]);

        return response()->json([
            'message' => 'Votre quartier a été proposé. En attente de validation par un administrateur.',
            'neighborhood' => $neighborhood,
        ], 201);
    }

    public function pendingCount(): JsonResponse
    {
        $count = Neighborhood::where('status', 'pending')->count();
        return response()->json(['count' => $count]);
    }

    // Admin: list pending neighborhoods
    public function pending(): JsonResponse
    {
        $neighborhoods = Neighborhood::with(['commune.district.region.province', 'creator'])
            ->where('status', 'pending')
            ->orderBy('created_at', 'desc')
            ->get();

        return response()->json($neighborhoods);
    }

    // Admin: approve a neighborhood
    public function approve(Neighborhood $neighborhood): JsonResponse
    {
        $neighborhood->update(['status' => 'approved', 'verified' => true]);

        // Fallback: set proposer's neighborhood_id if not already set
        if ($neighborhood->created_by) {
            StudentProfile::where('user_id', $neighborhood->created_by)
                ->whereNull('neighborhood_id')
                ->update(['neighborhood_id' => $neighborhood->id]);
        }

        return response()->json(['message' => 'Quartier approuvé.', 'neighborhood' => $neighborhood]);
    }

    // Admin: reject a neighborhood
    public function reject(Neighborhood $neighborhood): JsonResponse
    {
        $neighborhood->update(['status' => 'rejected', 'verified' => false]);

        return response()->json(['message' => 'Quartier refusé.', 'neighborhood' => $neighborhood]);
    }
}
