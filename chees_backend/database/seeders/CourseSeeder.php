<?php

namespace Database\Seeders;

use App\Models\Course;
use App\Models\CourseLevel;
use App\Models\Role;
use App\Models\User;
use Illuminate\Database\Seeder;

class CourseSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Get all course levels
        $levels = CourseLevel::all();
        
        // Get users with coach role to assign as instructors
        $coaches = User::whereHas('role', function($query) {
            $query->where('name', 'coach');
        })->get();
        
        if ($coaches->isEmpty()) {
            // Create a coach if none exists
            $coachRole = Role::where('name', 'coach')->first();
            if ($coachRole) {
                $coach = User::factory()->create([
                    'name' => 'Coach Smith',
                    'email' => 'coach@example.com',
                    'role_id' => $coachRole->id
                ]);
                $coaches = collect([$coach]);
            }
        }

        $courses = [
            // Beginner Courses
            [
                'title' => 'Chess Fundamentals',
                'description' => 'Learn the basics of chess, from piece movement to fundamental tactics.',
                'level_id' => $levels->where('name', 'Beginner')->first()->id,
                'price' => 79.99,
                'duration' => 20, // 20 hours of content
                'max_students' => 30,
                'is_online' => true,
                'is_active' => true,
                'thumbnail' => 'courses/thumbnails/Chess-Fundamentals.jpg',
            ],
            [
                'title' => 'Basic Opening Principles',
                'description' => 'Master the essential opening principles that will set you up for success in every game.',
                'level_id' => $levels->where('name', 'Beginner')->first()->id,
                'price' => 59.99,
                'duration' => 15,
                'max_students' => 35,
                'is_online' => true,
                'is_active' => true,
                'thumbnail' => 'courses/thumbnails/basic-opening.webp',
            ],
            [
                'title' => 'Chess for Kids',
                'description' => 'A fun, engaging introduction to chess designed specifically for young players aged 7-12.',
                'level_id' => $levels->where('name', 'Beginner')->first()->id,
                'price' => 49.99,
                'duration' => 12,
                'max_students' => 40,
                'is_online' => true,
                'is_active' => true,
                'thumbnail' => 'courses/thumbnails/chess-kids.jpg',
            ],
            
            // Intermediate Courses
            [
                'title' => 'Intermediate Tactics',
                'description' => 'Deepen your understanding of chess tactics with intermediate concepts.',
                'level_id' => $levels->where('name', 'Intermediate')->first()->id,
                'price' => 99.99,
                'duration' => 30, // 30 hours of content
                'max_students' => 25,
                'is_online' => true,
                'is_active' => true,
                'thumbnail' => 'courses/thumbnails/intermediate-tactics.png',
            ],
            [
                'title' => 'Positional Chess Essentials',
                'description' => 'Learn to evaluate positions and make strategic decisions based on pawn structure and piece placement.',
                'level_id' => $levels->where('name', 'Intermediate')->first()->id,
                'price' => 89.99,
                'duration' => 25,
                'max_students' => 22,
                'is_online' => true,
                'is_active' => true,
                'thumbnail' => 'courses/thumbnails/positional-chess.jpg',
            ],
            [
                'title' => 'The Queen Gambit Masterclass',
                'description' => 'Comprehensive guide to playing the Queen Gambit Defense as Black, covering all major variations.',
                'level_id' => $levels->where('name', 'Intermediate')->first()->id,
                'price' => 109.99,
                'duration' => 35,
                'max_students' => 20,
                'is_online' => true,
                'is_active' => false, // Coming soon
                'thumbnail' => 'courses/thumbnails/queen-gambit-accepted.png',
            ],
            
            // Advanced Courses
            [
                'title' => 'Advanced Strategy',
                'description' => 'Master complex strategic elements for serious tournament players.',
                'level_id' => $levels->where('name', 'Advanced')->first()->id,
                'price' => 149.99,
                'duration' => 40, // 40 hours of content
                'max_students' => 20,
                'is_online' => true,
                'is_active' => true,
                'thumbnail' => 'courses/thumbnails/advanced-strategy.png',
            ],
            [
                'title' => 'Tournament Preparation Intensive',
                'description' => 'Comprehensive preparation for serious tournament players, covering openings, middlegame planning, and endgame technique.',
                'level_id' => $levels->where('name', 'Advanced')->first()->id,
                'price' => 179.99,
                'duration' => 45,
                'max_students' => 18,
                'is_online' => true,
                'is_active' => true,
                'thumbnail' => 'courses/thumbnails/tournament-prep.jpg',
            ],
            [
                'title' => 'Dynamic Sacrifices',
                'description' => 'Learn when and how to correctly sacrifice material for initiative, attack, or positional compensation.',
                'level_id' => $levels->where('name', 'Advanced')->first()->id,
                'price' => 139.99,
                'duration' => 32,
                'max_students' => 15,
                'is_online' => true,
                'is_active' => true,
                'thumbnail' => 'courses/thumbnails/dynamic-sacrifices.jpg',
            ],
            
            // Expert Courses
            [
                'title' => 'Grandmaster Openings',
                'description' => 'Study opening theory used by grandmasters in tournament play.',
                'level_id' => $levels->where('name', 'Expert')->first()->id,
                'price' => 199.99,
                'duration' => 50, // 50 hours of content
                'max_students' => 15,
                'is_online' => true,
                'is_active' => true,
                'thumbnail' => 'courses/thumbnails/grandmaster-openings.webp',
            ],
            [
                'title' => 'Calculation Training',
                'description' => 'Advanced calculation techniques used by top players to visualize positions many moves ahead.',
                'level_id' => $levels->where('name', 'Expert')->first()->id,
                'price' => 189.99,
                'duration' => 45,
                'max_students' => 12,
                'is_online' => true,
                'is_active' => true,
                'thumbnail' => 'courses/thumbnails/calculation.jpg',
            ],
            [
                'title' => 'Critical Middlegame Positions',
                'description' => 'Analysis of critical middlegame positions that frequently arise from popular openings.',
                'level_id' => $levels->where('name', 'Expert')->first()->id,
                'price' => 209.99,
                'duration' => 48,
                'max_students' => 10,
                'is_online' => false,
                'is_active' => true,
                'thumbnail' => 'courses/thumbnails/critical-middlegames.jpg',
            ],
            
            // Master Courses
            [
                'title' => 'Endgame Mastery',
                'description' => 'Comprehensive study of chess endgames for competitive players.',
                'level_id' => $levels->where('name', 'Master')->first()->id,
                'price' => 249.99,
                'duration' => 60, // 60 hours of content
                'max_students' => 10,
                'is_online' => false, // This one is in-person
                'is_active' => true,
                'thumbnail' => 'courses/thumbnails/endgame-mastery.webp',
            ],
            [
                'title' => 'Psychological Aspects of Competition',
                'description' => 'Mental training for top-level chess players, focusing on psychological resilience and competitive mindset.',
                'level_id' => $levels->where('name', 'Master')->first()->id,
                'price' => 229.99,
                'duration' => 55,
                'max_students' => 8,
                'is_online' => true,
                'is_active' => true,
                'thumbnail' => 'courses/thumbnails/psychology.jpg',
            ],
            [
                'title' => 'Computer Analysis Master Class',
                'description' => 'Learn to effectively use chess engines and databases to analyze positions and prepare for tournaments.',
                'level_id' => $levels->where('name', 'Master')->first()->id,
                'price' => 259.99,
                'duration' => 40,
                'max_students' => 12,
                'is_online' => true,
                'is_active' => false, // Coming soon
                'thumbnail' => 'courses/thumbnails/computer-analysis.jpg',
            ],
        ];

        // Create the course directory structure for assets
        $baseCoursePath = storage_path('app/public/courses');
        if (!file_exists($baseCoursePath)) {
            mkdir($baseCoursePath, 0755, true);
            mkdir("$baseCoursePath/thumbnails", 0755, true);
            mkdir("$baseCoursePath/promo", 0755, true);
        }

        // Find existing thumbnails
        $existingThumbnails = [];
        $thumbnailsPath = "$baseCoursePath/thumbnails";
        if (file_exists($thumbnailsPath)) {
            $existingThumbnails = array_map('basename', glob("$thumbnailsPath/*.{jpg,jpeg,png,webp}", GLOB_BRACE));
        }
        
        foreach ($courses as $courseData) {
            $course = Course::create($courseData);
            
            // Create course directory for materials
            $courseMaterialsPath = storage_path("app/public/course_materials/{$course->id}");
            if (!file_exists($courseMaterialsPath)) {
                mkdir($courseMaterialsPath, 0755, true);
            }
        }
    }
}
