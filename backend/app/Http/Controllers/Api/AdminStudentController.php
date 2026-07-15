<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class AdminStudentController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $query = User::where('role', 'student')
            ->with(['studentProfile.city', 'skills'])
            ->withCount('applications');

        if ($search = $request->input('search')) {
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                    ->orWhereRaw("CONCAT(firstname, ' ', lastname) LIKE ?", ["%{$search}%"])
                    ->orWhere('email', 'like', "%{$search}%");
            });
        }

        $sortField = in_array($request->input('sort'), ['created_at', 'name', 'email']) ? $request->input('sort') : 'created_at';
        $sortOrder = $request->input('order') === 'asc' ? 'asc' : 'desc';
        $perPage = min((int) $request->input('per_page', 15), 50);

        $students = $query->orderBy($sortField, $sortOrder)
            ->paginate($perPage)
            ->through(function ($u) {
                return [
                    'id' => $u->id,
                    'name' => $u->name,
                    'firstname' => $u->firstname,
                    'lastname' => $u->lastname,
                    'email' => $u->email,
                    'phone' => $u->phone,
                    'status' => $u->status,
                    'banned_at' => $u->banned_at,
                    'created_at' => $u->created_at,
                    'profile' => $u->studentProfile ? [
                        'id' => $u->studentProfile->id,
                        'school' => $u->studentProfile->school,
                        'major' => $u->studentProfile->major,
                        'graduation_year' => $u->studentProfile->graduation_year,
                        'birth_date' => $u->studentProfile->birth_date?->format('Y-m-d'),
                        'gender' => $u->studentProfile->gender,
                        'address' => $u->studentProfile->address,
                        'city' => $u->studentProfile->city ? $u->studentProfile->city->name : null,
                        'bio' => $u->studentProfile->bio,
                        'cv_path' => $u->studentProfile->cv_path,
                    ] : null,
                    'skills' => $u->skills->map(function ($s) {
                        return [
                            'id' => $s->id,
                            'name' => $s->name,
                            'level' => $s->pivot->level,
                        ];
                    }),
                    'applications_count' => $u->applications_count,
                ];
            });

        return response()->json($students);
    }

    public function show(User $user): JsonResponse
    {
        if ($user->role !== 'student') {
            abort(404);
        }

        $user->load(['studentProfile.city', 'skills', 'applications.internship.company', 'favorites.internship']);

        $applications = $user->applications->map(function ($a) {
            return [
                'id' => $a->id,
                'status' => $a->status,
                'cover_letter' => $a->cover_letter,
                'cv_path' => $a->cv_path,
                'created_at' => $a->created_at,
                'internship' => $a->internship ? [
                    'id' => $a->internship->id,
                    'title' => $a->internship->title,
                    'company' => $a->internship->company ? $a->internship->company->name : null,
                ] : null,
            ];
        });

        $profile = $user->studentProfile;

        $cvUrl = $profile && $profile->cv_path ? url('storage/' . $profile->cv_path) : null;

        return response()->json([
            'user' => [
                'id' => $user->id,
                'name' => $user->name,
                'firstname' => $user->firstname,
                'lastname' => $user->lastname,
                'email' => $user->email,
                'phone' => $user->phone,
                'status' => $user->status,
                'created_at' => $user->created_at,
                'banned_at' => $user->banned_at,
            ],
            'profile' => $profile ? [
                'id' => $profile->id,
                'school' => $profile->school,
                'major' => $profile->major,
                'graduation_year' => $profile->graduation_year,
                'birth_date' => $profile->birth_date?->format('Y-m-d'),
                'gender' => $profile->gender,
                'address' => $profile->address,
                'city' => $profile->city ? $profile->city->name : null,
                'bio' => $profile->bio,
                'cv_path' => $profile->cv_path,
                'photo' => $profile->photo,
                'github' => $profile->github,
                'portfolio' => $profile->portfolio,
                'linkedin' => $profile->linkedin,
            ] : null,
            'cv_url' => $cvUrl,
            'skills' => $user->skills->map(function ($s) {
                return [
                    'id' => $s->id,
                    'name' => $s->name,
                    'level' => $s->pivot->level,
                ];
            }),
            'applications' => $applications,
            'favorites_count' => $user->favorites->count(),
        ]);
    }
}
