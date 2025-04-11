<?php

namespace Database\Seeders;

use App\Models\EventType;
use Illuminate\Database\Seeder;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;

class EventTypeSeeder extends Seeder
{
    public function run()
    {
        $types = [
            ['name' => 'Classical Tournament', 'description' => 'Traditional long time control chess tournament'],
            ['name' => 'Rapid Championship', 'description' => 'Fast-paced rapid chess competition'],
            ['name' => 'Blitz Championship', 'description' => 'Very fast blitz chess games'],
            ['name' => 'Chess960 Tournament', 'description' => 'Tournament with Fischer Random chess rules'],
            ['name' => 'Team Championship', 'description' => 'Team-based chess competition'],
            ['name' => 'Online Open', 'description' => 'Open online chess tournament'],
        ];

        foreach ($types as $type) {
            EventType::create($type);
        }
    }
}
