<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class TournamentMatch extends Model
{
    use HasFactory;

    protected $fillable = [
        'round_id', 'white_player_id', 'black_player_id', 'result',
        'start_datetime', 'end_datetime', 'pgn', 'table_number', 'status'
    ];

    protected $casts = [
        'start_datetime' => 'datetime',
        'end_datetime' => 'datetime',
    ];

    // Relationships
    public function round()
    {
        return $this->belongsTo(TournamentRound::class, 'round_id');
    }

    public function whitePlayer()
    {
        return $this->belongsTo(User::class, 'white_player_id');
    }

    public function blackPlayer()
    {
        return $this->belongsTo(User::class, 'black_player_id');
    }

    public function event()
    {
        return $this->through('round')->has('event');
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

    // Result helper methods
    public function getWhitePlayerPoints()
    {
        return match ($this->result) {
            '1-0' => 1,
            '0-1' => 0,
            '1/2-1/2' => 0.5,
            default => null,
        };
    }

    public function getBlackPlayerPoints()
    {
        return match ($this->result) {
            '1-0' => 0,
            '0-1' => 1,
            '1/2-1/2' => 0.5,
            default => null,
        };
    }
}