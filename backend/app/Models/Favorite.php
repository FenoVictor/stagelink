<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Favorite extends Model
{
    protected $fillable = ['student_id', 'internship_id'];

    public function user()
    {
        return $this->belongsTo(User::class, 'student_id');
    }

    public function internship()
    {
        return $this->belongsTo(Internship::class);
    }
}
