<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Interview extends Model
{
    protected $fillable = ['application_id', 'status', 'notes', 'location', 'date', 'meeting_link'];

    protected function casts(): array
    {
        return ['date' => 'datetime'];
    }

    public function application()
    {
        return $this->belongsTo(Application::class);
    }
}
