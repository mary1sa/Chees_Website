<?php

namespace Database\Seeders;

use App\Models\Event;
use Illuminate\Support\Carbon;
use Illuminate\Database\Seeder;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;

class EventsTableSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run()
    {
        $events = [
            [
                'type_id' => 1,
                'title' => 'International Chess Open 2023',
                'description' => 'Annual international chess open tournament with FIDE rating',
                'start_date' => Carbon::parse('2023-06-15'),
                'end_date' => Carbon::parse('2023-06-20'),
                'start_time' => '10:00:00',
                'end_time' => '18:00:00',
                'venue' => 'Grand Hotel',
                'address' => '123 Main Street',
                'city' => 'New York',
                'region' => 'NY',
                'country' => 'USA',
                'postal_code' => '10001',
                'latitude' => 40.712776,
                'longitude' => -74.005974,
                'max_participants' => 100,
                'registration_fee' => 50.00,
                'registration_deadline' => Carbon::parse('2023-06-10'),
                'prize_pool' => 5000.00,
                'is_featured' => true,
            ],
            [
                'type_id' => 2,
                'title' => 'City Rapid Championship',
                'description' => 'Annual city rapid chess championship',
                'start_date' => Carbon::parse('2023-07-08'),
                'end_date' => Carbon::parse('2023-07-09'),
                'start_time' => '09:30:00',
                'end_time' => '17:00:00',
                'venue' => 'Community Center',
                'address' => '456 Elm Street',
                'city' => 'Boston',
                'region' => 'MA',
                'country' => 'USA',
                'postal_code' => '02108',
                'latitude' => 42.360081,
                'longitude' => -71.058884,
                'max_participants' => 50,
                'registration_fee' => 25.00,
                'registration_deadline' => Carbon::parse('2023-07-05'),
                'prize_pool' => 1000.00,
            ],
            [
                'type_id' => 3,
                'title' => 'Friday Night Blitz',
                'description' => 'Weekly blitz chess tournament',
                'start_date' => Carbon::parse('2023-05-19'),
                'end_date' => Carbon::parse('2023-05-19'),
                'start_time' => '19:00:00',
                'end_time' => '22:00:00',
                'venue' => 'Chess Club',
                'address' => '789 Oak Avenue',
                'city' => 'Chicago',
                'region' => 'IL',
                'country' => 'USA',
                'postal_code' => '60601',
                'latitude' => 41.878113,
                'longitude' => -87.629799,
                'max_participants' => 30,
                'registration_fee' => 10.00,
                'registration_deadline' => Carbon::parse('2023-05-18'),
                'prize_pool' => 300.00,
            ],
            [
                'type_id' => 4,
                'title' => 'Chess960 Summer Open',
                'description' => 'Summer Fischer Random chess tournament',
                'start_date' => Carbon::parse('2023-08-12'),
                'end_date' => Carbon::parse('2023-08-13'),
                'start_time' => '11:00:00',
                'end_time' => '19:00:00',
                'venue' => 'University Hall',
                'address' => '101 College Road',
                'city' => 'San Francisco',
                'region' => 'CA',
                'country' => 'USA',
                'postal_code' => '94103',
                'latitude' => 37.774929,
                'longitude' => -122.419418,
                'max_participants' => 40,
                'registration_fee' => 20.00,
                'registration_deadline' => Carbon::parse('2023-08-10'),
                'prize_pool' => 800.00,
            ],
            [
                'type_id' => 5,
                'title' => 'National Team Championship',
                'description' => 'Annual team chess competition',
                'start_date' => Carbon::parse('2023-09-23'),
                'end_date' => Carbon::parse('2023-09-25'),
                'start_time' => '09:00:00',
                'end_time' => '18:00:00',
                'venue' => 'Convention Center',
                'address' => '202 Convention Blvd',
                'city' => 'Las Vegas',
                'region' => 'NV',
                'country' => 'USA',
                'postal_code' => '89109',
                'latitude' => 36.114646,
                'longitude' => -115.172813,
                'max_participants' => 20,
                'registration_fee' => 100.00,
                'registration_deadline' => Carbon::parse('2023-09-15'),
                'prize_pool' => 10000.00,
                'is_featured' => true,
            ],
            [
                'type_id' => 6,
                'title' => 'Online Chess Grand Prix',
                'description' => 'Monthly online chess tournament series',
                'start_date' => Carbon::parse('2023-06-01'),
                'end_date' => Carbon::parse('2023-06-30'),
                'start_time' => '12:00:00',
                'end_time' => '23:59:59',
                'max_participants' => 200,
                'registration_fee' => 15.00,
                'registration_deadline' => Carbon::parse('2023-05-31'),
                'prize_pool' => 2000.00,
            ],
        ];

        foreach ($events as $event) {
            Event::create($event);
        }
    }
}
