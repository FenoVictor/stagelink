<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class InternshipStudent extends Model
{
    protected $table = 'internship_student';

    protected $fillable = ['internship_id', 'student_id', 'start_date', 'end_date', 'status', 'feedback'];

    protected function casts(): array
    {
        return [
            'start_date' => 'date',
            'end_date' => 'date',
        ];
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
