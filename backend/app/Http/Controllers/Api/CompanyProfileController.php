<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\City;
use App\Models\Company;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

class CompanyProfileController extends Controller
{
    public function show(Request $request): JsonResponse
    {
        $user = $request->user();
        $company = $user->companyProfile;

        if (!$company) {
            $company = Company::create([
                'user_id' => $user->id,
                'name' => $user->name,
                'location' => 'Toliara, Madagascar',
            ]);
            Log::info('Company profile auto-created', ['user_id' => $user->id]);
        }

        $company->load('user');

        $data = $company->toArray();
        $data['city'] = $company->city ? $company->city->name : null;

        return response()->json($data);
    }

    public function update(Request $request): JsonResponse
    {
        $user = $request->user();
        $company = $user->companyProfile;

        if (!$company) {
            $company = Company::create([
                'user_id' => $user->id,
                'name' => $user->name,
                'location' => 'Toliara, Madagascar',
            ]);
            Log::info('Company profile auto-created during update', ['user_id' => $user->id]);
        }

        $validated = $request->validate([
            'name' => 'sometimes|string|max:255',
            'description' => 'nullable|string',
            'website' => 'nullable|string|url',
            'location' => 'nullable|string',
            'industry' => 'nullable|string',
            'phone' => 'nullable|string|max:20',
            'city_id' => 'nullable|exists:cities,id',
            'address' => 'nullable|string|max:1000',
            'employees_count' => 'nullable|integer|min:0',
        ]);

        if ($request->has('verified_at') && $user->role === 'admin') {
            $validated['verified_at'] = now();
        }

        if ($request->hasFile('logo')) {
            $request->validate(['logo' => 'file|image|mimes:jpeg,png,jpg,gif,webp|max:2048']);
            $validated['logo'] = $request->file('logo')->store('logos', 'public');
        }

        $company->update($validated);

        Log::info('Company profile updated', ['user_id' => $user->id, 'company_id' => $company->id]);

        return response()->json($company);
    }
}
