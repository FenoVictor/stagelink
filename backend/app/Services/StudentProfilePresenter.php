<?php

namespace App\Services;

use App\Models\StudentProfile;
use App\Models\User;
use Illuminate\Support\Facades\Storage;

class StudentProfilePresenter
{
    public static function present(User $user, ?StudentProfile $profile): array
    {
        if (! $profile) {
            return [];
        }

        $profile->loadMissing(['city', 'commune.district.region.province', 'neighborhood']);

        $skills = $user->relationLoaded('skills')
            ? $user->skills
            : $user->skills()->withPivot('level')->get();

        $data = $profile->toArray();
        $data['city'] = $profile->city ? $profile->city->name : null;
        $data['commune'] = $profile->commune ? [
            'id' => $profile->commune->id,
            'name' => $profile->commune->name,
            'district_id' => $profile->commune->district_id,
        ] : null;
        $data['neighborhood'] = $profile->neighborhood ? [
            'id' => $profile->neighborhood->id,
            'name' => $profile->neighborhood->name,
        ] : null;
        $data['firstname'] = $user->firstname;
        $data['lastname'] = $user->lastname;
        $data['email'] = $user->email;
        $data['phone'] = $user->phone;
        $data['photo_url'] = $profile->photo ? Storage::disk('public')->url($profile->photo) : null;
        $data['cv_url'] = $profile->cv_path ? Storage::disk('public')->url($profile->cv_path) : null;
        $data['skills'] = $skills->map(fn ($s) => [
            'id' => $s->id,
            'name' => $s->name,
            'level' => $s->pivot->level,
        ])->values();
        $data['languages'] = $profile->languages;

        return $data;
    }
}
