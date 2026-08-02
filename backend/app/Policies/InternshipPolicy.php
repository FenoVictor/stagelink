<?php

namespace App\Policies;

use App\Models\Internship;
use App\Models\User;

class InternshipPolicy
{
    public function viewAny(User $user): bool
    {
        return true;
    }

    public function view(User $user, Internship $internship): bool
    {
        return true;
    }

    public function create(User $user): bool
    {
        return $user->role === 'company';
    }

    public function update(User $user, Internship $internship): bool
    {
        if ($user->role === 'admin') {
            return true;
        }

        return $user->role === 'company'
            && $internship->company->user_id === $user->id;
    }

    public function delete(User $user, Internship $internship): bool
    {
        if ($user->role === 'admin') {
            return true;
        }

        return $user->role === 'company'
            && $internship->company->user_id === $user->id;
    }

    public function manageApplications(User $user, Internship $internship): bool
    {
        return $user->role === 'company'
            && $internship->company->user_id === $user->id;
    }
}
