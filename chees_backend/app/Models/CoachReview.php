<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class CoachReview extends Model
{
    use HasFactory;

    protected $fillable = [
        'coach_id', 'user_id', 'rating', 'review_text',
        'teaching_clarity_rating', 'communication_rating',
        'knowledge_depth_rating', 'course_id', 'session_id'
    ];
    
  
    public function coach()
    {
        return $this->belongsTo(Coach::class);
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }
    
    // public function course()
    // {
    //     return $this->belongsTo(Course::class);
    // }
    
    // public function session()
    // {
    //     return $this->belongsTo(CourseSession::class);
    // }
}
