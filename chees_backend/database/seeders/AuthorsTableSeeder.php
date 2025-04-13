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
                'name' => 'J.K. Rowling',
                'bio' => 'British author best known for the Harry Potter series',
                'photo' => 'authors/jk_rowling.jpg',
            ],
            [
                'name' => 'George R.R. Martin',
                'bio' => 'American novelist known for A Song of Ice and Fire series',
                'photo' => 'authors/george_martin.jpg',
            ],
            [
                'name' => 'Stephen King',
                'bio' => 'American author of horror, supernatural fiction, suspense',
                'photo' => 'authors/stephen_king.jpg',
            ],
            [
                'name' => 'Yuval Noah Harari',
                'bio' => 'Israeli historian and professor',
                'photo' => 'authors/yuval_harari.jpg',
            ],
            [
                'name' => 'Walter Isaacson',
                'bio' => 'American writer and journalist',
                'photo' => 'authors/walter_isaacson.jpg',
            ],
        ];

        DB::table('authors')->insert($authors);
    }
}