<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class EventRegistration extends Model
{
    use HasFactory;

    protected $fillable = [
        'event_id', 
        'user_id', 
        'registration_number', 
        'status',
        'payment_status', 
        'transaction_id', 
        'paid_amount', 
        'notes' 
    ];

    protected $casts = [
        'registration_date' => 'datetime',
        'paid_amount' => 'decimal:2',
    ];

    // Relationships
    public function event()
    {
        return $this->belongsTo(Event::class);
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    // Status check methods
    public function isConfirmed()
    {
        return $this->status === 'confirmed';
    }

    public function isPaid()
    {
        return $this->payment_status === 'completed';
    }

    // Generate registration number
    public static function generateRegistrationNumber()
    {
        return 'REG-' . now()->format('Ymd') . '-' . strtoupper(substr(uniqid(), -6));
    }
}