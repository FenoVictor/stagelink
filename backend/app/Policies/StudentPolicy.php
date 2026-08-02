<?php

namespace App\Policies;

use App\Models\User;

class StudentPolicy
{
    public function viewProfile(User $user, User $student): bool
    {
        return $student->role === 'student';
    }

    public function updateProfile(User $user, User $student): bool
    {
        return $user->id === $student->id && $user->role === 'student';
    }
}
