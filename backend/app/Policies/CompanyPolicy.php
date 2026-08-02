<?php

namespace App\Policies;

use App\Models\Company;
use App\Models\User;

class CompanyPolicy
{
    public function viewProfile(User $user, Company $company): bool
    {
        return true;
    }

    public function updateProfile(User $user, Company $company): bool
    {
        return $company->user_id === $user->id && $user->role === 'company';
    }

    public function manage(User $user, Company $company): bool
    {
        return $company->user_id === $user->id;
    }
}
