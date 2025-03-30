<?php

namespace App\Http\Controllers;

use App\Models\EventType;
use Illuminate\Http\Request;

class EventTypeController extends Controller
{
    public function index()
    {
        return EventType::all();
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:100|unique:event_types',
            'description' => 'nullable|string',
        ]);

        $eventType = EventType::create($validated);

        return response()->json($eventType, 201);
    }

    public function show(EventType $eventType)
    {
        return $eventType;
    }

    public function update(Request $request, EventType $eventType)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:100|unique:event_types,name,' . $eventType->id,
            'description' => 'nullable|string',
        ]);

        $eventType->update($validated);

        return response()->json($eventType);
    }

    public function destroy(EventType $eventType)
    {
        $eventType->delete();

        return response()->json(null, 204);
    }
}