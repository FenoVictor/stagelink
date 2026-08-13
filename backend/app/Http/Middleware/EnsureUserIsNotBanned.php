<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class EnsureUserIsNotBanned
{
    public function handle(Request $request, Closure $next): Response
    {
        if ($request->user()?->isBanned()) {
            return response()->json([
                'message' => 'Votre compte a été suspendu. Veuillez contacter l\'administration.',
            ], 403);
        }

        return $next($request);
    }
}
