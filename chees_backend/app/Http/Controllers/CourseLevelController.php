<?php

namespace App\Http\Controllers;

use App\Models\CourseLevel;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class CourseLevelController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        $levels = CourseLevel::all();
        
        return response()->json([
            'success' => true,
            'data' => $levels
        ]);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        // This method is typically used for returning a view in web applications
        // For API, we usually don't implement this
        return response()->json([
            'message' => 'Method not supported for API'
        ], 405);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:50|unique:course_levels,name',
            'description' => 'nullable|string',
            'min_rating' => 'nullable|integer',
            'max_rating' => 'nullable|integer',
            'icon' => 'nullable|string|max:255',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors' => $validator->errors()
            ], 422);
        }

        $level = CourseLevel::create($request->all());

        return response()->json([
            'success' => true,
            'message' => 'Course level created successfully',
            'data' => $level
        ], 201);
    }

    /**
     * Display the specified resource.
     */
    public function show(string $id)
    {
        $level = CourseLevel::findOrFail($id);
        
        return response()->json([
            'success' => true,
            'data' => $level
        ]);
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(string $id)
    {
        // This method is typically used for returning a view in web applications
        // For API, we usually don't implement this
        return response()->json([
            'message' => 'Method not supported for API'
        ], 405);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, string $id)
    {
        $level = CourseLevel::findOrFail($id);
        
        $validator = Validator::make($request->all(), [
            'name' => 'sometimes|required|string|max:50|unique:course_levels,name,' . $id,
            'description' => 'nullable|string',
            'min_rating' => 'nullable|integer',
            'max_rating' => 'nullable|integer',
            'icon' => 'nullable|string|max:255',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors' => $validator->errors()
            ], 422);
        }

        $level->update($request->all());

        return response()->json([
            'success' => true,
            'message' => 'Course level updated successfully',
            'data' => $level
        ]);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $id)
    {
        $level = CourseLevel::findOrFail($id);
        
        // Delete all courses associated with this level
        $level->courses()->delete();
        
        // Then delete the level itself
        $level->delete();

        return response()->json([
            'success' => true,
            'message' => 'Course level and all associated courses deleted successfully'
        ]);
    }
    
    /**
     * Get courses by level
     */
    public function getCourses(string $id)
    {
        $level = CourseLevel::findOrFail($id);
        $courses = $level->courses()->paginate(10);
        
        return response()->json([
            'success' => true,
            'data' => [
                'level' => $level,
                'courses' => $courses
            ]
        ]);
    }
}