<?php

namespace App\Http\Controllers;

use App\Models\CoachAvailability;
use App\Models\User;
use Illuminate\Http\Request;

class MemberBookingController extends Controller
{
    public function getAvailableSlots()
    {
        $availabilities = CoachAvailability::with(['coach.user' => function($query) {
                $query->whereHas('role', function($q) {
                    $q->where('name', 'coach');
                });
            }])
            ->where('is_bookable', true)
           
            ->orderBy('date','desc')
            ->orderBy('start_time')
            ->get();

        return response()->json($availabilities);
    }

    public function bookSlot(Request $request)
    {
        $validated = $request->validate([
            'availability_id' => 'required|exists:coach_availability,id',
            'user_id' => 'required|exists:users,id'
        ]);

        $user = User::findOrFail($validated['user_id']);

        if ($user->role_id !== 3) {
            return response()->json(['message' => 'Only members can book sessions'], 403);
        }

        $availability = CoachAvailability::findOrFail($validated['availability_id']);

        if ($availability->current_bookings >= $availability->max_students) {
            return response()->json(['message' => 'This slot is fully booked'], 400);
        }

        $availability->increment('current_bookings');

        return response()->json([
            'message' => 'Booking successful',
            'remaining_slots' => $availability->max_students - $availability->current_bookings
        ]);
    }
}