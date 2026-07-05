<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Company;
use App\Models\StudentProfile;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\ValidationException;

class AuthController extends Controller
{
    public function register(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:users',
            'password' => 'required|string|min:8|confirmed',
            'role' => 'required|in:student,company',
        ]);

        $validated['password'] = Hash::make($validated['password']);

        $user = User::create($validated);

        if ($user->role === 'company') {
            $companyData = $request->validate([
                'company_name' => 'required|string|max:255',
                'description' => 'nullable|string',
                'website' => 'nullable|string|url',
                'location' => 'nullable|string',
                'industry' => 'nullable|string',
            ]);

            Company::create([
                'user_id' => $user->id,
                'name' => $companyData['company_name'],
                'description' => $companyData['description'] ?? null,
                'website' => $companyData['website'] ?? null,
                'location' => $companyData['location'] ?? null,
                'industry' => $companyData['industry'] ?? null,
            ]);
        } elseif ($user->role === 'student') {
            StudentProfile::create([
                'user_id' => $user->id,
            ]);
        }

        $token = $user->createToken('api-token')->plainTextToken;

        return response()->json([
            'user' => $user,
            'token' => $token,
        ], 201);
    }

    public function login(Request $request): JsonResponse
    {
        $request->validate([
            'email' => 'required|string|email',
            'password' => 'required|string',
        ]);

        $user = User::where('email', $request->email)->first();

        if (!$user || !Hash::check($request->password, $user->password)) {
            throw ValidationException::withMessages([
                'email' => ['The provided credentials are incorrect.'],
            ]);
        }

        $token = $user->createToken('api-token')->plainTextToken;

        return response()->json([
            'user' => $user,
            'token' => $token,
        ]);
    }

    public function logout(Request $request): JsonResponse
    {
        $request->user()->currentAccessToken()->delete();

        return response()->json(['message' => 'Logged out successfully.']);
    }

    public function user(Request $request): JsonResponse
    {
        $user = $request->user()->load(['companyProfile', 'studentProfile', 'applications']);

        return response()->json($user);
    }
}
