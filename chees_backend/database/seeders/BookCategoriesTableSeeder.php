<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class BookCategoriesTableSeeder extends Seeder
{
    public function run()
    {
        $categories = [
            [
                'name' => 'Cheese History',
                'description' => 'Books about the origins and evolution of cheese',
                'parent_id' => null,
            ],
            [
                'name' => 'Cheese Making',
                'description' => 'Guides and manuals for cheese production',
                'parent_id' => null,
            ],
            [
                'name' => 'French Cheeses',
                'description' => 'Books focusing on French cheese varieties',
                'parent_id' => 1,
            ],
            [
                'name' => 'Italian Cheeses',
                'description' => 'Books focusing on Italian cheese varieties',
                'parent_id' => 1,
            ],
            [
                'name' => 'Home Cheese Making',
                'description' => 'Books for amateur cheese makers',
                'parent_id' => 2,
            ],
            [
                'name' => 'Professional Cheese Making',
                'description' => 'Advanced cheese production techniques',
                'parent_id' => 2,
            ],
        ];

        DB::table('book_categories')->insert($categories);
    }
}