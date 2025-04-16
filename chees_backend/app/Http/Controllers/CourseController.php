<?php

namespace App\Http\Controllers;

use App\Models\Course;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\Storage;

class CourseController extends Controller
{
    /**
     * Display a listing of the courses.
     */
    public function index(Request $request)
    {
        // Start with Course query and eager load the level relationship
        $query = Course::with('level');
        
        // Filter by level if provided
        if ($request->has('level_id')) {
            $query->where('level_id', $request->level_id);
        }
        
        // Search by title or description
        if ($request->has('search')) {
            $search = $request->search;
            $query->where(function($q) use ($search) {
                $q->where('title', 'like', "%{$search}%")
                  ->orWhere('description', 'like', "%{$search}%");
            });
        }
        
        // Sort options
        $sortField = $request->get('sort_by', 'created_at');
        $sortDirection = $request->get('sort_direction', 'desc');
        $allowedSortFields = ['title', 'price', 'created_at'];
        
        if (in_array($sortField, $allowedSortFields)) {
            $query->orderBy($sortField, $sortDirection);
        }
        
        $courses = $query->paginate(10);
        
        // Add wishlist information if requested and user is authenticated
        if ($request->has('include_wishlist') && $request->user()) {
            $userId = $request->user()->id;
            $wishlistedCourseIds = \App\Models\Wishlist::where('user_id', $userId)
                ->where('item_type', 'course')
                ->pluck('item_id')
                ->toArray();
            
            $courses->getCollection()->transform(function ($course) use ($wishlistedCourseIds) {
                $course->is_wishlisted = in_array($course->id, $wishlistedCourseIds);
                return $course;
            });
        }
        
        return response()->json([
            'success' => true,
            'data' => $courses
        ]);
    }

    /**
     * Store a newly created course in storage.
     */
    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'title' => 'required|string|max:255',
            'level_id' => 'required|exists:course_levels,id',
            'description' => 'required|string',
            'thumbnail' => 'nullable|image|mimes:jpeg,png,jpg,gif|max:2048', // Image validation
            'price' => 'required|numeric|min:0',
            'duration' => 'required|integer|min:1',
            'max_students' => 'nullable|integer|min:1',
            'is_online' => 'required|in:0,1',
            'is_active' => 'required|in:0,1',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors' => $validator->errors()
            ], 422);
        }

        // Handle thumbnail upload
        $thumbnailPath = null;
        if ($request->hasFile('thumbnail')) {
            $file = $request->file('thumbnail');
            
            // Generate a unique filename
            $filename = uniqid() . '.' . $file->getClientOriginalExtension();
            
            // Store the file in the courses directory
            $thumbnailPath = $file->storeAs('courses', $filename, 'public');
        }

        // Prepare input data
        $input = $request->except('thumbnail');
        $input['thumbnail'] = $thumbnailPath;
        
        // Cast boolean and numeric values
        $input['is_online'] = filter_var($request->input('is_online', true), FILTER_VALIDATE_BOOLEAN);
        $input['is_active'] = filter_var($request->input('is_active', true), FILTER_VALIDATE_BOOLEAN);
        $input['price'] = floatval($request->input('price'));
        $input['duration'] = intval($request->input('duration'));
        $input['max_students'] = $request->input('max_students') ? intval($request->input('max_students')) : null;

        // Create the course
        $course = Course::create($input);

        return response()->json([
            'success' => true,
            'message' => 'Course created successfully',
            'data' => $course
        ], 201);
    }

    /**
     * Display the specified course.
     */
    public function show(string $id)
    {
        $course = Course::with(['level', 'sessions', 'materials'])->findOrFail($id);
        
        // Add additional data for frontend compatibility
        $courseData = $course->toArray();
        
        // Check if user is authenticated and enrolled in this course
        $isEnrolled = false;
        $userId = auth()->id();
        
        if ($userId) {
            // Check if user is enrolled
            $enrollment = $course->enrollments()->where('user_id', $userId)->first();
            $isEnrolled = !is_null($enrollment);
            
            // Add enrollment status to response
            $courseData['is_enrolled'] = $isEnrolled;
            
            // If enrolled, calculate progress
            if ($isEnrolled) {
                $progress = $course->userProgress($userId);
                $courseData['progress'] = $progress ? $progress->progress_percentage : 0;
            }
        } else {
            $courseData['is_enrolled'] = false;
        }
        
        // For non-enrolled users, limit material information
        if (!$isEnrolled && isset($courseData['materials'])) {
            foreach ($courseData['materials'] as &$material) {
                // Keep basic info but mark as locked
                $material['is_locked'] = true;
                $material['file_path'] = null;
                $material['url'] = null;
            }
        }
        
        // Debug the thumbnail path
        \Log::info('Course thumbnail path:', [
            'course_id' => $course->id,
            'thumbnail' => $course->thumbnail
        ]);
        
        // Check if thumbnail exists and generate correct URL
        if ($course->thumbnail) {
            // For new thumbnail format (stored directly as the path in course_thumbnails directory)
            $thumbnailPath = $course->thumbnail;
            
            // Check if file exists in storage
            if (Storage::disk('public')->exists($thumbnailPath)) {
                $courseData['thumbnail_url'] = asset('storage/' . $thumbnailPath);
                $courseData['thumbnail_exists'] = true;
            } else {
                // Fallback for older thumbnail paths (that might have storage/ prefix or be in different directories)
                $alternativePath = str_replace('storage/', '', $course->thumbnail);
                
                if (Storage::disk('public')->exists($alternativePath)) {
                    $courseData['thumbnail_url'] = asset('storage/' . $alternativePath);
                    $courseData['thumbnail_exists'] = true;
                } else {
                    // If all attempts fail, use the original path as a last resort
                    $courseData['thumbnail_url'] = asset($course->thumbnail);
                    $courseData['thumbnail_exists'] = false;
                    
                    // Log the issue for debugging
                    \Log::warning('Thumbnail file not found:', [
                        'course_id' => $course->id,
                        'thumbnail_path' => $thumbnailPath,
                        'alternative_path' => $alternativePath,
                        'original_thumbnail' => $course->thumbnail
                    ]);
                }
            }
        } else {
            $courseData['thumbnail_url'] = null;
            $courseData['thumbnail_exists'] = false;
        }
        
        return response()->json([
            'success' => true,
            'data' => $courseData
        ]);
    }

    public function update(Request $request, Course $course)
    {
        try {
            // Parse PUT form-data if necessary
            if ($request->isMethod('PUT') && strpos($request->header('Content-Type'), 'multipart/form-data') !== false) {
                $putData = $request->getContent();
                
                // Get the boundary
                preg_match('/boundary=(.*)$/', $request->header('Content-Type'), $matches);
                if (isset($matches[1])) {
                    $boundary = $matches[1];

                    // Parse the multipart form data manually
                    $parts = array_slice(explode('--' . $boundary, $putData), 1, -1);
                    $data = [];

                    foreach ($parts as $part) {
                        // If this is the file content
                        if (strpos($part, 'filename') !== false) {
                            preg_match('/name="([^"]+)"; filename="([^"]+)"/i', $part, $matches);
                            if (isset($matches[1]) && isset($matches[2])) {
                                $fieldName = $matches[1];

                                // Get file content
                                $fileContent = substr($part, strpos($part, "\r\n\r\n") + 4, -2);

                                // Create temporary file
                                $tmpfname = tempnam(sys_get_temp_dir(), 'put_');
                                file_put_contents($tmpfname, $fileContent);

                                // Create UploadedFile instance
                                $file = new \Illuminate\Http\UploadedFile(
                                    $tmpfname,
                                    $matches[2],
                                    mime_content_type($tmpfname),
                                    null,
                                    true
                                );

                                $request->files->set($fieldName, $file);
                            }
                        }
                        // If this is regular form data
                        else {
                            preg_match('/name="([^"]+)"/i', $part, $matches);
                            if (isset($matches[1])) {
                                $fieldName = $matches[1];
                                $value = substr($part, strpos($part, "\r\n\r\n") + 4, -2);
                                $data[$fieldName] = $value;
                            }
                        }
                    }

                    $request->merge($data);
                }
            }
            
            // Log the incoming request data
            \Log::info('Course update request:', [
                'course_id' => $course->id,
                'request_data' => $request->all(),
                'method' => $request->method(),
                'content_type' => $request->header('Content-Type')
            ]);

            // Validate the request
            $validated = $request->validate([
                'title' => 'sometimes|required|string|max:255',
                'level_id' => 'sometimes|required|exists:course_levels,id',
                'description' => 'sometimes|required|string',
                'thumbnail' => 'nullable|image|mimes:jpeg,png,jpg,gif,svg,webp|max:2048',
                'file_path' => 'nullable|string', // Allow file_path for existing thumbnails
                'price' => 'sometimes|required|numeric|min:0',
                'duration' => 'sometimes|required|integer|min:1',
                'max_students' => 'nullable|integer|min:1',
                'is_online' => 'nullable|in:0,1',
                'is_active' => 'nullable|in:0,1',
            ]);

            // Collect update data
            $updateData = $request->only([
                'title', 'description', 'price', 'level_id',
                'duration', 'max_students', 'is_online', 'is_active'
            ]);

            // Type cast numeric fields
            if (isset($updateData['price'])) {
                $updateData['price'] = floatval($updateData['price']);
            }
            if (isset($updateData['duration'])) {
                $updateData['duration'] = intval($updateData['duration']);
            }
            if (isset($updateData['max_students'])) {
                $updateData['max_students'] = intval($updateData['max_students']);
            }

            // Type cast boolean fields
            if (isset($updateData['is_online'])) {
                $updateData['is_online'] = filter_var($updateData['is_online'], FILTER_VALIDATE_BOOLEAN);
            }
            if (isset($updateData['is_active'])) {
                $updateData['is_active'] = filter_var($updateData['is_active'], FILTER_VALIDATE_BOOLEAN);
            }

            // Handle thumbnail upload
            if ($request->hasFile('thumbnail')) {
                // Delete old thumbnail if exists
                if ($course->thumbnail && Storage::disk('public')->exists(str_replace('storage/', '', $course->thumbnail))) {
                    Storage::disk('public')->delete(str_replace('storage/', '', $course->thumbnail));
                }
                
                // Store new thumbnail
                $file = $request->file('thumbnail');
                $filename = uniqid() . '.' . $file->getClientOriginalExtension();
                $thumbnailPath = $file->storeAs('courses', $filename, 'public');
                
                // Log the thumbnail storage for debugging
                \Log::info('Storing thumbnail:', [
                    'original_name' => $file->getClientOriginalName(),
                    'path' => $thumbnailPath,
                    'full_path' => Storage::disk('public')->path($thumbnailPath),
                    'url' => Storage::disk('public')->url($thumbnailPath)
                ]);
                
                $updateData['thumbnail'] = 'storage/' . $thumbnailPath;
            } elseif ($request->has('file_path') && !empty($request->file_path)) {
                // Keep existing thumbnail if file_path is provided
                $updateData['thumbnail'] = $request->file_path;
            }
            // Handle thumbnail removal
            elseif ($request->has('thumbnail') && 
                    ($request->input('thumbnail') === null || $request->input('thumbnail') === 'null' || $request->input('thumbnail') === '')) {
                if ($course->thumbnail && Storage::disk('public')->exists(str_replace('storage/', '', $course->thumbnail))) {
                    Storage::disk('public')->delete(str_replace('storage/', '', $course->thumbnail));
                }
                $updateData['thumbnail'] = null;
            }

            // Log the final update data
            \Log::info('Course update data before save:', [
                'course_id' => $course->id,
                'final_update_data' => $updateData
            ]);

            // Update the course
            $course->update($updateData);
            $course->refresh();

            // Return full URL for thumbnail if it exists
            if ($course->thumbnail) {
                $course->thumbnail = asset($course->thumbnail);
            }

            return response()->json([
                'success' => true,
                'message' => 'Course updated successfully',
                'data' => $course
            ]);

        } catch (\Illuminate\Validation\ValidationException $e) {
            \Log::warning('Course update validation failed:', ['errors' => $e->errors()]);
            return response()->json([
                'success' => false,
                'errors' => $e->errors()
            ], 422);
        } catch (\Exception $e) {
            \Log::error('Course update failed:', [
                'course_id' => isset($course) ? $course->id : 'unknown',
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Failed to update course: ' . $e->getMessage(),
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Update course with file upload support (handles multipart/form-data)
     */
    public function updateWithFile(Request $request, $course)
    {
        try {
            $course = Course::findOrFail($course);
            
            // Validate the request
            $validator = Validator::make($request->all(), [
                'title' => 'sometimes|required|string|max:255',
                'level_id' => 'sometimes|required|exists:course_levels,id',
                'description' => 'sometimes|required|string',
                'thumbnail' => 'nullable|image|mimes:jpeg,png,jpg,gif|max:2048', // Image validation
                'price' => 'sometimes|required|numeric|min:0',
                'duration' => 'sometimes|required|integer|min:1',
                'max_students' => 'nullable|integer|min:1',
                'is_online' => 'required|in:0,1',
                'is_active' => 'required|in:0,1',
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Validation failed',
                    'errors' => $validator->errors()
                ], 422);
            }
            
            // Collect update data
            $updateData = $request->only([
                'title', 'description', 'price', 'level_id',
                'duration', 'max_students', 'is_online', 'is_active'
            ]);
            
            // Handle file upload if present
            if ($request->hasFile('thumbnail')) {
                // Delete old thumbnail if it exists
                if ($course->thumbnail && file_exists(storage_path('app/public/' . $course->thumbnail))) {
                    unlink(storage_path('app/public/' . $course->thumbnail));
                }
                
                // Store the new thumbnail
                $file = $request->file('thumbnail');
                $fileName = time() . '_' . $file->getClientOriginalName();
                $filePath = $file->storeAs('courses', $fileName, 'public');
                
                $updateData['thumbnail'] = $filePath;
            }
            
            // Update the course
            $course->update($updateData);
            
            // Refresh the course data
            $course->refresh();
            
            // Add thumbnail_url for frontend
            $courseData = $course->toArray();
            
            // Check if thumbnail exists and generate correct URL
            if ($course->thumbnail) {
                // First, try to normalize the path
                $thumbnailPath = str_replace('storage/', '', $course->thumbnail);
                
                // Check if file exists in storage
                if (Storage::disk('public')->exists($thumbnailPath)) {
                    $courseData['thumbnail_url'] = Storage::disk('public')->url($thumbnailPath);
                    $courseData['thumbnail_exists'] = true;
                } else {
                    // Try with original path
                    $courseData['thumbnail_url'] = asset($course->thumbnail);
                    $courseData['thumbnail_exists'] = false;
                    
                    // Log the issue for debugging
                    \Log::warning('Thumbnail file not found after update:', [
                        'course_id' => $course->id,
                        'thumbnail_path' => $thumbnailPath,
                        'full_path' => Storage::disk('public')->path($thumbnailPath)
                    ]);
                }
            } else {
                $courseData['thumbnail_url'] = null;
                $courseData['thumbnail_exists'] = false;
            }
            
            return response()->json([
                'success' => true,
                'message' => 'Course updated successfully',
                'data' => $courseData
            ]);
            
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to update course',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Remove the specified course from storage.
     */
    public function destroy(string $id)
    {
        $course = Course::findOrFail($id);
        $course->delete();

        return response()->json([
            'success' => true,
            'message' => 'Course deleted successfully'
        ]);
    }
    
    /**
     * Get all sessions for a specific course
     */
    public function getSessions(string $id)
    {
        $course = Course::findOrFail($id);
        $sessions = $course->sessions()->orderBy('start_datetime')->get();
        
        return response()->json([
            'success' => true,
            'data' => $sessions
        ]);
    }
    
    /**
     * Get all materials for a specific course
     */
    public function getMaterials(string $id)
    {
        $course = Course::findOrFail($id);
        $materials = $course->materials()->orderBy('created_at')->get();
        
        return response()->json([
            'success' => true,
            'data' => $materials
        ]);
    }
    
    /**
     * Purchase a course
     *
     * @param \Illuminate\Http\Request $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function purchaseCourse(Request $request)
    {
        try {
            $validator = Validator::make($request->all(), [
                'course_id' => 'required|exists:courses,id',
                'payment_method' => 'required|string|in:credit_card,paypal,direct',
                'payment_details' => 'nullable|array',
                'coupon_id' => 'nullable|exists:coupons,id'
            ]);
            
            if ($validator->fails()) {
                return response()->json([
                    'success' => false,
                    'errors' => $validator->errors(),
                ], 422);
            }
            
            $userId = auth()->id();
            $courseId = $request->input('course_id');
            $paymentMethod = $request->input('payment_method');
            $paymentDetails = $request->input('payment_details', []);
            $couponId = $request->input('coupon_id');
            
            // Check if already purchased
            $existing = \App\Models\Payment::where('user_id', $userId)
                ->where('related_id', $courseId)
                ->where('related_type', 'App\\Models\\Course')
                ->where('status', 'completed')
                ->first();
                
            if ($existing) {
                return response()->json([
                    'success' => true,
                    'message' => 'You already purchased this course',
                    'data' => [
                        'course_id' => $courseId,
                        'purchased' => true,
                    ]
                ]);
            }
            
            // Create payment record for course purchase
            $course = Course::findOrFail($courseId);
            
            // Calculate final price with coupon if applicable
            $originalPrice = $course->price;
            $discountAmount = 0;
            $finalPrice = $originalPrice;
            $coupon = null;
            
            if ($couponId) {
                $coupon = \App\Models\Coupon::findOrFail($couponId);
                
                // Validate coupon is still active
                if (!$coupon->is_active ||
                    ($coupon->end_date !== null && $coupon->end_date < now()) ||
                    ($coupon->start_date !== null && $coupon->start_date > now())) {
                    return response()->json([
                        'success' => false,
                        'message' => 'Coupon is no longer valid',
                    ], 400);
                }
                
                // Calculate discount
                if ($coupon->type === 'percentage') {
                    $discountAmount = $originalPrice * ($coupon->value / 100);
                    // Apply max discount if set
                    if ($coupon->max_discount !== null && $discountAmount > $coupon->max_discount) {
                        $discountAmount = $coupon->max_discount;
                    }
                } else if ($coupon->type === 'fixed') {
                    $discountAmount = $coupon->value;
                    // Don't allow discount to exceed the course price
                    if ($discountAmount > $originalPrice) {
                        $discountAmount = $originalPrice;
                    }
                }
                
                $finalPrice = max(0, $originalPrice - $discountAmount);
                
                // Increment coupon usage count
                $coupon->uses_count += 1;
                $coupon->save();
            }
            
            // Prepare transaction ID based on payment method
            $transactionId = '';
            switch ($paymentMethod) {
                case 'credit_card':
                    $transactionId = 'cc-' . uniqid();
                    break;
                case 'paypal':
                    $transactionId = 'pp-' . uniqid();
                    break;
                default:
                    $transactionId = 'direct-' . uniqid();
            }
            
            // Create payment record
            $payment = new \App\Models\Payment([
                'user_id' => $userId,
                'related_id' => $courseId,
                'related_type' => 'App\\Models\\Course',
                'amount' => $finalPrice,
                'original_amount' => $originalPrice,
                'discount_amount' => $discountAmount,
                'coupon_id' => $couponId,
                'status' => 'completed',
                'payment_method' => $paymentMethod,
                'transaction_id' => $transactionId,
                'description' => 'Course Purchase: ' . $course->title,
                'payment_date' => now(),
            ]);
            
            // If we have any payment details, store them securely
            if (!empty($paymentDetails)) {
                // Only store the last 4 digits of any card numbers for security
                if (isset($paymentDetails['card_number'])) {
                    $paymentDetails['card_number'] = 'XXXX-XXXX-XXXX-' . substr($paymentDetails['card_number'], -4);
                }
                
                // Log payment details securely
                \Log::info('Payment processed for course', [
                    'course_id' => $courseId,
                    'user_id' => $userId,
                    'payment_method' => $paymentMethod,
                    'amount' => $finalPrice,
                    'discount' => $discountAmount,
                    'coupon_applied' => $couponId ? true : false,
                ]);
            }
            
            $payment->save();
            
            return response()->json([
                'success' => true,
                'message' => 'Course purchased successfully',
                'data' => [
                    'course_id' => $courseId,
                    'purchased' => true,
                    'payment_id' => $payment->id,
                    'transaction_id' => $payment->transaction_id,
                    'original_price' => $originalPrice,
                    'discount' => $discountAmount,
                    'final_price' => $finalPrice,
                    'coupon_applied' => $couponId ? $coupon->code : null,
                ]
            ]);
            
        } catch (\Exception $e) {
            \Log::error('Error purchasing course: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Error purchasing course: ' . $e->getMessage(),
            ], 500);
        }
    }
    
    /**
     * Check if the authenticated user has purchased a course.
     *
     * @param string $courseId
     * @return \Illuminate\Http\JsonResponse
     */
    public function checkPurchaseStatus($courseId)
    {
        try {
            $userId = auth()->id();
            
            if (!$userId) {
                return response()->json([
                    'success' => false,
                    'message' => 'User not authenticated',
                ], 401);
            }
            
            // Check if there's a payment record for this course by this user
            $payment = \App\Models\Payment::where('user_id', $userId)
                ->where('related_id', $courseId)
                ->where('related_type', 'App\\Models\\Course')
                ->where('status', 'completed')
                ->first();
            
            $purchased = !is_null($payment);
            
            return response()->json([
                'success' => true,
                'data' => [
                    'purchased' => $purchased,
                ]
            ]);
            
        } catch (\Exception $e) {
            \Log::error('Error checking purchase status: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Error checking purchase status: ' . $e->getMessage(),
            ], 500);
        }
    }
    
    /**
     * Get all courses the authenticated user has purchased
     *
     * @return \Illuminate\Http\JsonResponse
     */
    public function getPurchasedCourses(Request $request)
    {
        try {
            $userId = auth()->id();
            
            if (!$userId) {
                return response()->json([
                    'success' => false,
                    'message' => 'User not authenticated',
                ], 401);
            }
            
            // Get all course IDs from payment records
            $payments = \App\Models\Payment::where('user_id', $userId)
                ->where('related_type', 'App\\Models\\Course')
                ->where('status', 'completed')
                ->get();
            
            $courseIds = $payments->pluck('related_id')->toArray();
            
            // Get all purchased courses
            $courses = Course::with(['level', 'materials'])
                ->whereIn('id', $courseIds)
                ->get();
            
            return response()->json([
                'success' => true,
                'data' => $courses
            ]);
            
        } catch (\Exception $e) {
            \Log::error('Error fetching purchased courses: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Error fetching purchased courses: ' . $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Validate a coupon code
     *
     * @param \Illuminate\Http\Request $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function validateCoupon(Request $request)
    {
        try {
            $validator = Validator::make($request->all(), [
                'code' => 'required|string',
                'course_id' => 'required|exists:courses,id'
            ]);
            
            if ($validator->fails()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Validation failed',
                    'errors' => $validator->errors()
                ], 422);
            }
            
            $code = $request->input('code');
            $courseId = $request->input('course_id');
            $userId = auth()->id();
            
            // Get course price for validation
            $course = \App\Models\Course::findOrFail($courseId);
            
            // Find the coupon
            $coupon = \App\Models\Coupon::where('code', $code)
                ->where('is_active', true)
                ->where(function($query) {
                    $query->whereNull('end_date')
                          ->orWhere('end_date', '>=', now());
                })
                ->where(function($query) {
                    $query->whereNull('start_date')
                          ->orWhere('start_date', '<=', now());
                })
                ->first();
            
            if (!$coupon) {
                return response()->json([
                    'success' => false,
                    'message' => 'Invalid or expired coupon code'
                ], 404);
            }
            
            // Check if coupon is applicable to this course
            if ($coupon->applies_to === 'course' && $coupon->entity_id !== null && $coupon->entity_id != $courseId) {
                return response()->json([
                    'success' => false,
                    'message' => 'This coupon is not applicable to this course'
                ], 400);
            }
            
            // Check minimum purchase requirement
            if ($coupon->min_purchase > 0 && $course->price < $coupon->min_purchase) {
                return response()->json([
                    'success' => false,
                    'message' => 'Minimum purchase amount not met'
                ], 400);
            }
            
            // Check uses limit
            if ($coupon->uses_limit !== null && $coupon->uses_count >= $coupon->uses_limit) {
                return response()->json([
                    'success' => false,
                    'message' => 'Coupon usage limit exceeded'
                ], 400);
            }
            
            // Check per-user limit
            if ($coupon->per_user_limit > 0) {
                $userUsageCount = \App\Models\Payment::where('user_id', $userId)
                    ->where('coupon_id', $coupon->id)
                    ->count();
                
                if ($userUsageCount >= $coupon->per_user_limit) {
                    return response()->json([
                        'success' => false,
                        'message' => 'You have already used this coupon'
                    ], 400);
                }
            }
            
            // Calculate discount
            $discountAmount = 0;
            if ($coupon->type === 'percentage') {
                $discountAmount = $course->price * ($coupon->value / 100);
                // Apply max discount if set
                if ($coupon->max_discount !== null && $discountAmount > $coupon->max_discount) {
                    $discountAmount = $coupon->max_discount;
                }
            } else if ($coupon->type === 'fixed') {
                $discountAmount = $coupon->value;
                // Don't allow discount to exceed the course price
                if ($discountAmount > $course->price) {
                    $discountAmount = $course->price;
                }
            }
            
            // Format return data
            $couponData = [
                'id' => $coupon->id,
                'code' => $coupon->code,
                'type' => $coupon->type,
                'value' => (float)$coupon->value,
                'discount_amount' => (float)$discountAmount,
                'final_price' => max(0, $course->price - $discountAmount)
            ];
            
            return response()->json([
                'success' => true,
                'message' => 'Coupon validated successfully',
                'data' => $couponData
            ]);
            
        } catch (\Exception $e) {
            \Log::error('Error validating coupon: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Error validating coupon: ' . $e->getMessage()
            ], 500);
        }
    }
}
