<?php

namespace App\Http\Controllers;

use App\Models\Order;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class OrderController extends Controller
{
    public function __construct()
    {
        $this->middleware('auth:api');
    }

    public function index()
    {
        $orders = Auth::user()->orders()->with('items.book')->latest()->paginate(10);
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

        // Create order
        $order = Auth::user()->orders()->create([
            'order_number' => 'ORD-' . strtoupper(uniqid()),
            'total_amount' => $totalAmount,
            'shipping_address' => $validated['shipping_address'],
            'billing_address' => $validated['billing_address'],
            'payment_method' => $validated['payment_method'],
            'notes' => $validated['notes'] ?? null
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
        $this->authorize('view', $order);
        
        return response()->json($order->load('items.book'));
    }

    public function updateStatus(Request $request, Order $order)
    {
        $this->authorize('update', $order);

        $validated = $request->validate([
            'status' => 'required|in:pending,processing,shipped,delivered,cancelled'
        ]);

        $order->update(['status' => $validated['status']]);
        return response()->json($order);
    }
}