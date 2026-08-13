<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\ActivityLog;
use App\Models\User;
use App\Services\StudentProfilePresenter;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Symfony\Component\HttpFoundation\StreamedResponse;

class StudentPublicController extends Controller
{
    public function show(Request $request, User $user): JsonResponse
    {
        if ($user->role !== 'student') {
            abort(404);
        }

        $user->load(['studentProfile.city', 'studentProfile.commune', 'studentProfile.neighborhood', 'skills']);

        $profile = $user->studentProfile;

        if (! $profile) {
            return response()->json(['message' => 'Profil non trouvé.'], 404);
        }

        $data = StudentProfilePresenter::present($user, $profile);

        ActivityLog::create([
            'user_id' => $request->user()?->id,
            'action' => 'profile_view',
            'subject_type' => User::class,
            'subject_id' => $user->id,
            'ip_address' => $request->ip(),
            'user_agent' => $request->userAgent(),
        ]);

        return response()->json($data);
    }

    public function cv(Request $request, User $user): StreamedResponse
    {
        if ($user->role !== 'student') {
            abort(404);
        }

        $profile = $user->studentProfile;

        if (! $profile || ! $profile->cv_path || ! Storage::disk('public')->exists($profile->cv_path)) {
            abort(404);
        }

        ActivityLog::create([
            'user_id' => $request->user()?->id,
            'action' => 'cv_download',
            'subject_type' => User::class,
            'subject_id' => $user->id,
            'ip_address' => $request->ip(),
            'user_agent' => $request->userAgent(),
        ]);

        $filename = 'CV-'.str_replace(' ', '-', trim($user->name ?? 'etudiant')).'.pdf';

        return Storage::disk('public')->download($profile->cv_path, $filename);
    }
}
