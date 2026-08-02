<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class RequestMetric extends Model
{
    protected $fillable = [
        'method',
        'path',
        'status_code',
        'response_time_ms',
        'ip_address',
        'user_agent',
        'user_id',
        'route_name',
    ];

    protected function casts(): array
    {
        return [
            'status_code' => 'integer',
            'response_time_ms' => 'integer',
        ];
    }
}
