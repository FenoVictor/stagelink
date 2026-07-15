<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Favorite;
use App\Models\Internship;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class FavoriteController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $favorites = $request->user()->favorites()
            ->with('internship.company', 'internship.city')
            ->latest()
            ->get();

        return response()->json($favorites);
    }

    public function toggle(Request $request, Internship $internship): JsonResponse
    {
        $user = $request->user();
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
