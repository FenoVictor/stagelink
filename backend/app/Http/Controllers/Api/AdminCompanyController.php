<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Company;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

class AdminCompanyController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $query = Company::with(['user', 'city', 'internships'])
            ->withCount('internships');

        if ($search = $request->input('search')) {
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                    ->orWhere('email', 'like', "%{$search}%")
                    ->orWhere('location', 'like', "%{$search}%");
            });
        }

        $sortField = in_array($request->input('sort'), ['created_at', 'name']) ? $request->input('sort') : 'created_at';
        $sortOrder = $request->input('order') === 'asc' ? 'asc' : 'desc';
        $perPage = min((int) $request->input('per_page', 15), 50);

        $companies = $query->orderBy($sortField, $sortOrder)
            ->paginate($perPage)
            ->through(function ($c) {
                return [
                    'id' => $c->id,
                    'name' => $c->name,
                    'description' => $c->description,
                    'logo' => $c->logo,
                    'website' => $c->website,
                    'location' => $c->location,
                    'industry' => $c->industry,
                    'status' => $c->status,
                    'phone' => $c->phone,
                    'address' => $c->address,
                    'employees_count' => $c->employees_count,
                    'city' => $c->city ? $c->city->name : null,
                    'verified_at' => $c->verified_at,
                    'created_at' => $c->created_at,
                    'user' => $c->user ? ['id' => $c->user->id, 'name' => $c->user->name, 'email' => $c->user->email] : null,
                    'internships_count' => $c->internships_count,
                ];
            });

        return response()->json($companies);
    }

    public function show(Company $company): JsonResponse
    {
        $company->load(['user', 'city', 'internships.applications']);

        $internships = $company->internships->map(function ($i) {
            return [
                'id' => $i->id,
                'title' => $i->title,
                'status' => $i->status,
                'location' => $i->location,
                'type' => $i->type,
                'salary' => $i->salary,
                'views_count' => $i->views_count,
                'created_at' => $i->created_at,
                'applications_count' => $i->applications->count(),
            ];
        });

        return response()->json([
            'company' => [
                'id' => $company->id,
                'name' => $company->name,
                'description' => $company->description,
                'logo' => $company->logo,
                'website' => $company->website,
                'location' => $company->location,
                'industry' => $company->industry,
                'status' => $company->status,
                'phone' => $company->phone,
                'address' => $company->address,
                'employees_count' => $company->employees_count,
                'city' => $company->city ? $company->city->name : null,
                'verified_at' => $company->verified_at,
                'created_at' => $company->created_at,
                'updated_at' => $company->updated_at,
                'user' => $company->user ? ['id' => $company->user->id, 'name' => $company->user->name, 'email' => $company->user->email] : null,
            ],
            'internships' => $internships,
        ]);
    }

    public function validate(Company $company): JsonResponse
    {
        $company->update(['status' => 'validated', 'verified_at' => now()]);

        Log::info('Entreprise validée par admin', [
            'admin_id' => request()->user()->id,
            'company_id' => $company->id,
        ]);

        return response()->json(['message' => 'Entreprise validée.', 'company' => $company]);
    }

    public function suspend(Company $company): JsonResponse
    {
        $company->update(['status' => 'suspended']);

        $company->internships()->where('status', 'published')->update(['status' => 'closed']);

        Log::info('Entreprise suspendue par admin', [
            'admin_id' => request()->user()->id,
            'company_id' => $company->id,
        ]);

        return response()->json(['message' => 'Entreprise suspendue.', 'company' => $company]);
    }

    public function reactivate(Company $company): JsonResponse
    {
        $company->update(['status' => 'validated']);

        Log::info('Entreprise réactivée par admin', [
            'admin_id' => request()->user()->id,
            'company_id' => $company->id,
        ]);

        return response()->json(['message' => 'Entreprise réactivée.', 'company' => $company]);
    }

    public function destroy(Company $company): JsonResponse
    {
        $company->internships()->delete();
        $company->delete();

        Log::info('Entreprise supprimée par admin', [
            'admin_id' => request()->user()->id,
            'company_id' => $company->id,
        ]);

        return response()->json(['message' => 'Entreprise supprimée.']);
    }
}
