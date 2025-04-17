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
        'coach_id',
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
    
    // Append thumbnail_url to JSON response
    protected $appends = ['thumbnail_url'];

    public function level(): BelongsTo
    {
        return $this->belongsTo(CourseLevel::class, 'level_id');
    }

    public function coach(): BelongsTo
    {
        return $this->belongsTo(User::class, 'coach_id');
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
     * Get course progress records for this course.
     */
    public function progress(): HasMany
    {
        return $this->hasMany(CourseProgress::class);
    }

    /**
     * Get the enrollments for this course.
     */
    public function enrollments(): BelongsToMany
    {
        return $this->belongsToMany(User::class, 'course_enrollments', 'course_id', 'user_id')
                    ->withTimestamps();
    }

    /**
     * Get the packages this course belongs to.
     */
    public function packages(): BelongsToMany
    {
        return $this->belongsToMany(CoursePackage::class, 'course_package_items')
                    ->withPivot('order')
                    ->withTimestamps();
    }

    /**
     * Get the progress for a specific user in this course.
     */
    public function userProgress($userId)
    {
        return $this->progress()->where('user_id', $userId)->first();
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
    
    /**
     * Get the thumbnail URL attribute.
     *
     * @return string|null
     */
    public function getThumbnailUrlAttribute()
    {
        if (!$this->thumbnail) {
            return null;
        }
        
        // Normalize the path (remove 'storage/' if present)
        $thumbnailPath = str_replace('storage/', '', $this->thumbnail);
        
        // Generate and return the complete URL
        return asset('storage/' . $thumbnailPath);
    }
}
