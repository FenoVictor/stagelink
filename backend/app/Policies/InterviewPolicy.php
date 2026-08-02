<?php

namespace App\Policies;

use App\Models\Interview;
use App\Models\User;

class InterviewPolicy
{
    public function viewAny(User $user): bool
    {
        return in_array($user->role, ['student', 'company', 'admin']);
    }

    public function view(User $user, Interview $interview): bool
    {
        if ($user->role === 'admin') {
            return true;
        }

        $application = $interview->application;

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
        return $user->role === 'company';
    }

    public function update(User $user, Interview $interview): bool
    {
        if ($user->role === 'admin') {
            return true;
        }

        $application = $interview->application;

        if ($user->role === 'company') {
            return $application->internship->company->user_id === $user->id;
        }

        return false;
    }
}
