<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\UpdateCompanyProfileRequest;
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

        $company->load(['user', 'city']);

        $data = $company->toArray();
        $data['city'] = $company->city ? $company->city->name : null;

        return response()->json($data);
    }

    public function update(UpdateCompanyProfileRequest $request): JsonResponse
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

        $validated = $request->validated();

        if ($request->has('verified_at') && $user->role === 'admin') {
            $validated['verified_at'] = now();
        }

        if ($request->hasFile('logo')) {
            $validated['logo'] = $request->file('logo')->store('logos', 'public');
        }

        $company->update($validated);

        Log::info('Company profile updated', ['user_id' => $user->id, 'company_id' => $company->id]);

        return response()->json($company);
    }
}
