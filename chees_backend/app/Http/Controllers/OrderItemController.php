<?php

namespace App\Http\Controllers;

use App\Models\OrderItem;
use Illuminate\Http\Request;

class OrderItemController extends Controller
{
    // public function __construct()
    // {
    //     $this->middleware('auth:api');
    // }
    // In OrderItemController.php
        public function index(Request $request)
        {
            $orderItems = OrderItem::with(['book', 'order'])
                ->when($request->has('range'), function($query) use ($request) {
                    $range = $request->input('range');
                    $endDate = now();
                    $startDate = match($range) {
                        'week' => $endDate->copy()->subWeek(),
                        'month' => $endDate->copy()->subMonth(),
                        'quarter' => $endDate->copy()->subQuarter(),
                        'year' => $endDate->copy()->subYear(),
                        default => $endDate->copy()->subMonth(),
                    };
                    return $query->whereBetween('created_at', [$startDate, $endDate]);
                })
                ->get();

            return response()->json($orderItems);
        }

    public function show(OrderItem $orderItem)
    {
        $this->authorize('view', $orderItem->order);
        
        return response()->json($orderItem->load('book'));
    }
}