<?php

namespace App\Http\Controllers;

use App\Models\Event;
use Illuminate\Http\Request;
use App\Models\TournamentRound;
use Illuminate\Validation\Rule;
use App\Models\EventRegistration;

class TournamentRoundController extends Controller
{
    /**
     * Display a listing of rounds for a specific event.
     */
    public function index(Event $event)
    {
        $rounds = $event->tournamentRounds()->orderBy('round_number')->get();
        return response()->json($rounds);
    }

    /**
     * Store a newly created round for an event.
     */
    public function store(Request $request, Event $event)
    {
        // Check if event has at least 2 registered users
        $registrationCount = EventRegistration::where('event_id', $event->id)
            ->where('status', 'confirmed')
            ->count();
    
        if ($registrationCount < 2) {
            return response()->json([
                'error' => 'Cannot create tournament rounds. Event must have at least 2 confirmed registrations.'
            ], 422);
        }
    
        $validated = $request->validate([
            'round_number' => 'required|integer|min:1',
            'start_datetime' => 'required|date',
            'end_datetime' => 'required|date|after:start_datetime',
            'status' => ['required', Rule::in(['scheduled', 'in-progress', 'completed'])]
        ]);
    
        $round = $event->tournamentRounds()->create($validated);
    
        return response()->json($round, 201);
    }

    /**
     * Display the specified round.
     */
    public function show(TournamentRound $round)
    {
        return response()->json($round);
    }

    /**
     * Update the specified round.
     */
    public function update(Request $request, TournamentRound $round)
    {
        $validated = $request->validate([
            'round_number' => 'sometimes|integer|min:1',
            'start_datetime' => 'sometimes|date',
            'end_datetime' => 'sometimes|date|after:start_datetime',
            'status' => ['sometimes', Rule::in(['scheduled', 'in-progress', 'completed'])]
        ]);

        $round->update($validated);

        return response()->json($round);
    }

    /**
     * Remove the specified round.
     */
    public function destroy(TournamentRound $round)
    {
        $round->delete();
        return response()->json(null, 204);
    }

    /**
     * Start a round (change status to in-progress)
     */
    public function startRound(TournamentRound $round)
    {
        $round->update(['status' => 'in-progress']);
        return response()->json($round);
    }

    /**
     * Complete a round (change status to completed)
     */
    public function completeRound(TournamentRound $round)
    {
        $round->update(['status' => 'completed']);
        return response()->json($round);
    }
}