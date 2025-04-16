<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class OrderItemsTableSeeder extends Seeder
{
    public function run()
    {
        $orderItems = [
            [
                'order_id' => 1,
                'book_id' => 1,
                'quantity' => 2,
                'price' => 9.99,
            ],
            [
                'order_id' => 1,
                'book_id' => 3,
                'quantity' => 1,
                'price' => 15.99,
            ],
            [
                'order_id' => 2,
                'book_id' => 2,
                'quantity' => 1,
                'price' => 15.99,
            ],
        ];

        DB::table('order_items')->insert($orderItems);
    }
}