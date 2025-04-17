<?php

namespace Database\Seeders;

use App\Models\CourseLevel;
use Illuminate\Database\Seeder;

class CourseLevelSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $levels = [
            [
                'name' => 'Beginner',
                'min_rating' => 0,
                'max_rating' => 1200,
                'description' => 'For those just starting to learn chess.',
            ],
            [
                'name' => 'Intermediate',
                'min_rating' => 1201,
                'max_rating' => 1600,
                'description' => 'For players with some experience who understand basic tactics and strategies.',
            ],
            [
                'name' => 'Advanced',
                'min_rating' => 1601,
                'max_rating' => 1900,
                'description' => 'For experienced players looking to enhance their skills and knowledge.',
            ],
            [
                'name' => 'Expert',
                'min_rating' => 1901,
                'max_rating' => 2200,
                'description' => 'For highly skilled players wanting to master advanced concepts.',
            ],
            [
                'name' => 'Master',
                'min_rating' => 2201,
                'max_rating' => null, // No upper limit for masters
                'description' => 'For tournament-level players looking for professional-grade training.',
            ],
        ];

        foreach ($levels as $level) {
            CourseLevel::updateOrCreate(
                ['name' => $level['name']], // Look for existing level with this name
                $level // Update with these values or create if not found
            );
        }
    }
}
