<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class OrdersTableSeeder extends Seeder
{
    public function run()
    {
        $orders = [
            [
                'user_id' => 1,
                'order_number' => 'ORD-' . time(),
                'status' => 'completed',
                'total_amount' => 28.98,
                'shipping_fee' => 5.00,
                'tax' => 2.50,
                'discount' => 0.00,
                'payment_method' => 'credit_card',
                'payment_status' => 'paid',
                'transaction_id' => 'TXN' . uniqid(),
                'shipping_address' => '123 Main St, Anytown, USA',
                'billing_address' => '123 Main St, Anytown, USA',
                'notes' => 'Gift wrapping requested',
                'shipping_tracking_number' => 'UPS' . mt_rand(1000000, 9999999),
                'shipping_carrier' => 'UPS',
            ],
            [
                'user_id' => 2,
                'order_number' => 'ORD-' . (time() + 1),
                'status' => 'processing',
                'total_amount' => 15.99,
                'shipping_fee' => 3.50,
                'tax' => 1.20,
                'discount' => 0.00,
                'payment_method' => 'paypal',
                'payment_status' => 'pending',
                'transaction_id' => 'TXN' . uniqid(),
                'shipping_address' => '456 Oak Ave, Somewhere, USA',
                'billing_address' => '456 Oak Ave, Somewhere, USA',
                'notes' => null,
                'shipping_tracking_number' => null,
                'shipping_carrier' => null,
            ],
        ];

        DB::table('orders')->insert($orders);
    }
}