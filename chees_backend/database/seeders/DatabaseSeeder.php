<?php

namespace Database\Seeders;

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
use Database\Seeders\CourseLevelSeeder;
use Database\Seeders\CourseSeeder;
use Database\Seeders\CourseSessionSeeder;
use Database\Seeders\CourseMaterialSeeder;
use Database\Seeders\PaymentSeeder;
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
            
            // Course-related seeders
            CourseLevelSeeder::class,
            CourseSeeder::class,
            CourseSessionSeeder::class,
            CourseMaterialSeeder::class,
            
            
            PaymentSeeder::class,
            
        ]);
        // User::factory(10)->create();

    }
}
