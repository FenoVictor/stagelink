<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Notifications\VerifyEmailNotification;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\URL;

class EmailVerificationController extends Controller
{
    public function verify(Request $request, string $id, string $hash): JsonResponse
    {
        $user = User::find($id);

        if (! $user) {
            return response()->json(['message' => 'Utilisateur introuvable.'], 404);
        }

        if ($user->hasVerifiedEmail()) {
            return response()->json(['message' => 'Email déjà vérifié.', 'user' => $user]);
        }

        if (! URL::hasValidSignature($request)) {
            return response()->json(['message' => 'Lien de vérification invalide ou expiré.'], 400);
        }

        if (sha1($user->getEmailForVerification()) !== $hash) {
            return response()->json(['message' => 'Lien de vérification invalide.'], 400);
        }

        $user->markEmailAsVerified();

        Log::info('Email verified', ['user_id' => $user->id, 'email' => $user->email]);

        return response()->json(['message' => 'Email vérifié avec succès.', 'user' => $user]);
    }

    public function sendVerification(Request $request): JsonResponse
    {
        $user = $request->user();

        if ($user->hasVerifiedEmail()) {
            return response()->json(['message' => 'Email déjà vérifié.']);
        }

        $user->notify(new VerifyEmailNotification);

        return response()->json(['message' => 'Un nouveau lien de vérification a été envoyé.']);
    }
}
