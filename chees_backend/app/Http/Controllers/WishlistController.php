<?php

namespace App\Http\Controllers;

use App\Models\Wishlist;
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
     */
    public function toggleItem(Request $request)
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
        
        $existingItem = Wishlist::where('user_id', $userId)
            ->where('item_type', $request->item_type)
            ->where('item_id', $request->item_id)
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
            $wishlistItem = Wishlist::create([
                'user_id' => $userId,
                'item_type' => $request->item_type,
                'item_id' => $request->item_id
            ]);
            
            return response()->json([
                'success' => true,
                'message' => 'Item added to wishlist',
                'in_wishlist' => true,
                'data' => $wishlistItem
            ], 201);
        }
    }
}
