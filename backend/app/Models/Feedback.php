<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Feedback extends Model
{
    public const TYPES = ['feature', 'improvement', 'bug', 'general'];

    public const STATUSES = ['new', 'read', 'in_progress', 'done', 'declined'];

    protected $table = 'feedbacks';

    protected $fillable = [
        'user_id',
        'type',
        'message',
        'rating',
        'name',
        'email',
        'status',
        'admin_note',
    ];

    protected $casts = [
        'rating' => 'integer',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function scopeNew($query)
    {
        return $query->where('status', 'new');
    }
}
