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
                'title' => 'The World Encyclopedia of Cheese',
                'category_id' => 1, // Cheese History
                'author_id' => 3, // Juliet Harbutt
                'isbn' => '9780754830188',
                'description' => 'Comprehensive guide to global cheese varieties',
                'cover_image' => 'cheese_encyclopedia.jpg',
                'price' => 29.99,
                'sale_price' => 24.99,
                'stock' => 50,
                'pages' => 256,
                'publisher' => 'Lorenz Books',
                'publication_date' => '2018-09-15',
                'language' => 'English',
                'format' => 'Hardcover',
                'weight' => 1.2,
                'dimensions' => '23x18x3 cm',
                'is_featured' => true,
                'is_active' => true,
            ],
            [
                'title' => 'The Art of Natural Cheesemaking',
                'category_id' => 5, // Home Cheese Making
                'author_id' => 2, // David Asher
                'isbn' => '9781603585782',
                'description' => 'Guide to traditional, non-industrial cheese making',
                'cover_image' => 'natural_cheesemaking.jpg',
                'price' => 22.95,
                'sale_price' => null,
                'stock' => 30,
                'pages' => 320,
                'publisher' => 'Chelsea Green Publishing',
                'publication_date' => '2015-05-01',
                'language' => 'English',
                'format' => 'Paperback',
                'weight' => 0.8,
                'dimensions' => '23x18x2 cm',
                'is_featured' => true,
                'is_active' => true,
            ],
            [
                'title' => 'French Cheeses: The Visual Guide',
                'category_id' => 3, // French Cheeses
                'author_id' => 1, // Patricia Michelson
                'isbn' => '9781845338443',
                'description' => 'Illustrated guide to over 350 French cheeses',
                'cover_image' => 'french_cheeses.jpg',
                'price' => 19.99,
                'sale_price' => 16.99,
                'stock' => 25,
                'pages' => 224,
                'publisher' => 'Dorling Kindersley',
                'publication_date' => '2014-10-01',
                'language' => 'English',
                'format' => 'Paperback',
                'weight' => 0.6,
                'dimensions' => '21x15x2 cm',
                'is_featured' => false,
                'is_active' => true,
            ],
            [
                'title' => 'Mastering Cheese: Lessons for Connoisseurship',
                'category_id' => 6, // Professional Cheese Making
                'author_id' => 4, // Max McCalman
                'isbn' => '9780307406124',
                'description' => 'Advanced guide to cheese appreciation and pairing',
                'cover_image' => 'covers/mastering_cheese.jpg',
                'price' => 35.00,
                'sale_price' => null,
                'stock' => 40,
                'pages' => 384,
                'publisher' => 'Clarkson Potter',
                'publication_date' => '2009-11-03',
                'language' => 'English',
                'format' => 'Hardcover',
                'weight' => 1.1,
                'dimensions' => '24x16x3 cm',
                'is_featured' => false,
                'is_active' => true,
            ],
            [
                'title' => 'Home Cheese Making in Australia',
                'category_id' => 5, // Home Cheese Making
                'author_id' => 5, // Gavin Webber
                'isbn' => '9780648668603',
                'description' => 'Practical guide to making cheese at home',
                'cover_image' => 'australian_cheese.jpg',
                'price' => 27.50,
                'sale_price' => 22.99,
                'stock' => 20,
                'pages' => 180,
                'publisher' => 'Cheese Making Press',
                'publication_date' => '2019-03-15',
                'language' => 'English',
                'format' => 'Paperback',
                'weight' => 0.5,
                'dimensions' => '21x15x1 cm',
                'is_featured' => true,
                'is_active' => true,
            ],
        ];

        DB::table('books')->insert($books);
    }
}