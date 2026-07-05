<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class CompanyProfileController extends Controller
{
    public function show(Request $request): JsonResponse
    {
        $company = $request->user()->companyProfile;

        if (!$company) {
            return response()->json(['message' => 'Company profile not found.'], 404);
        }

        $company->load('user');

        return response()->json($company);
    }

    public function update(Request $request): JsonResponse
    {
        $company = $request->user()->companyProfile;

        if (!$company) {
            return response()->json(['message' => 'Company profile not found.'], 404);
        }

        $validated = $request->validate([
            'name' => 'sometimes|string|max:255',
            'description' => 'nullable|string',
            'website' => 'nullable|string|url',
            'location' => 'nullable|string',
            'industry' => 'nullable|string',
        ]);

        if ($request->hasFile('logo')) {
            $request->validate(['logo' => 'file|image|max:2048']);
            $validated['logo'] = $request->file('logo')->store('logos', 'public');
        }

        $company->update($validated);

        return response()->json($company);
    }
}
