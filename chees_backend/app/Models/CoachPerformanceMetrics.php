<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class CoachPerformanceMetrics extends Model
{
    use HasFactory;

    protected $fillable = [
        'coach_id', 'total_students_coached', 'active_students',
        'total_courses_conducted', 'successful_course_completions',
        'average_student_rating', 'total_reviews', 'total_revenue',
        'average_hourly_earnings', 'student_growth_rate', 'revenue_growth_rate'
    ];
    
    public function coach()
    {
        return $this->belongsTo(Coach::class);
    }
}
