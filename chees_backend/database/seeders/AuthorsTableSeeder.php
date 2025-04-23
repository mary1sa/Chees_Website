<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class AuthorsTableSeeder extends Seeder
{
    public function run()
    {
        $authors = [
            [
                'name' => 'Patricia Michelson',
                'bio' => 'Founder of La Fromagerie and cheese expert',
                'photo' => 'patricia_michelson.jpg',
            ],
            [
                'name' => 'David Asher',
                'bio' => 'Organic farmer and cheese maker',
                'photo' => 'david_asher.jpg',
            ],
            [
                'name' => 'Juliet Harbutt',
                'bio' => 'World cheese expert and judge',
                'photo' => 'juliet_harbutt.jpg',
            ],
            [
                'name' => 'Max McCalman',
                'bio' => 'Dean of curriculum at Artisanal Premium Cheese',
                'photo' => 'max_mccalman.jpg',
            ],
            [
                'name' => 'Gavin Webber',
                'bio' => 'Award-winning home cheese maker',
                'photo' => 'gavin_webber.jpg',
            ],
        ];

        DB::table('authors')->insert($authors);
    }
}