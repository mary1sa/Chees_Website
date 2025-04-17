<?php

namespace Database\Seeders;

use App\Models\Course;
use App\Models\CourseSession;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Database\Seeder;

class CourseSessionSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $courses = Course::all();
        
        // Get users with coach role
        $coaches = User::whereHas('role', function($query) {
            $query->where('name', 'coach');
        })->get();
        
        if ($coaches->isEmpty()) {
            // Create a coach if none exists
            $coachRole = \App\Models\Role::where('name', 'coach')->first();
            if ($coachRole) {
                $coach = User::factory()->create([
                    'role_id' => $coachRole->id,
                    'name' => 'Coach Smith',
                    'email' => 'coach@example.com',
                ]);
                $coaches = collect([$coach]);
            } else {
                $coaches = collect([]);
            }
        }
        
        foreach ($courses as $course) {
            // Create 3-5 sessions for each course
            $sessionCount = rand(3, 5);
            
            for ($i = 0; $i < $sessionCount; $i++) {
                // Some sessions in the past, some in the future
                $startOffset = rand(-30, 45); // Days from now
                $startDate = Carbon::now()->addDays($startOffset);
                
                // Session duration between 60 and 120 minutes
                $durationMinutes = rand(6, 12) * 10;
                $endDate = (clone $startDate)->addMinutes($durationMinutes);
                
                // Randomly pick a coach or use the course instructor
                $coach = $coaches->isNotEmpty() ? $coaches->random() : null;
                $coachId = $coach ? $coach->id : $course->instructor_id;
                
                // Create the session
                // All sessions are online with Zoom
                $isZoomSession = true;
                
                // For completed sessions, some might have recordings
                $isRecorded = $startOffset < 0 && rand(0, 100) < 40; // 40% chance for past sessions to have recordings
                
                CourseSession::create([
                    'course_id' => $course->id,
                    'coach_id' => $coachId,
                    'title' => $this->getSessionTitle($i + 1, $course->title),
                    'description' => $this->getSessionDescription($i + 1),
                    'start_datetime' => $startDate,
                    'end_datetime' => $endDate,
                    'zoom_link' => $isZoomSession ? 'https://zoom.us/j/' . rand(10000000000, 99999999999) : null,
                    'meeting_id' => $isZoomSession ? rand(10000000000, 99999999999) : null,
                    'meeting_password' => $isZoomSession ? $this->generateMeetingPassword() : null,
                    'max_participants' => rand(10, 30),
                    'is_recorded' => $isRecorded,
                    'recording_url' => $isRecorded ? 'https://zoom.us/rec/' . rand(1000000000, 9999999999) : null,
                ]);
            }
            
            // Create different types of additional sessions for each course
            
            // 1. Create a fully-recorded past session
            $pastStart = Carbon::now()->subDays(rand(10, 30));
            $pastEnd = (clone $pastStart)->addMinutes(120);
            CourseSession::create([
                'course_id' => $course->id,
                'coach_id' => $coaches->isNotEmpty() ? $coaches->random()->id : null,
                'title' => 'Recorded Masterclass: ' . $course->title,
                'description' => 'This special masterclass covers advanced techniques and was fully recorded for future reference.',
                'start_datetime' => $pastStart,
                'end_datetime' => $pastEnd,
                'zoom_link' => 'https://zoom.us/j/' . rand(10000000000, 99999999999),
                'meeting_id' => rand(10000000000, 99999999999),
                'meeting_password' => $this->generateMeetingPassword(),
                'max_participants' => 40,
                'is_recorded' => true,
                'recording_url' => 'https://zoom.us/rec/' . rand(1000000000, 9999999999),
            ]);
            
            // 2. Create a special upcoming workshop with Zoom
            $workshopStart = Carbon::now()->addDays(rand(1, 7));
            $workshopEnd = (clone $workshopStart)->addMinutes(90);
            CourseSession::create([
                'course_id' => $course->id,
                'coach_id' => $coaches->isNotEmpty() ? $coaches->random()->id : null,
                'title' => 'Special Workshop: ' . $course->title,
                'description' => 'Special workshop to practice and refine chess skills related to the course content.',
                'start_datetime' => $workshopStart,
                'end_datetime' => $workshopEnd,
                'zoom_link' => 'https://zoom.us/j/' . rand(10000000000, 99999999999),
                'meeting_id' => rand(10000000000, 99999999999),
                'meeting_password' => $this->generateMeetingPassword(),
                'max_participants' => 20,
                'is_recorded' => false,
                'recording_url' => null,
            ]);
            
            // 3. Create an upcoming Q&A session
            $qaStart = Carbon::now()->addDays(rand(10, 20));
            $qaEnd = (clone $qaStart)->addMinutes(60);
            CourseSession::create([
                'course_id' => $course->id,
                'coach_id' => $coaches->isNotEmpty() ? $coaches->random()->id : null,
                'title' => 'Q&A Session: ' . $course->title,
                'description' => 'Open Q&A session for all students to ask questions about course materials and get personalized feedback.',
                'start_datetime' => $qaStart,
                'end_datetime' => $qaEnd,
                'zoom_link' => 'https://zoom.us/j/' . rand(10000000000, 99999999999),
                'meeting_id' => rand(10000000000, 99999999999),
                'meeting_password' => $this->generateMeetingPassword(),
                'max_participants' => 30,
                'is_recorded' => false,
                'recording_url' => null,
            ]);
            
            // 4. Create a weekend intensive session further in the future (online)
            $weekendStart = Carbon::now()->addDays(rand(30, 60))->startOfWeek()->addDays(5); // Friday
            $weekendEnd = (clone $weekendStart)->addHours(3); // 3 hour intensive
            CourseSession::create([
                'course_id' => $course->id,
                'coach_id' => $coaches->isNotEmpty() ? $coaches->random()->id : null,
                'title' => 'Weekend Intensive: ' . $course->title,
                'description' => 'Intensive weekend session covering multiple topics from the course in depth. Full immersion learning via Zoom.',
                'start_datetime' => $weekendStart,
                'end_datetime' => $weekendEnd,
                'zoom_link' => 'https://zoom.us/j/' . rand(10000000000, 99999999999),
                'meeting_id' => rand(10000000000, 99999999999),
                'meeting_password' => $this->generateMeetingPassword(),
                'max_participants' => 15, // Smaller group for intensive work
                'is_recorded' => true, // Recording this intensive session
                'recording_url' => 'https://zoom.us/rec/' . rand(1000000000, 9999999999),
            ]);
            
        }
    }
    
    /**
     * Generate a session title based on course and session number
     */
    private function getSessionTitle($sessionNumber, $courseTitle): string
    {
        $sessionTitles = [
            'Introduction to ',
            'Fundamentals of ',
            'Advanced Concepts in ',
            'Mastering ',
            'Practical Applications of ',
            'Strategic Elements of ',
            'Workshop: ',
            'Deep Dive into ',
            'Analysis Session: ',
            'Q&A and Practice: ',
        ];
        
        $title = $sessionTitles[array_rand($sessionTitles)];
        
        // For later sessions, add the session number
        if ($sessionNumber > 1) {
            $title .= "Part $sessionNumber - ";
        }
        
        return $title . $courseTitle;
    }
    
    /**
     * Generate a session description
     */
    private function getSessionDescription($sessionNumber): string
    {
        $descriptions = [
            'In this foundational session, we\'ll cover the basic concepts and establish a framework for future sessions.',
            'Building on previous material, this session explores more complex strategies and tactical patterns.',
            'This hands-on workshop will focus on practical applications of theoretical concepts through guided exercises.',
            'A comprehensive review session with analysis of famous games that illustrate key principles.',
            'Interactive session with real-time problem solving and personalized feedback from the coach.',
            'Special focus on endgame techniques that will immediately improve your practical results.',
            'Advanced positional concepts explained with clear examples from master games.',
            'This session will cover opening preparations and repertoire development for tournament play.',
            'A deep dive into calculation methods and visualization techniques to enhance your tactical vision.',
            'Final review and integration of course concepts with personalized improvement plans.',
        ];
        
        return $descriptions[array_rand($descriptions)];
    }
    
    /**
     * Generate a location based on type
     */
    /**
     * Generate a random Zoom meeting password
     * Typically 6-10 characters with letters and numbers
     */
    private function generateMeetingPassword(): string
    {
        $characters = 'abcdefghijkmnpqrstuvwxyzABCDEFGHJKLMNPQRSTUVWXYZ23456789'; 
        $password = '';
        $length = rand(6, 10);
        
        for ($i = 0; $i < $length; $i++) {
            $password .= $characters[rand(0, strlen($characters) - 1)];
        }
        
        return $password;
    }
}
