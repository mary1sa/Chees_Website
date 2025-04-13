<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class BookRatingsTableSeeder extends Seeder
{
    public function run()
    {
        // Make sure you have users in your database first
        $ratings = [
            [
                'book_id' => 1,
                'user_id' => 1,
                'rating' => 5,
                'review' => 'Absolutely magical! The start of an incredible journey.',
            ],
            [
                'book_id' => 1,
                'user_id' => 2,
                'rating' => 4,
                'review' => 'Great introduction to the wizarding world.',
            ],
            [
                'book_id' => 2,
                'user_id' => 1,
                'rating' => 5,
                'review' => 'Complex characters and intricate plot. Amazing!',
            ],
            [
                'book_id' => 3,
                'user_id' => 3,
                'rating' => 5,
                'review' => 'Changed how I see human history. Mind-blowing.',
            ],
            [
                'book_id' => 4,
                'user_id' => 2,
                'rating' => 4,
                'review' => 'Classic King. Haunting and unforgettable.',
            ],
        ];

        DB::table('book_ratings')->insert($ratings);
    }
}