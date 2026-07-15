<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Company;
use App\Models\StudentProfile;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;
use Illuminate\Validation\ValidationException;

class AuthController extends Controller
{
    public function register(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'firstname' => 'required|string|max:100',
            'lastname' => 'required|string|max:100',
            'email' => 'required|string|email|max:255|unique:users',
            'password' => 'required|string|min:8|confirmed',
            'role' => 'required|in:student,company',
        ]);

        $companyData = null;
        if ($validated['role'] === 'company') {
            $companyData = $request->validate([
                'company_name' => 'nullable|string|max:255',
                'description' => 'nullable|string',
                'website' => 'nullable|string|url',
                'location' => 'nullable|string',
                'industry' => 'nullable|string',
            ]);
        }

        DB::beginTransaction();
        try {
            $validated['password'] = Hash::make($validated['password']);
            $validated['name'] = trim($validated['firstname'] . ' ' . $validated['lastname']);
            $user = User::create($validated);

            if ($user->role === 'company') {
                Company::create([
                    'user_id' => $user->id,
                    'name' => $companyData['company_name'] ?? $user->name,
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

            DB::commit();

            $token = $user->createToken('api-token')->plainTextToken;

            Log::info('User registered', ['user_id' => $user->id, 'role' => $user->role, 'email' => $user->email]);

            return response()->json([
                'user' => $user,
                'token' => $token,
            ], 201);
        } catch (\Throwable $e) {
            DB::rollBack();
            Log::error('Registration failed', ['error' => $e->getMessage(), 'email' => $validated['email'] ?? null]);
            return response()->json(['message' => 'Erreur lors de l\'inscription.'], 500);
        }
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
                'email' => __('auth.failed'),
            ]);
        }

        $token = $user->createToken('api-token')->plainTextToken;

        Log::info('User logged in', ['user_id' => $user->id, 'email' => $user->email]);

        return response()->json([
            'user' => $user,
            'token' => $token,
        ]);
    }

    public function logout(Request $request): JsonResponse
    {
        $request->user()->currentAccessToken()->delete();

        Log::info('User logged out', ['user_id' => $request->user()->id]);

        return response()->json(['message' => 'Déconnexion réussie.']);
    }

    public function user(Request $request): JsonResponse
    {
        $user = $request->user()->load(['companyProfile', 'studentProfile', 'applications']);

        return response()->json($user);
    }

    public function changePassword(Request $request): JsonResponse
    {
        $request->validate([
            'current_password' => 'required|string',
            'password' => 'required|string|min:8|confirmed',
        ]);

        $user = $request->user();

        if (!Hash::check($request->current_password, $user->password)) {
            return response()->json(['message' => 'Le mot de passe actuel est incorrect.'], 422);
        }

        $user->update(['password' => Hash::make($request->password)]);

        $user->tokens()->delete();

        Log::info('Mot de passe changé', ['user_id' => $user->id]);

        return response()->json(['message' => 'Mot de passe mis à jour. Veuillez vous reconnecter.']);
    }

    public function forgotPassword(Request $request): JsonResponse
    {
        $request->validate(['email' => 'required|email|exists:users,email']);

        $token = Str::random(64);

        DB::table('password_reset_tokens')->updateOrInsert(
            ['email' => $request->email],
            ['token' => Hash::make($token), 'created_at' => now()]
        );

        $resetUrl = url("/reset-password?token={$token}&email={$request->email}");
        Log::info('Réinitialisation de mot de passe demandée', [
            'email' => $request->email,
            'reset_url' => $resetUrl,
        ]);

        return response()->json([
            'message' => __('passwords.sent'),
            'reset_url' => $resetUrl,
        ]);
    }

    public function resetPassword(Request $request): JsonResponse
    {
        $request->validate([
            'email' => 'required|email',
            'token' => 'required|string',
            'password' => 'required|string|min:8|confirmed',
        ]);

        $record = DB::table('password_reset_tokens')->where('email', $request->email)->first();

        if (!$record || !Hash::check($request->token, $record->token)) {
            return response()->json(['message' => __('passwords.token')], 400);
        }

        if ($record->created_at && Carbon::parse($record->created_at)->addMinutes(60)->isPast()) {
            DB::table('password_reset_tokens')->where('email', $request->email)->delete();
            return response()->json(['message' => __('passwords.token')], 400);
        }

        $user = User::where('email', $request->email)->first();
        $user->forceFill(['password' => Hash::make($request->password)])->save();
        $user->tokens()->delete();

        DB::table('password_reset_tokens')->where('email', $request->email)->delete();

        Log::info('Mot de passe réinitialisé', ['user_id' => $user->id, 'email' => $user->email]);

        return response()->json(['message' => __('passwords.reset')]);
    }
}
