<?php

namespace App\Http\Controllers;

use App\Models\Enrollment;
use App\Models\Course;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Validator;

class EnrollmentController extends Controller
{
    /**
     * Display a listing of enrollments.
     */
    public function index(Request $request)
    {
        $query = Enrollment::query();
        
        // Filter by user if provided
        if ($request->has('user_id')) {
            $query->where('user_id', $request->user_id);
        }
        
        // Filter by status if provided
        if ($request->has('status')) {
            $query->where('status', $request->status);
        }
        
        $enrollments = $query->with(['user', 'courses'])->paginate(20);
        
        return response()->json([
            'success' => true,
            'data' => $enrollments
        ]);
    }

    /**
     * Store a newly created enrollment in storage.
     */
    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'user_id' => 'required|exists:users,id',
            'course_ids' => 'required|array',
            'course_ids.*' => 'exists:courses,id',
            'status' => 'nullable|string|in:active,completed,cancelled',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors' => $validator->errors()
            ], 422);
        }

        // Create the enrollment
        $enrollment = Enrollment::create([
            'user_id' => $request->user_id,
            'status' => $request->status ?? 'active',
            'enrollment_date' => now(),
        ]);
        
        // Attach courses to the enrollment
        $courseData = [];
        foreach ($request->course_ids as $courseId) {
            $courseData[$courseId] = [
                'progress' => 0,
                'started_at' => now()
            ];
        }
        
        $enrollment->courses()->attach($courseData);
        
        // Fetch the enrollment with courses for the response
        $enrollment->load('courses');

        return response()->json([
            'success' => true,
            'message' => 'Enrollment created successfully',
            'data' => $enrollment
        ], 201);
    }

    /**
     * Display the specified enrollment.
     */
    public function show(string $id)
    {
        $enrollment = Enrollment::with(['user', 'courses'])->findOrFail($id);
        
        return response()->json([
            'success' => true,
            'data' => $enrollment
        ]);
    }

    /**
     * Update the specified enrollment in storage.
     */
    public function update(Request $request, string $id)
    {
        $validator = Validator::make($request->all(), [
            'status' => 'nullable|string|in:active,completed,cancelled',
            'completion_date' => 'nullable|date',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors' => $validator->errors()
            ], 422);
        }

        $enrollment = Enrollment::findOrFail($id);
        
        // If status is being changed to completed and no completion date is provided, set it
        if ($request->has('status') && $request->status === 'completed' && !$request->has('completion_date')) {
            $request->merge(['completion_date' => now()]);
        }
        
        $enrollment->update($request->all());

        return response()->json([
            'success' => true,
            'message' => 'Enrollment updated successfully',
            'data' => $enrollment
        ]);
    }

    /**
     * Remove the specified enrollment from storage.
     */
    public function destroy(string $id)
    {
        $enrollment = Enrollment::findOrFail($id);
        $enrollment->delete();

        return response()->json([
            'success' => true,
            'message' => 'Enrollment deleted successfully'
        ]);
    }
    
    /**
     * Get current user's enrollments
     */
    public function myEnrollments(Request $request)
    {
        $userId = Auth::id();
        $status = $request->get('status');
        
        $query = Enrollment::where('user_id', $userId);
        
        if ($status) {
            $query->where('status', $status);
        }
        
        $enrollments = $query->with('courses')->get();
        
        return response()->json([
            'success' => true,
            'data' => $enrollments
        ]);
    }
    
    /**
     * Add courses to an enrollment
     */
    public function addCourses(Request $request, string $id)
    {
        $validator = Validator::make($request->all(), [
            'course_ids' => 'required|array',
            'course_ids.*' => 'exists:courses,id',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors' => $validator->errors()
            ], 422);
        }
        
        $enrollment = Enrollment::findOrFail($id);
        
        // Prepare course data
        $courseData = [];
        foreach ($request->course_ids as $courseId) {
            $courseData[$courseId] = [
                'progress' => 0,
                'started_at' => now()
            ];
        }
        
        // Attach new courses (will ignore existing ones)
        $enrollment->courses()->attach($courseData);
        
        // Reload the enrollment with courses
        $enrollment->load('courses');
        
        return response()->json([
            'success' => true,
            'message' => 'Courses added to enrollment successfully',
            'data' => $enrollment
        ]);
    }
    
    /**
     * Remove courses from an enrollment
     */
    public function removeCourses(Request $request, string $id)
    {
        $validator = Validator::make($request->all(), [
            'course_ids' => 'required|array',
            'course_ids.*' => 'exists:courses,id',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors' => $validator->errors()
            ], 422);
        }
        
        $enrollment = Enrollment::findOrFail($id);
        
        // Detach the courses
        $enrollment->courses()->detach($request->course_ids);
        
        // Reload the enrollment with remaining courses
        $enrollment->load('courses');
        
        return response()->json([
            'success' => true,
            'message' => 'Courses removed from enrollment successfully',
            'data' => $enrollment
        ]);
    }
    
    /**
     * Update progress for a specific course in an enrollment
     */
    public function updateCourseProgress(Request $request, string $id, string $courseId)
    {
        $validator = Validator::make($request->all(), [
            'progress' => 'required|integer|min:0|max:100',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors' => $validator->errors()
            ], 422);
        }
        
        $enrollment = Enrollment::findOrFail($id);
        
        // Check if the course is in the enrollment
        if (!$enrollment->courses()->where('courses.id', $courseId)->exists()) {
            return response()->json([
                'success' => false,
                'message' => 'Course not found in this enrollment'
            ], 404);
        }
        
        // Update the progress
        $pivotData = [
            'progress' => $request->progress
        ];
        
        // If progress is 100%, mark as completed
        if ($request->progress == 100) {
            $pivotData['completed_at'] = now();
        }
        
        $enrollment->courses()->updateExistingPivot($courseId, $pivotData);
        
        // Reload the enrollment with courses
        $enrollment->load('courses');
        
        return response()->json([
            'success' => true,
            'message' => 'Course progress updated successfully',
            'data' => $enrollment
        ]);
    }
    
    /**
     * Update progress for current user's course
     */
    public function updateMyProgress(Request $request, string $courseId)
    {
        $validator = Validator::make($request->all(), [
            'progress' => 'required|integer|min:0|max:100',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors' => $validator->errors()
            ], 422);
        }
        
        $userId = Auth::id();
        
        // Find enrollments for this user that contain this course
        $enrollment = Enrollment::where('user_id', $userId)
            ->whereHas('courses', function($query) use ($courseId) {
                $query->where('courses.id', $courseId);
            })
            ->firstOrFail();
        
        // Update the progress
        $pivotData = [
            'progress' => $request->progress
        ];
        
        // If progress is 100%, mark as completed
        if ($request->progress == 100) {
            $pivotData['completed_at'] = now();
        }
        
        $enrollment->courses()->updateExistingPivot($courseId, $pivotData);
        
        // Check if all courses in the enrollment are completed
        $allCompleted = $enrollment->courses()
            ->wherePivotNull('completed_at')
            ->count() === 0;
            
        if ($allCompleted && $enrollment->status !== 'completed') {
            $enrollment->status = 'completed';
            $enrollment->completion_date = now();
            $enrollment->save();
        }
        
        // Reload the enrollment with courses
        $enrollment->load('courses');
        
        return response()->json([
            'success' => true,
            'message' => 'Course progress updated successfully',
            'data' => [
                'enrollment' => $enrollment,
                'total_progress' => $enrollment->total_progress
            ]
        ]);
    }
}
