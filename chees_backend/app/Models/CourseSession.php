<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;

class CourseSession extends Model
{
    use HasFactory;

    protected $fillable = [
        'course_id',
        'coach_id',
        'title',
        'description',
        'start_datetime',
        'end_datetime',
        'zoom_link',
        'meeting_id',
        'meeting_password',
        'max_participants',
        'is_recorded',
        'recording_url'
    ];

    protected $casts = [
        'start_datetime' => 'datetime',
        'end_datetime' => 'datetime',
    ];

    public function course(): BelongsTo
    {
        return $this->belongsTo(Course::class);
    }

    public function coach(): BelongsTo
    {
        return $this->belongsTo(User::class, 'coach_id');
    }

    public function materials(): HasMany
    {
        return $this->hasMany(CourseMaterial::class, 'session_id');
    }

    public function attendances(): HasMany
    {
        return $this->hasMany(SessionAttendance::class, 'session_id');
    }
    
    /**
     * Get all enrollments that include this session
     */
    public function enrollments(): BelongsToMany
    {
        return $this->belongsToMany(Enrollment::class, 'enrollment_session')
            ->withTimestamps();
    }
}
