<?php

namespace App\Http\Controllers;

use App\Models\TournamentMatch;
use App\Models\TournamentRound;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class TournamentMatchController extends Controller
{
    /**
     * Display a listing of matches for a round.
     */
    public function index(TournamentRound $round)
    {
        $matches = $round->tournamentMatches()->with(['whitePlayer', 'blackPlayer'])->get();
        return response()->json($matches);
    }

    /**
     * Store a newly created match in a round.
     */
    public function store(Request $request, TournamentRound $round)
    {
        $validated = $request->validate([
            'white_player_id' => 'required|exists:users,id',
            'black_player_id' => 'required|exists:users,id|different:white_player_id',
            'start_datetime' => 'required|date',
            'end_datetime' => 'nullable|date|after:start_datetime',
            'table_number' => 'nullable|integer',
            'status' => ['required', Rule::in(['scheduled', 'in-progress', 'completed', 'cancelled'])]
        ]);

        $match = $round->tournamentMatches()->create($validated);

        return response()->json($match, 201);
    }

    /**
     * Display the specified match.
     */
    public function show(TournamentMatch $match)
    {
        $match->load(['whitePlayer', 'blackPlayer']);
        return response()->json($match);
    }

    /**
     * Update the specified match.
     */
    public function update(Request $request, TournamentMatch $match)
    {
        $validated = $request->validate([
            'white_player_id' => 'sometimes|exists:users,id',
            'black_player_id' => 'sometimes|exists:users,id|different:white_player_id',
            'result' => ['nullable', Rule::in(['1-0', '0-1', '1/2-1/2', '*'])],
            'start_datetime' => 'sometimes|date',
            'end_datetime' => 'nullable|date|after:start_datetime',
            'pgn' => 'nullable|string',
            'table_number' => 'nullable|integer',
            'status' => ['sometimes', Rule::in(['scheduled', 'in-progress', 'completed', 'cancelled'])]
        ]);

        $match->update($validated);

        return response()->json($match);
    }

    /**
     * Remove the specified match.
     */
    public function destroy(TournamentMatch $match)
    {
        $match->delete();
        return response()->json(null, 204);
    }

    /**
     * Record match result
     */
    public function recordResult(Request $request, TournamentMatch $match)
    {
        $validated = $request->validate([
            'result' => ['required', Rule::in(['1-0', '0-1', '1/2-1/2', '*'])],
            'pgn' => 'nullable|string'
        ]);

        $match->update([
            'result' => $validated['result'],
            'pgn' => $validated['pgn'] ?? null,
            'status' => 'completed',
            'end_datetime' => now()
        ]);

        return response()->json($match);
    }

    /**
     * Start a match (change status to in-progress)
     */
    public function startMatch(TournamentMatch $match)
    {
        $match->update([
            'status' => 'in-progress',
            'start_datetime' => now()
        ]);
        return response()->json($match);
    }

    /**
     * Get matches for a specific player
     */
    public function playerMatches(User $player)
    {
        $matches = TournamentMatch::where('white_player_id', $player->id)
            ->orWhere('black_player_id', $player->id)
            ->with(['round.event', 'whitePlayer', 'blackPlayer'])
            ->orderBy('start_datetime')
            ->get();

        return response()->json($matches);
    }
}