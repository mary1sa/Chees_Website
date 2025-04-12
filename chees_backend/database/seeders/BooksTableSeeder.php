<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class BooksTableSeeder extends Seeder
{
    public function run()
    {
        $books = [
            [
                'title' => 'Harry Potter and the Philosopher\'s Stone',
                'category_id' => 3, // Fantasy
                'author_id' => 1, // J.K. Rowling
                'isbn' => '9780747532743',
                'description' => 'The first novel in the Harry Potter series',
                'cover_image' => 'covers/harry_potter_1.jpg',
                'price' => 12.99,
                'sale_price' => 9.99,
                'stock' => 50,
                'pages' => 223,
                'publisher' => 'Bloomsbury',
                'publication_date' => '1997-06-26',
                'language' => 'English',
                'format' => 'Paperback',
                'weight' => 0.35,
                'dimensions' => '20x13x2 cm',
                'is_featured' => true,
                'is_active' => true,
            ],
            [
                'title' => 'A Game of Thrones',
                'category_id' => 2, // Science Fiction
                'author_id' => 2, // George R.R. Martin
                'isbn' => '9780553103540',
                'description' => 'First book in A Song of Ice and Fire series',
                'cover_image' => 'covers/game_of_thrones.jpg',
                'price' => 15.99,
                'sale_price' => null,
                'stock' => 30,
                'pages' => 694,
                'publisher' => 'Bantam Books',
                'publication_date' => '1996-08-01',
                'language' => 'English',
                'format' => 'Hardcover',
                'weight' => 0.95,
                'dimensions' => '24x16x4 cm',
                'is_featured' => true,
                'is_active' => true,
            ],
            [
                'title' => 'Sapiens: A Brief History of Humankind',
                'category_id' => 4, // Non-Fiction
                'author_id' => 4, // Yuval Noah Harari
                'isbn' => '9780062316097',
                'description' => 'Exploration of the history of humankind',
                'cover_image' => 'covers/sapiens.jpg',
                'price' => 18.50,
                'sale_price' => 15.99,
                'stock' => 25,
                'pages' => 443,
                'publisher' => 'Harper',
                'publication_date' => '2015-02-10',
                'language' => 'English',
                'format' => 'Paperback',
                'weight' => 0.45,
                'dimensions' => '20x13x3 cm',
                'is_featured' => false,
                'is_active' => true,
            ],
            [
                'title' => 'The Shining',
                'category_id' => 1, // Fiction
                'author_id' => 3, // Stephen King
                'isbn' => '9780307743657',
                'description' => 'Horror novel about a haunted hotel',
                'cover_image' => 'covers/the_shining.jpg',
                'price' => 14.99,
                'sale_price' => null,
                'stock' => 40,
                'pages' => 447,
                'publisher' => 'Doubleday',
                'publication_date' => '1977-01-28',
                'language' => 'English',
                'format' => 'Paperback',
                'weight' => 0.40,
                'dimensions' => '21x14x3 cm',
                'is_featured' => false,
                'is_active' => true,
            ],
        ];

        DB::table('books')->insert($books);
    }
}