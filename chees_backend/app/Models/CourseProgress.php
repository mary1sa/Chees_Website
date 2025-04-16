<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class CourseProgress extends Model
{
    use HasFactory;

    protected $table = 'course_progress';

    protected $fillable = [
        'user_id',
        'course_id',
        'enrollment_id',
        'progress',
        'status',
        'start_date',
        'last_accessed',
        'completion_date',
        'completed_lessons'
    ];

    protected $casts = [
        'start_date' => 'datetime',
        'last_accessed' => 'datetime',
        'completion_date' => 'datetime',
        'completed_lessons' => 'array',
    ];

    /**
     * Get the user that owns the progress record.
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Get the course associated with the progress record.
     */
    public function course(): BelongsTo
    {
        return $this->belongsTo(Course::class);
    }

    /**
     * Get the enrollment associated with the progress record.
     */
    public function enrollment(): BelongsTo
    {
        return $this->belongsTo(Enrollment::class);
    }

    /**
     * Check if the course is completed.
     */
    public function getIsCompletedAttribute(): bool
    {
        return $this->progress >= 100 || $this->completion_date !== null;
    }
}
