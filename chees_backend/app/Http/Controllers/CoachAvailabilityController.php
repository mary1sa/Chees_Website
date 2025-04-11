<?php

namespace App\Http\Controllers;

use App\Models\CoachAvailability;
use Illuminate\Http\Request;

class CoachAvailabilityController extends Controller
{
    public function index()
    {
        $availability = CoachAvailability::with('coach') 
                            ->orderBy('date')
                            ->get();
        
        return response()->json($availability);
    }

    public function show($id)
    {
        $availability = CoachAvailability::where('coach_id', $id)->get();

        return response()->json($availability);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'coach_id' => 'required|exists:coaches,id',
            'date' => 'required|date',
            'start_time' => 'required|date_format:H:i',
            'end_time' => 'required|date_format:H:i|after:start_time',
            'availability_type' => 'required|in:regular,special,blocked,holiday,limited',
            'max_students' => 'required|integer|min:1',
            'location' => 'nullable|string|max:100',
            'booking_notes' => 'nullable|string',
            'is_bookable' => 'required|boolean',
        ]);

        $availability = CoachAvailability::create($validated);

        return response()->json([
            'message' => 'Disponibilité créée avec succès.',
            'data' => $availability,
        ], 201);
    }

    public function update(Request $request, $id)
    {
        $availability = CoachAvailability::findOrFail($id);

        $validated = $request->validate([
            'date' => 'required|date',
            'start_time' => 'required|date_format:H:i',
            'end_time' => 'required|date_format:H:i|after:start_time',
            'availability_type' => 'required|in:regular,special,blocked,holiday,limited',
            'max_students' => 'required|integer|min:1',
            'location' => 'nullable|string|max:100',
            'booking_notes' => 'nullable|string',
            'is_bookable' => 'required|boolean',
        ]);

        $availability->update($validated);

        return response()->json([
            'message' => 'Disponibilité mise à jour avec succès.',
            'data' => $availability,
        ]);
    }

    public function destroy($id)
    {
        $availability = CoachAvailability::findOrFail($id);
        $availability->delete();

        return response()->json(['message' => 'Disponibilité supprimée avec succès.']);
    }

}
