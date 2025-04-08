<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;

class Course extends Model
{
    use HasFactory;
    protected $table = 'courses';

    protected $fillable = [
        'title', 
        'level_id', 
        'description', 
        'thumbnail', 
        'price', 
        'duration', 
        'max_students', 
        'is_online', 
        'is_active'
    ];

    // Ensure proper type casting
    protected $casts = [
        'is_online' => 'boolean',
        'is_active' => 'boolean',
        'price' => 'float'
    ];

    public function level(): BelongsTo
    {
        return $this->belongsTo(CourseLevel::class, 'level_id');
    }

    public function sessions(): HasMany
    {
        return $this->hasMany(CourseSession::class);
    }

    public function materials(): HasMany
    {
        return $this->hasMany(CourseMaterial::class);
    }

    /**
     * Get users enrolled in this course directly.
     * @deprecated Use enrollments() instead for new code.
     */
    public function students(): BelongsToMany
    {
        return $this->belongsToMany(User::class, 'enrollments')
            ->withPivot('status', 'progress', 'enrollment_date', 'completion_date')
            ->withTimestamps();
    }
    
    /**
     * Get all enrollments that include this course.
     */
    public function enrollments(): BelongsToMany
    {
        return $this->belongsToMany(Enrollment::class, 'enrollment_course')
            ->withPivot('progress', 'started_at', 'completed_at')
            ->withTimestamps();
    }
    
    /**
     * Get all users enrolled in this course through enrollments.
     */
    public function enrolledUsers()
    {
        return User::whereHas('enrollments', function($query) {
            $query->whereHas('courses', function($q) {
                $q->where('courses.id', $this->id);
            });
        });
    }
    
    /**
     * Scope a query to only include active courses.
     */
    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }
    
    /**
     * Scope a query to only include online courses.
     */
    public function scopeOnline($query)
    {
        return $query->where('is_online', true);
    }
}
