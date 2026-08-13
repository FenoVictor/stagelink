<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\ConfirmTwoFactorRequest;
use App\Http\Requests\DisableTwoFactorRequest;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Crypt;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;
use PragmaRX\Google2FA\Google2FA;

class TwoFactorController extends Controller
{
    public function status(Request $request): JsonResponse
    {
        $user = $request->user();

        return response()->json([
            'enabled' => $user->two_factor_secret && $user->two_factor_confirmed_at,
            'confirmed_at' => $user->two_factor_confirmed_at?->toISOString(),
            'recovery_codes' => $user->two_factor_recovery_codes
                ? json_decode(Crypt::decryptString($user->two_factor_recovery_codes), true)
                : [],
        ]);
    }

    public function enable(Request $request): JsonResponse
    {
        $google2fa = app(Google2FA::class);
        $secret = $google2fa->generateSecretKey();
        $qrCodeUrl = $google2fa->getQRCodeUrl(
            config('app.name'),
            $request->user()->email,
            $secret
        );
        $otpauthUrl = sprintf(
            'otpauth://totp/%s?secret=%s&issuer=%s',
            rawurlencode(config('app.name') . ':' . $request->user()->email),
            $secret,
            rawurlencode(config('app.name'))
        );

        $request->user()->update([
            'two_factor_secret' => Crypt::encryptString($secret),
        ]);

        $recoveryCodes = collect(range(1, 8))->map(fn () => strtoupper(Str::random(8)))->toArray();
        $request->user()->update(['two_factor_recovery_codes' => Crypt::encryptString(json_encode($recoveryCodes))]);

        return response()->json([
            'qr_code_url' => $qrCodeUrl,
            'otpauth_url' => $otpauthUrl,
            'secret' => $secret,
            'recovery_codes' => $recoveryCodes,
        ]);
    }

    public function confirm(ConfirmTwoFactorRequest $request): JsonResponse
    {        $user = $request->user();

        if (!$user->two_factor_secret) {
            return response()->json(['message' => 'Aucune configuration 2FA en cours.'], 422);
        }

        $google2fa = app(Google2FA::class);
        $secret = Crypt::decryptString($user->two_factor_secret);
        $valid = $google2fa->verifyKey($secret, $request->input('code'), 4);

        if (!$valid) {
            return response()->json(['message' => 'Code invalide.'], 422);
        }

        $user->update(['two_factor_confirmed_at' => now()]);

        return response()->json(['message' => '2FA activée.']);
    }

    public function disable(DisableTwoFactorRequest $request): JsonResponse
    {        $user = $request->user();

        if (!Hash::check($request->input('password'), $user->password)) {
            return response()->json(['message' => 'Mot de passe incorrect.'], 422);
        }

        $google2fa = app(Google2FA::class);
        $secret = Crypt::decryptString($user->two_factor_secret);

        if (!$google2fa->verifyKey($secret, $request->input('code'), 4)) {
            return response()->json(['message' => 'Code invalide.'], 422);
        }

        $user->update([
            'two_factor_secret' => null,
            'two_factor_recovery_codes' => null,
            'two_factor_confirmed_at' => null,
        ]);

        return response()->json(['message' => '2FA désactivée.']);
    }

    public function qrCode(Request $request): JsonResponse
    {
        $user = $request->user();

        if (!$user->two_factor_secret) {
            return response()->json(['message' => 'Aucune configuration 2FA en cours.'], 422);
        }

        $google2fa = app(Google2FA::class);
        $secret = Crypt::decryptString($user->two_factor_secret);
        $qrCodeUrl = $google2fa->getQRCodeUrl(
            config('app.name'),
            $user->email,
            $secret
        );

        return response()->json(['qr_code_url' => $qrCodeUrl]);
    }
}
