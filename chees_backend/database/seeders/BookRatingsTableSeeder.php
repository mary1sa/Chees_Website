<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class BookRatingsTableSeeder extends Seeder
{
    public function run()
    {
        $ratings = [
            [
                'book_id' => 1,
                'user_id' => 1,
                'rating' => 5,
                'review' => 'The ultimate cheese reference book! Covers every cheese imaginable.',
            ],
            [
                'book_id' => 1,
                'user_id' => 2,
                'rating' => 4,
                'review' => 'Excellent encyclopedia, though could use more photos.',
            ],
            [
                'book_id' => 2,
                'user_id' => 1,
                'rating' => 5,
                'review' => 'Changed how I make cheese at home. Revolutionary approach!',
            ],
            [
                'book_id' => 3,
                'user_id' => 3,
                'rating' => 5,
                'review' => 'Perfect companion for my cheese tour through France.',
            ],
            [
                'book_id' => 4,
                'user_id' => 2,
                'rating' => 4,
                'review' => 'Advanced techniques explained clearly. Great for professionals.',
            ],
            [
                'book_id' => 5,
                'user_id' => 4,
                'rating' => 5,
                'review' => 'Gavin Webber makes cheese making accessible to everyone!',
            ],
        ];

        DB::table('book_ratings')->insert($ratings);
    }
}