<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Company extends Model
{
    use SoftDeletes;

    protected $fillable = ['user_id', 'name', 'description', 'logo', 'website', 'location', 'industry', 'verified_at', 'status', 'phone', 'city_id', 'address', 'employees_count'];

    protected function casts(): array
    {
        return ['verified_at' => 'datetime', 'deleted_at' => 'datetime'];
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function internships()
    {
        return $this->hasMany(Internship::class);
    }

    public function city()
    {
        return $this->belongsTo(City::class);
    }
}
