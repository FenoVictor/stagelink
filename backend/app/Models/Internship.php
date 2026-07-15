<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Internship extends Model
{
    use SoftDeletes;

    protected $fillable = ['company_id', 'title', 'description', 'requirements', 'location', 'type', 'duration', 'study_level', 'salary', 'slots', 'deadline', 'status', 'slug', 'views_count', 'category_id', 'city_id'];

    protected function casts(): array
    {
        return ['deadline' => 'date', 'salary' => 'decimal:2', 'slots' => 'integer', 'views_count' => 'integer'];
    }

    public function company()
    {
        return $this->belongsTo(Company::class);
    }

    public function applications()
    {
        return $this->hasMany(Application::class);
    }

    public function activeStudents()
    {
        return $this->hasMany(InternshipStudent::class);
    }

    public function categories()
    {
        return $this->belongsToMany(Category::class, 'internship_category');
    }

    public function category()
    {
        return $this->belongsTo(Category::class);
    }

    public function city()
    {
        return $this->belongsTo(City::class);
    }
}
