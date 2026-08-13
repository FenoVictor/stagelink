<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Internship;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class FavoriteController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $perPage = min((int) $request->input('per_page', 20), 50);

        $favorites = $request->user()->favorites()
            ->with('internship.company', 'internship.city')
            ->latest()
            ->paginate($perPage);

        return response()->json($favorites);
    }

    public function toggle(Request $request, Internship $internship): JsonResponse
    {
        $user = $request->user();

        if ($user->role !== 'student') {
            return response()->json(['message' => 'Seuls les étudiants peuvent ajouter des favoris.'], 403);
        }

        $favorite = $user->favorites()->where('internship_id', $internship->id)->first();

        if ($favorite) {
            $favorite->delete();

            return response()->json(['favorited' => false]);
        }

        $user->favorites()->create([
            'internship_id' => $internship->id,
            'student_id' => $user->id,
        ]);

        return response()->json(['favorited' => true]);
    }
}
