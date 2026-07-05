<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class AdminUserController extends Controller
{
    public function index(): JsonResponse
    {
        $users = User::with(['companyProfile', 'studentProfile'])->latest()->get();

        return response()->json($users);
    }

    public function update(Request $request, User $user): JsonResponse
    {
        $validated = $request->validate([
            'role' => 'sometimes|in:student,company,admin',
            'name' => 'sometimes|string|max:255',
            'email' => 'sometimes|string|email|max:255|unique:users,email,' . $user->id,
        ]);

        $user->update($validated);

        return response()->json($user);
    }

    public function destroy(User $user): JsonResponse
    {
        if ($user->role === 'admin') {
            return response()->json(['message' => 'Cannot delete admin users.'], 403);
        }

        $user->delete();

        return response()->json(['message' => 'User deleted successfully.']);
    }
}
