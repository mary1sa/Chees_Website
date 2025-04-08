<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;

class Enrollment extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'course_id',
        'status',
        'progress',
        'enrollment_date',
        'completion_date'
    ];

    protected $casts = [
        'enrollment_date' => 'datetime',
        'completion_date' => 'datetime',
    ];

    /**
     * Get the user that owns the enrollment.
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Get the courses in this enrollment.
     */
    public function courses(): BelongsToMany
    {
        return $this->belongsToMany(Course::class, 'enrollment_course')
            ->withPivot('progress', 'started_at', 'completed_at')
            ->withTimestamps();
    }
    
    /**
     * Get total progress across all courses.
     */
    public function getTotalProgressAttribute(): int
    {
        $courseCount = $this->courses()->count();
        
        if ($courseCount === 0) {
            return 0;
        }
        
        $totalProgress = $this->courses()->sum('pivot.progress');
        return (int) round($totalProgress / $courseCount);
    }
    
    /**
     * Check if enrollment is completed.
     */
    public function getIsCompletedAttribute(): bool
    {
        $courseCount = $this->courses()->count();
        $completedCount = $this->courses()
            ->whereNotNull('pivot.completed_at')
            ->count();
            
        return $courseCount > 0 && $courseCount === $completedCount;
    }
    
    /**
     * Scope a query to only include active enrollments.
     */
    public function scopeActive($query)
    {
        return $query->where('status', 'active');
    }
}
