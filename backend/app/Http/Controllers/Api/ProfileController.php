<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\City;
use App\Models\Commune;
use App\Models\StudentProfile;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

class ProfileController extends Controller
{
    public function show(Request $request): JsonResponse
    {
        $user = $request->user();
        $profile = StudentProfile::where('user_id', $user->id)->firstOrFail();

        $profile->load(['city', 'commune.district.region.province', 'neighborhood']);

        $data = $profile->toArray();
        $data['city'] = $profile->city ? $profile->city->name : null;
        $data['commune'] = $profile->commune ? [
            'id' => $profile->commune->id,
            'name' => $profile->commune->name,
            'district_id' => $profile->commune->district_id,
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

        $skills = $user->skills()->withPivot('level')->get()->map(function ($s) {
            return [
                'id' => $s->id,
                'name' => $s->name,
                'level' => $s->pivot->level,
            ];
        });
        $data['skills'] = $skills;

        $data['languages'] = $profile->languages;

        return response()->json($data);
    }

    public function update(Request $request): JsonResponse
    {
        $user = $request->user();
        $profile = StudentProfile::where('user_id', $user->id)->firstOrFail();

        $validated = $request->validate([
            'phone' => 'nullable|string|max:20',
            'bio' => 'nullable|string',
            'school' => 'nullable|string|max:255',
            'major' => 'nullable|string|max:255',
            'graduation_year' => 'nullable|integer|min:1950|max:2100',
            'languages' => 'nullable|json',
            'github' => 'nullable|string|url|max:255',
            'portfolio' => 'nullable|string|url|max:255',
            'linkedin' => 'nullable|string|url|max:255',
            'birth_date' => 'nullable|date',
            'gender' => 'nullable|in:male,female,other',
            'city_id' => 'nullable|exists:cities,id',
            'commune_id' => 'nullable|exists:communes,id',
            'neighborhood_id' => 'nullable|exists:neighborhoods,id',
            'address' => 'nullable|string|max:1000',
            'is_employed' => 'nullable|boolean',
            'job_title' => 'nullable|string|max:255',
            'employer' => 'nullable|string|max:255',
            'employed_at' => 'nullable|date',
            'firstname' => 'nullable|string|max:100',
            'lastname' => 'nullable|string|max:100',
            'skills' => 'nullable|array',
            'skills.*.id' => 'required|exists:skills,id',
            'skills.*.level' => 'nullable|string|max:50',
        ]);

        if ($request->hasFile('cv')) {
            $request->validate(['cv' => 'file|mimes:pdf,doc,docx|max:2048']);
            $validated['cv_path'] = $request->file('cv')->store('cvs', 'public');
        }

        if ($request->hasFile('photo')) {
            $request->validate(['photo' => 'file|image|mimes:jpeg,png,jpg,webp|max:2048']);
            $validated['photo'] = $request->file('photo')->store('photos', 'public');
        }

        if (isset($validated['firstname']) || isset($validated['lastname'])) {
            $userData = [];
            if (isset($validated['firstname'])) $userData['firstname'] = $validated['firstname'];
            if (isset($validated['lastname'])) $userData['lastname'] = $validated['lastname'];
            $user->update($userData);
        }

        if (isset($validated['phone'])) {
            $user->update(['phone' => $validated['phone']]);
        }

        if (isset($validated['skills'])) {
            $skillSync = [];
            foreach ($validated['skills'] as $skill) {
                $skillSync[$skill['id']] = ['level' => $skill['level'] ?? null];
            }
            $user->skills()->sync($skillSync);
        }

        $profileUpdate = array_filter($validated, function ($key) {
            return !in_array($key, ['firstname', 'lastname', 'skills', 'phone']);
        }, ARRAY_FILTER_USE_KEY);

        if (isset($profileUpdate['languages']) && is_string($profileUpdate['languages'])) {
            $profileUpdate['languages'] = json_decode($profileUpdate['languages'], true);
        }

        $profile->update($profileUpdate);

        Log::info('Student profile updated', ['user_id' => $request->user()->id]);

        $profile->refresh();
        $profile->load(['city', 'commune', 'neighborhood']);
        $data = $profile->toArray();
        $data['city'] = $profile->city ? $profile->city->name : null;
        $data['commune'] = $profile->commune ? [
            'id' => $profile->commune->id,
            'name' => $profile->commune->name,
            'district_id' => $profile->commune->district_id,
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
