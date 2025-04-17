<?php

namespace App\Http\Controllers;

use App\Models\Course;
use App\Models\CourseProgress;
use App\Models\Enrollment;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Validator;

class CourseProgressController extends Controller
{
    /**
     * Display progress for a specific user and course
     */
    public function show($userId, $courseId)
    {
        $progress = CourseProgress::where('user_id', $userId)
            ->where('course_id', $courseId)
            ->first();

        if (!$progress) {
            return response()->json([
                'message' => 'No progress found for this user and course'
            ], 404);
        }

        return response()->json($progress);
    }

    /**
     * Update progress for a specific course
     */
    public function update(Request $request, $id)
    {
        $progress = CourseProgress::findOrFail($id);
        
        // Check if user has access to update this progress
        if (Auth::id() !== $progress->user_id && !Auth::user()->hasRole('admin')) {
            return response()->json([
                'message' => 'You are not authorized to update this progress'
            ], 403);
        }
        
        $validator = Validator::make($request->all(), [
            'progress_percentage' => 'sometimes|numeric|min:0|max:100',
            'completed_lessons' => 'sometimes|array',
            'completed_lessons.*' => 'integer',
            'last_accessed_lesson' => 'sometimes|integer|nullable',
            'completed_at' => 'sometimes|date|nullable',
            'notes' => 'sometimes|string|nullable',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'message' => 'Validation failed',
                'errors' => $validator->errors()
            ], 422);
        }

        // Update progress
        $progress->update($request->only([
            'progress_percentage',
            'completed_lessons',
            'last_accessed_lesson',
            'completed_at',
            'notes'
        ]));

        // If progress is 100%, mark as completed if not already
        if ($request->has('progress_percentage') && $request->progress_percentage == 100 && !$progress->completed_at) {
            $progress->completed_at = now();
            $progress->save();
        }

        return response()->json([
            'message' => 'Progress updated successfully',
            'data' => $progress
        ]);
    }

    /**
     * Update multiple progress records in bulk
     */
    public function bulkUpdate(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'progress' => 'required|array',
            'progress.*.id' => 'required|exists:course_progress,id',
            'progress.*.progress_percentage' => 'sometimes|numeric|min:0|max:100',
            'progress.*.completed_lessons' => 'sometimes|array',
            'progress.*.last_accessed_lesson' => 'sometimes|integer|nullable',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'message' => 'Validation failed',
                'errors' => $validator->errors()
            ], 422);
        }

        $updated = [];
        foreach ($request->progress as $item) {
            $progress = CourseProgress::find($item['id']);
            
            // Check permissions
            if (Auth::id() !== $progress->user_id && !Auth::user()->hasRole('admin')) {
                continue;
            }
            
            $progress->update(array_filter($item, function($key) {
                return in_array($key, [
                    'progress_percentage',
                    'completed_lessons',
                    'last_accessed_lesson',
                    'completed_at',
                    'notes'
                ]);
            }, ARRAY_FILTER_USE_KEY));
            
            // Mark as completed if 100%
            if (isset($item['progress_percentage']) && $item['progress_percentage'] == 100 && !$progress->completed_at) {
                $progress->completed_at = now();
                $progress->save();
            }
            
            $updated[] = $progress;
        }

        return response()->json([
            'message' => 'Progress records updated',
            'data' => $updated
        ]);
    }

    /**
     * Get all progress records for a specific user
     */
    public function getUserProgress($userId)
    {
        // Check permissions
        if (Auth::id() !== (int)$userId && !Auth::user()->hasRole('admin')) {
            return response()->json([
                'message' => 'You are not authorized to access this information'
            ], 403);
        }
        
        $progress = CourseProgress::with(['course', 'enrollment'])
            ->where('user_id', $userId)
            ->get();
            
        return response()->json($progress);
    }

    /**
     * Get all progress records for the authenticated user
     */
    public function myProgress()
    {
        $userId = Auth::id();
        $progress = CourseProgress::with(['course', 'enrollment'])
            ->where('user_id', $userId)
            ->get();
            
        return response()->json($progress);
    }

    /**
     * Get all progress records for a specific course
     */
    public function getCourseProgress($courseId)
    {
        // Only admins and coaches can access all progress for a course
        if (!Auth::user()->hasRole('admin') && !Auth::user()->hasRole('coach')) {
            return response()->json([
                'message' => 'You are not authorized to access this information'
            ], 403);
        }
        
        $progress = CourseProgress::with(['user', 'enrollment'])
            ->where('course_id', $courseId)
            ->get();
            
        return response()->json($progress);
    }

    /**
     * Get all progress records for a specific enrollment
     */
    public function getEnrollmentProgress($enrollmentId)
    {
        $enrollment = Enrollment::findOrFail($enrollmentId);
        
        // Check if user has access to this enrollment
        if (Auth::id() !== $enrollment->user_id && !Auth::user()->hasRole('admin')) {
            return response()->json([
                'message' => 'You are not authorized to access this enrollment'
            ], 403);
        }
        
        $progress = CourseProgress::with(['course'])
            ->where('enrollment_id', $enrollmentId)
            ->get();
            
        return response()->json($progress);
    }

    /**
     * Mark a specific lesson as completed
     */
    public function completeLesson(Request $request, $id)
    {
        $progress = CourseProgress::findOrFail($id);
        
        // Check if user has access to this progress
        if (Auth::id() !== $progress->user_id && !Auth::user()->hasRole('admin')) {
            return response()->json([
                'message' => 'You are not authorized to update this progress'
            ], 403);
        }
        
        $validator = Validator::make($request->all(), [
            'lesson_id' => 'required|integer',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'message' => 'Validation failed',
                'errors' => $validator->errors()
            ], 422);
        }
        
        // Get completed lessons array or initialize if empty
        $completedLessons = $progress->completed_lessons ?? [];
        
        // Add the lesson if not already completed
        if (!in_array($request->lesson_id, $completedLessons)) {
            $completedLessons[] = $request->lesson_id;
            $progress->completed_lessons = $completedLessons;
            
            // Update last accessed lesson
            $progress->last_accessed_lesson = $request->lesson_id;
            
            // Calculate new progress percentage if course has lessons data
            $course = Course::find($progress->course_id);
            if ($course && isset($course->metadata['total_lessons']) && $course->metadata['total_lessons'] > 0) {
                $progress->progress_percentage = 
                    (count($completedLessons) / $course->metadata['total_lessons']) * 100;
                    
                // Mark as completed if all lessons are done
                if ($progress->progress_percentage >= 100) {
                    $progress->completed_at = now();
                    $progress->progress_percentage = 100; // Ensure it's exactly 100
                }
            }
            
            $progress->save();
        }
        
        return response()->json([
            'message' => 'Lesson marked as completed',
            'data' => $progress
        ]);
    }
}
