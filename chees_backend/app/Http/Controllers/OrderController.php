<?php

namespace App\Http\Controllers;

use App\Models\Book;
use App\Models\Order;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Gate;

class OrderController extends Controller
{

    public function index()
    {
        $orders = Order::with(['user','items'])->get();
        return response()->json($orders);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'items' => 'required|array|min:1',
            'items.*.book_id' => 'required|exists:books,id',
            'items.*.quantity' => 'required|integer|min:1',
            'shipping_address' => 'required|string',
            'billing_address' => 'required|string',
            'payment_method' => 'required|string',
            'notes' => 'nullable|string'
        ]);
    
        // Calculate totals and validate stock
        $totalAmount = 0;
        $items = [];
    
        foreach ($validated['items'] as $item) {
            $book = Book::findOrFail($item['book_id']);
            
            if ($book->stock < $item['quantity']) {
                return response()->json([
                    'message' => "Not enough stock for book: {$book->title}",
                    'book_id' => $book->id
                ], 422);
            }
    
            $price = $book->sale_price ?? $book->price;
            $items[] = [
                'book_id' => $book->id,
                'quantity' => $item['quantity'],
                'price' => $price
            ];
    
            $totalAmount += $price * $item['quantity'];
        }
    
        // Generate unique identifiers
        $transactionId = 'TXN-' . strtoupper(uniqid());
        $trackingNumber = 'TRK-' . strtoupper(substr(md5(uniqid()), 0, 10));
        
        // Ensure uniqueness
        while (Order::where('transaction_id', $transactionId)->exists()) {
            $transactionId = 'TXN-' . strtoupper(uniqid());
        }
        
        while (Order::where('shipping_tracking_number', $trackingNumber)->exists()) {
            $trackingNumber = 'TRK-' . strtoupper(substr(md5(uniqid()), 0, 10));
        }
    
        // Create order
        $order = Auth::user()->orders()->create([
            'order_number' => 'ORD-' . strtoupper(uniqid()),
            'transaction_id' => $transactionId,
            'shipping_tracking_number' => $trackingNumber,
            'total_amount' => $totalAmount,
            'shipping_address' => $validated['shipping_address'],
            'billing_address' => $validated['billing_address'],
            'payment_method' => $validated['payment_method'],
            'notes' => $validated['notes'] ?? null,
            'status' => 'pending' // Default status
        ]);
    
        // Add order items
        $order->items()->createMany($items);
    
        // Update book stock
        foreach ($validated['items'] as $item) {
            Book::where('id', $item['book_id'])->decrement('stock', $item['quantity']);
        }
    
        return response()->json($order->load('items.book'), 201);
    }

    public function show(Order $order)
    {
        // Check if user can view the order
        if (Gate::denies('view-order', $order)) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }
        
        return response()->json($order->load('items.book'));
    }

    public function updateStatus(Order $order, Request $request)
    {
        $request->validate([
            'status' => 'required|in:pending,processing,shipped,completed,cancelled'
        ]);

        $order->update(['status' => $request->status]);
        
        return response()->json($order);
    }

    public function destroy(Order $order)
    {
        // Check if user can delete the order
        if (Gate::denies('delete-order', $order)) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        try {
            // Restore stock for each item
            foreach ($order->items as $item) {
                Book::where('id', $item->book_id)->increment('stock', $item->quantity);
            }

            // Delete the order
            $order->delete();

            return response()->json(null, 204);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Failed to delete order',
                'error' => $e->getMessage()
            ], 500);
        }
    }
    public function userOrders(Request $request)
    {
        // Get authenticated user's orders with relationships
        $orders = $request->user()->orders()
            ->with(['items.book']) // Eager load items and their associated books
            ->latest() // Order by most recent first
            ->get();
    
        return response()->json($orders);
    }

    
}