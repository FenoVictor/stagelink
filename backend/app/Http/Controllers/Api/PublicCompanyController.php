<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Company;
use Illuminate\Http\JsonResponse;

class PublicCompanyController extends Controller
{
    public function show(Company $company): JsonResponse
    {
        if ($company->status !== 'validated') {
            return response()->json(['message' => 'Entreprise non trouvée.'], 404);
        }

        $company->load('city');

        $internships = $company->internships()
            ->where('status', 'published')
            ->select('id', 'title', 'location', 'type', 'duration', 'salary', 'study_level', 'description', 'created_at')
            ->latest()
            ->limit(50)
            ->get();

        return response()->json([
            'id' => $company->id,
            'name' => $company->name,
            'description' => $company->description,
            'logo' => $company->logo,
            'logo_url' => $company->logo_url,
            'website' => $company->website,
            'location' => $company->location,
            'industry' => $company->industry,
            'phone' => $company->phone,
            'address' => $company->address,
            'employees_count' => $company->employees_count,
            'city' => $company->city ? $company->city->name : null,
            'created_at' => $company->created_at,
            'internships' => $internships,
        ]);
    }
}
