<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Category extends Model
{
    protected $fillable = ['name', 'slug'];

    public function internships()
    {
        return $this->belongsToMany(Internship::class, 'internship_category');
    }
}
