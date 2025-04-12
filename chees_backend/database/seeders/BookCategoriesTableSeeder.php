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
                'name' => 'Fiction',
                'description' => 'Novels and stories about imaginary people and events',
                'parent_id' => null,
            ],
            [
                'name' => 'Science Fiction',
                'description' => 'Fiction dealing with futuristic concepts',
                'parent_id' => 1,
            ],
            [
                'name' => 'Fantasy',
                'description' => 'Fiction with magic or supernatural elements',
                'parent_id' => 1,
            ],
            [
                'name' => 'Non-Fiction',
                'description' => 'Books based on facts and real events',
                'parent_id' => null,
            ],
            [
                'name' => 'Biography',
                'description' => 'Accounts of people\'s lives',
                'parent_id' => 4,
            ],
            [
                'name' => 'Technology',
                'description' => 'Books about computers and technology',
                'parent_id' => 4,
            ],
        ];

        DB::table('book_categories')->insert($categories);
    }
}