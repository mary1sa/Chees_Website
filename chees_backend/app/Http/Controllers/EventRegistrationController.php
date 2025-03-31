<?php

namespace App\Http\Controllers;

use Carbon\Carbon;
use App\Models\User;
use App\Models\Event;
use Illuminate\Support\Str;
use Illuminate\Http\Request;
use App\Models\EventRegistration;

class EventRegistrationController extends Controller
{
    /**
     * Display a listing of registrations (for admin purposes)
     */
    public function index()
    {
        $registrations = EventRegistration::with(['event', 'user'])->paginate(20);
        
        return response()->json([
            'data' => $registrations
        ]);
    }

    /**
     * Store a new registration (POST /events/{event}/register)
     */
    public function register(Request $request, Event $event)
    {
        $request->validate([
            'user_id' => 'required|exists:users,id',
            // Add any other fields you want to allow during registration
        ]);
    
        // Validate registration eligibility
        $validation = $this->validateRegistration($event, $request->user_id);
        if (!$validation['success']) {
            return response()->json([
                'error' => $validation['message']
            ], 422);
        }
    
        // Create registration
        $registration = EventRegistration::create([
            'event_id' => $event->id,
            'user_id' => $request->user_id,
            'registration_number' => $this->generateRegistrationNumber($event),
            'status' => $event->registration_fee > 0 ? 'pending' : 'confirmed',
            'payment_status' => $event->registration_fee > 0 ? 'pending' : 'completed',
            'paid_amount' => $event->registration_fee > 0 ? $event->registration_fee : null,
            'registration_date' => now()
        ]);
    
        return response()->json([
            'message' => 'Registration successful',
            'data' => $registration->load('event')
        ], 201);
    }
    /**
     * Display the specified registration (GET /registrations/{id})
     */
    public function show(EventRegistration $registration)
    {
        return response()->json([
            'data' => $registration->load(['event', 'user'])
        ]);
    }

    /**
     * Cancel a registration (POST /registrations/{registration}/cancel)
     */
    public function cancel(EventRegistration $registration)
    {
        if (Carbon::parse($registration->event->start_date)->isPast()) {
            return response()->json([
                'error' => 'Cannot cancel registration after event has started'
            ], 400);
        }

        $registration->update([
            'status' => 'cancelled',
            'payment_status' => $registration->payment_status === 'completed' ? 'refunded' : $registration->payment_status
        ]);

        return response()->json([
            'message' => 'Registration cancelled successfully',
            'data' => $registration->fresh()
        ]);
    }

    /**
     * Confirm payment (POST /registrations/{registration}/confirm-payment)
     */
    public function confirmPayment(EventRegistration $registration)
    {
        if ($registration->payment_status === 'completed') {
            return response()->json([
                'error' => 'Payment already confirmed'
            ], 400);
        }

        $registration->update([
            'payment_status' => 'completed',
            'status' => 'confirmed',
            'transaction_id' => 'PAY-' . Str::random(16),
            'paid_amount' => $registration->event->registration_fee
        ]);

        return response()->json([
            'message' => 'Payment confirmed',
            'data' => $registration->fresh()
        ]);
    }

    /**
     * Update a registration (PUT/PATCH /registrations/{id})
     */
    public function update(Request $request, EventRegistration $registration)
    {
        $validated = $request->validate([
            'status' => 'sometimes|in:pending,confirmed,cancelled,attended',
            'payment_status' => 'sometimes|in:pending,completed,failed,refunded',
            'notes' => 'sometimes|string|max:500'
        ]);

        $registration->update($validated);

        return response()->json([
            'data' => $registration->fresh()
        ]);
    }

    /**
     * Delete a registration (DELETE /registrations/{id})
     */
    public function destroy(EventRegistration $registration)
    {
        $registration->delete();
        
        return response()->json([
            'message' => 'Registration deleted'
        ], 204);
    }

    /**
     * Validate registration eligibility
     */
    private function validateRegistration(Event $event, $userId): array
    {
        if (Carbon::parse($event->registration_deadline)->isPast()) {
            return [
                'success' => false,
                'message' => 'Registration period has ended'
            ];
        }

        $registeredCount = EventRegistration::where('event_id', $event->id)
            ->whereIn('status', ['confirmed', 'pending'])
            ->count();

        if ($event->max_participants && $registeredCount >= $event->max_participants) {
            return [
                'success' => false,
                'message' => 'Event is at full capacity'
            ];
        }

        if (EventRegistration::where('event_id', $event->id)
            ->where('user_id', $userId)
            ->exists()) {
            return [
                'success' => false,
                'message' => 'User is already registered'
            ];
        }

        return ['success' => true];
    }

    /**
     * Generate unique registration number
     */
    private function generateRegistrationNumber(Event $event): string
    {
        $prefix = strtoupper(substr(preg_replace('/[^A-Z]/', '', $event->title), 0, 3));
        return $prefix . '-' . now()->format('Ymd') . '-' . Str::random(4);
    }
    /**
 * Get all registrations for a specific user
 * GET /api/users/{user}/registrations
 */
public function userRegistrations(User $user)
{
    $registrations = EventRegistration::with(['event' => function($query) {
            $query->select('id', 'title', 'start_date'); // Only select needed fields
        }])
        ->where('user_id', $user->id)
        ->orderBy('created_at', 'desc')
        ->paginate(10);
    
    return response()->json([
        'data' => $registrations
    ]);
}
/**
 * Get all registrations for a specific event
 * GET /api/events/{event}/registrations
 */
public function getEventRegistrations(Event $event)
{
    $registrations = EventRegistration::with(['user:id,first_name,last_name,email']) // Updated to use first_name/last_name
        ->where('event_id', $event->id)
        ->orderBy('created_at', 'desc')
        ->get([
            'id',
            'user_id',
            'status',
            'payment_status',
            'registration_number',
            'registration_date'
        ]);

    return response()->json([
        'event' => [
            'id' => $event->id,
            'title' => $event->title,
            'total_registrations' => $registrations->count()
        ],
        'registrations' => $registrations->map(function ($registration) {
            return [
                'id' => $registration->id,
                'user_id' => $registration->user_id,
                'status' => $registration->status,
                'payment_status' => $registration->payment_status,
                'registration_number' => $registration->registration_number,
                'registration_date' => $registration->registration_date,
                'user' => $registration->user ? [
                    'id' => $registration->user->id,
                    'name' => $registration->user->first_name . ' ' . $registration->user->last_name,
                    'email' => $registration->user->email
                ] : null
            ];
        })
    ]);
}
}