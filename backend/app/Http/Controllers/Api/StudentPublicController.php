<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\JsonResponse;

class StudentPublicController extends Controller
{
    public function show(User $user): JsonResponse
    {
        if ($user->role !== 'student') {
            abort(404);
        }

        $user->load(['studentProfile.city', 'studentProfile.commune', 'studentProfile.neighborhood', 'skills']);

        $profile = $user->studentProfile;

        if (!$profile) {
            return response()->json(['message' => 'Profil non trouvé.'], 404);
        }

        $data = $profile->toArray();
        $data['city'] = $profile->city ? $profile->city->name : null;
        $data['commune'] = $profile->commune ? [
            'id' => $profile->commune->id,
            'name' => $profile->commune->name,
        ] : null;
        $data['neighborhood'] = $profile->neighborhood ? [
            'id' => $profile->neighborhood->id,
            'name' => $profile->neighborhood->name,
        ] : null;
        $data['firstname'] = $user->firstname;
        $data['lastname'] = $user->lastname;
        $data['email'] = $user->email;
        $data['phone'] = $user->phone;
        $data['photo_url'] = $profile->photo ? url('storage/' . $profile->photo) : null;
        $data['cv_url'] = $profile->cv_path ? url('storage/' . $profile->cv_path) : null;
        $data['skills'] = $user->skills()->withPivot('level')->get()->map(function ($s) {
            return ['id' => $s->id, 'name' => $s->name, 'level' => $s->pivot->level];
        });
        $data['languages'] = $profile->languages;

        return response()->json($data);
    }
}
