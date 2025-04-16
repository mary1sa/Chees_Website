<?php

namespace Database\Seeders;

use EventSeeder;
use Illuminate\Database\Seeder;
use Database\Seeders\UserSeeder;
use Illuminate\Foundation\Auth\User;
use Database\Seeders\EventTypeSeeder;
use Database\Seeders\BooksTableSeeder;
use Database\Seeders\EventsTableSeeder;
use Database\Seeders\OrdersTableSeeder;
use Database\Seeders\AuthorsTableSeeder;
use Database\Seeders\OrderItemsTableSeeder;
use Database\Seeders\BookRatingsTableSeeder;
use Database\Seeders\BookCategoriesTableSeeder;
use Database\Seeders\TournamentRoundsTableSeeder;
use Database\Seeders\TournamentMatchesTableSeeder;
use Database\Seeders\EventRegistrationsTableSeeder;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        $this->call([
            UserSeeder::class,
            EventTypeSeeder::class,
            EventsTableSeeder::class,
            EventRegistrationsTableSeeder::class,
            TournamentRoundsTableSeeder::class,
            TournamentMatchesTableSeeder::class,
            BookCategoriesTableSeeder::class,
            AuthorsTableSeeder::class,
            BooksTableSeeder::class,
            BookRatingsTableSeeder::class,
            OrdersTableSeeder::class,
            OrderItemsTableSeeder::class,
        ]);
        // User::factory(10)->create();

    }
}
