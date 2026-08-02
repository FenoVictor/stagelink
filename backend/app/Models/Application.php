<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Application extends Model
{
    protected $fillable = ['internship_id', 'student_id', 'cv_path', 'cover_letter', 'cover_letter_path', 'status', 'relevance'];

    public function getCvUrlAttribute(): ?string
    {
        return $this->cv_path ? url('storage/' . $this->cv_path) : null;
    }

    public function getCoverLetterUrlAttribute(): ?string
    {
        return $this->cover_letter_path ? url('storage/' . $this->cover_letter_path) : null;
    }

    public function internship()
    {
        return $this->belongsTo(Internship::class);
    }

    public function student()
    {
        return $this->belongsTo(User::class, 'student_id');
    }
}
