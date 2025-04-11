<?php

namespace Database\Seeders;

use Carbon\Carbon;
use App\Models\TournamentRound;
use Illuminate\Database\Seeder;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;

class TournamentRoundsTableSeeder extends Seeder
{
    public function run()
    {
        $rounds = [
            // Rounds for Event 1 (6 rounds)
            [
                'event_id' => 1,
                'round_number' => 1,
                'start_datetime' => Carbon::parse('2023-06-15 10:00:00'),
                'end_datetime' => Carbon::parse('2023-06-15 14:00:00'),
                'status' => 'completed',
            ],
            [
                'event_id' => 1,
                'round_number' => 2,
                'start_datetime' => Carbon::parse('2023-06-15 16:00:00'),
                'end_datetime' => Carbon::parse('2023-06-15 20:00:00'),
                'status' => 'completed',
            ],
            [
                'event_id' => 1,
                'round_number' => 3,
                'start_datetime' => Carbon::parse('2023-06-16 10:00:00'),
                'end_datetime' => Carbon::parse('2023-06-16 14:00:00'),
                'status' => 'completed',
            ],
            [
                'event_id' => 1,
                'round_number' => 4,
                'start_datetime' => Carbon::parse('2023-06-16 16:00:00'),
                'end_datetime' => Carbon::parse('2023-06-16 20:00:00'),
                'status' => 'completed',
            ],
            [
                'event_id' => 1,
                'round_number' => 5,
                'start_datetime' => Carbon::parse('2023-06-17 10:00:00'),
                'end_datetime' => Carbon::parse('2023-06-17 14:00:00'),
                'status' => 'completed',
            ],
            [
                'event_id' => 1,
                'round_number' => 6,
                'start_datetime' => Carbon::parse('2023-06-17 16:00:00'),
                'end_datetime' => Carbon::parse('2023-06-17 20:00:00'),
                'status' => 'completed',
            ],

            // Rounds for Event 2 (5 rounds)
            [
                'event_id' => 2,
                'round_number' => 1,
                'start_datetime' => Carbon::parse('2023-07-08 09:30:00'),
                'end_datetime' => Carbon::parse('2023-07-08 11:30:00'),
                'status' => 'completed',
            ],
            [
                'event_id' => 2,
                'round_number' => 2,
                'start_datetime' => Carbon::parse('2023-07-08 12:30:00'),
                'end_datetime' => Carbon::parse('2023-07-08 14:30:00'),
                'status' => 'completed',
            ],
            [
                'event_id' => 2,
                'round_number' => 3,
                'start_datetime' => Carbon::parse('2023-07-08 15:30:00'),
                'end_datetime' => Carbon::parse('2023-07-08 17:30:00'),
                'status' => 'completed',
            ],
            [
                'event_id' => 2,
                'round_number' => 4,
                'start_datetime' => Carbon::parse('2023-07-09 09:30:00'),
                'end_datetime' => Carbon::parse('2023-07-09 11:30:00'),
                'status' => 'completed',
            ],
            [
                'event_id' => 2,
                'round_number' => 5,
                'start_datetime' => Carbon::parse('2023-07-09 12:30:00'),
                'end_datetime' => Carbon::parse('2023-07-09 14:30:00'),
                'status' => 'completed',
            ],

            // Rounds for Event 3 (1 round)
            [
                'event_id' => 3,
                'round_number' => 1,
                'start_datetime' => Carbon::parse('2023-05-19 19:00:00'),
                'end_datetime' => Carbon::parse('2023-05-19 22:00:00'),
                'status' => 'completed',
            ],

            // Rounds for Event 4 (4 rounds)
            [
                'event_id' => 4,
                'round_number' => 1,
                'start_datetime' => Carbon::parse('2023-08-12 11:00:00'),
                'end_datetime' => Carbon::parse('2023-08-12 13:00:00'),
                'status' => 'scheduled',
            ],
            [
                'event_id' => 4,
                'round_number' => 2,
                'start_datetime' => Carbon::parse('2023-08-12 14:00:00'),
                'end_datetime' => Carbon::parse('2023-08-12 16:00:00'),
                'status' => 'scheduled',
            ],
            [
                'event_id' => 4,
                'round_number' => 3,
                'start_datetime' => Carbon::parse('2023-08-13 11:00:00'),
                'end_datetime' => Carbon::parse('2023-08-13 13:00:00'),
                'status' => 'scheduled',
            ],
            [
                'event_id' => 4,
                'round_number' => 4,
                'start_datetime' => Carbon::parse('2023-08-13 14:00:00'),
                'end_datetime' => Carbon::parse('2023-08-13 16:00:00'),
                'status' => 'scheduled',
            ],
        ];

        foreach ($rounds as $round) {
            TournamentRound::create($round);
        }
    }
}
