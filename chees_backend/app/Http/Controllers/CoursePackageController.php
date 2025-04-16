<?php

namespace App\Http\Controllers;

use App\Models\Course;
use App\Models\CoursePackage;
use App\Models\Payment;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Validator;

class CoursePackageController extends Controller
{
    /**
     * Display a listing of course packages.
     */
    public function index(Request $request)
    {
        $query = CoursePackage::with('courses');
        
        // Filter active packages if requested
        if ($request->has('active') && $request->active) {
            $query->where('is_active', true);
        }
        
        // Sort options
        $sortField = $request->get('sort_by', 'created_at');
        $sortDirection = $request->get('sort_direction', 'desc');
        $allowedSortFields = ['name', 'price', 'created_at'];
        
        if (in_array($sortField, $allowedSortFields)) {
            $query->orderBy($sortField, $sortDirection);
        }
        
        $packages = $query->paginate(10);
        
        // Add calculated fields
        foreach ($packages as $package) {
            $package->original_price = $package->getOriginalPriceAttribute();
            $package->savings = $package->getSavingsAttribute();
            $package->savings_percentage = $package->getSavingsPercentageAttribute();
            
            // Generate thumbnail URL
            if ($package->thumbnail) {
                $thumbnailPath = str_replace('storage/', '', $package->thumbnail);
                
                if (Storage::disk('public')->exists($thumbnailPath)) {
                    $package->thumbnail_url = asset('storage/' . $thumbnailPath);
                } else {
                    $package->thumbnail_url = asset($package->thumbnail);
                }
            } else {
                $package->thumbnail_url = null;
            }
        }
        
        return response()->json([
            'success' => true,
            'data' => $packages
        ]);
    }

    /**
     * Store a newly created course package.
     */
    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:255',
            'description' => 'required|string',
            'price' => 'required|numeric|min:0',
            'discount_percentage' => 'nullable|numeric|min:0|max:100',
            'duration_days' => 'nullable|integer|min:1',
            'is_active' => 'boolean',
            'thumbnail' => 'nullable|image|mimes:jpeg,png,jpg,gif,svg|max:2048',
            'courses' => 'required|array|min:1',
            'courses.*.id' => 'required|exists:courses,id',
            'courses.*.order' => 'required|integer|min:0',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors' => $validator->errors()
            ], 422);
        }
        
        try {
            DB::beginTransaction();
            
            // Handle thumbnail upload
            $thumbnailPath = null;
            if ($request->hasFile('thumbnail')) {
                $file = $request->file('thumbnail');
                $filename = uniqid() . '.' . $file->getClientOriginalExtension();
                $thumbnailPath = $file->storeAs('packages', $filename, 'public');
            }
            
            // Create the package
            $package = CoursePackage::create([
                'name' => $request->name,
                'description' => $request->description,
                'price' => $request->price,
                'discount_percentage' => $request->discount_percentage ?? 0,
                'duration_days' => $request->duration_days,
                'is_active' => $request->is_active ?? true,
                'thumbnail' => $thumbnailPath,
            ]);
            
            // Attach courses to the package
            foreach ($request->courses as $courseData) {
                $package->courses()->attach($courseData['id'], [
                    'order' => $courseData['order']
                ]);
            }
            
            DB::commit();
            
            // Return with full course data
            $package->load('courses');
            
            // Add calculated fields
            $package->original_price = $package->getOriginalPriceAttribute();
            $package->savings = $package->getSavingsAttribute();
            $package->savings_percentage = $package->getSavingsPercentageAttribute();
            
            return response()->json([
                'success' => true,
                'message' => 'Course package created successfully',
                'data' => $package
            ], 201);
            
        } catch (\Exception $e) {
            DB::rollBack();
            
            return response()->json([
                'success' => false,
                'message' => 'Failed to create course package',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Display the specified course package.
     */
    public function show($id)
    {
        $package = CoursePackage::with('courses')->findOrFail($id);
        
        // Add calculated fields
        $package->original_price = $package->getOriginalPriceAttribute();
        $package->savings = $package->getSavingsAttribute();
        $package->savings_percentage = $package->getSavingsPercentageAttribute();
        
        // Generate thumbnail URL
        if ($package->thumbnail) {
            $thumbnailPath = str_replace('storage/', '', $package->thumbnail);
            
            if (Storage::disk('public')->exists($thumbnailPath)) {
                $package->thumbnail_url = asset('storage/' . $thumbnailPath);
            } else {
                $package->thumbnail_url = asset($package->thumbnail);
            }
        } else {
            $package->thumbnail_url = null;
        }
        
        return response()->json([
            'success' => true,
            'data' => $package
        ]);
    }

    /**
     * Update the specified course package.
     */
    public function update(Request $request, $id)
    {
        $validator = Validator::make($request->all(), [
            'name' => 'sometimes|string|max:255',
            'description' => 'sometimes|string',
            'price' => 'sometimes|numeric|min:0',
            'discount_percentage' => 'nullable|numeric|min:0|max:100',
            'duration_days' => 'nullable|integer|min:1',
            'is_active' => 'boolean',
            'thumbnail' => 'nullable|image|mimes:jpeg,png,jpg,gif,svg|max:2048',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors' => $validator->errors()
            ], 422);
        }
        
        try {
            $package = CoursePackage::findOrFail($id);
            
            // Handle thumbnail upload
            if ($request->hasFile('thumbnail')) {
                // Delete old thumbnail if exists
                if ($package->thumbnail && Storage::disk('public')->exists(str_replace('storage/', '', $package->thumbnail))) {
                    Storage::disk('public')->delete(str_replace('storage/', '', $package->thumbnail));
                }
                
                // Store new thumbnail
                $file = $request->file('thumbnail');
                $filename = uniqid() . '.' . $file->getClientOriginalExtension();
                $thumbnailPath = $file->storeAs('packages', $filename, 'public');
                
                $request->merge(['thumbnail' => $thumbnailPath]);
            }
            
            $package->update($request->only([
                'name', 'description', 'price', 'discount_percentage',
                'duration_days', 'is_active', 'thumbnail'
            ]));
            
            // Load courses
            $package->load('courses');
            
            // Add calculated fields
            $package->original_price = $package->getOriginalPriceAttribute();
            $package->savings = $package->getSavingsAttribute();
            $package->savings_percentage = $package->getSavingsPercentageAttribute();
            
            return response()->json([
                'success' => true,
                'message' => 'Course package updated successfully',
                'data' => $package
            ]);
            
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to update course package',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Update the courses in the package.
     */
    public function updateCourses(Request $request, $id)
    {
        $validator = Validator::make($request->all(), [
            'courses' => 'required|array|min:1',
            'courses.*.id' => 'required|exists:courses,id',
            'courses.*.order' => 'required|integer|min:0',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors' => $validator->errors()
            ], 422);
        }
        
        try {
            DB::beginTransaction();
            
            $package = CoursePackage::findOrFail($id);
            
            // Detach all existing courses
            $package->courses()->detach();
            
            // Attach new courses
            foreach ($request->courses as $courseData) {
                $package->courses()->attach($courseData['id'], [
                    'order' => $courseData['order']
                ]);
            }
            
            DB::commit();
            
            // Load updated courses
            $package->load('courses');
            
            // Add calculated fields
            $package->original_price = $package->getOriginalPriceAttribute();
            $package->savings = $package->getSavingsAttribute();
            $package->savings_percentage = $package->getSavingsPercentageAttribute();
            
            return response()->json([
                'success' => true,
                'message' => 'Package courses updated successfully',
                'data' => $package
            ]);
            
        } catch (\Exception $e) {
            DB::rollBack();
            
            return response()->json([
                'success' => false,
                'message' => 'Failed to update package courses',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Remove the specified course package.
     */
    public function destroy($id)
    {
        $package = CoursePackage::findOrFail($id);
        
        try {
            // Delete thumbnail if exists
            if ($package->thumbnail && Storage::disk('public')->exists(str_replace('storage/', '', $package->thumbnail))) {
                Storage::disk('public')->delete(str_replace('storage/', '', $package->thumbnail));
            }
            
            // Delete the package (will automatically detach courses)
            $package->delete();
            
            return response()->json([
                'success' => true,
                'message' => 'Course package deleted successfully'
            ]);
            
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to delete course package',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Purchase a course package.
     */
    public function purchase(Request $request, $id)
    {
        $validator = Validator::make($request->all(), [
            'payment_method' => 'required|string',
            'payment_details' => 'required|array',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors' => $validator->errors()
            ], 422);
        }
        
        try {
            DB::beginTransaction();
            
            $package = CoursePackage::with('courses')->findOrFail($id);
            $user = Auth::user();
            
            // Check if user already has an active purchase of this package
            $existingPurchase = $user->coursePackages()
                ->wherePivot('course_package_id', $id)
                ->wherePivot('status', 'active')
                ->wherePivot('expiry_date', '>', now())
                ->orWherePivot('expiry_date', null)
                ->first();
                
            if ($existingPurchase) {
                DB::rollBack();
                return response()->json([
                    'success' => false,
                    'message' => 'You already have an active subscription to this package'
                ], 422);
            }
            
            // Create a payment record
            $payment = Payment::create([
                'user_id' => $user->id,
                'amount' => $package->price,
                'payment_method' => $request->payment_method,
                'payment_details' => json_encode($request->payment_details),
                'status' => 'completed',
                'payment_date' => now(),
                'description' => "Purchase of course package: {$package->name}"
            ]);
            
            // Calculate expiry date if duration is set
            $expiryDate = null;
            if ($package->duration_days) {
                $expiryDate = now()->addDays($package->duration_days);
            }
            
            // Create the user-package relationship
            $user->coursePackages()->attach($package->id, [
                'purchase_date' => now(),
                'expiry_date' => $expiryDate,
                'status' => 'active',
                'payment_id' => $payment->id
            ]);
            
            // Initialize course progress for each course in the package
            foreach ($package->courses as $course) {
                // Create or update course progress
                $progress = $course->progress()->updateOrCreate(
                    ['user_id' => $user->id, 'course_id' => $course->id],
                    ['progress' => 0, 'last_accessed_at' => now()]
                );
            }
            
            DB::commit();
            
            // Reload the user with their packages
            $user->load('coursePackages.courses');
            
            return response()->json([
                'success' => true,
                'message' => 'Package purchased successfully',
                'data' => [
                    'package' => $package,
                    'payment' => $payment,
                    'expiry_date' => $expiryDate
                ]
            ]);
            
        } catch (\Exception $e) {
            DB::rollBack();
            
            return response()->json([
                'success' => false,
                'message' => 'Failed to purchase package',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get the user's purchased packages.
     */
    public function myPackages()
    {
        $user = Auth::user();
        
        // Get all packages with their courses
        $packages = $user->coursePackages()
            ->with('courses')
            ->orderBy('user_course_packages.created_at', 'desc')
            ->get();
            
        // Add pivot data and additional information
        $formattedPackages = $packages->map(function ($package) {
            // Add calculated fields
            $package->original_price = $package->getOriginalPriceAttribute();
            $package->savings = $package->getSavingsAttribute();
            $package->savings_percentage = $package->getSavingsPercentageAttribute();
            
            // Format pivot data
            $package->purchase_date = $package->pivot->purchase_date;
            $package->expiry_date = $package->pivot->expiry_date;
            $package->status = $package->pivot->status;
            $package->is_expired = $package->pivot->expiry_date ? $package->pivot->expiry_date < now() : false;
            
            // Add course progress
            foreach ($package->courses as $course) {
                $progress = $course->userProgress(Auth::id());
                $course->progress = $progress ? $progress->progress : 0;
                $course->last_accessed = $progress ? $progress->last_accessed_at : null;
            }
            
            // Generate thumbnail URL
            if ($package->thumbnail) {
                $thumbnailPath = str_replace('storage/', '', $package->thumbnail);
                
                if (Storage::disk('public')->exists($thumbnailPath)) {
                    $package->thumbnail_url = asset('storage/' . $thumbnailPath);
                } else {
                    $package->thumbnail_url = asset($package->thumbnail);
                }
            } else {
                $package->thumbnail_url = null;
            }
            
            return $package;
        });
        
        return response()->json([
            'success' => true,
            'data' => $formattedPackages
        ]);
    }

    /**
     * Get active packages for the current user.
     */
    public function myActivePackages()
    {
        $user = Auth::user();
        
        // Get only active packages with their courses
        $packages = $user->coursePackages()
            ->with('courses')
            ->wherePivot('status', 'active')
            ->where(function ($query) {
                $query->wherePivot('expiry_date', '>', now())
                      ->orWherePivot('expiry_date', null);
            })
            ->orderBy('user_course_packages.created_at', 'desc')
            ->get();
            
        // Add pivot data and additional information
        $formattedPackages = $packages->map(function ($package) {
            // Add calculated fields
            $package->original_price = $package->getOriginalPriceAttribute();
            $package->savings = $package->getSavingsAttribute();
            $package->savings_percentage = $package->getSavingsPercentageAttribute();
            
            // Format pivot data
            $package->purchase_date = $package->pivot->purchase_date;
            $package->expiry_date = $package->pivot->expiry_date;
            $package->status = $package->pivot->status;
            
            // Add course progress
            foreach ($package->courses as $course) {
                $progress = $course->userProgress(Auth::id());
                $course->progress = $progress ? $progress->progress : 0;
                $course->last_accessed = $progress ? $progress->last_accessed_at : null;
            }
            
            // Generate thumbnail URL
            if ($package->thumbnail) {
                $thumbnailPath = str_replace('storage/', '', $package->thumbnail);
                
                if (Storage::disk('public')->exists($thumbnailPath)) {
                    $package->thumbnail_url = asset('storage/' . $thumbnailPath);
                } else {
                    $package->thumbnail_url = asset($package->thumbnail);
                }
            } else {
                $package->thumbnail_url = null;
            }
            
            return $package;
        });
        
        return response()->json([
            'success' => true,
            'data' => $formattedPackages
        ]);
    }
    
    /**
     * Cancel a package subscription
     */
    public function cancelPackage($id)
    {
        $user = Auth::user();
        
        try {
            $purchase = $user->coursePackages()
                ->wherePivot('course_package_id', $id)
                ->wherePivot('status', 'active')
                ->first();
                
            if (!$purchase) {
                return response()->json([
                    'success' => false,
                    'message' => 'Package not found or not active'
                ], 404);
            }
            
            // Update the status to cancelled
            $user->coursePackages()->updateExistingPivot($id, [
                'status' => 'cancelled'
            ]);
            
            return response()->json([
                'success' => true,
                'message' => 'Package cancelled successfully'
            ]);
            
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to cancel package',
                'error' => $e->getMessage()
            ], 500);
        }
    }
}
