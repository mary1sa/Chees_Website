<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class SessionAttendance extends Model
{
    use HasFactory;

    protected $fillable = [
        'session_id',
        'user_id',
        'attended_at',
        'status',
        'notes'
    ];

    protected $casts = [
        'attended_at' => 'datetime'
    ];

    /**
     * Get the session that the attendance record belongs to
     */
    public function session(): BelongsTo
    {
        return $this->belongsTo(CourseSession::class, 'session_id');
    }

    /**
     * Get the user that the attendance record belongs to
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}
