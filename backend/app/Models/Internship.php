<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Internship extends Model
{
    protected $fillable = ['company_id', 'title', 'description', 'requirements', 'location', 'type', 'duration', 'salary', 'slots', 'deadline', 'status'];

    protected function casts(): array
    {
        return ['deadline' => 'date', 'salary' => 'decimal:2', 'slots' => 'integer'];
    }

    public function company()
    {
        return $this->belongsTo(Company::class);
    }

    public function applications()
    {
        return $this->hasMany(Application::class);
    }

    public function categories()
    {
        return $this->belongsToMany(Category::class, 'internship_category');
    }
}
