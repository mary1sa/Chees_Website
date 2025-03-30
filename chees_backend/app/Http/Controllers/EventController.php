<?php

namespace App\Http\Controllers;

use App\Models\Event;
use App\Models\EventType;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Validator;

class EventController extends Controller
{
    /**
     * Get all events with optional filtering
     */
    public function index(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'type_id' => 'nullable|exists:event_types,id',
            'status' => 'nullable|in:active,featured,upcoming,past,registration_open',
            'search' => 'nullable|string',
            'order' => 'nullable|string|in:title,start_date,end_date,created_at',
            'direction' => 'nullable|string|in:asc,desc',
            'per_page' => 'nullable|integer|min:1|max:100'
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 400);
        }

        $query = Event::with('type')->withCount(['registrations', 'rounds']);

        // Apply filters
        if ($request->has('type_id')) {
            $query->where('type_id', $request->type_id);
        }

        if ($request->has('status')) {
            switch ($request->status) {
                case 'active':
                    $query->active();
                    break;
                case 'featured':
                    $query->featured();
                    break;
                case 'upcoming':
                    $query->upcoming();
                    break;
                case 'past':
                    $query->past();
                    break;
                case 'registration_open':
                    $query->where(function($q) {
                        $q->whereNull('registration_deadline')
                          ->orWhere('registration_deadline', '>=', now());
                    });
                    break;
            }
        }

        if ($request->has('search')) {
            $query->where('title', 'like', '%'.$request->search.'%');
        }

        // Apply sorting
        $order = $request->input('order', 'start_date');
        $direction = $request->input('direction', 'asc');
        $query->orderBy($order, $direction);

        return $query->paginate($request->input('per_page', 15));
    }

    /**
     * Create a new event
     */
    public function store(Request $request)
    {
        $validated = $this->validateEventRequest($request);

        // Handle image upload
        if ($request->hasFile('image')) {
            $validated['image'] = $request->file('image')->store('events', 'public');
        }

        // Set defaults
        $validated['is_active'] = $validated['is_active'] ?? true;
        $validated['is_featured'] = $validated['is_featured'] ?? false;

        $event = Event::create($validated);

        return response()->json([
            'message' => 'Event created successfully',
            'data' => $event->load('type')
        ], 201);
    }

    /**
     * Get a specific event
     */
    public function show(Event $event)
    {
        return $event->load('type');
    }

    /**
     * Update an existing event
     */
    public function update(Request $request, Event $event)
    {
        $validated = $this->validateEventRequest($request, $event);

        // Handle image upload/update
        if ($request->hasFile('image')) {
            // Delete old image if exists
            if ($event->image) {
                Storage::disk('public')->delete($event->image);
            }
            $validated['image'] = $request->file('image')->store('events', 'public');
        }

        $event->update($validated);

        return response()->json([
            'message' => 'Event updated successfully',
            'data' => $event->load('type')
        ]);
    }

    /**
     * Delete an event
     */
    public function destroy(Event $event)
    {
        // Only delete if no dependent records exist
        if ($event->registrations()->exists() || $event->rounds()->exists()) {
            return response()->json([
                'message' => 'Cannot delete event with existing registrations or rounds'
            ], 422);
        }

        // Delete associated image if exists
        if ($event->image) {
            Storage::disk('public')->delete($event->image);
        }

        $event->delete();

        return response()->json(null, 204);
    }

    /**
     * Get registration status for an event
     */
    public function registrationStatus(Event $event)
    {
        return response()->json([
            'is_registration_open' => $event->isRegistrationOpen(),
            'registration_deadline' => $event->registration_deadline,
            'current_time' => now()->toDateTimeString(),
            'available_slots' => $event->availableSlots(),
            'max_participants' => $event->max_participants,
            'registered_participants' => $event->registrations()->count()
        ]);
    }
    /**
 * Get all rounds for a specific event
 */
public function rounds(Event $event)
{
    $rounds = $event->rounds()->with(['matches' => function($query) {
        $query->with(['player1', 'player2']);
    }])->orderBy('round_number')->get();

    return response()->json([
        'event_id' => $event->id,
        'event_title' => $event->title,
        'rounds' => $rounds
    ]);
}

    /**
     * Validate event request data
     */
    protected function validateEventRequest(Request $request, $event = null)
    {
        return $request->validate([
            'type_id' => 'required|exists:event_types,id',
            'title' => 'required|string|max:255',
            'description' => 'required|string',
            'image' => 'nullable|image|mimes:jpeg,png,jpg,gif|max:2048',
            'start_date' => 'required|date',
            'end_date' => 'required|date|after_or_equal:start_date',
            'start_time' => 'nullable|date_format:H:i',
            'end_time' => 'nullable|date_format:H:i',
            'venue' => 'nullable|string|max:255',
            'address' => 'nullable|string',
            'city' => 'nullable|string|max:100',
            'region' => 'nullable|string|max:100',
            'country' => 'nullable|string|max:100',
            'postal_code' => 'nullable|string|max:20',
            'latitude' => 'nullable|numeric|between:-90,90',
            'longitude' => 'nullable|numeric|between:-180,180',
            'max_participants' => 'nullable|integer|min:1',
            'registration_fee' => 'nullable|numeric|min:0',
            'registration_deadline' => 'nullable|date|before_or_equal:start_date',
            'prize_pool' => 'nullable|numeric|min:0',
            'is_featured' => 'boolean',
            'is_active' => 'boolean',
        ]);
    }
}