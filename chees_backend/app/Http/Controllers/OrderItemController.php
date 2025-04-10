<?php

namespace App\Http\Controllers;

use App\Models\OrderItem;
use Illuminate\Http\Request;

class OrderItemController extends Controller
{
    public function __construct()
    {
        $this->middleware('auth:api');
    }

    public function show(OrderItem $orderItem)
    {
        $this->authorize('view', $orderItem->order);
        
        return response()->json($orderItem->load('book'));
    }
}