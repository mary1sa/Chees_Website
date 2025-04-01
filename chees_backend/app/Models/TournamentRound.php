<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class TournamentRound extends Model
{
    use HasFactory;

    protected $fillable = [
        'event_id', 'round_number', 'start_datetime', 'end_datetime', 'status'
    ];

    protected $casts = [
        'start_datetime' => 'datetime',
        'end_datetime' => 'datetime',
    ];

    // // Relationships
    // public function event()
    // {
    //     return $this->belongsTo(Event::class);
    // }
    public function event()
    {
        return $this->belongsTo(Event::class);
    }

    public function tournamentMatches()
    {
        return $this->hasMany(TournamentMatch::class, 'round_id');
    }
    public function matches()
    {
        return $this->hasMany(TournamentMatch::class, 'round_id');
    }

    // Status check methods
    public function isScheduled()
    {
        return $this->status === 'scheduled';
    }

    public function isInProgress()
    {
        return $this->status === 'in-progress';
    }

    public function isCompleted()
    {
        return $this->status === 'completed';
    }
}