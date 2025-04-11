<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Coach extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id', 'title', 'fide_id', 'national_title', 'certification_level',
        'rating', 'peak_rating', 'years_teaching_experience', 'primary_specialization_id',
        'secondary_specialization_id', 'hourly_rate', 'preferred_languages', 'teaching_formats',
        'communication_methods', 'professional_bio', 'video_introduction_url',
        'social_media_links', 'is_active', 'is_available',    'status'

    ];
    
    protected $casts = [
        
        'preferred_languages' => 'array',
        'teaching_formats' => 'array',
        'communication_methods' => 'array',
        'social_media_links' => 'array',
        'is_active' => 'boolean',
        'is_available' => 'boolean',
    ];
    
    public function user()
    {
        return $this->belongsTo(User::class);
    }
    
    public function primarySpecialization()
    {
        return $this->belongsTo(CoachSpecializationCategory::class, 'primary_specialization_id');
    }
    
    public function secondarySpecialization()
    {
        return $this->belongsTo(CoachSpecializationCategory::class, 'secondary_specialization_id');
    }
    
    public function availability()
    {
        return $this->hasMany(CoachAvailability::class);
    }
    
    public function performanceMetrics()
    {
        return $this->hasOne(CoachPerformanceMetrics::class);
    }
    
    public function reviews()
    {
        return $this->hasMany(CoachReview::class);
    }
    
}
