<?php

namespace App\Http\Controllers;

use App\Models\CourseSession;
use App\Models\Course;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class CourseSessionController extends Controller
{
    /**
     * Display a listing of the sessions.
     */
    public function index(Request $request)
    {
        $query = CourseSession::query();
        
        // Filter by course if provided
        if ($request->has('course_id')) {
            $query->where('course_id', $request->course_id);
        }
        
        // Filter by coach if provided
        if ($request->has('coach_id')) {
            $query->where('coach_id', $request->coach_id);
        }
        
        // Filter by date range
        if ($request->has('start_date') && $request->has('end_date')) {
            $query->whereBetween('start_datetime', [$request->start_date, $request->end_date]);
        }
        
        $sessions = $query->orderBy('start_datetime')->get();
        
        return response()->json([
            'success' => true,
            'data' => $sessions
        ]);
    }

    /**
     * Store a newly created session in storage.
     */
    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'course_id' => 'required|exists:courses,id',
            'coach_id' => 'nullable|exists:users,id',
            'title' => 'required|string|max:255',
            'description' => 'nullable|string',
            'start_datetime' => 'required|date',
            'end_datetime' => 'required|date|after:start_datetime',
            'max_participants' => 'nullable|integer|min:1',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors' => $validator->errors()
            ], 422);
        }

        $session = CourseSession::create($request->all());

        return response()->json([
            'success' => true,
            'message' => 'Session created successfully',
            'data' => $session
        ], 201);
    }

    /**
     * Display the specified session.
     */
    public function show(string $id)
    {
        $session = CourseSession::with(['course', 'coach', 'materials'])->findOrFail($id);
        
        return response()->json([
            'success' => true,
            'data' => $session
        ]);
    }

    /**
     * Update the specified session in storage.
     */
    public function update(Request $request, string $id)
    {
        $validator = Validator::make($request->all(), [
            'course_id' => 'exists:courses,id',
            'coach_id' => 'nullable|exists:users,id',
            'title' => 'string|max:255',
            'description' => 'nullable|string',
            'start_datetime' => 'date',
            'end_datetime' => 'date|after:start_datetime',
            'max_participants' => 'nullable|integer|min:1',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors' => $validator->errors()
            ], 422);
        }

        $session = CourseSession::findOrFail($id);
        $session->update($request->all());

        return response()->json([
            'success' => true,
            'message' => 'Session updated successfully',
            'data' => $session
        ]);
    }

    /**
     * Remove the specified session from storage.
     */
    public function destroy(string $id)
    {
        $session = CourseSession::findOrFail($id);
        $session->delete();

        return response()->json([
            'success' => true,
            'message' => 'Session deleted successfully'
        ]);
    }
    
    /**
     * Get all materials for a specific session
     */
    public function getMaterials(string $id)
    {
        $session = CourseSession::findOrFail($id);
        $materials = $session->materials()->orderBy('created_at')->get();
        
        return response()->json([
            'success' => true,
            'data' => $materials
        ]);
    }
    
    /**
     * Create multiple sessions at once
     */
    public function bulkCreate(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'course_id' => 'required|exists:courses,id',
            'coach_id' => 'nullable|exists:users,id',
            'sessions' => 'required|array',
            'sessions.*.title' => 'required|string|max:255',
            'sessions.*.description' => 'nullable|string',
            'sessions.*.start_datetime' => 'required|date',
            'sessions.*.end_datetime' => 'required|date|after:sessions.*.start_datetime',
            'sessions.*.max_participants' => 'nullable|integer|min:1',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors' => $validator->errors()
            ], 422);
        }
        
        $courseId = $request->course_id;
        $coachId = $request->coach_id;
        $sessions = [];
        
        foreach ($request->sessions as $sessionData) {
            $session = CourseSession::create([
                'course_id' => $courseId,
                'coach_id' => $coachId,
                'title' => $sessionData['title'],
                'description' => $sessionData['description'] ?? null,
                'start_datetime' => $sessionData['start_datetime'],
                'end_datetime' => $sessionData['end_datetime'],
                'max_participants' => $sessionData['max_participants'] ?? null,
            ]);
            
            $sessions[] = $session;
        }
        
        return response()->json([
            'success' => true,
            'message' => 'Sessions created successfully',
            'data' => $sessions
        ], 201);
    }
}
