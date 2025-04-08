<?php

namespace App\Http\Controllers;

use App\Models\Coupon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Str;

class CouponController extends Controller
{
    /**
     * Display a listing of coupons.
     */
    public function index(Request $request)
    {
        $query = Coupon::query();
        
        // Filter by type if provided
        if ($request->has('type')) {
            $query->where('type', $request->type);
        }
        
        // Filter by active status
        if ($request->has('active')) {
            $isActive = $request->boolean('active');
            $now = now();
            
            if ($isActive) {
                $query->where(function($q) use ($now) {
                    $q->whereNull('valid_from')
                      ->orWhere('valid_from', '<=', $now);
                })->where(function($q) use ($now) {
                    $q->whereNull('valid_until')
                      ->orWhere('valid_until', '>=', $now);
                });
            } else {
                $query->where(function($q) use ($now) {
                    $q->whereNotNull('valid_until')
                      ->where('valid_until', '<', $now);
                });
            }
        }
        
        $coupons = $query->orderBy('created_at', 'desc')->paginate(15);
        
        return response()->json([
            'success' => true,
            'data' => $coupons
        ]);
    }

    /**
     * Store a newly created coupon in storage.
     */
    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'code' => 'nullable|string|max:50|unique:coupons,code',
            'type' => 'required|string|in:percentage,fixed',
            'value' => 'required|numeric|min:0',
            'description' => 'nullable|string',
            'min_purchase' => 'nullable|numeric|min:0',
            'max_discount' => 'nullable|numeric|min:0',
            'usage_limit' => 'nullable|integer|min:1',
            'valid_from' => 'nullable|date',
            'valid_until' => 'nullable|date|after_or_equal:valid_from',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors' => $validator->errors()
            ], 422);
        }

        // Generate a random code if not provided
        if (!$request->has('code') || !$request->code) {
            $request->merge(['code' => strtoupper(Str::random(8))]);
        }

        $coupon = Coupon::create($request->all());

        return response()->json([
            'success' => true,
            'message' => 'Coupon created successfully',
            'data' => $coupon
        ], 201);
    }

    /**
     * Display the specified coupon.
     */
    public function show(string $id)
    {
        $coupon = Coupon::findOrFail($id);
        
        return response()->json([
            'success' => true,
            'data' => $coupon
        ]);
    }

    /**
     * Update the specified coupon in storage.
     */
    public function update(Request $request, string $id)
    {
        $validator = Validator::make($request->all(), [
            'code' => 'string|max:50|unique:coupons,code,' . $id,
            'type' => 'string|in:percentage,fixed',
            'value' => 'numeric|min:0',
            'description' => 'nullable|string',
            'min_purchase' => 'nullable|numeric|min:0',
            'max_discount' => 'nullable|numeric|min:0',
            'usage_limit' => 'nullable|integer|min:1',
            'valid_from' => 'nullable|date',
            'valid_until' => 'nullable|date|after_or_equal:valid_from',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors' => $validator->errors()
            ], 422);
        }

        $coupon = Coupon::findOrFail($id);
        $coupon->update($request->all());

        return response()->json([
            'success' => true,
            'message' => 'Coupon updated successfully',
            'data' => $coupon
        ]);
    }

    /**
     * Remove the specified coupon from storage.
     */
    public function destroy(string $id)
    {
        $coupon = Coupon::findOrFail($id);
        $coupon->delete();

        return response()->json([
            'success' => true,
            'message' => 'Coupon deleted successfully'
        ]);
    }
    
    /**
     * Validate a coupon code
     */
    public function validateCoupon(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'code' => 'required|string|max:50',
            'amount' => 'required|numeric|min:0',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors' => $validator->errors()
            ], 422);
        }

        $code = $request->code;
        $amount = $request->amount;
        
        $coupon = Coupon::where('code', $code)->first();
        
        if (!$coupon) {
            return response()->json([
                'success' => false,
                'message' => 'Invalid coupon code'
            ], 404);
        }
        
        // Check if coupon is valid
        $now = now();
        
        if ($coupon->valid_from && $coupon->valid_from > $now) {
            return response()->json([
                'success' => false,
                'message' => 'Coupon is not yet active'
            ], 400);
        }
        
        if ($coupon->valid_until && $coupon->valid_until < $now) {
            return response()->json([
                'success' => false,
                'message' => 'Coupon has expired'
            ], 400);
        }
        
        // Check minimum purchase amount
        if ($coupon->min_purchase && $amount < $coupon->min_purchase) {
            return response()->json([
                'success' => false,
                'message' => 'Minimum purchase amount not met',
                'min_purchase' => $coupon->min_purchase
            ], 400);
        }
        
        // Calculate discount
        $discount = 0;
        
        if ($coupon->type === 'percentage') {
            $discount = ($amount * $coupon->value) / 100;
            
            // Apply maximum discount if set
            if ($coupon->max_discount && $discount > $coupon->max_discount) {
                $discount = $coupon->max_discount;
            }
        } else { // fixed amount
            $discount = $coupon->value;
            
            // Discount cannot be more than the amount
            if ($discount > $amount) {
                $discount = $amount;
            }
        }
        
        $finalAmount = $amount - $discount;
        
        return response()->json([
            'success' => true,
            'data' => [
                'coupon' => $coupon,
                'original_amount' => $amount,
                'discount' => $discount,
                'final_amount' => $finalAmount
            ]
        ]);
    }
    
    /**
     * Generate multiple coupon codes
     */
    public function generateCoupons(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'count' => 'required|integer|min:1|max:100',
            'prefix' => 'nullable|string|max:10',
            'type' => 'required|string|in:percentage,fixed',
            'value' => 'required|numeric|min:0',
            'description' => 'nullable|string',
            'min_purchase' => 'nullable|numeric|min:0',
            'max_discount' => 'nullable|numeric|min:0',
            'usage_limit' => 'nullable|integer|min:1',
            'valid_from' => 'nullable|date',
            'valid_until' => 'nullable|date|after_or_equal:valid_from',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors' => $validator->errors()
            ], 422);
        }

        $count = $request->count;
        $prefix = $request->prefix ?? '';
        $coupons = [];
        
        for ($i = 0; $i < $count; $i++) {
            $code = $prefix . strtoupper(Str::random(8));
            
            // Ensure code is unique
            while (Coupon::where('code', $code)->exists()) {
                $code = $prefix . strtoupper(Str::random(8));
            }
            
            $coupon = Coupon::create([
                'code' => $code,
                'type' => $request->type,
                'value' => $request->value,
                'description' => $request->description,
                'min_purchase' => $request->min_purchase,
                'max_discount' => $request->max_discount,
                'usage_limit' => $request->usage_limit,
                'valid_from' => $request->valid_from,
                'valid_until' => $request->valid_until,
            ]);
            
            $coupons[] = $coupon;
        }
        
        return response()->json([
            'success' => true,
            'message' => $count . ' coupons generated successfully',
            'data' => $coupons
        ], 201);
    }
}
