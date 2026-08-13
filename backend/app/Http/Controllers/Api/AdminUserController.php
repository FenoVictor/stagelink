<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\ResetUserPasswordRequest;
use App\Http\Requests\UpdateUserRequest;
use App\Models\PasswordResetToken;
use App\Models\User;
use App\Services\AuditService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Log;

class AdminUserController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $query = User::with(['companyProfile', 'studentProfile']);

        if ($search = $request->input('search')) {
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                    ->orWhere('firstname', 'like', "%{$search}%")
                    ->orWhere('lastname', 'like', "%{$search}%")
                    ->orWhere('email', 'like', "%{$search}%");
            });
        }

        $sortField = in_array($request->input('sort'), ['created_at', 'name', 'email']) ? $request->input('sort') : 'created_at';
        $sortOrder = $request->input('order') === 'asc' ? 'asc' : 'desc';
        $role = $request->input('role');
        if ($role && in_array($role, ['student', 'company', 'admin'])) {
            $query->where('role', $role);
        }

        $users = $query->orderBy($sortField, $sortOrder)
            ->paginate(perPage: min((int) $request->input('per_page', 15), 50))
            ->through(function ($u) {
                return [
                    'id' => $u->id,
                    'name' => $u->name,
                    'firstname' => $u->firstname,
                    'lastname' => $u->lastname,
                    'email' => $u->email,
                    'phone' => $u->phone,
                    'role' => $u->role,
                    'status' => $u->status,
                    'banned_at' => $u->banned_at,
                    'created_at' => $u->created_at,
                    'company' => $u->companyProfile ? [
                        'id' => $u->companyProfile->id,
                        'name' => $u->companyProfile->name,
                        'status' => $u->companyProfile->status,
                    ] : null,
                    'student' => $u->studentProfile ? [
                        'id' => $u->studentProfile->id,
                    ] : null,
                ];
            });

        return response()->json($users);
    }

    public function show(User $user): JsonResponse
    {
        $user->load(['companyProfile', 'studentProfile']);

        return response()->json([
            'id' => $user->id,
            'name' => $user->name,
            'firstname' => $user->firstname,
            'lastname' => $user->lastname,
            'email' => $user->email,
            'phone' => $user->phone,
            'role' => $user->role,
            'status' => $user->status,
            'banned_at' => $user->banned_at,
            'created_at' => $user->created_at,
            'updated_at' => $user->updated_at,
            'companyProfile' => $user->companyProfile,
            'studentProfile' => $user->studentProfile,
        ]);
    }

    public function update(UpdateUserRequest $request, User $user): JsonResponse
    {
        $validated = $request->validated();

        $user->update($validated);

        Log::info('Utilisateur mis à jour par admin', [
            'admin_id' => $request->user()->id,
            'target_user_id' => $user->id,
            'changes' => $validated,
        ]);

        return response()->json($user->load(['companyProfile', 'studentProfile']));
    }

    public function destroy(User $user): JsonResponse
    {
        if ($user->role === 'admin') {
            return response()->json(['message' => 'Impossible de supprimer un administrateur.'], 403);
        }

        $user->delete();

        AuditService::log('admin_user_delete', "Suppression de l'utilisateur {$user->email}", $user);

        Log::info('Utilisateur supprimé par admin', [
            'admin_id' => request()->user()->id,
            'target_user_id' => $user->id,
        ]);

        return response()->json(['message' => 'Utilisateur supprimé.']);
    }

    public function ban(User $user): JsonResponse
    {
        if ($user->role === 'admin') {
            return response()->json(['message' => 'Impossible de bannir un administrateur.'], 403);
        }

        $user->update(['status' => 'banned', 'banned_at' => now()]);

        $user->tokens()->delete();

        AuditService::log('admin_user_ban', "Bannissement de {$user->email}", $user);

        Log::info('Utilisateur banni', [
            'admin_id' => request()->user()->id,
            'target_user_id' => $user->id,
        ]);

        return response()->json(['message' => 'Utilisateur banni.', 'user' => $user]);
    }

    public function unban(User $user): JsonResponse
    {
        $user->update(['status' => 'active', 'banned_at' => null]);

        AuditService::log('admin_user_unban', "Débannissement de {$user->email}", $user);

        Log::info('Utilisateur débanni', [
            'admin_id' => request()->user()->id,
            'target_user_id' => $user->id,
        ]);

        return response()->json(['message' => 'Utilisateur débanni.', 'user' => $user]);
    }

    public function resetPassword(ResetUserPasswordRequest $request, User $user): JsonResponse
    {
        $validated = $request->validated();

        $user->update(['password' => Hash::make($validated['password'])]);

        $user->tokens()->delete();

        AuditService::log('admin_password_reset', "Réinitialisation du mot de passe de {$user->email}", $user);

        PasswordResetToken::where('email', $user->email)->delete();

        Log::info('Mot de passe réinitialisé par admin', [
            'admin_id' => $request->user()->id,
            'target_user_id' => $user->id,
        ]);

        return response()->json(['message' => 'Mot de passe réinitialisé.']);
    }

    public function passwordResets(Request $request): JsonResponse
    {
        $resets = PasswordResetToken::join('users', 'password_reset_tokens.email', '=', 'users.email')
            ->select('password_reset_tokens.*', 'users.id as user_id', 'users.name', 'users.firstname', 'users.lastname', 'users.role')
            ->orderBy('password_reset_tokens.created_at', 'desc')
            ->limit(50)
            ->get()
            ->map(function ($r) {
                return [
                    'email' => $r->email,
                    'token' => $r->token,
                    'created_at' => $r->created_at,
                    'user_id' => $r->user_id,
                    'name' => $r->firstname ? trim($r->firstname.' '.$r->lastname) : $r->name,
                    'role' => $r->role,
                ];
            });

        return response()->json($resets);
    }
}
