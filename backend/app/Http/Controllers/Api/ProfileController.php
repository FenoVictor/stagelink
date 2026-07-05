<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\StudentProfile;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ProfileController extends Controller
{
    public function show(Request $request): JsonResponse
    {
        $profile = StudentProfile::where('user_id', $request->user()->id)->first();

        if (!$profile) {
            return response()->json(['message' => 'Profile not found.'], 404);
        }

        return response()->json($profile);
    }

    public function update(Request $request): JsonResponse
    {
        $profile = StudentProfile::where('user_id', $request->user()->id)->firstOrFail();

        $validated = $request->validate([
            'phone' => 'nullable|string|max:20',
            'bio' => 'nullable|string',
            'skills' => 'nullable|string',
            'school' => 'nullable|string|max:255',
            'major' => 'nullable|string|max:255',
            'graduation_year' => 'nullable|integer|min:1900|max:2100',
        ]);

        if ($request->hasFile('cv')) {
            $request->validate(['cv' => 'file|mimes:pdf,doc,docx|max:2048']);
            $validated['cv_path'] = $request->file('cv')->store('cvs', 'public');
        }

        $profile->update($validated);

        return response()->json($profile);
    }
}
