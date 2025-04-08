<?php

namespace App\Http\Controllers;

use App\Models\Payment;
use App\Models\Course;
use App\Models\Enrollment;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Str;

class PaymentController extends Controller
{
    /**
     * Display a listing of payments.
     */
    public function index(Request $request)
    {
        $userId = Auth::id();
        
        $query = Payment::where('user_id', $userId);
        
        // Filter by status if provided
        if ($request->has('status')) {
            $query->where('status', $request->status);
        }
        
        // Filter by date range
        if ($request->has('start_date') && $request->has('end_date')) {
            $query->whereBetween('payment_date', [$request->start_date, $request->end_date]);
        }
        
        $payments = $query->orderBy('payment_date', 'desc')->paginate(10);
        
        return response()->json([
            'success' => true,
            'data' => $payments
        ]);
    }

    /**
     * Process a new payment.
     */
    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'amount' => 'required|numeric|min:0',
            'payment_method' => 'required|string|max:70',
            'related_type' => 'required|string|max:50',
            'related_id' => 'required|integer|min:1',
            'description' => 'nullable|string',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors' => $validator->errors()
            ], 422);
        }

        $userId = Auth::id();
        
        // Generate a unique transaction ID
        $transactionId = Str::uuid()->toString();
        
        // Create payment record
        $payment = Payment::create([
            'user_id' => $userId,
            'amount' => $request->amount,
            'payment_method' => $request->payment_method,
            'transaction_id' => $transactionId,
            'status' => 'completed', // Assuming payment is successful
            'description' => $request->description,
            'payment_date' => now(),
            'related_id' => $request->related_id,
            'related_type' => $request->related_type,
        ]);
        
        // If payment is for a course, create enrollment
        if ($request->related_type === 'course') {
            $courseId = $request->related_id;
            
            // Check if already enrolled
            $existingEnrollment = Enrollment::where('user_id', $userId)
                ->where('course_id', $courseId)
                ->first();
                
            if (!$existingEnrollment) {
                Enrollment::create([
                    'user_id' => $userId,
                    'course_id' => $courseId,
                    'status' => 'active',
                    'progress' => 0,
                    'enrollment_date' => now()
                ]);
            }
        }

        return response()->json([
            'success' => true,
            'message' => 'Payment processed successfully',
            'data' => $payment
        ], 201);
    }

    /**
     * Display the specified payment.
     */
    public function show(string $id)
    {
        $userId = Auth::id();
        $payment = Payment::where('id', $id)
            ->where('user_id', $userId)
            ->firstOrFail();
            
        return response()->json([
            'success' => true,
            'data' => $payment
        ]);
    }

    /**
     * Update the specified payment.
     */
    public function update(Request $request, string $id)
    {
        $userId = Auth::id();
        $payment = Payment::where('id', $id)
            ->where('user_id', $userId)
            ->firstOrFail();

        $validator = Validator::make($request->all(), [
            'status' => 'sometimes|string|in:pending,completed,failed,refunded',
            'description' => 'sometimes|nullable|string',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors' => $validator->errors()
            ], 422);
        }

        // Only allow updating certain fields
        if ($request->has('status')) {
            $payment->status = $request->status;
        }
        
        if ($request->has('description')) {
            $payment->description = $request->description;
        }
        
        $payment->save();
        
        return response()->json([
            'success' => true,
            'message' => 'Payment updated successfully',
            'data' => $payment
        ]);
    }
    
    /**
     * Remove the specified payment.
     */
    public function destroy(string $id)
    {
        $userId = Auth::id();
        $payment = Payment::where('id', $id)
            ->where('user_id', $userId)
            ->firstOrFail();
            
        // Consider: in a real app, you might want to simply mark as deleted
        // or implement a soft delete, rather than actually deleting records
        
        $payment->delete();
        
        return response()->json([
            'success' => true,
            'message' => 'Payment record deleted successfully'
        ]);
    }
    
    /**
     * Get payment receipt.
     */
    public function getReceipt(string $id)
    {
        $userId = Auth::id();
        $payment = Payment::where('id', $id)
            ->where('user_id', $userId)
            ->firstOrFail();
            
        // In a real application, you would generate a PDF receipt here
        // For now, we'll just return the payment details
        
        return response()->json([
            'success' => true,
            'message' => 'Receipt generated',
            'data' => [
                'receipt_number' => 'REC-' . $payment->id,
                'transaction_id' => $payment->transaction_id,
                'date' => $payment->payment_date,
                'amount' => $payment->amount,
                'payment_method' => $payment->payment_method,
                'description' => $payment->description,
                'status' => $payment->status
            ]
        ]);
    }
    
    /**
     * Get payment history for current user
     */
    public function getPaymentHistory()
    {
        $userId = Auth::id();
        $payments = Payment::where('user_id', $userId)
            ->orderBy('payment_date', 'desc')
            ->get();
            
        return response()->json([
            'success' => true,
            'data' => $payments
        ]);
    }
    
    /**
     * Verify payment status
     */
    public function verifyPayment(string $transactionId)
    {
        $payment = Payment::where('transaction_id', $transactionId)->first();
        
        if (!$payment) {
            return response()->json([
                'success' => false,
                'message' => 'Payment not found'
            ], 404);
        }
        
        return response()->json([
            'success' => true,
            'data' => [
                'status' => $payment->status,
                'amount' => $payment->amount,
                'payment_date' => $payment->payment_date
            ]
        ]);
    }
}
