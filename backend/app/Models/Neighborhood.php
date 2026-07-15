<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Neighborhood extends Model
{
    protected $fillable = ['commune_id', 'name', 'created_by', 'status', 'verified'];

    protected function casts(): array
    {
        return ['verified' => 'boolean'];
    }

    public function commune()
    {
        return $this->belongsTo(Commune::class);
    }

    public function creator()
    {
        return $this->belongsTo(User::class, 'created_by');
    }
}
