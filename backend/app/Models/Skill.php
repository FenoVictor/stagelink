<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Skill extends Model
{
    protected $fillable = ['name'];

    public function students()
    {
        return $this->belongsToMany(User::class, 'student_skills', 'skill_id', 'student_id')
            ->withPivot('level')
            ->withTimestamps();
    }
}
