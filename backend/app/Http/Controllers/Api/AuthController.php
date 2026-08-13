<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\ChangePasswordRequest;
use App\Http\Requests\ForgotPasswordRequest;
use App\Http\Requests\LoginRequest;
use App\Http\Requests\RegisterRequest;
use App\Http\Requests\ResetPasswordRequest;
use App\Http\Requests\VerifyTwoFactorLoginRequest;
use App\Mail\ForgotPassword;
use App\Mail\Welcome;
use App\Models\Company;
use App\Models\PasswordResetToken;
use App\Models\StudentProfile;
use App\Models\User;
use App\Notifications\VerifyEmailNotification;
use App\Services\AuditService;
use App\Services\LoginLogService;
use Carbon\Carbon;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Crypt;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Illuminate\Validation\ValidationException;
use PragmaRX\Google2FA\Google2FA;

class AuthController extends Controller
{
    public function register(RegisterRequest $request): JsonResponse
    {
        $validated = $request->validated();

        $companyData = null;
        if ($validated['role'] === 'company') {
            $companyData = $validated;
        }

        DB::beginTransaction();
        try {
            $validated['password'] = Hash::make($validated['password']);
            $validated['name'] = trim($validated['firstname'].' '.$validated['lastname']);
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

            try {
                Mail::to($user->email)->queue(new Welcome($user));
            } catch (\Throwable $e) {
                Log::error('Welcome email failed', [
                    'user_id' => $user->id,
                    'error' => $e->getMessage(),
                ]);
            }

            try {
                $user->notify(new VerifyEmailNotification);
            } catch (\Throwable $e) {
                Log::error('Verification email failed', [
                    'user_id' => $user->id,
                    'error' => $e->getMessage(),
                ]);
            }

            $token = $user->createToken('api-token')->plainTextToken;

            AuditService::log('register', "Inscription en tant que {$user->role}", $user, null, 'success', [
                'role' => $user->role,
                'email' => $user->email,
            ]);

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

    public function login(LoginRequest $request): JsonResponse
    {
        $user = User::where('email', $request->email)->first();

        if (! $user || ! Hash::check($request->password, $user->password)) {
            LoginLogService::log($user, $request->input('email'), false, 'Identifiants incorrects');
            AuditService::log('login_failed', 'Tentative de connexion échouée', $user, null, 'failed', [
                'email' => $request->email,
            ]);

            throw ValidationException::withMessages([
                'email' => __('auth.failed'),
            ]);
        }

        if ($user->isBanned()) {
            LoginLogService::log($user, $request->input('email'), false, 'Compte banni');
            AuditService::log('login_failed', 'Tentative de connexion sur compte banni', $user, null, 'failed', [
                'email' => $request->email,
            ]);

            return response()->json([
                'message' => 'Votre compte a été suspendu. Veuillez contacter l\'administration.',
            ], 403);
        }

        if ($user->two_factor_secret && $user->two_factor_confirmed_at) {
            $tempToken = $user->createToken('2fa-temp', ['2fa-pending'])->plainTextToken;

            LoginLogService::log($user, $request->input('email'), true);
            AuditService::log('login', 'Connexion nécessitant 2FA', $user);

            return response()->json([
                'requires_2fa' => true,
                'temp_token' => $tempToken,
                'message' => 'Code 2FA requis.',
            ]);
        }

        $token = $user->createToken('api-token')->plainTextToken;

        LoginLogService::log($user, $request->input('email'), true);
        AuditService::log('login', 'Connexion réussie', $user);

        Log::info('User logged in', ['user_id' => $user->id, 'email' => $user->email]);

        return response()->json([
            'user' => $user,
            'token' => $token,
        ]);
    }

    public function logout(Request $request): JsonResponse
    {
        AuditService::log('logout', 'Déconnexion', $request->user());

        $request->user()->currentAccessToken()->delete();

        Log::info('User logged out', ['user_id' => $request->user()->id]);

        return response()->json(['message' => 'Déconnexion réussie.']);
    }

    public function user(Request $request): JsonResponse
    {
        $user = $request->user()->load(['companyProfile', 'studentProfile', 'applications']);

        return response()->json($user);
    }

    public function changePassword(ChangePasswordRequest $request): JsonResponse
    {
        $user = $request->user();

        if (! Hash::check($request->current_password, $user->password)) {
            return response()->json(['message' => 'Le mot de passe actuel est incorrect.'], 422);
        }

        $user->update(['password' => Hash::make($request->password)]);

        AuditService::log('password_change', 'Mot de passe modifié', $user);

        $user->tokens()->delete();

        Log::info('Mot de passe changé', ['user_id' => $user->id]);

        return response()->json(['message' => 'Mot de passe mis à jour. Veuillez vous reconnecter.']);
    }

    public function forgotPassword(ForgotPasswordRequest $request): JsonResponse
    {
        $token = Str::random(64);

        PasswordResetToken::updateOrCreate(
            ['email' => $request->email],
            ['token' => Hash::make($token), 'created_at' => now()]
        );

        $resetUrl = secure_url("/reset-password?token={$token}&email={$request->email}");

        AuditService::log('password_reset_request', "Demande de réinitialisation pour {$request->email}", null, null, 'success', [
            'email' => $request->email,
        ]);

        try {
            Mail::to($request->email)->queue(new ForgotPassword($request->email, $resetUrl));
        } catch (\Throwable $e) {
            Log::error('Password reset email failed', [
                'email' => $request->email,
                'error' => $e->getMessage(),
            ]);
        }

        Log::info('Réinitialisation de mot de passe demandée', [
            'email' => $request->email,
        ]);

        return response()->json([
            'message' => __('passwords.sent'),
        ]);
    }

    public function resetPassword(ResetPasswordRequest $request): JsonResponse
    {
        $record = PasswordResetToken::where('email', $request->email)->first();

        if (! $record || ! Hash::check($request->token, $record->token)) {
            return response()->json(['message' => __('passwords.token')], 400);
        }

        if ($record->created_at && Carbon::parse($record->created_at)->addMinutes(60)->isPast()) {
            PasswordResetToken::where('email', $request->email)->delete();

            return response()->json(['message' => __('passwords.token')], 400);
        }

        $user = User::where('email', $request->email)->first();
        $user->forceFill(['password' => Hash::make($request->password)])->save();
        $user->tokens()->delete();

        AuditService::log('password_reset', 'Mot de passe réinitialisé', $user);

        PasswordResetToken::where('email', $request->email)->delete();

        Log::info('Mot de passe réinitialisé', ['user_id' => $user->id, 'email' => $user->email]);

        return response()->json(['message' => __('passwords.reset')]);
    }

    public function verifyTwoFactor(VerifyTwoFactorLoginRequest $request): JsonResponse
    {
        $user = $request->user();

        if (! $user || ! $user->two_factor_secret || ! $request->user()->tokenCan('2fa-pending')) {
            return response()->json(['message' => 'Session invalide.'], 401);
        }

        $google2fa = app(Google2FA::class);
        $secret = Crypt::decryptString($user->two_factor_secret);

        if (! $google2fa->verifyKey($secret, $request->input('code'), 4)) {
            $recoveryCodes = $user->two_factor_recovery_codes
                ? json_decode(Crypt::decryptString($user->two_factor_recovery_codes), true)
                : [];
            $code = strtoupper($request->input('code'));
            $found = false;

            if (is_array($recoveryCodes)) {
                foreach ($recoveryCodes as $i => $recoveryCode) {
                    if (hash_equals($code, $recoveryCode)) {
                        $found = true;
                        unset($recoveryCodes[$i]);
                        $user->update(['two_factor_recovery_codes' => Crypt::encryptString(json_encode(array_values($recoveryCodes)))]);
                        break;
                    }
                }
            }

            if (! $found) {
                return response()->json(['message' => 'Code invalide.'], 422);
            }
        }

        $user->currentAccessToken()->delete();

        $token = $user->createToken('api-token')->plainTextToken;

        AuditService::log('login', 'Connexion 2FA complétée', $user);

        return response()->json([
            'token' => $token,
            'user' => [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'role' => $user->role,
                'email_verified_at' => $user->email_verified_at?->toISOString(),
                'photo' => $user->studentProfile?->photo ? Storage::disk('public')->url($user->studentProfile->photo) : null,
            ],
        ]);
    }
}
