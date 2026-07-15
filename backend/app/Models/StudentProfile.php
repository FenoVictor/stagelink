<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class StudentProfile extends Model
{
    protected $fillable = ['user_id', 'phone', 'bio', 'cv_path', 'cv_uploaded_at', 'photo', 'github', 'portfolio', 'linkedin', 'school', 'major', 'graduation_year', 'diploma', 'current_level', 'study_start', 'study_end', 'birth_date', 'gender', 'city_id', 'address', 'languages', 'commune_id', 'neighborhood_id', 'is_employed', 'job_title', 'employer', 'employed_at'];

    protected function casts(): array
    {
        return ['graduation_year' => 'integer', 'study_start' => 'integer', 'study_end' => 'integer', 'birth_date' => 'date', 'languages' => 'array', 'cv_uploaded_at' => 'datetime'];
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function city()
    {
        return $this->belongsTo(City::class);
    }

    public function commune()
    {
        return $this->belongsTo(Commune::class);
    }

    public function neighborhood()
    {
        return $this->belongsTo(Neighborhood::class);
    }
}
