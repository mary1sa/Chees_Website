<?php

namespace Database\Seeders;

use App\Models\Course;
use App\Models\CourseMaterial;
use App\Models\CourseSession;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\File;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

class CourseMaterialSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Sample material titles based on common chess lesson topics
        $materialTitles = [
            'pdf' => [
                'my system',
                'learn chess tactics step 5',
                'Endgame Fundamentals',
                
            ],
            'video' => [
                'Basic Checkmate Patterns',
                'Advanced Pawn Structure Analysis',
                'Queen Sacrifices in Grandmaster Games',
                'Attacking the King Workshop',
                'Defensive Techniques Masterclass',
            ],
            'image' => [
                'Key Position Diagram',
                'Decision Tree Flowchart',
                'Common Tactical Patterns',
                'Pawn Structure Types',
                'King Safety Evaluation',
            ],
            'link' => [
                'Chess.com Analysis Board',
                'Lichess Study Resource',
                'ChessBase Opening Database',
                'Chessgames.com Collection',
                'YouTube Chess Channel',
                'Free Online Chess Training',
            ],
        ];

        // Get all courses
        $courses = Course::all();
        
        // Empty directories and create sample files
        $this->prepareSampleFiles();

        foreach ($courses as $course) {
            // Add 2-4 links per course as external resources
            $this->createLinkMaterials($course, $materialTitles['link'], rand(2, 4));
            // Get sessions for this course
            $sessions = CourseSession::where('course_id', $course->id)->get();
            
            // Create directory for course materials if it doesn't exist
            $courseMaterialPath = storage_path("app/public/course_materials/{$course->id}");
            if (!file_exists($courseMaterialPath)) {
                mkdir($courseMaterialPath, 0755, true);
            }
            
            // Add 3-5 PDFs per course
            $this->createCourseMaterialsBatch(
                $course, 
                $sessions, 
                'pdf', 
                $materialTitles['pdf'], 
                rand(3, 5)
            );
            
            // Add 2-4 videos per course
            $this->createCourseMaterialsBatch(
                $course, 
                $sessions, 
                'video', 
                $materialTitles['video'], 
                rand(2, 4)
            );
            
            // Add 3-6 images per course
            $this->createCourseMaterialsBatch(
                $course, 
                $sessions, 
                'image', 
                $materialTitles['image'], 
                rand(3, 6)
            );
        }
    }

    /**
     * Create multiple course materials of the same type
     */
    private function createCourseMaterialsBatch($course, $sessions, $fileType, $titles, $count): void
    {
        $fileExtensions = [
            'pdf' => ['pdf'],
            'video' => ['mp4', 'webm', 'mov', 'avi'],
            'image' => ['jpg', 'jpeg', 'png', 'gif'],
        ];
        
        $supportedExtensions = $fileExtensions[$fileType];
        $orderCounter = 1;
        
        // Check for existing files in the course directory
        $courseDir = storage_path("app/public/course_materials/{$course->id}");
        $existingFiles = [];
        
        if (file_exists($courseDir)) {
            $extensionPattern = implode(',', $supportedExtensions);
            $existingFiles = glob("$courseDir/*.{$extensionPattern}", GLOB_BRACE);
            
            // Filter by file type
            $existingFiles = array_filter($existingFiles, function($file) use ($fileType, $supportedExtensions) {
                $extension = strtolower(pathinfo($file, PATHINFO_EXTENSION));
                return in_array($extension, $supportedExtensions);
            });
        }
        
        // If we have existing files, use them
        if (!empty($existingFiles)) {
            foreach ($existingFiles as $index => $file) {
                if ($index >= $count) break; // Only use as many as we need
                
                $filename = basename($file);
                $filePath = "course_materials/{$course->id}/$filename";
                $fileExtension = pathinfo($file, PATHINFO_EXTENSION);
                
                // Generate a title based on the filename
                $rawTitle = pathinfo($file, PATHINFO_FILENAME);
                $title = ucwords(str_replace(['-', '_'], ' ', $rawTitle));
                
                // If title is too generic, prepend a better title
                if (strlen($title) < 10) {
                    $titleIndex = array_rand($titles);
                    $title = $titles[$titleIndex] . ': ' . $title;
                }
                
                // Assign to a session randomly (or null for course-wide materials)
                $session = $sessions->isEmpty() ? null : ($sessions->random()->id);
                
                // Create the material record
                CourseMaterial::create([
                    'course_id' => $course->id,
                    'session_id' => $session,
                    'title' => $title,
                    'description' => "$fileType material for " . ($course->title ?? 'Course #' . $course->id),
                    'file_path' => $filePath,
                    'file_type' => $fileType,
                    'is_downloadable' => $fileType == 'video',
                    'order_number' => $orderCounter++,
                ]);
            }
        } else {
            // No existing files, create sample placeholders
            $extension = $supportedExtensions[0]; // Use first supported extension
            
            for ($i = 0; $i < $count; $i++) {
                // Pick a random title
                $titleIndex = array_rand($titles);
                $title = $titles[$titleIndex] . ' ' . ($i + 1);
                
                // Assign to a session randomly (or null for course-wide materials)
                $session = $sessions->isEmpty() ? null : ($sessions->random()->id);
                
                // Create a unique filename
                $filename = Str::slug($title) . "-{$course->id}." . $extension;
                $filePath = "course_materials/{$course->id}/$filename";
                
                // Copy sample file to the course directory
                $this->copySampleFile($fileType, $extension, storage_path("app/public/$filePath"));
                
                // Create the material record
                CourseMaterial::create([
                    'course_id' => $course->id,
                    'session_id' => $session,
                    'title' => $title,
                    'description' => "This is a sample $fileType material for " . ($course->title ?? 'Course #' . $course->id),
                    'file_path' => $filePath,
                    'file_type' => $fileType,
                    'is_downloadable' => $fileType == 'video',
                    'order_number' => $orderCounter++,
                ]);
            }
        }
    }
    
    /**
     * Prepare sample files to be used by the seeder
     */
    private function prepareSampleFiles(): void
    {
        // Create sample files directory if it doesn't exist
        $sampleDir = storage_path('app/seeder_samples');
        if (!file_exists($sampleDir)) {
            mkdir($sampleDir, 0755, true);
            mkdir("$sampleDir/pdf", 0755, true);
            mkdir("$sampleDir/video", 0755, true);
            mkdir("$sampleDir/image", 0755, true);
        }
        
        // Create a sample PDF file
        $samplePdfPath = "$sampleDir/pdf/sample.pdf";
        if (!file_exists($samplePdfPath)) {
            $this->createSamplePdf($samplePdfPath);
        }
        
        // Create a sample video file
        $sampleVideoPath = "$sampleDir/video/sample.mp4";
        if (!file_exists($sampleVideoPath)) {
            $this->createSampleVideo($sampleVideoPath);
        }
        
        // Create a sample image file
        $sampleImagePath = "$sampleDir/image/sample.jpg";
        if (!file_exists($sampleImagePath)) {
            $this->createSampleImage($sampleImagePath);
        }
    }
    
    /**
     * Copy a sample file to the destination
     */
    private function copySampleFile($fileType, $extension, $destination): void
    {
        $sampleFilePath = storage_path("app/seeder_samples/$fileType/sample.$extension");
        
        // Create parent directory if it doesn't exist
        $dirPath = dirname($destination);
        if (!file_exists($dirPath)) {
            mkdir($dirPath, 0755, true);
        }
        
        // Copy the sample file
        copy($sampleFilePath, $destination);
    }
    
    /**
     * Create a sample PDF file using a base64 encoded simple PDF
     */
    private function createSamplePdf($path): void
    {
        // This is a minimal PDF file content
        $pdfContent = base64_decode(
            'JVBERi0xLjcKJeLjz9MKNSAwIG9iago8PAovVHlwZSAvWE9iamVjdAovU3VidHlwZSAvSW1hZ2UK' .
            'L1dpZHRoIDYwMAovSGVpZ2h0IDgwMAovQ29sb3JTcGFjZSBbL0luZGV4ZWQgL0RldmljZVJHQiAx' .
            'IDw+XQovQml0c1BlckNvbXBvbmVudCAxCi9GaWx0ZXIgL0ZsYXRlRGVjb2RlCi9MZW5ndGggMTYK' .
            'Pj4Kc3RyZWFtCgABAgMEBQYHCAoICQsNDhAKZW5kc3RyZWFtCmVuZG9iago2IDAgb2JqCjw8Ci9Q' .
            'cm9kdWNlciAoU2FtcGxlIFBERikKL0NyZWF0aW9uRGF0ZSAoRDoyMDIzMDQwMTEyMDAwMCkKPj4K' .
            'ZW5kb2JqCjcgMCBvYmoKPDwKL1R5cGUgL0NhdGFsb2cKL1BhZ2VzIDEgMCBSCj4+CmVuZG9iagox' .
            'IDAgb2JqCjw8Ci9UeXBlIC9QYWdlcwovS2lkcyBbMiAwIFJdCi9Db3VudCAxCj4+CmVuZG9iagoy' .
            'IDAgb2JqCjw8Ci9UeXBlIC9QYWdlCi9QYXJlbnQgMSAwIFIKL01lZGlhQm94IFswIDAgNjEyIDc5' .
            'Ml0KL0NvbnRlbnRzIDMgMCBSCi9SZXNvdXJjZXMgNAowIFIKPj4KZW5kb2JqCjMgMCBvYmoKPDwK' .
            'L0xlbmd0aCA3Mwo+PgpzdHJlYW0KQlQKL0YxIDEyIFRmCjcwIDcwMCBUZAooU2FtcGxlIENoZXNz' .
            'IENvdXJzZSBNYXRlcmlhbCAtIFBERiBGaWxlKSBUagpFVAplbmRzdHJlYW0KZW5kb2JqCjQgMCBv' .
            'YmoKPDwKL0ZvbnQgPDwKL0YxIDw8Ci9UeXBlIC9Gb250Ci9TdWJ0eXBlIC9UeXBlMQovQmFzZUZv' .
            'bnQgL0hlbHZldGljYQo+Pgo+Pgo+PgplbmRvYmoKMCAwIG9iago8PAovVHlwZSAvRW5jb2RlZAov' .
            'TWV0YWRhdGEgPDwKL0RDIDw8Ci9UaXRsZSAoU2FtcGxlIENoZXNzIE1hdGVyaWFsKQovQ3JlYXRv' .
            'ciAoQ2hlc3MgV2Vic2l0ZSBTZWVkZXIpCj4+Cj4+Cj4+CnRyYWlsZXIKPDwKL1NpemUgOAovUm9v' .
            'dCA3IDAgUgovSW5mbyA2IDAgUgo+PgpzdGFydHhyZWYKNTcyCiUlRU9GCg=='
        );
        
        file_put_contents($path, $pdfContent);
    }
    
    /**
     * Create a sample MP4 video file
     */
    private function createSampleVideo($path): void
    {
        // Create a very small MP4 file (this is just a placeholder, not a real video)
        $videoHeader = hex2bin(
            '0000001C6674797069736F6D0000020069736F6D69736F32617663316D703431' .
            '000000086D6F6F760000006C6D76686400000000D39A079ED39A079E00002580' .
            '000001F4000100000100000000000000000000000000010000000000000000000000' .
            '00000100000000000000000000000000000000000000000000000000000000000001' .
            '000000000000000000000000000187000000000000000187'
        );
        
        file_put_contents($path, $videoHeader);
    }
    
    /**
     * Create a sample JPG image file
     */
    private function createSampleImage($path): void
    {
        // A minimal valid JPG file
        $jpgContent = base64_decode(
            '/9j/4AAQSkZJRgABAQEAYABgAAD//gA7Q1JFQVRPUjogZ2QtanBlZyB2MS4wICh1c2luZyBJSkcg' .
            'SlBFRyB2NjIpLCBxdWFsaXR5ID0gOTAK/9sAQwADAgIDAgIDAwMDBAMDBAUIBQUEBAUKBwcGCAwK' .
            'DAwLCgsLDQ4SEA0OEQ4LCxAWEBETFBUVFQwPFxgWFBgSFBUU/9sAQwEDBAQFBAUJBQUJFA0LDRQU' .
            'FBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQU/8AAEQgAZABk' .
            'AwEiAAIRAQMRAf/EAB8AAAEFAQEBAQEBAAAAAAAAAAABAgMEBQYHCAkKC//EALUQAAIBAwMCBAMF' .
            'BQQEAAABfQECAwAEEQUSITFBBhNRYQcicRQygZGhCCNCscEVUtHwJDNicoIJChYXGBkaJSYnKCkq' .
            'NDU2Nzg5OkNERUZHSElKU1RVVldYWVpjZGVmZ2hpanN0dXZ3eHl6g4SFhoeIiYqSk5SVlpeYmZqi' .
            'o6Slpqeoqaqys7S1tre4ubrCw8TFxsfIycrS09TV1tfY2drh4uPk5ebn6Onq8fLz9PX29/j5+v/E' .
            'AB8BAAMBAQEBAQEBAQEAAAAAAAABAgMEBQYHCAkKC//EALURAAIBAgQEAwQHBQQEAAECdwABAgMR' .
            'BBIVIREA'
        );
        
        file_put_contents($path, $jpgContent);
    }
    
    /**
     * Create link materials for a course
     */
    private function createLinkMaterials(Course $course, array $titles, int $count): void
    {
        $externalLinks = [
            'https://www.chess.com/analysis',
            'https://lichess.org/study',
            'https://database.chessbase.com',
            'https://www.chessgames.com/perl/chesscollection',
            'https://www.youtube.com/c/GMHikaru',
            'https://www.chesstactics.org',
            'https://www.thechesswebsite.com',
            'https://www.chess24.com/en/learn/advanced',
            'https://www.chessable.com/courses',
            'https://www.chessstrategyonline.com'
        ];
        
        // Select random titles and create materials
        $selectedTitles = collect($titles)->random(min($count, count($titles)));
        
        $orderNumber = CourseMaterial::where('course_id', $course->id)->max('order_number') ?? 0;
        
        foreach ($selectedTitles as $index => $title) {
            $orderNumber++;
            $randomLink = $externalLinks[array_rand($externalLinks)];
            
            CourseMaterial::create([
                'course_id' => $course->id,
                'session_id' => null, // Not attached to any session
                'title' => $title,
                'description' => 'External resource for ' . $course->title . '. Click the link to access valuable chess content.',
                'file_path' => $randomLink,
                'file_type' => 'link',
                'is_downloadable' => false, // Links aren't downloadable
                'order_number' => $orderNumber,
            ]);
        }
    }
}
