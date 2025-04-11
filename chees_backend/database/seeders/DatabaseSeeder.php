<?php

namespace Database\Seeders;

use EventSeeder;

use Database\Seeders\EventTypeSeeder;
use Database\Seeders\EventsTableSeeder;
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
        ]);
        // User::factory(10)->create();

    }
}
