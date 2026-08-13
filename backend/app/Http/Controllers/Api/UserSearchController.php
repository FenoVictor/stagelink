<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class UserSearchController extends Controller
{
    public function search(Request $request): JsonResponse
    {
        $q = $request->get('q');

        if (!$q || strlen(trim($q)) < 2) {
            return response()->json([]);
        }

        $users = User::where('id', '!=', $request->user()->id)
            ->whereIn('role', ['student', 'company'])
            ->whereNull('banned_at')
            ->where(function ($query) use ($q) {
                $query->where('firstname', 'like', "%{$q}%")
                      ->orWhere('lastname', 'like', "%{$q}%")
                      ->orWhere('name', 'like', "%{$q}%");
            })
            ->select('id', 'name', 'firstname', 'lastname', 'role')
            ->limit(10)
            ->get();

        return response()->json($users);
    }
}
