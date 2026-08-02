<?php

namespace App\Policies;

use App\Models\Application;
use App\Models\User;

class ApplicationPolicy
{
    public function viewAny(User $user): bool
    {
        return in_array($user->role, ['student', 'company', 'admin']);
    }

    public function view(User $user, Application $application): bool
    {
        if ($user->role === 'admin') {
            return true;
        }

        if ($user->role === 'student') {
            return $application->student_id === $user->id;
        }

        if ($user->role === 'company') {
            return $application->internship->company->user_id === $user->id;
        }

        return false;
    }

    public function create(User $user): bool
    {
        return $user->role === 'student';
    }

    public function update(User $user, Application $application): bool
    {
        if ($user->role === 'company') {
            return $application->internship->company->user_id === $user->id;
        }

        return false;
    }

    public function export(User $user, \App\Models\Internship $internship): bool
    {
        return $user->role === 'company'
            && $internship->company->user_id === $user->id;
    }
}
