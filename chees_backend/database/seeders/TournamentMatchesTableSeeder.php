<?php

namespace Database\Seeders;

use Carbon\Carbon;
use App\Models\TournamentMatch;
use Illuminate\Database\Seeder;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;

class TournamentMatchesTableSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run()
    {
        $matches = [
            // Round 1 of Event 1
            [
                'round_id' => 1,
                'white_player_id' => 1,
                'black_player_id' => 2,
                'result' => '1-0',
                'start_datetime' => Carbon::parse('2023-06-15 10:00:00'),
                'end_datetime' => Carbon::parse('2023-06-15 12:30:00'),
                'table_number' => 1,
                'status' => 'completed',
            ],
            [
                'round_id' => 1,
                'white_player_id' => 3,
                'black_player_id' => 4,
                'result' => '0-1',
                'start_datetime' => Carbon::parse('2023-06-15 10:00:00'),
                'end_datetime' => Carbon::parse('2023-06-15 13:45:00'),
                'table_number' => 2,
                'status' => 'completed',
            ],
            [
                'round_id' => 1,
                'white_player_id' => 5,
                'black_player_id' => 6,
                'result' => '1/2-1/2',
                'start_datetime' => Carbon::parse('2023-06-15 10:00:00'),
                'end_datetime' => Carbon::parse('2023-06-15 14:00:00'),
                'table_number' => 3,
                'status' => 'completed',
            ],
            [
                'round_id' => 1,
                'white_player_id' => 7, // Member4
                'black_player_id' => 6, // Changed from 8 to 6 (Member3) which exists in the database
                'result' => '1-0',
                'start_datetime' => Carbon::parse('2023-06-15 10:00:00'),
                'end_datetime' => Carbon::parse('2023-06-15 11:45:00'),
                'table_number' => 4,
                'status' => 'completed',
            ],

            // Round 2 of Event 1
            [
                'round_id' => 2,
                'white_player_id' => 2,
                'black_player_id' => 1,
                'result' => '1/2-1/2',
                'start_datetime' => Carbon::parse('2023-06-15 16:00:00'),
                'end_datetime' => Carbon::parse('2023-06-15 18:30:00'),
                'table_number' => 1,
                'status' => 'completed',
            ],
            [
                'round_id' => 2,
                'white_player_id' => 4,
                'black_player_id' => 3,
                'result' => '1-0',
                'start_datetime' => Carbon::parse('2023-06-15 16:00:00'),
                'end_datetime' => Carbon::parse('2023-06-15 17:45:00'),
                'table_number' => 2,
                'status' => 'completed',
            ],
            [
                'round_id' => 2,
                'white_player_id' => 6,
                'black_player_id' => 5,
                'result' => '0-1',
                'start_datetime' => Carbon::parse('2023-06-15 16:00:00'),
                'end_datetime' => Carbon::parse('2023-06-15 19:30:00'),
                'table_number' => 3,
                'status' => 'completed',
            ],
            [
                'round_id' => 2,
                'white_player_id' => 5, // Changed from 8 to 5 (Member2) which exists in the database
                'black_player_id' => 7, // Member4
                'result' => '1/2-1/2',
                'start_datetime' => Carbon::parse('2023-06-15 16:00:00'),
                'end_datetime' => Carbon::parse('2023-06-15 20:00:00'),
                'table_number' => 4,
                'status' => 'completed',
            ],

            // Round 1 of Event 2
            [
                'round_id' => 7,
                'white_player_id' => 4,
                'black_player_id' => 5,
                'result' => '1-0',
                'start_datetime' => Carbon::parse('2023-07-08 09:30:00'),
                'end_datetime' => Carbon::parse('2023-07-08 10:45:00'),
                'table_number' => 1,
                'status' => 'completed',
            ],
            [
                'round_id' => 7,
                'white_player_id' => 6,
                'black_player_id' => 7,
                'result' => '0-1',
                'start_datetime' => Carbon::parse('2023-07-08 09:30:00'),
                'end_datetime' => Carbon::parse('2023-07-08 11:30:00'),
                'table_number' => 2,
                'status' => 'completed',
            ],

            // Round 1 of Event 3
            [
                'round_id' => 12,
                'white_player_id' => 6, // Member3
                'black_player_id' => 4, // Changed from 8 to 4 (Member1) which exists in the database
                'result' => '1-0',
                'start_datetime' => Carbon::parse('2023-05-19 19:00:00'),
                'end_datetime' => Carbon::parse('2023-05-19 19:45:00'),
                'table_number' => 1,
                'status' => 'completed',
            ],
            [
                'round_id' => 12,
                'white_player_id' => 1,
                'black_player_id' => 3,
                'result' => '0-1',
                'start_datetime' => Carbon::parse('2023-05-19 19:00:00'),
                'end_datetime' => Carbon::parse('2023-05-19 20:30:00'),
                'table_number' => 2,
                'status' => 'completed',
            ],

            // Round 1 of Event 4 (scheduled matches)
            [
                'round_id' => 13,
                'white_player_id' => 7, // Member4
                'black_player_id' => 3, // Changed from 8 to 3 (Coach2) which exists in the database
                'start_datetime' => Carbon::parse('2023-08-12 11:00:00'),
                'end_datetime' => Carbon::parse('2023-08-12 13:00:00'),
                'table_number' => 1,
                'status' => 'scheduled',
            ],
            [
                'round_id' => 13,
                'white_player_id' => 1,
                'black_player_id' => 2,
                'start_datetime' => Carbon::parse('2023-08-12 11:00:00'),
                'end_datetime' => Carbon::parse('2023-08-12 13:00:00'),
                'table_number' => 2,
                'status' => 'scheduled',
            ],
            [
                'round_id' => 13,
                'white_player_id' => 3,
                'black_player_id' => 4,
                'start_datetime' => Carbon::parse('2023-08-12 11:00:00'),
                'end_datetime' => Carbon::parse('2023-08-12 13:00:00'),
                'table_number' => 3,
                'status' => 'scheduled',
            ],
            [
                'round_id' => 13,
                'white_player_id' => 5,
                'black_player_id' => 6,
                'start_datetime' => Carbon::parse('2023-08-12 11:00:00'),
                'end_datetime' => Carbon::parse('2023-08-12 13:00:00'),
                'table_number' => 4,
                'status' => 'scheduled',
            ],
        ];

        foreach ($matches as $match) {
            // Use firstOrCreate to prevent duplicate entries
            TournamentMatch::firstOrCreate(
                [
                    'round_id' => $match['round_id'],
                    'white_player_id' => $match['white_player_id'],
                    'black_player_id' => $match['black_player_id'],
                    'table_number' => $match['table_number']
                ],
                $match
            );
        }
    }
}
