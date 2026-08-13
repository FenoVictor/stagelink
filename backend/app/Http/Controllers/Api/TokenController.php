<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\CreateTokenRequest;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class TokenController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $tokens = $request->user()->tokens()
            ->select('id', 'name', 'last_used_at', 'created_at', 'expires_at')
            ->get()
            ->map(function ($token) {
                return [
                    'id' => $token->id,
                    'name' => $token->name,
                    'last_used_at' => $token->last_used_at,
                    'created_at' => $token->created_at,
                    'expires_at' => $token->expires_at,
                    'is_current' => $token->id === request()->user()->currentAccessToken()?->id,
                ];
            });

        return response()->json($tokens);
    }

    public function store(CreateTokenRequest $request): JsonResponse
    {
        $validated = $request->validated();

        $name = $validated['name'] ?? 'api-token-' . strtolower($request->userAgent());
        $name = substr($name, 0, 100);

        $token = $request->user()->createToken($name, [], now()->addDays(30));

        return response()->json([
            'id' => $token->accessToken->id,
            'name' => $token->accessToken->name,
            'token' => $token->plainTextToken,
            'expires_at' => $token->accessToken->expires_at,
        ], 201);
    }

    public function rotate(Request $request): JsonResponse
    {
        $user = $request->user();
        $user->tokens()->delete();

        $token = $user->createToken('api-token-' . strtolower($request->userAgent()), [], now()->addDays(30));

        return response()->json([
            'token' => $token->plainTextToken,
            'expires_at' => $token->accessToken->expires_at,
        ]);
    }

    public function destroy(Request $request, int $tokenId): JsonResponse
    {
        $deleted = $request->user()->tokens()->where('id', $tokenId)->delete();

        if (!$deleted) {
            return response()->json(['message' => 'Token introuvable.'], 404);
        }

        return response()->json(['message' => 'Token révoqué.']);
    }
}
