<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class City extends Model
{
    protected $fillable = ['name', 'province', 'country'];

    public function studentProfiles()
    {
        return $this->hasMany(StudentProfile::class);
    }

    public function companies()
    {
        return $this->hasMany(Company::class);
    }

    public function internships()
    {
        return $this->hasMany(Internship::class);
    }
}
