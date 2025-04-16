<?php

namespace App\Http\Controllers;

use App\Models\Wishlist;
use App\Models\Course;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Validator;

class WishlistController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        $userId = Auth::id();
        $wishlistItems = Wishlist::where('user_id', $userId)
            ->orderBy('created_at', 'desc')
            ->get();
            
        return response()->json([
            'success' => true,
            'data' => $wishlistItems
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
            'item_type' => 'required|string|in:book,course,event',
            'item_id' => 'required|integer|min:1',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors' => $validator->errors()
            ], 422);
        }

        $userId = Auth::id();
        
        // Check if item already exists in wishlist
        $existingItem = Wishlist::where('user_id', $userId)
            ->where('item_type', $request->item_type)
            ->where('item_id', $request->item_id)
            ->first();
            
        if ($existingItem) {
            return response()->json([
                'success' => false,
                'message' => 'Item already exists in wishlist'
            ], 422);
        }
        
        $wishlistItem = Wishlist::create([
            'user_id' => $userId,
            'item_type' => $request->item_type,
            'item_id' => $request->item_id
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Item added to wishlist successfully',
            'data' => $wishlistItem
        ], 201);
    }

    /**
     * Display the specified resource.
     */
    public function show(string $id)
    {
        $userId = Auth::id();
        $wishlistItem = Wishlist::where('id', $id)
            ->where('user_id', $userId)
            ->firstOrFail();
            
        return response()->json([
            'success' => true,
            'data' => $wishlistItem
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
        // Typically, wishlist items don't need to be updated
        // They are either added or removed
        return response()->json([
            'message' => 'Method not supported for wishlist items'
        ], 405);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $id)
    {
        $userId = Auth::id();
        $wishlistItem = Wishlist::where('id', $id)
            ->where('user_id', $userId)
            ->firstOrFail();
            
        $wishlistItem->delete();
        
        return response()->json([
            'success' => true,
            'message' => 'Item removed from wishlist successfully'
        ]);
    }
    
    /**
     * Check if an item is in the user's wishlist
     */
    public function checkItem(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'item_type' => 'required|string|in:book,course,event',
            'item_id' => 'required|integer|min:1',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors' => $validator->errors()
            ], 422);
        }
        
        $userId = Auth::id();
        
        $exists = Wishlist::where('user_id', $userId)
            ->where('item_type', $request->item_type)
            ->where('item_id', $request->item_id)
            ->exists();
            
        return response()->json([
            'success' => true,
            'in_wishlist' => $exists
        ]);
    }
    
    /**
     * Toggle an item in the wishlist (add if not exists, remove if exists)
     * 
     * @param Request $request
     * @param string|null $course Course ID from the route
     * @return \Illuminate\Http\JsonResponse
     */
    public function toggle(Request $request, $course = null)
    {
        try {
            // Ensure user is authenticated
            if (!Auth::check()) {
                return response()->json([
                    'success' => false,
                    'message' => 'User not authenticated',
                    'errors' => ['auth' => 'User not authenticated']
                ], 401);
            }
            
            // Get user ID
            $userId = Auth::id();
            if (!$userId) {
                return response()->json([
                    'success' => false,
                    'message' => 'Invalid user ID',
                    'errors' => ['auth' => 'Invalid user ID']
                ], 401);
            }
            
            // Prepare data from request or route parameter
            $data = $request->all();
            if ($course) {
                $data['item_type'] = $request->input('item_type', 'course'); // Default to 'course' type
                $data['item_id'] = (int)$course;  // Convert to integer
            }
            
            // Validate the request data
            $validator = Validator::make($data, [
                'item_type' => 'required|string|in:book,course,event',
                'item_id' => 'required|integer|min:1',
            ]);
    
            if ($validator->fails()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Validation failed',
                    'errors' => $validator->errors()
                ], 422);
            }
            
            $itemType = $data['item_type'];
            $itemId = $data['item_id'];
            
            // Check if the item exists in the wishlist
            $existingItem = Wishlist::where('user_id', $userId)
                ->where('item_type', $itemType)
                ->where('item_id', $itemId)
                ->first();
                
            if ($existingItem) {
                // Remove from wishlist
                $existingItem->delete();
                
                return response()->json([
                    'success' => true,
                    'message' => 'Item removed from wishlist',
                    'in_wishlist' => false
                ]);
            } else {
                // Add to wishlist
                $wishlistItem = new Wishlist();
                $wishlistItem->user_id = $userId;
                $wishlistItem->item_type = $itemType;
                $wishlistItem->item_id = $itemId;
                $wishlistItem->save();
                
                return response()->json([
                    'success' => true,
                    'message' => 'Item added to wishlist',
                    'in_wishlist' => true,
                    'data' => $wishlistItem
                ], 201);
            }
        } catch (\Exception $e) {
            // Log the error
            \Log::error('Wishlist toggle error: ' . $e->getMessage() . ' - ' . $e->getTraceAsString());
            
            return response()->json([
                'success' => false,
                'message' => 'An error occurred while toggling wishlist item',
                'error' => $e->getMessage()
            ], 500);
        }
    }
    
    /**
     * Get all wishlist items for a specific user
     * 
     * @param int $user User ID
     * @return \Illuminate\Http\JsonResponse
     */
    public function userWishlist($user)
    {
        try {
            // Ensure user is authenticated
            if (!Auth::check()) {
                return response()->json([
                    'success' => false,
                    'message' => 'User not authenticated'
                ], 401);
            }
            
            // Check if the authenticated user matches the requested user
            // or if the user has permission to view other users' wishlists
            $currentUser = Auth::user();
            $currentUserId = $currentUser->id;
            
            // Safely check admin role if applicable
            $isAdmin = false;
            if (method_exists($currentUser, 'hasRole')) {
                $isAdmin = $currentUser->hasRole('admin');
            }
            
            if ($currentUserId != $user && !$isAdmin) {
                return response()->json([
                    'success' => false,
                    'message' => 'Unauthorized to view this wishlist'
                ], 403);
            }
            
            // Get all wishlist items for this user where item_type is 'course'
            $wishlistItems = Wishlist::where('user_id', $user)
                ->where('item_type', 'course')
                ->orderBy('created_at', 'desc')
                ->get();
                
            // Manually attach course data to avoid relationship issues
            $enhancedItems = [];
            foreach ($wishlistItems as $item) {
                $course = Course::find($item->item_id);
                if ($course) {
                    $enhancedItem = $item->toArray();
                    $enhancedItem['course'] = $course;
                    $enhancedItems[] = $enhancedItem;
                }
            }
            
            // Replace collection with enhanced data
            $wishlistItems = $enhancedItems;
            
            return response()->json([
                'success' => true,
                'data' => $wishlistItems
            ]);
        } catch (\Exception $e) {
            // Log the error
            \Log::error('User wishlist error: ' . $e->getMessage() . ' - ' . $e->getTraceAsString());
            
            return response()->json([
                'success' => false,
                'message' => 'An error occurred while fetching wishlist items',
                'error' => $e->getMessage()
            ], 500);
        }
    }
}
