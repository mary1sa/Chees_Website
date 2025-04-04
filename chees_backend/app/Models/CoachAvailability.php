<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class CoachAvailability extends Model
{
    use HasFactory;

    protected $fillable = [
        'coach_id', 'date', 'start_time', 'end_time', 'availability_type',
        'max_students', 'current_bookings', 'location', 'booking_notes', 'is_bookable'
    ];
    
    protected $casts = [
        'date' => 'date',
        'is_bookable' => 'boolean',
    ];
    
    public function coach()
    {
        return $this->belongsTo(Coach::class);
    }
}
