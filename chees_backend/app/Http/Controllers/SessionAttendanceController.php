<?php

namespace App\Http\Controllers;

use App\Models\CourseSession;
use App\Models\SessionAttendance;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Validator;

class SessionAttendanceController extends Controller
{
    /**
     * Store a newly created attendance record.
     */
    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'session_id' => 'required|exists:course_sessions,id',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors' => $validator->errors()
            ], 422);
        }

        $userId = Auth::id() ?? $request->user_id; // Use authenticated user or provided user_id
        $courseSessionId = $request->session_id;
        
        // Check if session exists
        $session = CourseSession::findOrFail($courseSessionId);
        
        // Check if attendance time is within session time period
        $attendedAt = $request->attended_at ? now()->parse($request->attended_at) : now();
        
        if ($attendedAt->lt($session->start_datetime) || $attendedAt->gt($session->end_datetime)) {
            return response()->json([
                'success' => false,
                'message' => 'Attendance can only be marked during the session time period',
                'session_time' => [
                    'start' => $session->start_datetime,
                    'end' => $session->end_datetime,
                    'attempted' => $attendedAt
                ]
            ], 422);
        }
        
        // Check if already marked as attended
        $existing = SessionAttendance::where('session_id', $courseSessionId)
            ->where('user_id', $userId)
            ->first();
            
        if ($existing) {
            return response()->json([
                'success' => false,
                'message' => 'You have already marked attendance for this session'
            ], 422);
        }
        
        // Create attendance record
        $attendance = SessionAttendance::create([
            'session_id' => $courseSessionId,
            'user_id' => $userId,
            'attended_at' => $attendedAt,
            'status' => $request->status ?? 'attended',
            'notes' => $request->notes
        ]);
        
        return response()->json([
            'success' => true,
            'message' => 'Attendance recorded successfully',
            'data' => $attendance
        ], 201);
    }
    
    /**
     * Display a listing of attendances.
     */
    public function index(Request $request)
    {
        $query = SessionAttendance::with('user');
        
        // Filter by session if provided
        if ($request->has('session_id')) {
            $query->where('session_id', $request->session_id);
        }
        
        // Filter by user if provided
        if ($request->has('user_id')) {
            $query->where('user_id', $request->user_id);
        }
        
        $attendances = $query->get();
            
        return response()->json([
            'success' => true,
            'data' => $attendances
        ]);
    }
    
    /**
     * Show a specific attendance record
     */
    public function show($id)
    {
        $attendance = SessionAttendance::with(['user', 'session'])->findOrFail($id);
        
        return response()->json([
            'success' => true,
            'data' => $attendance
        ]);
    }
    
    /**
     * Update an attendance record.
     */
    public function update(Request $request, $id)
    {
        $validator = Validator::make(
            $request->all(),
            [
                'status' => 'required|in:attended,excused,absent',
                'notes' => 'nullable|string',
            ]
        );

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors' => $validator->errors()
            ], 422);
        }
        
        $attendance = SessionAttendance::findOrFail($id);
        
        // If updating attended_at, validate it's within session timeframe
        if ($request->has('attended_at')) {
            $session = CourseSession::findOrFail($attendance->session_id);
            $attendedAt = now()->parse($request->attended_at);
            
            if ($attendedAt->lt($session->start_datetime) || $attendedAt->gt($session->end_datetime)) {
                return response()->json([
                    'success' => false,
                    'message' => 'Attendance can only be marked during the session time period',
                    'session_time' => [
                        'start' => $session->start_datetime,
                        'end' => $session->end_datetime,
                        'attempted' => $attendedAt
                    ]
                ], 422);
            }
            
            $attendance->attended_at = $attendedAt;
        }
        
        $attendance->status = $request->status;
        $attendance->notes = $request->notes;
        $attendance->save();
        
        return response()->json([
            'success' => true,
            'message' => 'Attendance updated successfully',
            'data' => $attendance
        ]);
    }
    
    /**
     * Delete an attendance record.
     */
    public function destroy($id)
    {
        $attendance = SessionAttendance::findOrFail($id);
        $attendance->delete();
        
        return response()->json([
            'success' => true,
            'message' => 'Attendance record deleted successfully'
        ]);
    }
}
