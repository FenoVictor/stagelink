<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class StudentProfile extends Model
{
    protected $fillable = ['user_id', 'phone', 'bio', 'skills', 'cv_path', 'school', 'major', 'graduation_year'];

    protected function casts(): array
    {
        return ['graduation_year' => 'integer'];
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
