<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\UpdateStudentProfileRequest;
use App\Models\StudentProfile;
use App\Services\StudentProfilePresenter;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

class ProfileController extends Controller
{
    public function show(Request $request): JsonResponse
    {
        $user = $request->user();
        $profile = StudentProfile::where('user_id', $user->id)->firstOrFail();

        return response()->json(StudentProfilePresenter::present($user, $profile));
    }

    public function update(UpdateStudentProfileRequest $request): JsonResponse
    {
        $user = $request->user();
        $profile = StudentProfile::where('user_id', $user->id)->firstOrFail();

        $validated = $request->validated();

        if ($request->hasFile('cv')) {
            $validated['cv_path'] = $request->file('cv')->store('cvs', 'public');
            $validated['cv_uploaded_at'] = now();
        }

        if ($request->hasFile('photo')) {
            $validated['photo'] = $request->file('photo')->store('photos', 'public');
        } elseif ($request->input('remove_photo') === '1') {
            $validated['photo'] = null;
        }

        if (isset($validated['firstname']) || isset($validated['lastname'])) {
            $userData = [];
            if (isset($validated['firstname'])) {
                $userData['firstname'] = $validated['firstname'];
            }
            if (isset($validated['lastname'])) {
                $userData['lastname'] = $validated['lastname'];
            }
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
            return ! in_array($key, ['firstname', 'lastname', 'skills', 'phone']);
        }, ARRAY_FILTER_USE_KEY);

        if (isset($profileUpdate['languages']) && is_string($profileUpdate['languages'])) {
            $profileUpdate['languages'] = json_decode($profileUpdate['languages'], true);
        }

        $profile->update($profileUpdate);

        Log::info('Student profile updated', ['user_id' => $request->user()->id]);

        $profile->refresh();

        return response()->json(StudentProfilePresenter::present($user, $profile));
    }
}
