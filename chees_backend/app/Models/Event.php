<?php

namespace App\Models;

use App\Models\TournamentRound;
use App\Models\EventRegistration;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class Event extends Model
{
    use HasFactory;

    protected $fillable = [
        'type_id', 'title', 'description', 'image', 'start_date', 'end_date',
        'start_time', 'end_time', 'venue', 'address', 'city', 'region',
        'country', 'postal_code', 'latitude', 'longitude', 'max_participants',
        'registration_fee', 'registration_deadline', 'prize_pool', 'is_featured', 'is_active'
    ];

    protected $casts = [
        'start_date' => 'date',
        'end_date' => 'date',
        'is_featured' => 'boolean',
        'is_active' => 'boolean',
    ];

    // Relationships
    public function type()
    {
        return $this->belongsTo(EventType::class, 'type_id');
    }

    public function registrations()
    {
        return $this->hasMany(EventRegistration::class);
    }

    public function rounds()
    {
        return $this->hasMany(TournamentRound::class);
    }

    // Scopes
    public function scopeActive(Builder $query)
    {
        return $query->where('is_active', true);
    }

    public function scopeFeatured(Builder $query)
    {
        return $query->where('is_featured', true);
    }

    public function scopeUpcoming(Builder $query)
    {
        return $query->where('start_date', '>=', now());
    }

    public function scopePast(Builder $query)
    {
        return $query->where('end_date', '<', now());
    }

    // Helper methods
    public function isRegistrationOpen()
    {
        if (is_null($this->registration_deadline)) {
            return true;
        }

        return now()->lte($this->registration_deadline);
    }

    public function availableSlots()
    {
        if (is_null($this->max_participants)) {
            return PHP_INT_MAX; // Unlimited slots
        }

        return $this->max_participants - $this->registrations()->where('status', 'confirmed')->count();
    }

    
    // Add this relationship
    public function tournamentRounds()
    {
        return $this->hasMany(TournamentRound::class);
    }

    // app/Models/Event.php
public function hasEnoughPlayers()
{
    return $this->registrations()->where('status', 'confirmed')->count() >= 2;
}


    
}